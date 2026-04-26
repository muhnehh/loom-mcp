"use client"

import React, { useState, useEffect, useRef, useCallback } from "react"
import { Search, Network, Focus, GitBranch, EyeOff } from "lucide-react"
import { useRouter } from "next/navigation"
import { cn } from "@/lib/utils"

interface CommandItem {
  name: string
  desc: string
  shortcut: string
  icon: React.ReactNode
  iconBg: string
  href: string
}

const actions: CommandItem[] = [
  {
    name: "Get Topology",
    desc: "View AST skeleton of your codebase",
    shortcut: "⌘ T",
    icon: <Network className="w-4 h-4" />,
    iconBg: "bg-[#F5F3FF] text-[#7C3AED]",
    href: "/topology",
  },
  {
    name: "Focus",
    desc: "Page in full file implementation",
    shortcut: "⌘ F",
    icon: <Focus className="w-4 h-4" />,
    iconBg: "bg-[#EFF6FF] text-[#3B82F6]",
    href: "/focus",
  },
  {
    name: "Active Diff",
    desc: "See session changes vs last commit",
    shortcut: "⌘ D",
    icon: <GitBranch className="w-4 h-4" />,
    iconBg: "bg-[#FFF7ED] text-[#F97316]",
    href: "/diff",
  },
  {
    name: "Search References",
    desc: "AST-aware find references",
    shortcut: "⌘ R",
    icon: <Search className="w-4 h-4" />,
    iconBg: "bg-[#ECFDF5] text-[#10B981]",
    href: "/search",
  },
  {
    name: "Blur Files",
    desc: "Remove files from active focus",
    shortcut: "⌘ B",
    icon: <EyeOff className="w-4 h-4" />,
    iconBg: "bg-[#EEF2FF] text-[#6366F1]",
    href: "/blur",
  },
]

const recentCommands = [
  { text: "Get Topology: src/...", ago: "3m ago" },
  { text: "Focus: src/auth.ts::loginUser", ago: "5m ago" },
  { text: "Blur: src/middleware.ts", ago: "8m ago" },
]

function KbdBadge({ children }: { children: React.ReactNode }) {
  return (
    <kbd className="bg-[#F3F4F6] border border-[#E5E7EB] rounded px-1.5 py-0.5 text-[11px] font-mono font-bold text-[#6B7280]">
      {children}
    </kbd>
  )
}

export function CommandPalette() {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState("")
  const [selected, setSelected] = useState(0)
  const router = useRouter()
  const inputRef = useRef<HTMLInputElement>(null)

  const filteredActions = query
    ? actions.filter((a) => a.name.toLowerCase().includes(query.toLowerCase()) || a.desc.toLowerCase().includes(query.toLowerCase()))
    : actions

  const totalItems = filteredActions.length

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault()
        setOpen((o) => !o)
        setQuery("")
        setSelected(0)
      }
      if (e.key === "Escape") {
        setOpen(false)
      }
    },
    []
  )

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [handleKeyDown])

  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 50)
    }
  }, [open])

  const handleModalKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault()
      setSelected((s) => Math.min(s + 1, totalItems - 1))
    } else if (e.key === "ArrowUp") {
      e.preventDefault()
      setSelected((s) => Math.max(s - 1, 0))
    } else if (e.key === "Enter") {
      const item = filteredActions[selected]
      if (item) {
        setOpen(false)
        router.push(item.href)
      }
    }
  }

  if (!open) return null

  return (
    <div
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-start justify-center"
      onClick={() => setOpen(false)}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl w-[560px] mx-auto mt-[15vh] overflow-hidden border border-[#E5E7EB]"
        onClick={(e) => e.stopPropagation()}
        onKeyDown={handleModalKeyDown}
      >
        {/* Search Input */}
        <div className="flex items-center gap-3 px-4 py-3 border-b border-[#E5E7EB]">
          <Search className="w-4 h-4 text-[#9CA3AF] shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value)
              setSelected(0)
            }}
            placeholder="Type a command or search..."
            className="flex-1 text-sm text-[#111827] outline-none placeholder:text-[#9CA3AF]"
          />
          <KbdBadge>⌘ P</KbdBadge>
        </div>

        {/* Actions Section */}
        <div>
          <p className="px-4 py-2 text-[10px] uppercase font-bold tracking-wider text-[#9CA3AF]">Actions</p>
          {filteredActions.map((item, i) => (
            <button
              key={item.name}
              onClick={() => {
                setOpen(false)
                router.push(item.href)
              }}
              className={cn(
                "w-full px-4 py-2.5 flex items-center gap-3 cursor-pointer transition-colors",
                selected === i ? "bg-[#F5F3FF]" : "hover:bg-[#F9FAFB]"
              )}
              onMouseEnter={() => setSelected(i)}
            >
              <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center shrink-0", item.iconBg)}>
                {item.icon}
              </div>
              <div className="flex-1 min-w-0 text-left">
                <p className="text-sm font-medium text-[#111827]">{item.name}</p>
                <p className="text-xs text-[#6B7280] truncate">{item.desc}</p>
              </div>
              <KbdBadge>{item.shortcut}</KbdBadge>
            </button>
          ))}
        </div>

        {/* Recent Commands */}
        {!query && (
          <div className="border-t border-[#E5E7EB]">
            <p className="px-4 py-2 text-[10px] uppercase font-bold tracking-wider text-[#9CA3AF]">Recent Commands</p>
            {recentCommands.map((cmd, i) => (
              <div key={i} className="px-4 py-2.5 flex items-center justify-between hover:bg-[#F9FAFB] cursor-pointer">
                <p className="text-sm text-[#6B7280] truncate">{cmd.text}</p>
                <span className="text-xs text-[#9CA3AF] shrink-0 ml-3">{cmd.ago}</span>
              </div>
            ))}
          </div>
        )}

        {/* Footer */}
        <div className="border-t border-[#E5E7EB] px-4 py-3 text-[10px] text-[#9CA3AF] text-center">
          ↑↓ to navigate&nbsp;&nbsp;Enter to select&nbsp;&nbsp;Esc to close
        </div>
      </div>
    </div>
  )
}
