# Contributing to LoomMCP

We welcome contributions! Here's how to get started.

## Development Setup

```bash
git clone https://github.com/muhnehh/loom-mcp.git
cd loom-mcp
npm install --legacy-peer-deps
npm run build
npm run test
```

## Project Structure

```
src/
  index.ts           - Entry point
  tools.ts           - MCP tool handlers (17 tools)
  ast.ts             - Tree-sitter skeletonization
  toon.ts           - TOON format compiler
  cache.ts         - State persistence
  security.ts      - Path traversal + circuit breaker
  watcher.ts        - File system watchers
  cli.ts           - CLI commands
  dashboard/
    server.ts      - Express + SSE dashboard
  adapters/
    graph.ts       - Dependency graph builder
    metrics.ts     - Session metrics collector
  replay/
    recorder.ts   - Session JSONL recorder
    replay-ui.ts  - Replay HTML player
```

## Adding a New Tool

1. Add to the `ListToolsRequestSchema` handler in `tools.ts`
2. Implement in the `CallToolRequestSchema` handler
3. Add tests in `__tests__/`
4. Update README tool table

## Adding a New Language

1. Add tree-sitter parser to dependencies in `package.json`
2. Register parser in `src/ast.ts`
3. Add test cases
4. Update README language table

## Adding a LoomPack

1. Create `packs/<name>/loom.config.json`
2. Update `packs/README.md`
3. Add tests for the configuration

## Running Tests

```bash
npm run test        # Run all tests
npm run benchmark   # Run token reduction benchmark
```

## Code Style

- TypeScript strict mode
- No TODO comments (resolve before PR)
- No `require()` in ESM modules — use dynamic imports
- All tools must return consistent error format: `ERROR:<message>`

## Commit Format

```
type(scope): description

types: feat, fix, chore, docs, test, refactor
```

## Submitting PRs

1. Fork the repo
2. Create a feature branch
3. Make changes + tests pass
4. Submit PR with description of changes