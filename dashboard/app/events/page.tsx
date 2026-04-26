"use client"

import React, { useState, useEffect, useRef } from "react"
import { SlidersHorizontal, Database, FileText, Eye, Shield, Zap, Network, Search, GitBranch } from "lucide-react"
import { cn } from "@/lib/utils"

interface EventItem {
  category: string
  message: string
  time: string
  tool?: string
  duration?: number
}

function getCategory(tool: string): string {
  if (tool === "loom_focus" || tool === "loom_blur") return "focus"
  if (tool === "loom_get_topology" || tool === "loom_bm25_search" || tool === "loom_fuzzy_search" || tool === "loom_hybrid_search" || tool === "loom_semantic_search") return "cache"
  if (tool === "loom_enforce_hook" || tool === "loom_get_confidence") return "security"
  if (tool === "loom_remember" || tool === "loom_recall" || tool === "loom_get_sessions" || tool === "loom_session_compress") return "session"
  if (tool === "loom_search_refs" || tool === "loom_search_symbols" || tool === "loom_get_symbol") return "cache"
  return "system"
}

function getMessage(tool: string, args: Record<string, unknown>, result: Record<string, unknown>, duration: number): string {
  switch (tool) {
    case "loom_focus":
      return `File Focused • ${String(args?.target || "unknown")} focused in ${duration}ms`
    case "loom_blur":
      return `File Un-focused • ${String(args?.target || "unknown")} removed from lens`
    case "loom_get_topology":
      return `Topology Scanned • ${String((result as any)?.filesScanned || 0)} files, ${String((result as any)?.totalTokens || 0)} tokens (${duration}ms)`
    case "loom_search_refs":
      return `Search Refs • "${String(args?.symbol || "")}" — ${String((result as any)?.count || 0)} references found`
    case "loom_search_symbols":
      return `Symbol Search • "${String(args?.query || "")}" completed in ${duration}ms`
    case "loom_get_symbol":
      return `Symbol Retrieved • ${String(args?.symbol || "unknown")} fetched in ${duration}ms`
    case "loom_find_importers":
      return `Importers Found • ${String(args?.symbol || "unknown")} — reverse dep trace`
    case "loom_blast_radius":
      return `Blast Radius • Analyzed impact of ${String(args?.symbol || "unknown")}`
    case "loom_hybrid_search":
      return `Hybrid Search • "${String(args?.query || "")}" (keyword + semantic) in ${duration}ms`
    case "loom_remember":
      return `Memory Saved • Cross-session insight stored`
    case "loom_recall":
      return `Memory Retrieved • Session context loaded`
    case "loom_session_compress":
      return `Session Compressed • Task-aware context reduction applied`
    case "loom_diff_compress":
      return `Diff Compressed • Git diff reduced for context`
    case "loom_get_active_diff":
      return `Active Diff • Session changes retrieved`
    case "loom_enforce_hook":
      return `Hook Enforced • ${String(args?.hook || "PreToolUse")} rule applied`
    case "loom_get_metrics":
      return `Metrics Retrieved • Session analytics loaded`
    case "loom_bm25_search":
      return `BM25 Search • "${String(args?.query || "")}" ranked in ${duration}ms`
    case "loom_fuzzy_search":
      return `Fuzzy Search • "${String(args?.query || "")}" (typo-tolerant)`
    case "loom_find_dead_code":
      return `Dead Code Scan • Unused symbol detection complete`
    case "loom_pagerank_centrality":
      return `PageRank • Architectural importance scored`
    case "loom_semantic_search":
      return `Semantic Search • GPU embeddings queried`
    default:
      return `${tool.replace("loom_", "").replace(/_/g, " ")} • completed in ${duration}ms`
  }
}

const categoryStyle: Record<string, { bg: string; darkBg: string; text: string; icon: React.ReactNode }> = {
  cache: {
    bg: "bg-[#EFF6FF]",
    darkBg: "dark:bg-blue-900/30",
    text: "text-[#3B82F6]",
    icon: <Database className="w-3.5 h-3.5" />,
  },
  file: {
    bg: "bg-[#FFF7ED]",
    darkBg: "dark:bg-orange-900/30",
    text: "text-[#F97316]",
    icon: <FileText className="w-3.5 h-3.5" />,
  },
  focus: {
    bg: "bg-[#ECFDF5]",
    darkBg: "dark:bg-green-900/30",
    text: "text-[#10B981]",
    icon: <Eye className="w-3.5 h-3.5" />,
  },
  security: {
    bg: "bg-[#FEF2F2]",
    darkBg: "dark:bg-red-900/30",
    text: "text-[#EF4444]",
    icon: <Shield className="w-3.5 h-3.5" />,
  },
  session: {
    bg: "bg-[#F5F3FF]",
    darkBg: "dark:bg-purple-900/30",
    text: "text-[#7C3AED]",
    icon: <Zap className="w-3.5 h-3.5" />,
  },
  system: {
    bg: "bg-[#F9FAFB]",
    darkBg: "dark:bg-gray-800/50",
    text: "text-[#6B7280]",
    icon: <Network className="w-3.5 h-3.5" />,
  },
}

const filterTabs = ["All Events", "File Watcher", "Cache", "Security", "System"]

// Initial static events shown before real data arrives
const initialEvents: EventItem[] = [
  { category: "session", message: "Dashboard loaded • Waiting for MCP tool calls from Claude", time: new Date().toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", second: "2-digit", hour12: true }) },
]

export default function EventsPage() {
  const [events, setEvents] = useState<EventItem[]>(initialEvents)
  const [activeFilter, setActiveFilter] = useState("All Events")
  const [connected, setConnected] = useState(false)
  const esRef = useRef<EventSource | null>(null)

  useEffect(() => {
    // Load existing events from history endpoint
    fetch("http://localhost:2337/api/events")
      .then(r => r.json())
      .then((data: Array<{tool: string; args: Record<string, unknown>; result: Record<string, unknown>; timestamp: number; duration: number; category?: string; message?: string}>) => {
        if (Array.isArray(data) && data.length > 0) {
          const mapped: EventItem[] = data.slice(0, 50).map(c => ({
            category: c.category || getCategory(c.tool),
            message: c.message || getMessage(c.tool, c.args || {}, c.result || {}, c.duration),
            time: new Date(c.timestamp).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", second: "2-digit", hour12: true }),
            tool: c.tool,
            duration: c.duration,
          }))
          setEvents(mapped)
        }
      })
      .catch(() => {})

    // Connect to SSE for live events
    const es = new EventSource("http://localhost:2337/events")
    esRef.current = es

    es.onopen = () => setConnected(true)
    es.onerror = () => setConnected(false)

    es.onmessage = (e) => {
      try {
        const data = JSON.parse(e.data) as { tool: string; args: Record<string, unknown>; result: Record<string, unknown>; timestamp: number; duration: number }
        if (!data.tool) return
        const category = getCategory(data.tool)
        const message = getMessage(data.tool, data.args || {}, data.result || {}, data.duration)
        const time = new Date(data.timestamp || Date.now()).toLocaleTimeString("en-US", {
          hour: "numeric", minute: "2-digit", second: "2-digit", hour12: true,
        })
        setEvents(prev => [{ category, message, time, tool: data.tool, duration: data.duration }, ...prev].slice(0, 200))
      } catch {
        // ignore parse errors
      }
    }

    return () => {
      es.close()
      esRef.current = null
    }
  }, [])

  const filtered = events.filter(e => {
    if (activeFilter === "All Events") return true
    if (activeFilter === "File Watcher") return e.category === "file" || e.category === "focus"
    if (activeFilter === "Cache") return e.category === "cache"
    if (activeFilter === "Security") return e.category === "security"
    if (activeFilter === "System") return e.category === "system" || e.category === "session"
    return true
  })

  return (
    <div className="flex flex-col min-h-[calc(100vh-64px)] bg-background">
      <div className="p-8 flex-1 max-w-[1600px] mx-auto w-full space-y-6">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <h1 className="text-2xl font-bold text-foreground">Events</h1>
            <p className="text-sm text-muted-foreground">Real-time system events and notifications.</p>
          </div>
          <div className={cn(
            "flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold border",
            connected
              ? "bg-green-50 text-green-700 border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800"
              : "bg-muted text-muted-foreground border-border"
          )}>
            <div className={cn("w-1.5 h-1.5 rounded-full", connected ? "bg-green-500 animate-pulse" : "bg-gray-400")} />
            {connected ? "Live" : "Connecting..."}
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="flex items-center gap-1">
          <div className="flex items-center gap-1 flex-1 flex-wrap">
            {filterTabs.map(tab => (
              <button
                key={tab}
                onClick={() => setActiveFilter(tab)}
                className={cn(
                  "px-4 py-1.5 rounded-full text-sm font-medium transition-colors",
                  activeFilter === tab
                    ? "bg-[#7C3AED] text-white"
                    : "bg-card border border-border text-muted-foreground hover:text-foreground"
                )}
              >
                {tab}
              </button>
            ))}
          </div>
          <button className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-border bg-card text-sm text-muted-foreground hover:text-foreground transition-colors">
            <SlidersHorizontal className="w-4 h-4" />
            Filter
          </button>
        </div>

        {/* Events Feed */}
        <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden">
          {filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-muted-foreground gap-3">
              <Network className="w-8 h-8 opacity-30" />
              <p className="text-sm font-medium">No events in this category</p>
              <p className="text-xs opacity-70">Use LoomMCP tools in Claude to see real events</p>
            </div>
          ) : (
            <div className="divide-y divide-border">
              {filtered.map((event, i) => {
                const style = categoryStyle[event.category] || categoryStyle.system
                return (
                  <div key={i} className="flex items-center gap-4 px-5 py-3.5 hover:bg-muted/50 transition-colors">
                    <div className={cn("w-7 h-7 rounded-full flex items-center justify-center shrink-0", style.bg, style.darkBg, style.text)}>
                      {style.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-foreground truncate">{event.message}</p>
                      {event.tool && (
                        <p className="text-xs text-muted-foreground font-mono mt-0.5">{event.tool}</p>
                      )}
                    </div>
                    <span className="text-xs text-muted-foreground shrink-0 tabular-nums">{event.time}</span>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* Live indicator */}
        <p className="text-xs text-muted-foreground text-center">
          {connected ? "● Live — events update in real time as MCP tools are called" : "● Connecting to event stream..."}
        </p>
      </div>
    </div>
  )
}
