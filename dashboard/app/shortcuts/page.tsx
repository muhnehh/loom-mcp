"use client"

import { 
  Keyboard, 
  Command, 
  Search, 
  Zap, 
  LayoutDashboard,
  Focus,
  Network,
  History,
  FileText,
  MousePointer2
} from "lucide-react"
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"

const shortcuts = [
  { name: 'Command Palette', keys: ['Ctrl', 'K'], icon: Command },
  { name: 'Quick Topology', keys: ['Ctrl', 'T'], icon: Network },
  { name: 'Search Symbols', keys: ['Ctrl', 'Shift', 'F'], icon: Search },
  { name: 'Dashboard', keys: ['G', 'D'], icon: LayoutDashboard },
  { name: 'Active Lens', keys: ['G', 'L'], icon: Zap },
  { name: 'History', keys: ['G', 'H'], icon: History },
  { name: 'Events', keys: ['G', 'E'], icon: FileText },
  { name: 'Focus Symbol', keys: ['F'], icon: Focus },
  { name: 'Blur File', keys: ['B'], icon: MousePointer2 },
]

export default function ShortcutsPage() {
  return (
    <div className="p-8 max-w-[1200px] mx-auto space-y-8">
      {/* Header */}
      <div className="space-y-1">
        <h1 className="text-3xl font-bold tracking-tight text-[#111827]">Shortcuts</h1>
        <p className="text-[#6B7280]">Master LoomMCP with powerful keyboard shortcuts.</p>
      </div>

      <div className="grid grid-cols-2 gap-8">
         <Card className="border-[#E5E7EB] shadow-sm col-span-2">
            <CardHeader className="bg-[#F9FAFB] border-b border-[#E5E7EB]">
               <CardTitle className="text-sm font-semibold">Global Shortcuts</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
               <div className="grid grid-cols-2 divide-x divide-[#F3F4F6]">
                  <div className="divide-y divide-[#F3F4F6]">
                     {shortcuts.slice(0, 5).map((s) => (
                       <div key={s.name} className="flex items-center justify-between px-8 py-4 hover:bg-[#F9FAFB] transition-colors">
                          <div className="flex items-center gap-4">
                             <s.icon className="w-4 h-4 text-[#9CA3AF]" />
                             <span className="text-sm font-medium text-[#111827]">{s.name}</span>
                          </div>
                          <div className="flex gap-1">
                             {s.keys.map((k) => (
                               <kbd key={k} className="px-2 py-1 bg-white border border-[#E5E7EB] rounded text-[10px] font-bold text-[#6B7280] shadow-sm">{k}</kbd>
                             ))}
                          </div>
                       </div>
                     ))}
                  </div>
                  <div className="divide-y divide-[#F3F4F6]">
                     {shortcuts.slice(5).map((s) => (
                       <div key={s.name} className="flex items-center justify-between px-8 py-4 hover:bg-[#F9FAFB] transition-colors">
                          <div className="flex items-center gap-4">
                             <s.icon className="w-4 h-4 text-[#9CA3AF]" />
                             <span className="text-sm font-medium text-[#111827]">{s.name}</span>
                          </div>
                          <div className="flex gap-1">
                             {s.keys.map((k) => (
                               <kbd key={k} className="px-2 py-1 bg-white border border-[#E5E7EB] rounded text-[10px] font-bold text-[#6B7280] shadow-sm">{k}</kbd>
                             ))}
                          </div>
                       </div>
                     ))}
                  </div>
               </div>
            </CardContent>
         </Card>

         <Card className="border-[#E5E7EB] shadow-sm">
            <CardHeader>
               <CardTitle className="text-sm font-semibold">Vim-style Navigation</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
               <p className="text-xs text-[#6B7280]">LoomMCP supports standard Vim navigation in focus views and diffs.</p>
               <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center justify-between p-3 bg-[#F9FAFB] rounded-lg border border-[#E5E7EB]">
                     <span className="text-xs font-medium">Scroll Down</span>
                     <kbd className="px-2 py-1 bg-white border border-[#E5E7EB] rounded text-[10px] font-bold">j</kbd>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-[#F9FAFB] rounded-lg border border-[#E5E7EB]">
                     <span className="text-xs font-medium">Scroll Up</span>
                     <kbd className="px-2 py-1 bg-white border border-[#E5E7EB] rounded text-[10px] font-bold">k</kbd>
                  </div>
               </div>
            </CardContent>
         </Card>

         <Card className="border-[#E5E7EB] shadow-sm">
            <CardHeader>
               <CardTitle className="text-sm font-semibold">Customizing Shortcuts</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
               <p className="text-xs text-[#6B7280]">You can remap any shortcut in the advanced settings tab.</p>
               <Button variant="outline" className="w-full border-[#E5E7EB] text-[#7C3AED] font-bold h-10">Go to Settings</Button>
            </CardContent>
         </Card>
      </div>
    </div>
  )
}
