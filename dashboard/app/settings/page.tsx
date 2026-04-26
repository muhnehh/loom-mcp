"use client"

import React, { useState, useEffect } from "react"
import { Switch } from "@/components/ui/switch"
import { cn } from "@/lib/utils"

type SettingsTab = "general" | "performance" | "security" | "languages" | "advanced" | "about"

const navItems: { key: SettingsTab; label: string }[] = [
  { key: "general", label: "General" },
  { key: "performance", label: "Performance" },
  { key: "security", label: "Security" },
  { key: "languages", label: "Languages" },
  { key: "advanced", label: "Advanced" },
  { key: "about", label: "About" },
]

export default function SettingsPage() {
  const [tab, setTab] = useState<SettingsTab>("general")
  const [settings, setSettings] = useState<any>({
    workspaceRoot: "~/Projects/loom-mcp",
    maxDepth: 3,
    focusBudget: 20,
    autoRefresh: true,
  })

  useEffect(() => {
    fetch("http://localhost:2337/api/settings")
      .then((r) => r.json())
      .then((d) => setSettings((prev: any) => ({ ...prev, ...d })))
      .catch(() => {})
  }, [])

  return (
    <div className="flex flex-col min-h-[calc(100vh-64px)] bg-background">
      <div className="p-8 flex-1 max-w-[1600px] mx-auto w-full space-y-6">
        {/* Header */}
        <div className="space-y-1">
          <h1 className="text-2xl font-bold text-foreground">Settings</h1>
          <p className="text-sm text-muted-foreground">Configure LoomMCP to fit your workflow.</p>
        </div>

        <div className="flex gap-6 items-start">
          {/* Left Nav */}
          <div className="bg-card border border-border rounded-xl shadow-sm p-2 w-48 shrink-0">
            {navItems.map((item) => (
              <button
                key={item.key}
                onClick={() => setTab(item.key)}
                className={cn(
                  "w-full text-left px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                  tab === item.key
                    ? "bg-[#F5F3FF] text-[#7C3AED]"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted"
                )}
              >
                {item.label}
              </button>
            ))}
          </div>

          {/* Right Content */}
          <div className="flex-1 bg-card border border-border rounded-xl shadow-sm p-6">
            {tab === "general" && <GeneralTab settings={settings} setSettings={setSettings} />}
            {tab === "performance" && <PerformanceTab />}
            {tab === "security" && <SecurityTab />}
            {tab === "languages" && <LanguagesTab />}
            {tab === "advanced" && <AdvancedTab />}
            {tab === "about" && <AboutTab />}
          </div>
        </div>
      </div>
    </div>
  )
}

function SettingRow({ label, desc, children }: { label: string; desc: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between py-4 border-b border-border last:border-0">
      <div>
        <p className="text-sm font-semibold text-foreground">{label}</p>
        <p className="text-xs text-muted-foreground mt-0.5">{desc}</p>
      </div>
      <div className="ml-8 shrink-0">{children}</div>
    </div>
  )
}

function GeneralTab({ settings, setSettings }: { settings: any; setSettings: React.Dispatch<React.SetStateAction<any>> }) {
  const handleChangeRoot = () => {
    const newRoot = prompt("Enter new workspace root:", settings.workspaceRoot)
    if (newRoot) setSettings((prev: any) => ({ ...prev, workspaceRoot: newRoot }))
  }

  return (
    <div className="space-y-1">
      <h2 className="text-base font-semibold text-foreground mb-4">General Settings</h2>

      <SettingRow label="Workspace Root" desc={settings.workspaceRoot || "~/Projects/loom-mcp"}>
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={settings.workspaceRoot || "~/Projects/loom-mcp"}
            onChange={(e) => setSettings((prev: any) => ({ ...prev, workspaceRoot: e.target.value }))}
            className="w-48 px-3 py-1.5 text-sm border border-border rounded-lg outline-none focus:ring-2 focus:ring-[#7C3AED]/20 focus:border-[#7C3AED]"
          />
          <button
            onClick={handleChangeRoot}
            className="px-3 py-1.5 text-xs font-medium text-[#7C3AED] border border-border rounded-lg hover:bg-[#F5F3FF] transition-colors"
          >
            Change
          </button>
        </div>
      </SettingRow>

      <SettingRow label="Default Max Depth" desc="Maximum directory depth for topology scans">
        <input
          type="number"
          value={settings.maxDepth ?? 3}
          onChange={(e) => setSettings((prev: any) => ({ ...prev, maxDepth: parseInt(e.target.value) || 1 }))}
          className="w-16 px-2 py-1.5 text-sm border border-border rounded-lg outline-none focus:ring-2 focus:ring-[#7C3AED]/20 focus:border-[#7C3AED] text-center"
        />
      </SettingRow>

      <SettingRow label="Focus Budget Limit" desc="Maximum files that can be focused at once">
        <input
          type="number"
          value={settings.focusBudget ?? 20}
          onChange={(e) => setSettings((prev: any) => ({ ...prev, focusBudget: parseInt(e.target.value) || 1 }))}
          className="w-16 px-2 py-1.5 text-sm border border-border rounded-lg outline-none focus:ring-2 focus:ring-[#7C3AED]/20 focus:border-[#7C3AED] text-center"
        />
      </SettingRow>

      <SettingRow label="Auto-refresh AST cache" desc="Automatically refresh AST cache on file changes">
        <Switch
          checked={settings.autoRefresh ?? true}
          onCheckedChange={(checked) => setSettings((prev: any) => ({ ...prev, autoRefresh: checked }))}
        />
      </SettingRow>

      <SettingRow label="Theme" desc="Choose your preferred theme">
        <select className="px-3 py-1.5 text-sm border border-border rounded-lg bg-card outline-none focus:ring-2 focus:ring-[#7C3AED]/20 focus:border-[#7C3AED]">
          <option value="light">Light</option>
          <option value="dark">Dark</option>
          <option value="system">System</option>
        </select>
      </SettingRow>
    </div>
  )
}

function PerformanceTab() {
  return (
    <div className="space-y-1">
      <h2 className="text-base font-semibold text-foreground mb-4">Performance</h2>

      <SettingRow label="Cache Size" desc="Maximum cache size in MB">
        <input
          type="range"
          min={100}
          max={2000}
          defaultValue={500}
          className="w-40 accent-[#7C3AED]"
        />
      </SettingRow>

      <SettingRow label="Index Parallelism" desc="Number of parallel indexing threads">
        <select defaultValue="4" className="px-3 py-1.5 text-sm border border-border rounded-lg bg-card outline-none focus:ring-2 focus:ring-[#7C3AED]/20 focus:border-[#7C3AED]">
          <option value="1">1 thread</option>
          <option value="2">2 threads</option>
          <option value="4">4 threads</option>
          <option value="8">8 threads</option>
        </select>
      </SettingRow>
    </div>
  )
}

function SecurityTab() {
  return (
    <div className="space-y-1">
      <h2 className="text-base font-semibold text-foreground mb-4">Security</h2>

      <SettingRow label="Path Traversal Protection" desc="Block access to files outside allowed directories">
        <Switch defaultChecked />
      </SettingRow>

      <div className="py-4">
        <p className="text-sm font-semibold text-foreground mb-1">Allowed Directories</p>
        <p className="text-xs text-muted-foreground mb-2">One directory per line</p>
        <textarea
          className="w-full px-3 py-2 text-sm border border-border rounded-lg outline-none focus:ring-2 focus:ring-[#7C3AED]/20 focus:border-[#7C3AED] font-mono resize-y min-h-[100px]"
          defaultValue={"~/Projects\n/tmp"}
        />
      </div>
    </div>
  )
}

function LanguagesTab() {
  const langs = ["TypeScript", "JavaScript", "Python", "Rust", "Go", "Java", "C#"]
  const defaultOn = new Set(["TypeScript", "JavaScript", "Python"])

  return (
    <div className="space-y-1">
      <h2 className="text-base font-semibold text-foreground mb-4">Languages</h2>
      {langs.map((lang) => (
        <div key={lang} className="flex items-center justify-between py-3 border-b border-border last:border-0">
          <p className="text-sm font-medium text-foreground">{lang}</p>
          <input
            type="checkbox"
            defaultChecked={defaultOn.has(lang)}
            className="w-4 h-4 rounded accent-[#7C3AED] cursor-pointer"
          />
        </div>
      ))}
    </div>
  )
}

function AdvancedTab() {
  return (
    <div className="space-y-1">
      <h2 className="text-base font-semibold text-foreground mb-4">Advanced</h2>

      <SettingRow label="Debug Mode" desc="Enable verbose debug logging">
        <Switch />
      </SettingRow>

      <SettingRow label="Log Level" desc="Minimum log level to record">
        <select defaultValue="info" className="px-3 py-1.5 text-sm border border-border rounded-lg bg-card outline-none focus:ring-2 focus:ring-[#7C3AED]/20 focus:border-[#7C3AED]">
          <option value="error">Error</option>
          <option value="warn">Warn</option>
          <option value="info">Info</option>
          <option value="debug">Debug</option>
        </select>
      </SettingRow>
    </div>
  )
}

function AboutTab() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col items-center py-6 gap-3">
        <div className="w-16 h-16 bg-[#F5F3FF] rounded-2xl flex items-center justify-center">
          <span className="text-2xl font-bold text-[#7C3AED]">L</span>
        </div>
        <div className="text-center">
          <p className="text-lg font-bold text-foreground">LoomMCP v0.1.0</p>
          <p className="text-sm text-muted-foreground">Context Compiler for Coding Agents</p>
        </div>
      </div>

      <div className="flex justify-center gap-4">
        <a
          href="https://github.com/loommcp/loommcp"
          target="_blank"
          rel="noopener noreferrer"
          className="px-4 py-2 text-sm font-medium text-[#7C3AED] border border-border rounded-lg hover:bg-[#F5F3FF] transition-colors"
        >
          GitHub
        </a>
        <a
          href="https://loommcp.dev/docs"
          target="_blank"
          rel="noopener noreferrer"
          className="px-4 py-2 text-sm font-medium text-[#7C3AED] border border-border rounded-lg hover:bg-[#F5F3FF] transition-colors"
        >
          Docs
        </a>
        <a
          href="https://loommcp.dev/support"
          target="_blank"
          rel="noopener noreferrer"
          className="px-4 py-2 text-sm font-medium text-[#7C3AED] border border-border rounded-lg hover:bg-[#F5F3FF] transition-colors"
        >
          Support
        </a>
      </div>
    </div>
  )
}
