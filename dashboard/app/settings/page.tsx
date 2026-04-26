"use client"

import { 
  Settings, 
  User, 
  Shield, 
  Cpu, 
  Globe, 
  Info,
  Save,
  RotateCcw,
  Monitor,
  Moon,
  Sun,
  HardDrive
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"

export default function SettingsPage() {
  return (
    <div className="p-8 max-w-[1200px] mx-auto space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight text-[#111827]">Settings</h1>
          <p className="text-[#6B7280]">Configure LoomMCP to match your workflow.</p>
        </div>
        <div className="flex items-center gap-3">
           <Button variant="ghost" className="text-[#6B7280]">
             <RotateCcw className="w-4 h-4 mr-2" /> Reset Defaults
           </Button>
           <Button className="bg-[#7C3AED] hover:bg-[#6D28D9] font-bold">
             <Save className="w-4 h-4 mr-2" /> Save Changes
           </Button>
        </div>
      </div>

      <Tabs defaultValue="general" className="w-full space-y-8">
        <div className="border-b border-[#E5E7EB]">
          <TabsList className="bg-transparent h-auto p-0 gap-8">
            <TabsTrigger value="general" className="rounded-none border-b-2 border-transparent data-[state=active]:border-[#7C3AED] data-[state=active]:bg-transparent px-0 pb-4 text-sm font-bold shadow-none flex items-center gap-2">General</TabsTrigger>
            <TabsTrigger value="performance" className="rounded-none border-b-2 border-transparent data-[state=active]:border-[#7C3AED] data-[state=active]:bg-transparent px-0 pb-4 text-sm font-bold shadow-none flex items-center gap-2">Performance</TabsTrigger>
            <TabsTrigger value="security" className="rounded-none border-b-2 border-transparent data-[state=active]:border-[#7C3AED] data-[state=active]:bg-transparent px-0 pb-4 text-sm font-bold shadow-none flex items-center gap-2">Security</TabsTrigger>
            <TabsTrigger value="languages" className="rounded-none border-b-2 border-transparent data-[state=active]:border-[#7C3AED] data-[state=active]:bg-transparent px-0 pb-4 text-sm font-bold shadow-none flex items-center gap-2">Languages</TabsTrigger>
            <TabsTrigger value="advanced" className="rounded-none border-b-2 border-transparent data-[state=active]:border-[#7C3AED] data-[state=active]:bg-transparent px-0 pb-4 text-sm font-bold shadow-none flex items-center gap-2">Advanced</TabsTrigger>
            <TabsTrigger value="about" className="rounded-none border-b-2 border-transparent data-[state=active]:border-[#7C3AED] data-[state=active]:bg-transparent px-0 pb-4 text-sm font-bold shadow-none flex items-center gap-2">About</TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="general" className="space-y-6">
           <Card className="border-[#E5E7EB] shadow-sm">
              <CardHeader>
                <CardTitle className="text-sm font-semibold">Workspace Configuration</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                 <div className="grid grid-cols-2 gap-8">
                    <div className="space-y-2">
                       <Label htmlFor="workspace-root" className="text-xs font-bold text-[#6B7280] uppercase tracking-wider">Workspace Root</Label>
                       <div className="relative">
                          <HardDrive className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#9CA3AF]" />
                          <Input id="workspace-root" defaultValue="~/Projects/loom-mcp" className="pl-10 h-11 border-[#E5E7EB]" />
                       </div>
                    </div>
                    <div className="space-y-2">
                       <Label htmlFor="theme" className="text-xs font-bold text-[#6B7280] uppercase tracking-wider">Interface Theme</Label>
                       <Select defaultValue="light">
                          <SelectTrigger className="h-11 border-[#E5E7EB]">
                             <SelectValue placeholder="Select Theme" />
                          </SelectTrigger>
                          <SelectContent>
                             <SelectItem value="light"><div className="flex items-center gap-2"><Sun className="w-4 h-4" /> Light</div></SelectItem>
                             <SelectItem value="dark"><div className="flex items-center gap-2"><Moon className="w-4 h-4" /> Dark</div></SelectItem>
                             <SelectItem value="system"><div className="flex items-center gap-2"><Monitor className="w-4 h-4" /> System</div></SelectItem>
                          </SelectContent>
                       </Select>
                    </div>
                 </div>

                 <div className="space-y-4 pt-6 border-t border-[#F3F4F6]">
                    <div className="flex items-center justify-between">
                       <div className="space-y-0.5">
                          <Label className="text-sm font-bold text-[#111827]">Auto Refresh</Label>
                          <p className="text-xs text-[#6B7280]">Automatically refresh stats and events in real-time.</p>
                       </div>
                       <Switch defaultChecked />
                    </div>
                    <div className="flex items-center justify-between">
                       <div className="space-y-0.5">
                          <Label className="text-sm font-bold text-[#111827]">Show Dashboard on Start</Label>
                          <p className="text-xs text-[#6B7280]">Open the dashboard automatically when LoomMCP starts.</p>
                       </div>
                       <Switch defaultChecked />
                    </div>
                 </div>
              </CardContent>
           </Card>

           <Card className="border-[#E5E7EB] shadow-sm">
              <CardHeader>
                <CardTitle className="text-sm font-semibold">Notifications</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                 <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                       <Label className="text-sm font-bold text-[#111827]">Agent Tool Notifications</Label>
                       <p className="text-xs text-[#6B7280]">Notify when an AI agent calls a LoomMCP tool.</p>
                    </div>
                    <Switch defaultChecked />
                 </div>
                 <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                       <Label className="text-sm font-bold text-[#111827]">Budget Alerts</Label>
                       <p className="text-xs text-[#6B7280]">Alert when focus budget exceeds 80%.</p>
                    </div>
                    <Switch defaultChecked />
                 </div>
              </CardContent>
           </Card>
        </TabsContent>

        <TabsContent value="performance" className="space-y-6">
           <Card className="border-[#E5E7EB] shadow-sm">
              <CardHeader>
                <CardTitle className="text-sm font-semibold">Indexing & Context</CardTitle>
              </CardHeader>
              <CardContent className="space-y-8">
                 <div className="space-y-4">
                    <div className="flex items-center justify-between">
                       <Label className="text-sm font-bold text-[#111827]">Max Topology Depth</Label>
                       <span className="text-xs font-bold text-[#7C3AED]">3</span>
                    </div>
                    <Slider defaultValue={[3]} max={10} step={1} className="[&_[role=slider]]:bg-[#7C3AED]" />
                    <p className="text-[11px] text-[#6B7280]">Higher depth provides more detail but uses more tokens during initial scans.</p>
                 </div>

                 <div className="space-y-4 pt-6 border-t border-[#F3F4F6]">
                    <div className="flex items-center justify-between">
                       <Label className="text-sm font-bold text-[#111827]">Focus Budget</Label>
                       <span className="text-xs font-bold text-[#7C3AED]">20 files</span>
                    </div>
                    <Slider defaultValue={[20]} max={50} step={5} className="[&_[role=slider]]:bg-[#7C3AED]" />
                    <p className="text-[11px] text-[#6B7280]">Maximum number of files that can be in active focus simultaneously.</p>
                 </div>

                 <div className="flex items-center justify-between pt-6 border-t border-[#F3F4F6]">
                    <div className="space-y-0.5">
                       <Label className="text-sm font-bold text-[#111827]">Use GPU Acceleration</Label>
                       <p className="text-xs text-[#6B7280]">Accelerate AST parsing and embedding generation using GPU.</p>
                    </div>
                    <Switch defaultChecked />
                 </div>
              </CardContent>
           </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
