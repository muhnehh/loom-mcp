"use client"

import { useState, useEffect } from "react"
import { Eye, Copy, GitBranch } from "lucide-react"
import { cn } from "@/lib/utils"

interface FocusedFile {
  name: string
  lines: number | null
  tokens: number | null
  focusedAt: string
}

function timeAgo(timestamp: number): string {
  const diff = Date.now() - timestamp
  const s = Math.floor(diff / 1000)
  if (s < 60) return `${s}s ago`
  const m = Math.floor(s / 60)
  if (m < 60) return `${m}m ${s % 60}s ago`
  const h = Math.floor(m / 60)
  return `${h}h ${m % 60}m ago`
}

function parseLinesFromPreview(preview: string): number | null {
  const match = preview.match(/lines[:\s]+(\d+)/i)
  return match ? parseInt(match[1]) : null
}

export default function ActiveLensPage() {
  const [activeTab, setActiveTab] = useState<"files" | "graph">("files")
  const [files, setFiles] = useState<FocusedFile[]>([])
  const [activeLensCount, setActiveLensCount] = useState<number>(0)
  const [sessionDuration, setSessionDuration] = useState<number | null>(null)
  const [lastActivity, setLastActivity] = useState<string>("—")
  const [totalTokens, setTotalTokens] = useState<number>(0)
  const [totalLines, setTotalLines] = useState<number>(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      fetch("http://localhost:2337/api/summary").then(r => r.json()).catch(() => null),
      fetch("http://localhost:2337/api/active-lens").then(r => r.json()).catch(() => null),
      fetch("http://localhost:2337/api/history").then(r => r.json()).catch(() => []),
    ]).then(([summary, lens, history]) => {
      // Summary data
      if (summary) {
        setActiveLensCount(summary.activeLens ?? 0)
        setSessionDuration(summary.sessionDuration ?? null)
      }

      // Last activity from recent history
      if (Array.isArray(history) && history.length > 0) {
        const latest = history[history.length - 1]
        if (latest?.timestamp) {
          setLastActivity(timeAgo(latest.timestamp))
        }
      }

      // Build files from loom_focus calls in history
      const focusCalls: any[] = Array.isArray(history)
        ? history.filter((c: any) => c.tool === 'loom_focus')
        : []

      let tokenSum = 0
      let lineSum = 0

      const builtFiles: FocusedFile[] = focusCalls.map((c: any) => {
        const lines = parseLinesFromPreview(
          typeof c.result === 'string' ? c.result : (c.result?.preview ?? '')
        )
        const tokens = c.savedTokens ?? null
        if (tokens) tokenSum += tokens
        if (lines) lineSum += lines
        return {
          name: c.args?.target ?? c.args?.path ?? 'unknown',
          lines,
          tokens,
          focusedAt: c.timestamp ? timeAgo(c.timestamp) : '—',
        }
      })

      // Merge with active-lens paths if not already covered
      const focusedPaths = new Set(builtFiles.map(f => f.name))
      if (lens?.focused) {
        for (const p of lens.focused) {
          if (!focusedPaths.has(p)) {
            builtFiles.push({ name: p, lines: null, tokens: null, focusedAt: '—' })
          }
        }
      }

      setFiles(builtFiles)
      setTotalTokens(tokenSum)
      setTotalLines(lineSum)
      setLoading(false)
    })
  }, [])

  const displayCount = activeLensCount || files.length

  return (
    <div className="flex flex-col min-h-[calc(100vh-64px)] bg-background">
      <div className="p-8 flex-1 max-w-[1600px] mx-auto w-full space-y-6">
        {/* Header */}
        <div className="space-y-1">
          <h1 className="text-[28px] font-serif text-foreground">Active Lens</h1>
          <p className="text-sm text-muted-foreground font-serif italic">Detailed view of all focused files.</p>
        </div>

        {/* Metric Cards */}
        <div className="grid grid-cols-4 gap-4">
          <div className="bg-card border border-border rounded-xl shadow-sm p-5">
            <p className="text-xs font-medium text-muted-foreground mb-2">Files Focused</p>
            <p className="text-[28px] font-bold text-foreground leading-none mb-1">{displayCount} / 20</p>
            <p className="text-[11px] text-[#10B981] font-medium">{Math.round((displayCount / 20) * 100)}% of budget</p>
          </div>
          <div className="bg-card border border-border rounded-xl shadow-sm p-5">
            <p className="text-xs font-medium text-muted-foreground mb-2">Tokens Saved</p>
            <p className="text-[28px] font-bold text-foreground leading-none mb-1">
              {totalTokens > 0 ? totalTokens.toLocaleString() : '—'}
            </p>
            <p className="text-[11px] text-muted-foreground">From focus calls</p>
          </div>
          <div className="bg-card border border-border rounded-xl shadow-sm p-5">
            <p className="text-xs font-medium text-muted-foreground mb-2">Total Lines</p>
            <p className="text-[28px] font-bold text-foreground leading-none mb-1">
              {totalLines > 0 ? totalLines : '—'}
            </p>
            <p className="text-[11px] text-muted-foreground">Lines of code</p>
          </div>
          <div className="bg-card border border-border rounded-xl shadow-sm p-5">
            <p className="text-xs font-medium text-muted-foreground mb-2">Last Activity</p>
            <p className="text-[28px] font-bold text-foreground leading-none mb-1">{lastActivity}</p>
            <p className="text-[11px] text-muted-foreground">
              {sessionDuration != null ? `Session: ${Math.floor(sessionDuration / 60)}m` : 'Active session'}
            </p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 border-b border-border">
          <button
            onClick={() => setActiveTab("files")}
            className={cn(
              "px-4 py-2.5 text-sm font-medium border-b-2 -mb-px transition-colors",
              activeTab === "files"
                ? "border-[#7C3AED] text-[#7C3AED]"
                : "border-transparent text-muted-foreground hover:text-foreground"
            )}
          >
            Files
          </button>
          <button
            onClick={() => setActiveTab("graph")}
            className={cn(
              "px-4 py-2.5 text-sm font-medium border-b-2 -mb-px transition-colors",
              activeTab === "graph"
                ? "border-[#7C3AED] text-[#7C3AED]"
                : "border-transparent text-muted-foreground hover:text-foreground"
            )}
          >
            Dependency Graph
          </button>
        </div>

        {/* Files Tab */}
        {activeTab === "files" && (
          <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden">
            {loading ? (
              <div className="flex items-center justify-center py-12 text-muted-foreground text-sm">
                Loading...
              </div>
            ) : files.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 gap-3 text-muted-foreground">
                <GitBranch className="w-10 h-10 opacity-30" />
                <p className="text-sm font-medium">No files focused yet.</p>
                <p className="text-xs text-center max-w-xs">
                  Ask Claude to call <code className="font-mono font-semibold">loom_focus</code> on a file to see it here.
                </p>
              </div>
            ) : (
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border bg-muted">
                    <th className="text-left px-5 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">File</th>
                    <th className="text-left px-5 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Lines</th>
                    <th className="text-left px-5 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Tokens Saved</th>
                    <th className="text-left px-5 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Focused At</th>
                    <th className="text-left px-5 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {files.map((file, i) => (
                    <tr key={i} className="border-b border-border last:border-0 hover:bg-muted transition-colors">
                      <td className="px-5 py-4">
                        <span className="text-sm font-medium text-foreground font-mono">{file.name}</span>
                      </td>
                      <td className="px-5 py-4 text-sm text-muted-foreground">{file.lines ?? '—'}</td>
                      <td className="px-5 py-4 text-sm text-muted-foreground">
                        {file.tokens != null ? file.tokens.toLocaleString() : '—'}
                      </td>
                      <td className="px-5 py-4 text-sm text-muted-foreground">{file.focusedAt}</td>
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-2">
                          <button className="p-1.5 rounded-md hover:bg-muted text-muted-foreground transition-colors" title="View">
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            className="p-1.5 rounded-md hover:bg-muted text-muted-foreground transition-colors"
                            title="Copy path"
                            onClick={() => navigator.clipboard.writeText(file.name)}
                          >
                            <Copy className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}

        {/* Dependency Graph Tab */}
        {activeTab === "graph" && (
          <div className="bg-card border border-border rounded-xl shadow-sm p-6 min-h-[400px] relative">
            {files.length === 0 && (
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 text-muted-foreground bg-card/80 rounded-xl z-10">
                <GitBranch className="w-10 h-10 opacity-30" />
                <p className="text-sm font-medium">Focus files to see dependency graph</p>
                <p className="text-xs">Ask Claude to call <code className="font-mono font-semibold">loom_focus</code> first</p>
              </div>
            )}
            <svg viewBox="0 0 800 400" className="w-full h-full min-h-[360px]" xmlns="http://www.w3.org/2000/svg">
              {/* Edges */}
              <line x1="400" y1="200" x2="180" y2="200" stroke="#F97316" strokeWidth="1.5" strokeDasharray="6,3" />
              <line x1="400" y1="200" x2="580" y2="120" stroke="#F97316" strokeWidth="1.5" strokeDasharray="6,3" />
              <line x1="180" y1="200" x2="100" y2="100" stroke="#9CA3AF" strokeWidth="1.5" strokeDasharray="3,3" />
              <line x1="580" y1="120" x2="680" y2="280" stroke="#9CA3AF" strokeWidth="1.5" strokeDasharray="3,3" />
              <line x1="400" y1="200" x2="400" y2="320" stroke="#9CA3AF" strokeWidth="1.5" strokeDasharray="3,3" />

              {/* Center node */}
              <rect x="300" y="168" width="200" height="64" rx="10" fill="#FFF7ED" stroke="#F97316" strokeWidth="2" />
              <text x="400" y="196" textAnchor="middle" fontSize="13" fontWeight="700" fill="#F97316">
                {files[0]?.name?.split('/').pop() ?? 'focused file'}
              </text>
              <text x="400" y="216" textAnchor="middle" fontSize="11" fill="#9CA3AF">center</text>

              {/* Other nodes */}
              <rect x="80" y="168" width="200" height="64" rx="10" fill="#FFF7ED" stroke="#F97316" strokeWidth="1.5" />
              <text x="180" y="196" textAnchor="middle" fontSize="12" fontWeight="600" fill="#374151">
                {files[1]?.name?.split('/').pop() ?? 'dependency'}
              </text>
              <text x="180" y="214" textAnchor="middle" fontSize="10" fill="#9CA3AF">focused</text>

              <rect x="480" y="88" width="200" height="64" rx="10" fill="#FFF7ED" stroke="#F97316" strokeWidth="1.5" />
              <text x="580" y="116" textAnchor="middle" fontSize="12" fontWeight="600" fill="#374151">
                {files[2]?.name?.split('/').pop() ?? 'dependency'}
              </text>
              <text x="580" y="134" textAnchor="middle" fontSize="10" fill="#9CA3AF">focused</text>

              {/* Legend */}
              <g transform="translate(20, 340)">
                <rect x="0" y="0" width="12" height="12" rx="2" fill="#FFF7ED" stroke="#F97316" strokeWidth="1.5" />
                <text x="18" y="10" fontSize="10" fill="#6B7280">Focused File</text>
                <line x1="95" y1="6" x2="115" y2="6" stroke="#F97316" strokeWidth="1.5" strokeDasharray="5,2" />
                <text x="120" y="10" fontSize="10" fill="#6B7280">Direct Dependency</text>
                <line x1="230" y1="6" x2="250" y2="6" stroke="#9CA3AF" strokeWidth="1.5" strokeDasharray="3,3" />
                <text x="255" y="10" fontSize="10" fill="#6B7280">Indirect Dependency</text>
              </g>
            </svg>
          </div>
        )}
      </div>
    </div>
  )
}
