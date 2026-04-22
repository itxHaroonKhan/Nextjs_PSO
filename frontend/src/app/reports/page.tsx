"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { DollarSign, TrendingUp, ShoppingCart, Users, Calendar, Download, FileBarChart, Loader2 } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useLanguage } from "@/contexts/language-context"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import ProtectedRoute from "@/components/protected-route"
import api from "@/lib/api"

export default function ReportsPage() {
  const router = useRouter()
  const [period, setPeriod] = React.useState("week")
  const { t, isRTL } = useLanguage()
  const [salesData, setSalesData] = React.useState<any[]>([])
  const [categoryData, setCategoryData] = React.useState<any[]>([])
  const [taxSummary, setTaxSummary] = React.useState<any>(null)
  const [profitLoss, setProfitLoss] = React.useState<any>(null)
  const [loading, setLoading] = React.useState(true)

  // Check if user is admin
  React.useEffect(() => {
    const role = localStorage.getItem('userRole')
    if (role !== 'admin') {
      router.replace('/dashboard')
    }
  }, [router])

  React.useEffect(() => {
    const fetchReports = async () => {
      try {
        setLoading(true)
        // Use consolidated endpoint to avoid 429 errors
        const res = await api.get(`/reports/all?period=${period}`)
        const { salesPerformance, categoryDistribution, taxSummary: taxData, profitLoss: profitData } = res.data.data

        setSalesData(salesPerformance || [])
        setCategoryData(categoryDistribution || [])
        setTaxSummary(taxData || {})
        setProfitLoss(profitData || {})
      } catch (err) {
        console.error('Failed to fetch reports:', err)
      } finally {
        setLoading(false)
      }
    }
    fetchReports()
  }, [period])

  const totalSales = profitLoss?.total_revenue || salesData.reduce((sum: number, d: any) => sum + (parseFloat(d.revenue) || 0), 0)
  const maxSales = salesData.length > 0 ? Math.max(...salesData.map((d: any) => parseFloat(d.revenue) || 0)) : 1

  const totalOrders = salesData.reduce((sum: number, d: any) => sum + (parseInt(d.total_sales) || 0), 0)
  const avgOrderValue = totalOrders > 0 ? totalSales / totalOrders : 0
  const profitMargin = profitLoss?.profit_margin || 0

  if (loading) {
    return (
      <div className="space-y-6" dir={isRTL ? 'rtl' : 'ltr'}>
        <div className="flex items-center justify-center min-h-[50vh]">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
          <span className="ml-2 text-muted-foreground">Loading reports...</span>
        </div>
      </div>
    )
  }

  return (
    <ProtectedRoute allowedRoles={["admin"]}>
      <div className="space-y-6" dir={isRTL ? 'rtl' : 'ltr'}>
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-primary">{t('reports.title')}</h1>
          <p className="text-sm text-muted-foreground">{t('reports.subtitle')}</p>
        </div>
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Select value={period} onValueChange={setPeriod}>
            <SelectTrigger className="w-full sm:w-[150px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="today">{t('reports.today')}</SelectItem>
              <SelectItem value="week">{t('reports.thisWeek')}</SelectItem>
              <SelectItem value="month">{t('reports.thisMonth')}</SelectItem>
              <SelectItem value="year">{t('reports.thisYear')}</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" className="gap-2 flex-shrink-0" onClick={() => {
            if (!salesData || salesData.length === 0) return;
            let csvContent = "data:text/csv;charset=utf-8,";
            csvContent += "Date,Revenue,Total Orders\n";
            salesData.forEach((row: any) => {
              const dateObj = new Date(row.date);
              const dateStr = !isNaN(dateObj.getTime()) ? dateObj.toLocaleDateString() : '';
              csvContent += `${dateStr},${row.revenue},${row.total_sales}\n`;
            });
            const encodedUri = encodeURI(csvContent);
            const link = document.createElement("a");
            link.setAttribute("href", encodedUri);
            link.setAttribute("download", `sales_report_${period}.csv`);
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
          }}>
            <Download className="w-4 h-4" />
            <span className="hidden sm:inline">{t('reports.export')}</span>
          </Button>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('reports.totalRevenue')}</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">Rs. {totalSales.toLocaleString(undefined, { maximumFractionDigits: 2 })}</div>
            <p className="flex items-center text-xs text-muted-foreground mt-1">Total revenue earned</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('reports.totalOrders')}</CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{totalOrders}</div>
            <p className="flex items-center text-xs text-muted-foreground mt-1">Total orders processed</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('reports.profitMargin')}</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{parseFloat(profitMargin).toFixed(1)}%</div>
            <p className="flex items-center text-xs text-muted-foreground mt-1">Profit margin</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('reports.avgOrderValue')}</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">Rs. {avgOrderValue.toLocaleString(undefined, { maximumFractionDigits: 2 })}</div>
            <p className="flex items-center text-xs text-muted-foreground mt-1">Average order value</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        {/* Daily Breakdown Table */}
        <Card>
          <CardHeader><CardTitle>Daily Sales Breakdown</CardTitle></CardHeader>
          <CardContent>
            {salesData.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">No sales data available</p>
            ) : (
              <div className="rounded-md border">
                <div className="grid grid-cols-3 gap-4 p-4 bg-muted/50 font-medium text-sm">
                  <div>Day</div>
                  <div>Revenue</div>
                  <div>Orders</div>
                </div>
                <div className="divide-y">
                  {salesData.map((day: any, idx: number) => (
                    <div key={idx} className="grid grid-cols-3 gap-4 p-4 items-center hover:bg-muted/30 transition-colors">
                      <div className="font-medium">{new Date(day.date).toLocaleDateString('en', { weekday: 'short', month: 'short', day: 'numeric' })}</div>
                      <div className="font-semibold text-primary">Rs. {(parseFloat(day.revenue) || 0).toLocaleString(undefined, { maximumFractionDigits: 2 })}</div>
                      <div className="text-muted-foreground">{parseInt(day.total_sales) || 0}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Sales Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-primary" />
              Sales Overview
            </CardTitle>
          </CardHeader>
          <CardContent>
            {salesData.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">No sales data to display</p>
            ) : (
              <div className="h-64 flex items-end gap-2 pt-4">
                {salesData.map((day: any, index: number) => {
                  const revenue = parseFloat(day.revenue) || 0
                  const height = (revenue / maxSales) * 200
                  return (
                    <div key={index} className="flex-1 flex flex-col items-center gap-2 group">
                      <div className="relative w-full flex justify-center">
                        <div
                          className="w-full max-w-[50px] bg-gradient-to-t from-primary/80 to-primary rounded-t-lg transition-all duration-300 group-hover:from-primary group-hover:to-secondary cursor-pointer relative"
                          style={{ height: `${height}px` }}
                        >
                          <div className="absolute -top-12 left-1/2 -translate-x-1/2 bg-card border border-border rounded-lg px-3 py-2 opacity-0 group-hover:opacity-100 transition-opacity shadow-lg whitespace-nowrap z-10">
                            <p className="text-xs font-bold text-white">Rs. {revenue.toLocaleString(undefined, { maximumFractionDigits: 2 })}</p>
                          </div>
                        </div>
                      </div>
                      <span className="text-xs text-muted-foreground font-medium">{new Date(day.date).toLocaleDateString('en', { weekday: 'short' })}</span>
                    </div>
                  )
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 grid-cols-1">
        {/* Category Breakdown */}
        <Card className="w-full">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileBarChart className="w-5 h-5 text-primary" />
              Sales by Category
            </CardTitle>
          </CardHeader>
          <CardContent>
            {categoryData.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">No category data available</p>
            ) : (
              <div className="flex flex-col gap-8">
                {/* Scrollable Category List */}
                <ScrollArea className="h-[300px] w-full pr-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pb-4">
                      {categoryData.map((cat: any, index: number) => {
                        const colors = ['bg-cyan-500', 'bg-green-500', 'bg-orange-500', 'bg-pink-500', 'bg-purple-500']
                        const color = colors[index % colors.length]
                        const value = cat.value ? (parseFloat(cat.value) / totalSales) * 100 : 0
                        return (
                          <div key={cat.name || index} className="group p-3 rounded-xl border border-border/50 hover:border-primary/30 hover:bg-primary/5 transition-all duration-300">
                            <div className="flex items-center justify-between mb-2">
                              <div className="flex items-center gap-3">
                                <div className={`w-10 h-10 rounded-lg ${color} flex items-center justify-center shadow-md group-hover:scale-110 transition-transform`}>
                                  <span className="text-white font-bold text-xs">{value.toFixed(0)}%</span>
                                </div>
                                <div>
                                  <p className="font-semibold text-sm text-foreground">{cat.name || 'Unknown'}</p>
                                </div>
                              </div>
                              <div className="text-right">
                                <p className="font-bold text-primary text-sm">Rs. {(parseFloat(cat.value) || 0).toLocaleString(undefined, { maximumFractionDigits: 2 })}</p>
                              </div>
                            </div>
                            <div className="w-full h-2 bg-muted/50 rounded-full overflow-hidden">
                              <div className={`h-full ${color} rounded-full transition-all duration-700 ease-out`} style={{ width: `${value}%` }} />
                            </div>
                          </div>
                        )
                      })}
                  </div>
                </ScrollArea>

                {/* Centered Revenue Box */}
                <div className="flex justify-center">
                  <div className="w-full max-w-3xl bg-gradient-to-br from-primary/5 to-secondary/5 rounded-2xl p-8 border border-primary/20 text-center shadow-inner">
                    <p className="text-base text-muted-foreground mb-2">Total Revenue</p>
                    <p className="text-5xl font-extrabold text-primary mb-2">Rs. {totalSales.toLocaleString(undefined, { maximumFractionDigits: 2 })}</p>
                    {profitLoss && (
                      <>
                        <Separator className="my-8 bg-primary/10" />
                        <div className="grid grid-cols-2 gap-12">
                          <div className="space-y-1">
                            <p className="text-sm text-muted-foreground">Total Cost</p>
                            <p className="text-3xl font-bold text-foreground">Rs. {(parseFloat(profitLoss.total_cost) || 0).toLocaleString(undefined, { maximumFractionDigits: 2 })}</p>
                          </div>
                          <div className="space-y-1">
                            <p className="text-sm text-muted-foreground">Net Profit</p>
                            <p className="text-3xl font-bold text-green-600">Rs. {(parseFloat(profitLoss.gross_profit) || 0).toLocaleString(undefined, { maximumFractionDigits: 2 })}</p>
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
    </ProtectedRoute>
  )
}
