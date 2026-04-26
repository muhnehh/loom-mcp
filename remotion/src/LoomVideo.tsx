import React from "react";
import {
  AbsoluteFill,
  Audio,
  Img,
  interpolate,
  spring,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";

// ─── Timing (frames @ 30fps) — total 5154 = 2:51.8 matching voiceover ──────
const T = {
  hook:        { in: 0,    out: 360  }, // 0:00–0:12
  problem:     { in: 360,  out: 1140 }, // 0:12–0:38
  existing:    { in: 1140, out: 1740 }, // 0:38–0:58
  intro:       { in: 1740, out: 2340 }, // 0:58–1:18
  howItWorks:  { in: 2340, out: 3360 }, // 1:18–1:52
  dashboard:   { in: 3360, out: 4140 }, // 1:52–2:18
  results:     { in: 4140, out: 4680 }, // 2:18–2:36
  outro:       { in: 4680, out: 5154 }, // 2:36–2:51.8
};

// ─── Design tokens ─────────────────────────────────────────────────────────
const C = {
  bg:      "#0A0A0F",
  purple:  "#7C3AED",
  purpleL: "#A78BFA",
  green:   "#10B981",
  white:   "#F8FAFC",
  gray:    "#94A3B8",
  card:    "#12121E",
  border:  "#1E1E2E",
};

const FONT = "'Inter', 'SF Pro Display', system-ui, sans-serif";
const SERIF = "'Georgia', serif";

// ─── Helpers ───────────────────────────────────────────────────────────────
function useFade(inFrame: number, outFrame: number, dur = 20) {
  const frame = useCurrentFrame();
  const fadeIn  = interpolate(frame, [inFrame, inFrame + dur],  [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const fadeOut = interpolate(frame, [outFrame - dur, outFrame], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  return Math.min(fadeIn, fadeOut);
}

function useSlideUp(startFrame: number, delay = 0) {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const s = spring({ frame: frame - startFrame - delay, fps, config: { damping: 18, stiffness: 120 } });
  return { opacity: s, transform: `translateY(${interpolate(s, [0, 1], [40, 0])}px)` };
}

function CountUp({ from, to, frame, startFrame, dur }: { from: number; to: number; frame: number; startFrame: number; dur: number }) {
  const v = interpolate(frame, [startFrame, startFrame + dur], [from, to], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  return <>{Math.round(v).toLocaleString()}</>;
}

// ─── Noise / grid background ────────────────────────────────────────────────
function NoiseBg({ opacity = 0.03 }: { opacity?: number }) {
  return (
    <AbsoluteFill style={{ opacity }}>
      <svg width="100%" height="100%">
        <defs>
          <pattern id="grid" width="48" height="48" patternUnits="userSpaceOnUse">
            <path d="M 48 0 L 0 0 0 48" fill="none" stroke="#A78BFA" strokeWidth="0.5" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#grid)" />
      </svg>
    </AbsoluteFill>
  );
}

// ─── Purple glow blob ───────────────────────────────────────────────────────
function GlowBlob({ x, y, r, opacity }: { x: string; y: string; r: number; opacity: number }) {
  return (
    <div style={{
      position: "absolute",
      left: x, top: y,
      width: r * 2, height: r * 2,
      borderRadius: "50%",
      background: `radial-gradient(circle, ${C.purple}44 0%, transparent 70%)`,
      transform: "translate(-50%,-50%)",
      opacity,
      pointerEvents: "none",
    }} />
  );
}

// ─── Scene: HOOK ────────────────────────────────────────────────────────────
function SceneHook() {
  const frame = useCurrentFrame();
  const opacity = useFade(T.hook.in, T.hook.out);
  const words = ["Every", "day,", "developers", "hand", "their", "entire", "codebase", "to", "AI."];
  const sub = ["Millions of tokens.", "Thousands of dollars.", "Just to re-read the same files."];

  return (
    <AbsoluteFill style={{ background: C.bg, opacity, display: "flex", alignItems: "center", justifyContent: "center" }}>
      <NoiseBg />
      <GlowBlob x="20%" y="40%" r={500} opacity={0.6} />
      <GlowBlob x="80%" y="60%" r={400} opacity={0.4} />

      {/* Scrolling code lines */}
      {Array.from({ length: 12 }).map((_, i) => (
        <div key={i} style={{
          position: "absolute",
          left: 0,
          top: `${8 + i * 8}%`,
          fontFamily: "'JetBrains Mono', monospace",
          fontSize: 14,
          color: "#ffffff08",
          whiteSpace: "nowrap",
          transform: `translateX(${interpolate(frame, [0, 360], [0, -200 + i * 30])}px)`,
        }}>
          {"import { authenticate } from './auth'; export async function loginUser(email: string, password: string) { const user = await db.users.findUnique({ where: { email } }); if (!user) throw new Error('Not found'); const valid = await bcrypt.compare(password, user.password); if (!valid) throw new Error('Invalid'); return generateToken(user); }".repeat(3)}
        </div>
      ))}

      <div style={{ textAlign: "center", zIndex: 10, maxWidth: 1200, padding: "0 80px" }}>
        <div style={{
          display: "flex",
          flexWrap: "wrap",
          justifyContent: "center",
          gap: 12,
          marginBottom: 48,
        }}>
          {words.map((w, i) => {
            const s = spring({ frame: frame - i * 8, fps: 30, config: { damping: 16 } });
            return (
              <span key={i} style={{
                fontFamily: SERIF,
                fontSize: 72,
                fontWeight: 400,
                color: C.white,
                opacity: s,
                transform: `translateY(${interpolate(s, [0, 1], [30, 0])}px)`,
                display: "inline-block",
                lineHeight: 1.1,
              }}>{w}</span>
            );
          })}
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 16, alignItems: "center" }}>
          {sub.map((line, i) => {
            const delay = words.length * 8 + 20 + i * 25;
            const s = spring({ frame: frame - delay, fps: 30, config: { damping: 20 } });
            const colors = [C.gray, C.gray, C.purpleL];
            return (
              <div key={i} style={{
                fontFamily: FONT,
                fontSize: 32,
                color: colors[i],
                opacity: s,
                transform: `translateY(${interpolate(s, [0, 1], [20, 0])}px)`,
              }}>{line}</div>
            );
          })}
        </div>
      </div>
    </AbsoluteFill>
  );
}

// ─── Scene: PROBLEM ─────────────────────────────────────────────────────────
function SceneProblem() {
  const frame = useCurrentFrame();
  const opacity = useFade(T.problem.in, T.problem.out);
  const localF = frame - T.problem.in;

  const stats = [
    { value: 140000, label: "tokens per session", sub: "just reading code", color: "#EF4444" },
    { value: 97,     label: "percent wasted",     sub: "on irrelevant context", color: "#F97316" },
    { value: 0,      label: "intelligence gained", sub: "from brute force reading", color: C.gray },
  ];

  return (
    <AbsoluteFill style={{ background: C.bg, opacity }}>
      <NoiseBg />
      <GlowBlob x="10%" y="80%" r={600} opacity={0.3} />

      <div style={{ position: "absolute", top: 100, left: 120, right: 120 }}>
        {/* Eyebrow */}
        {[{ text: "THE PROBLEM", color: "#EF4444", size: 14, weight: 700, tracking: "0.2em", delay: 0 },
          { text: "Claude reads everything.", color: C.white, size: 68, weight: 400, tracking: "-1px", delay: 15, serif: true },
          { text: "You pay for all of it.", color: C.purpleL, size: 68, weight: 400, tracking: "-1px", delay: 25, serif: true, italic: true },
        ].map((t, i) => {
          const s = spring({ frame: localF - (t.delay as number), fps: 30, config: { damping: 18 } });
          return (
            <div key={i} style={{
              fontFamily: t.serif ? SERIF : FONT,
              fontSize: t.size,
              fontWeight: t.weight,
              color: t.color,
              letterSpacing: t.tracking,
              fontStyle: t.italic ? "italic" : "normal",
              marginBottom: i === 0 ? 16 : 8,
              opacity: s,
              transform: `translateY(${interpolate(s, [0, 1], [30, 0])}px)`,
            }}>{t.text}</div>
          );
        })}
      </div>

      {/* Stat cards */}
      <div style={{ position: "absolute", bottom: 120, left: 120, right: 120, display: "flex", gap: 32 }}>
        {stats.map((stat, i) => {
          const delay = 60 + i * 20;
          const s = spring({ frame: localF - delay, fps: 30, config: { damping: 20 } });
          return (
            <div key={i} style={{
              flex: 1,
              background: C.card,
              border: `1px solid ${C.border}`,
              borderRadius: 20,
              padding: "40px 40px",
              opacity: s,
              transform: `translateY(${interpolate(s, [0, 1], [50, 0])}px)`,
              borderTop: `3px solid ${stat.color}`,
            }}>
              <div style={{ fontFamily: SERIF, fontSize: 72, color: stat.color, lineHeight: 1, marginBottom: 12 }}>
                {stat.value > 0 ? (
                  <CountUp from={0} to={stat.value} frame={localF} startFrame={delay + 15} dur={60} />
                ) : "0"}
                {stat.label.includes("percent") ? "%" : stat.label.includes("tokens") ? "" : ""}
              </div>
              <div style={{ fontFamily: FONT, fontSize: 18, color: C.white, fontWeight: 600, marginBottom: 6 }}>{stat.label}</div>
              <div style={{ fontFamily: FONT, fontSize: 14, color: C.gray }}>{stat.sub}</div>
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
}

// ─── Scene: EXISTING ────────────────────────────────────────────────────────
function SceneExisting() {
  const frame = useCurrentFrame();
  const opacity = useFade(T.existing.in, T.existing.out);
  const localF = frame - T.existing.in;

  const tools = [
    { name: "GitHub Copilot", issues: ["Editor-locked", "No MCP", "Subscription"] },
    { name: "Cursor",         issues: ["Proprietary", "One editor", "Closed source"] },
    { name: "CodeMunch",      issues: ["Narrow scope", "Limited tools", "No dashboard"] },
  ];

  return (
    <AbsoluteFill style={{ background: C.bg, opacity }}>
      <NoiseBg />

      <div style={{ position: "absolute", top: 100, left: 120 }}>
        {[
          { text: "WHAT ALREADY EXISTS", color: C.gray, size: 14, weight: 700, tracking: "0.2em", delay: 0 },
          { text: "Good tools. Wrong constraints.", color: C.white, size: 64, serif: true, delay: 10 },
        ].map((t, i) => {
          const s = spring({ frame: localF - t.delay, fps: 30, config: { damping: 18 } });
          return (
            <div key={i} style={{
              fontFamily: t.serif ? SERIF : FONT,
              fontSize: t.size,
              fontWeight: t.weight ?? 400,
              color: t.color,
              letterSpacing: t.tracking ?? "normal",
              marginBottom: 12,
              opacity: s,
              transform: `translateY(${interpolate(s, [0, 1], [30, 0])}px)`,
            }}>{t.text}</div>
          );
        })}
      </div>

      <div style={{ position: "absolute", top: 300, left: 120, right: 120, display: "flex", gap: 28 }}>
        {tools.map((tool, i) => {
          const s = spring({ frame: localF - 40 - i * 18, fps: 30, config: { damping: 20 } });
          return (
            <div key={i} style={{
              flex: 1,
              background: C.card,
              border: `1px solid ${C.border}`,
              borderRadius: 20,
              padding: 36,
              opacity: s,
              transform: `translateY(${interpolate(s, [0, 1], [60, 0])}px)`,
            }}>
              <div style={{ fontFamily: FONT, fontSize: 22, fontWeight: 700, color: C.white, marginBottom: 24 }}>{tool.name}</div>
              {tool.issues.map((issue, j) => (
                <div key={j} style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
                  <div style={{ width: 20, height: 20, borderRadius: "50%", background: "#EF444422", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    <div style={{ width: 8, height: 2, background: "#EF4444", borderRadius: 2 }} />
                  </div>
                  <span style={{ fontFamily: FONT, fontSize: 16, color: C.gray }}>{issue}</span>
                </div>
              ))}
            </div>
          );
        })}
      </div>

      {/* "Nothing universal... Until now." */}
      {(() => {
        const s = spring({ frame: localF - 120, fps: 30, config: { damping: 16 } });
        return (
          <div style={{
            position: "absolute",
            bottom: 120,
            left: 120,
            right: 120,
            textAlign: "center",
            opacity: s,
            transform: `translateY(${interpolate(s, [0, 1], [30, 0])}px)`,
          }}>
            <span style={{ fontFamily: SERIF, fontSize: 44, color: C.gray }}>Nothing universal. Nothing model-agnostic. </span>
            <span style={{ fontFamily: SERIF, fontSize: 44, color: C.purpleL, fontStyle: "italic" }}>Until now.</span>
          </div>
        );
      })()}
    </AbsoluteFill>
  );
}

// ─── Scene: INTRO (founder) ──────────────────────────────────────────────────
function SceneIntro() {
  const frame = useCurrentFrame();
  const opacity = useFade(T.intro.in, T.intro.out);
  const localF = frame - T.intro.in;

  const lines = [
    { text: "Hi. I'm", color: C.gray, size: 32, delay: 0 },
    { text: "Muhammed Nehan", color: C.white, size: 80, serif: true, delay: 12 },
    { text: "Sophomore in AI · Ajman University", color: C.purpleL, size: 28, delay: 22 },
    { text: "I built LoomMCP.", color: C.white, size: 56, serif: true, delay: 40 },
  ];

  return (
    <AbsoluteFill style={{ background: C.bg, opacity }}>
      <NoiseBg opacity={0.025} />
      <GlowBlob x="75%" y="50%" r={700} opacity={0.5} />

      {/* Logo */}
      {(() => {
        const s = spring({ frame: localF, fps: 30, config: { damping: 14 } });
        return (
          <div style={{
            position: "absolute",
            right: 160,
            top: "50%",
            transform: `translateY(-50%) scale(${s})`,
            opacity: s,
          }}>
            <Img src={staticFile("logo.png")} style={{ width: 340, height: 340, objectFit: "contain", borderRadius: 40 }} />
          </div>
        );
      })()}

      <div style={{ position: "absolute", left: 120, top: "50%", transform: "translateY(-50%)", maxWidth: 900 }}>
        {lines.map((line, i) => {
          const s = spring({ frame: localF - line.delay, fps: 30, config: { damping: 18 } });
          return (
            <div key={i} style={{
              fontFamily: line.serif ? SERIF : FONT,
              fontSize: line.size,
              color: line.color,
              fontWeight: line.serif ? 400 : 600,
              lineHeight: 1.15,
              marginBottom: i === 1 ? 16 : 12,
              opacity: s,
              transform: `translateX(${interpolate(s, [0, 1], [-40, 0])}px)`,
            }}>{line.text}</div>
          );
        })}

        {/* Tags */}
        {(() => {
          const s = spring({ frame: localF - 70, fps: 30, config: { damping: 20 } });
          const tags = ["Open Source", "MIT License", "Free Forever", "52 MCP Tools"];
          return (
            <div style={{ display: "flex", gap: 12, marginTop: 24, opacity: s, transform: `translateY(${interpolate(s, [0, 1], [20, 0])}px)` }}>
              {tags.map((tag) => (
                <div key={tag} style={{
                  background: `${C.purple}22`,
                  border: `1px solid ${C.purple}55`,
                  borderRadius: 100,
                  padding: "8px 18px",
                  fontFamily: FONT,
                  fontSize: 14,
                  fontWeight: 600,
                  color: C.purpleL,
                }}>{tag}</div>
              ))}
            </div>
          );
        })()}
      </div>
    </AbsoluteFill>
  );
}

// ─── Scene: HOW IT WORKS ─────────────────────────────────────────────────────
function SceneHowItWorks() {
  const frame = useCurrentFrame();
  const opacity = useFade(T.howItWorks.in, T.howItWorks.out);
  const localF = frame - T.howItWorks.in;

  const steps = [
    {
      step: "01",
      title: "loom_get_topology(\"src/\")",
      desc: "Tree-sitter scans your repo. Returns only signatures.",
      result: "54,932 tokens → 1,456 TOON tokens — 97% reduction in 16ms",
      color: C.purple,
      delay: 20,
    },
    {
      step: "02",
      title: "loom_focus(\"auth.ts::loginUser\")",
      desc: "Byte-offset retrieval. Only that function enters context.",
      result: "42 lines paged in · 1,204 tokens · nothing else",
      color: C.green,
      delay: 60,
    },
    {
      step: "03",
      title: "loom_search_refs(\"loginUser\")",
      desc: "AST-aware reference search across workspace.",
      result: "14 call sites found · 8 files · 44ms",
      color: "#3B82F6",
      delay: 100,
    },
  ];

  return (
    <AbsoluteFill style={{ background: C.bg, opacity }}>
      <NoiseBg />
      <GlowBlob x="90%" y="10%" r={500} opacity={0.4} />

      <div style={{ position: "absolute", top: 80, left: 120 }}>
        {(() => {
          const s = spring({ frame: localF, fps: 30, config: { damping: 18 } });
          return (
            <div style={{ opacity: s, transform: `translateY(${interpolate(s, [0, 1], [30, 0])}px)` }}>
              <div style={{ fontFamily: FONT, fontSize: 13, fontWeight: 700, color: C.gray, letterSpacing: "0.2em", marginBottom: 14 }}>HOW IT WORKS</div>
              <div style={{ fontFamily: SERIF, fontSize: 64, color: C.white, lineHeight: 1.1 }}>
                52 tools. One server.<br />
                <span style={{ color: C.purpleL, fontStyle: "italic" }}>Zero configuration.</span>
              </div>
            </div>
          );
        })()}
      </div>

      <div style={{ position: "absolute", top: 320, left: 120, right: 120, display: "flex", flexDirection: "column", gap: 24 }}>
        {steps.map((step) => {
          const s = spring({ frame: localF - step.delay, fps: 30, config: { damping: 18 } });
          return (
            <div key={step.step} style={{
              background: C.card,
              border: `1px solid ${C.border}`,
              borderLeft: `4px solid ${step.color}`,
              borderRadius: 16,
              padding: "24px 32px",
              display: "flex",
              alignItems: "center",
              gap: 32,
              opacity: s,
              transform: `translateX(${interpolate(s, [0, 1], [-60, 0])}px)`,
            }}>
              <div style={{ fontFamily: FONT, fontSize: 13, fontWeight: 800, color: step.color, letterSpacing: "0.15em", minWidth: 32 }}>{step.step}</div>
              <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 18, color: step.color, minWidth: 480 }}>{step.title}</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontFamily: FONT, fontSize: 15, color: C.gray, marginBottom: 6 }}>{step.desc}</div>
                <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 13, color: C.green }}>→ {step.result}</div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Topology screenshot peek */}
      {(() => {
        const s = spring({ frame: localF - 160, fps: 30, config: { damping: 16 } });
        return (
          <div style={{
            position: "absolute",
            bottom: 40,
            right: 120,
            width: 580,
            borderRadius: 16,
            overflow: "hidden",
            border: `1px solid ${C.border}`,
            opacity: s * 0.85,
            transform: `translateY(${interpolate(s, [0, 1], [40, 0])}px)`,
            boxShadow: `0 0 60px ${C.purple}33`,
          }}>
            <Img src={staticFile("ss-topology.jpg")} style={{ width: "100%", display: "block" }} />
          </div>
        );
      })()}
    </AbsoluteFill>
  );
}

// ─── Scene: DASHBOARD DEMO ───────────────────────────────────────────────────
function SceneDashboard() {
  const frame = useCurrentFrame();
  const opacity = useFade(T.dashboard.in, T.dashboard.out);
  const localF = frame - T.dashboard.in;

  const shots = [
    { src: "ss-dashboard.jpg",   delay: 0,   caption: "Real-time token savings — persisted across sessions" },
    { src: "ss-active-lens.jpg", delay: 220, caption: "Active Lens — exactly which files Claude is focused on" },
    { src: "ss-blur.jpg",        delay: 440, caption: "Focus budget — manage context like a resource" },
  ];

  const activeShot = shots.filter((s) => localF >= s.delay).pop() ?? shots[0];

  return (
    <AbsoluteFill style={{ background: C.bg, opacity }}>
      <NoiseBg opacity={0.02} />
      <GlowBlob x="30%" y="50%" r={600} opacity={0.35} />

      {/* Left: text */}
      <div style={{ position: "absolute", left: 100, top: "50%", transform: "translateY(-50%)", width: 500 }}>
        {(() => {
          const s = spring({ frame: localF, fps: 30, config: { damping: 18 } });
          return (
            <div style={{ opacity: s, transform: `translateX(${interpolate(s, [0, 1], [-40, 0])}px)` }}>
              <div style={{ fontFamily: FONT, fontSize: 13, fontWeight: 700, color: C.gray, letterSpacing: "0.2em", marginBottom: 16 }}>LIVE DASHBOARD</div>
              <div style={{ fontFamily: SERIF, fontSize: 56, color: C.white, lineHeight: 1.1, marginBottom: 24 }}>
                See every token<br />
                <span style={{ color: C.green, fontStyle: "italic" }}>saved. Live.</span>
              </div>
            </div>
          );
        })()}

        {/* Big number */}
        {(() => {
          const s = spring({ frame: localF - 30, fps: 30, config: { damping: 16 } });
          return (
            <div style={{ opacity: s, transform: `translateY(${interpolate(s, [0, 1], [30, 0])}px)` }}>
              <div style={{ fontFamily: SERIF, fontSize: 96, color: C.green, lineHeight: 1, marginBottom: 8 }}>
                <CountUp from={0} to={65} frame={localF} startFrame={50} dur={80} />%
              </div>
              <div style={{ fontFamily: FONT, fontSize: 18, color: C.gray }}>token reduction — real session</div>
            </div>
          );
        })()}

        {/* Caption */}
        {(() => {
          const s = spring({ frame: localF - (activeShot.delay + 20), fps: 30, config: { damping: 20 } });
          return (
            <div style={{
              marginTop: 40,
              padding: "16px 20px",
              background: `${C.purple}15`,
              border: `1px solid ${C.purple}33`,
              borderRadius: 12,
              fontFamily: FONT,
              fontSize: 15,
              color: C.purpleL,
              opacity: s,
              transform: `translateY(${interpolate(s, [0, 1], [10, 0])}px)`,
            }}>
              {activeShot.caption}
            </div>
          );
        })()}
      </div>

      {/* Right: screenshot stack */}
      <div style={{ position: "absolute", right: 80, top: "50%", transform: "translateY(-50%)", width: 900 }}>
        {shots.map((shot, i) => {
          const isActive = shot.src === activeShot.src;
          const s = spring({ frame: localF - shot.delay, fps: 30, config: { damping: 16 } });
          return (
            <div key={shot.src} style={{
              position: i === 0 ? "relative" : "absolute",
              top: i > 0 ? 0 : undefined,
              left: i > 0 ? 0 : undefined,
              width: "100%",
              borderRadius: 20,
              overflow: "hidden",
              border: `2px solid ${isActive ? C.purple : C.border}`,
              opacity: isActive ? s : s * 0.3,
              transform: `scale(${isActive ? 1 : 0.95}) translateY(${interpolate(s, [0, 1], [60, 0])}px)`,
              transition: "all 0.3s",
              boxShadow: isActive ? `0 0 80px ${C.purple}44` : "none",
              zIndex: isActive ? 2 : 1,
            }}>
              <Img src={staticFile(shot.src)} style={{ width: "100%", display: "block" }} />
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
}

// ─── Scene: RESULTS ──────────────────────────────────────────────────────────
function SceneResults() {
  const frame = useCurrentFrame();
  const opacity = useFade(T.results.in, T.results.out);
  const localF = frame - T.results.in;

  const points = [
    { label: "97.75% token reduction",     sub: "Verified with tiktoken cl100k_base", color: C.green },
    { label: "Fully open source",          sub: "MIT License · Published on npm",     color: C.purpleL },
    { label: "No enterprise plan",         sub: "No credit card. No catch. Forever.", color: C.white },
    { label: "Works with any MCP client",  sub: "Claude Code · Cursor · Windsurf",    color: "#3B82F6" },
  ];

  return (
    <AbsoluteFill style={{ background: C.bg, opacity }}>
      <NoiseBg />
      <GlowBlob x="50%" y="50%" r={800} opacity={0.3} />

      <div style={{ position: "absolute", top: 100, left: 120 }}>
        {(() => {
          const s = spring({ frame: localF, fps: 30, config: { damping: 18 } });
          return (
            <div style={{ opacity: s, transform: `translateY(${interpolate(s, [0, 1], [30, 0])}px)` }}>
              <div style={{ fontFamily: FONT, fontSize: 13, fontWeight: 700, color: C.gray, letterSpacing: "0.2em", marginBottom: 14 }}>THE NUMBERS</div>
              <div style={{ fontFamily: SERIF, fontSize: 64, color: C.white, lineHeight: 1.1 }}>
                Measured. Not estimated.<br />
                <span style={{ color: C.green, fontStyle: "italic" }}>Open for anyone to verify.</span>
              </div>
            </div>
          );
        })()}
      </div>

      <div style={{ position: "absolute", bottom: 120, left: 120, right: 120, display: "flex", gap: 24 }}>
        {points.map((p, i) => {
          const s = spring({ frame: localF - 60 - i * 15, fps: 30, config: { damping: 18 } });
          return (
            <div key={i} style={{
              flex: 1,
              background: C.card,
              border: `1px solid ${C.border}`,
              borderRadius: 20,
              padding: "32px 28px",
              opacity: s,
              transform: `translateY(${interpolate(s, [0, 1], [50, 0])}px)`,
            }}>
              <div style={{ fontFamily: FONT, fontSize: 20, fontWeight: 700, color: p.color, marginBottom: 10, lineHeight: 1.3 }}>{p.label}</div>
              <div style={{ fontFamily: FONT, fontSize: 14, color: C.gray }}>{p.sub}</div>
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
}

// ─── Scene: OUTRO ────────────────────────────────────────────────────────────
function SceneOutro() {
  const frame = useCurrentFrame();
  const opacity = useFade(T.outro.in, T.outro.out, 30);
  const localF = frame - T.outro.in;

  return (
    <AbsoluteFill style={{ background: C.bg, opacity }}>
      <NoiseBg opacity={0.02} />
      <GlowBlob x="50%" y="50%" r={900} opacity={0.5} />

      {/* Logo */}
      {(() => {
        const s = spring({ frame: localF, fps: 30, config: { damping: 14, stiffness: 80 } });
        return (
          <div style={{
            position: "absolute",
            top: 180,
            left: "50%",
            transform: `translateX(-50%) scale(${s})`,
            opacity: s,
          }}>
            <Img src={staticFile("logo.png")} style={{ width: 200, height: 200, objectFit: "contain", borderRadius: 32 }} />
          </div>
        );
      })()}

      {/* Tagline */}
      <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%)", textAlign: "center", width: 1200 }}>
        {[
          { text: "Index once.", delay: 20, size: 80, color: C.white },
          { text: "Query cheaply.", delay: 35, size: 80, color: C.purpleL, italic: true },
          { text: "Keep moving.", delay: 50, size: 80, color: C.green },
        ].map((line, i) => {
          const s = spring({ frame: localF - line.delay, fps: 30, config: { damping: 16 } });
          return (
            <div key={i} style={{
              fontFamily: SERIF,
              fontSize: line.size,
              color: line.color,
              fontStyle: line.italic ? "italic" : "normal",
              lineHeight: 1.2,
              opacity: s,
              transform: `translateY(${interpolate(s, [0, 1], [30, 0])}px)`,
            }}>{line.text}</div>
          );
        })}
      </div>

      {/* Footer */}
      {(() => {
        const s = spring({ frame: localF - 90, fps: 30, config: { damping: 20 } });
        return (
          <div style={{
            position: "absolute",
            bottom: 100,
            left: "50%",
            transform: `translateX(-50%)`,
            opacity: s,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 16,
          }}>
            <div style={{
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: 22,
              color: C.purpleL,
              background: `${C.purple}22`,
              border: `1px solid ${C.purple}44`,
              borderRadius: 100,
              padding: "12px 32px",
            }}>
              npx @loom-mcp/server start
            </div>
            <div style={{ fontFamily: FONT, fontSize: 16, color: C.gray }}>
              github.com/muhnehh/loom-mcp · Free forever · MIT License
            </div>
            <div style={{ fontFamily: FONT, fontSize: 14, color: "#4B5563" }}>
              Built by Muhammed Nehan · Sophomore in AI · Ajman University
            </div>
          </div>
        );
      })()}
    </AbsoluteFill>
  );
}

// ─── Main composition ─────────────────────────────────────────────────────────
export const LoomVideo = () => {
  const frame = useCurrentFrame();
  const isIn = (scene: { in: number; out: number }) => frame >= scene.in && frame < scene.out;

  return (
    <AbsoluteFill style={{ background: "#0A0A0F", fontFamily: FONT }}>
      {/* Voiceover audio track */}
      <Audio src={staticFile("voiceover.mp3")} volume={1} />

      {isIn(T.hook)       && <SceneHook />}
      {isIn(T.problem)    && <SceneProblem />}
      {isIn(T.existing)   && <SceneExisting />}
      {isIn(T.intro)      && <SceneIntro />}
      {isIn(T.howItWorks) && <SceneHowItWorks />}
      {isIn(T.dashboard)  && <SceneDashboard />}
      {isIn(T.results)    && <SceneResults />}
      {isIn(T.outro)      && <SceneOutro />}
    </AbsoluteFill>
  );
};
