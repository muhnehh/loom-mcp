"use client"

import { useState, useEffect } from "react"
import { Eye, Copy, GitBranch } from "lucide-react"
import { cn } from "@/lib/utils"

interface FocusedFile {
  name: string
  lines: number
  tokens: number
  deps: number
  focusedAt: string
}

const fallbackFiles: FocusedFile[] = [
  { name: "src/auth.ts::loginUser", lines: 42, tokens: 1204, deps: 5, focusedAt: "3m 16s ago" },
  { name: "src/middleware.ts", lines: 128, tokens: 2847, deps: 8, focusedAt: "5m 21s ago" },
  { name: "src/types.ts", lines: 76, tokens: 1943, deps: 3, focusedAt: "5m 21s ago" },
]

export default function ActiveLensPage() {
  const [activeTab, setActiveTab] = useState<"files" | "graph">("files")
  const [files, setFiles] = useState<FocusedFile[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch("http://localhost:2337/api/active-lens")
      .then((r) => r.json())
      .then((d) => {
        setFiles(d.focused || fallbackFiles)
        setLoading(false)
      })
      .catch(() => {
        setFiles(fallbackFiles)
        setLoading(false)
      })
  }, [])

  const displayFiles = files.length > 0 ? files : fallbackFiles
  const totalTokens = displayFiles.reduce((s, f) => s + f.tokens, 0)
  const totalLines = displayFiles.reduce((s, f) => s + f.lines, 0)

  return (
    <div className="flex flex-col min-h-[calc(100vh-64px)] bg-background">
      <div className="p-8 flex-1 max-w-[1600px] mx-auto w-full space-y-6">
        {/* Header */}
        <div className="space-y-1">
          <h1 className="text-2xl font-bold text-foreground">Active Lens</h1>
          <p className="text-sm text-muted-foreground">Detailed view of all focused files.</p>
        </div>

        {/* Metric Cards */}
        <div className="grid grid-cols-4 gap-4">
          <div className="bg-card border border-border rounded-xl shadow-sm p-5">
            <p className="text-xs font-medium text-muted-foreground mb-2">Files Focused</p>
            <p className="text-[28px] font-bold text-foreground leading-none mb-1">{displayFiles.length} / 20</p>
            <p className="text-[11px] text-[#10B981] font-medium">15% of budget</p>
          </div>
          <div className="bg-card border border-border rounded-xl shadow-sm p-5">
            <p className="text-xs font-medium text-muted-foreground mb-2">Total Tokens</p>
            <p className="text-[28px] font-bold text-foreground leading-none mb-1">{totalTokens.toLocaleString()}</p>
            <p className="text-[11px] text-muted-foreground">Across all files</p>
          </div>
          <div className="bg-card border border-border rounded-xl shadow-sm p-5">
            <p className="text-xs font-medium text-muted-foreground mb-2">Total Lines</p>
            <p className="text-[28px] font-bold text-foreground leading-none mb-1">{totalLines}</p>
            <p className="text-[11px] text-muted-foreground">Lines of code</p>
          </div>
          <div className="bg-card border border-border rounded-xl shadow-sm p-5">
            <p className="text-xs font-medium text-muted-foreground mb-2">Last Activity</p>
            <p className="text-[28px] font-bold text-foreground leading-none mb-1">2m 18s ago</p>
            <p className="text-[11px] text-muted-foreground">Active session</p>
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
            {displayFiles.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
                <p className="text-sm">No files focused yet. Use loom_focus to add files.</p>
              </div>
            ) : (
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border bg-muted">
                    <th className="text-left px-5 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">File</th>
                    <th className="text-left px-5 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Lines</th>
                    <th className="text-left px-5 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Tokens</th>
                    <th className="text-left px-5 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Dependencies</th>
                    <th className="text-left px-5 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Focused At</th>
                    <th className="text-left px-5 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {displayFiles.map((file, i) => (
                    <tr key={i} className="border-b border-border last:border-0 hover:bg-muted transition-colors">
                      <td className="px-5 py-4">
                        <span className="text-sm font-medium text-foreground font-mono">{file.name}</span>
                      </td>
                      <td className="px-5 py-4 text-sm text-muted-foreground">{file.lines}</td>
                      <td className="px-5 py-4 text-sm text-muted-foreground">{file.tokens.toLocaleString()}</td>
                      <td className="px-5 py-4 text-sm text-muted-foreground">{file.deps}</td>
                      <td className="px-5 py-4 text-sm text-muted-foreground">{file.focusedAt}</td>
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-2">
                          <button className="p-1.5 rounded-md hover:bg-muted text-muted-foreground transition-colors">
                            <Eye className="w-4 h-4" />
                          </button>
                          <button className="p-1.5 rounded-md hover:bg-muted text-muted-foreground transition-colors">
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
          <div className="bg-card border border-border rounded-xl shadow-sm p-6 min-h-[400px]">
            <svg viewBox="0 0 800 400" className="w-full h-full min-h-[360px]" xmlns="http://www.w3.org/2000/svg">
              {/* Edges - dashed for direct deps */}
              <line x1="400" y1="200" x2="180" y2="200" stroke="#F97316" strokeWidth="1.5" strokeDasharray="6,3" />
              <line x1="400" y1="200" x2="580" y2="120" stroke="#F97316" strokeWidth="1.5" strokeDasharray="6,3" />
              {/* Dotted for indirect */}
              <line x1="180" y1="200" x2="100" y2="100" stroke="#9CA3AF" strokeWidth="1.5" strokeDasharray="3,3" />
              <line x1="580" y1="120" x2="680" y2="280" stroke="#9CA3AF" strokeWidth="1.5" strokeDasharray="3,3" />
              <line x1="400" y1="200" x2="400" y2="320" stroke="#9CA3AF" strokeWidth="1.5" strokeDasharray="3,3" />

              {/* Center node - auth.ts (highlighted) */}
              <rect x="300" y="168" width="200" height="64" rx="10" fill="#FFF7ED" stroke="#F97316" strokeWidth="2" />
              <text x="400" y="196" textAnchor="middle" fontSize="13" fontWeight="700" fill="#F97316">src/auth.ts</text>
              <text x="400" y="216" textAnchor="middle" fontSize="11" fill="#9CA3AF">center</text>

              {/* middleware.ts node */}
              <rect x="80" y="168" width="200" height="64" rx="10" fill="#FFF7ED" stroke="#F97316" strokeWidth="1.5" />
              <text x="180" y="196" textAnchor="middle" fontSize="12" fontWeight="600" fill="#374151">src/middleware.ts</text>
              <text x="180" y="214" textAnchor="middle" fontSize="10" fill="#9CA3AF">focused</text>

              {/* types.ts node */}
              <rect x="480" y="88" width="200" height="64" rx="10" fill="#FFF7ED" stroke="#F97316" strokeWidth="1.5" />
              <text x="580" y="116" textAnchor="middle" fontSize="12" fontWeight="600" fill="#374151">src/types.ts</text>
              <text x="580" y="134" textAnchor="middle" fontSize="10" fill="#9CA3AF">focused</text>

              {/* utils.ts node - indirect */}
              <rect x="30" y="68" width="140" height="50" rx="8" fill="#F9FAFB" stroke="#E5E7EB" strokeWidth="1.5" />
              <text x="100" y="90" textAnchor="middle" fontSize="11" fill="#6B7280">src/utils.ts</text>
              <text x="100" y="106" textAnchor="middle" fontSize="10" fill="#9CA3AF">indirect</text>

              {/* config.ts node - indirect */}
              <rect x="600" y="248" width="150" height="50" rx="8" fill="#F9FAFB" stroke="#E5E7EB" strokeWidth="1.5" />
              <text x="675" y="270" textAnchor="middle" fontSize="11" fill="#6B7280">src/config.ts</text>
              <text x="675" y="286" textAnchor="middle" fontSize="10" fill="#9CA3AF">indirect</text>

              {/* db.ts node - indirect */}
              <rect x="300" y="290" width="200" height="50" rx="8" fill="#F9FAFB" stroke="#E5E7EB" strokeWidth="1.5" />
              <text x="400" y="312" textAnchor="middle" fontSize="11" fill="#6B7280">src/db.ts</text>
              <text x="400" y="328" textAnchor="middle" fontSize="10" fill="#9CA3AF">indirect</text>

              {/* Legend */}
              <g transform="translate(20, 340)">
                <rect x="0" y="0" width="12" height="12" rx="2" fill="#FFF7ED" stroke="#F97316" strokeWidth="1.5" />
                <text x="18" y="10" fontSize="10" fill="#6B7280">Focused File</text>
                <line x1="95" y1="6" x2="115" y2="6" stroke="#F97316" strokeWidth="1.5" strokeDasharray="5,2" />
                <text x="120" y="10" fontSize="10" fill="#6B7280">Direct Dependency</text>
                <line x1="230" y1="6" x2="250" y2="6" stroke="#9CA3AF" strokeWidth="1.5" strokeDasharray="3,3" />
                <text x="255" y="10" fontSize="10" fill="#6B7280">Indirect Dependency</text>
              </g>

              {/* Focus Depth legend */}
              <g transform="translate(480, 340)">
                <text x="0" y="10" fontSize="10" fontWeight="600" fill="#6B7280">Focus Depth:</text>
                <text x="85" y="10" fontSize="10" fill="#6B7280">1=Direct</text>
                <text x="140" y="10" fontSize="10" fill="#6B7280">2=Indirect</text>
                <text x="205" y="10" fontSize="10" fill="#6B7280">3+=Deep</text>
              </g>
            </svg>
          </div>
        )}
      </div>
    </div>
  )
}
