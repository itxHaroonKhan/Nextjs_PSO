"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Switch } from "@/components/ui/switch"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Store, Bell, CreditCard, Palette, Save, Loader2, Trash2, AlertTriangle } from "lucide-react"
import { useTheme } from "@/contexts/theme-context"
import { useToast } from "@/hooks/use-toast"
import { useLanguage } from "@/contexts/language-context"
import ProtectedRoute from "@/components/protected-route"
import api from "@/lib/api"
import { AxiosError } from "axios"

interface Settings {
  store_name: string
  store_address: string
  store_phone: string
  store_email: string
  store_gstin: string
  currency: string
  tax_rate: number
  items_per_page: number
  theme: string
  invoice_prefix: string
  low_stock_alert: boolean
}

export default function SettingsPage() {
  const router = useRouter()
  const { theme, toggleTheme, setTheme } = useTheme()
  const { toast } = useToast()
  const { t, isRTL } = useLanguage()
  const [settings, setSettings] = React.useState<Settings>({
    store_name: '',
    store_address: '',
    store_phone: '',
    store_email: '',
    store_gstin: '',
    currency: 'PKR',
    tax_rate: 18,
    items_per_page: 25,
    theme: 'light',
    invoice_prefix: 'INV',
    low_stock_alert: true,
  })
  const [loading, setLoading] = React.useState(true)
  const [saving, setSaving] = React.useState(false)
  const [resetting, setResetting] = React.useState(false)

  // Check if user is admin
  React.useEffect(() => {
    const role = localStorage.getItem('userRole')
    // Temporarily allowing both for visibility
    if (role !== 'admin' && role !== 'cashier') {
      router.replace('/dashboard')
    }
  }, [router])

  React.useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await api.get("/settings")
        const raw = res.data.data || res.data.settings || {}
        setSettings({
          store_name: raw.store_name || '',
          store_address: raw.store_address || '',
          store_phone: raw.store_phone || '',
          store_email: raw.store_email || '',
          store_gstin: raw.store_gstin || '',
          currency: raw.currency || 'PKR',
          tax_rate: raw.tax_rate || 18,
          items_per_page: raw.items_per_page || 25,
          theme: raw.theme || 'light',
          invoice_prefix: raw.invoice_prefix || 'INV',
          low_stock_alert: raw.low_stock_alert !== undefined ? Boolean(raw.low_stock_alert) : true,
        })
      } catch (err) {
        console.error("Failed to load settings", err)
      } finally {
        setLoading(false)
      }
    }
    fetchSettings()
  }, [])

  const handleSaveChanges = async () => {
    // Only admin can save
    if (localStorage.getItem('userRole') !== 'admin') {
      toast({
        title: "Permission Denied",
        description: "Only admins can change store settings.",
        variant: "destructive",
      })
      return
    }
    setSaving(true)
    try {
      await api.put("/settings", settings)
      toast({
        title: "Settings saved",
        description: "Your preferences have been updated successfully.",
      })
    } catch (err) {
      const error = err as AxiosError<{ message?: string }>
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to save settings",
        variant: "destructive",
      })
    } finally {
      setSaving(false)
    }
  }

  const handleResetData = async () => {
    // Check role again
    if (localStorage.getItem('userRole') !== 'admin') {
      toast({
        title: "Permission Denied",
        description: "Only admins can reset system data.",
        variant: "destructive",
      })
      return
    }

    const confirmed = window.confirm("⚠️ Are you sure you want to reset all dashboard data? This will PERMANENTLY delete all sales records and cannot be undone.")
    
    if (!confirmed) return

    setResetting(true)
    try {
      const res = await api.post("/settings/reset-data")
      if (res.data.success) {
        toast({
          title: "Success",
          description: "All sales data has been reset. Dashboard will now show 0.",
        })
      }
    } catch (err) {
      const error = err as AxiosError<{ message?: string }>
      toast({
        title: "Reset Failed",
        description: error.response?.data?.message || "Failed to reset data",
        variant: "destructive",
      })
    } finally {
      setResetting(false)
    }
  }

  const handleThemeChange = (value: string) => {
    setTheme(value as "light" | "dark")
    setSettings(prev => ({ ...prev, theme: value }))
    toast({
      title: "Theme changed",
      description: `Switched to ${value} mode.`,
    })
  }

  const updateSetting = (key: keyof Settings, value: string | number | boolean) => {
    setSettings(prev => ({ ...prev, [key]: value }))
  }

  if (loading) {
    return (
      <div className="space-y-6" dir={isRTL ? 'rtl' : 'ltr'}>
        <div className="flex flex-col gap-1">
          <div className="h-8 w-48 bg-muted rounded animate-pulse" />
          <div className="h-4 w-64 bg-muted rounded animate-pulse mt-2" />
        </div>
        <div className="grid gap-6 grid-cols-1 md:grid-cols-2">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardHeader>
                <div className="h-5 w-5 bg-muted rounded animate-pulse mb-2" />
                <div className="h-6 w-32 bg-muted rounded animate-pulse mb-1" />
                <div className="h-4 w-48 bg-muted rounded animate-pulse" />
              </CardHeader>
              <CardContent className="space-y-4">
                {[...Array(4)].map((_, j) => (
                  <div key={j} className="space-y-2">
                    <div className="h-4 w-24 bg-muted rounded animate-pulse" />
                    <div className="h-10 w-full bg-muted rounded animate-pulse" />
                  </div>
                ))}
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  return (
    <ProtectedRoute allowedRoles={["admin", "cashier"]}>
      <div className="space-y-6" dir={isRTL ? 'rtl' : 'ltr'}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-primary">{t('settings.title')}</h1>
          <p className="text-sm text-muted-foreground">{t('settings.subtitle')}</p>
        </div>
      </div>

      <div className="grid gap-6 grid-cols-1 md:grid-cols-2">
        <Card>
          <CardHeader>
            <Store className="w-5 h-5 text-primary mb-2" />
            <CardTitle>{t('settings.storeInfo')}</CardTitle>
            <CardDescription>{t('settings.updateStoreDetails')}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">{t('settings.storeName')}</label>
              <Input value={settings.store_name ?? ""} onChange={(e) => updateSetting("store_name", e.target.value)} />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">{t('settings.storeAddress')}</label>
              <Input value={settings.store_address ?? ""} onChange={(e) => updateSetting("store_address", e.target.value)} />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">{t('settings.contactNumber')}</label>
              <Input value={settings.store_phone ?? ""} onChange={(e) => updateSetting("store_phone", e.target.value)} />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">{t('settings.email')}</label>
              <Input value={settings.store_email ?? ""} onChange={(e) => updateSetting("store_email", e.target.value)} type="email" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">GSTIN</label>
              <Input value={settings.store_gstin ?? ""} onChange={(e) => updateSetting("store_gstin", e.target.value)} placeholder="GST Identification Number" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <Bell className="w-5 h-5 text-primary mb-2" />
            <CardTitle>{t('settings.notifications')}</CardTitle>
            <CardDescription>{t('settings.configureNotifications')}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <label className="text-sm font-medium">{t('settings.lowStockAlerts')}</label>
                <p className="text-xs text-muted-foreground">{t('settings.lowStockDesc')}</p>
              </div>
              <Switch checked={settings.low_stock_alert} onCheckedChange={(v) => updateSetting("low_stock_alert", v)} />
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <label className="text-sm font-medium">{t('settings.dailySalesSummary')}</label>
                <p className="text-xs text-muted-foreground">{t('settings.dailySalesDesc')}</p>
              </div>
              <Switch defaultChecked={true} />
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <label className="text-sm font-medium">{t('settings.newCustomerAlerts')}</label>
                <p className="text-xs text-muted-foreground">{t('settings.newCustomerDesc')}</p>
              </div>
              <Switch defaultChecked={false} />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CreditCard className="w-5 h-5 text-primary mb-2" />
            <CardTitle>{t('settings.paymentSettings')}</CardTitle>
            <CardDescription>{t('settings.configurePayment')}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">{t('settings.defaultCurrency')}</label>
              <Select value={settings.currency ?? "PKR"} onValueChange={(v) => updateSetting("currency", v)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="PKR">PKR (Rs.)</SelectItem>
                  <SelectItem value="USD">USD ($)</SelectItem>
                  <SelectItem value="EUR">EUR (€)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">{t('settings.taxRate')}</label>
              <Select value={(settings.tax_rate ?? 18).toString()} onValueChange={(v) => updateSetting("tax_rate", parseInt(v))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="5">5%</SelectItem>
                  <SelectItem value="12">12%</SelectItem>
                  <SelectItem value="18">18%</SelectItem>
                  <SelectItem value="28">28%</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <Palette className="w-5 h-5 text-primary mb-2" />
            <CardTitle>{t('settings.appearance')}</CardTitle>
            <CardDescription>{t('settings.customizeLook')}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">{t('settings.theme')}</label>
              <Select value={theme} onValueChange={handleThemeChange}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="light">{t('settings.light')}</SelectItem>
                  <SelectItem value="dark">{t('settings.dark')}</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                {t('settings.currentTheme')}: <span className="font-medium">{theme}</span>
              </p>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">{t('settings.itemsPerPage')}</label>
              <Select value={settings.items_per_page.toString()} onValueChange={(v) => updateSetting("items_per_page", parseInt(v))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="10">10</SelectItem>
                  <SelectItem value="25">25</SelectItem>
                  <SelectItem value="50">50</SelectItem>
                  <SelectItem value="100">100</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        <Card className="border-red-500/20 bg-red-500/5">
          <CardHeader>
            <AlertTriangle className="w-5 h-5 text-red-500 mb-2" />
            <CardTitle className="text-red-500">Data Management</CardTitle>
            <CardDescription>Reset system data and clear logs</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <label className="text-sm font-medium text-red-600">Reset Dashboard Data</label>
                <p className="text-xs text-muted-foreground">Delete all sales records and reset revenue to zero.</p>
              </div>
              <Button 
                variant="destructive" 
                size="sm" 
                className="gap-2" 
                onClick={handleResetData}
                disabled={resetting}
              >
                {resetting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                Reset Data
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="flex flex-col sm:flex-row justify-end gap-2">
        <Button className="gap-2 w-full sm:w-auto" onClick={handleSaveChanges} disabled={saving}>
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          {saving ? "Saving..." : t('settings.saveChanges')}
        </Button>
      </div>
    </div>
    </ProtectedRoute>
  )
}
