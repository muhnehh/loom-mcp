"use client"

import { useState } from "react"
import { 
  Network, 
  Search, 
  Scan, 
  Copy, 
  Check, 
  ArrowRight,
  Info,
  Clock,
  Zap,
  Code
} from "lucide-react"
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts"

const languageData = [
  { name: 'TypeScript', value: 68, color: '#3178C6' },
  { name: 'Python', value: 22, color: '#3776AB' },
  { name: 'JavaScript', value: 8, color: '#F7DF1E' },
  { name: 'Other', value: 2, color: '#6B7280' },
]

export default function TopologyPage() {
  const [isScanned, setIsScanned] = useState(true)

  return (
    <div className="flex flex-col min-h-[calc(100vh-64px)]">
      <div className="p-8 flex-1 max-w-[1600px] mx-auto w-full space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <h1 className="text-3xl font-extrabold tracking-tight text-[#111827]">Get Topology</h1>
            <p className="text-[#6B7280] font-medium">Scan your codebase and get AST skeleton (signatures only).</p>
          </div>
          <div className="flex items-center gap-3">
             <Button variant="outline" className="border-[#E5E7EB] text-[#6B7280] hover:bg-white hover:border-[#7C3AED] hover:text-[#7C3AED] font-bold rounded-xl transition-all h-11 px-6 shadow-sm">
                <Clock className="w-4 h-4 mr-2" /> View History
             </Button>
          </div>
        </div>

        {/* Controls */}
        <div className="premium-card p-8">
          <div className="flex items-end gap-8">
            <div className="flex-1 space-y-3">
              <label className="text-xs font-black text-[#9CA3AF] uppercase tracking-[0.2em] ml-1">Project Directory</label>
              <div className="relative group">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#9CA3AF] group-focus-within:text-[#7C3AED] transition-colors">
                  <Search />
                </div>
                <Input placeholder="e.g. src/" className="pl-12 h-14 border-[#E5E7EB] focus-visible:ring-[#7C3AED] rounded-2xl bg-[#F9FAFB] focus:bg-white transition-all font-mono font-bold text-sm" defaultValue="src/" />
              </div>
            </div>
            <div className="w-40 space-y-3">
              <label className="text-xs font-black text-[#9CA3AF] uppercase tracking-[0.2em] ml-1">Max Depth</label>
              <Select defaultValue="3">
                <SelectTrigger className="h-14 border-[#E5E7EB] focus:ring-[#7C3AED] rounded-2xl bg-[#F9FAFB] focus:bg-white transition-all font-bold">
                  <SelectValue placeholder="Depth" />
                </SelectTrigger>
                <SelectContent className="rounded-xl border-[#F3F4F6] shadow-xl">
                  <SelectItem value="1" className="font-bold">Depth 1</SelectItem>
                  <SelectItem value="2" className="font-bold">Depth 2</SelectItem>
                  <SelectItem value="3" className="font-bold">Depth 3</SelectItem>
                  <SelectItem value="5" className="font-bold">Depth 5</SelectItem>
                  <SelectItem value="10" className="font-bold">Depth 10</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button className="h-14 px-10 bg-gradient-to-r from-[#7C3AED] to-[#9333EA] hover:opacity-90 font-black rounded-2xl shadow-xl shadow-purple-200 transition-all active:scale-95 flex items-center gap-3">
              <Scan className="w-5 h-5" /> Scan Directory
            </Button>
          </div>
        </div>

        {isScanned && (
          <div className="grid grid-cols-12 gap-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Main Preview */}
            <div className="col-span-12 xl:col-span-8 space-y-8">
              <div className="flex items-center gap-4 text-[#10B981] bg-[#ECFDF5] px-6 py-4 rounded-2xl border border-[#D1FAE5] shadow-sm">
                 <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center shadow-sm">
                    <Check className="w-5 h-5" />
                 </div>
                 <div className="flex flex-col">
                    <span className="text-sm font-black uppercase tracking-tight">Scan complete</span>
                    <span className="text-xs font-bold opacity-80">482 files scanned • 8,247 tokens • 210ms</span>
                 </div>
              </div>

              <div className="premium-card overflow-hidden flex flex-col min-h-[600px]">
                <Tabs defaultValue="toon" className="w-full flex-1 flex flex-col">
                  <div className="px-8 pt-6 border-b border-[#F3F4F6] flex items-center justify-between bg-[#F9FAFB]/50">
                    <TabsList className="bg-transparent h-auto p-0 gap-10">
                      <TabsTrigger value="toon" className="rounded-none border-b-2 border-transparent data-[state=active]:border-[#7C3AED] data-[state=active]:bg-transparent px-0 pb-6 text-xs font-black uppercase tracking-[0.2em] shadow-none data-[state=active]:text-[#7C3AED] transition-all">TOON View</TabsTrigger>
                      <TabsTrigger value="summary" className="rounded-none border-b-2 border-transparent data-[state=active]:border-[#7C3AED] data-[state=active]:bg-transparent px-0 pb-6 text-xs font-black uppercase tracking-[0.2em] shadow-none data-[state=active]:text-[#7C3AED] transition-all">Summary</TabsTrigger>
                    </TabsList>
                    <Button variant="ghost" size="sm" className="h-10 px-4 mb-4 rounded-xl border border-[#E5E7EB] bg-white text-[11px] font-black text-[#6B7280] hover:text-[#111827] shadow-sm transition-all flex items-center gap-2">
                      <Copy className="w-3.5 h-3.5" /> Copy TOON
                    </Button>
                  </div>
                  <TabsContent value="toon" className="m-0 flex-1 relative">
                    <div className="absolute inset-0 bg-[#0F172A] p-8 font-mono text-[13px] leading-relaxed overflow-auto selection:bg-purple-500/30">
                      <pre className="text-slate-300">
                        <span className="text-purple-400 font-bold">src/auth.ts:</span>
  <span className="text-blue-400">fn</span>:loginUser(username:<span className="text-orange-400">string</span>,password:<span className="text-orange-400">string</span>):<span className="text-green-400">Promise&lt;User&gt;</span>
  <span className="text-blue-400">fn</span>:verifyJWT(token:<span className="text-orange-400">string</span>):<span className="text-green-400">Promise&lt;bool&gt;</span>
  <span className="text-blue-400">fn</span>:refreshJWT(token:<span className="text-orange-400">string</span>):<span className="text-green-400">Promise&lt;string&gt;</span>
  <span className="text-blue-400">type</span>:<span className="text-yellow-400">User</span>{id:<span className="text-orange-400">string</span>,name:<span className="text-orange-400">string</span>,role:<span className="text-orange-400">string</span>}
  <span className="text-blue-400">type</span>:<span className="text-yellow-400">JWTData</span>{sub:<span className="text-orange-400">string</span>,exp:<span className="text-orange-400">number</span>}
<span className="text-purple-400 font-bold">class:AuthService</span>
  <span className="text-blue-400">fn</span>:constructor(db:<span className="text-yellow-400">DB</span>):<span className="text-orange-400">void</span>
  <span className="text-blue-400">fn</span>:hashPassword(password:<span className="text-orange-400">string</span>):<span className="text-green-400">Promise&lt;string&gt;</span>

<span className="text-purple-400 font-bold">src/middleware.ts:</span>
  <span className="text-blue-400">fn</span>:authMiddleware(req,res,next):<span className="text-orange-400">void</span>
  <span className="text-blue-400">fn</span>:requireAdmin(req,res,next):<span className="text-orange-400">void</span>
  <span className="text-blue-400">fn</span>:loggerMiddleware(req,res,next):<span className="text-orange-400">void</span>

<span className="text-purple-400 font-bold">src/index.ts:</span>
  <span className="text-blue-400">fn</span>:registerRoutes(app:<span className="text-yellow-400">Express</span>):<span className="text-orange-400">void</span>
  <span className="text-blue-400">fn</span>:healthCheck(req,res):<span className="text-orange-400">void</span>

<span className="text-purple-400 font-bold">src/db.ts:</span>
  <span className="text-purple-400 font-bold">class:Database</span>
    <span className="text-blue-400">fn</span>:query(sql:<span className="text-orange-400">string</span>,params:<span className="text-orange-400">any[]</span>):<span className="text-green-400">Promise&lt;any&gt;</span>
    <span className="text-blue-400">fn</span>:transaction&lt;T&gt;(fn:()=&gt;<span className="text-green-400">Promise&lt;T&gt;</span>):<span className="text-green-400">Promise&lt;T&gt;</span>

<span className="text-purple-400 font-bold">src/types.ts:</span>
  <span className="text-blue-400">type</span>:<span className="text-yellow-400">APIResponse</span>&lt;T&gt;{success:<span className="text-orange-400">boolean</span>,data:T,message:<span className="text-orange-400">string</span>}
  <span className="text-blue-400">type</span>:<span className="text-yellow-400">ErrorCodes</span>{UNAUTHORIZED,NOT_FOUND,SERVER_ERROR}
                      </pre>
                    </div>
                  </TabsContent>
                  <TabsContent value="summary" className="p-8">
                    <div className="space-y-6">
                      <div className="flex items-center gap-3">
                         <div className="w-10 h-10 rounded-xl bg-purple-50 flex items-center justify-center">
                            <Code className="w-5 h-5 text-[#7C3AED]" />
                         </div>
                         <h4 className="font-black text-[#111827] uppercase tracking-wider">Module Breakdown</h4>
                      </div>
                      <p className="text-sm text-[#6B7280] leading-relaxed max-w-2xl font-medium">
                        The scan identified <span className="text-[#111827] font-bold">12 core modules</span> with <span className="text-[#111827] font-bold">156 exported symbols</span>. Your codebase structure is highly modular, which is ideal for AST-aware tools like LoomMCP.
                      </p>
                    </div>
                  </TabsContent>
                </Tabs>
              </div>
            </div>

            {/* Right Summary Panel */}
            <div className="col-span-12 xl:col-span-4 space-y-8">
              <div className="premium-card p-8 space-y-8 overflow-hidden relative">
                <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
                   <Network className="w-32 h-32 text-[#7C3AED]" />
                </div>
                
                <h3 className="text-xs font-black text-[#9CA3AF] uppercase tracking-[0.2em] relative z-10">Scan Summary</h3>
                
                <div className="grid grid-cols-2 gap-8 relative z-10">
                   <div className="space-y-1">
                     <p className="text-[10px] font-black text-[#9CA3AF] uppercase tracking-widest">Files Scanned</p>
                     <p className="text-3xl font-black text-[#111827] tracking-tighter">482</p>
                   </div>
                   <div className="space-y-1">
                     <p className="text-[10px] font-black text-[#7C3AED] uppercase tracking-widest">TOON Tokens</p>
                     <p className="text-3xl font-black text-[#7C3AED] tracking-tighter">8,247</p>
                   </div>
                </div>

                <div className="pt-8 border-t border-[#F3F4F6] space-y-4 relative z-10">
                   <p className="text-[10px] font-black text-[#10B981] uppercase tracking-widest">Estimated Savings</p>
                   <div className="flex items-baseline gap-2">
                     <span className="text-5xl font-black text-[#10B981] tracking-tighter">92.1%</span>
                     <span className="text-xs font-bold text-[#6B7280] opacity-60">VS RAW</span>
                   </div>
                </div>

                <div className="space-y-4 pt-8 border-t border-[#F3F4F6] relative z-10">
                  <p className="text-[10px] font-black text-[#9CA3AF] uppercase tracking-widest">Languages Detected</p>
                  <div className="h-[250px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={languageData}
                          innerRadius={70}
                          outerRadius={95}
                          paddingAngle={8}
                          dataKey="value"
                          stroke="none"
                        >
                          {languageData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip 
                          contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)', fontSize: '11px', fontWeight: 'bold' }}
                        />
                        <Legend verticalAlign="bottom" align="center" iconType="circle" wrapperStyle={{ fontSize: '11px', fontWeight: 'bold', paddingTop: '30px' }} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                <div className="p-6 bg-gradient-to-br from-[#F5F3FF] to-white rounded-3xl border border-[#DDD6FE] shadow-sm relative overflow-hidden group">
                  <div className="absolute top-0 right-0 p-3 opacity-5 group-hover:opacity-10 transition-opacity">
                     <Zap className="w-16 h-16 text-[#7C3AED] fill-[#7C3AED]" />
                  </div>
                  <div className="flex items-center gap-3 mb-3 relative z-10">
                    <div className="w-8 h-8 rounded-xl bg-white shadow-sm flex items-center justify-center">
                       <Zap className="w-4 h-4 text-[#7C3AED]" />
                    </div>
                    <span className="text-xs font-black text-[#111827] uppercase tracking-wider">Why AST Search?</span>
                  </div>
                  <ul className="space-y-3 relative z-10">
                     {[
                       'No false positives from comments',
                       'Understand scope & inheritance',
                       '10x fewer tokens than grep',
                     ].map((item, i) => (
                       <li key={i} className="flex items-center gap-3 text-[11px] font-bold text-[#6B7280]">
                         <div className="w-1.5 h-1.5 bg-[#7C3AED] rounded-full" />
                         {item}
                       </li>
                     ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <footer className="h-10 bg-white border-t border-[#F3F4F6] px-8 flex items-center justify-between text-[10px] font-bold text-[#9CA3AF]">
        <div className="flex items-center gap-6">
           <div className="flex items-center gap-2">
             <span className="text-[#111827]">LoomMCP</span>
             <span className="bg-[#F3F4F6] px-1.5 py-0.5 rounded text-[9px]">v0.1.0</span>
           </div>
           <div className="flex items-center gap-2">
             <div className="w-1.5 h-1.5 rounded-full bg-[#10B981]" />
             <span>Scanner: Tree-sitter active</span>
           </div>
        </div>
        <div className="flex items-center gap-4">
           <span>TOON format v2.0 • SHA-256 integrity active</span>
        </div>
      </footer>
    </div>
  )
}
  )
}
