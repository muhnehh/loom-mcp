import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { createServer } from './tools.js';
import { startDashboard } from './dashboard/server.js';

process.on('SIGINT', () => process.exit(0));
process.on('SIGTERM', () => process.exit(0));

async function main() {
  const port = parseInt(process.env.LOOM_DASHBOARD_PORT || '2337');
  let dashboardActive = false;
  try { startDashboard(port); dashboardActive = true; } catch (e) { /* ignore */ }

  const transport = new StdioServerTransport();
  const server = createServer();
  server.connect(transport);

  if (!dashboardActive) {
    const idleTimer = setTimeout(() => process.exit(0), 5000);
    process.stdin.on('end', () => { clearTimeout(idleTimer); process.exit(0); });
    process.stdin.on('close', () => { clearTimeout(idleTimer); process.exit(0); });
  }
}

main();