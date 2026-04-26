# Agent Hints

Hints and best practices for AI agents using LoomMCP.

## Quick Reference

### First Call — Always Start Here

```
loom_get_topology { dir: "." }
```

Get the full codebase skeleton before doing anything else.

### Finding Code

```
# Search for symbols by name
loom_search_symbols { query: "functionName" }

# BM25 ranking (statistically optimal)
loom_bm25_search { query: "async handler" }

# Fuzzy for typos
loom_fuzzy_search { query: "fucntion", max_distance: 2 }
```

### Retrieval

```
# Get exact implementation
loom_get_symbol { symbol: "src/file.ts::functionName" }

# Full file implementation
loom_focus { target: "src/file.ts::functionName" }
```

### Analysis

```
# Find what uses this
loom_find_importers { symbol: "src/auth.ts" }

# Change impact
loom_blast_radius { symbol: "Config", depth: 2 }

# Find dead code
loom_find_dead_code {}
```

### Context

```
# Token-budgeted context
loom_get_ranked_context { query: "middleware", max_tokens: 2000 }
```

---

## Workflow Patterns

### Onboarding to New Codebase

1. `loom_get_topology { dir: "." }` — Get skeleton
2. `loom_search_symbols { query: "main" }` — Find entry points
3. `loom_get_class_hierarchy { class: "App" }` — Understand structure

### Tracing Authentication

1. `loom_search_symbols { query: "authenticate" }` — Find auth functions
2. `loom_get_symbol` — Get implementations
3. `loom_blast_radius` — Find downstream effects

### Bug Investigation

1. `loom_get_active_diff` — What changed recently
2. `loom_find_importers { symbol: errorFunction }` — Find callers
3. `loom_get_symbol_provenance { symbol: file:fn }` — Git history

---

## Token Budget Tips

1. **Start small** — Use `max_tokens: 1000` first
2. **Iterate** — Add more context if needed
3. **Focus** — Use `loom_focus` for specific functions

---

## Common Mistakes

 ❌ Reading entire files withGlob + read
 ✅ Using `loom_search_symbols` + `loom_get_symbol`

 ❌ Grep for every search
 ✅ Using `loom_bm25_search` for ranking

 ❌ Loading all files for context
 ✅ Using `loom_get_ranked_context` with budget

---

## Pro Tips

* Use `loom_pagerank_centrality` to find important files
* Use `loom_get_deps { format: "dot" }` for visualization
* Use `loom_watch_start` for live projects