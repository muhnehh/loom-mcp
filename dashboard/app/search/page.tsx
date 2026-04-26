"use client"

import { useState } from "react"
import { Search, Filter, FileCode, ChevronRight, ChevronLeft } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"

interface SearchResult {
  raw: string
  tool: string
  timestamp: number
  symbol: string
}

const PAGE_SIZE = 5

export default function SearchPage() {
  const [symbol, setSymbol] = useState("")
  const [scope, setScope] = useState("workspace")
  const [results, setResults] = useState<SearchResult[]>([])
  const [searched, setSearched] = useState(false)
  const [searching, setSearching] = useState(false)
  const [page, setPage] = useState(1)

  const handleSearch = () => {
    if (!symbol.trim()) return
    setSearching(true)
    setSearched(false)
    fetch('http://localhost:2337/api/history')
      .then(r => r.json())
      .then((calls: any[]) => {
        const q = symbol.trim().toLowerCase()
        const refCalls = calls.filter(c =>
          c.tool === 'loom_search_refs' &&
          c.args?.symbol?.toLowerCase().includes(q)
        )
        setResults(refCalls.map((c: any) => ({
          raw: c.result?.preview ?? (typeof c.result === 'string' ? c.result : JSON.stringify(c.result)),
          tool: c.tool,
          timestamp: c.timestamp,
          symbol: c.args?.symbol ?? symbol,
        })))
        setSearched(true)
        setSearching(false)
        setPage(1)
      })
      .catch(() => {
        setSearched(true)
        setSearching(false)
      })
  }

  const totalPages = Math.max(1, Math.ceil(results.length / PAGE_SIZE))
  const paged = results.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  return (
    <div className="flex flex-col min-h-[calc(100vh-64px)] bg-background">
      <div className="p-8 flex-1 max-w-[1600px] mx-auto w-full space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-[28px] font-serif text-foreground">Search References</h1>
          <p className="text-sm text-muted-foreground font-serif italic mt-1">Find all references to a symbol using AST-aware search.</p>
        </div>

        {/* Search bar card */}
        <div className="bg-card border border-border rounded-xl shadow-sm p-6">
          <div className="flex items-center gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                value={symbol}
                onChange={e => setSymbol(e.target.value)}
                placeholder="Enter symbol name..."
                className="pl-9 border-border focus-visible:ring-[#7C3AED] h-10"
                onKeyDown={e => { if (e.key === 'Enter') handleSearch() }}
              />
            </div>
            <Select value={scope} onValueChange={setScope}>
              <SelectTrigger className="w-40 h-10 border-border focus:ring-[#7C3AED]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="workspace">Workspace</SelectItem>
                <SelectItem value="file">File</SelectItem>
                <SelectItem value="directory">Directory</SelectItem>
              </SelectContent>
            </Select>
            <Button
              onClick={handleSearch}
              disabled={searching || !symbol.trim()}
              className="h-10 px-6 bg-[#7C3AED] hover:bg-[#6D28D9] text-white font-medium rounded-lg"
            >
              {searching ? 'Searching...' : 'Search'}
            </Button>
          </div>
        </div>

        {/* Results area */}
        <div className="grid grid-cols-4 gap-6">
          {/* Left: results (3/4) */}
          <div className="col-span-3 space-y-4">
            {!searched ? (
              <div className="bg-card border border-border rounded-xl p-12 flex flex-col items-center justify-center gap-3 text-muted-foreground">
                <Search className="w-10 h-10 opacity-30" />
                <p className="text-sm">Enter a symbol name and click Search.</p>
                <p className="text-xs text-center max-w-xs">
                  Results come from past <code className="font-mono font-semibold">loom_search_refs</code> calls made by Claude.
                </p>
              </div>
            ) : results.length === 0 ? (
              <div className="bg-card border border-border rounded-xl p-12 flex flex-col items-center justify-center gap-3 text-muted-foreground">
                <FileCode className="w-10 h-10 opacity-30" />
                <p className="text-sm font-medium">No results found for &lsquo;{symbol}&rsquo;.</p>
                <p className="text-xs text-center max-w-xs">
                  Try calling <code className="font-mono font-semibold">loom_search_refs</code> in Claude first with this symbol name.
                </p>
              </div>
            ) : (
              <>
                <div className="inline-flex items-center gap-2 text-xs font-medium text-[#10B981] bg-[#ECFDF5] border border-[#D1FAE5] px-3 py-1.5 rounded-full">
                  Found {results.length} result{results.length !== 1 ? 's' : ''}
                </div>

                <div className="space-y-3">
                  {paged.map((r, i) => (
                    <div key={i} className="bg-card border border-border rounded-xl shadow-sm overflow-hidden">
                      <div className="bg-muted border-b border-border px-4 py-2 flex items-center justify-between">
                        <span className="text-xs font-semibold text-foreground font-mono">{r.symbol}</span>
                        <span className="text-[10px] text-muted-foreground">
                          {new Date(r.timestamp).toLocaleTimeString()}
                        </span>
                      </div>
                      <div className="p-4">
                        <pre className="text-xs font-mono text-foreground whitespace-pre-wrap overflow-auto max-h-48 leading-relaxed">
                          {r.raw || '(no preview)'}
                        </pre>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Pagination */}
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">
                    Page {page} of {totalPages}
                  </span>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPage(p => Math.max(1, p - 1))}
                      disabled={page === 1}
                      className="h-8 px-3 text-xs border-border text-muted-foreground"
                    >
                      <ChevronLeft className="w-3.5 h-3.5" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                      disabled={page >= totalPages}
                      className="h-8 px-3 text-xs border-border text-muted-foreground"
                    >
                      <ChevronRight className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Right: filter panel (1/4) */}
          <div className="col-span-1">
            <div className="bg-card border border-border rounded-xl shadow-sm p-5 space-y-5">
              <div className="flex items-center gap-2">
                <Filter className="w-4 h-4 text-muted-foreground" />
                <h3 className="text-sm font-semibold text-foreground">Filters</h3>
              </div>

              <div className="space-y-3">
                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">File Type</p>
                {['.ts', '.js', '.tsx', '.py'].map(ext => (
                  <div key={ext} className="flex items-center justify-between opacity-50">
                    <div className="flex items-center gap-2">
                      <Checkbox disabled className="h-3.5 w-3.5" />
                      <label className="text-xs font-medium text-muted-foreground">{ext}</label>
                    </div>
                  </div>
                ))}
              </div>

              <div className="pt-4 border-t border-border space-y-3">
                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Directory</p>
                {['src/', 'lib/', 'tests/'].map(dir => (
                  <div key={dir} className="flex items-center justify-between opacity-50">
                    <div className="flex items-center gap-2">
                      <Checkbox disabled className="h-3.5 w-3.5" />
                      <label className="text-xs font-medium text-muted-foreground">{dir}</label>
                    </div>
                  </div>
                ))}
                <p className="text-[10px] text-muted-foreground italic">Filters apply after search results are available.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
