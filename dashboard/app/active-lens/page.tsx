"use client"

import { 
  Zap, 
  Trash2, 
  EyeOff, 
  Maximize2, 
  MoreHorizontal,
  FileCode,
  Check,
  Info,
  Clock,
  ChevronRight
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

const lenses = [
  { name: 'src/auth.ts::loginUser', type: 'Symbol', tokens: 1204, lines: 42, added: '2m ago' },
  { name: 'src/middleware.ts', type: 'File', tokens: 2847, lines: 128, added: '15m ago' },
  { name: 'src/types.ts', type: 'File', tokens: 1943, lines: 76, added: '45m ago' },
]

export default function ActiveLensPage() {
  return (
    <div className="p-8 max-w-[1600px] mx-auto space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight text-[#111827]">Active Lens</h1>
          <p className="text-[#6B7280]">Real-time view of what the AI agent is currently focused on.</p>
        </div>
        <Button variant="outline" className="border-[#EF4444] text-[#EF4444] hover:bg-[#FEF2F2] font-bold">
          <Trash2 className="w-4 h-4 mr-2" /> Clear All Focus
        </Button>
      </div>

      <div className="grid grid-cols-12 gap-8">
        <div className="col-span-12 xl:col-span-8 space-y-6">
           {/* Active Lenses Grid */}
           <div className="grid grid-cols-2 gap-6">
              {lenses.map((lens, i) => (
                <Card key={i} className="border-[#E5E7EB] shadow-sm hover:shadow-md transition-shadow group">
                   <CardHeader className="flex flex-row items-center justify-between pb-2 border-b border-[#F9FAFB] bg-[#F9FAFB]">
                      <div className="flex items-center gap-3">
                         <div className="w-8 h-8 bg-white border border-[#E5E7EB] rounded flex items-center justify-center">
                            <FileCode className="w-4 h-4 text-[#7C3AED]" />
                         </div>
                         <div>
                            <CardTitle className="text-sm font-bold truncate max-w-[200px]">{lens.name}</CardTitle>
                            <CardDescription className="text-[10px]">{lens.type}</CardDescription>
                         </div>
                      </div>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-[#9CA3AF] opacity-0 group-hover:opacity-100 transition-opacity">
                         <MoreHorizontal className="w-4 h-4" />
                      </Button>
                   </CardHeader>
                   <CardContent className="p-6 space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                         <div className="space-y-1">
                            <p className="text-[10px] font-medium text-[#6B7280] uppercase tracking-wider">Tokens</p>
                            <p className="text-lg font-bold text-[#111827]">{lens.tokens.toLocaleString()}</p>
                         </div>
                         <div className="space-y-1">
                            <p className="text-[10px] font-medium text-[#6B7280] uppercase tracking-wider">Lines</p>
                            <p className="text-lg font-bold text-[#111827]">{lens.lines}</p>
                         </div>
                      </div>
                      <div className="flex items-center justify-between pt-4 border-t border-[#F3F4F6]">
                         <span className="text-[10px] text-[#9CA3AF] font-medium flex items-center gap-1">
                            <Clock className="w-3 h-3" /> Added {lens.added}
                         </span>
                         <div className="flex items-center gap-2">
                            <Button variant="ghost" size="sm" className="h-7 text-[10px] font-bold text-[#6B7280]">
                               <Maximize2 className="w-3 h-3 mr-1" /> View
                            </Button>
                            <Button variant="ghost" size="sm" className="h-7 text-[10px] font-bold text-[#EF4444] hover:bg-[#FEF2F2]">
                               <EyeOff className="w-3 h-3 mr-1" /> Blur
                            </Button>
                         </div>
                      </div>
                   </CardContent>
                </Card>
              ))}

              {/* Add New Lens Placeholder */}
              <button className="border-2 border-dashed border-[#E5E7EB] rounded-xl flex flex-col items-center justify-center p-8 gap-4 hover:border-[#7C3AED] hover:bg-[#F3F0FF] group transition-all">
                 <div className="w-12 h-12 bg-[#F9FAFB] border border-[#E5E7EB] rounded-full flex items-center justify-center group-hover:bg-white group-hover:border-[#7C3AED]">
                    <Zap className="w-6 h-6 text-[#9CA3AF] group-hover:text-[#7C3AED]" />
                 </div>
                 <div className="text-center">
                    <p className="text-sm font-bold text-[#111827]">Focus New Symbol</p>
                    <p className="text-xs text-[#6B7280]">Or file to add to Active Lens</p>
                 </div>
              </button>
           </div>
        </div>

        <div className="col-span-12 xl:col-span-4 space-y-8">
           <Card className="border-[#E5E7EB] shadow-sm">
              <CardHeader>
                 <CardTitle className="text-sm font-semibold">Context Budget</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                 <div className="space-y-4">
                    <div className="flex justify-between items-baseline">
                       <span className="text-4xl font-bold">5,994</span>
                       <span className="text-xs font-bold text-[#6B7280]">total tokens</span>
                    </div>
                    <div className="space-y-2">
                       <div className="flex justify-between text-[10px] font-bold text-[#6B7280] uppercase tracking-wider">
                          <span>Focus Window</span>
                          <span>15% used</span>
                       </div>
                       <Progress value={15} className="h-2 bg-[#F3F4F6]" />
                    </div>
                 </div>

                 <div className="p-4 bg-[#F0FDF4] rounded-xl border border-[#BBF7D0] space-y-3">
                    <div className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-[#16A34A]" />
                      <span className="text-xs font-bold text-[#16A34A]">Optimal Density</span>
                    </div>
                    <p className="text-[10px] text-[#16A34A] leading-relaxed font-medium">
                      Your current Active Lens configuration is 92% more efficient than sending raw files.
                    </p>
                 </div>

                 <div className="space-y-4 pt-6 border-t border-[#F3F4F6]">
                    <p className="text-[10px] font-bold text-[#6B7280] uppercase tracking-wider">Lens Insights</p>
                    <div className="space-y-4">
                       <div className="flex items-start gap-3">
                          <Info className="w-4 h-4 text-[#3B82F6] shrink-0 mt-0.5" />
                          <p className="text-[11px] text-[#6B7280] leading-relaxed">
                            <strong>src/auth.ts::loginUser</strong> is being requested frequently by the agent. Keep it in focus.
                          </p>
                       </div>
                    </div>
                 </div>
              </CardContent>
           </Card>
        </div>
      </div>
    </div>
  )
}
