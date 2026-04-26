"use client"

import { useState, useEffect } from "react"
import { Search, Zap, Network, Clock } from "lucide-react"

interface Session {
  id: string
  title: string
  duration: number
  files: number
  tokens: number
  date: string
}

function formatDuration(ms: number): string {
  const totalSeconds = Math.floor(ms / 1000)
  const minutes = Math.floor(totalSeconds / 60)
  const seconds = totalSeconds % 60
  return `${minutes}m ${seconds}s`
}

function formatDate(iso: string): string {
  const d = new Date(iso)
  const now = new Date()
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const yesterday = new Date(today.getTime() - 86400000)
  const day = new Date(d.getFullYear(), d.getMonth(), d.getDate())

  const timeStr = d.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true })

  if (day.getTime() === today.getTime()) return `Today, ${timeStr}`
  if (day.getTime() === yesterday.getTime()) return `Yesterday, ${timeStr}`
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
}

const iconColors = [
  { bg: "bg-[#F5F3FF]", text: "text-[#7C3AED]" },
  { bg: "bg-[#EFF6FF]", text: "text-[#3B82F6]" },
  { bg: "bg-[#ECFDF5]", text: "text-[#10B981]" },
  { bg: "bg-[#FFF7ED]", text: "text-[#F97316]" },
]

export default function HistoryPage() {
  const [sessions, setSessions] = useState<Session[]>([])
  const [loading, setLoading] = useState(true)
  const [query, setQuery] = useState("")
  const [status, setStatus] = useState("all")
  const [selectedSession, setSelectedSession] = useState<string | null>(null)

  useEffect(() => {
    fetch("http://localhost:2337/api/sessions")
      .then((r) => r.json())
      .then((d) => {
        if (Array.isArray(d) && d.length > 0) setSessions(d)
        else setSessions([])
        setLoading(false)
      })
      .catch(() => {
        setSessions([])
        setLoading(false)
      })
  }, [])

  const filtered = sessions.filter((s) => {
    const matchQ =
      query === "" ||
      (s.title && s.title.toLowerCase().includes(query.toLowerCase())) ||
      s.id.toLowerCase().includes(query.toLowerCase())
    return matchQ
  })

  return (
    <div className="flex flex-col min-h-[calc(100vh-64px)] bg-background">
      <div className="p-8 flex-1 max-w-[1600px] mx-auto w-full space-y-6">
        {/* Header */}
        <div className="space-y-1">
          <h1 className="text-[28px] font-serif text-foreground">History</h1>
          <p className="text-sm text-muted-foreground font-serif italic">View and restore your previous sessions.</p>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-3">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search sessions..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 text-sm border border-border rounded-lg bg-card outline-none focus:ring-2 focus:ring-[#7C3AED]/20 focus:border-[#7C3AED] placeholder:text-muted-foreground"
            />
          </div>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="px-3 py-2 text-sm border border-border rounded-lg bg-card outline-none focus:ring-2 focus:ring-[#7C3AED]/20 focus:border-[#7C3AED] text-foreground"
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="completed">Completed</option>
            <option value="archived">Archived</option>
          </select>
        </div>

        {/* Session List */}
        <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden">
          {loading ? (
            <div className="flex items-center justify-center py-16 text-muted-foreground text-sm">
              Loading...
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 gap-3 text-muted-foreground">
              <Clock className="w-10 h-10 opacity-30" />
              <p className="text-sm font-medium">
                {query ? `No sessions match "${query}".` : "No sessions yet."}
              </p>
              {!query && (
                <p className="text-xs text-center max-w-xs">
                  Sessions appear after using LoomMCP tools with Claude.
                </p>
              )}
            </div>
          ) : (
            <div className="divide-y divide-border">
              {filtered.map((session, i) => {
                const color = iconColors[i % iconColors.length]
                return (
                  <div key={session.id} className="flex flex-col">
                    <div className="flex items-center gap-4 px-5 py-4 hover:bg-muted transition-colors">
                      {/* Icon */}
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${color.bg}`}>
                        {i % 3 === 0 ? (
                          <Zap className={`w-5 h-5 ${color.text}`} />
                        ) : i % 3 === 1 ? (
                          <Network className={`w-5 h-5 ${color.text}`} />
                        ) : (
                          <Search className={`w-5 h-5 ${color.text}`} />
                        )}
                      </div>

                      {/* Title + ID */}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-foreground truncate">
                          {session.title || `Session ${session.id.slice(0, 8)}`}
                        </p>
                        <p className="text-[10px] text-muted-foreground font-mono mt-0.5">{session.id}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {session.duration ? `${formatDuration(session.duration)} · ` : ''}
                          {session.files != null ? `${session.files} files · ` : ''}
                          {session.tokens != null ? `${session.tokens.toLocaleString()} tokens` : ''}
                        </p>
                      </div>

                      {/* Date */}
                      <div className="text-xs text-muted-foreground shrink-0 text-right">
                        {session.date ? formatDate(session.date) : '—'}
                      </div>

                      {/* View button */}
                      <button
                        onClick={() => setSelectedSession(selectedSession === session.id ? null : session.id)}
                        className="shrink-0 px-3 py-1.5 text-sm font-medium text-[#7C3AED] border border-border rounded-lg hover:bg-[#F5F3FF] transition-colors"
                      >
                        {selectedSession === session.id ? "Close" : "View"}
                      </button>
                    </div>
                    {selectedSession === session.id && (
                      <div className="px-5 pb-4 bg-muted border-t border-border">
                        <div className="py-3 space-y-2">
                          <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Session Details</p>
                          <div className="grid grid-cols-3 gap-4">
                            <div>
                              <p className="text-[10px] text-muted-foreground uppercase tracking-wide">Duration</p>
                              <p className="text-sm font-semibold text-foreground">
                                {session.duration ? formatDuration(session.duration) : '—'}
                              </p>
                            </div>
                            <div>
                              <p className="text-[10px] text-muted-foreground uppercase tracking-wide">Files</p>
                              <p className="text-sm font-semibold text-foreground">{session.files ?? '—'}</p>
                            </div>
                            <div>
                              <p className="text-[10px] text-muted-foreground uppercase tracking-wide">Tokens</p>
                              <p className="text-sm font-semibold text-foreground">
                                {session.tokens != null ? session.tokens.toLocaleString() : '—'}
                              </p>
                            </div>
                          </div>
                          <div>
                            <p className="text-[10px] text-muted-foreground uppercase tracking-wide">Session ID</p>
                            <p className="text-xs font-mono text-foreground">{session.id}</p>
                          </div>
                          {session.date && (
                            <div>
                              <p className="text-[10px] text-muted-foreground uppercase tracking-wide">Date</p>
                              <p className="text-xs text-foreground">{formatDate(session.date)}</p>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
