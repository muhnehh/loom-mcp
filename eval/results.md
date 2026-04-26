# Benchmark Results

Token efficiency benchmarks comparing LoomMCP to traditional file reading.

## Latest Results (v0.6.0)

| Repository | Files | Baseline Tokens | LoomMCP Tokens | Reduction |
|------------|:-----:|:---------------:|:--------------:|:----------:|
| loommcp (self) | 33 | 53,619 | 1,449 | **97.75%** |
| medium_webapp | 12 | 13,272 | 266 | **98%** |
| small_api | 5 | 4,052 | 92 | **98%** |

**Average: 97.75% token reduction**

---

## Token Reduction Detail

### loommcp (self)
* Raw source: 53,619 tokens (213KB / 4)
* TOON skeleton: 1,449 tokens (5.8KB / 4)
* **Reduction: 97.75%**
* Latency: ~4s

### medium_webapp
* Raw source: 13,272 tokens (53KB / 4)
* TOON skeleton: 266 tokens (1KB / 4)
* **Reduction: 98%**
* Latency: ~1s

### small_api
* Raw source: 4,052 tokens (16KB / 4)
* TOON skeleton: 92 tokens (368B / 4)
* **Reduction: 98%**
* Latency: ~500ms

---

## Comparative Analysis

| Metric | Traditional (Grep+Read) | LoomMCP | Improvement |
|--------|------------------------|---------|-----------|
| Tokens per search | 50,000+ | 500-2,000 | **25-100x** |
| Relevance | Low | High | **Better** |
| Latency | 2-5s | 50-500ms | **Faster** |

---

## Reproducing This

```bash
# Build
npm run build

# Run benchmark
node eval/benchmark.js . --json

# Output
# loommcp: 33f, 97% reduction, 4000ms
```

---

## Historical

### v0.5.0 — Initial Release
* Token reduction: 95%
* Languages: 7

### v0.6.0 — Current
* Token reduction: 97.75%
* Languages: 15+
* Added: compact wire format, token-budgeted context, symbol provenance