"use client"

import { useState, useEffect } from "react"
import { Info, FileCode } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

interface FocusedFile {
  path: string
}

export default function FocusPage() {
  const [target, setTarget] = useState("")
  const [focused, setFocused] = useState<FocusedFile[]>([])
  const [toast, setToast] = useState("")
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('http://localhost:2337/api/active-lens')
      .then(r => r.json())
      .then(d => {
        const files: FocusedFile[] = (d.focused || []).map((p: string) => ({ path: p }))
        setFocused(files)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  const handleFocus = () => {
    if (!target.trim()) return
    setToast("Files are focused when Claude calls loom_focus. Use Claude to focus this file.")
    setTimeout(() => setToast(""), 4000)
  }

  return (
    <div className="flex flex-col min-h-[calc(100vh-64px)] bg-background">
      <div className="p-8 flex-1 max-w-[1600px] mx-auto w-full space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-[28px] font-serif text-foreground">Focus</h1>
          <p className="text-sm text-muted-foreground font-serif italic mt-1">Page in the code you need. Be intentional with your focus budget.</p>
        </div>

        {/* Info note */}
        <div className="flex items-start gap-2 bg-[#F5F3FF] border border-[#DDD6FE] text-[#7C3AED] px-4 py-3 rounded-xl text-xs">
          <Info className="w-4 h-4 mt-0.5 shrink-0" />
          <span>Files are focused when Claude calls <code className="font-mono font-semibold">loom_focus</code>. Focused files appear here.</span>
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

        {/* Focused files list */}
        <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden">
          <div className="px-5 py-3 border-b border-border bg-muted flex items-center justify-between">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Focused Files</span>
            <span className="text-xs font-medium text-foreground">{focused.length} / 20</span>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-12 text-muted-foreground text-sm">
              Loading...
            </div>
          ) : focused.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 gap-3 text-muted-foreground">
              <FileCode className="w-10 h-10 opacity-30" />
              <p className="text-sm font-medium">No files focused yet.</p>
              <p className="text-xs text-center max-w-xs">
                Ask Claude to call <code className="font-mono font-semibold">loom_focus</code> on a file to see it here.
              </p>
            </div>
          ) : (
            <ul className="divide-y divide-border">
              {focused.map((file, i) => (
                <li key={i} className="flex items-center gap-3 px-5 py-3 hover:bg-muted transition-colors">
                  <FileCode className="w-4 h-4 text-muted-foreground shrink-0" />
                  <span className="text-sm font-mono text-foreground truncate">{file.path}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  )
}
