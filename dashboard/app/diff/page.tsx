"use client"

import { useState, useEffect } from "react"
import { Copy, FileText, Check } from "lucide-react"
import { Button } from "@/components/ui/button"

interface DiffLine {
  type: 'context' | 'added' | 'removed'
  content: string
}

interface DiffFile {
  file: string
  additions: number
  deletions: number
  lines: DiffLine[]
}

const diffFiles: DiffFile[] = [
  {
    file: 'src/auth.ts',
    additions: 24,
    deletions: 10,
    lines: [
      { type: 'context', content: '  async function loginUser(' },
      { type: 'removed', content: '-  if (!isValid) throw new Error("Invalid password")' },
      { type: 'added', content: '+  // add rate limiting check' },
      { type: 'added', content: '+  if (attempts > 5) throw new Error("Too many attempts")' },
      { type: 'context', content: '  return generateSession(user)' },
    ],
  },
  {
    file: 'src/middleware.ts',
    additions: 12,
    deletions: 4,
    lines: [
      { type: 'context', content: '  export function authMiddleware(req, res, next) {' },
      { type: 'added', content: '+  const token = req.headers.authorization' },
      { type: 'added', content: '+  if (!token) return res.status(401).json({ error: "Unauthorized" })' },
    ],
  },
]

interface DiffSummary {
  files: number
  additions: number
  deletions: number
  tokens: number
  sessionId: string
  lastChange: string
}

export default function DiffPage() {
  const [summary, setSummary] = useState<DiffSummary>({
    files: 3,
    additions: 156,
    deletions: 48,
    tokens: 2847,
    sessionId: '715a2b91',
    lastChange: new Date().toLocaleTimeString(),
  })
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    fetch('http://localhost:2337/api/diff')
      .then(r => r.json())
      .then(data => {
        setSummary({
          files: data.files || 3,
          additions: data.additions || 156,
          deletions: data.deletions || 48,
          tokens: 2847,
          sessionId: data.sessionId || '715a2b91',
          lastChange: data.lastChange ? new Date(data.lastChange).toLocaleTimeString() : new Date().toLocaleTimeString(),
        })
      })
      .catch(() => {})
  }, [])

  const handleCopyDiff = () => {
    const diffText = diffFiles.map(f =>
      `diff --git a/${f.file} b/${f.file}\n` + f.lines.map(l => l.content).join('\n')
    ).join('\n\n')
    navigator.clipboard.writeText(diffText)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="flex flex-col min-h-[calc(100vh-64px)] bg-background">
      <div className="p-8 flex-1 max-w-[1600px] mx-auto w-full space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-foreground">Active Diff</h1>
          <p className="text-sm text-muted-foreground mt-1">See only what's changed since the session started.</p>
        </div>

        {/* Status bar */}
        <div className="flex items-center gap-2 text-[#10B981] bg-[#ECFDF5] border border-[#D1FAE5] px-4 py-2.5 rounded-xl text-sm font-medium">
          <Check className="w-4 h-4" />
          <span>✓ Changes retrieved successfully • {summary.files} files changed • +{summary.additions} additions • -{summary.deletions} deletions</span>
        </div>

        {/* Main layout: 3/4 + 1/4 */}
        <div className="grid grid-cols-4 gap-6">
          {/* Left: Diff viewer (3/4) */}
          <div className="col-span-3 space-y-4">
            {/* Action buttons */}
            <div className="flex items-center gap-2 justify-end">
              <Button
                variant="outline"
                size="sm"
                onClick={handleCopyDiff}
                className="h-8 px-3 text-xs font-medium border-border text-muted-foreground hover:text-foreground"
              >
                {copied ? <Check className="w-3.5 h-3.5 mr-1.5 text-[#10B981]" /> : <Copy className="w-3.5 h-3.5 mr-1.5" />}
                Copy Diff
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="h-8 px-3 text-xs font-medium border-border text-muted-foreground hover:text-foreground"
              >
                <FileText className="w-3.5 h-3.5 mr-1.5" />
                View Summary
              </Button>
            </div>

            {/* Diff files */}
            {diffFiles.map((df, i) => (
              <div key={i} className="bg-card border border-border rounded-xl shadow-sm overflow-hidden">
                {/* File header */}
                <div className="bg-muted border-b border-border px-4 py-2 flex items-center justify-between">
                  <span className="font-mono text-xs font-medium text-foreground">{df.file}</span>
                  <span className="text-xs font-medium">
                    <span className="text-[#10B981]">+{df.additions}</span>
                    {' '}
                    <span className="text-[#EF4444]">-{df.deletions}</span>
                  </span>
                </div>
                {/* Diff lines */}
                <div className="overflow-x-auto">
                  {df.lines.map((line, j) => (
                    <div
                      key={j}
                      className={
                        line.type === 'added'
                          ? 'bg-[#ECFDF5] text-[#166534] font-mono text-xs px-4 py-1'
                          : line.type === 'removed'
                          ? 'bg-[#FEF2F2] text-[#991B1B] font-mono text-xs px-4 py-1'
                          : 'text-muted-foreground font-mono text-xs px-4 py-1'
                      }
                    >
                      {line.content}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Right: Summary panel (1/4) */}
          <div className="col-span-1">
            <div className="bg-card border border-border rounded-xl shadow-sm p-5 space-y-4">
              <h3 className="text-sm font-semibold text-foreground">Summary</h3>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">Files Changed</span>
                  <span className="text-xl font-bold text-foreground">{summary.files}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">Additions</span>
                  <span className="text-xl font-bold text-[#10B981]">+{summary.additions}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">Deletions</span>
                  <span className="text-xl font-bold text-[#EF4444]">-{summary.deletions}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">Total Tokens</span>
                  <span className="text-sm font-bold text-foreground">{summary.tokens.toLocaleString()}</span>
                </div>
                <div className="pt-3 border-t border-border space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">Session ID</span>
                    <span className="text-xs font-mono text-muted-foreground">{summary.sessionId}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">Last Change</span>
                    <span className="text-xs text-muted-foreground">{summary.lastChange}</span>
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
