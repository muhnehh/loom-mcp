"use client"

import { 
  Eraser, 
  Trash2, 
  Zap, 
  Info, 
  FileCode, 
  EyeOff,
  Sparkles,
  ArrowRight
} from "lucide-react"
import { cn } from "@/lib/utils"
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"

const focusedFiles = [
  { name: 'src/auth.ts::loginUser', lines: 42, tokens: 1204, lastActivity: '2m ago', importance: 'High' },
  { name: 'src/middleware.ts', lines: 128, tokens: 2847, lastActivity: '15m ago', importance: 'Medium' },
  { name: 'src/types.ts', lines: 76, tokens: 1943, lastActivity: '45m ago', importance: 'Low' },
]

export default function BlurPage() {
  return (
    <div className="flex flex-col min-h-[calc(100vh-64px)]">
      <div className="p-8 flex-1 max-w-[1600px] mx-auto w-full space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <h1 className="text-3xl font-extrabold tracking-tight text-[#111827]">Blur (Un-focus Files)</h1>
            <p className="text-[#6B7280] font-medium">Remove files from the active lens to free up focus budget.</p>
          </div>
          <div className="flex gap-3">
             <Button variant="outline" className="border-[#E5E7EB] text-[#6B7280] hover:bg-white hover:border-[#7C3AED] hover:text-[#7C3AED] font-bold rounded-xl transition-all h-11 px-6">
                Export Context
             </Button>
             <Button className="bg-[#EF4444] hover:bg-[#DC2626] text-white font-bold rounded-xl shadow-lg shadow-red-100 transition-all h-11 px-6">
                <EyeOff className="w-4 h-4 mr-2" /> Un-focus All
             </Button>
          </div>
        </div>

        <div className="grid grid-cols-12 gap-8">
          {/* Focused Files Table */}
          <div className="col-span-12 xl:col-span-9 space-y-8">
            <div className="premium-card overflow-hidden">
              <div className="px-8 py-5 border-b border-[#F3F4F6] flex items-center justify-between bg-[#F9FAFB]/50">
                <div className="flex items-center gap-3">
                   <div className="w-8 h-8 rounded-lg bg-white shadow-sm flex items-center justify-center">
                      <Zap className="w-4 h-4 text-[#7C3AED]" />
                   </div>
                   <h3 className="text-sm font-black text-[#111827] uppercase tracking-wider">Currently Focused (3/20)</h3>
                </div>
                <Button variant="ghost" size="sm" className="text-[11px] font-bold text-[#7C3AED] hover:bg-purple-50 rounded-lg">Refresh List</Button>
              </div>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="border-b border-[#F3F4F6] hover:bg-transparent">
                      <TableHead className="text-[10px] font-black text-[#9CA3AF] uppercase tracking-[0.1em] px-8 py-4">File / Symbol</TableHead>
                      <TableHead className="text-[10px] font-black text-[#9CA3AF] uppercase tracking-[0.1em] px-8 py-4">Lines</TableHead>
                      <TableHead className="text-[10px] font-black text-[#9CA3AF] uppercase tracking-[0.1em] px-8 py-4">Tokens</TableHead>
                      <TableHead className="text-[10px] font-black text-[#9CA3AF] uppercase tracking-[0.1em] px-8 py-4">Focused At</TableHead>
                      <TableHead className="text-[10px] font-black text-[#9CA3AF] uppercase tracking-[0.1em] px-8 py-4 text-right">Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {focusedFiles.map((file, i) => (
                      <TableRow key={i} className="group hover:bg-[#F9FAFB] border-b border-[#F3F4F6] last:border-0 transition-colors">
                        <TableCell className="px-8 py-5">
                          <div className="flex items-center gap-3">
                             <div className="w-8 h-8 rounded-lg bg-[#F9FAFB] border border-[#E5E7EB] flex items-center justify-center group-hover:bg-white group-hover:shadow-sm transition-all">
                                <FileCode className="w-4 h-4 text-[#9CA3AF] group-hover:text-[#7C3AED]" />
                             </div>
                             <span className="text-xs font-bold text-[#111827] font-mono">{file.name}</span>
                          </div>
                        </TableCell>
                        <TableCell className="px-8 py-5 text-xs font-bold text-[#6B7280] tabular-nums">{file.lines}</TableCell>
                        <TableCell className="px-8 py-5 text-xs font-bold text-[#111827] font-mono tabular-nums">{file.tokens.toLocaleString()}</TableCell>
                        <TableCell className="px-8 py-5 text-xs font-bold text-[#6B7280]">{file.lastActivity}</TableCell>
                        <TableCell className="px-8 py-5 text-right">
                           <Button className="h-8 px-4 rounded-lg bg-white border border-[#E5E7EB] text-[11px] font-black text-[#EF4444] hover:bg-[#FEF2F2] hover:border-[#EF4444] transition-all shadow-sm">
                             Un-focus
                           </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>

            <div className="space-y-6">
               <div className="flex items-center gap-3 px-2">
                 <Sparkles className="w-5 h-5 text-[#7C3AED]" />
                 <h3 className="text-md font-black text-[#111827] uppercase tracking-widest">Focus Insights</h3>
               </div>
               <div className="grid grid-cols-2 gap-8">
                  <div className="premium-card p-6 space-y-4 group">
                     <div className="flex items-center justify-between">
                        <div className="w-10 h-10 rounded-xl bg-[#FFF7ED] flex items-center justify-center shadow-sm border border-orange-100">
                          <Info className="w-5 h-5 text-[#F97316]" />
                        </div>
                        <Badge variant="outline" className="bg-[#FFF7ED] text-[#F97316] border-[#FFEDD5] text-[9px] font-bold uppercase tracking-widest px-2">Stale Context</Badge>
                     </div>
                     <div className="space-y-2">
                        <p className="text-sm font-black text-[#111827]">Low Activity Detected</p>
                        <p className="text-[11px] text-[#6B7280] font-medium leading-relaxed">
                          <strong>src/types.ts</strong> hasn't been referenced in 45 minutes. Blurring it could improve agent reasoning speed.
                        </p>
                     </div>
                     <Button variant="outline" className="w-full rounded-xl text-[11px] font-bold border-[#F3F4F6] text-[#7C3AED] hover:bg-[#F5F3FF] hover:border-[#7C3AED] transition-all py-5">
                       Blur src/types.ts Now
                     </Button>
                  </div>
                  <div className="premium-card p-6 space-y-4 group">
                     <div className="flex items-center justify-between">
                        <div className="w-10 h-10 rounded-xl bg-[#F0FDF4] flex items-center justify-center shadow-sm border border-green-100">
                          <Zap className="w-5 h-5 text-[#10B981]" />
                        </div>
                        <Badge variant="outline" className="bg-[#F0FDF4] text-[#10B981] border-[#DCFCE7] text-[9px] font-bold uppercase tracking-widest px-2">Suggestion</Badge>
                     </div>
                     <div className="space-y-2">
                        <p className="text-sm font-black text-[#111827]">Refinement Opportunity</p>
                        <p className="text-[11px] text-[#6B7280] font-medium leading-relaxed">
                          <strong>src/middleware.ts</strong> is quite large. Consider using symbol-level focus on specific functions instead.
                        </p>
                     </div>
                     <Button variant="outline" className="w-full rounded-xl text-[11px] font-bold border-[#F3F4F6] text-[#7C3AED] hover:bg-[#F5F3FF] hover:border-[#7C3AED] transition-all py-5">
                       Refine Focus Symbols
                     </Button>
                  </div>
               </div>
            </div>
          </div>

          {/* Right Stats Panel */}
          <div className="col-span-12 xl:col-span-3 space-y-8">
             <div className="premium-card p-8 space-y-8 overflow-hidden relative">
                <div className="absolute -top-12 -right-12 w-32 h-32 bg-purple-50 rounded-full blur-2xl" />
                
                <div className="space-y-6 relative z-10">
                   <h3 className="text-xs font-black text-[#9CA3AF] uppercase tracking-[0.2em]">Focus Budget</h3>
                   <div className="space-y-2">
                      <div className="flex justify-between items-end">
                         <span className="text-6xl font-black text-[#111827] tracking-tighter">15%</span>
                         <span className="text-xs font-black text-[#10B981] mb-2 uppercase tracking-tighter">85% free</span>
                      </div>
                      <div className="h-3 bg-[#F3F4F6] rounded-full overflow-hidden shadow-inner">
                        <div className="h-full bg-gradient-to-r from-[#7C3AED] to-[#9333EA] rounded-full shadow-[0_0_8px_rgba(124,58,237,0.4)]" style={{ width: '15%' }} />
                      </div>
                      <p className="text-[10px] font-bold text-[#6B7280] pt-2">
                        Currently using 3 out of 20 available focus slots.
                      </p>
                   </div>
                </div>

                <div className="pt-8 border-t border-[#F3F4F6] space-y-6 relative z-10">
                   <p className="text-[10px] font-black text-[#9CA3AF] uppercase tracking-[0.2em]">Session Impact</p>
                   <div className="space-y-4">
                      <div className="flex justify-between items-center">
                         <span className="text-xs font-bold text-[#6B7280]">Total Tokens Loaded</span>
                         <span className="text-sm font-black text-[#111827]">5,994</span>
                      </div>
                      <div className="flex justify-between items-center">
                         <span className="text-xs font-bold text-[#6B7280]">Avg Tokens / File</span>
                         <span className="text-sm font-black text-[#111827]">1,998</span>
                      </div>
                      <div className="flex justify-between items-center">
                         <span className="text-xs font-bold text-[#6B7280]">Context Precision</span>
                         <span className="text-sm font-black text-[#10B981]">High</span>
                      </div>
                   </div>
                </div>

                <div className="bg-gradient-to-br from-[#7C3AED] to-[#9333EA] p-6 rounded-[2rem] space-y-3 shadow-xl shadow-purple-200 relative overflow-hidden group">
                   <div className="absolute top-0 right-0 p-2 opacity-10 group-hover:opacity-20 transition-opacity">
                     <Zap className="w-16 h-16 text-white fill-white" />
                   </div>
                   <div className="flex items-center gap-2">
                     <div className="w-7 h-7 rounded-lg bg-white/20 backdrop-blur-sm flex items-center justify-center">
                       <Zap className="w-4 h-4 text-white" />
                     </div>
                     <span className="text-xs font-black text-white uppercase tracking-wider">Why Blur?</span>
                   </div>
                   <p className="text-[10px] font-medium text-purple-100 leading-relaxed">
                     Removing irrelevant code improves AI reasoning quality and drastically reduces API costs per turn.
                   </p>
                </div>
             </div>
          </div>
        </div>
      </div>

      {/* Status Bar */}
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
        <div className="flex items-center gap-4">
           <span>Tip: Keep your focused files under 10 for optimal performance.</span>
        </div>
      </footer>
    </div>
  )
}
