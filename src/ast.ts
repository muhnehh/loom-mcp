import Parser, { Language } from 'tree-sitter';
import TypeScript from 'tree-sitter-typescript';
import Python from 'tree-sitter-python';
import { readFileSync } from 'fs';
import { ASTNode, FileSkeleton } from './toon.js';

const parsers: Record<string, Parser> = {};
let parserErrors: Map<string, string> = new Map();

function initParser(ext: string, lang: any): Parser | null {
  const p = new Parser();
  try {
    p.setLanguage(lang);
  } catch {
    return null;
  }
  return p;
}

const tsLang = (TypeScript as any).typescript || TypeScript;
const jsLang = (TypeScript as any).javascript || TypeScript;
const pyLang = Python;

const langMap: Record<string, any> = {
  ts: tsLang,
  tsx: tsLang,
  js: jsLang,
  jsx: jsLang,
  py: pyLang,
};

export function skeletonizeFile(filePath: string): FileSkeleton {
  const ext = filePath.split('.').pop()?.toLowerCase() || '';
  
  if (!parsers[ext] && langMap[ext]) {
    parsers[ext] = initParser(ext, langMap[ext])!;
  }

  const parser = parsers[ext];
  if (!parser) {
    return createFallbackSkeleton(filePath);
  }

  let source: string;
  try {
    source = readFileSync(filePath, 'utf8');
  } catch {
    return { path: filePath, nodes: [], tokenEstimate: 0 };
  }

  try {
    const tree = parser.parse(source);
    const nodes: ASTNode[] = [];
    walkTree(tree.rootNode, nodes, source);

    return {
      path: filePath,
      nodes,
      tokenEstimate: Math.ceil(nodes.length * 15)
    };
  } catch (parseError) {
    parserErrors.set(filePath, parseError.message);
    return createFallbackSkeleton(filePath);
  }
}

function createFallbackSkeleton(filePath: string): FileSkeleton {
  try {
    const content = readFileSync(filePath, 'utf8');
    const lines = content.split('\n');
    const funcs: ASTNode[] = [];
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      if (line.startsWith('function ') || line.startsWith('export function ')) {
        const match = line.match(/function\s+(\w+)\s*\(([^)]*)\)(?:\s*:\s*(\w+))?/);
        if (match) {
          funcs.push({
            name: match[1],
            kind: 'function',
            params: match[2] || '',
            returnType: match[3] || 'void',
            lineStart: i,
            lineEnd: i
          });
        }
      } else if (line.startsWith('interface ') || line.startsWith('type ')) {
        const match = line.match(/(?:interface|type)\s+(\w+)/);
        if (match) {
          funcs.push({
            name: match[1],
            kind: 'type',
            lineStart: i,
            lineEnd: i
          });
        }
      } else if (line.startsWith('class ')) {
        const match = line.match(/class\s+(\w+)/);
        if (match) {
          funcs.push({
            name: match[1],
            kind: 'class',
            lineStart: i,
            lineEnd: i
          });
        }
      }
    }
    
    return {
      path: filePath,
      nodes: funcs,
      tokenEstimate: Math.ceil(funcs.length * 15)
    };
  } catch {
    return { path: filePath, nodes: [], tokenEstimate: 0 };
  }
}

function walkTree(node: any, results: ASTNode[], source: string) {
  if (!node) return;
  
  switch (node.type) {
    case 'function_declaration':
    case 'function':
    case 'method_definition':
    case 'arrow_function':
      extractFunction(node, results, source);
      break;
    case 'function_item':
      extractFunction(node, results, source);
      break;
    case 'class_declaration':
    case 'class':
    case 'struct_definition':
      extractClass(node, results, source);
      break;
    case 'type_alias_declaration':
    case 'type_alias':
    case 'interface_declaration':
      extractType(node, results, source);
      break;
    case 'const_declaration':
    case 'const_item':
      extractConst(node, results, source);
      break;
    case 'variable_declaration':
      extractConst(node, results, source);
      break;
  }

  if (node.children) {
    for (const child of node.children) {
      walkTree(child, results, source);
    }
  }
}

function extractFunction(node: any, results: ASTNode[], source: string) {
  const nameNode = node.childForFieldName?.('name') || findChild(node, 'identifier');
  const paramsNode = node.childForFieldName?.('parameters') || findChild(node, 'parameters');
  const returnNode = node.childForFieldName?.('return_type') || findChild(node, 'return_type') || findChild(node, 'type');

  if (nameNode && nameNode.text) {
    const params = paramsNode ? extractParams(paramsNode) : '';
    const returnType = returnNode ? cleanType(returnNode.text) : 'void';
    
    const isMethod = node.parent?.type?.includes('class');
    results.push({
      name: nameNode.text,
      kind: isMethod ? 'method' : 'function',
      params,
      returnType,
      lineStart: node.startPosition?.row || 0,
      lineEnd: node.endPosition?.row || 0
    });
  }
}

function extractClass(node: any, results: ASTNode[], source: string) {
  const nameNode = node.childForFieldName?.('name') || findChild(node, 'identifier');
  if (!nameNode || !nameNode.text) return;

  const members: ASTNode[] = [];
  const body = node.childForFieldName?.('body') || findChild(node, 'class_body');
  
  if (body?.children) {
    for (const child of body.children) {
      if (child.type === 'method_definition' || child.type === 'field_declaration') {
        extractFunction(child, members, source);
      }
    }
  }

  results.push({
    name: nameNode.text,
    kind: 'class',
    members,
    lineStart: node.startPosition?.row || 0,
    lineEnd: node.endPosition?.row || 0
  });
}

function extractType(node: any, results: ASTNode[], source: string) {
  const nameNode = node.childForFieldName?.('name') || findChild(node, 'identifier');
  const typeNode = node.childForFieldName?.('type') || findChild(node, 'type');
  
  if (nameNode && nameNode.text) {
    const members: ASTNode[] = [];
    
    if (typeNode?.children) {
      for (const child of typeNode.children) {
        if (child.type === 'field_declaration' || child.type === 'property_signature') {
          const fname = child.childForFieldName?.('name') || findChild(child, 'field_identifier');
          if (fname?.text) {
            members.push({
              name: fname.text,
              kind: 'const',
              returnType: cleanType(child.childForFieldName?.('type')?.text || 'any'),
              lineStart: child.startPosition?.row || 0,
              lineEnd: child.endPosition?.row || 0
            });
          }
        }
      }
    }

    results.push({
      name: nameNode.text,
      kind: node.type.includes('interface') ? 'interface' : 'type',
      members,
      lineStart: node.startPosition?.row || 0,
      lineEnd: node.endPosition?.row || 0
    });
  }
}

function extractConst(node: any, results: ASTNode[], source: string) {
  const nameNode = node.childForFieldName?.('name') || findChild(node, 'identifier');
  const typeNode = node.childForFieldName?.('type') || findChild(node, 'type');
  
  if (nameNode && nameNode.text) {
    results.push({
      name: nameNode.text,
      kind: 'const',
      returnType: typeNode ? cleanType(typeNode.text) : 'any',
      lineStart: node.startPosition?.row || 0,
      lineEnd: node.endPosition?.row || 0
    });
  }
}

function findChild(node: any, type: string): any {
  if (!node?.children) return null;
  for (const child of node.children) {
    if (child.type === type) return child;
  }
  return null;
}

function extractParams(paramsNode: any): string {
  if (!paramsNode?.children) return '';
  
  return paramsNode.children
    .filter((c: any) => c.type === 'parameter' || c.type === 'required_parameter' || c.type === 'optional_parameter')
    .map((p: any) => {
      const name = p.childForFieldName?.('name') || findChild(p, 'identifier');
      const type = p.childForFieldName?.('type') || findChild(p, 'type_annotation');
      const nameText = name?.text || '';
      const typeText = type ? cleanType(type.text) : 'any';
      return `${nameText}:${typeText}`;
    })
    .join(',');
}

function cleanType(typeText: string): string {
  return typeText.replace(/^:\s*/, '').trim();
}