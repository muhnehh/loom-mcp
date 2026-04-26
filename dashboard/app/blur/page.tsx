"use client"

import { useState, useEffect } from "react"
import { X, Info } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

interface FocusedFile {
  path: string
  lines: number
  tokens: number
  focusedAt: string
}

const DEFAULT_FILES: FocusedFile[] = [
  { path: 'src/auth.ts::loginUser', lines: 42, tokens: 1204, focusedAt: '2:42:18 PM' },
  { path: 'src/middleware.ts', lines: 128, tokens: 2847, focusedAt: '2:41:02 PM' },
  { path: 'src/types.ts', lines: 76, tokens: 1943, focusedAt: '2:38:48 PM' },
]

const FOCUS_BUDGET = 20

export default function BlurPage() {
  const [files, setFiles] = useState<FocusedFile[]>(DEFAULT_FILES)

  useEffect(() => {
    fetch('http://localhost:2337/api/active-lens')
      .then(r => r.json())
      .then(d => {
        const focused: string[] = d.focused || []
        if (focused.length > 0) {
          setFiles(focused.map((p, i) => ({
            path: p,
            lines: DEFAULT_FILES[i]?.lines || 42,
            tokens: DEFAULT_FILES[i]?.tokens || 1204,
            focusedAt: new Date().toLocaleTimeString(),
          })))
        }
      })
      .catch(() => {})
  }, [])

  const handleUnfocus = (path: string) => {
    setFiles(prev => prev.filter(f => f.path !== path))
  }

  const handleUnfocusAll = () => {
    setFiles([])
  }

  const focusPercent = Math.round((files.length / FOCUS_BUDGET) * 100)

  return (
    <div className="flex flex-col min-h-[calc(100vh-64px)] bg-background">
      <div className="p-8 flex-1 max-w-[1600px] mx-auto w-full space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-[28px] font-serif text-foreground">Blur (Un-focus Files)</h1>
          <p className="text-sm text-muted-foreground font-serif italic mt-1">Remove files from the active lens to free up focus budget.</p>
        </div>

        {/* Main card */}
        <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden">
          {/* Card header */}
          <div className="px-5 py-3 border-b border-border flex items-center justify-between">
            <span className="text-sm font-semibold text-foreground">
              Currently Focused ({files.length} / {FOCUS_BUDGET})
            </span>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleUnfocusAll}
              className="h-7 px-3 text-xs font-medium text-[#EF4444] hover:bg-[#FEF2F2] hover:text-[#EF4444]"
            >
              Un-focus All
            </Button>
          </div>

          {/* Table */}
          <Table>
            <TableHeader>
              <TableRow className="border-b border-border hover:bg-transparent bg-muted">
                <TableHead className="text-[10px] font-bold text-muted-foreground uppercase tracking-wide px-5 py-3">File</TableHead>
                <TableHead className="text-[10px] font-bold text-muted-foreground uppercase tracking-wide px-5 py-3">Lines</TableHead>
                <TableHead className="text-[10px] font-bold text-muted-foreground uppercase tracking-wide px-5 py-3">Tokens</TableHead>
                <TableHead className="text-[10px] font-bold text-muted-foreground uppercase tracking-wide px-5 py-3">Focused At</TableHead>
                <TableHead className="text-[10px] font-bold text-muted-foreground uppercase tracking-wide px-5 py-3 text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {files.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-sm text-muted-foreground py-10">
                    No files currently focused.
                  </TableCell>
                </TableRow>
              ) : (
                files.map((file, i) => (
                  <TableRow key={i} className="border-b border-border last:border-0 hover:bg-muted">
                    <TableCell className="px-5 py-3">
                      <span className="text-xs font-mono font-medium text-foreground">{file.path}</span>
                    </TableCell>
                    <TableCell className="px-5 py-3 text-xs text-muted-foreground tabular-nums">{file.lines}</TableCell>
                    <TableCell className="px-5 py-3 text-xs font-mono text-foreground tabular-nums">{file.tokens.toLocaleString()}</TableCell>
                    <TableCell className="px-5 py-3 text-xs text-muted-foreground">{file.focusedAt}</TableCell>
                    <TableCell className="px-5 py-3 text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleUnfocus(file.path)}
                        className="h-7 px-2 text-xs text-[#EF4444] hover:bg-[#FEF2F2] hover:text-[#EF4444]"
                      >
                        <X className="w-3.5 h-3.5 mr-1" />
                        Un-focus
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {/* Focus Budget section */}
        <div className="bg-card border border-border rounded-xl shadow-sm p-5 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold text-foreground">Focus Budget</span>
            <span className="text-xs text-muted-foreground">
              {files.length} / {FOCUS_BUDGET} files focused ({focusPercent}%)
            </span>
          </div>

          {/* Progress bar */}
          <div className="h-2 bg-[#F3F4F6] rounded-full overflow-hidden">
            <div
              className="h-full bg-[#7C3AED] rounded-full transition-all duration-500"
              style={{ width: `${focusPercent}%` }}
            />
          </div>

          {/* Tip card */}
          <div className="flex items-start gap-3 bg-[#F5F3FF] border border-[#DDD6FE] rounded-xl p-3 mt-2">
            <Info className="w-4 h-4 text-[#7C3AED] mt-0.5 shrink-0" />
            <p className="text-xs text-muted-foreground">
              <span className="font-semibold text-[#7C3AED]">Tip:</span> Keep your focused files under 20% for optimal performance.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
