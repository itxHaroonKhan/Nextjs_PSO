"use client"

import * as React from "react"
import { Sparkles, TrendingUp, AlertCircle, Loader2 } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import api from "@/lib/api"

export function AIInsights() {
  const [insight, setInsight] = React.useState<string>("")
  const [loading, setLoading] = React.useState(true)

  React.useEffect(() => {
    const fetchInsights = async () => {
      try {
        const result = await api.get('/dashboard/insights')
        const data = result.data.data
        if (data && data.length > 0) {
          setInsight(data.map((d: any) => d.message).join(' '))
        } else {
          setInsight("System is running smoothly. No critical insights at this time.")
        }
      } catch (error) {
        setInsight("AI insights temporarily unavailable. Please try again later.")
      } finally {
        setLoading(false)
      }
    }

    fetchInsights()
  }, [])

  const staticInsights = [
    {
      title: "Inventory Alert",
      description: "3 products are running low on stock. Consider restocking Pasta with Roast Beef, Tofu Poke Bowl, and Apple Stuffed Pancake.",
      type: "warning",
    },
    {
      title: "Customer Growth",
      description: "12 new customers joined this week. Customer retention rate is at 78%.",
      type: "positive",
    },
  ]

  return (
    <Card className="border-white bg-card/50 backdrop-blur-xl">
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-primary" />
          Quick Insights
        </CardTitle>
        <CardDescription>
          AI-powered insights and alerts
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* AI Generated Insight */}
          {loading ? (
            <div className="flex items-center gap-3 p-4 rounded-lg border border-white bg-muted/30">
              <Loader2 className="w-5 h-5 text-primary animate-spin" />
              <p className="text-sm text-muted-foreground">Generating AI insights...</p>
            </div>
          ) : (
            <div className="flex items-start gap-3 p-4 rounded-lg border border-white bg-primary/5">
              <Sparkles className="w-5 h-5 text-primary mt-0.5" />
              <div className="flex-1">
                <p className="font-medium text-base text-foreground mb-1.5">AI Sales Summary</p>
                <p className="text-sm text-muted-foreground leading-relaxed">{insight}</p>
              </div>
              <Badge className="text-xs bg-primary">AI</Badge>
            </div>
          )}

          {/* Static Alerts */}
          {staticInsights.map((item, index) => (
            <div
              key={index}
              className="flex items-start gap-3 p-3 rounded-lg border border-white hover:bg-muted/50 transition-colors"
            >
              {item.type === "positive" ? (
                <TrendingUp className="w-5 h-5 text-green-500 mt-0.5" />
              ) : (
                <AlertCircle className="w-5 h-5 text-orange-500 mt-0.5" />
              )}
              <div className="flex-1">
                <p className="font-medium text-base text-foreground">{item.title}</p>
                <p className="text-sm text-muted-foreground mt-1.5">{item.description}</p>
              </div>
              <Badge variant={item.type === "positive" ? "default" : "secondary"} className="text-xs">
                {item.type === "positive" ? "Good" : "Alert"}
              </Badge>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
