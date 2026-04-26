import { MsEdgeTTS, OUTPUT_FORMAT } from "msedge-tts";
import { writeFileSync, mkdirSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));

const SCRIPT = `
Every day, developers hand their entire codebase to AI.
Millions of tokens. Thousands of dollars.
Just to re-read the same files. Over. And over. And over.

When Claude fixes a bug, it reads your entire auth file. Your middleware. Your types. Everything.
It doesn't know what matters. So it reads everything.
A typical session on a mid-sized TypeScript repo burns over 140,000 tokens — just on code reading.
That's not intelligence. That's a token incinerator.

Cursor helps. Copilot helps. CodeMunch exists.
But they're locked to one editor, or one model, or hidden behind an enterprise paywall.
Nothing gives you model-agnostic, editor-agnostic, precision context retrieval.
Until now.

I'm Muhammed Nehan — sophomore in AI at Ajman University.
I built LoomMCP.
An open-source context compiler for AI coding agents.
Works with Claude Code, Cursor, Windsurf, any MCP client.
Free forever. And it cuts code-reading token usage by 97 point 75 percent.

LoomMCP plugs in as a single MCP server.
When Claude needs your codebase, instead of reading thousands of lines — it calls loom underscore get topology.
LoomMCP scans your repo using tree-sitter, extracts only function signatures, types and relationships,
and returns them as TOON — our compact wire format.
54,000 tokens compressed to 1,456. In 16 milliseconds.

When Claude needs a specific function, it calls loom focus.
Only that function enters context. Nothing else.
52 tools total. Topology. Symbol search. Blast radius. Semantic search. Cross-session memory. All of it.

Every session is tracked on a live dashboard at localhost 2337.
124,000 raw tokens. 81,000 saved. 65 percent reduction.
Real time. Every tool call visible. Every file tracked.
Savings persist across sessions — your all-time numbers accumulate in a local file. Yours. Private. Forever.

97 point 75 percent token reduction. Verified with tiktoken.
Not estimated. Measured.
Fully open source. MIT licensed. On npm today.
No enterprise plan. No credit card. No catch.

Index once. Query cheaply. Keep moving.
I'm Muhammed Nehan — and this is LoomMCP.
The link is below. Star it. Use it. Build with it.
`;

async function generate() {
  console.log("Connecting to Microsoft Edge TTS...");
  const tts = new MsEdgeTTS();

  // en-US-GuyNeural — confident, clear male voice
  await tts.setMetadata(
    "en-US-GuyNeural",
    OUTPUT_FORMAT.AUDIO_24KHZ_48KBITRATE_MONO_MP3
  );

  const outPath = join(__dirname, "public", "voiceover.mp3");
  mkdirSync(join(__dirname, "public"), { recursive: true });

  console.log("Generating voiceover...");
  const { audioStream } = await tts.toStream(SCRIPT, {
    rate: "+5%",     // slight speed up — confident delivery
    volume: "+0%",
    pitch: "-2Hz",   // slightly deeper, more authoritative
  });

  const chunks = [];
  audioStream.on("data", (chunk) => chunks.push(chunk));
  audioStream.on("end", () => {
    const buffer = Buffer.concat(chunks);
    writeFileSync(outPath, buffer);
    const kb = Math.round(buffer.length / 1024);
    console.log(`Voiceover saved: public/voiceover.mp3 (${kb}KB)`);
  });
  audioStream.on("error", (e) => console.error("Error:", e));
}

generate().catch(console.error);
