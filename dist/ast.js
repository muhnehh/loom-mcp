"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.skeletonizeFile = skeletonizeFile;
const tree_sitter_1 = __importDefault(require("tree-sitter"));
const tree_sitter_typescript_1 = __importDefault(require("tree-sitter-typescript"));
const tree_sitter_python_1 = __importDefault(require("tree-sitter-python"));
const tree_sitter_go_1 = __importDefault(require("tree-sitter-go"));
const tree_sitter_rust_1 = __importDefault(require("tree-sitter-rust"));
const tree_sitter_java_1 = __importDefault(require("tree-sitter-java"));
const fs_1 = require("fs");
const path_1 = require("path");
const parsers = {};
function initParser(lang) {
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
const goLang = tree_sitter_go_1.default.go || tree_sitter_go_1.default;
const rustLang = tree_sitter_rust_1.default.rust || tree_sitter_rust_1.default;
const javaLang = tree_sitter_java_1.default.java || tree_sitter_java_1.default;
const langMap = {
    ts: tsLang,
    tsx: tsLang,
    js: jsLang,
    jsx: jsLang,
    py: tree_sitter_python_1.default,
    go: goLang,
    rs: rustLang,
    java: javaLang,
    cs: javaLang,
};
function skeletonizeFile(filePath) {
    const ext = filePath.split('.').pop()?.toLowerCase() || '';
    if (!parsers[ext] && langMap[ext]) {
        parsers[ext] = initParser(langMap[ext]);
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
        return { path: filePath, nodes, tokenEstimate: Math.ceil(nodes.length * 15) };
    }
    catch (parseError) {
        const errMsg = parseError instanceof Error ? parseError.message : String(parseError);
        logError(filePath, errMsg);
        return createFallbackSkeleton(filePath);
    }
}
function logError(filePath, msg) {
    try {
        const logDir = (0, path_1.join)(process.cwd(), '.loom');
        if (!(0, fs_1.existsSync)(logDir))
            (0, fs_1.mkdirSync)(logDir, { recursive: true });
        (0, fs_1.appendFileSync)((0, path_1.join)(logDir, 'errors.log'), `${new Date().toISOString()} ${filePath}: ${msg}\n`);
    }
    catch { }
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
                if (match)
                    funcs.push({ name: match[1], kind: 'function', params: match[2] || '', returnType: match[3] || 'void', lineStart: i, lineEnd: i });
            }
            else if (line.startsWith('interface ') || line.startsWith('type ')) {
                const match = line.match(/(?:interface|type)\s+(\w+)/);
                if (match)
                    funcs.push({ name: match[1], kind: 'type', lineStart: i, lineEnd: i });
            }
            else if (line.startsWith('class ')) {
                const match = line.match(/class\s+(\w+)/);
                if (match)
                    funcs.push({ name: match[1], kind: 'class', lineStart: i, lineEnd: i });
            }
        }
        return { path: filePath, nodes: funcs, tokenEstimate: Math.ceil(funcs.length * 15) };
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
        case 'function_item':
            extractFunction(node, results, source);
            return;
        case 'class_declaration':
        case 'class':
        case 'struct_definition':
            extractClass(node, results, source);
            return;
        case 'type_alias_declaration':
        case 'type_alias':
        case 'interface_declaration':
            extractType(node, results, source);
            return;
        case 'const_declaration':
        case 'const_item':
        case 'variable_declaration':
            extractConst(node, results, source);
            return;
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
    if (nameNode?.text) {
        const isMethod = node.parent?.type?.includes('class');
        results.push({
            name: nameNode.text,
            kind: isMethod ? 'method' : 'function',
            params: paramsNode ? extractParams(paramsNode) : '',
            returnType: returnNode ? cleanType(returnNode.text) : 'void',
            lineStart: node.startPosition?.row || 0,
            lineEnd: node.endPosition?.row || 0
        });
    }
}
function extractClass(node, results, source) {
    const nameNode = node.childForFieldName?.('name') || findChild(node, 'identifier');
    if (!nameNode?.text)
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
    if (!nameNode?.text)
        return;
    const members = [];
    const typeNode = node.childForFieldName?.('type') || findChild(node, 'type');
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
function extractConst(node, results, source) {
    const nameNode = node.childForFieldName?.('name') || findChild(node, 'identifier');
    const typeNode = node.childForFieldName?.('type') || findChild(node, 'type');
    if (nameNode?.text) {
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
        return `${name?.text || ''}:${type ? cleanType(type.text) : 'any'}`;
    })
        .join(',');
}
function cleanType(typeText) {
    return typeText.replace(/^:\s*/, '').trim();
}
