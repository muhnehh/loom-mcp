"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.toTOON = toTOON;
exports.estimateTokens = estimateTokens;
function toTOON(skeletons) {
    const lines = [];
    for (const file of skeletons) {
        lines.push(`${file.path}:`);
        for (const node of file.nodes) {
            if (node.kind === 'function') {
                lines.push(`  fn:${node.name}(${node.params ?? ''}):${node.returnType ?? 'void'}`);
            }
            else if (node.kind === 'method') {
                lines.push(`    fn:${node.name}(${node.params ?? ''}):${node.returnType ?? 'void'}`);
            }
            else if (node.kind === 'class') {
                lines.push(`  class:${node.name}`);
                for (const m of node.members ?? []) {
                    lines.push(`    fn:${m.name}(${m.params ?? ''}):${m.returnType ?? 'void'}`);
                }
            }
            else if (node.kind === 'type' || node.kind === 'interface') {
                const members = (node.members ?? []).map(m => m.name).join(',');
                lines.push(`  type:${node.name}{${members}}`);
            }
            else if (node.kind === 'const') {
                lines.push(`  const:${node.name}:${node.returnType ?? 'any'}`);
            }
        }
    }
    return lines.join('\n');
}
function estimateTokens(text) {
    return Math.ceil(text.length / 4);
}
