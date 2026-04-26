"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { 
  LayoutDashboard, 
  Network, 
  Focus, 
  Diff, 
  Search, 
  EyeOff, 
  Zap, 
  History, 
  FileText, 
  Settings, 
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
  { name: "Active Diff", href: "/diff", icon: Diff, section: "TOOLS", subtitle: "Changes" },
  { name: "Search Refs", href: "/search", icon: Search, section: "TOOLS", subtitle: "Find References" },
  { name: "Blur", href: "/blur", icon: EyeOff, section: "TOOLS", subtitle: "Un-focus Files" },
  { name: "Active Lens", href: "/active-lens", icon: Zap, section: "SESSION", badge: "3 / 20" },
  { name: "History", href: "/history", icon: History, section: "SESSION" },
  { name: "Events", href: "/events", icon: FileText, section: "SESSION" },
  { name: "Settings", href: "/settings", icon: Settings, section: "HELP" },
  { name: "Shortcuts", href: "/shortcuts", icon: Keyboard, section: "HELP" },
  { name: "Docs", href: "/docs", icon: BookOpen, section: "HELP" },
]

export function Sidebar() {
  const pathname = usePathname()

  return (
    <div className="w-[260px] h-screen bg-white border-r border-[#E5E7EB] flex flex-col fixed left-0 top-0 z-40">
      <div className="p-6 flex items-center gap-3">
        <div className="w-10 h-10 bg-gradient-to-br from-[#7C3AED] to-[#9333EA] rounded-xl flex items-center justify-center shadow-lg shadow-purple-200 ring-4 ring-purple-50 transition-transform hover:scale-105 cursor-pointer">
          <Zap className="w-6 h-6 text-white fill-white drop-shadow-sm" />
        </div>
        <div className="flex flex-col">
          <span className="font-bold text-lg tracking-tight text-[#111827] leading-none">LoomMCP</span>
          <span className="text-[10px] text-[#6B7280] font-medium mt-1">Context Compiler</span>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto py-4 px-4 space-y-6">
        {["OVERVIEW", "TOOLS", "SESSION", "HELP"].map((section) => (
          <div key={section} className="space-y-1">
            <h3 className="text-[10px] font-bold text-[#9CA3AF] tracking-widest px-3 mb-2">{section}</h3>
            {navigation
              .filter((item) => item.section === section)
              .map((item) => {
                const isActive = pathname === item.href
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={cn(
                      "flex items-center justify-between px-3 py-2.5 rounded-xl transition-all duration-200 group",
                      isActive 
                        ? "sidebar-item-active text-[#7C3AED]" 
                        : "text-[#6B7280] hover:bg-[#F9FAFB] hover:text-[#111827]"
                    )}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className={cn(
                        "w-8 h-8 rounded-lg flex items-center justify-center transition-colors",
                        isActive ? "bg-white shadow-sm" : "bg-transparent group-hover:bg-white group-hover:shadow-sm"
                      )}>
                        <item.icon className={cn("w-4 h-4 shrink-0", isActive ? "text-[#7C3AED]" : "text-[#9CA3AF] group-hover:text-[#7C3AED]")} />
                      </div>
                      <div className="flex flex-col min-w-0">
                        <span className={cn("text-xs font-bold truncate", isActive ? "text-[#7C3AED]" : "text-[#4B5563]")}>{item.name}</span>
                        {item.subtitle && <span className="text-[9px] text-[#9CA3AF] font-medium truncate leading-none mt-0.5">{item.subtitle}</span>}
                      </div>
                    </div>
                    {item.badge && (
                      <span className="text-[10px] font-bold bg-[#7C3AED] text-white px-2 py-0.5 rounded-full shadow-sm">
                        {item.badge}
                      </span>
                    )}
                  </Link>
                )
              })}
          </div>
        ))}
      </div>

      <div className="p-4 mt-auto">
         <div className="bg-gradient-to-br from-[#F5F3FF] to-white p-4 rounded-2xl border border-[#DDD6FE] shadow-sm space-y-3 relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-2 opacity-5 group-hover:opacity-10 transition-opacity">
              <Zap className="w-12 h-12 text-[#7C3AED] fill-[#7C3AED]" />
            </div>
            <div className="flex items-center gap-2 relative z-10">
              <div className="w-6 h-6 rounded-lg bg-white shadow-sm flex items-center justify-center">
                <Info className="w-3.5 h-3.5 text-[#7C3AED]" />
              </div>
              <span className="text-[11px] font-bold text-[#111827]">Loom Tip</span>
            </div>
            <p className="text-[10px] text-[#6B7280] leading-relaxed relative z-10">
              Use <code className="bg-white/50 border border-purple-100 px-1 rounded font-mono">loom_focus</code> to only page in specific code signatures.
            </p>
            <Link href="/docs" className="text-[10px] font-bold text-[#7C3AED] flex items-center gap-1 relative z-10 hover:underline">
              Learn More <ChevronRight className="w-2.5 h-2.5" />
            </Link>
         </div>
      </div>
    </div>
  )
}
