import { createServer } from './tools.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { parseArgs } from 'util';

const args = process.argv.slice(2);

interface CliOptions {
  dir?: string;
  port?: number;
  cacheDir?: string;
  focusBudget?: number;
  help?: boolean;
  version?: boolean;
}

function parseCliArgs(args: string[]): CliOptions {
  const options: CliOptions = {};
  
  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    const next = args[i + 1];
    
    if (arg === '--dir' && next && !next.startsWith('-')) {
      options.dir = next;
      i++;
    } else if (arg === '--port' && next && !next.startsWith('-')) {
      options.port = parseInt(next, 10);
      i++;
    } else if (arg === '--cache-dir' && next && !next.startsWith('-')) {
      options.cacheDir = next;
      i++;
    } else if (arg === '--focus-budget' && next && !next.startsWith('-')) {
      options.focusBudget = parseInt(next, 10);
      i++;
    } else if (arg === '--help' || arg === '-h') {
      options.help = true;
    } else if (arg === '--version' || arg === '-v') {
      options.version = true;
    }
  }
  
  return options;
}

function printHelp() {
  console.log(`
LoomMCP - Local Object-Oriented Memory for MCP

USAGE:
  loom-mcp [OPTIONS]
  node dist/index.js [OPTIONS]

OPTIONS:
  --dir PATH           Working directory (default: current directory)
  --port PORT         Port for SSE transport (default: stdio only)
  --cache-dir DIR    Cache directory (default: .loom/)
  --focus-budget N    Max files to focus (default: 20)
  --help, -h         Show this help
  --version, -v       Show version

EXAMPLES:
  # Run with default settings
  loom-mcp

  # Use specific directory
  loom-mcp --dir ./my-project

  # Limit focus budget
  loom-mcp --dir ./project --focus-budget 10

# MCP Integration:
  # Add to Claude Code:
  /mcp add loom localhost:8080
`);
}

function printVersion() {
  console.log('LoomMCP v0.1.0');
}

async function main() {
  const options = parseCliArgs(args);
  
  if (options.help) {
    printHelp();
    process.exit(0);
  }
  
  if (options.version) {
    printVersion();
    process.exit(0);
  }
  
  console.error('LoomMCP server running on stdio');
  
  const transport = new StdioServerTransport();
  const server = createServer();
  server.connect(transport);
}

main().catch(err => {
  console.error('Fatal error:', err.message);
  process.exit(1);
});