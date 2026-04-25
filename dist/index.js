"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const stdio_js_1 = require("@modelcontextprotocol/sdk/server/stdio.js");
const tools_js_1 = require("./tools.js");
const server_js_1 = require("./dashboard/server.js");
process.on('SIGINT', () => process.exit(0));
process.on('SIGTERM', () => process.exit(0));
async function main() {
    const port = parseInt(process.env.LOOM_DASHBOARD_PORT || '2337');
    let dashboardActive = false;
    try {
        (0, server_js_1.startDashboard)(port);
        dashboardActive = true;
    }
    catch (e) { /* ignore */ }
    const transport = new stdio_js_1.StdioServerTransport();
    const server = (0, tools_js_1.createServer)();
    server.connect(transport);
    if (!dashboardActive) {
        const idleTimer = setTimeout(() => process.exit(0), 5000);
        process.stdin.on('end', () => { clearTimeout(idleTimer); process.exit(0); });
        process.stdin.on('close', () => { clearTimeout(idleTimer); process.exit(0); });
    }
}
main();
