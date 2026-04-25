"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const stdio_js_1 = require("@modelcontextprotocol/sdk/server/stdio.js");
const tools_js_1 = require("./tools.js");
const server_js_1 = require("./dashboard/server.js");
const LOG_LEVEL = process.env.LOOM_LOG_LEVEL || 'info';
const LOG_FILE = process.env.LOOM_LOG_FILE || '';
function log(level, msg, data) {
    if (LOG_LEVEL === 'silent')
        return;
    const levels = ['debug', 'info', 'warn', 'error'];
    if (!levels.includes(level))
        level = 'info';
    if (levels.indexOf(level) < levels.indexOf(LOG_LEVEL))
        return;
    const time = new Date().toISOString();
    const entry = `${time} [${level.toUpperCase()}] ${msg}${data ? ' ' + JSON.stringify(data) : ''}`;
    if (LOG_FILE) {
        try {
            const { appendFileSync } = require('fs');
            appendFileSync(LOG_FILE, entry + '\n');
        }
        catch { }
    }
    console.error(entry);
}
process.on('uncaughtException', (err) => {
    log('error', 'Uncaught exception', { message: err.message, stack: err.stack });
    process.exit(1);
});
process.on('unhandledRejection', (err) => {
    log('error', 'Unhandled rejection', { message: String(err) });
});
process.on('SIGINT', () => { log('info', 'Shutting down'); process.exit(0); });
process.on('SIGTERM', () => { log('info', 'Shutting down'); process.exit(0); });
async function main() {
    log('info', 'LoomMCP starting', { version: '2.0.0', logLevel: LOG_LEVEL });
    const port = parseInt(process.env.LOOM_DASHBOARD_PORT || '2337');
    let dashboardActive = false;
    try {
        (0, server_js_1.startDashboard)(port);
        dashboardActive = true;
        log('info', 'Dashboard started', { port });
    }
    catch (e) {
        log('warn', 'Dashboard failed to start', { error: e.message });
    }
    const transport = new stdio_js_1.StdioServerTransport();
    const server = (0, tools_js_1.createServer)();
    log('info', 'MCP server ready', { transport: 'stdio' });
    server.connect(transport).catch((e) => {
        log('error', 'Connection error', { message: e.message });
    });
    if (!dashboardActive) {
        const idleTimer = setTimeout(() => {
            log('warn', 'No dashboard, closing after 5s idle');
            process.exit(0);
        }, 5000);
        process.stdin.on('end', () => { clearTimeout(idleTimer); process.exit(0); });
        process.stdin.on('close', () => { clearTimeout(idleTimer); process.exit(0); });
    }
}
main();
