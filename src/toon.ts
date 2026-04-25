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