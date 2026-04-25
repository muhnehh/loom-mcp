import { readFileSync, existsSync, readdirSync, statSync, readFileSync as readFile } from 'fs';
import { resolve, relative, join, dirname } from 'path';

export interface DependencyNode {
  name: string;
  file: string;
  kind: 'function' | 'class' | 'interface' | 'type' | 'constant' | 'file';
  imports: string[];
  importedBy: string[];
  line: number;
}

export interface DependencyGraph {
  nodes: DependencyNode[];
  edges: { from: string; to: string; kind: string }[];
  totalFiles: number;
  totalSymbols: number;
}

export function buildDependencyGraph(
  files: string[],
  workspaceRoot: string
): DependencyGraph {
  const nodeMap = new Map<string, DependencyNode>();
  const allNodes: DependencyNode[] = [];
  const edges: { from: string; to: string; kind: string }[] = [];

  const extRE = /\.(ts|tsx|js|jsx|py|rs|go|java|cs)$/;
  const importRE = [
    /import\s+\{?\s*([A-Z_$][\w$]*)\s*\}?\s*from\s*['"]([^'"]+)['"]/g,
    /from\s+['"]([^'"]+)['"]\s+import\s+\{([^}]+)\}/g,
    /require\s*\(\s*['"]([^'"]+)['"]\s*\)/g,
    /use\s+([A-Z_$][\w$]*)/g,
    /#.*import\s+(\w+)/g,
  ];

  for (const file of files) {
    if (!extRE.test(file)) continue;
    try {
      const content = readFileSync(file, 'utf8');
      const rel = relative(workspaceRoot, file);
      const baseName = rel.replace(/\.[^.]+$/, '');
      const lines = content.split('\n');

      const exports: string[] = [];
      for (const line of lines) {
        const exported = line.match(/export\s+(?:function|class|const|interface|type)\s+(\w+)/);
        if (exported) exports.push(exported[1]);
      }

      const imports: string[] = [];
      for (const re of importRE) {
        let m;
        while ((m = re.exec(content)) !== null) {
          const symbols = m[2] ? m[2].split(',').map(s => s.trim()) : [m[1]];
          for (const s of symbols) {
            if (s && !s.includes('*')) imports.push(s);
          }
        }
      }

      const node: DependencyNode = {
        name: baseName,
        file: rel,
        kind: 'file',
        imports: [...new Set(imports)],
        importedBy: [],
        line: 1
      };
      nodeMap.set(rel, node);
      allNodes.push(node);

      for (const imp of imports) {
        const target = findImportTarget(imp, nodeMap, workspaceRoot);
        if (target) {
          edges.push({ from: rel, to: target, kind: 'import' });
        }
      }
    } catch { continue; }
  }

  for (const edge of edges) {
    const target = nodeMap.get(edge.to);
    if (target) {
      target.importedBy.push(edge.from);
    }
  }

  return {
    nodes: allNodes,
    edges,
    totalFiles: allNodes.length,
    totalSymbols: allNodes.length
  };
}

function findImportTarget(
  symbol: string,
  nodeMap: Map<string, DependencyNode>,
  workspaceRoot: string
): string | null {
  for (const [path, node] of nodeMap) {
    if (path.endsWith(`/${symbol}`) || path.endsWith(`\\${symbol}`) || path.endsWith(`/${symbol}.ts`) || path.endsWith(`\\${symbol}.ts`)) {
      return path;
    }
    if (node.name.includes(symbol) || symbol.toLowerCase().includes(node.name.toLowerCase())) {
      return path;
    }
  }
  return null;
}

export function getGraphStats(graph: DependencyGraph) {
  const maxImporters = Math.max(...graph.nodes.map(n => n.importedBy.length));
  const maxImports = Math.max(...graph.nodes.map(n => n.imports.length));
  const orphans = graph.nodes.filter(n => n.importedBy.length === 0 && n.imports.length === 0);

  return {
    nodes: graph.totalSymbols,
    edges: graph.edges.length,
    maxImporters,
    maxImports,
    orphans: orphans.length,
    orphanFiles: orphans.slice(0, 5).map(o => o.file),
    density: graph.edges.length / Math.max(1, graph.totalSymbols),
  };
}

export function renderGraphDOT(graph: DependencyGraph): string {
  const lines: string[] = ['digraph deps {', '  rankdir=LR;', '  node [shape=box];'];

  for (const node of graph.nodes.slice(0, 50)) {
    const label = node.file.replace(/[/\\]/g, '_').replace(/\./g, '_');
    lines.push(`  "${label}" [label="${node.file}"];`);
  }

  for (const edge of graph.edges.slice(0, 100)) {
    const from = edge.from.replace(/[/\\]/g, '_').replace(/\./g, '_');
    const to = edge.to.replace(/[/\\]/g, '_').replace(/\./g, '_');
    lines.push(`  "${from}" -> "${to}";`);
  }

  lines.push('}');
  return lines.join('\n');
}