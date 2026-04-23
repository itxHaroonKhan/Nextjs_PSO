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
    const fetchAIInsights = async () => {
      try {
        setLoading(true)
        // Fetch real data from dashboard to feed into AI
        const result = await api.get('/dashboard/all')
        const { stats, recentSales, topCategories } = result.data.data

        const prompt = `
          As a POS System Business Analyst, provide a very concise (2-3 sentences) summary of the current business state based on this data:
          - Today's Revenue: Rs. ${stats.todayRevenue}
          - Today's Sales: ${stats.todaySales}
          - Low Stock Items: ${stats.lowStock}
          - Recent Sales: ${recentSales.map((s: any) => s.grand_total).join(', ')}
          - Top Categories: ${topCategories.map((c: any) => c.category).join(', ')}
          
          Highlight one positive trend and one area that needs attention. Be professional and encouraging.
        `

        // Call the internal API route instead of importing genkit directly
        const aiResponse = await fetch('/api/ai/insights', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ prompt })
        })
        
        const aiData = await aiResponse.json()

        if (!aiResponse.ok) {
          throw new Error(aiData.details || aiData.error || 'AI request failed')
        }
        
        setInsight(aiData.text || "AI generated a response but no text was found.")
      } catch (error: any) {
        console.error("AI Insight Error:", error)
        setInsight(`AI Error: ${error.message || "Connection failed"}`)
      } finally {
        setLoading(false)
      }
    }

    fetchAIInsights()
  }, [])

  const staticInsights = [
    {
      title: "Inventory Alert",
      description: "Check inventory for items running below threshold to avoid stockouts.",
      type: "warning",
    },
    {
      title: "Customer Growth",
      description: "Monitor new signups to improve customer retention strategies.",
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
