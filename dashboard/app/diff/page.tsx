"use client"

import { useState, useEffect } from "react"
import { GitBranch, FileText } from "lucide-react"

interface DiffData {
  files: number
  additions: number
  deletions: number
  calls: any[]
  sessionId: string
  lastChange: number | null
}

export default function DiffPage() {
  const [diff, setDiff] = useState<DiffData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('http://localhost:2337/api/diff')
      .then(r => r.json())
      .then(data => {
        setDiff({
          files: data.files ?? 0,
          additions: data.additions ?? 0,
          deletions: data.deletions ?? 0,
          calls: Array.isArray(data.calls) ? data.calls : [],
          sessionId: data.sessionId ?? '',
          lastChange: data.lastChange ?? null,
        })
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  const lastChangeStr = diff?.lastChange
    ? new Date(diff.lastChange).toLocaleTimeString()
    : '—'

  const hasChanges = diff && (diff.files > 0 || diff.calls.length > 0)

  return (
    <div className="flex flex-col min-h-[calc(100vh-64px)] bg-background">
      <div className="p-8 flex-1 max-w-[1600px] mx-auto w-full space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-[28px] font-serif text-foreground">Active Diff</h1>
          <p className="text-sm text-muted-foreground font-serif italic mt-1">See only what's changed since the session started.</p>
        </div>

        {/* Main layout: 3/4 + 1/4 */}
        <div className="grid grid-cols-4 gap-6">
          {/* Left: Diff viewer (3/4) */}
          <div className="col-span-3 space-y-4">
            {loading ? (
              <div className="bg-card border border-border rounded-xl p-12 flex items-center justify-center text-muted-foreground text-sm">
                Loading...
              </div>
            ) : !hasChanges ? (
              <div className="bg-card border border-border rounded-xl p-12 flex flex-col items-center justify-center gap-3 text-muted-foreground">
                <GitBranch className="w-10 h-10 opacity-30" />
                <p className="text-sm font-medium">No changes yet</p>
                <p className="text-xs text-center max-w-xs">
                  Diff appears when Claude edits files using loom tools
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {diff!.calls.length > 0 ? (
                  diff!.calls.map((call: any, i: number) => (
                    <div key={i} className="bg-card border border-border rounded-xl shadow-sm overflow-hidden">
                      <div className="bg-muted border-b border-border px-4 py-2 flex items-center justify-between">
                        <span className="font-mono text-xs font-medium text-foreground">
                          {call.file || call.tool || `Change ${i + 1}`}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {call.timestamp ? new Date(call.timestamp).toLocaleTimeString() : ''}
                        </span>
                      </div>
                      <div className="p-4">
                        <pre className="text-xs text-muted-foreground font-mono whitespace-pre-wrap overflow-auto max-h-48">
                          {typeof call.result === 'string' ? call.result : JSON.stringify(call.result, null, 2)}
                        </pre>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="bg-card border border-border rounded-xl p-6 text-center text-muted-foreground text-sm">
                    <FileText className="w-8 h-8 mx-auto opacity-30 mb-2" />
                    {diff!.files} file{diff!.files !== 1 ? 's' : ''} changed in this session. Use Claude to inspect specific files.
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Right: Summary panel (1/4) */}
          <div className="col-span-1">
            <div className="bg-card border border-border rounded-xl shadow-sm p-5 space-y-4">
              <h3 className="text-sm font-semibold text-foreground">Summary</h3>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">Files Changed</span>
                  <span className="text-xl font-bold text-foreground">{diff?.files ?? '—'}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">Additions</span>
                  <span className="text-xl font-bold text-[#10B981]">
                    {diff?.additions != null ? `+${diff.additions}` : '—'}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">Deletions</span>
                  <span className="text-xl font-bold text-[#EF4444]">
                    {diff?.deletions != null ? `-${diff.deletions}` : '—'}
                  </span>
                </div>

                <div className="pt-3 border-t border-border space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">Session ID</span>
                    <span className="text-xs font-mono text-muted-foreground truncate max-w-[80px]">
                      {diff?.sessionId ? diff.sessionId.slice(0, 8) : '—'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">Last Change</span>
                    <span className="text-xs text-muted-foreground">{lastChangeStr}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
