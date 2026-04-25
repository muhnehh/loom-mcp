# LoomPacks — Pre-configured Toolkits for Frameworks

**LoomPacks** are turnkey LoomMCP configurations for specific frameworks and ecosystems. Drop one in and get instant token-optimized context for your stack.

## Available Packs

| Pack | Description | Languages |
|:-----|:------------|:----------|
| `react` | React + TypeScript optimized tooling | TSX, JSX |
| `node` | Node.js/Express/Fastify backend | TS, JS |
| `python-django` | Django + Python web apps | Python |
| `rust-crates` | Rust with workspace support | Rust |
| `golang` | Go modules and microservices | Go |
| `java-spring` | Spring Boot + Maven | Java |
| `csharp-dotnet` | .NET Core + C# | C# |

## How Packs Work

Each pack is a `loom.config.json` with:

- **Language-specific file patterns** — ignores build artifacts, includes relevant files
- **Priority file hints** — tells LoomMCP which files matter most for that framework
- **Focused exclusions** — drops `vendor/`, `.next/`, `target/`, `__pycache__`, etc.
- **Framework-aware symbol grouping** — prioritizes component files, routes, models, handlers

## Installation

Pick a pack and add it to your project root as `loom.config.json`:

### React / Next.js
```bash
# Option 1: Copy from this repo
cp packs/react/loom.config.json ./

# Option 2: Download via CLI
npx @loom-mcp/packs react
```

### Node.js (Express/Fastify)
```bash
cp packs/node/loom.config.json ./
```

## Creating Your Own Pack

```json
{
  "name": "my-stack",
  "workspace": ".",
  "languages": ["ts", "tsx", "js"],
  "exclude": [
    "node_modules",
    ".next",
    "dist",
    "coverage",
    "*.test.ts",
    "*.spec.ts"
  ],
  "focusBudget": 25,
  "priorityPatterns": [
    "src/components/**",
    "src/pages/**",
    "src/hooks/**",
    "src/lib/**"
  ],
  "dashboard": {
    "enabled": true,
    "port": 2337
  },
  "recorder": {
    "enabled": true,
    "directory": ".loom/sessions"
  }
}
```

## Priority Patterns

LoomMCP processes files in order of `priorityPatterns`. Files matching these patterns are analyzed first and given higher weight in topology output.

## Framework-Specific Notes

### React
- Prioritizes `components/`, `hooks/`, `pages/`, `context/`
- Excludes `.next/`, `__pycache__`, build outputs
- Higher focus budget (25) since React apps tend to be file-heavy

### Node.js
- Prioritizes `src/routes/`, `src/middleware/`, `src/models/`, `src/services/`
- Excludes `node_modules/`, `dist/`, `coverage/`

### Python Django
- Prioritizes `apps/*/models.py`, `views.py`, `urls.py`, `admin.py`
- Excludes `__pycache__/`, `.venv/`, `*.pyc`, `migrations/`
- Lower focus budget (15) for faster cold starts

### Rust
- Prioritizes `src/**/*.rs` files
- Excludes `target/`, `**/*.toml`
- Supports workspace crate detection

### Go
- Prioritizes `**/*.go` files, ignores `*_test.go` in topology
- Excludes `vendor/`, `test-project/`

## Contributing Packs

Open a PR with your pack in `packs/<name>/loom.config.json` + a README.

## Roadmap

- [ ] 20+ official packs covering major frameworks
- [ ] Pack registry API
- [ ] `loom pack install <name>` CLI command
- [ ] Community packs marketplace
- [ ] Pack versioning with compatibility checks