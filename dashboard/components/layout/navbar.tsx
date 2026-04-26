"use client"

import {
  Settings,
  ChevronDown,
  Sun,
  Moon,
  Folder,
  Check
} from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { useTheme } from "@/components/theme-provider"

export function Navbar() {
  const { theme, setTheme, resolvedTheme } = useTheme()

  return (
    <header className="h-16 bg-background border-b border-border sticky top-0 z-30 flex items-center justify-between shadow-[0_1px_2px_rgba(0,0,0,0.02)]">
      {/* Left spacer */}
      <div className="flex-1" />

      {/* Center: Connected pill */}
      <div className="flex items-center justify-center">
        <div className="bg-[#ECFDF5] text-[#10B981] border border-[#D1FAE5] rounded-full px-3 py-1.5 text-xs font-bold flex items-center gap-2">
          <div className="w-2 h-2 bg-[#10B981] rounded-full animate-pulse" />
          Connected to Claude Code
        </div>
      </div>

      {/* Right side controls */}
      <div className="flex-1 flex items-center justify-end gap-3 pr-6">
        {/* Workspace pill */}
        <div className="flex items-center gap-2 bg-muted border border-border px-3 py-1.5 rounded-xl cursor-pointer hover:bg-background hover:border-border transition-all">
          <Folder className="w-3.5 h-3.5 text-muted-foreground" />
          <div className="flex flex-col">
            <span className="text-[9px] font-bold text-muted-foreground leading-none uppercase tracking-tight">
              Workspace
            </span>
            <span className="text-[12px] font-semibold text-foreground leading-none mt-0.5">
              ~/Projects/loom-mcp
            </span>
          </div>
          <ChevronDown className="w-3.5 h-3.5 text-muted-foreground ml-1" />
        </div>

        {/* Settings icon */}
        <Button
          variant="ghost"
          size="icon"
          className="h-9 w-9 text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg transition-all"
        >
          <Settings className="w-4 h-4" />
        </Button>

        {/* Theme dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              className="flex items-center gap-1.5 px-3 h-9 text-muted-foreground hover:bg-muted rounded-lg border border-border transition-all"
            >
              {resolvedTheme === "dark" ? <Moon className="w-3.5 h-3.5" /> : <Sun className="w-3.5 h-3.5" />}
              <span className="text-xs font-semibold capitalize">{theme}</span>
              <ChevronDown className="w-3 h-3 text-muted-foreground" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-36 p-1 rounded-xl shadow-xl border-border">
            <DropdownMenuItem
              className="text-xs font-semibold rounded-lg cursor-pointer flex items-center"
              onClick={() => setTheme("light")}
            >
              {theme === "light" && <Check className="w-3 h-3 mr-2" />}
              {theme !== "light" && <span className="w-3 h-3 mr-2" />}
              Light
            </DropdownMenuItem>
            <DropdownMenuItem
              className="text-xs font-semibold rounded-lg cursor-pointer flex items-center"
              onClick={() => setTheme("dark")}
            >
              {theme === "dark" && <Check className="w-3 h-3 mr-2" />}
              {theme !== "dark" && <span className="w-3 h-3 mr-2" />}
              Dark
            </DropdownMenuItem>
            <DropdownMenuItem
              className="text-xs font-semibold rounded-lg cursor-pointer flex items-center"
              onClick={() => setTheme("system")}
            >
              {theme === "system" && <Check className="w-3 h-3 mr-2" />}
              {theme !== "system" && <span className="w-3 h-3 mr-2" />}
              System
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* User avatar */}
        <div className="w-8 h-8 rounded-full bg-[#7C3AED] flex items-center justify-center cursor-pointer shrink-0">
          <span className="text-[11px] font-bold text-white">M</span>
        </div>
      </div>
    </header>
  )
}
