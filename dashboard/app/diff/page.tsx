"use client"

import { useState } from "react"
import { 
  Diff, 
  Copy, 
  FileText, 
  ArrowRight,
  Check,
  ChevronDown,
  Info,
  GitPullRequest,
  RefreshCw,
  Zap,
  Activity,
  History
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

export default function DiffPage() {
  const [loading, setLoading] = useState(false)

  return (
    <div className="flex flex-col min-h-[calc(100vh-64px)] bg-[#FAFAFB]">
      <div className="p-8 flex-1 max-w-[1600px] mx-auto w-full space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <h1 className="text-3xl font-extrabold tracking-tight text-[#111827] flex items-center gap-3">
               Active Diff <Diff className="w-6 h-6 text-[#F97316]" />
            </h1>
            <p className="text-[#6B7280] font-medium">Review the cumulative changes made to the workspace during this session.</p>
          </div>
          <div className="flex gap-3">
             <Button variant="outline" className="border-[#E5E7EB] text-[#6B7280] hover:bg-white hover:border-[#F97316] hover:text-[#F97316] font-bold rounded-xl transition-all h-11 px-6">
                <Copy className="w-4 h-4 mr-2" /> Copy Diff
             </Button>
             <Button className="bg-[#111827] hover:bg-[#374151] text-white font-bold rounded-xl shadow-lg transition-all h-11 px-6">
                <FileText className="w-4 h-4 mr-2" /> View Summary
             </Button>
          </div>
        </div>

        <div className="grid grid-cols-12 gap-8">
          {/* Main Diff Viewer */}
          <div className="col-span-12 xl:col-span-9 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-[#F3F4F6] shadow-sm relative overflow-hidden group">
               <div className="absolute top-0 left-0 w-1 h-full bg-[#10B981]" />
               <div className="flex items-center gap-4">
                 <div className="w-10 h-10 rounded-xl bg-[#F0FDF4] flex items-center justify-center">
                   <Check className="w-5 h-5 text-[#10B981]" />
                 </div>
                 <div>
                   <span className="text-sm font-black text-[#111827] block">Changes retrieved successfully</span>
                   <span className="text-[11px] font-bold text-[#6B7280] flex items-center gap-2 mt-0.5">
                      3 files changed <span className="w-1 h-1 bg-[#D1D5DB] rounded-full" /> 
                      <span className="text-[#10B981]">+156 additions</span> <span className="w-1 h-1 bg-[#D1D5DB] rounded-full" /> 
                      <span className="text-[#EF4444]">-42 deletions</span>
                   </span>
                 </div>
               </div>
               <Button variant="ghost" className="text-[11px] font-bold text-[#F97316] hover:bg-orange-50 h-9 px-4 rounded-lg">
                  <RefreshCw className="w-3.5 h-3.5 mr-2" /> Refresh Diff
               </Button>
            </div>

            <div className="space-y-6">
              {/* File 1 */}
              <div className="premium-card overflow-hidden">
                 <div className="bg-white px-6 py-4 border-b border-[#F3F4F6] flex items-center justify-between">
                   <div className="flex items-center gap-3">
                     <div className="w-6 h-6 rounded bg-[#F9FAFB] border border-[#E5E7EB] flex items-center justify-center cursor-pointer hover:bg-white transition-colors">
                       <ChevronDown className="w-4 h-4 text-[#9CA3AF]" />
                     </div>
                     <span className="text-sm font-bold font-mono text-[#111827]">src/auth.ts</span>
                   </div>
                   <Badge variant="outline" className="text-[10px] font-black bg-[#DCFCE7]/50 text-[#16A34A] border-[#BBF7D0] px-2 py-0.5 tracking-wider">+24 -10</Badge>
                 </div>
                 <div className="bg-[#0F172A] p-6 font-mono text-sm leading-relaxed overflow-x-auto selection:bg-orange-500/30">
                   <pre className="text-slate-300">
{`22  export async function loginUser(username: string, password: string): Promise<User> {
`}<span className="bg-red-500/20 text-red-300 block border-l-2 border-red-500 pl-2">- 23    const user = await db.query("SELECT * FROM users WHERE email = ?", [username]);</span><span className="bg-green-500/20 text-green-300 block border-l-2 border-green-500 pl-2">+ 23    const user = await db.query(
+ 24      "SELECT * FROM users WHERE email = ? AND active = true",
+ 25      [username]
+ 26    );</span>{`27
28    if (!user) {
29      throw new Error("User not found");
30    }
31
`}<span className="bg-green-500/20 text-green-300 block border-l-2 border-green-500 pl-2">+ 32    // Add rate limiting check
+ 33    await checkRateLimit(username);
+ 34</span>{`
35    const isValid = await bcrypt.compare(password, user.password_hash);
36    if (!isValid) {
`}<span className="bg-red-500/20 text-red-300 block border-l-2 border-red-500 pl-2">- 37      throw new Error("Invalid password");</span><span className="bg-green-500/20 text-green-300 block border-l-2 border-green-500 pl-2">+ 37      throw new Error("UNAUTHORIZED: Invalid password or too many attempts");</span>{`38    }
39
40    const token = await generateJWT({`}
                   </pre>
                 </div>
              </div>

              {/* File 2 */}
              <div className="premium-card overflow-hidden opacity-90 hover:opacity-100 transition-opacity">
                 <div className="bg-white px-6 py-4 border-b border-[#F3F4F6] flex items-center justify-between cursor-pointer">
                   <div className="flex items-center gap-3">
                     <div className="w-6 h-6 rounded bg-[#F9FAFB] border border-[#E5E7EB] flex items-center justify-center">
                       <ChevronDown className="w-4 h-4 text-[#9CA3AF] -rotate-90" />
                     </div>
                     <span className="text-sm font-bold font-mono text-[#111827]">src/middleware.ts</span>
                   </div>
                   <Badge variant="outline" className="text-[10px] font-black bg-[#DCFCE7]/50 text-[#16A34A] border-[#BBF7D0] px-2 py-0.5 tracking-wider">+12 -4</Badge>
                 </div>
              </div>

              {/* File 3 */}
              <div className="premium-card overflow-hidden opacity-90 hover:opacity-100 transition-opacity">
                 <div className="bg-white px-6 py-4 border-b border-[#F3F4F6] flex items-center justify-between cursor-pointer">
                   <div className="flex items-center gap-3">
                     <div className="w-6 h-6 rounded bg-[#F9FAFB] border border-[#E5E7EB] flex items-center justify-center">
                       <ChevronDown className="w-4 h-4 text-[#9CA3AF] -rotate-90" />
                     </div>
                     <div className="flex items-center gap-2">
                        <span className="text-sm font-bold font-mono text-[#111827]">src/constants.ts</span>
                        <Badge className="bg-[#FFF7ED] text-[#F97316] hover:bg-[#FFF7ED] border-[#FFEDD5] text-[9px] uppercase tracking-widest px-1.5 py-0">New</Badge>
                     </div>
                   </div>
                   <Badge variant="outline" className="text-[10px] font-black bg-[#DCFCE7]/50 text-[#16A34A] border-[#BBF7D0] px-2 py-0.5 tracking-wider">+72</Badge>
                 </div>
              </div>
            </div>
          </div>

          {/* Right Summary Panel */}
          <div className="col-span-12 xl:col-span-3 space-y-8">
             <div className="premium-card p-8 space-y-6 relative overflow-hidden">
                <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
                  <Activity className="w-32 h-32 text-[#F97316]" />
                </div>
                
                <div className="relative z-10 flex items-center justify-between">
                  <h3 className="text-xs font-black text-[#9CA3AF] uppercase tracking-[0.2em]">Summary</h3>
                  <div className="w-2 h-2 rounded-full bg-[#10B981] animate-pulse" />
                </div>
                
                <div className="space-y-5 relative z-10">
                  <div className="flex justify-between items-center group">
                    <span className="text-xs font-bold text-[#6B7280] group-hover:text-[#111827] transition-colors">Files Changed</span>
                    <span className="text-2xl font-black text-[#111827]">3</span>
                  </div>
                  <div className="flex justify-between items-center group">
                    <span className="text-xs font-bold text-[#6B7280] group-hover:text-[#111827] transition-colors">Additions</span>
                    <span className="text-2xl font-black text-[#10B981]">+156</span>
                  </div>
                  <div className="flex justify-between items-center group">
                    <span className="text-xs font-bold text-[#6B7280] group-hover:text-[#111827] transition-colors">Deletions</span>
                    <span className="text-2xl font-black text-[#EF4444]">-42</span>
                  </div>
                  <div className="pt-5 border-t border-[#F3F4F6] flex justify-between items-center">
                    <span className="text-xs font-bold text-[#6B7280] uppercase tracking-wider">Diff Size</span>
                    <span className="text-sm font-black text-[#F97316] bg-[#FFF7ED] px-2 py-1 rounded border border-[#FFEDD5]">2,847 tokens</span>
                  </div>
                </div>

                <div className="mt-8 p-4 bg-[#F9FAFB] rounded-2xl border border-[#F3F4F6] space-y-3 relative z-10">
                  <div className="flex items-center gap-2">
                    <GitPullRequest className="w-4 h-4 text-[#F97316]" />
                    <span className="text-xs font-black text-[#111827] uppercase tracking-wider">Session Info</span>
                  </div>
                  <div className="space-y-2 pt-2 border-t border-[#E5E7EB]">
                    <div className="flex justify-between items-center">
                      <span className="text-[10px] font-bold text-[#6B7280] uppercase tracking-widest">ID</span>
                      <span className="text-[10px] font-mono text-[#111827] font-bold bg-white px-2 py-0.5 rounded border border-[#E5E7EB]">7f3a2b5c</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-[10px] font-bold text-[#6B7280] uppercase tracking-widest">Turns</span>
                      <span className="text-[10px] font-black text-[#111827]">8</span>
                    </div>
                  </div>
                </div>
             </div>

             <div className="bg-gradient-to-br from-[#F97316] to-[#EA580C] p-6 rounded-[2rem] space-y-3 shadow-xl shadow-orange-200 relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-2 opacity-10 group-hover:opacity-20 transition-opacity">
                  <Zap className="w-16 h-16 text-white fill-white" />
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-white/20 backdrop-blur-sm flex items-center justify-center">
                    <Zap className="w-4 h-4 text-white" />
                  </div>
                  <span className="text-xs font-black text-white uppercase tracking-wider">Pro Tip</span>
                </div>
                <p className="text-[10px] font-medium text-orange-100 leading-relaxed">
                  Use <strong className="text-white">loom_diff_compress</strong> for a token-optimized version of this diff that only shows affected signatures when feeding context back to the AI.
                </p>
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
           <div className="flex items-center gap-2">
              <History className="w-3.5 h-3.5" />
              <span>Latest change: 2:45:32 PM</span>
           </div>
        </div>
      </footer>
    </div>
  )
}
