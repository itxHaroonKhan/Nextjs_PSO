"use client"

import * as React from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  ArrowUpRight,
  ArrowDownRight,
  DollarSign,
  ShoppingCart,
  Users,
  Package,
  TrendingUp,
  Activity,
  Calendar,
  Loader2
} from "lucide-react"
import { AIInsights } from "@/components/dashboard/ai-insights"
import { DonutChart } from "@/components/DonutChart"
import { useLanguage } from "@/contexts/language-context"
import ProtectedRoute from "@/components/protected-route"
import api from "@/lib/api"

interface DashboardStats {
  todayRevenue: number
  todaySales: number
  totalCustomers: number
  lowStock: number
  weekRevenue: number
  monthRevenue: number
}

export default function DashboardPage() {
  const { t, isRTL } = useLanguage()
  const [userRole, setUserRole] = React.useState<string | null>(null)
  const [stats, setStats] = React.useState<DashboardStats | null>(null)
  const [recentSales, setRecentSales] = React.useState<any[]>([])
  const [topCategories, setTopCategories] = React.useState<any[]>([])
  const [dailySales, setDailySales] = React.useState<any[]>([])
  const [loading, setLoading] = React.useState(true)

  React.useEffect(() => {
    setUserRole(localStorage.getItem('userRole') || 'cashier')
  }, [])

  React.useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        const token = localStorage.getItem('authToken')
        console.log('Auth Token:', token ? 'Exists' : 'Missing')
        console.log('User Role:', localStorage.getItem('userRole'))
        
        // Use the consolidated endpoint to avoid 429 errors
        const res = await api.get('/dashboard/all')
        const { stats: statsData, recentSales: recentData, topCategories: categoriesData, dailySales: dailyData } = res.data.data

        console.log('Dashboard Data:', res.data.data)

        setStats(statsData)
        setRecentSales(recentData || [])
        setTopCategories(categoriesData || [])
        setDailySales(dailyData || [])
      } catch (err: any) {
        console.error('Failed to fetch dashboard data:', err)
        console.error('Error Response:', err.response?.data)
        console.error('Error Status:', err.response?.status)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  // Don't render until client-side hydration is complete
  if (userRole === null || loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    )
  }

  const statsData = stats || {
    todayRevenue: 0,
    todaySales: 0,
    totalCustomers: 0,
    lowStock: 0,
    weekRevenue: 0,
    monthRevenue: 0,
  }

  const displayStats = [
    {
      title: t('dashboard.totalRevenue'),
      value: `Rs. ${statsData.todayRevenue.toLocaleString()}`,
      change: "+0%",
      trend: "up" as const,
      icon: DollarSign,
    },
    {
      title: t('dashboard.salesCount'),
      value: statsData.todaySales.toString(),
      change: "+0%",
      trend: "up" as const,
      icon: ShoppingCart,
    },
    {
      title: t('dashboard.activeCustomers'),
      value: statsData.totalCustomers.toString(),
      change: "+0%",
      trend: "up" as const,
      icon: Users,
    },
    {
      title: t('dashboard.lowStock'),
      value: statsData.lowStock.toString(),
      change: "-0",
      trend: "down" as const,
      icon: Package,
    },
  ]

  const dailyRevenue = dailySales.length > 0 ? dailySales.map((d: any) => ({
    day: new Date(d.date).toLocaleDateString('en', { weekday: 'short' }),
    revenue: parseFloat(d.revenue) || 0,
    orders: parseInt(d.sales_count) || 0,
  })) : [
    { day: "Mon", revenue: 0, orders: 0 },
  ]

  const maxRevenue = Math.max(...dailyRevenue.map(d => d.revenue), 1)

  const chartdata = topCategories.length > 0 ? topCategories.map((cat: any) => ({
    name: cat.category || 'Unknown',
    amount: parseFloat(cat.total_revenue) || 0,
  })) : []

  return (
    <ProtectedRoute>
      <div className="space-y-4 sm:space-y-6 overflow-visible px-3 sm:px-6" dir={isRTL ? 'rtl' : 'ltr'}>
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex flex-col gap-1">
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold tracking-tight text-primary">{t('dashboard.title')}</h1>
          {userRole === "admin" && (
            <p className="text-xs sm:text-sm text-muted-foreground">{t('dashboard.welcome')}</p>
          )}
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        {displayStats.map((stat) => (
          <Card key={stat.title} className="hover:shadow-md transition-shadow overflow-visible">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-xs sm:text-sm font-medium">{stat.title}</CardTitle>
              <stat.icon className="h-4 w-4 text-muted-foreground flex-shrink-0" />
            </CardHeader>
            <CardContent>
              <div className="text-xl sm:text-2xl font-bold text-white">{stat.value}</div>
              <p className="flex items-center text-xs mt-1 flex-wrap">
                {stat.trend === "up" ? (
                  <span className="text-accent flex items-center font-semibold">
                    <ArrowUpRight className="mr-1 h-3 w-3 flex-shrink-0" />
                    {stat.change}
                  </span>
                ) : (
                  <span className="text-destructive flex items-center font-semibold">
                    <ArrowDownRight className="mr-1 h-3 w-3 flex-shrink-0" />
                    {stat.change}
                  </span>
                )}
                <span className="text-muted-foreground ml-1 sm:ml-2 hidden sm:inline">from last month</span>
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Quick Insights & Real-time Sales */}
      <div className="grid gap-4 grid-cols-1 lg:grid-cols-2">
        <div className="min-w-0">
          <AIInsights />
        </div>
        <Card className="overflow-visible min-w-0">
          <CardHeader className="pb-3">
            <CardTitle className="text-base sm:text-lg flex items-center gap-2">
              <Activity className="w-4 h-4 sm:w-5 sm:h-5 text-primary flex-shrink-0" />
              <span className="truncate">{t('dashboard.realtimeSales')}</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 sm:space-y-4 max-h-[400px] lg:max-h-none overflow-y-auto lg:overflow-y-visible">
              {recentSales.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">No recent sales</p>
              ) : (
                recentSales.map((sale: any, i: number) => (
                  <div key={i} className="flex items-center gap-3">
                    <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-secondary flex items-center justify-center flex-shrink-0">
                      <ShoppingCart className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0 space-y-1">
                      <p className="text-xs sm:text-sm font-medium leading-none truncate">Sale #{sale.id}</p>
                      <p className="text-[10px] sm:text-xs text-muted-foreground truncate">{sale.customer_name || 'Walk-in'} • {new Date(sale.sale_date).toLocaleTimeString()}</p>
                    </div>
                    <div className="text-xs sm:text-base font-bold text-accent flex-shrink-0">
                      +Rs. {parseFloat(sale.grand_total || sale.grand_total === 0 ? sale.grand_total : 0).toFixed(2)}
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Daily Revenue & Top Categories */}
      <div className="grid gap-4 grid-cols-1 lg:grid-cols-3">
        <div className="lg:col-span-2 min-w-0">
          <Card className="border-white bg-gradient-to-br from-card to-muted/30 overflow-visible">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <CardTitle className="text-base sm:text-lg flex items-center gap-2 min-w-0">
                  <Calendar className="w-4 h-4 sm:w-5 sm:h-5 text-primary flex-shrink-0" />
                  <span className="truncate">{t('dashboard.dailyRevenue')}</span>
                </CardTitle>
                <Badge variant="secondary" className="text-xs flex-shrink-0">{t('dashboard.thisWeek')}</Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-0">
                {/* Chart Area */}
                <div className="relative h-48 sm:h-56 lg:h-64 pt-28 sm:pt-32 pb-1">
                  {/* Grid Lines */}
                  <div className="absolute inset-0 flex flex-col justify-between pointer-events-none">
                    {[4, 3, 2, 1, 0].map((i) => (
                      <div key={i} className="w-full border-border/30 border-dashed border-t" />
                    ))}
                  </div>

                  <div className="relative h-full flex items-end gap-1 sm:gap-2 lg:gap-3">
                    {dailyRevenue.map((day, index) => {
                      const height = (day.revenue / maxRevenue) * 80
                      const isBest = day.revenue === maxRevenue

                      return (
                        <div key={day.day} className="flex-1 flex flex-col items-center gap-1 group relative">
                          {/* Bar Container */}
                          <div className="relative w-full flex justify-center">
                            <div
                              className={`w-full max-w-[20px] sm:max-w-[35px] lg:max-w-[50px] rounded-lg sm:rounded-xl transition-all duration-300 cursor-pointer relative ${
                                isBest
                                  ? 'bg-gradient-to-t from-primary via-primary/90 to-accent'
                                  : 'bg-gradient-to-t from-primary/60 to-primary/80'
                              } group-hover:shadow-[0_0_20px_-4px] group-hover:shadow-primary/50`}
                              style={{
                                height: `${height}px`,
                              }}
                            />

                            {/* Tooltip - positioned above each bar */}
                            <div className="absolute left-1/2 -translate-x-1/2 -top-12 sm:-top-16 z-50 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none group-hover:pointer-events-auto">
                              <div className="bg-card border border-border rounded-lg px-1.5 sm:px-2 py-1 sm:py-1.5 shadow-xl min-w-[60px] sm:min-w-[80px]">
                                <p className="text-[8px] sm:text-[10px] font-bold text-white">Rs. {day.revenue.toLocaleString()}</p>
                                <p className="text-[7px] sm:text-[8px] text-white/80">{day.orders}</p>
                              </div>
                            </div>
                          </div>

                          {/* Day Label */}
                          <span className={`text-[8px] sm:text-[10px] lg:text-xs font-semibold transition-colors ${
                            isBest ? 'text-primary' : 'text-muted-foreground group-hover:text-foreground'
                          }`}>
                            {day.day}
                          </span>
                        </div>
                      )
                    })}
                  </div>
                </div>

                {/* Summary Stats */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-4 pt-3 sm:pt-5 border-t border-border bg-card/50 backdrop-blur rounded-xl p-2 sm:p-4 mt-2">
                  <div className="text-center">
                    <p className="text-[10px] sm:text-xs text-muted-foreground mb-1 sm:mb-2 flex items-center justify-center gap-1 flex-wrap">
                      <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-primary/50 flex-shrink-0"></span>
                      <span>Avg Daily</span>
                    </p>
                    <p className="text-base sm:text-xl font-bold text-white">
                      Rs. {(dailyRevenue.reduce((a, b) => a + b.revenue, 0) / Math.max(dailyRevenue.length, 1)).toFixed(0)}
                    </p>
                  </div>
                  <div className="text-center">
                    <p className="text-[10px] sm:text-xs text-muted-foreground mb-1 sm:mb-2 flex items-center justify-center gap-1 flex-wrap">
                      <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-accent/50 flex-shrink-0"></span>
                      <span>Total Orders</span>
                    </p>
                    <p className="text-base sm:text-xl font-bold text-white">
                      {dailyRevenue.reduce((a, b) => a + b.orders, 0)}
                    </p>
                  </div>
                  <div className="text-center">
                    <p className="text-[10px] sm:text-xs text-muted-foreground mb-1 sm:mb-2 flex items-center justify-center gap-1 flex-wrap">
                      <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-green-500/50 flex-shrink-0"></span>
                      <span>Best Day</span>
                    </p>
                    <p className="text-base sm:text-xl font-bold text-white">
                      Rs. {Math.max(...dailyRevenue.map(d => d.revenue)).toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
        <div className="min-w-0">
          <Card className="h-full overflow-visible">
            <CardHeader className="pb-3">
              <CardTitle className="text-base sm:text-lg flex items-center gap-2">
                <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5 text-primary flex-shrink-0" />
                <span className="truncate">{t('dashboard.topCategories')}</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <DonutChart
                className="mx-auto"
                data={chartdata}
                showLabel={true}
                valueFormatter={(number: number) =>
                  `Rs. ${Intl.NumberFormat("us").format(number).toString()}`
                }
              />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
    </ProtectedRoute>
  )
}
