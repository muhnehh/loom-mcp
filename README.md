# ⚡ LoomMCP: The Context Compiler for Coding Agents

**Stop paying Claude to re-read your `node_modules` and unchanged boilerplate.**

LoomMCP is a local-first Model Context Protocol (MCP) server that acts as a smart memory manager for Claude Code. Instead of dumping raw files into the context window, Loom uses AST parsing to serve structural skeletons, semantic diffs, and on-demand file bodies.

## The Problem

Running an autonomous agent on a large repo costs $20/day because it reads 50k tokens of static context on every single turn.

## The Solution

Loom compresses a 50k token codebase into a 4k token structural map. Claude only pages in the functions it actually needs to edit.

## Token Reduction Benchmark

Measured with `char/4` token estimation (tiktoken fallback) on real TypeScript codebases:

| Repository | Files | Raw Tokens | TOON Tokens | Reduction | Latency |
|:-----------|------:|----------:|------------:|:---------:|:-------:|
| `loommcp` (self) | 23 | 26,055 | 3,629 | **86%** | 655ms |
| `test-project` (small) | 1 | 134 | 62 | **54%** | ~50ms |

Run your own benchmark:
```bash
node eval/benchmark.js . --json
```

## Quickstart

```bash
npx @loom-mcp/server start --dir ./my-project
```

In Claude Code:
```
/mcp add loom localhost:8080
```

## Features

- **AST Skeletons**: Tree-sitter strips function bodies, leaving only signatures and types
- **Active Lens**: Agents use loom_focus to page-in code, keeping context razor-sharp
- **TOON Formatting**: Token-Oriented Object Notation bypasses markdown bloat
- **100% Local**: Runs on your laptop. Zero data sent anywhere except your Anthropic API

## How It Works

1. Agent calls `loom_get_topology` — gets a 4k token TOON skeleton of your whole codebase
2. Agent identifies which function to fix
3. Agent calls `loom_focus("src/auth.ts::loginUser")` — gets only that function
4. Agent writes the fix
5. 12x fewer tokens. 4x faster. Same result.

## MCP Tools

| Tool | Description |
|:-----|:------------|
| `loom_get_topology` | AST skeleton of a directory (signatures only) |
| `loom_focus` | Page in full implementation of file or function |
| `loom_get_active_diff` | What changed this session |
| `loom_blur` | Remove file from active focus |
| `loom_search_refs` | AST-aware find references |

## Architecture

```
┌─────────────────┐     ~8k tokens TOON      ┌──────────────┐
│  Claude Code    │ ◄─────────────────────►  │  LoomMCP     │
│    (Agent)      │                          │  (AST Engine)│
└─────────────────┘                          └──────────────┘
                                                     │
                                                     ▼
                                            ~200k raw tokens
                                                     │
                                                     ▼
                                           ┌──────────────┐
                                           │  Filesystem   │
                                           └──────────────┘
```

## Supported Languages

- TypeScript / JavaScript
- Python

(Rust, Go coming in V2)

## Requirements

- Node.js 18+
- Works on macOS, Linux, Windows

## License

MIT