export interface ASTNode {
  name: string;
  kind: 'function' | 'class' | 'type' | 'interface' | 'const' | 'method';
  params?: string;
  returnType?: string;
  members?: ASTNode[];
  lineStart: number;
  lineEnd: number;
}

export interface FileSkeleton {
  path: string;
  nodes: ASTNode[];
  tokenEstimate: number;
}

export function toTOON(skeletons: FileSkeleton[]): string {
  const lines: string[] = [];
  for (const file of skeletons) {
    lines.push(`${file.path}:`);
    for (const node of file.nodes) {
      if (node.kind === 'function') {
        lines.push(`  fn:${node.name}(${node.params ?? ''}):${node.returnType ?? 'void'}`);
      } else if (node.kind === 'method') {
        lines.push(`    fn:${node.name}(${node.params ?? ''}):${node.returnType ?? 'void'}`);
      } else if (node.kind === 'class') {
        lines.push(`  class:${node.name}`);
        for (const m of node.members ?? []) {
          lines.push(`    fn:${m.name}(${m.params ?? ''}):${m.returnType ?? 'void'}`);
        }
      } else if (node.kind === 'type' || node.kind === 'interface') {
        const members = (node.members ?? []).map(m => m.name).join(',');
        lines.push(`  type:${node.name}{${members}}`);
      } else if (node.kind === 'const') {
        lines.push(`  const:${node.name}:${node.returnType ?? 'any'}`);
      }
    }
  }
  return lines.join('\n');
}

export function estimateTokens(text: string): number {
  return Math.ceil(text.length / 4);
}

export function encodeCompact(data: any, toolName: string): string {
  if (!data) return '';
  
  const lines: string[] = [];
  lines.push(`#LOOM/1 tool=${toolName} enc=gen1`);
  
  if (data.symbols && Array.isArray(data.symbols)) {
    const legendMap = new Map<string, number>();
    const legendLines: string[] = [];
    
    const uniquePaths = [...new Set(data.symbols.map((s: any) => String(s.path || '')))].filter(Boolean);
    for (let i = 0; i < uniquePaths.length; i++) {
      const pathKey = String(i + 1);
      const pathVal = String(uniquePaths[i]);
      legendMap.set(pathKey, i + 1);
      legendLines.push(`@${pathKey}=${pathVal}`);
    }
    
    if (legendLines.length > 0) {
      lines.push('');
      lines.push(...legendLines);
    }
    
    lines.push('');
    lines.push('#data');
    for (const sym of data.symbols) {
      const pathIdx = legendMap.get(String(sym.path)) || '0';
      const kind = String(sym.kind?.[0] || 'f');
      const name = String(sym.name || '');
      const line = Number(sym.line) || 0;
      lines.push(`${pathIdx}:${kind}:${name}:${line}`);
    }
  } else if (data.files && Array.isArray(data.files)) {
    lines.push('');
    lines.push('#files');
    for (const f of data.files) {
      const path = String(f.path || '');
      const size = Number(f.size) || 0;
      lines.push(`${path}:${size}`);
    }
  } else if (typeof data === 'object') {
    lines.push('');
    for (const [key, value] of Object.entries(data)) {
      lines.push(`${key}=${JSON.stringify(value)}`);
    }
  }
  
  lines.push('');
  return lines.join('\n');
}

export function decodeCompact(payload: string): any {
  const result: any = { symbols: [], files: [], meta: {} };
  const legend: string[] = [];
  let section = 'header';
  
  for (const line of payload.split('\n')) {
    if (line.startsWith('#LOOM/')) continue;
    if (line.startsWith('@')) {
      const parts = line.slice(1).split('=');
      if (parts.length >= 2) legend.push(parts[1]);
      continue;
    }
    if (line === '#data' || line === '#files') {
      section = line.slice(1);
      continue;
    }
    if (!line.trim()) continue;
    
    if (section === 'data') {
      const parts = line.split(':');
      if (parts.length >= 3) {
        const pathIdx = parseInt(parts[0]) || 0;
        result.symbols.push({
          path: legend[pathIdx - 1] || '',
          kind: parts[1] === 'f' ? 'function' : parts[1] === 'c' ? 'class' : 'type',
          name: parts[2],
          line: parseInt(parts[3]) || 0
        });
      }
    } else if (section === 'files') {
      const parts = line.split(':');
      if (parts.length >= 2) {
        result.files.push({ path: parts[0], size: parseInt(parts[1]) });
      }
    } else if (line.includes('=')) {
      const eqIdx = line.indexOf('=');
      const key = line.slice(0, eqIdx);
      const value = line.slice(eqIdx + 1);
      try {
        result.meta[key] = JSON.parse(value);
      } catch {
        result.meta[key] = value;
      }
    }
  }
  
  return result;
}

export function shouldUseCompact(data: any): boolean {
  if (!data) return false;
  const jsonSize = JSON.stringify(data).length;
  const compactSize = encodeCompact(data, 'tool').length;
  return compactSize > 0 && (jsonSize - compactSize) / jsonSize >= 0.15;
}