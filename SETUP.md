# LoomMCP — Universal Client Setup Guide

Connect LoomMCP to **any** MCP-compatible client in under 5 minutes.

## TL;DR

```bash
npm install -g @loom-mcp/server
loom start
```

Then configure your client (find yours below). That's it.

## The Server

```bash
# Start with defaults (MCP on :8080, dashboard on :2337)
loom start

# Custom ports
LOOM_PORT=9090 LOOM_DASHBOARD_PORT=3000 loom start

# With config file
loom start --config ./loom.config.json
```

Verify it's running:
```bash
curl http://localhost:2337/health
# → {"status":"ok","dashboard":"running",...}
```

---

## Claude Code

### Interactive (fastest)
```bash
/mcp add loom localhost:8080
```

### Config file (`~/.claude/settings.json` or project `.claude/settings.json`)
```json
{
  "mcpServers": {
    "loom": {
      "command": "node",
      "args": ["/full/path/to/loommcp/dist/index.js"],
      "env": {}
    }
  }
}
```

To find your path:
```bash
node -e "console.log(require('path').resolve('.'))"
# Copy the output, remove the trailing newline, add /dist/index.js
```

---

## Claude Desktop (macOS / Windows)

Open `~/Library/Application Support/Claude/claude_desktop_config.json` (macOS) or `%APPDATA%\Claude\claude_desktop_config.json` (Windows) and add:

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

Or with a local install:
```json
{
  "mcpServers": {
    "loom": {
      "command": "node",
      "args": ["/Users/you/code/loommcp/dist/index.js"]
    }
  }
}
```

Restart Claude Desktop after editing.

---

## Cursor

1. Open **Cursor Settings** → **MCP** (or press `Cmd+,` then search "MCP")
2. Click **Add new MCP server**
3. Fill in:

| Field | Value |
|:------|:------|
| **Name** | `loom` |
| **Command** | `node` |
| **Arguments** | `/path/to/loommcp/dist/index.js` |

Or edit `~/.cursor/mcp_settings.json` directly:
```json
{
  "mcpServers": {
    "loom": {
      "command": "node",
      "args": ["/Users/you/code/loommcp/dist/index.js"]
    }
  }
}
```

---

## VS Code (Cline Extension)

If you're using the **Cline MCP extension** or any MCP-compatible VS Code extension:

1. Open VS Code Settings → Extensions → MCP (or your specific extension)
2. Add server:

```json
{
  "mcpServers": {
    "loom": {
      "command": "node",
      "args": ["/path/to/loommcp/dist/index.js"]
    }
  }
}
```

Or in the extension's JSON config:
```json
{
  "loom": {
    "command": "loom",
    "args": ["start"]
  }
}
```

---

## VS Code (Continue Extension)

In `~/.continue/config.json`:
```json
{
  "mcpServers": {
    "loom": {
      "command": "node",
      "args": ["/path/to/loommcp/dist/index.js"]
    }
  }
}
```

---

## OpenCode

```json
{
  "mcpServers": {
    "loom": {
      "command": "node",
      "args": ["/path/to/loommcp/dist/index.js"]
    }
  }
}
```

Location: `~/.opencode/mcp.json` or project config.

---

## Codex CLI (OpenAI)

```bash
# Option 1: npx (no install)
codex config add-mcp loom --command "npx" --args "-y @loom-mcp/server start"

# Option 2: local install
codex config add-mcp loom --command "node" --args "/path/to/loommcp/dist/index.js"

# Option 3: global install
codex config add-mcp loom --command "loom" --args "start"
```

---

## Zed

In `~/.config/zed/settings.json`:
```json
{
  "mcpServers": {
    "loom": {
      "command": "node",
      "args": ["/path/to/loommcp/dist/index.js"]
    }
  }
}
```

---

## Windsurf

In `~/.windsurf/settings.json`:
```json
{
  "mcpServers": {
    "loom": {
      "command": "node",
      "args": ["/path/to/loommcp/dist/index.js"]
    }
  }
}
```

---

## Google Gemini CLI

```bash
gemini mcp add loom -- node /path/to/loommcp/dist/index.js
```

Or edit `~/.gemini/mcp.json`:
```json
{
  "servers": {
    "loom": {
      "command": "node",
      "args": ["/path/to/loommcp/dist/index.js"]
    }
  }
}
```

---

## Any Generic MCP Client

LoomMCP is a **stdio MCP server**. Any client that speaks the MCP protocol over stdin/stdout works:

```bash
# Direct execution
node /path/to/loommcp/dist/index.js

# Or with npx
npx -y @loom-mcp/server start

# Or with global install
loom start
```

Configure your client to spawn this process and communicate over stdin/stdout.

---

## Docker Deployment

For team/shared deployments:

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install --legacy-peer-deps
COPY . .
RUN npm run build
EXPOSE 2337
CMD ["node", "dist/index.js"]
```

```bash
docker build -t loom-mcp .
docker run -p 2337:2337 -p 8080:8080 -v /path/to/codebase:/workspace loom-mcp
```

Then connect clients to `http://your-docker-host:8080` (note: TCP mode — stdio is default).

---

## Environment Variables

| Variable | Default | Description |
|:---------|:--------|:------------|
| `LOOM_PORT` | `8080` | TCP server port (stdio mode is default) |
| `LOOM_DASHBOARD_PORT` | `2337` | Dashboard port |
| `LOOM_WORKSPACE_ROOT` | `cwd` | Workspace directory |
| `LOOM_CACHE_DIR` | `.loom` | Cache directory |
| `LOOM_FOCUS_BUDGET` | `20` | Max files in focus |
| `LOOM_LOG_LEVEL` | `info` | `debug`, `info`, `warn`, `error` |

---

## Configuration File

Create `loom.config.json` in your project root:

```json
{
  "workspace": ".",
  "languages": ["ts", "tsx", "js", "jsx", "py", "rs", "go", "java", "cs"],
  "exclude": ["node_modules", ".git", "dist", "build", "target", "*.min.js"],
  "focusBudget": 20,
  "topologyCalls": 100,
  "searchRefs": 200,
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

---

## Verification

After connecting, test with:

```bash
# Dashboard health
curl http://localhost:2337/health

# Dashboard state
curl http://localhost:2337/state

# Token badge
curl http://localhost:2337/badge.svg -o badge.svg

# API summary
curl http://localhost:2337/api/summary
```

In your client, try calling `loom_get_topology` to confirm the connection works.

---

## Troubleshooting

### "Connection refused"
- Make sure `loom start` is running
- Check it's listening on the right port: `netstat -an | grep 8080`

### "Tool not found"
- You connected the TCP endpoint but LoomMCP defaults to stdio mode
- Start with `loom start --transport tcp` for TCP mode, or use the CLI directly

### "Permission denied" (Linux/macOS)
```bash
sudo chown -R $(whoami) ~/.loom
```

### "Module not found"
- Run `npm run build` in the loommcp directory first
- Make sure the path to `dist/index.js` is correct

### Port already in use
```bash
LOOM_PORT=9090 loom start
# Then update your client config
```

### Windows path issues
Use absolute paths with backslashes or forward slashes:
```json
{
  "command": "node",
  "args": ["C:\\Users\\you\\code\\loommcp\\dist\\index.js"]
}
```

---

## Next Steps

- See [README.md](README.md) for full feature documentation
- Run `node eval/benchmark.js .` to measure your token reduction
- Visit `http://localhost:2337` for the live dashboard
- Add your badge: `![Tokens Saved](http://localhost:2337/badge.svg)`