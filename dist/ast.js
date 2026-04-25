"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.skeletonizeFile = skeletonizeFile;
const tree_sitter_1 = __importDefault(require("tree-sitter"));
const tree_sitter_typescript_1 = __importDefault(require("tree-sitter-typescript"));
const tree_sitter_python_1 = __importDefault(require("tree-sitter-python"));
const fs_1 = require("fs");
const parsers = {};
let parserErrors = new Map();
function initParser(ext, lang) {
    const p = new tree_sitter_1.default();
    try {
        p.setLanguage(lang);
    }
    catch {
        return null;
    }
    return p;
}
const tsLang = tree_sitter_typescript_1.default.typescript || tree_sitter_typescript_1.default;
const jsLang = tree_sitter_typescript_1.default.javascript || tree_sitter_typescript_1.default;
const pyLang = tree_sitter_python_1.default;
const langMap = {
    ts: tsLang,
    tsx: tsLang,
    js: jsLang,
    jsx: jsLang,
    py: pyLang,
};
function skeletonizeFile(filePath) {
    const ext = filePath.split('.').pop()?.toLowerCase() || '';
    if (!parsers[ext] && langMap[ext]) {
        parsers[ext] = initParser(ext, langMap[ext]);
    }
    const parser = parsers[ext];
    if (!parser) {
        return createFallbackSkeleton(filePath);
    }
    let source;
    try {
        source = (0, fs_1.readFileSync)(filePath, 'utf8');
    }
    catch {
        return { path: filePath, nodes: [], tokenEstimate: 0 };
    }
    try {
        const tree = parser.parse(source);
        const nodes = [];
        walkTree(tree.rootNode, nodes, source);
        return {
            path: filePath,
            nodes,
            tokenEstimate: Math.ceil(nodes.length * 15)
        };
    }
    catch (parseError) {
        parserErrors.set(filePath, parseError.message);
        return createFallbackSkeleton(filePath);
    }
}
function createFallbackSkeleton(filePath) {
    try {
        const content = (0, fs_1.readFileSync)(filePath, 'utf8');
        const lines = content.split('\n');
        const funcs = [];
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
            }
            else if (line.startsWith('interface ') || line.startsWith('type ')) {
                const match = line.match(/(?:interface|type)\s+(\w+)/);
                if (match) {
                    funcs.push({
                        name: match[1],
                        kind: 'type',
                        lineStart: i,
                        lineEnd: i
                    });
                }
            }
            else if (line.startsWith('class ')) {
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
    }
    catch {
        return { path: filePath, nodes: [], tokenEstimate: 0 };
    }
}
function walkTree(node, results, source) {
    if (!node)
        return;
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
function extractFunction(node, results, source) {
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
function extractClass(node, results, source) {
    const nameNode = node.childForFieldName?.('name') || findChild(node, 'identifier');
    if (!nameNode || !nameNode.text)
        return;
    const members = [];
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
function extractType(node, results, source) {
    const nameNode = node.childForFieldName?.('name') || findChild(node, 'identifier');
    const typeNode = node.childForFieldName?.('type') || findChild(node, 'type');
    if (nameNode && nameNode.text) {
        const members = [];
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
function extractConst(node, results, source) {
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
function findChild(node, type) {
    if (!node?.children)
        return null;
    for (const child of node.children) {
        if (child.type === type)
            return child;
    }
    return null;
}
function extractParams(paramsNode) {
    if (!paramsNode?.children)
        return '';
    return paramsNode.children
        .filter((c) => c.type === 'parameter' || c.type === 'required_parameter' || c.type === 'optional_parameter')
        .map((p) => {
        const name = p.childForFieldName?.('name') || findChild(p, 'identifier');
        const type = p.childForFieldName?.('type') || findChild(p, 'type_annotation');
        const nameText = name?.text || '';
        const typeText = type ? cleanType(type.text) : 'any';
        return `${nameText}:${typeText}`;
    })
        .join(',');
}
function cleanType(typeText) {
    return typeText.replace(/^:\s*/, '').trim();
}
