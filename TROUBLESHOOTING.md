# Troubleshooting

Common issues and fixes.

## Installation

### Error: Module not found

```bash
# Reinstall
rm -rf node_modules package-lock.json
npm install --legacy-peer-deps
```

### Error: tree-sitter parser missing

```bash
# Install language packs
npm install tree-sitter-typescript tree-sitter-python tree-sitter-go tree-sitter-rust
```

## Server

### Server won't start

```bash
# Check if port is in use
lsof -i :2337

# Kill process or use different port
LOOM_DASHBOARD_PORT=3000 npm start
```

### No response to requests

```bash
# Enable debug logging
LOOM_LOG_LEVEL=debug npm start

# Check stderr for errors
```

## Tools

### ERROR:path_traversal_blocked

The path is outside the workspace. Use relative paths:

```javascript
// Bad
loom_get_topology { dir: "/Users/name/project" }

// Good
loom_get_topology { dir: "." }
```

### ERROR:focus_budget_exceeded

Too many files focused. Call `loom_blur` first:

```javascript
loom_blur {}
```

### ERROR:topology_limit_exceeded

Circuit breaker triggered. Wait and retry, or use search first:

```javascript
loom_search_symbols { query: "functionName" }
loom_get_topology { dir: "." }  // Try again
```

## Search

### No search results

1. Run `loom_get_topology` first to index the codebase
2. Use simpler queries
3. Check the query spelling

### Results not relevant

Try different search tools:

```javascript
// BM25 ranking (better for keywords)
loom_bm25_search { query: "handler" }

// Fuzzy for typos
loom_fuzzy_search { query: "handlr", max_distance: 2 }

// GPU semantic search
loom_semantic_search { query: "authentication" }
```

## Benchmark

### Benchmark shows 0% reduction

1. Path security is blocking the directory
2. Use relative paths: `node eval/benchmark.js .`
3. Check logs for `ERROR:path_traversal_blocked`

---

## Getting Help

1. Check [SUPPORT.md](SUPPORT.md)
2. Run with debug logging
3. Open an issue on GitHub