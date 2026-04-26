"use client"

import { useState, useEffect } from "react"
import { Copy, Check, Scan } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts"

const languageData = [
  { name: 'TypeScript', value: 68, color: '#3178C6' },
  { name: 'JavaScript', value: 22, color: '#F7DF1E' },
  { name: 'Python', value: 8, color: '#3776AB' },
  { name: 'Other', value: 2, color: '#6B7280' },
]

const PLACEHOLDER_TOON = `src/auth.ts:
fn:hashPassword(email:string,password:string):Promise<User>
fn:verifyJWT(token:string):JWTPayload|null
type:User{id,email,role,created_at}

src/middleware.ts:
fn:authMiddleware(req,res,next):void
fn:requireAdmin(req,res,next):void

src/index.ts:
fn:registerRoutes(app:Express):void
fn:healthCheck(req,res):void

src/db.ts:
class:Database
  fn:query(sql:string,params:any[]):Promise<any>
  fn:transaction<T>(fn:()=>Promise<T>):Promise<T>`

export default function TopologyPage() {
  const [directory, setDirectory] = useState("src/")
  const [maxDepth, setMaxDepth] = useState(3)
  const [topologyData, setTopologyData] = useState<any>(null)
  const [copied, setCopied] = useState(false)
  const [scanning, setScanning] = useState(false)

  useEffect(() => {
    fetch('http://localhost:2337/api/topology')
      .then(r => r.json())
      .then(data => setTopologyData(data))
      .catch(() => {})
  }, [])

  const handleScan = () => {
    setScanning(true)
    fetch('http://localhost:2337/api/topology')
      .then(r => r.json())
      .then(data => { setTopologyData(data); setScanning(false) })
      .catch(() => setScanning(false))
  }

  const toonContent = topologyData?.toon || PLACEHOLDER_TOON

  const handleCopy = () => {
    navigator.clipboard.writeText(toonContent)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const filesScanned = topologyData?.filesScanned || 482
  const totalTokens = topologyData?.totalTokens || 8247
  const latency = topologyData?.latency || 233

  return (
    <div className="flex flex-col min-h-[calc(100vh-64px)] bg-background">
      <div className="p-8 flex-1 max-w-[1600px] mx-auto w-full space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-foreground">Get Topology</h1>
          <p className="text-sm text-muted-foreground mt-1">Scan your codebase and get AST skeleton (signatures only).</p>
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
              disabled={scanning}
              className="h-10 px-6 bg-[#7C3AED] hover:bg-[#6D28D9] text-white font-medium rounded-lg"
            >
              <Scan className="w-4 h-4 mr-2" />
              {scanning ? 'Scanning...' : 'Scan Directory'}
            </Button>
          </div>
        </div>

        {/* Success badge */}
        <div className="flex items-center gap-2 text-[#10B981] bg-[#ECFDF5] border border-[#D1FAE5] px-4 py-2.5 rounded-xl text-sm font-medium">
          <Check className="w-4 h-4" />
          <span>✓ Scan complete • {filesScanned.toLocaleString()} files scanned • {totalTokens.toLocaleString()} tokens • {latency}ms</span>
        </div>

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
                    className="text-xs font-medium text-muted-foreground hover:text-foreground h-8 px-3 border border-border rounded-lg bg-card"
                  >
                    {copied ? <Check className="w-3.5 h-3.5 mr-1.5 text-[#10B981]" /> : <Copy className="w-3.5 h-3.5 mr-1.5" />}
                    Copy TOON
                  </Button>
                </div>

                <TabsContent value="toon" className="mt-3 relative">
                  <div className="bg-[#1F2937] rounded-xl p-4 overflow-auto max-h-96">
                    <pre className="text-green-400 font-mono text-sm leading-relaxed whitespace-pre-wrap">{toonContent}</pre>
                  </div>
                </TabsContent>
                <TabsContent value="summary" className="mt-3">
                  <div className="p-2 text-sm text-muted-foreground">
                    The scan identified <span className="text-foreground font-semibold">12 core modules</span> with{' '}
                    <span className="text-foreground font-semibold">156 exported symbols</span>. Your codebase structure is
                    highly modular, ideal for AST-aware context tools.
                  </div>
                </TabsContent>
              </Tabs>
            </div>
          </div>

          {/* Right: Summary panel (1/3) */}
          <div className="col-span-1 bg-card border border-border rounded-xl shadow-sm p-5 space-y-5">
            <h3 className="text-sm font-semibold text-foreground">Summary</h3>

            <div className="space-y-3">
              <div className="flex items-baseline justify-between">
                <span className="text-xs text-muted-foreground">Files Scanned</span>
                <span className="text-2xl font-bold text-foreground">{filesScanned.toLocaleString()}</span>
              </div>
              <div className="flex items-baseline justify-between">
                <span className="text-xs text-muted-foreground">Total Tokens (TOON)</span>
                <span className="text-2xl font-bold text-foreground">{totalTokens.toLocaleString()}</span>
              </div>
              <div className="flex items-baseline justify-between">
                <span className="text-xs text-muted-foreground">Estimated Savings</span>
                <span className="text-2xl font-bold text-[#10B981]">92.1%</span>
              </div>
              <div className="flex items-baseline justify-between">
                <span className="text-xs text-muted-foreground">Languages Detected</span>
                <span className="text-sm font-medium text-foreground">4</span>
              </div>
            </div>

            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={languageData}
                    innerRadius={40}
                    outerRadius={60}
                    paddingAngle={4}
                    dataKey="value"
                    stroke="none"
                  >
                    {languageData.map((entry, index) => (
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
          </div>
        </div>
      </div>
    </div>
  )
}
