"use client"

import { useState } from "react"
import { 
  Search, 
  ChevronDown, 
  Filter, 
  FileCode, 
  ExternalLink,
  Code2,
  Box,
  Layers,
  CheckCircle2,
  Zap,
  Crosshair,
  ArrowRight
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select"
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

const searchResults = [
  { file: 'src/auth.ts', line: 22, context: 'export async function loginUser(username: string, password: string): Promise<User> {', type: 'definition' },
  { file: 'src/api/auth-service.ts', line: 42, context: 'return await loginUser(user.email, user.password);', type: 'call' },
  { file: 'src/middleware.ts', line: 15, context: 'import { loginUser } from "./auth";', type: 'import' },
  { file: 'src/auth-provider.tsx', line: 31, context: 'await loginUser(credentials.email, token.password);', type: 'call' },
  { file: 'src/__tests__/auth.test.ts', line: 56, context: 'const result = await loginUser("test@example.com", "pass");', type: 'call' },
  { file: 'src/types.ts', line: 12, context: 'loginUser: (email: string, pass: string) => Promise<User>;', type: 'type' },
  { file: 'src/constants.ts', line: 8, context: 'import { loginUser } from "./auth";', type: 'import' },
]

export default function SearchPage() {
  const [searchTerm, setSearchTerm] = useState("loginUser")

  return (
    <div className="flex flex-col min-h-[calc(100vh-64px)] bg-[#FAFAFB]">
      <div className="p-8 flex-1 max-w-[1600px] mx-auto w-full space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <h1 className="text-3xl font-extrabold tracking-tight text-[#111827] flex items-center gap-3">
               AST Search <Search className="w-6 h-6 text-[#3B82F6]" />
            </h1>
            <p className="text-[#6B7280] font-medium">Find deterministic references to symbols without text-search noise.</p>
          </div>
          <div className="flex gap-3">
             <div className="hidden lg:flex items-center gap-2 text-xs font-bold text-[#3B82F6] bg-[#EFF6FF] px-3 py-1.5 rounded-full border border-[#DBEAFE]">
                <Box className="w-4 h-4" /> AST Engine Active
             </div>
          </div>
        </div>

        {/* Search Bar */}
        <div className="premium-card p-2 relative overflow-hidden group">
           <div className="absolute inset-0 bg-gradient-to-r from-[#3B82F6]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
           <div className="relative flex items-center gap-2 bg-white rounded-[1.25rem] p-2 border border-[#F3F4F6] shadow-sm">
             <div className="w-12 h-12 flex items-center justify-center bg-[#F9FAFB] rounded-xl text-[#9CA3AF]">
                <Search className="w-5 h-5" />
             </div>
             <Input 
               value={searchTerm}
               onChange={(e) => setSearchTerm(e.target.value)}
               placeholder="Search for a symbol..." 
               className="flex-1 border-0 h-12 shadow-none focus-visible:ring-0 text-lg font-mono placeholder:text-[#D1D5DB] placeholder:font-sans" 
             />
             <div className="w-px h-8 bg-[#E5E7EB] mx-2 hidden md:block" />
             <Select defaultValue="workspace">
               <SelectTrigger className="w-[180px] h-12 border-0 bg-transparent shadow-none focus:ring-0 font-bold hidden md:flex">
                 <SelectValue placeholder="Scope" />
               </SelectTrigger>
               <SelectContent>
                 <SelectItem value="workspace">Entire Workspace</SelectItem>
                 <SelectItem value="file">Current File</SelectItem>
                 <SelectItem value="module">Current Module</SelectItem>
               </SelectContent>
             </Select>
             <Button className="h-12 px-8 bg-[#111827] hover:bg-[#374151] text-white font-bold rounded-xl shadow-lg transition-all ml-2">
                Search <ArrowRight className="w-4 h-4 ml-2" />
             </Button>
           </div>
        </div>

        <div className="grid grid-cols-12 gap-8">
          {/* Results Table */}
          <div className="col-span-12 xl:col-span-9 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-[#F3F4F6] shadow-sm relative overflow-hidden group">
               <div className="absolute top-0 left-0 w-1 h-full bg-[#3B82F6]" />
               <div className="flex items-center gap-4">
                 <div className="w-10 h-10 rounded-xl bg-[#EFF6FF] flex items-center justify-center">
                   <CheckCircle2 className="w-5 h-5 text-[#3B82F6]" />
                 </div>
                 <div>
                   <span className="text-sm font-black text-[#111827] block">Found 14 references across 7 files</span>
                   <span className="text-[11px] font-bold text-[#6B7280] flex items-center gap-2 mt-0.5">
                      Search completed in 42ms
                   </span>
                 </div>
               </div>
               <div className="flex gap-2">
                 <Button variant="outline" className="text-[11px] font-bold h-9 px-4 rounded-lg border-[#E5E7EB]">
                    Export CSV
                 </Button>
                 <Button className="text-[11px] font-bold bg-[#3B82F6] hover:bg-[#2563EB] text-white h-9 px-4 rounded-lg">
                    Focus All Results
                 </Button>
               </div>
            </div>

            <div className="premium-card overflow-hidden">
              <Tabs defaultValue="all" className="w-full">
                <div className="px-8 pt-6 border-b border-[#F3F4F6] bg-white">
                  <TabsList className="bg-transparent h-auto p-0 gap-8">
                    <TabsTrigger value="all" className="rounded-none border-b-2 border-transparent data-[state=active]:border-[#3B82F6] data-[state=active]:bg-transparent px-0 pb-4 text-xs font-black uppercase tracking-widest shadow-none flex items-center gap-2 data-[state=active]:text-[#111827] text-[#9CA3AF]">
                       All <Badge className="bg-[#EFF6FF] text-[#3B82F6] hover:bg-[#EFF6FF] text-[10px] px-2 py-0 border-0 rounded-full">14</Badge>
                    </TabsTrigger>
                    <TabsTrigger value="calls" className="rounded-none border-b-2 border-transparent data-[state=active]:border-[#3B82F6] data-[state=active]:bg-transparent px-0 pb-4 text-xs font-black uppercase tracking-widest shadow-none flex items-center gap-2 data-[state=active]:text-[#111827] text-[#9CA3AF]">
                       Calls <Badge className="bg-[#F3F4F6] text-[#6B7280] hover:bg-[#F3F4F6] text-[10px] px-2 py-0 border-0 rounded-full">8</Badge>
                    </TabsTrigger>
                    <TabsTrigger value="imports" className="rounded-none border-b-2 border-transparent data-[state=active]:border-[#3B82F6] data-[state=active]:bg-transparent px-0 pb-4 text-xs font-black uppercase tracking-widest shadow-none flex items-center gap-2 data-[state=active]:text-[#111827] text-[#9CA3AF]">
                       Imports <Badge className="bg-[#F3F4F6] text-[#6B7280] hover:bg-[#F3F4F6] text-[10px] px-2 py-0 border-0 rounded-full">2</Badge>
                    </TabsTrigger>
                    <TabsTrigger value="types" className="rounded-none border-b-2 border-transparent data-[state=active]:border-[#3B82F6] data-[state=active]:bg-transparent px-0 pb-4 text-xs font-black uppercase tracking-widest shadow-none flex items-center gap-2 data-[state=active]:text-[#111827] text-[#9CA3AF]">
                       Types <Badge className="bg-[#F3F4F6] text-[#6B7280] hover:bg-[#F3F4F6] text-[10px] px-2 py-0 border-0 rounded-full">3</Badge>
                    </TabsTrigger>
                  </TabsList>
                </div>
                <TabsContent value="all" className="m-0 bg-white">
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader className="bg-[#F9FAFB]/50">
                        <TableRow className="border-b border-[#F3F4F6] hover:bg-transparent">
                          <TableHead className="text-[10px] font-black text-[#9CA3AF] uppercase tracking-[0.1em] px-8 py-4 w-[250px]">File / Line</TableHead>
                          <TableHead className="text-[10px] font-black text-[#9CA3AF] uppercase tracking-[0.1em] px-8 py-4">Context</TableHead>
                          <TableHead className="text-[10px] font-black text-[#9CA3AF] uppercase tracking-[0.1em] px-8 py-4 text-right">Type</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {searchResults.map((result, i) => (
                          <TableRow key={i} className="group hover:bg-[#F9FAFB] border-b border-[#F3F4F6] last:border-0 transition-colors cursor-pointer">
                            <TableCell className="px-8 py-5">
                              <div className="flex flex-col gap-1">
                                 <div className="flex items-center gap-2">
                                    <FileCode className="w-3.5 h-3.5 text-[#9CA3AF] group-hover:text-[#3B82F6] transition-colors" />
                                    <span className="text-xs font-bold text-[#111827] font-mono truncate">{result.file}</span>
                                 </div>
                                 <span className="text-[10px] font-bold text-[#6B7280] ml-5">Line {result.line}</span>
                              </div>
                            </TableCell>
                            <TableCell className="px-8 py-5">
                              <div className="text-xs text-[#111827] font-mono truncate max-w-[400px] xl:max-w-[600px] bg-[#F9FAFB] group-hover:bg-white border border-[#E5E7EB] px-3 py-2 rounded-lg transition-colors">
                                {result.context}
                              </div>
                            </TableCell>
                            <TableCell className="px-8 py-5 text-right">
                               <Badge variant="outline" className={cn(
                                 "text-[9px] font-black uppercase tracking-widest px-2 py-0.5 border",
                                 result.type === 'definition' ? "bg-[#F5F3FF] text-[#7C3AED] border-[#EDE9FE]" :
                                 result.type === 'call' ? "bg-[#EFF6FF] text-[#3B82F6] border-[#DBEAFE]" :
                                 "bg-[#F9FAFB] text-[#6B7280] border-[#E5E7EB]"
                               )}>
                                 {result.type}
                               </Badge>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </TabsContent>
              </Tabs>
            </div>

            <div className="flex justify-between items-center bg-white p-4 rounded-2xl border border-[#F3F4F6] shadow-sm">
               <span className="text-xs font-bold text-[#6B7280]">Showing 1-7 of 14</span>
               <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" className="h-9 px-4 border-[#E5E7EB] text-xs font-bold rounded-lg" disabled>Previous</Button>
                  <div className="flex items-center gap-1">
                     <Button variant="outline" size="sm" className="h-9 w-9 p-0 border-[#3B82F6] text-[#3B82F6] bg-[#EFF6FF] text-xs font-black rounded-lg">1</Button>
                     <Button variant="outline" size="sm" className="h-9 w-9 p-0 border-[#E5E7EB] text-[#6B7280] text-xs font-bold rounded-lg">2</Button>
                  </div>
                  <Button variant="outline" size="sm" className="h-9 px-4 border-[#E5E7EB] text-xs font-bold rounded-lg">Next</Button>
               </div>
            </div>
          </div>

          {/* Right Filter Panel */}
          <div className="col-span-12 xl:col-span-3 space-y-8">
             <div className="premium-card p-6 space-y-8">
                <div className="flex items-center gap-2">
                  <Filter className="w-4 h-4 text-[#111827]" />
                  <h3 className="text-sm font-black text-[#111827] uppercase tracking-wider">Filters</h3>
                </div>
                
                <div className="space-y-4">
                   <p className="text-[10px] font-black text-[#9CA3AF] uppercase tracking-[0.2em]">File Type</p>
                   <div className="space-y-3">
                      {[
                        { name: '.ts', count: 10, checked: true },
                        { name: '.tsx', count: 2, checked: true },
                        { name: '.js', count: 1, checked: false },
                        { name: '.json', count: 1, checked: false },
                      ].map((type) => (
                        <div key={type.name} className="flex items-center justify-between group cursor-pointer">
                           <div className="flex items-center gap-3">
                              <Checkbox id={type.name} defaultChecked={type.checked} className="data-[state=checked]:bg-[#3B82F6] data-[state=checked]:border-[#3B82F6]" />
                              <label htmlFor={type.name} className="text-xs font-bold text-[#111827] cursor-pointer">{type.name}</label>
                           </div>
                           <span className="text-[10px] font-bold text-[#9CA3AF] bg-[#F9FAFB] px-1.5 py-0.5 rounded border border-[#E5E7EB]">{type.count}</span>
                        </div>
                      ))}
                   </div>
                </div>

                <div className="space-y-4 pt-6 border-t border-[#F3F4F6]">
                   <p className="text-[10px] font-black text-[#9CA3AF] uppercase tracking-[0.2em]">Reference Type</p>
                   <div className="space-y-3">
                      {[
                        { name: 'Definition', checked: true },
                        { name: 'Function Call', checked: true },
                        { name: 'Import Statement', checked: true },
                        { name: 'Type Annotation', checked: true },
                        { name: 'Assignment', checked: true },
                      ].map((type) => (
                        <div key={type.name} className="flex items-center gap-3 group cursor-pointer">
                           <Checkbox id={type.name} defaultChecked={type.checked} className="data-[state=checked]:bg-[#3B82F6] data-[state=checked]:border-[#3B82F6]" />
                           <label htmlFor={type.name} className="text-xs font-bold text-[#111827] cursor-pointer">{type.name}</label>
                        </div>
                      ))}
                   </div>
                </div>
             </div>

             <div className="bg-gradient-to-br from-[#3B82F6] to-[#2563EB] p-6 rounded-[2rem] space-y-3 shadow-xl shadow-blue-200 relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-2 opacity-10 group-hover:opacity-20 transition-opacity">
                  <Box className="w-16 h-16 text-white fill-white" />
                </div>
                <div className="flex items-center gap-2 relative z-10">
                  <div className="w-7 h-7 rounded-lg bg-white/20 backdrop-blur-sm flex items-center justify-center">
                    <Code2 className="w-4 h-4 text-white" />
                  </div>
                  <span className="text-xs font-black text-white uppercase tracking-wider">Why AST?</span>
                </div>
                <ul className="space-y-2 mt-3 relative z-10">
                   {[
                     'Zero false positives from strings/comments',
                     'Resolves local scope bindings correctly',
                     'Uses 10x fewer tokens than raw grep',
                   ].map((item, i) => (
                     <li key={i} className="flex items-start gap-2 text-[10px] text-blue-100 font-medium leading-relaxed">
                       <div className="w-1 h-1 bg-blue-300 rounded-full mt-1.5 shrink-0" />
                       {item}
                     </li>
                   ))}
                </ul>
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
           <span>Engine: Tree-sitter AST</span>
        </div>
      </footer>
    </div>
  )
}
