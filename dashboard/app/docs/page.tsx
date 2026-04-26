"use client"

import { 
  BookOpen, 
  ChevronRight, 
  ExternalLink, 
  Zap, 
  Info, 
  Terminal,
  Cpu,
  Layers,
  Focus
} from "lucide-react"
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"

export default function DocsPage() {
  return (
    <div className="p-8 max-w-[1200px] mx-auto space-y-8">
      {/* Header */}
      <div className="space-y-1">
        <h1 className="text-3xl font-bold tracking-tight text-[#111827]">Documentation</h1>
        <p className="text-[#6B7280]">Learn how to use LoomMCP to build context-aware AI agents.</p>
      </div>

      <div className="grid grid-cols-12 gap-8">
        <div className="col-span-12 xl:col-span-8 space-y-8">
           <section className="space-y-4">
              <h2 className="text-xl font-bold text-[#111827]">Introduction</h2>
              <p className="text-sm text-[#6B7280] leading-relaxed">
                LoomMCP is an AST-aware context compiler designed specifically for coding agents like Claude Code. 
                Instead of sending massive amounts of raw code to the LLM, LoomMCP allows agents to "page in" only the 
                relevant code signatures and implementation details they need.
              </p>
           </section>

           <section className="space-y-4">
              <h2 className="text-xl font-bold text-[#111827]">Core Concepts</h2>
              <div className="grid grid-cols-2 gap-4">
                 {[
                   { title: 'AST-aware Indexing', icon: Layers, desc: 'Loom understands the structure of your code, not just the text.' },
                   { title: 'TOON Compression', icon: Cpu, desc: 'Our proprietary wire format for extremely dense code representations.' },
                   { title: 'Smart Focus', icon: Focus, desc: 'Never send more code than what fits in the immediate context.' },
                   { title: 'Active Lens', icon: Zap, desc: 'Track exactly what the AI agent is "seeing" in real-time.' },
                 ].map((feature) => (
                   <div key={feature.title} className="flex gap-4 p-4 bg-white border border-[#E5E7EB] rounded-xl hover:border-[#7C3AED] transition-all">
                      <div className="w-10 h-10 bg-[#F3F0FF] rounded-lg flex items-center justify-center shrink-0">
                        <feature.icon className="w-5 h-5 text-[#7C3AED]" />
                      </div>
                      <div className="space-y-1">
                         <h3 className="text-sm font-bold text-[#111827]">{feature.title}</h3>
                         <p className="text-[11px] text-[#6B7280] leading-relaxed">{feature.desc}</p>
                      </div>
                   </div>
                 ))}
              </div>
           </section>

           <section className="space-y-4">
              <h2 className="text-xl font-bold text-[#111827]">Installation</h2>
              <div className="bg-[#0F172A] p-6 rounded-xl font-mono text-sm">
                 <div className="flex items-center justify-between mb-4">
                    <div className="flex gap-1.5">
                       <div className="w-2.5 h-2.5 bg-[#EF4444] rounded-full" />
                       <div className="w-2.5 h-2.5 bg-[#F59E0B] rounded-full" />
                       <div className="w-2.5 h-2.5 bg-[#10B981] rounded-full" />
                    </div>
                    <span className="text-[10px] text-slate-500">bash</span>
                 </div>
                 <pre className="text-slate-300">
{`# Install globally
npm install -g loommcp

# Run with Claude Code
claude-code --mcp loommcp`}
                 </pre>
              </div>
           </section>
        </div>

        <div className="col-span-12 xl:col-span-4 space-y-8">
           <Card className="border-[#E5E7EB] shadow-sm">
              <CardHeader>
                <CardTitle className="text-sm font-semibold">Resources</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                 {[
                   'GitHub Repository',
                   'API Reference',
                   'Architecture Overview',
                   'Contributing Guide',
                   'Security Policy'
                 ].map((link) => (
                   <div key={link} className="flex items-center justify-between group cursor-pointer">
                      <span className="text-xs text-[#6B7280] group-hover:text-[#111827] transition-colors">{link}</span>
                      <ExternalLink className="w-3.5 h-3.5 text-[#9CA3AF] group-hover:text-[#7C3AED]" />
                   </div>
                 ))}
              </CardContent>
           </Card>

           <div className="p-6 bg-[#F3F0FF] rounded-xl border border-[#DDD6FE] space-y-4">
              <div className="flex items-center gap-2">
                <Info className="w-4 h-4 text-[#7C3AED]" />
                <span className="text-sm font-bold text-[#7C3AED]">Need Help?</span>
              </div>
              <p className="text-xs text-[#6B7280] leading-relaxed">
                Join our Discord community or open an issue on GitHub if you encounter any problems.
              </p>
              <Button className="w-full bg-[#7C3AED] hover:bg-[#6D28D9] font-bold">Join Discord</Button>
           </div>
        </div>
      </div>
    </div>
  )
}
