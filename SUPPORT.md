# LoomMCP Support Guide

Comprehensive documentation for getting help with LoomMCP.

## Table of Contents

1. [Quick Help](#quick-help)
2. [Troubleshooting](#troubleshooting)
3. [Tool Reference](#tool-reference)
4. [Configuration](#configuration)
5. [Integrations](#integrations)
6. [FAQs](#faqs)
7. [Getting More Help](#getting-more-help)

---

## Quick Help

### Installation Issues

```bash
# Clean install
rm -rf node_modules package-lock.json
npm install --legacy-peer-deps

# Verify install
npm list @loom-mcp/server
```

### Server Won't Start

```bash
# Check port availability
lsof -i :2337

# Use different port
LOOM_DASHBOARD_PORT=3000 npm start

# Check logs
LOOM_LOG_LEVEL=debug npm start
```

### Client Connection Issues

```bash
# Verify server is running
curl http://localhost:2337/health

# Test stdio directly
echo '{"jsonrpc":"2.0","method":"tools/list","id":1}' | npm start
```

---

## Troubleshooting

### Token Reduction Low (< 90%)

**Symptoms:** High token usage despite using LoomMCP

**Solutions:**
1. Verify you're using `loom_get_topology` not reading full files
2. Check `loom_get_metrics` for tool breakdown
3. Increase focus budget in config: `"focusBudget": 50`

### Slow Performance (> 2s latency)

**Symptoms:** High latency on tool calls

**Solutions:**
1. Reduce scanned directories: `"maxFiles": 200`
2. Lower depth setting in `loom_get_topology`
3. Use `loom_blur` to release focused files
4. Check circuit breaker: `circuitBreaker.topologyCalls`

### "focus_budget_exceeded" Error

**Solutions:**
```bash
# Use loom_blur to release files
loom_blur { "target": "src/utils.ts" }

# Or increase budget in config
{
  "focusBudget": 50
}
```

### "path_traversal_blocked" Error

**Cause:** Security protection blocked path

**Solution:** Relative paths only - avoid `../../etc/passwd`

### Memory Errors

**Solutions:**
1. Reduce batch size in config
2. Limit scanned file types
3. Use circuit breaker limits

### Multi-Repo Not Working

**Ensure:**
```bash
# Attach repo first
loom_attach_repo { "path": "../other-repo" }

# Then search
loom_workspace_search { "query": "functionName" }
```

---

## Tool Reference

### Core Tools (Required)

| Tool | When to Use | Example |
|:-----|:-----------|:---------|
| `loom_get_topology` | Initial codebase overview | `{"dir": "src", "depth": 3}` |
| `loom_focus` | Need full file content | `{"target": "src/index.ts"}` |
| `loom_search_symbols` | Find functions/classes | `{"query": "handleSubmit", "limit": 10}` |
| `loom_get_symbol` | Get specific symbol source | `{"symbol": "index::main"}` |

### Search Tools

| Tool | When to Use | Example |
|:-----|:-----------|:---------|
| `loom_bm25_search` | Best keyword search | `{"query": "auth", "limit": 10}` |
| `loom_fuzzy_search` | Typo tolerance | `{"query": "hander", "threshold": 0.5}` |
| `loom_hybrid_search` | Keyword + semantic | `{"query": "login flow"}` |
| `loom_search_refs` | Find all references | `{"symbol": "validateEmail"}` |
| `loom_semantic_search` | Meaning-based | `{"query": "user authentication"}` |

### Analysis Tools

| Tool | When to Use | Example |
|:-----|:-----------|:---------|
| `loom_find_importers` | What's using this? | `{"symbol": "parseConfig"}` |
| `loom_blast_radius` | Change impact | `{"symbol": "UserService"}` |
| `loom_find_dead_code` | Unused code | `{"scope": "workspace"}` |
| `loom_pagerank_centrality` | Core modules | `{"iterations": 20}` |
| `loom_get_class_hierarchy` | Inheritance tree | `{"class": "Component"}` |
| `loom_get_symbol_importance` | Critical symbols | `{"symbol": "init"}` |

### Workspace Tools

| Tool | When to Use | Example |
|:-----|:-----------|:---------|
| `loom_attach_repo` | Add another repo | `{"path": "../backend"}` |
| `loom_workspace_search` | Cross-repo search | `{"query": "api"}` |
| `loom_detect_frameworks` | Project type | `{}` |

### Session Tools

| Tool | When to Use | Example |
|:-----|:-----------|:---------|
| `loom_remember` | Save insight | `{"entity": "auth", "summary": "JWT flow"}` |
| `loom_recall` | Retrieve memory | `{"query": "auth"}` |
| `loom_get_active_diff` | Session changes | `{}` |
| `loom_blur` | Release focus | `{"target": "src/utils.ts"}` |

### Compression Tools

| Tool | When to Use | Example |
|:-----|:-----------|:---------|
| `loom_session_compress` | Set mode | `{"mode": "debug"}` |
| `loom_diff_compress` | Git changes | `{"since": "HEAD~5"}` |
| `loom_get_changed_symbols` | Modified files | `{}` |

### Metrics Tools

| Tool | When to Use | Example |
|:-----|:-----------|:---------|
| `loom_get_deps` | Dependency graph | `{"format": "dot"}` |
| `loom_get_metrics` | Session stats | `{"breakdown": true}` |
| `loom_get_sessions` | History | `{"limit": 10}` |

### Agent Tools

| Tool | When to Use | Example |
|:-----|:-----------|:---------|
| `loom_enforce_hook` | Force tool usage | `{"hook_type": "pre", "tool": "*"}` |
| `loom_agent_info` | Supported agents | `{"agent": "claude code"}` |
| `loom_get_confidence` | Result confidence | `{}` |

---

## Configuration

### Basic Config (loom.config.json)

```json
{
  "workspaceRoot": ".",
  "cacheDir": ".loom",
  "focusBudget": 20,
  "maxFiles": 500,
  "languages": ["ts", "tsx", "js", "jsx", "py"],
  "ignoreDirs": ["node_modules", ".git", "dist"],
  "dashboardPort": 2337
}
```

### Advanced Config

```json
{
  "circuitBreaker": {
    "focusBudget": 20,
    "topologyCalls": 100,
    "searchRefs": 200
  },
  "bm25": {
    "k1": 1.5,
    "b": 0.75
  },
  "pagerank": {
    "iterations": 20,
    "damping": 0.85
  }
}
```

### Environment Variables

| Variable | Default | Description |
|:---------|:--------|:-----------|
| `LOOM_DASHBOARD_PORT` | 2337 | Dashboard port |
| `LOOM_LOG_LEVEL` | info | debug, info, warn, error |
| `LOOM_LOG_FILE` | - | Log file path |
| `WORKSPACE_ROOT` | cwd | Workspace directory |

---

## Integrations

### Claude Code

```bash
/mcp add loom localhost:2337
```

### Claude Desktop

**Windows:** `%APPDATA%\Claude\anthropic.json`
**macOS:** `~/Library/Application Support/Claude/anthropic.json`

```json
{
  "mcpServers": {
    "loom": {
      "command": "npx",
      "args": ["-y", "@loom-mcp/server", "start"]
    }
  }
}
```

### Cursor

Settings → Extensions → MCP → Add:

```
Name: LoomMCP
Command: npx -y @loom-mcp/server start
```

### VS Code

Install `uvm` extension, then:

```json
{
  "mcpServers": {
    "loom": {
      "command": "npx",
      "args": ["-y", "@loom-mcp/server", "start"]
    }
  }
}
```

### Codex CLI

```bash
codex mcp add loom -- npx -y @loom-mcp/server start
```

### OpenCode

```bash
/opencode mcp add loom -- npx -y @loom-mcp/server start
```

### NOUS Hermes

```bash
hermes mcp add loom -- npx -y @loom-mcp/server start
```

### Docker

```bash
# Build
docker build -t loom-mcp .

# Run
docker run -p 2337:2337 -v $(pwd):/workspace loom-mcp

# With custom port
LOOM_DASHBOARD_PORT=3000 docker run -p 3000:3000 loom-mcp
```

---

## FAQs

### Q: How is LoomMCP different from jCodeMunch?

**A:** LoomMCP offers:
- Cross-session memory (unique)
- Live dashboard with SSE
- Session replay for debugging
- Task-aware compression modes
- LoomPacks for frameworks
- MIT license (free forever)

### Q: Why is token reduction less than 95%?

**A:** Token reduction depends on:
1. Using `loom_get_topology` (signatures only)
2. Not using `loom_focus` excessively
3. Code structure (more functions = more reduction)

### Q: Can I use LoomMCP with multiple repos?

**A:** Yes! Use:
```bash
loom_attach_repo { "path": "../backend", "name": "backend" }
loom_workspace_search { "query": "user" }
```

### Q: How do I force agents to use LoomMCP tools?

**A:** Use enforcement hooks:
```bash
loom_enforce_hook { "hook_type": "pre", "tool": "*", "action": "warn" }
```

### Q: Is my code secure?

**A:** LoomMCP includes:
- Path traversal protection
- Circuit breakers
- No external network calls
- All processing local

### Q: What languages are supported?

**A:** Currently:
- TypeScript/JavaScript (primary)
- Python
- Rust
- Go
- Java
- C#/.NET

### Q: How do I report bugs?

**A:** Open an issue at:
https://github.com/muhnehh/loom-mcp/issues

Include:
- `loom_get_metrics` output
- Error message
- Steps to reproduce

### Q: Can I contribute?

**A:** Yes! See CONTRIBUTING.md
- Fork the repo
- Add tests in `__tests__/`
- Submit PR

---

## Getting More Help

### Documentation

- [README.md](../README.md) - Main docs
- [SETUP.md](../SETUP.md) - Client setup
- [CLAUDE.md](../CLAUDE.md) - AI context

### Examples

```bash
# See benchmark
npm run benchmark

# Run tests
npm test

# Check health
curl http://localhost:2337/health

# Get token badge
curl http://localhost:2337/badge.svg
```

### Logging

```bash
# Debug mode
LOOM_LOG_LEVEL=debug npm start

# To file
LOOM_LOG_LEVEL=debug LOOM_LOG_FILE=loom.log npm start
```

### Report Issues

https://github.com/muhnehh/loom-mcp/issues

Include:
- LoomMCP version (`npm list @loom-mcp/server`)
- Error output
- Reproduction steps
- Client being used