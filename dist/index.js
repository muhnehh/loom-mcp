"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const stdio_js_1 = require("@modelcontextprotocol/sdk/server/stdio.js");
const tools_js_1 = require("./tools.js");
process.on('SIGINT', () => process.exit(0));
process.on('SIGTERM', () => process.exit(0));
async function main() {
    const transport = new stdio_js_1.StdioServerTransport();
    const server = (0, tools_js_1.createServer)();
    server.connect(transport);
    console.error('LoomMCP server running on stdio');
}
main();
