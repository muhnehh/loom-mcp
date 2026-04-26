# LoomMCP Technical Specification

> Version: 0.6.0 | This document describes the external tool contract, data model, operational behavior, and implementation-aligned semantics.

---

## Table of Contents

* [Overview](#overview)
* [Core Operating Model](#core-operating-model)
* [Tool Surface](#tool-surface)
  * [Indexing and Repository Management](#indexing-and-repository-management)
  * [Discovery and Repository Inspection](#discovery-and-repository-inspection)
  * [Retrieval](#retrieval)
  * [Search](#search)
  * [Relationship and Impact Analysis](#relationship-and-impact-analysis)
  * [Freshness and Backpressure](#freshness-and-backpressure)
  * [Observability](#observability)

---

## Overview

**LoomMCP** is a universal context compiler for AI coding agents. It uses tree-sitter AST parsing to extract code signatures (functions, classes, methods, types, constants) and provides surgical retrieval without reading entire files.

The core contract:

1. skeletonize a repository (extract signatures)
2. search symbols by name, kind, or relevance
3. retrieve exact implementations by byte-offset
4. analyze relationships and impact

---

## Core Operating Model

LoomMCP operates as a **local-first structured retrieval layer**:

* Parse source files into normalized symbol index
* Store symbol metadata separately from raw file contents
* Retrieve precise source segments by byte offset
* Expose capabilities through MCP tool surface
* Report operational metadata through response headers

---

## Tool Surface

### Indexing and Repository Management

#### `loom_get_topology` — Skeletonize a directory

```json
{ "dir": ".", "languages": ["ts", "tsx", "js", "jsx", "py"] }
```

Returns AST skeleton with function/class signatures, line numbers, and byte offsets.

**Response:**

```
topology:src/
files:15
token_estimate:2340
token_reduction:97%
latency_ms:1234

src/index.ts:
  fn:main():void
  class:Server
    fn:start():void
    fn:stop():void
  type:Config{host,port}
```

---

#### `loom_focus` — Page in full implementation

```json
{ "target": "src/index.ts::main" }
```

Returns the full source for a specific function/class.

---

### Search

#### `loom_search_symbols` — Search across symbols

```json
{ "query": "router handler", "max_results": 10 }
```

Returns ranked symbol matches with file paths and line numbers.

---

#### `loom_bm25_search` — BM25 ranking search

```json
{ "query": "async function", "k1": 1.5, "b": 0.75 }
```

Statistical keyword search better than simple matching.

---

#### `loom_fuzzy_search` — Fuzzy matching

```json
{ "query": "fucntion", "max_distance": 2 }
```

Levenshtein distance for typo tolerance.

---

#### `loom_semantic_search` — GPU semantic embeddings

```json
{ "query": "authentication flow", "top_k": 5 }
```

GPU-accelerated semantic search via @xenova/transformers.

---

### Retrieval

#### `loom_get_symbol` — Get exact source

```json
{ "symbol": "src/utils.ts::parseConfig" }
```

Byte-offset retrieval, O(1) time complexity.

---

#### `loom_get_ranked_context` — Token-budgeted context

```json
{ "query": "middleware", "max_tokens": 2000 }
```

Query-driven context assembly within token budget.

---

### Relationship and Impact Analysis

#### `loom_find_importers` — Find reverse dependencies

```json
{ "symbol": "src/auth.ts" }
```

Finds files that import a given symbol.

---

#### `loom_blast_radius` — Change impact analysis

```json
{ "symbol": "Config", "depth": 3 }
```

Shows affected symbols within N hops.

---

#### `loom_get_class_hierarchy` — Inheritance tree

```json
{ "class": "Server" }
```

Traverse class inheritance - parents and children.

---

#### `loom_pagerank_centrality` — Architectural importance

```json
{ "top_n": 10 }
```

PageRank algorithm for architectural importance scoring.

---

#### `loom_find_dead_code` — Unused code detection

```json
{ "min_calls": 0 }
```

Detect unreachable functions and unused code.

---

### Observability

#### `loom_get_metrics` — Session metrics

Returns tool call breakdown, latency tracking, token savings.

---

#### `loom_get_deps` — Dependency graph

```json
{ "format": "dot" }
```

Dependency graphs in text, DOT, or JSON.

---

### Symbol Provenance

#### `loom_get_symbol_provenance` — Git history

```json
{ "symbol": "src/index.ts:main" }
```

Returns git log for a symbol: commits, authors, dates.

---

### Live Watching

#### `loom_watch_start` — Live file watching

```json
{ "path": "src", "debounce_ms": 500 }
```

Auto-reindex on file changes with debounce.

---

## Data Models

### FileSkeleton

```typescript
interface ASTNode {
  name: string;
  kind: 'function' | 'class' | 'type' | 'interface' | 'const' | 'method';
  params?: string;
  returnType?: string;
  members?: ASTNode[];
  lineStart: number;
  lineEnd: number;
}

interface FileSkeleton {
  path: string;
  nodes: ASTNode[];
  tokenEstimate: number;
}
```

---

## Response Envelope

Tool responses include metadata header:

```
topology:src/
files:15
token_estimate:2340
token_reduction:97%
latency_ms:1234

<TOON content>
```

---

## Error Handling

| Error | Description |
|-------|-------------|
| `ERROR:path_traversal_blocked` | Path security violation |
| `ERROR:focus_budget_exceeded` | Focus limit hit, call `loom_blur` |
| `ERROR:topology_limit_exceeded` | Circuit breaker trigger |
| `ERROR:invalid_symbol_format` | Use `file:symbol` format |

---

## Token Savings Semantics

* **rawTokens** = source file character count / 4
* **tokenEstimate** = TOON output length / 4
* **reduction** = (1 - tokenEstimate / rawTokens) * 100

---

## Reproducing Results

```bash
# Build and run benchmark
npm run build
node eval/benchmark.js . --json
```

---

## Limitations

1. **Baseline is a lower bound** — Real agents re-read files multiple times
2. **Query corpus is small** — Results vary by use case
3. **No quality measurement** — Assumes retrieved symbols are relevant