"use client"

import { useState, useEffect } from "react"
import { Copy, Check, Scan, Info } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts"

const LANG_COLORS: Record<string, string> = {
  TypeScript: '#3178C6',
  JavaScript: '#F7DF1E',
  Python: '#3776AB',
  Rust: '#B7410E',
  Go: '#00ADD8',
  Java: '#007396',
  'C#': '#9B4F96',
  Other: '#6B7280',
}

interface TopologyStats {
  files: number
  rawTokens: number
  tokenEstimate: number
  tokenReduction: number
  latencyMs: number
  toonContent: string
  languages: { name: string; value: number; color: string }[]
}

function parseTopologyPreview(preview: string): TopologyStats {
  const lines = preview.split('\n')
  let files = 0
  let rawTokens = 0
  let tokenEstimate = 0
  let tokenReduction = 0
  let latencyMs = 0
  let toonStart = -1

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]
    if (line.startsWith('files:')) files = parseInt(line.slice(6)) || 0
    else if (line.startsWith('raw_tokens:')) rawTokens = parseInt(line.slice(11)) || 0
    else if (line.startsWith('token_estimate:')) tokenEstimate = parseInt(line.slice(15)) || 0
    else if (line.startsWith('token_reduction:')) {
      const val = line.slice(16).replace('%', '')
      tokenReduction = parseFloat(val) || 0
    } else if (line.startsWith('latency_ms:')) latencyMs = parseInt(line.slice(11)) || 0
    else if (line.trim() === '' && toonStart === -1 && i > 0) {
      toonStart = i + 1
    }
  }

  const toonContent = toonStart > 0 ? lines.slice(toonStart).join('\n').trim() : preview

  // Parse languages from TOON content by file extensions
  const langCounts: Record<string, number> = {}
  const toonLines = toonContent.split('\n')
  for (const line of toonLines) {
    const match = line.match(/^(\S+\.\w+):/)
    if (match) {
      const ext = match[1].split('.').pop()?.toLowerCase() || ''
      const lang =
        ext === 'ts' || ext === 'tsx' ? 'TypeScript' :
        ext === 'js' || ext === 'jsx' ? 'JavaScript' :
        ext === 'py' ? 'Python' :
        ext === 'rs' ? 'Rust' :
        ext === 'go' ? 'Go' :
        ext === 'java' ? 'Java' :
        ext === 'cs' ? 'C#' :
        'Other'
      langCounts[lang] = (langCounts[lang] || 0) + 1
    }
  }

  const languages = Object.entries(langCounts).map(([name, value]) => ({
    name,
    value,
    color: LANG_COLORS[name] || LANG_COLORS.Other,
  }))

  return { files, rawTokens, tokenEstimate, tokenReduction, latencyMs, toonContent, languages }
}

export default function TopologyPage() {
  const [directory, setDirectory] = useState("src/")
  const [maxDepth, setMaxDepth] = useState(3)
  const [stats, setStats] = useState<TopologyStats | null>(null)
  const [copied, setCopied] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('http://localhost:2337/api/topology')
      .then(r => r.json())
      .then(data => {
        if (data && data.preview) {
          setStats(parseTopologyPreview(data.preview))
        }
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  const handleScan = () => {
    setLoading(true)
    fetch('http://localhost:2337/api/topology')
      .then(r => r.json())
      .then(data => {
        if (data && data.preview) {
          setStats(parseTopologyPreview(data.preview))
        }
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }

  const toonContent = stats?.toonContent ?? ''

  const handleCopy = () => {
    if (!toonContent) return
    navigator.clipboard.writeText(toonContent)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="flex flex-col min-h-[calc(100vh-64px)] bg-background">
      <div className="p-8 flex-1 max-w-[1600px] mx-auto w-full space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-[28px] font-serif text-foreground">Get Topology</h1>
          <p className="text-sm text-muted-foreground font-serif italic mt-1">Scan your codebase and get AST skeleton (signatures only).</p>
        </div>

        {/* Info note */}
        <div className="flex items-start gap-2 bg-[#F5F3FF] border border-[#DDD6FE] text-[#7C3AED] px-4 py-3 rounded-xl text-xs">
          <Info className="w-4 h-4 mt-0.5 shrink-0" />
          <span>Topology is populated when Claude calls <code className="font-mono font-semibold">loom_get_topology</code>. The last result is shown here.</span>
        </div>

        {/* Form card */}
        <div className="bg-card border border-border rounded-xl shadow-sm p-6">
          <div className="flex items-end gap-4">
            <div className="flex-1">
              <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Directory</label>
              <Input
                value={directory}
                onChange={e => setDirectory(e.target.value)}
                placeholder="src/"
                className="border-border focus-visible:ring-[#7C3AED] h-10"
              />
            </div>
            <div className="w-40">
              <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Max Depth</label>
              <div className="flex items-center border border-border rounded-lg h-10 overflow-hidden">
                <button
                  className="px-3 h-full hover:bg-muted text-muted-foreground text-lg leading-none border-r border-border"
                  onClick={() => setMaxDepth(d => Math.max(1, d - 1))}
                >−</button>
                <span className="flex-1 text-center text-sm font-medium text-foreground">{maxDepth}</span>
                <button
                  className="px-3 h-full hover:bg-muted text-muted-foreground text-lg leading-none border-l border-border"
                  onClick={() => setMaxDepth(d => Math.min(10, d + 1))}
                >+</button>
              </div>
            </div>
            <Button
              onClick={handleScan}
              disabled={loading}
              className="h-10 px-6 bg-[#7C3AED] hover:bg-[#6D28D9] text-white font-medium rounded-lg"
            >
              <Scan className="w-4 h-4 mr-2" />
              {loading ? 'Loading...' : 'Refresh'}
            </Button>
          </div>
        </div>

        {/* Status bar */}
        {stats ? (
          <div className="flex items-center gap-2 text-[#10B981] bg-[#ECFDF5] border border-[#D1FAE5] px-4 py-2.5 rounded-xl text-sm font-medium">
            <Check className="w-4 h-4" />
            <span>
              Last scan: {stats.files.toLocaleString()} files{' • '}{stats.tokenEstimate.toLocaleString()} TOON tokens{stats.tokenReduction > 0 ? ` • ${stats.tokenReduction}% reduction` : ''}{stats.latencyMs > 0 ? ` • ${stats.latencyMs}ms` : ''}
            </span>
          </div>
        ) : !loading ? (
          <div className="flex items-center gap-2 text-muted-foreground bg-muted border border-border px-4 py-2.5 rounded-xl text-sm">
            No scan yet. Ask Claude to call <code className="font-mono font-semibold mx-1">loom_get_topology</code> to index your codebase.
          </div>
        ) : null}

        {/* Main content: 2-col */}
        <div className="grid grid-cols-3 gap-6">
          {/* Left: Code panel (2/3) */}
          <div className="col-span-2 bg-card border border-border rounded-xl shadow-sm overflow-hidden">
            <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-muted">
              <Tabs defaultValue="toon" className="w-full">
                <div className="flex items-center justify-between">
                  <TabsList className="bg-transparent h-auto p-0 gap-6">
                    <TabsTrigger
                      value="toon"
                      className="rounded-none border-b-2 border-transparent data-[state=active]:border-[#7C3AED] data-[state=active]:bg-transparent px-0 py-1 text-xs font-semibold shadow-none data-[state=active]:text-[#7C3AED] text-muted-foreground"
                    >TOON View</TabsTrigger>
                    <TabsTrigger
                      value="summary"
                      className="rounded-none border-b-2 border-transparent data-[state=active]:border-[#7C3AED] data-[state=active]:bg-transparent px-0 py-1 text-xs font-semibold shadow-none data-[state=active]:text-[#7C3AED] text-muted-foreground"
                    >Summary</TabsTrigger>
                  </TabsList>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleCopy}
                    disabled={!toonContent}
                    className="text-xs font-medium text-muted-foreground hover:text-foreground h-8 px-3 border border-border rounded-lg bg-card"
                  >
                    {copied ? <Check className="w-3.5 h-3.5 mr-1.5 text-[#10B981]" /> : <Copy className="w-3.5 h-3.5 mr-1.5" />}
                    Copy TOON
                  </Button>
                </div>

                <TabsContent value="toon" className="mt-3 relative">
                  {toonContent ? (
                    <div className="bg-[#1F2937] rounded-xl p-4 max-h-[400px] overflow-auto">
                      <pre className="text-green-400 font-mono text-sm leading-relaxed whitespace-pre-wrap">{toonContent}</pre>
                    </div>
                  ) : (
                    <div className="bg-[#1F2937] rounded-xl p-8 flex flex-col items-center justify-center min-h-[200px] text-center">
                      <p className="text-gray-400 text-sm">No scan yet.</p>
                      <p className="text-gray-500 text-xs mt-1">Ask Claude to call <code className="font-mono">loom_get_topology</code> to index your codebase.</p>
                    </div>
                  )}
                </TabsContent>
                <TabsContent value="summary" className="mt-3">
                  {stats ? (
                    <div className="p-2 text-sm text-muted-foreground space-y-1">
                      <p>Files scanned: <span className="text-foreground font-semibold">{stats.files.toLocaleString()}</span></p>
                      <p>Raw tokens: <span className="text-foreground font-semibold">{stats.rawTokens.toLocaleString()}</span></p>
                      <p>TOON token estimate: <span className="text-foreground font-semibold">{stats.tokenEstimate.toLocaleString()}</span></p>
                      {stats.tokenReduction > 0 && (
                        <p>Token reduction: <span className="text-[#10B981] font-semibold">{stats.tokenReduction}%</span></p>
                      )}
                      {stats.latencyMs > 0 && (
                        <p>Latency: <span className="text-foreground font-semibold">{stats.latencyMs}ms</span></p>
                      )}
                    </div>
                  ) : (
                    <div className="p-4 text-sm text-muted-foreground">No scan data available yet.</div>
                  )}
                </TabsContent>
              </Tabs>
            </div>
          </div>

          {/* Right: Summary panel (1/3) */}
          <div className="col-span-1 bg-card border border-border rounded-xl shadow-sm p-5 space-y-5">
            <h3 className="text-sm font-semibold text-foreground">Summary</h3>

            {stats ? (
              <>
                <div className="space-y-3">
                  <div className="flex items-baseline justify-between">
                    <span className="text-xs text-muted-foreground">Files Scanned</span>
                    <span className="text-2xl font-bold text-foreground">{stats.files.toLocaleString()}</span>
                  </div>
                  <div className="flex items-baseline justify-between">
                    <span className="text-xs text-muted-foreground">TOON Tokens</span>
                    <span className="text-2xl font-bold text-foreground">{stats.tokenEstimate.toLocaleString()}</span>
                  </div>
                  {stats.tokenReduction > 0 && (
                    <div className="flex items-baseline justify-between">
                      <span className="text-xs text-muted-foreground">Token Reduction</span>
                      <span className="text-2xl font-bold text-[#10B981]">{stats.tokenReduction}%</span>
                    </div>
                  )}
                  <div className="flex items-baseline justify-between">
                    <span className="text-xs text-muted-foreground">Languages Detected</span>
                    <span className="text-sm font-medium text-foreground">{stats.languages.length || '—'}</span>
                  </div>
                </div>

                {stats.languages.length > 0 ? (
                  <div className="h-48">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={stats.languages}
                          innerRadius={40}
                          outerRadius={60}
                          paddingAngle={4}
                          dataKey="value"
                          stroke="none"
                        >
                          {stats.languages.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip
                          contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', fontSize: '11px' }}
                        />
                        <Legend verticalAlign="bottom" iconType="circle" wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                ) : (
                  <div className="h-48 flex items-center justify-center text-muted-foreground text-xs">No data</div>
                )}
              </>
            ) : (
              <div className="space-y-3">
                <div className="flex items-baseline justify-between">
                  <span className="text-xs text-muted-foreground">Files Scanned</span>
                  <span className="text-2xl font-bold text-muted-foreground">—</span>
                </div>
                <div className="flex items-baseline justify-between">
                  <span className="text-xs text-muted-foreground">TOON Tokens</span>
                  <span className="text-2xl font-bold text-muted-foreground">—</span>
                </div>
                <div className="h-48 flex items-center justify-center text-muted-foreground text-xs">No data</div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
