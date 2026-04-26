"use client"

import React from "react"

const shortcuts = [
  { action: "Get Topology", keys: ["⌘", "T"] },
  { action: "Focus File / Function", keys: ["⌘", "F"] },
  { action: "Active Diff", keys: ["⌘", "D"] },
  { action: "Search References", keys: ["⌘", "R"] },
  { action: "Blur (Un-focus)", keys: ["⌘", "B"] },
  { action: "Show Active Lens", keys: ["⌘", "L"] },
  { action: "History", keys: ["⌘", "H"] },
  { action: "Toggle Sidebar", keys: ["⌘", "\\"] },
  { action: "Clear Terminal", keys: ["⌘", "K"] },
  { action: "Show Command Palette", keys: ["⌘", "P"] },
]

function KbdBadge({ children }: { children: React.ReactNode }) {
  return (
    <kbd className="bg-muted border border-border rounded-md px-2 py-1 text-xs font-mono font-bold text-foreground">
      {children}
    </kbd>
  )
}

export default function ShortcutsPage() {
  return (
    <div className="flex flex-col min-h-[calc(100vh-64px)] bg-background">
      <div className="p-8 flex-1 max-w-[1600px] mx-auto w-full space-y-6">
        {/* Header */}
        <div className="space-y-1">
          <h1 className="text-[28px] font-serif text-foreground">Keyboard Shortcuts</h1>
          <p className="text-sm text-muted-foreground font-serif italic">Speed up your workflow with these shortcuts.</p>
        </div>

        {/* Shortcuts Table */}
        <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden">
          <div className="grid grid-cols-2 px-5 py-3 border-b border-border bg-muted">
            <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Action</span>
            <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Shortcut</span>
          </div>

          {shortcuts.map((s, i) => (
            <div
              key={s.action}
              className="grid grid-cols-2 px-5 py-3.5 border-b border-border last:border-0 hover:bg-muted transition-colors"
            >
              <span className="text-sm text-foreground">{s.action}</span>
              <div className="flex items-center gap-1">
                {s.keys.map((k, ki) => (
                  <span key={ki} className="flex items-center gap-1">
                    <KbdBadge>{k}</KbdBadge>
                    {ki < s.keys.length - 1 && (
                      <span className="text-xs text-muted-foreground">+</span>
                    )}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Tip Card */}
        <div className="bg-[#F5F3FF] border border-[#DDD6FE] rounded-xl p-4">
          <p className="text-sm text-[#7C3AED]">
            💡 Shortcuts work in Claude Code when LoomMCP is connected.
          </p>
        </div>
      </div>
    </div>
  )
}
