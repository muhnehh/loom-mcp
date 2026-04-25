import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { createServer } from './tools.js';

process.on('SIGINT', () => process.exit(0));
process.on('SIGTERM', () => process.exit(0));

async function main() {
  const transport = new StdioServerTransport();
  const server = createServer();
  server.connect(transport);
  console.error('LoomMCP server running on stdio');
}

main();