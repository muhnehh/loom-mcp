"use client"

import * as React from "react"
import { 
  Settings, 
  Search,
  LayoutDashboard,
  Network,
  Focus,
  Diff,
  EyeOff,
  Zap,
  History,
  FileText,
  BookOpen,
  Keyboard
} from "lucide-react"
import { useRouter } from "next/navigation"

import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command"

export function CommandPalette() {
  const [open, setOpen] = React.useState(false)
  const router = useRouter()

  React.useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        setOpen((open) => !open)
      }
    }

    document.addEventListener("keydown", down)
    return () => document.removeEventListener("keydown", down)
  }, [])

  const runCommand = (command: () => void) => {
    setOpen(false)
    command()
  }

  return (
    <CommandDialog open={open} onOpenChange={setOpen}>
      <CommandInput placeholder="Type a command or search symbols..." />
      <CommandList>
        <CommandEmpty>No results found.</CommandEmpty>
        <CommandGroup heading="Tools">
          <CommandItem onSelect={() => runCommand(() => router.push("/topology"))}>
            <Network className="mr-2 h-4 w-4" />
            <span>Get Topology</span>
          </CommandItem>
          <CommandItem onSelect={() => runCommand(() => router.push("/focus"))}>
            <Focus className="mr-2 h-4 w-4" />
            <span>Focus File</span>
          </CommandItem>
          <CommandItem onSelect={() => runCommand(() => router.push("/search"))}>
            <Search className="mr-2 h-4 w-4" />
            <span>Search References</span>
          </CommandItem>
          <CommandItem onSelect={() => runCommand(() => router.push("/diff"))}>
            <Diff className="mr-2 h-4 w-4" />
            <span>Active Diff</span>
          </CommandItem>
          <CommandItem onSelect={() => runCommand(() => router.push("/blur"))}>
            <EyeOff className="mr-2 h-4 w-4" />
            <span>Blur Files</span>
          </CommandItem>
        </CommandGroup>
        <CommandSeparator />
        <CommandGroup heading="Navigation">
          <CommandItem onSelect={() => runCommand(() => router.push("/dashboard"))}>
            <LayoutDashboard className="mr-2 h-4 w-4" />
            <span>Dashboard</span>
          </CommandItem>
          <CommandItem onSelect={() => runCommand(() => router.push("/active-lens"))}>
            <Zap className="mr-2 h-4 w-4" />
            <span>Active Lens</span>
          </CommandItem>
          <CommandItem onSelect={() => runCommand(() => router.push("/history"))}>
            <History className="mr-2 h-4 w-4" />
            <span>Session History</span>
          </CommandItem>
          <CommandItem onSelect={() => runCommand(() => router.push("/events"))}>
            <FileText className="mr-2 h-4 w-4" />
            <span>System Events</span>
          </CommandItem>
        </CommandGroup>
        <CommandSeparator />
        <CommandGroup heading="Settings & Help">
          <CommandItem onSelect={() => runCommand(() => router.push("/settings"))}>
            <Settings className="mr-2 h-4 w-4" />
            <span>Settings</span>
          </CommandItem>
          <CommandItem onSelect={() => runCommand(() => router.push("/shortcuts"))}>
            <Keyboard className="mr-2 h-4 w-4" />
            <span>Keyboard Shortcuts</span>
          </CommandItem>
          <CommandItem onSelect={() => runCommand(() => router.push("/docs"))}>
            <BookOpen className="mr-2 h-4 w-4" />
            <span>Documentation</span>
          </CommandItem>
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  )
}
