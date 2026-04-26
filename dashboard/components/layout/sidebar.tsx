"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  LayoutDashboard,
  Network,
  Focus,
  GitBranch,
  Search,
  EyeOff,
  Zap,
  History,
  FileText,
  Keyboard,
  BookOpen,
  ChevronRight,
  Info
} from "lucide-react"
import { cn } from "@/lib/utils"

const navigation = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard, section: "OVERVIEW" },
  { name: "Get Topology", href: "/topology", icon: Network, section: "TOOLS", subtitle: "AST Skeleton" },
  { name: "Focus", href: "/focus", icon: Focus, section: "TOOLS", subtitle: "Page in Code" },
  { name: "Active Diff", href: "/diff", icon: GitBranch, section: "TOOLS", subtitle: "Changes" },
  { name: "Search Refs", href: "/search", icon: Search, section: "TOOLS", subtitle: "Find References" },
  { name: "Blur", href: "/blur", icon: EyeOff, section: "TOOLS", subtitle: "Un-focus Files" },
  { name: "Active Lens", href: "/active-lens", icon: Zap, section: "SESSION", badge: "3 / 20" },
  { name: "History", href: "/history", icon: History, section: "SESSION" },
  { name: "Events", href: "/events", icon: FileText, section: "SESSION" },
  { name: "Docs", href: "/docs", icon: BookOpen, section: "HELP" },
  { name: "Keyboard Shortcuts", href: "/shortcuts", icon: Keyboard, section: "HELP" },
]

export function Sidebar() {
  const pathname = usePathname()

  return (
    <div className="w-[260px] h-screen bg-background border-r border-border flex flex-col fixed left-0 top-0 z-40">
      {/* Logo Area */}
      <div className="p-5 flex items-center gap-3 border-b border-border">
        <div className="w-8 h-8 bg-gradient-to-br from-[#7C3AED] to-[#9333EA] rounded-lg flex items-center justify-center shrink-0">
          <Zap className="w-4 h-4 text-white fill-white" />
        </div>
        <div className="flex flex-col min-w-0">
          <span className="font-bold text-base text-foreground leading-none">LoomMCP</span>
          <span className="text-[10px] text-muted-foreground font-medium mt-0.5 leading-none truncate">
            Context Compiler for Coding Agents
          </span>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex-1 overflow-y-auto py-4 px-3 space-y-5">
        {["OVERVIEW", "TOOLS", "SESSION", "HELP"].map((section) => (
          <div key={section} className="space-y-0.5">
            <h3 className="text-[10px] font-bold text-muted-foreground tracking-widest px-3 mb-2 uppercase">
              {section}
            </h3>
            {navigation
              .filter((item) => item.section === section)
              .map((item) => {
                const isActive = pathname === item.href
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={cn(
                      "flex items-center justify-between px-3 py-2 rounded-xl transition-all duration-200 group",
                      isActive
                        ? "bg-[#F5F3FF] text-[#7C3AED] dark:bg-[#3b0764] dark:text-[#c084fc]"
                        : "text-muted-foreground hover:bg-muted hover:text-foreground"
                    )}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className={cn(
                        "w-7 h-7 rounded-lg flex items-center justify-center transition-colors shrink-0",
                        isActive
                          ? "bg-white dark:bg-white/10 shadow-sm"
                          : "bg-transparent group-hover:bg-background group-hover:shadow-sm"
                      )}>
                        <item.icon className={cn(
                          "w-3.5 h-3.5 shrink-0",
                          isActive ? "text-[#7C3AED] dark:text-[#c084fc]" : "text-muted-foreground group-hover:text-[#7C3AED]"
                        )} />
                      </div>
                      <div className="flex flex-col min-w-0">
                        <span className={cn(
                          "text-[12px] font-semibold truncate leading-none",
                          isActive ? "text-[#7C3AED] dark:text-[#c084fc]" : "text-foreground"
                        )}>
                          {item.name}
                        </span>
                        {item.subtitle && (
                          <span className="text-[10px] text-muted-foreground font-medium truncate leading-none mt-0.5">
                            {item.subtitle}
                          </span>
                        )}
                      </div>
                    </div>
                    {item.badge && (
                      <span className="text-[10px] font-bold bg-[#7C3AED] text-white px-2 py-0.5 rounded-full shrink-0">
                        {item.badge}
                      </span>
                    )}
                  </Link>
                )
              })}
          </div>
        ))}
      </div>

      {/* Tip Card */}
      <div className="px-3 pb-3">
        <div className="bg-[#F5F3FF] dark:bg-[#3b0764]/50 border border-[#DDD6FE] dark:border-[#7c3aed]/30 rounded-xl p-3 space-y-2">
          <div className="flex items-center gap-2">
            <Info className="w-3.5 h-3.5 text-[#7C3AED] shrink-0" />
            <span className="text-[11px] font-bold text-foreground">Loom Tip</span>
          </div>
          <p className="text-[10px] text-muted-foreground leading-relaxed">
            Start with Get Topology to understand your codebase structure with minimal tokens.
          </p>
          <Link
            href="/docs"
            className="text-[10px] font-bold text-[#7C3AED] flex items-center gap-1 hover:underline"
          >
            Learn More <ChevronRight className="w-2.5 h-2.5" />
          </Link>
        </div>
      </div>

      {/* Footer Bar */}
      <div className="h-10 bg-muted border-t border-border px-4 flex items-center gap-2">
        <span className="text-[10px] font-bold text-muted-foreground">LoomMCP v0.1.0</span>
        <div className="w-1.5 h-1.5 rounded-full bg-[#10B981] shrink-0" />
        <span className="text-[10px] font-medium text-muted-foreground">All systems operational</span>
      </div>
    </div>
  )
}
