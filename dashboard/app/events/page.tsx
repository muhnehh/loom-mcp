"use client"

import { 
  FileText, 
  Search, 
  Filter, 
  Trash2, 
  Download,
  CheckCircle2,
  AlertCircle,
  XCircle,
  Info,
  Clock,
  MoreVertical
} from "lucide-react"
import { cn } from "@/lib/utils"
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

const events = [
  { time: '2:42:18 PM', type: 'success', label: 'Focused', text: 'src/auth.ts::loginUser', detail: '42 lines • 1,204 tokens' },
  { time: '2:41:02 PM', type: 'info', label: 'Topology', text: 'Scanned src/ directory', detail: '482 files • 8,247 tokens' },
  { time: '2:40:15 PM', type: 'success', label: 'Search', text: 'Search references for loginUser', detail: '14 references found' },
  { time: '2:39:48 PM', type: 'success', label: 'Focused', text: 'src/middleware.ts', detail: '128 lines • 2,847 tokens' },
  { time: '2:38:11 PM', type: 'info', label: 'System', text: 'Session started', detail: 'Connected to Claude Code' },
  { time: '2:35:00 PM', type: 'warning', label: 'Security', text: 'Focus budget approaching limit', detail: '18/20 slots used' },
  { time: '2:30:12 PM', type: 'error', label: 'Error', text: 'Failed to focus src/non-existent.ts', detail: 'File not found' },
  { time: '2:28:45 PM', type: 'success', label: 'Blur', text: 'Blurred src/utils.ts', detail: 'Released 452 tokens' },
]

export default function EventsPage() {
  return (
    <div className="p-8 max-w-[1600px] mx-auto space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight text-[#111827]">Events</h1>
          <p className="text-[#6B7280]">System event feed for the current session.</p>
        </div>
        <div className="flex items-center gap-3">
           <Button variant="outline" className="border-[#E5E7EB] text-[#6B7280]">
             <Trash2 className="w-4 h-4 mr-2" /> Clear Logs
           </Button>
           <Button variant="outline" className="border-[#E5E7EB] text-[#6B7280]">
             <Download className="w-4 h-4 mr-2" /> Export JSON
           </Button>
        </div>
      </div>

      {/* Toolbar */}
      <Card className="border-[#E5E7EB] shadow-sm">
        <CardContent className="p-4 flex items-center justify-between">
           <div className="flex items-center gap-4 flex-1">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#9CA3AF]" />
                <Input placeholder="Search events..." className="pl-10 h-10 border-[#E5E7EB]" />
              </div>
              <div className="flex items-center gap-2">
                 <Badge variant="outline" className="h-8 px-3 rounded-full border-[#BBF7D0] bg-[#F0FDF4] text-[#16A34A] font-bold cursor-pointer hover:bg-[#DCFCE7] transition-colors">Success</Badge>
                 <Badge variant="outline" className="h-8 px-3 rounded-full border-[#DBEAFE] bg-[#EFF6FF] text-[#3B82F6] font-bold cursor-pointer hover:bg-[#DBEAFE] transition-colors">Info</Badge>
                 <Badge variant="outline" className="h-8 px-3 rounded-full border-[#FED7AA] bg-[#FFF7ED] text-[#F97316] font-bold cursor-pointer hover:bg-[#FFEDD5] transition-colors">Warning</Badge>
                 <Badge variant="outline" className="h-8 px-3 rounded-full border-[#FECACA] bg-[#FEF2F2] text-[#EF4444] font-bold cursor-pointer hover:bg-[#FEE2E2] transition-colors">Error</Badge>
              </div>
           </div>
           <Button variant="ghost" size="sm" className="text-[#6B7280]">
             <Filter className="w-4 h-4 mr-2" /> More Filters
           </Button>
        </CardContent>
      </Card>

      {/* Event Feed */}
      <Card className="border-[#E5E7EB] shadow-sm divide-y divide-[#F3F4F6]">
         {events.map((event, i) => (
           <div key={i} className="flex items-center gap-6 px-6 py-4 hover:bg-[#F9FAFB] transition-colors group">
              <div className="w-20 shrink-0 flex flex-col">
                <span className="text-[10px] font-bold text-[#9CA3AF] tabular-nums uppercase">{event.time}</span>
              </div>
              
              <div className="shrink-0">
                {event.type === 'success' && <CheckCircle2 className="w-5 h-5 text-[#16A34A]" />}
                {event.type === 'info' && <Info className="w-5 h-5 text-[#3B82F6]" />}
                {event.type === 'warning' && <AlertCircle className="w-5 h-5 text-[#F97316]" />}
                {event.type === 'error' && <XCircle className="w-5 h-5 text-[#EF4444]" />}
              </div>

              <div className="w-24 shrink-0">
                 <Badge variant="outline" className={cn(
                   "text-[10px] font-bold uppercase tracking-wider",
                   event.type === 'success' ? "border-[#BBF7D0] text-[#16A34A]" :
                   event.type === 'info' ? "border-[#DBEAFE] text-[#3B82F6]" :
                   event.type === 'warning' ? "border-[#FED7AA] text-[#F97316]" :
                   "border-[#FECACA] text-[#EF4444]"
                 )}>
                   {event.label}
                 </Badge>
              </div>

              <div className="flex-1 min-w-0 space-y-0.5">
                 <p className="text-sm font-bold text-[#111827] truncate">{event.text}</p>
                 <p className="text-xs text-[#6B7280] truncate">{event.detail}</p>
              </div>

              <div className="shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                 <Button variant="ghost" size="icon" className="h-8 w-8 text-[#9CA3AF]">
                    <MoreVertical className="w-4 h-4" />
                 </Button>
              </div>
           </div>
         ))}
      </Card>

      <div className="flex justify-center pt-4">
         <div className="flex items-center gap-2 text-[#6B7280] text-xs font-medium">
            <Clock className="w-4 h-4" />
            Showing events from last 24 hours
         </div>
      </div>
    </div>
  )
}
