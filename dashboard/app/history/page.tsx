"use client"

import { 
  History, 
  PlayCircle, 
  Search, 
  ChevronRight, 
  Calendar,
  Clock,
  Zap,
  FileCode,
  ArrowRight
} from "lucide-react"
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"

const pastSessions = [
  { id: '7f3a2b5c', date: 'Today, 2:35 PM', duration: '24m 18s', files: 3, tokensSaved: '142,391', status: 'Active' },
  { id: '9d2e1f8a', date: 'Yesterday, 10:12 AM', duration: '1h 12m', files: 12, tokensSaved: '842,901', status: 'Completed' },
  { id: '5c6d4e3f', date: 'Apr 24, 4:45 PM', duration: '45m 02s', files: 5, tokensSaved: '312,450', status: 'Completed' },
  { id: '2a1b3c4d', date: 'Apr 24, 1:20 PM', duration: '32m 15s', files: 2, tokensSaved: '124,000', status: 'Completed' },
  { id: '1a2b3c4d', date: 'Apr 23, 11:05 AM', duration: '2h 05m', files: 18, tokensSaved: '1,245,670', status: 'Completed' },
]

export default function HistoryPage() {
  return (
    <div className="p-8 max-w-[1600px] mx-auto space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight text-[#111827]">History</h1>
          <p className="text-[#6B7280]">View and replay past LoomMCP sessions.</p>
        </div>
        <div className="flex items-center gap-3">
           <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#9CA3AF]" />
              <Input placeholder="Search sessions..." className="pl-10 w-64 border-[#E5E7EB] h-10" />
           </div>
           <Button className="bg-[#7C3AED] hover:bg-[#6D28D9] font-bold">
             <Calendar className="w-4 h-4 mr-2" /> Filter by Date
           </Button>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-8">
        <div className="col-span-12 xl:col-span-9 space-y-6">
          <Card className="border-[#E5E7EB] shadow-sm overflow-hidden">
            <Table>
              <TableHeader className="bg-[#F9FAFB]">
                <TableRow className="border-b border-[#E5E7EB]">
                  <TableHead className="text-[10px] font-bold text-[#6B7280] uppercase tracking-wider px-6 py-4">Session ID</TableHead>
                  <TableHead className="text-[10px] font-bold text-[#6B7280] uppercase tracking-wider px-6 py-4">Date & Time</TableHead>
                  <TableHead className="text-[10px] font-bold text-[#6B7280] uppercase tracking-wider px-6 py-4">Duration</TableHead>
                  <TableHead className="text-[10px] font-bold text-[#6B7280] uppercase tracking-wider px-6 py-4">Files Touched</TableHead>
                  <TableHead className="text-[10px] font-bold text-[#6B7280] uppercase tracking-wider px-6 py-4">Tokens Saved</TableHead>
                  <TableHead className="text-[10px] font-bold text-[#6B7280] uppercase tracking-wider px-6 py-4 text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {pastSessions.map((session, i) => (
                  <TableRow key={i} className="group hover:bg-[#F9FAFB] border-b border-[#F3F4F6] last:border-0 cursor-pointer">
                    <TableCell className="px-6 py-4">
                       <span className="text-xs font-bold text-[#7C3AED] font-mono">{session.id}</span>
                    </TableCell>
                    <TableCell className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="text-xs font-bold text-[#111827]">{session.date}</span>
                        <span className="text-[10px] text-[#9CA3AF]">{session.status}</span>
                      </div>
                    </TableCell>
                    <TableCell className="px-6 py-4 text-xs text-[#6B7280] tabular-nums">{session.duration}</TableCell>
                    <TableCell className="px-6 py-4">
                       <div className="flex items-center gap-1.5">
                         <FileCode className="w-3.5 h-3.5 text-[#9CA3AF]" />
                         <span className="text-xs font-medium text-[#111827]">{session.files}</span>
                       </div>
                    </TableCell>
                    <TableCell className="px-6 py-4">
                       <div className="flex items-center gap-1.5">
                         <Zap className="w-3.5 h-3.5 text-[#16A34A]" />
                         <span className="text-xs font-bold text-[#16A34A]">{session.tokensSaved}</span>
                       </div>
                    </TableCell>
                    <TableCell className="px-6 py-4 text-right">
                       <Button variant="ghost" size="sm" className="text-[#7C3AED] hover:bg-[#F3F0FF] font-bold text-xs h-8 px-3">
                         <PlayCircle className="w-3.5 h-3.5 mr-2" /> Replay Session
                       </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>

          <div className="flex justify-center pt-4">
             <Button variant="outline" className="border-[#E5E7EB] text-[#6B7280]">Load More Sessions</Button>
          </div>
        </div>

        <div className="col-span-12 xl:col-span-3 space-y-8">
           <Card className="border-[#E5E7EB] shadow-sm">
              <CardHeader>
                <CardTitle className="text-sm font-semibold">Lifetime Impact</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                   <div className="space-y-1">
                      <p className="text-[10px] font-medium text-[#6B7280] uppercase tracking-wider">Total Sessions</p>
                      <p className="text-3xl font-bold text-[#111827]">142</p>
                   </div>
                   <div className="space-y-1">
                      <p className="text-[10px] font-medium text-[#6B7280] uppercase tracking-wider">Cumulative Tokens Saved</p>
                      <p className="text-3xl font-bold text-[#16A34A]">12.4M</p>
                   </div>
                   <div className="space-y-1">
                      <p className="text-[10px] font-medium text-[#6B7280] uppercase tracking-wider">Avg Reduction</p>
                      <p className="text-3xl font-bold text-[#7C3AED]">94.2%</p>
                   </div>
                </div>

                <div className="p-4 bg-[#F9FAFB] rounded-xl border border-[#E5E7EB] space-y-4">
                   <h3 className="text-xs font-bold text-[#111827]">Session Insights</h3>
                   <div className="space-y-3">
                      <div className="flex items-center gap-3">
                         <Clock className="w-4 h-4 text-[#3B82F6]" />
                         <span className="text-[11px] text-[#6B7280]">Avg session lasts 42m</span>
                      </div>
                      <div className="flex items-center gap-3">
                         <Zap className="w-4 h-4 text-[#F97316]" />
                         <span className="text-[11px] text-[#6B7280]">Most active: src/auth.ts</span>
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
