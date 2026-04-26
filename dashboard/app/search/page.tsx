"use client"

import { useState } from "react"
import { Search, Filter, FileCode, ChevronRight, ChevronLeft } from "lucide-react"
import { cn } from "@/lib/utils"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Checkbox } from "@/components/ui/checkbox"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

interface RefResult {
  file: string
  line: number
  context: string
  type: 'call' | 'import' | 'type' | 'assignment' | 'definition'
}

const placeholderResults: RefResult[] = [
  { file: 'src/routes.ts', line: 12, context: 'const result = await loginUser(email, pass)', type: 'call' },
  { file: 'src/middleware.ts', line: 42, context: 'return await loginUser(email, pass)', type: 'call' },
  { file: 'src/auth.test.ts', line: 8, context: "import { loginUser } from '../auth'", type: 'import' },
  { file: 'src/api/auth-service.ts', line: 22, context: 'loginUser: (email: string, pass: string) => Promise<User>', type: 'type' },
  { file: 'src/admin.ts', line: 15, context: 'const handler = loginUser', type: 'assignment' },
  { file: 'src/auth.ts', line: 5, context: 'export async function loginUser(email: string, password: string): Promise<User>', type: 'definition' },
]

const typeBadge = {
  call: 'bg-[#EFF6FF] text-[#3B82F6] border-[#BFDBFE]',
  import: 'bg-[#F0FDF4] text-[#16A34A] border-[#BBF7D0]',
  type: 'bg-[#F5F3FF] text-[#7C3AED] border-[#DDD6FE]',
  assignment: 'bg-[#FFF7ED] text-[#EA580C] border-[#FED7AA]',
  definition: 'bg-muted text-muted-foreground border-border',
}

const PAGE_SIZE = 4

export default function SearchPage() {
  const [symbol, setSymbol] = useState("loginUser")
  const [scope, setScope] = useState("workspace")
  const [results, setResults] = useState<RefResult[]>(placeholderResults)
  const [activeTab, setActiveTab] = useState("all")
  const [page, setPage] = useState(1)
  const [searching, setSearching] = useState(false)

  const handleSearch = () => {
    setSearching(true)
    fetch('http://localhost:2337/api/history')
      .then(r => r.json())
      .then((calls: any[]) => {
        const refCalls = calls.filter(c => c.tool === 'loom_search_refs')
        if (refCalls.length > 0) {
          setResults(refCalls[refCalls.length - 1].result || placeholderResults)
        }
        setSearching(false)
        setPage(1)
      })
      .catch(() => setSearching(false))
  }

  const filterByTab = (r: RefResult) => {
    if (activeTab === 'all') return true
    if (activeTab === 'calls') return r.type === 'call'
    if (activeTab === 'imports') return r.type === 'import'
    if (activeTab === 'types') return r.type === 'type'
    if (activeTab === 'assignments') return r.type === 'assignment'
    return true
  }

  const filtered = results.filter(filterByTab)
  const totalPages = Math.ceil(filtered.length / PAGE_SIZE)
  const paged = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  const countByType = (type: string) => results.filter(r => r.type === type).length

  const fileTypes = [...new Set(results.map(r => '.' + r.file.split('.').pop()))].map(ext => ({
    ext,
    count: results.filter(r => r.file.endsWith(ext)).length,
  }))

  const directories = [...new Set(results.map(r => r.file.split('/')[0] + '/'))].map(dir => ({
    dir,
    count: results.filter(r => r.file.startsWith(dir.replace('/', ''))).length,
  }))

  return (
    <div className="flex flex-col min-h-[calc(100vh-64px)] bg-background">
      <div className="p-8 flex-1 max-w-[1600px] mx-auto w-full space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-foreground">Search References</h1>
          <p className="text-sm text-muted-foreground mt-1">Find all references to a symbol using AST-aware search.</p>
        </div>

        {/* Search bar card */}
        <div className="bg-card border border-border rounded-xl shadow-sm p-6">
          <div className="flex items-center gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                value={symbol}
                onChange={e => setSymbol(e.target.value)}
                placeholder="loginUser"
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
              disabled={searching}
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
            {/* Found badge */}
            <div className="inline-flex items-center gap-2 text-xs font-medium text-[#10B981] bg-[#ECFDF5] border border-[#D1FAE5] px-3 py-1.5 rounded-full">
              Found {results.length} references
            </div>

            {/* Results table card */}
            <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden">
              <Tabs value={activeTab} onValueChange={v => { setActiveTab(v); setPage(1) }}>
                <div className="px-5 pt-4 border-b border-border">
                  <TabsList className="bg-transparent h-auto p-0 gap-5">
                    {[
                      { value: 'all', label: 'All', count: results.length },
                      { value: 'calls', label: 'Calls', count: countByType('call') },
                      { value: 'imports', label: 'Imports', count: countByType('import') },
                      { value: 'types', label: 'Type Annotations', count: countByType('type') },
                      { value: 'assignments', label: 'Assignments', count: countByType('assignment') },
                    ].map(tab => (
                      <TabsTrigger
                        key={tab.value}
                        value={tab.value}
                        className="rounded-none border-b-2 border-transparent data-[state=active]:border-[#7C3AED] data-[state=active]:bg-transparent px-0 pb-3 text-xs font-semibold shadow-none data-[state=active]:text-foreground text-muted-foreground flex items-center gap-1.5"
                      >
                        {tab.label}
                        <span className="text-[10px] bg-[#F3F4F6] px-1.5 py-0.5 rounded-full text-muted-foreground">{tab.count}</span>
                      </TabsTrigger>
                    ))}
                  </TabsList>
                </div>

                <TabsContent value={activeTab} className="m-0">
                  <Table>
                    <TableHeader>
                      <TableRow className="border-b border-border hover:bg-transparent bg-muted">
                        <TableHead className="text-[10px] font-bold text-muted-foreground uppercase tracking-wide px-5 py-3">File</TableHead>
                        <TableHead className="text-[10px] font-bold text-muted-foreground uppercase tracking-wide px-5 py-3">Line</TableHead>
                        <TableHead className="text-[10px] font-bold text-muted-foreground uppercase tracking-wide px-5 py-3">Context</TableHead>
                        <TableHead className="text-[10px] font-bold text-muted-foreground uppercase tracking-wide px-5 py-3">Type</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {paged.map((r, i) => (
                        <TableRow key={i} className="border-b border-border last:border-0 hover:bg-muted cursor-pointer">
                          <TableCell className="px-5 py-3">
                            <div className="flex items-center gap-2">
                              <FileCode className="w-3.5 h-3.5 text-muted-foreground" />
                              <span className="text-xs font-mono text-foreground font-medium">{r.file}</span>
                            </div>
                          </TableCell>
                          <TableCell className="px-5 py-3 text-xs text-muted-foreground tabular-nums">{r.line}</TableCell>
                          <TableCell className="px-5 py-3">
                            <span className="text-xs font-mono text-[#374151] bg-muted border border-border px-2 py-1 rounded truncate max-w-[280px] block">
                              {r.context}
                            </span>
                          </TableCell>
                          <TableCell className="px-5 py-3">
                            <span className={cn(
                              'inline-flex items-center text-[10px] font-semibold border px-2 py-0.5 rounded-full capitalize',
                              typeBadge[r.type] || typeBadge.definition
                            )}>
                              {r.type}
                            </span>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TabsContent>
              </Tabs>
            </div>

            {/* Pagination */}
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">
                Page {page} of {Math.max(1, totalPages)}
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
                {fileTypes.map(({ ext, count }) => (
                  <div key={ext} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Checkbox defaultChecked className="data-[state=checked]:bg-[#7C3AED] data-[state=checked]:border-[#7C3AED] h-3.5 w-3.5" />
                      <label className="text-xs font-medium text-foreground">{ext}</label>
                    </div>
                    <span className="text-[10px] text-muted-foreground bg-muted border border-border px-1.5 py-0.5 rounded">{count}</span>
                  </div>
                ))}
              </div>

              <div className="pt-4 border-t border-border space-y-3">
                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Directory</p>
                {directories.map(({ dir, count }) => (
                  <div key={dir} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Checkbox defaultChecked className="data-[state=checked]:bg-[#7C3AED] data-[state=checked]:border-[#7C3AED] h-3.5 w-3.5" />
                      <label className="text-xs font-medium text-foreground">{dir}</label>
                    </div>
                    <span className="text-[10px] text-muted-foreground bg-muted border border-border px-1.5 py-0.5 rounded">{count}</span>
                  </div>
                ))}
                <div className="flex items-center gap-2">
                  <Checkbox defaultChecked className="data-[state=checked]:bg-[#7C3AED] data-[state=checked]:border-[#7C3AED] h-3.5 w-3.5" />
                  <label className="text-xs font-medium text-foreground">All Directories</label>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
