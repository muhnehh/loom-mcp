"use client"

import { useState } from "react"
import { Copy, Check, CheckCircle } from "lucide-react"
import { cn } from "@/lib/utils"

type DocsSection = "getting-started" | "tools-reference" | "best-practices" | "configuration" | "faq" | "troubleshooting"

const navItems: { key: DocsSection; label: string }[] = [
  { key: "getting-started", label: "Getting Started" },
  { key: "tools-reference", label: "Tools Reference" },
  { key: "best-practices", label: "Best Practices" },
  { key: "configuration", label: "Configuration" },
  { key: "faq", label: "FAQ" },
  { key: "troubleshooting", label: "Troubleshooting" },
]

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false)

  const handleCopy = () => {
    navigator.clipboard.writeText(text).catch(() => {})
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <button
      onClick={handleCopy}
      className="p-1.5 rounded-md hover:bg-card/10 text-[#9CA3AF] hover:text-white transition-colors"
    >
      {copied ? <Check className="w-4 h-4 text-[#10B981]" /> : <Copy className="w-4 h-4" />}
    </button>
  )
}

function CodeBlock({ code }: { code: string }) {
  return (
    <div className="relative bg-[#1F2937] rounded-lg p-3 flex items-center justify-between gap-3 mt-2">
      <code className="text-[#34D399] font-mono text-sm">{code}</code>
      <CopyButton text={code} />
    </div>
  )
}

function Step({ num, title, desc, code }: { num: number; title: string; desc: string; code: string }) {
  return (
    <div className="flex gap-4">
      <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center shrink-0 mt-0.5">
        <span className="text-sm font-bold text-muted-foreground">{num}</span>
      </div>
      <div className="flex-1">
        <p className="text-base font-semibold text-foreground">{title}</p>
        <p className="text-sm text-muted-foreground mt-0.5">{desc}</p>
        <CodeBlock code={code} />
      </div>
    </div>
  )
}

function GettingStarted() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-foreground">Getting Started</h2>
        <p className="text-sm text-muted-foreground mt-1">Connect to Claude Code in 3 steps</p>
      </div>

      <div className="space-y-6">
        <Step
          num={1}
          title="Install LoomMCP"
          desc="Install the LoomMCP server using npx."
          code="npx @loom-mcp/server start"
        />
        <Step
          num={2}
          title="Add to Claude Code"
          desc="Register LoomMCP as an MCP server in Claude Code."
          code="/mcp add stdio npx @loom-mcp/server"
        />
        <Step
          num={3}
          title="Start Using Tools"
          desc="Begin with loom_get_topology to understand your codebase."
          code="loom_get_topology"
        />
      </div>

      {/* Success card */}
      <div className="bg-[#ECFDF5] border border-[#D1FAE5] rounded-xl p-4 flex items-start gap-3">
        <CheckCircle className="w-5 h-5 text-[#10B981] shrink-0 mt-0.5" />
        <div>
          <p className="text-sm font-semibold text-[#166534]">You&apos;re all set!</p>
          <p className="text-sm text-[#166534] mt-0.5">Check out the Tools Reference to learn more.</p>
        </div>
      </div>
    </div>
  )
}

function PlaceholderSection({ title }: { title: string }) {
  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold text-foreground">{title}</h2>
      <p className="text-sm text-muted-foreground">This section is coming soon.</p>
    </div>
  )
}

export default function DocsPage() {
  const [section, setSection] = useState<DocsSection>("getting-started")

  return (
    <div className="flex flex-col min-h-[calc(100vh-64px)] bg-background">
      <div className="p-8 flex-1 max-w-[1600px] mx-auto w-full space-y-6">
        {/* Header */}
        <div className="space-y-1">
          <h1 className="text-[28px] font-serif text-foreground">Documentation</h1>
          <p className="text-sm text-muted-foreground font-serif italic">Everything you need to know about LoomMCP.</p>
        </div>

        <div className="flex gap-6 items-start">
          {/* Left Nav */}
          <div className="bg-card border border-border rounded-xl shadow-sm p-4 w-48 shrink-0 space-y-0.5">
            {navItems.map((item) => (
              <button
                key={item.key}
                onClick={() => setSection(item.key)}
                className={cn(
                  "w-full text-left px-3 py-2 rounded-lg text-sm transition-colors",
                  section === item.key
                    ? "font-bold text-[#7C3AED] bg-[#F5F3FF]"
                    : "font-medium text-muted-foreground hover:text-foreground hover:bg-muted"
                )}
              >
                {item.label}
              </button>
            ))}
          </div>

          {/* Right Content */}
          <div className="flex-1 bg-card border border-border rounded-xl shadow-sm p-6">
            {section === "getting-started" && <GettingStarted />}
            {section === "tools-reference" && <PlaceholderSection title="Tools Reference" />}
            {section === "best-practices" && <PlaceholderSection title="Best Practices" />}
            {section === "configuration" && <PlaceholderSection title="Configuration" />}
            {section === "faq" && <PlaceholderSection title="FAQ" />}
            {section === "troubleshooting" && <PlaceholderSection title="Troubleshooting" />}
          </div>
        </div>
      </div>
    </div>
  )
}
