# LoomMCP Releases

## Release Process

### Version Scheme

- **v0.x.y** - Development releases
- **v1.0.0** - First stable release
- **x.y.z** - Semantic versioning

### Making a Release

```bash
# Update version in package.json
# Update CHANGELOG.md with date
# Commit changes
git commit -m "chore: bump to v0.6.0"

# Create tag
git tag v0.6.0 -m "Release v0.6.0"

# Push with tags
git push && git push --tags
```

### Release Checklist

- [x] All tests pass
- [x] Benchmark runs clean
- [x] CHANGELOG.md updated
- [x] package.json version bump
- [x] Build passes (`npm run build`)
- [x] Git tag created

### Running Benchmarks Before Release

```bash
# Local benchmark
npm run benchmark

# Compare with jCodeMunch/Srclight
# Document in EVAL.md

# Post results to:
# - GitHub release notes
# - Twitter/X
# - Reddit r/LocalLLaMA
# - HN Show
```

## Release History

### v0.6.0 - 2026-04-25

**Features:**
- GPU semantic search (CUDA)
- Live watch reindex
- SQLite workspace
- 28+ MCP tools

**Benchmark:** 97% token reduction

### v0.5.0 - 2026-04-20

**Features:**
- Cross-session memory
- Session replay
- Live dashboard

### v0.4.0 - 2026-04-15

**Features:**
- Dependency graph
- Session metrics

### v0.3.0 - 2026-04-10

**Features:**
- 17 MCP tools
- 7 languages

---

## Target: v1.0.0

Milestone: 500 stars, public benchmarks, community adoption

### Required Before v1.0.0

- [ ] 500 stars on GitHub
- [ ] Public benchmark results (SWE-bench, RepoEval)
- [ ] 5+ case studies
- [ ] Community packs (Next.js, Django, etc.)
- [ ] Security audit

## Known Issues

- Multi-repo workspace limited
- GPU embeddings need more testing on NVIDIA WSL2
- PHP/Swift tree-sitter not building (Windows)