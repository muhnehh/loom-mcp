"use client"

import { useState, useEffect } from "react"
import { Copy, X, Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

const PLACEHOLDER_CODE = `export async function loginUser(
  email: string,
  password: string,
): Promise<User> {
  const user = await db.query(...)
  if (!user) throw new Error("User not found")
  const valid = await bcrypt.compare(password, user.hash)
  if (!valid) throw new Error("Invalid password")
  return generateSession(user)
}`

interface FocusedFile {
  path: string
  lines: number
  tokens: number
  focusedAt: string
  deps: number
}

export default function FocusPage() {
  const [target, setTarget] = useState("")
  const [focused, setFocused] = useState<FocusedFile[]>([])
  const [toast, setToast] = useState("")
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    fetch('http://localhost:2337/api/active-lens')
      .then(r => r.json())
      .then(d => {
        const files: FocusedFile[] = (d.focused || []).map((p: string) => ({
          path: p,
          lines: 42,
          tokens: 1204,
          focusedAt: new Date().toLocaleTimeString(),
          deps: 3,
        }))
        setFocused(files)
      })
      .catch(() => {})
  }, [])

  const handleFocus = () => {
    if (!target.trim()) return
    setToast("Connect to loom_focus MCP tool to focus files.")
    setTimeout(() => setToast(""), 3000)
  }

  const handleUnfocus = (path: string) => {
    setFocused(prev => prev.filter(f => f.path !== path))
  }

  const handleCopyCode = () => {
    navigator.clipboard.writeText(PLACEHOLDER_CODE)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const displayFile: FocusedFile = focused[0] || {
    path: 'src/auth.ts::loginUser',
    lines: 42,
    tokens: 1204,
    focusedAt: '2:42:18 PM',
    deps: 3,
  }

  return (
    <div className="flex flex-col min-h-[calc(100vh-64px)] bg-background">
      <div className="p-8 flex-1 max-w-[1600px] mx-auto w-full space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-foreground">Focus</h1>
          <p className="text-sm text-muted-foreground mt-1">Page in the code you need. Be intentional with your focus budget.</p>
        </div>

        {/* Toast */}
        {toast && (
          <div className="bg-[#F5F3FF] border border-[#DDD6FE] text-[#7C3AED] text-sm px-4 py-3 rounded-xl">
            {toast}
          </div>
        )}

        {/* Input card */}
        <div className="bg-card border border-border rounded-xl shadow-sm p-6">
          <label className="text-sm font-medium text-foreground block mb-2">Target</label>
          <div className="flex items-center gap-3">
            <Input
              value={target}
              onChange={e => setTarget(e.target.value)}
              placeholder="src/auth.ts::loginUser"
              className="flex-1 border-border focus-visible:ring-[#7C3AED] h-10"
              onKeyDown={e => { if (e.key === 'Enter') handleFocus() }}
            />
            <Button
              onClick={handleFocus}
              className="h-10 px-6 bg-[#7C3AED] hover:bg-[#6D28D9] text-white font-medium rounded-lg"
            >
              Focus
            </Button>
          </div>
          <p className="text-[11px] text-muted-foreground mt-2">
            Example: src/auth.ts or src/auth.ts::loginUser
          </p>
        </div>

        {/* Focused file card */}
        <div className="bg-card border border-border rounded-xl shadow-sm p-5 space-y-3">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1 text-xs font-medium text-[#10B981] bg-[#ECFDF5] border border-[#D1FAE5] px-2 py-0.5 rounded-full">
              <Check className="w-3 h-3" /> Focused
            </span>
          </div>
          <div>
            <p className="text-sm font-bold text-foreground font-mono">{displayFile.path}</p>
            <p className="text-xs text-muted-foreground mt-0.5">
              {displayFile.lines} lines • {displayFile.tokens.toLocaleString()} tokens • {displayFile.deps} Dependencies
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleCopyCode}
              className="h-8 px-3 text-xs font-medium border-border text-muted-foreground hover:text-foreground"
            >
              {copied ? <Check className="w-3.5 h-3.5 mr-1.5 text-[#10B981]" /> : <Copy className="w-3.5 h-3.5 mr-1.5" />}
              Copy Code
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleUnfocus(displayFile.path)}
              className="h-8 px-3 text-xs font-medium text-[#EF4444] hover:bg-[#FEF2F2] hover:text-[#EF4444]"
            >
              <X className="w-3.5 h-3.5 mr-1.5" />
              Un-focus
            </Button>
          </div>
        </div>

        {/* Dark code preview */}
        <div className="bg-[#1F2937] rounded-xl p-4 overflow-auto">
          <pre className="text-green-300 font-mono text-sm leading-relaxed">{PLACEHOLDER_CODE}</pre>
        </div>
      </div>
    </div>
  )
}
