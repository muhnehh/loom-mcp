# Benchmark Methodology

This document provides full methodological detail for token efficiency benchmarks.

## Scope

The benchmark measures **retrieval token efficiency** — how many LLM input tokens a code exploration tool consumes compared to reading all source files.

## Repositories Under Test

| Repository | Files | Baseline Tokens | Source |
|------------|:-----:|:-------------:|--------|
| loommcp (self) | 33 | 53,619 | This repo |
| medium_webapp | 12 | 13,272 | Demo project |
| small_api | 5 | 4,052 | Demo project |

## Query Corpus

Five queries representing common code exploration intents:

| Query | Intent |
|-------|--------|
| `router route handler` | Core route registration |
| `middleware` | Middleware chaining |
| `error exception` | Error handling |
| `request response` | Request/response |
| `context bind` | Context binding |

## Baseline Definition

**Baseline tokens** = all source file characters / 4

This represents the minimum cost for a "read everything" agent.

## LoomMCP Workflow

For each query:
1. Call `loom_search_symbols(query)` — returns symbol metadata
2. Call `loom_get_symbol()` on matching symbols — returns exact source
3. **Total tokens** = skeleton + source tokens

## Token Counting

**Method:** Character count / 4 (byte approximation)

This agrees with `tiktoken` estimates within ~20% for English code.

Note: Differs from runtime `_meta.tokens_saved` which uses the same approximation.

## Reproducing Results

```bash
npm run build
node eval/benchmark.js . --json
```

## Limitations

1. **Baseline is a lower bound** — Real agents re-read files multiple times
2. **Query corpus is small** — Results vary by use case
3. **No quality measurement** — Assumes retrieved symbols are relevant