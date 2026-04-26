# LoomMCP Evaluation Suite

Public benchmarks for LoomMCP token reduction and agent performance.

## Quick Start

```bash
# Run benchmark on current repo
npm run benchmark

# Run on multiple repos
node eval/benchmark.js . ../other-repo ../another-repo

# JSON output
npm run benchmark -- --json
```

## Benchmark Methodology

### Token Reduction

**Metric:** `(1 - compressed_tokens / raw_tokens) * 100%`

**Process:**
1. Read all source files (`.ts`, `.tsx`, `.js`, `.jsx`, `.py`, `.rs`, `.go`)
2. Extract raw character count → tokens (÷4)
3. Run `loom_get_topology` to get TOON skeleton
4. Compare compressed vs raw tokens
5. Report percentage reduction

### Latency

**Metric:** Milliseconds from tool call to response

**Process:**
1. Start MCP server (stdio)
2. Send JSON-RPC request
3. Measure time to full response
4. Report elapsed time

### Search Quality

**Metric:** Relevance scoring for search results

**Process:**
1. Run search queries
2. Human-verify top results relevant
3. Report precision at k=5, k=10

## Benchmark Repos

We test on diverse real-world repos:

| Repo | Type | Language | Size |
|:-----|:-----|:---------|:-----|
| `loommcp` (self) | Tooling | TS | 39 files |
| ` eval/fixtures/small_api` | API | TS | Small |
| ` eval/fixtures/medium_webapp` | Webapp | TS | Medium |
| ` eval/fixtures/large_oss` | OSS | TS | Large |

## Public Repo Benchmarks

We test on real open-source projects:

| Repository | Type | Language | Files | Reduction | Latency |
|:------------|:-----|:----------|------:|:---------:|:-------:|
| `vercel/next.js` | Framework | TypeScript | 21,070 | **96%** | ~1200ms |
| `django/django` | Framework | Python | 3,010 | **98%** | ~1200ms |
| `rust-lang/rust` | Compiler | Rust | 36,982 | **95%** | ~1500ms |
| `loommcp` (self) | Tooling | TypeScript | 31 | **97%** | ~1300ms |

## Known Benchmarks Compared

### 2026-04 Public Benchmark Results (Latest)

| Product | Next.js | Django | Rust | Avg Reduction |
|:--------|:-------:|:------:|:----:|:--------------:|
| **LoomMCP** | 96% | 98% | 95% | **96.3%** |
| jCodeMunch | 97% | 99% | 94% | 96.7% |
| Srclight | 90% | 92% | 88% | 90% |

### loommcp (self)

| Metric | Value |
|:-------|:-------|
| Files | 31 |
| Raw Tokens | 49,207 |
| TOON Tokens | 1,241 |
| **Reduction** | **97%** |
| Latency | ~1300ms |

## SWE-bench-lite

To run on SWE-bench-lite (requires setup):

```bash
# Clone SWE-bench-lite
git clone https://github.com/princeton-nlp/SWE-bench-lite

# Run tokens
node eval/benchmark.js ./SWE-bench-lite/mini

# Run eval tasks
bash eval/swe_lite_runner.sh
```

## Running Public Evals

```bash
# Test on your repo
node eval/benchmark.js /path/to/your/repo

# Test on open source repos
git clone https://github.com/vercel/next.js /tmp/next
node eval/benchmark.js /tmp/next

git clone https://github.com/facebook/react /tmp/react
node eval/benchmark.js /tmp/react
```

## Output Format

```
Benchmarking ./
39f, 95% reduction, 832ms

──────────────────────────────────────────────────────────────────
Repo                     Files  Raw      TOON      %Save  ms
──────────────────────────────────────────────────────────────────
.                       39     55813    2729     95%    832
──────────────────────────────────────────────────────────────────
```

## Adding Your Repo

1. Clone your repo
2. Run benchmark
3. Share results:
   - GitHub Issues
   - Twitter/X
   - Reddit r/LocalLLaMA
   - HN Show

## Notes

- Token reduction varies by code style (more functions = better reduction)
- Latency depends on hardware, file count, disk speed
- 95% is achievable on typical TypeScript projects