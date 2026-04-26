"use client"

import { useState, useEffect } from "react"
import { 
  Focus, 
  Search, 
  Copy, 
  X, 
  ArrowRight,
  Zap,
  Code,
  FileCode,
  Eye,
  EyeOff,
  Crosshair,
  Terminal,
  Activity
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"

export default function FocusPage() {
  const [focusedFiles, setFocusedFiles] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  const [target, setTarget] = useState("")

  useEffect(() => {
    const fetchActiveLens = async () => {
      try {
        const res = await fetch('http://localhost:2337/api/active-lens')
        const data = await res.json()
        setFocusedFiles(data.focused || [])
      } catch (e) {
        console.error('Failed to fetch active lens', e)
      } finally {
        setLoading(false)
      }
    }
    
    fetchActiveLens()
    const interval = setInterval(fetchActiveLens, 5000)
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="flex flex-col min-h-[calc(100vh-64px)] bg-[#FAFAFB]">
      <div className="p-8 flex-1 max-w-[1600px] mx-auto w-full space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <h1 className="text-3xl font-extrabold tracking-tight text-[#111827] flex items-center gap-3">
               Focus <Crosshair className="w-6 h-6 text-[#7C3AED]" />
            </h1>
            <p className="text-[#6B7280] font-medium">Page in specific files or symbols into the active context lens.</p>
          </div>
          <div className="flex gap-3">
             <div className="hidden lg:flex items-center gap-2 text-xs font-bold text-[#7C3AED] bg-[#F5F3FF] px-3 py-1.5 rounded-full border border-[#EDE9FE]">
                <Activity className="w-4 h-4" /> Live Sync Active
             </div>
          </div>
        </div>

        <div className="grid grid-cols-12 gap-8">
          {/* Main Content */}
          <div className="col-span-12 xl:col-span-9 space-y-8">
            
            {/* Search/Focus Control */}
            <div className="premium-card p-2 relative overflow-hidden group">
               <div className="absolute inset-0 bg-gradient-to-r from-[#7C3AED]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
               <div className="relative flex items-center gap-2 bg-white rounded-[1.25rem] p-2 border border-[#F3F4F6] shadow-sm">
                 <div className="w-12 h-12 flex items-center justify-center bg-[#F9FAFB] rounded-xl text-[#9CA3AF]">
                    <Search className="w-5 h-5" />
                 </div>
                 <Input 
                   value={target}
                   onChange={(e) => setTarget(e.target.value)}
                   placeholder="e.g. src/auth.ts or src/auth.ts::loginUser" 
                   className="flex-1 border-0 h-12 shadow-none focus-visible:ring-0 text-lg font-mono placeholder:text-[#D1D5DB] placeholder:font-sans" 
                 />
                 <Button className="h-12 px-8 bg-[#111827] hover:bg-[#374151] text-white font-bold rounded-xl shadow-lg transition-all">
                    Focus Target <ArrowRight className="w-4 h-4 ml-2" />
                 </Button>
               </div>
            </div>

            {/* Currently Focused Files (Real Data) */}
            <div className="space-y-4">
              <div className="flex items-center justify-between px-2">
                 <h3 className="text-sm font-black text-[#111827] uppercase tracking-wider">Active Lens Content</h3>
                 <span className="text-xs font-bold text-[#6B7280]">{focusedFiles.length} / 20 Budget Used</span>
              </div>
              
              {loading ? (
                 <div className="premium-card p-12 flex flex-col items-center justify-center text-[#9CA3AF] space-y-4">
                    <div className="w-8 h-8 border-4 border-[#E5E7EB] border-t-[#7C3AED] rounded-full animate-spin" />
                    <span className="text-[10px] font-bold uppercase tracking-widest">Loading Context...</span>
                 </div>
              ) : focusedFiles.length === 0 ? (
                 <div className="premium-card p-16 flex flex-col items-center justify-center text-center space-y-4 bg-gradient-to-b from-white to-[#F9FAFB]">
                    <div className="w-16 h-16 rounded-full bg-[#F3F4F6] flex items-center justify-center mb-2">
                      <Crosshair className="w-8 h-8 text-[#D1D5DB]" />
                    </div>
                    <div>
                      <h3 className="text-lg font-black text-[#111827]">Lens is Empty</h3>
                      <p className="text-sm font-medium text-[#6B7280] max-w-sm mt-1">
                        Search for a file or symbol above to page it into context and reduce token usage.
                      </p>
                    </div>
                 </div>
              ) : (
                <div className="grid gap-4">
                  {focusedFiles.map((file, i) => (
                    <div key={file} className="premium-card p-0 overflow-hidden group border-[#E5E7EB] hover:border-[#7C3AED]/50 transition-colors">
                      <div className="flex flex-col md:flex-row">
                        {/* File Info Bar */}
                        <div className="flex-1 p-6 flex flex-col justify-center bg-white">
                          <div className="flex items-center gap-3 mb-2">
                            <div className="w-8 h-8 rounded-lg bg-[#F5F3FF] flex items-center justify-center border border-[#EDE9FE]">
                              <FileCode className="w-4 h-4 text-[#7C3AED]" />
                            </div>
                            <span className="text-sm font-bold text-[#111827] font-mono break-all">{file}</span>
                          </div>
                          <div className="flex items-center gap-4 pl-11">
                            <span className="text-[10px] font-bold text-[#9CA3AF] uppercase tracking-widest flex items-center gap-1">
                               <Terminal className="w-3 h-3" /> System Prompt Injected
                            </span>
                          </div>
                        </div>
                        
                        {/* Action Area */}
                        <div className="w-full md:w-64 bg-[#F9FAFB] p-6 border-t md:border-t-0 md:border-l border-[#F3F4F6] flex flex-col justify-center gap-3">
                           <Button variant="outline" className="w-full bg-white text-[#111827] font-bold shadow-sm border-[#E5E7EB] hover:border-[#111827]">
                             <Eye className="w-4 h-4 mr-2" /> View Code
                           </Button>
                           <Button variant="ghost" className="w-full text-[#EF4444] font-bold hover:bg-[#FEF2F2]">
                             <EyeOff className="w-4 h-4 mr-2" /> Un-focus
                           </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            
            {/* Feature Demo (Mock Code Viewer) */}
            <div className="premium-card overflow-hidden">
               <div className="px-6 py-4 border-b border-[#F3F4F6] flex items-center justify-between bg-[#F9FAFB]">
                  <div className="flex items-center gap-2">
                     <Code className="w-4 h-4 text-[#9CA3AF]" />
                     <span className="text-xs font-black text-[#111827] uppercase tracking-wider font-mono">Preview Demo</span>
                  </div>
                  <Badge variant="secondary" className="bg-[#E5E7EB] text-[#6B7280] font-bold text-[9px] uppercase tracking-widest">Static Example</Badge>
               </div>
               <div className="bg-[#0F172A] p-6 overflow-x-auto">
                 <pre className="font-mono text-sm leading-relaxed">
                   <span className="text-[#8B5CF6]">export async function</span> <span className="text-[#3B82F6]">loginUser</span><span className="text-slate-300">(username: </span><span className="text-[#10B981]">string</span><span className="text-slate-300">, password: </span><span className="text-[#10B981]">string</span><span className="text-slate-300">) {"{"}</span><br/>
                   <span className="text-slate-300">  const user = </span><span className="text-[#8B5CF6]">await</span><span className="text-slate-300"> db.</span><span className="text-[#3B82F6]">query</span><span className="text-slate-300">(</span><br/>
                   <span className="text-[#F59E0B]">    "SELECT * FROM users WHERE email = ? AND active = true"</span><span className="text-slate-300">,</span><br/>
                   <span className="text-slate-300">    [username]</span><br/>
                   <span className="text-slate-300">  );</span><br/>
                   <br/>
                   <span className="text-slate-300">  </span><span className="text-[#8B5CF6]">if</span><span className="text-slate-300"> (!user) {"{"}</span><br/>
                   <span className="text-slate-300">    </span><span className="text-[#8B5CF6]">throw new</span><span className="text-[#3B82F6]"> Error</span><span className="text-slate-300">(</span><span className="text-[#F59E0B]">"User not found"</span><span className="text-slate-300">);</span><br/>
                   <span className="text-slate-300">  {"}"}</span><br/>
                   <span className="text-slate-300">{"}"}</span>
                 </pre>
               </div>
            </div>

          </div>

          {/* Right Sidebar */}
          <div className="col-span-12 xl:col-span-3 space-y-8">
             <div className="premium-card p-8 space-y-8 overflow-hidden relative">
                <div className="absolute -top-12 -right-12 w-32 h-32 bg-purple-50 rounded-full blur-2xl" />
                
                <div className="space-y-6 relative z-10">
                   <h3 className="text-xs font-black text-[#9CA3AF] uppercase tracking-[0.2em]">Focus Budget</h3>
                   <div className="space-y-2">
                      <div className="flex justify-between items-end">
                         <span className="text-6xl font-black text-[#111827] tracking-tighter">{(focusedFiles.length / 20 * 100).toFixed(0)}%</span>
                         <span className="text-xs font-black text-[#10B981] mb-2 uppercase tracking-tighter">Usage</span>
                      </div>
                      <div className="h-3 bg-[#F3F4F6] rounded-full overflow-hidden shadow-inner">
                        <div 
                          className="h-full bg-gradient-to-r from-[#7C3AED] to-[#9333EA] rounded-full shadow-[0_0_8px_rgba(124,58,237,0.4)] transition-all duration-500" 
                          style={{ width: `${(focusedFiles.length / 20) * 100}%` }} 
                        />
                      </div>
                      <p className="text-[10px] font-bold text-[#6B7280] pt-2">
                        Currently using {focusedFiles.length} out of 20 available focus slots.
                      </p>
                   </div>
                </div>

                <div className="pt-8 border-t border-[#F3F4F6] space-y-6 relative z-10">
                   <p className="text-[10px] font-black text-[#9CA3AF] uppercase tracking-[0.2em]">Why Focus?</p>
                   <ul className="space-y-4">
                     <li className="flex items-start gap-3">
                       <div className="w-1.5 h-1.5 rounded-full bg-[#10B981] mt-1.5 shrink-0" />
                       <span className="text-[11px] font-medium text-[#6B7280] leading-relaxed">
                         <strong className="text-[#111827]">Massive Token Savings:</strong> Only exact files or AST symbols are loaded.
                       </span>
                     </li>
                     <li className="flex items-start gap-3">
                       <div className="w-1.5 h-1.5 rounded-full bg-[#3B82F6] mt-1.5 shrink-0" />
                       <span className="text-[11px] font-medium text-[#6B7280] leading-relaxed">
                         <strong className="text-[#111827]">Sharper Reasoning:</strong> Less noise means Claude makes fewer hallucination errors.
                       </span>
                     </li>
                   </ul>
                </div>
             </div>
          </div>
        </div>
      </div>

      {/* Status Bar */}
      <footer className="h-10 bg-white border-t border-[#F3F4F6] px-8 flex items-center justify-between text-[10px] font-bold text-[#9CA3AF]">
        <div className="flex items-center gap-6">
           <div className="flex items-center gap-2">
             <span className="text-[#111827]">LoomMCP</span>
             <span className="bg-[#F3F4F6] px-1.5 py-0.5 rounded text-[9px]">v0.1.0</span>
           </div>
        </div>
        <div className="flex items-center gap-4">
           <span>Tip: Use syntax like file.ts::functionName to focus precisely.</span>
        </div>
      </footer>
    </div>
  )
}
