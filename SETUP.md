# LoomMCP Universal Configuration

## Quick Setup (Works with ALL MCP Clients)

### Option 1: Claude Code
```bash
# Add MCP server
/mcp add loom localhost:8080

# Or configure in claude_settings.json:
{
  "mcp_servers": {
    "loom": {
      "command": "node",
      "args": ["/path/to/loom-mcp/dist/index.js"],
      "env": {}
    }
  }
}
```

### Option 2: Cursor / OpenCode
```json
{
  "mcpServers": {
    "loom": {
      "command": "node",
      "args": ["/path/to/loom-mcp/dist/index.js"]
    }
  }
}
```

### Option 3: VS Code (with extension)
Search for "LoomMCP" in VS Code Extensions or use the MCP extension:
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

### Option 4: Codex CLI
```bash
codex config add-mcp loom --command "node" --args "./loom-mcp/dist/index.js"
```

### Option 5: Standalone (any app with stdio)
```bash
node dist/index.js
```

## Environment Variables

| Variable | Default | Description |
|:---------|:--------|:------------|
| `LOOM_PORT` | `8080` | MCP server port (stdio mode ignores) |
| `LOOM_DASHBOARD_PORT` | `2337` | Dashboard port |
| `LOOM_WORKSPACE_ROOT` | cwd | Workspace directory |
| `LOOM_CACHE_DIR` | `.loom` | Cache directory |
| `LOOM_FOCUS_BUDGET` | `20` | Max focused files |
| `LOOM_LOG_LEVEL` | `info` | Log level |

## Configuration File

Create `loom.config.json` in your project:

```json
{
  "workspace": ".",
  "languages": ["ts", "tsx", "js", "jsx", "py"],
  "exclude": ["node_modules", ".git", "dist"],
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

## Full Setup for macOS/Linux

```bash
# Install
npm install -g @loom-mcp/server

# Start server
loom start

# Configure your client
# (see Option 1-5 above)
```

## Full Setup for Windows

```powershell
# Install
npm install -g @loom-mcp/server

# Or use npx (no install)
npx -y @loom-mcp/server start

# Start server
node_modules\.bin\loom-mcp start
```

## Docker Setup

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
docker run -p 2337:2337 -p 8080:8080 -v $(pwd):/workspace loom-mcp
```

## Verification

```bash
# Test MCP connection
curl localhost:2337/state

# Check dashboard
curl localhost:2337/

# Test badge
curl localhost:2337/badge.svg
```

## Troubleshooting

### Port Already in Use
```bash
LOOM_PORT=8081 loom start  # Use different port
```

### Permission Denied (Linux/macOS)
```bash
sudo chown -R $(whoami) ~/.loom
```

### Connection Refused
```bash
# Make sure server is running
ps aux | grep loom
# Or start fresh
pkill -f loom-mcp && loom start
```

## Next Steps

See README.md for full feature documentation.