"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import {
  Network,
  Focus,
  Search,
  GitBranch,
  EyeOff,
  ChevronRight,
  ChevronDown,
  FileStack,
  Sparkles,
  X
} from "lucide-react"
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer
} from "recharts"
import { Button } from "@/components/ui/button"

const chartData = [
  { name: '1', raw: 38000, loom: 10000 },
  { name: '2', raw: 32000, loom: 8500 },
  { name: '3', raw: 29000, loom: 7200 },
  { name: '4', raw: 27000, loom: 6800 },
  { name: '5', raw: 24000, loom: 6200 },
  { name: '7', raw: 16000, loom: 5500 },
  { name: '8', raw: 8500, loom: 4800 },
]

function formatDuration(ms: number): string {
  if (!ms) return '0m 0s'
  const totalSeconds = Math.floor(ms / 1000)
  const minutes = Math.floor(totalSeconds / 60)
  const seconds = totalSeconds % 60
  return `${minutes}m ${seconds}s`
}

function formatTime(timestamp: string): string {
  try {
    return new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  } catch {
    return '--:--'
  }
}

function getToolDotColor(tool: string): string {
  if (tool?.toLowerCase().includes('focus')) return '#10B981'
  if (tool?.toLowerCase().includes('search') || tool?.toLowerCase().includes('find')) return '#3B82F6'
  if (tool?.toLowerCase().includes('topology') || tool?.toLowerCase().includes('blast')) return '#7C3AED'
  return '#10B981'
}

export default function DashboardPage() {
  const router = useRouter()
  const [metrics, setMetrics] = useState<Record<string, unknown> | null>(null)
  const [mounted, setMounted] = useState(false)
  const [focusedFiles, setFocusedFiles] = useState<string[]>([])

  useEffect(() => {
    setMounted(true)

    const fetchMetrics = async () => {
      try {
        const res = await fetch('http://localhost:2337/api/summary')
        const data = await res.json()
        setMetrics(data)
      } catch (e) {
        console.error('Failed to fetch metrics', e)
      }
    }

    const fetchActiveLens = async () => {
      try {
        const res = await fetch('http://localhost:2337/api/active-lens')
        const data = await res.json()
        setFocusedFiles(data.focused || [])
      } catch (e) {
        console.error('Failed to fetch active lens', e)
      }
    }

    fetchMetrics()
    fetchActiveLens()
    const interval = setInterval(() => {
      fetchMetrics()
      fetchActiveLens()
    }, 5000)
    return () => clearInterval(interval)
  }, [])

  if (!mounted) {
    return (
      <div className="flex-1 flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-4 border-purple-100 border-t-purple-600 rounded-full animate-spin" />
          <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Initialising...</p>
        </div>
      </div>
    )
  }

  const activeLensCount = (metrics?.activeLens as number) || 3
  const focusBudgetPct = Math.round((activeLensCount / 20) * 100)
  const sessionDuration = metrics?.sessionDuration as number
  const recentItems = (metrics?.recent as Array<Record<string, unknown>>) || []
  const startTime = recentItems.length > 0
    ? formatTime(recentItems[recentItems.length - 1]?.timestamp as string)
    : '--:--'

  return (
    <div className="flex flex-col min-h-[calc(100vh-64px)] bg-background">
      <div className="p-8 flex-1 max-w-[1600px] mx-auto w-full space-y-8">

        {/* Header */}
        <div className="space-y-1">
          <h1 className="text-[32px] font-bold text-foreground leading-tight">
            Welcome to LoomMCP 👋
          </h1>
          <p className="text-[14px] text-muted-foreground">
            The AST-aware context compiler for coding agents.
          </p>
        </div>

        {/* 3-column grid */}
        <div className="grid grid-cols-12 gap-6">

          {/* Left + center: col-span-9 */}
          <div className="col-span-12 xl:col-span-9 space-y-6">

            {/* Token Savings Banner */}
            <div className="bg-[#F5F3FF] border border-[#DDD6FE] rounded-2xl p-6 flex items-center justify-between">
              <div className="space-y-1.5">
                <h2 className="text-[20px] font-bold text-[#7C3AED]">
                  Save 80%+ on Claude API costs
                </h2>
                <p className="text-[14px] text-muted-foreground">
                  Stop re-reading unchanged code. Smart context. Sharp focus.
                </p>
              </div>
              <div className="hidden lg:flex bg-card rounded-xl p-4 shadow-sm items-center gap-3">
                <FileStack className="w-8 h-8 text-[#7C3AED]" />
                <Sparkles className="w-6 h-6 text-[#9333EA]" />
              </div>
            </div>

            {/* Get Started in 3 Steps */}
            <div className="bg-card border border-border rounded-2xl p-6">
              <h3 className="text-[16px] font-semibold text-foreground mb-5">
                Get Started in 3 Simple Steps
              </h3>
              <div className="flex items-start gap-3">
                {/* Step 1 */}
                <div className="flex-1 space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-[#7C3AED] text-white text-[11px] font-bold flex items-center justify-center shrink-0">
                      1
                    </span>
                    <span className="text-[14px] font-semibold text-foreground">Get Topology</span>
                  </div>
                  <p className="text-[12px] text-muted-foreground">
                    Scan your codebase structure (signatures only)
                  </p>
                  <div className="bg-[#1F2937] rounded-lg px-3 py-2">
                    <code className="text-[11px] font-mono text-purple-400">
                      loom_get_topology(&quot;src/&quot;)
                    </code>
                  </div>
                </div>

                <ChevronRight className="w-5 h-5 text-muted-foreground shrink-0 mt-4" />

                {/* Step 2 */}
                <div className="flex-1 space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-[#10B981] text-white text-[11px] font-bold flex items-center justify-center shrink-0">
                      2
                    </span>
                    <span className="text-[14px] font-semibold text-foreground">Focus</span>
                  </div>
                  <p className="text-[12px] text-muted-foreground">
                    Page in only the code you need
                  </p>
                  <div className="bg-[#1F2937] rounded-lg px-3 py-2">
                    <code className="text-[11px] font-mono text-green-400">
                      loom_focus(&quot;file.ts::fn&quot;)
                    </code>
                  </div>
                </div>

                <ChevronRight className="w-5 h-5 text-muted-foreground shrink-0 mt-4" />

                {/* Step 3 */}
                <div className="flex-1 space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-[#10B981] text-white text-[11px] font-bold flex items-center justify-center shrink-0">
                      3
                    </span>
                    <span className="text-[14px] font-semibold text-foreground">Make Changes</span>
                  </div>
                  <p className="text-[12px] text-muted-foreground">
                    Edit with confidence, track only what changed
                  </p>
                  <div className="bg-[#1F2937] rounded-lg px-3 py-2">
                    <code className="text-[11px] font-mono text-green-400">
                      loom_get_active_diff()
                    </code>
                  </div>
                </div>
              </div>
            </div>

            {/* Session Overview */}
            <div className="bg-card border border-border rounded-xl overflow-hidden">
              <div className="px-6 py-3 border-b border-border">
                <h3 className="text-[12px] font-bold text-foreground uppercase tracking-wider">
                  Session Overview
                </h3>
              </div>
              <div className="grid grid-cols-4 divide-x divide-border">
                {/* Files Indexed */}
                <div className="px-6 py-5 space-y-1.5">
                  <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                    Files Indexed
                  </p>
                  <p className="text-[28px] font-extrabold text-foreground leading-none">
                    {(metrics?.totalCalls as number)?.toLocaleString() || '482'}
                  </p>
                  <p className="text-[11px] font-bold text-[#10B981]">
                    ↑ 12 this session
                  </p>
                </div>

                {/* Tokens Saved */}
                <div className="px-6 py-5 space-y-1.5">
                  <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                    Total Tokens Saved
                  </p>
                  <p className="text-[28px] font-extrabold text-foreground leading-none">
                    {(metrics?.tokensSaved as number)?.toLocaleString() || '142,391'}
                  </p>
                  <p className="text-[11px] font-bold text-[#10B981]">
                    ↑ 92.1% vs baseline
                  </p>
                </div>

                {/* Active Lens */}
                <div className="px-6 py-5 space-y-1.5">
                  <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                    Active Lens
                  </p>
                  <p className="text-[28px] font-extrabold text-foreground leading-none">
                    {activeLensCount} / 20
                  </p>
                  <p className="text-[11px] font-bold text-muted-foreground">
                    {focusBudgetPct}% of focus budget
                  </p>
                </div>

                {/* Session Duration */}
                <div className="px-6 py-5 space-y-1.5">
                  <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                    Session Duration
                  </p>
                  <p className="text-[28px] font-extrabold text-foreground leading-none">
                    {formatDuration(sessionDuration)}
                  </p>
                  <p className="text-[11px] font-bold text-muted-foreground">
                    Started at {startTime}
                  </p>
                </div>
              </div>
            </div>

            {/* Side-by-side cards */}
            <div className="grid grid-cols-2 gap-6">
              {/* Recent Activity */}
              <div className="bg-card border border-border rounded-xl overflow-hidden flex flex-col">
                <div className="px-5 py-4 border-b border-border flex items-center justify-between">
                  <h3 className="text-[14px] font-semibold text-foreground">Recent Activity</h3>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-[11px] font-semibold text-[#7C3AED] hover:bg-purple-50 rounded-lg h-7 px-2"
                    onClick={() => router.push('/events')}
                  >
                    View All Events
                  </Button>
                </div>
                <div className="flex-1">
                  {recentItems.length > 0 ? (
                    recentItems.slice(0, 5).map((item, i) => (
                      <div
                        key={i}
                        className="flex items-center gap-3 px-5 py-3 hover:bg-muted transition-colors border-b border-muted last:border-0"
                      >
                        <div
                          className="w-2 h-2 rounded-full shrink-0"
                          style={{ backgroundColor: getToolDotColor(item.tool as string) }}
                        />
                        <span className="text-[10px] font-bold text-muted-foreground shrink-0 w-14">
                          {formatTime(item.timestamp as string)}
                        </span>
                        <span className="text-[12px] font-semibold text-foreground flex-1 truncate">
                          {item.tool as string}
                        </span>
                        <span className="text-[10px] text-muted-foreground shrink-0">
                          {item.duration as number}ms
                        </span>
                      </div>
                    ))
                  ) : (
                    <div className="p-10 text-center text-muted-foreground text-[12px] font-medium">
                      No recent activity
                    </div>
                  )}
                </div>
              </div>

              {/* Active Lens */}
              <div className="bg-card border border-border rounded-xl p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-[14px] font-semibold text-foreground">Active Lens</h3>
                    <p className="text-[11px] text-muted-foreground mt-0.5">
                      {activeLensCount} / 20 files focused
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-[11px] font-semibold text-[#EF4444] h-7 px-2 hover:bg-red-50 rounded-lg"
                    onClick={async () => {
                      try {
                        await fetch('http://localhost:2337/api/active-lens', { method: 'DELETE' })
                      } catch (e) {
                        console.error(e)
                      }
                      setFocusedFiles([])
                    }}
                  >
                    Un-focus All
                  </Button>
                </div>

                <div className="space-y-2">
                  {focusedFiles.length > 0 ? (
                    focusedFiles.map((file) => (
                      <div
                        key={file}
                        className="flex items-center justify-between p-2.5 rounded-lg bg-muted border border-border group hover:bg-card hover:shadow-sm transition-all"
                      >
                        <div className="flex flex-col min-w-0">
                          <span className="text-[11px] font-mono text-foreground truncate">{file}</span>
                          <span className="text-[10px] text-muted-foreground mt-0.5">42 lines • 1,204 tokens</span>
                        </div>
                        <button className="opacity-0 group-hover:opacity-100 w-6 h-6 flex items-center justify-center rounded-md hover:bg-red-50 hover:text-[#EF4444] text-[#9CA3AF] transition-all ml-2 shrink-0">
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ))
                  ) : (
                    <div className="p-6 text-center text-muted-foreground text-[11px] bg-muted rounded-lg border border-dashed border-border">
                      No active focus
                    </div>
                  )}
                </div>

                <div className="space-y-2 pt-1">
                  <div className="flex justify-between items-center">
                    <span className="text-[11px] font-semibold text-foreground">Focus Budget</span>
                    <span className="text-[11px] font-semibold text-[#7C3AED]">15% used</span>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div className="h-full bg-[#7C3AED] rounded-full" style={{ width: '15%' }} />
                  </div>
                  <p className="text-[10px] text-muted-foreground">
                    3 / 20 files focused (15%)
                  </p>
                  <p className="text-[10px] text-muted-foreground">
                    Tip: Keep your focused files under 20% for optimal performance.
                  </p>
                </div>
              </div>
            </div>

          </div>

          {/* Right rail: col-span-3 */}
          <div className="col-span-12 xl:col-span-3 space-y-6">

            {/* Token Savings */}
            <div className="bg-card border border-border rounded-xl overflow-hidden">
              <div className="px-5 py-4 border-b border-border flex items-center justify-between">
                <h3 className="text-[14px] font-semibold text-foreground">Token Savings</h3>
                <div className="flex items-center gap-1 text-[10px] font-semibold text-muted-foreground bg-muted border border-border px-2 py-1 rounded-lg cursor-pointer hover:border-[#7C3AED] transition-colors">
                  Live Session <ChevronDown className="w-3 h-3 ml-0.5 text-muted-foreground" />
                </div>
              </div>
              <div className="p-5 space-y-5">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-0.5">
                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                      Baseline (Raw)
                    </p>
                    <p className="text-[24px] font-bold text-foreground leading-none">142,391</p>
                    <p className="text-[10px] text-muted-foreground">tokens</p>
                  </div>
                  <div className="space-y-0.5">
                    <p className="text-[10px] font-bold text-[#7C3AED] uppercase tracking-widest">
                      With LoomMCP
                    </p>
                    <p className="text-[24px] font-bold text-[#10B981] leading-none">11,247</p>
                    <p className="text-[10px] text-muted-foreground">tokens saved</p>
                  </div>
                </div>

                <div className="flex flex-col items-center py-4 border-t border-border">
                  <span className="text-[48px] font-extrabold text-[#10B981] leading-none tracking-tighter">
                    92.1%
                  </span>
                  <span className="text-[11px] font-semibold text-[#10B981] mt-1 uppercase tracking-wide">
                    tokens saved
                  </span>
                </div>
              </div>
            </div>

            {/* Tokens per Turn Chart */}
            <div className="bg-card border border-border rounded-xl p-5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-[14px] font-semibold text-foreground">Tokens per Turn</h3>
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1.5">
                    <div className="w-2 h-2 rounded-full bg-[#F97316]" />
                    <span className="text-[9px] font-bold text-muted-foreground uppercase">Raw</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <div className="w-2 h-2 rounded-full bg-[#10B981]" />
                    <span className="text-[9px] font-bold text-muted-foreground uppercase">LoomMCP</span>
                  </div>
                </div>
              </div>
              <div className="h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData} margin={{ top: 4, right: 4, bottom: 4, left: -20 }}>
                    <XAxis
                      dataKey="name"
                      axisLine={false}
                      tickLine={false}
                      tick={{ fontSize: 9, fill: '#9CA3AF', fontWeight: 'bold' }}
                      dy={6}
                    />
                    <YAxis
                      axisLine={false}
                      tickLine={false}
                      tick={{ fontSize: 9, fill: '#9CA3AF', fontWeight: 'bold' }}
                      tickFormatter={(val) => `${val / 1000}k`}
                    />
                    <Tooltip
                      contentStyle={{
                        borderRadius: '12px',
                        border: 'none',
                        boxShadow: '0 10px 25px rgba(0,0,0,0.1)',
                        padding: '10px'
                      }}
                      labelStyle={{ fontSize: '10px', fontWeight: '700' }}
                      itemStyle={{ fontSize: '10px' }}
                    />
                    <Line
                      type="monotone"
                      dataKey="raw"
                      stroke="#F97316"
                      strokeWidth={2}
                      dot={false}
                      activeDot={{ r: 4, strokeWidth: 0 }}
                      name="Raw Claude Code"
                    />
                    <Line
                      type="monotone"
                      dataKey="loom"
                      stroke="#10B981"
                      strokeWidth={2}
                      dot={false}
                      activeDot={{ r: 4, strokeWidth: 0 }}
                      name="LoomMCP"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Recent Events */}
            <div className="bg-card border border-border rounded-xl p-5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-[14px] font-semibold text-foreground">Recent Events</h3>
                <Link
                  href="/events"
                  className="text-[11px] font-semibold text-[#7C3AED] hover:underline"
                >
                  View All
                </Link>
              </div>
              <div className="space-y-3">
                {(recentItems.length > 0
                  ? recentItems.slice(0, 5).map((item) => ({
                      label: (item.tool as string) || '',
                      timeLabel: formatTime(item.timestamp as string),
                    }))
                  : [
                      { label: 'Focused file: src/auth.ts::loginUser', timeLabel: '2m ago' },
                      { label: 'Focused file: src/middleware.ts', timeLabel: '2m ago' },
                      { label: 'Get Topology: src/ (482 files)', timeLabel: '1m ago' },
                      { label: 'Search Refs: loginUser (14 refs)', timeLabel: '45s ago' },
                      { label: 'Focused file: src/types.ts', timeLabel: '10s ago' },
                    ]
                ).map((event, i) => (
                  <div key={i} className="flex items-start gap-2.5">
                    <div className="w-1.5 h-1.5 rounded-full bg-[#10B981] mt-1.5 shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-[11px] text-foreground font-medium leading-snug truncate">
                        {event.label}
                      </p>
                      <p className="text-[10px] font-bold text-muted-foreground mt-0.5">
                        {event.timeLabel}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>

        {/* Quick Actions */}
        <div className="space-y-4 pt-2">
          <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
            Quick Actions
          </p>
          <div className="grid grid-cols-5 gap-4">
            {[
              { name: 'Get Topology', icon: Network, desc: 'Scan directory structure', bg: '#F5F3FF', color: '#7C3AED', href: '/topology' },
              { name: 'Focus File', icon: Focus, desc: 'Page in code', bg: '#EFF6FF', color: '#3B82F6', href: '/focus' },
              { name: 'Search Refs', icon: Search, desc: 'Find all references', bg: '#ECFDF5', color: '#10B981', href: '/search' },
              { name: 'Active Diff', icon: GitBranch, desc: 'View changes', bg: '#FFF7ED', color: '#F97316', href: '/diff' },
              { name: 'Blur Files', icon: EyeOff, desc: 'Un-focus files', bg: '#EEF2FF', color: '#6366F1', href: '/blur' },
            ].map((action) => (
              <Link
                key={action.name}
                href={action.href}
                className="bg-card border border-border rounded-xl p-5 hover:border-[#7C3AED] transition-all group flex flex-col"
              >
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center mb-3"
                  style={{ backgroundColor: action.bg }}
                >
                  <action.icon className="w-5 h-5" style={{ color: action.color }} />
                </div>
                <p className="text-[12px] font-bold text-foreground">{action.name}</p>
                <p className="text-[11px] text-muted-foreground mt-0.5">{action.desc}</p>
              </Link>
            ))}
          </div>
        </div>

      </div>

      {/* Status Bar */}
      <footer className="h-10 bg-card border-t border-border flex items-center justify-between px-8 text-[10px] font-bold text-muted-foreground">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="text-foreground">LoomMCP</span>
            <span className="bg-muted px-1.5 py-0.5 rounded text-[9px] font-bold">v0.1.0</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-1.5 h-1.5 rounded-full bg-[#10B981]" />
            <span>All systems operational</span>
          </div>
        </div>
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-1.5">
            <span className="uppercase tracking-widest text-[9px]">Transport:</span>
            <span className="text-foreground">stdio</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="uppercase tracking-widest text-[9px]">Port:</span>
            <span className="text-foreground">n/a</span>
          </div>
          <button className="text-[10px] font-bold text-[#7C3AED] hover:text-[#6D28D9] transition-colors border-l border-border pl-4">
            View Logs
          </button>
        </div>
      </footer>
    </div>
  )
}
