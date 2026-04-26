"use client"

import { useEffect, useState } from "react"
import { 
  Network, 
  Focus, 
  Zap, 
  ArrowRight,
  Info,
  MoreHorizontal,
  ChevronRight,
  ChevronDown,
  Search,
  Diff,
  EyeOff
} from "lucide-react"
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
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

export default function DashboardPage() {
  const [metrics, setMetrics] = useState<any>(null)
  const [greeting, setGreeting] = useState("")
  const [mounted, setMounted] = useState(false)
  const [focusedFiles, setFocusedFiles] = useState<string[]>([])

  useEffect(() => {
    setMounted(true)
    const hour = new Date().getHours()
    if (hour >= 12 && hour < 17) setGreeting("Good afternoon!")
    else if (hour >= 17) setGreeting("Good evening!")

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
      <div className="flex-1 flex items-center justify-center bg-[#FAFAFB]">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-purple-100 border-t-purple-600 rounded-full animate-spin" />
          <p className="text-xs font-bold text-[#9CA3AF] uppercase tracking-widest">Initialising Loom Dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col min-h-[calc(100vh-64px)] bg-[#FAFAFB]">
      <div className="p-8 flex-1 max-w-[1600px] mx-auto w-full space-y-8">
        {/* Welcome Section */}
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <h1 className="text-3xl font-extrabold tracking-tight text-[#111827] flex items-center gap-3">
              {greeting || "Loading..."} {greeting && <span className="animate-bounce-slow">👋</span>}
            </h1>
            <p className="text-[#6B7280] font-medium">LoomMCP is ready to help you work smarter, not harder.</p>
          </div>
          <div className="hidden lg:flex items-center gap-2 text-xs font-bold text-[#10B981] bg-[#ECFDF5] px-3 py-1.5 rounded-full border border-[#D1FAE5]">
             <div className="w-1.5 h-1.5 bg-[#10B981] rounded-full animate-pulse" />
             System Status: Optimal
          </div>
        </div>

        <div className="grid grid-cols-12 gap-8">
          {/* Left Column (Main Stats & Workflow) */}
          <div className="col-span-12 xl:col-span-9 space-y-8">
            
            {/* Savings Banner */}
            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#7C3AED] via-[#8B5CF6] to-[#9333EA] p-8 shadow-xl shadow-purple-200 group">
              <div className="absolute top-0 right-0 h-full w-1/2 opacity-20 group-hover:opacity-30 transition-opacity">
                 <img 
                   src="/dashboard_illustration_1777206828397.png" 
                   alt="Illustration" 
                   className="h-full w-full object-cover mix-blend-overlay rotate-3 scale-110"
                 />
              </div>
              <div className="absolute -top-24 -right-24 w-64 h-64 bg-white opacity-5 rounded-full blur-3xl animate-pulse" />
              
              <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
                <div className="space-y-6 max-w-xl text-center md:text-left">
                  <div className="space-y-2">
                    <h2 className="text-3xl font-black text-white leading-tight">Save 80%+ on Claude API costs</h2>
                    <p className="text-purple-100 text-lg font-medium opacity-90">Stop re-reading unchanged code. Use AST-aware context that stays sharp.</p>
                  </div>
                  <div className="flex flex-wrap justify-center md:justify-start gap-4">
                    <Button className="bg-white text-[#7C3AED] hover:bg-purple-50 font-bold px-6 py-6 rounded-2xl shadow-lg shadow-purple-900/20 text-md group/btn">
                      Get Started <ArrowRight className="ml-2 w-5 h-5 group-hover/btn:translate-x-1 transition-transform" />
                    </Button>
                    <Button variant="outline" className="bg-purple-600/20 border-white/20 text-white hover:bg-purple-600/40 font-bold px-6 py-6 rounded-2xl backdrop-blur-sm">
                      View Documentation
                    </Button>
                  </div>
                </div>
                
                <div className="hidden lg:block">
                   <div className="bg-white/10 backdrop-blur-md p-6 rounded-[2.5rem] border border-white/20 shadow-2xl shadow-purple-900/30 flex flex-col items-center justify-center min-w-[200px]">
                      <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center mb-4 shadow-inner">
                        <Zap className="w-6 h-6 text-[#7C3AED] fill-[#7C3AED]" />
                      </div>
                      <span className="text-4xl font-black text-white tracking-tighter">97.7%</span>
                      <span className="text-xs font-bold text-purple-100 uppercase tracking-widest mt-1 opacity-80">Token reduction</span>
                   </div>
                </div>
              </div>
            </div>

            {/* Session Overview (Enhanced) */}
            <div className="premium-card overflow-hidden">
              <div className="px-6 py-4 border-b border-[#F3F4F6] flex items-center justify-between bg-[#F9FAFB]/50">
                <h3 className="text-sm font-bold text-[#111827] uppercase tracking-wider">Session Overview</h3>
                <div className="flex gap-2">
                  <div className="w-2 h-2 rounded-full bg-[#10B981]" />
                  <div className="w-2 h-2 rounded-full bg-[#E5E7EB]" />
                  <div className="w-2 h-2 rounded-full bg-[#E5E7EB]" />
                </div>
              </div>
              <div className="grid grid-cols-4 divide-x divide-[#F3F4F6]">
                {[
                  { label: 'Total Tool Calls', value: metrics?.totalCalls?.toLocaleString() || '0', sub: '↑ Live index', color: '#10B981' },
                  { label: 'Tokens Saved', value: metrics?.tokensSaved?.toLocaleString() || '0', sub: `↑ ${metrics?.tokensSaved > 0 ? '92.1%' : '0%'} vs baseline`, color: '#10B981' },
                  { label: 'Active Lens', value: `${metrics?.activeLens || '0'} / 20`, sub: `${((metrics?.activeLens || 0) / 20 * 100).toFixed(0)}% of budget`, color: '#6B7280' },
                  { label: 'Session Time', value: metrics?.sessionDuration ? `${Math.floor(metrics.sessionDuration / 60000)}m ${Math.floor((metrics.sessionDuration % 60000) / 1000)}s` : '0m 0s', sub: 'Started Live', color: '#6B7280' },
                ].map((stat, i) => (
                  <div key={i} className="p-8 space-y-2 hover:bg-[#F9FAFB] transition-colors group cursor-default">
                    <p className="text-xs font-bold text-[#9CA3AF] uppercase tracking-widest">{stat.label}</p>
                    <div className="flex items-baseline gap-2">
                      <span className="text-3xl font-black text-[#111827] tracking-tight">{stat.value}</span>
                    </div>
                    <p className="text-[11px] font-bold" style={{ color: stat.color }}>{stat.sub}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-8">
              {/* Recent Activity (Upgraded) */}
              <div className="premium-card flex flex-col">
                <div className="p-6 border-b border-[#F3F4F6] flex items-center justify-between">
                  <h3 className="text-sm font-bold text-[#111827]">Recent Activity</h3>
                  <Button variant="ghost" size="sm" className="text-[11px] font-bold text-[#7C3AED] hover:bg-purple-50 rounded-lg h-8 px-3">View All Events</Button>
                </div>
                <div className="flex-1 overflow-y-auto">
                   {(metrics?.recent || []).length > 0 ? (metrics.recent.slice(0, 5).map((item: any, i: number) => (
                     <div key={i} className="flex items-center gap-4 px-6 py-4 hover:bg-[#F9FAFB] transition-all border-b border-[#F9FAFB] last:border-0 group">
                       <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-transform group-hover:scale-105 shadow-sm border border-black/5 bg-purple-50">
                         <Zap className="w-4 h-4 text-[#7C3AED]" />
                       </div>
                       <div className="flex-1 min-w-0">
                         <p className="text-sm font-bold text-[#111827] truncate">{item.tool}</p>
                         <div className="flex items-center gap-2 mt-0.5">
                            <span className="text-[10px] font-bold text-[#9CA3AF] uppercase">{new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                            <span className="w-1 h-1 rounded-full bg-[#E5E7EB]" />
                            <span className="text-[10px] font-medium text-[#6B7280]">{item.duration}ms</span>
                         </div>
                       </div>
                       <ChevronRight className="w-4 h-4 text-[#E5E7EB] group-hover:text-[#9CA3AF] transition-colors" />
                     </div>
                   ))) : (
                     <div className="p-12 text-center text-[#9CA3AF] font-bold text-xs uppercase tracking-widest">No activity yet</div>
                   )}
                </div>
              </div>

              {/* Active Lens Card (Upgraded) */}
              <div className="premium-card p-6 space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-bold text-[#111827]">Active Lens</h3>
                    <p className="text-[11px] font-medium text-[#6B7280]">3 / 20 files focused</p>
                  </div>
                  <Button variant="ghost" size="sm" className="text-[11px] font-bold text-[#EF4444] h-8 px-3 hover:bg-red-50 rounded-lg">Un-focus All</Button>
                </div>
                
                <div className="space-y-3">
                  {focusedFiles.length > 0 ? (focusedFiles.map((file) => (
                    <div key={file} className="flex items-center justify-between p-3 rounded-2xl bg-[#F9FAFB] border border-[#E5E7EB] group transition-all hover:bg-white hover:shadow-lg hover:shadow-black/5 hover:-translate-y-0.5">
                      <div className="flex flex-col min-w-0">
                         <span className="text-[11px] font-bold text-[#111827] font-mono truncate">{file}</span>
                         <div className="flex items-center gap-2 mt-1">
                            <span className="text-[9px] font-bold text-[#9CA3AF] uppercase tracking-tighter">Active Focus</span>
                         </div>
                      </div>
                      <button className="opacity-0 group-hover:opacity-100 w-7 h-7 flex items-center justify-center bg-white border border-[#E5E7EB] rounded-lg shadow-sm hover:border-[#EF4444] hover:text-[#EF4444] transition-all">
                        <EyeOff className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))) : (
                    <div className="p-8 text-center text-[#9CA3AF] font-bold text-xs uppercase tracking-widest bg-[#F9FAFB] rounded-2xl border border-dashed border-[#E5E7EB]">No active focus</div>
                  )}
                </div>

                <div className="pt-2 space-y-3">
                  <div className="flex justify-between items-baseline">
                    <span className="text-[11px] font-bold text-[#111827]">Focus Budget</span>
                    <span className="text-[11px] font-bold text-[#7C3AED]">15% used</span>
                  </div>
                  <div className="h-2 bg-[#F3F4F6] rounded-full overflow-hidden">
                    <div className="h-full bg-[#7C3AED] rounded-full" style={{ width: '15%' }} />
                  </div>
                  <p className="text-[10px] text-[#6B7280] leading-relaxed">
                    Need more? Blur files you're done with to free up your budget.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Sidebar (Token Savings & Events) */}
          <div className="col-span-12 xl:col-span-3 space-y-8">
            
            {/* Token Savings Meter (Upgraded) */}
            <div className="premium-card overflow-hidden">
              <div className="p-6 border-b border-[#F3F4F6] flex items-center justify-between">
                <h3 className="text-sm font-bold text-[#111827]">Token Savings</h3>
                <div className="flex items-center gap-1.5 text-[10px] font-bold bg-white px-2.5 py-1.5 rounded-xl border border-[#E5E7EB] cursor-pointer shadow-sm hover:border-[#7C3AED] transition-colors">
                  Live Session <ChevronDown className="w-3 h-3 text-[#9CA3AF]" />
                </div>
              </div>
              <div className="p-6 space-y-8">
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-1">
                     <p className="text-[10px] font-bold text-[#9CA3AF] uppercase tracking-widest">Baseline</p>
                     <p className="text-2xl font-black text-[#111827]">142,391</p>
                     <p className="text-[9px] font-bold text-[#6B7280] opacity-60">RAW TOKENS</p>
                  </div>
                  <div className="space-y-1">
                     <p className="text-[10px] font-bold text-[#7C3AED] uppercase tracking-widest">With Loom</p>
                     <p className="text-2xl font-black text-[#10B981]">11,247</p>
                     <p className="text-[9px] font-bold text-[#6B7280] opacity-60">SAVED TOKENS</p>
                  </div>
                </div>

                <div className="relative pt-8 pb-4 flex flex-col items-center justify-center border-t border-[#F3F4F6]">
                  <div className="absolute top-0 -translate-y-1/2 left-1/2 -translate-x-1/2 bg-white px-4 py-1 border border-[#F3F4F6] rounded-full">
                     <span className="text-[10px] font-black text-[#10B981] uppercase tracking-tighter">Efficiency</span>
                  </div>
                  <div className="text-6xl font-black text-[#10B981] tracking-tighter">92.1%</div>
                  <div className="text-xs font-bold text-[#10B981] mt-1 uppercase tracking-widest">tokens saved</div>
                </div>
              </div>
            </div>

            {/* Tokens per Turn Chart (Upgraded) */}
            <div className="premium-card p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-sm font-bold text-[#111827]">Tokens per Turn</h3>
                <div className="flex items-center gap-3">
                   <div className="flex items-center gap-1.5">
                      <div className="w-1.5 h-1.5 rounded-full bg-[#F97316]" />
                      <span className="text-[9px] font-bold text-[#9CA3AF] uppercase">Raw</span>
                   </div>
                   <div className="flex items-center gap-1.5">
                      <div className="w-1.5 h-1.5 rounded-full bg-[#10B981]" />
                      <span className="text-[9px] font-bold text-[#9CA3AF] uppercase">Loom</span>
                   </div>
                </div>
              </div>
              <div className="h-[200px] -ml-6 -mr-2">
                 <ResponsiveContainer width="100%" height="100%">
                   <LineChart data={chartData}>
                     <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F3F4F6" />
                     <XAxis 
                       dataKey="name" 
                       axisLine={false} 
                       tickLine={false} 
                       tick={{ fontSize: 10, fill: '#9CA3AF', fontWeight: 'bold' }}
                       dy={10}
                     />
                     <YAxis 
                       axisLine={false} 
                       tickLine={false} 
                       tick={{ fontSize: 10, fill: '#9CA3AF', fontWeight: 'bold' }}
                       tickFormatter={(val) => `${val/1000}k`}
                     />
                     <Tooltip 
                       contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)', padding: '12px' }}
                       labelStyle={{ fontSize: '10px', fontWeight: '800', marginBottom: '4px', textTransform: 'uppercase' }}
                       itemStyle={{ fontSize: '10px', padding: '0' }}
                     />
                     <Line 
                       type="monotone" 
                       dataKey="raw" 
                       stroke="#F97316" 
                       strokeWidth={3} 
                       dot={false}
                       activeDot={{ r: 6, strokeWidth: 0 }}
                       name="Raw Claude"
                     />
                     <Line 
                       type="monotone" 
                       dataKey="loom" 
                       stroke="#10B981" 
                       strokeWidth={3} 
                       dot={false}
                       activeDot={{ r: 6, strokeWidth: 0 }}
                       name="LoomMCP"
                     />
                   </LineChart>
                 </ResponsiveContainer>
              </div>
            </div>

            {/* Recent Events (Upgraded) */}
            <div className="premium-card p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-bold text-[#111827]">Recent Events</h3>
                <Button variant="ghost" size="sm" className="h-7 w-7 p-0 text-[#9CA3AF] hover:text-[#7C3AED]">
                   <MoreHorizontal className="w-4 h-4" />
                </Button>
              </div>
              <div className="space-y-5">
                {[
                  { time: '2m ago', text: 'Focused file: src/auth.ts::loginUser' },
                  { time: '2m ago', text: 'Focused file: src/middleware.ts' },
                  { time: '1m ago', text: 'Get Topology: src/ (482 files)' },
                  { time: '45s ago', text: 'Search Refs: loginUser (14 refs)' },
                  { time: '10s ago', text: 'Focused file: src/types.ts' },
                ].map((event, i) => (
                  <div key={i} className="flex items-start gap-3 group cursor-pointer">
                    <div className="w-1.5 h-1.5 rounded-full bg-[#10B981] mt-1.5 group-hover:scale-150 transition-transform" />
                    <div className="flex flex-col">
                      <span className="text-xs text-[#111827] font-medium leading-tight group-hover:text-[#7C3AED] transition-colors">{event.text}</span>
                      <span className="text-[10px] font-bold text-[#9CA3AF] mt-0.5">{event.time}</span>
                    </div>
                  </div>
                ))}
              </div>
              <Button variant="outline" className="w-full mt-6 rounded-xl text-[11px] font-bold border-[#F3F4F6] text-[#6B7280] hover:bg-[#F9FAFB] hover:text-[#111827] transition-all">
                View All System Events
              </Button>
            </div>
          </div>
        </div>

        {/* Quick Actions Footer */}
        <div className="space-y-6 pt-4">
          <h3 className="text-xs font-black text-[#9CA3AF] uppercase tracking-[0.2em]">Quick Actions</h3>
          <div className="grid grid-cols-5 gap-6">
             {[
               { name: 'Get Topology', icon: Network, desc: 'Scan structure', color: '#7C3AED', bg: '#F5F3FF' },
               { name: 'Focus File', icon: Focus, desc: 'Page in code', color: '#3B82F6', bg: '#EFF6FF' },
               { name: 'Search Refs', icon: Search, desc: 'Find references', color: '#10B981', bg: '#ECFDF5' },
               { name: 'Active Diff', icon: Diff, desc: 'View changes', color: '#F97316', bg: '#FFF7ED' },
               { name: 'Blur Files', icon: EyeOff, desc: 'Un-focus files', color: '#6366F1', bg: '#EEF2FF' },
             ].map((action) => (
               <button key={action.name} className="premium-card flex flex-col p-5 hover:border-[#7C3AED] group text-left relative overflow-hidden">
                 <div className="w-12 h-12 rounded-2xl flex items-center justify-center mb-4 transition-all group-hover:scale-110 shadow-sm border border-black/5" style={{ backgroundColor: action.bg }}>
                   <action.icon className="w-5 h-5 group-hover:rotate-6 transition-transform" style={{ color: action.color }} />
                 </div>
                 <div className="space-y-1 relative z-10">
                   <p className="text-xs font-black text-[#111827] uppercase tracking-tight">{action.name}</p>
                   <p className="text-[10px] text-[#6B7280] font-medium">{action.desc}</p>
                 </div>
                 <div className="absolute -bottom-4 -right-4 w-12 h-12 bg-black/[0.02] rounded-full group-hover:scale-[3] transition-transform duration-500" />
               </button>
             ))}
          </div>
        </div>
      </div>

      {/* System Status Bar */}
      <footer className="h-10 bg-white border-t border-[#F3F4F6] px-8 flex items-center justify-between text-[10px] font-bold text-[#9CA3AF]">
        <div className="flex items-center gap-6">
           <div className="flex items-center gap-2">
             <span className="text-[#111827]">LoomMCP</span>
             <span className="bg-[#F3F4F6] px-1.5 py-0.5 rounded text-[9px]">v0.1.0</span>
           </div>
           <div className="flex items-center gap-2">
             <div className="w-1.5 h-1.5 rounded-full bg-[#10B981]" />
             <span>All systems operational</span>
           </div>
        </div>
        <div className="flex items-center gap-8">
           <div className="flex items-center gap-2">
             <span className="uppercase tracking-widest text-[9px]">Transport:</span>
             <span className="text-[#111827]">stdio</span>
           </div>
           <div className="flex items-center gap-2">
             <span className="uppercase tracking-widest text-[9px]">Port:</span>
             <span className="text-[#111827]">n/a</span>
           </div>
           <Button variant="ghost" className="h-10 px-4 text-[10px] font-bold text-[#7C3AED] hover:bg-[#F5F3FF] rounded-none border-l border-[#F3F4F6]">
             View Logs
           </Button>
        </div>
      </footer>
    </div>
  )
}
