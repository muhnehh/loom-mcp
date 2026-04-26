"use client"

import { 
  Settings, 
  ChevronDown, 
  Search,
  Bell,
  Sun,
  Monitor
} from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"

export function Navbar() {
  return (
    <header className="h-16 bg-white border-b border-[#F3F4F6] sticky top-0 z-30 px-8 flex items-center justify-between shadow-[0_1px_2px_rgba(0,0,0,0.02)]">
      <div className="flex-1 flex items-center gap-4">
        <div className="bg-[#ECFDF5] text-[#10B981] px-3 py-1.5 rounded-full text-[11px] font-bold flex items-center gap-2 border border-[#D1FAE5] shadow-sm">
          <div className="w-2 h-2 bg-[#10B981] rounded-full animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
          Connected to Claude Code
        </div>
      </div>

      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2 mr-2">
          <div className="flex items-center gap-2 bg-[#F9FAFB] border border-[#E5E7EB] px-3 py-1.5 rounded-xl cursor-pointer hover:bg-white hover:border-[#7C3AED] hover:shadow-sm transition-all group">
            <Monitor className="w-4 h-4 text-[#9CA3AF] group-hover:text-[#7C3AED]" />
            <div className="flex flex-col">
              <span className="text-[9px] font-bold text-[#9CA3AF] leading-none uppercase tracking-tight">Workspace</span>
              <span className="text-xs font-bold text-[#111827]">~/Projects/loom-mcp</span>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-[#9CA3AF] ml-1" />
          </div>
        </div>

        <div className="h-8 w-px bg-[#F3F4F6]" />

        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" className="h-10 w-10 text-[#6B7280] hover:text-[#111827] hover:bg-[#F9FAFB] rounded-xl transition-all">
            <Settings className="w-5 h-5" />
          </Button>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="flex items-center gap-2 px-3 h-10 text-[#6B7280] hover:bg-[#F9FAFB] rounded-xl border border-transparent hover:border-[#E5E7EB] transition-all">
                <Sun className="w-4 h-4" />
                <span className="text-xs font-bold">Light</span>
                <ChevronDown className="w-3.5 h-3.5 text-[#9CA3AF]" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-40 p-1 rounded-xl shadow-xl border-[#F3F4F6]">
              <DropdownMenuItem className="text-xs font-bold rounded-lg cursor-pointer">Light</DropdownMenuItem>
              <DropdownMenuItem className="text-xs font-bold rounded-lg cursor-pointer">Dark</DropdownMenuItem>
              <DropdownMenuItem className="text-xs font-bold rounded-lg cursor-pointer">System</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <div className="relative group cursor-pointer">
            <Avatar className="w-10 h-10 border-2 border-white shadow-sm ring-1 ring-[#E5E7EB] group-hover:ring-[#7C3AED] transition-all rounded-xl">
              <AvatarImage src="https://github.com/muhnehh.png" className="rounded-xl" />
              <AvatarFallback className="rounded-xl">MM</AvatarFallback>
            </Avatar>
            <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-[#10B981] border-2 border-white rounded-full" />
          </div>
        </div>
      </div>
    </header>
  )
}
