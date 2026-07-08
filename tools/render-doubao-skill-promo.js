const fs = require("fs");
const path = require("path");
const { spawnSync } = require("child_process");
const sharp = require("sharp");
const ffmpeg = require("@ffmpeg-installer/ffmpeg");

const WIDTH = 1280;
const HEIGHT = 720;
const FPS = 24;
const DURATION = 45;
const TOTAL_FRAMES = FPS * DURATION;

const ROOT = path.resolve(__dirname, "..");
const OUT_DIR = path.join(ROOT, "renders", "doubao-skill-promo");
const FRAME_DIR = path.join(OUT_DIR, "frames");
const OUTPUT = path.join(OUT_DIR, "doubao-skill-promo.mp4");

const skills = [
  "doubao-app-builder",
  "doubao-creative-design",
  "doubao-creative-video",
  "doubao-daily-stock",
  "doubao-finance-sector",
  "lark-doc",
  "lark-sheets",
  "lark-base",
  "lark-drive",
  "lark-im",
  "lark-mail",
  "browser-task"
];

const particles = Array.from({ length: 90 }, (_, i) => ({
  x: (i * 137) % WIDTH,
  y: (i * 71) % HEIGHT,
  r: 1 + (i % 4) * 0.45,
  speed: 12 + (i % 9) * 5,
  hue: i % 3
}));

function clamp(v, a = 0, b = 1) {
  return Math.max(a, Math.min(b, v));
}

function smoothstep(edge0, edge1, x) {
  const t = clamp((x - edge0) / (edge1 - edge0));
  return t * t * (3 - 2 * t);
}

function esc(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function line(x1, y1, x2, y2, opacity = 0.25, color = "#ffffff", width = 1) {
  return `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${color}" stroke-width="${width}" opacity="${opacity}"/>`;
}

function text(content, x, y, size, weight = 700, fill = "#ffffff", attrs = "") {
  return `<text x="${x}" y="${y}" font-family="Microsoft YaHei, SimHei, Arial, sans-serif" font-size="${size}" font-weight="${weight}" fill="${fill}" ${attrs}>${esc(content)}</text>`;
}

function typeText(content, t, start, end) {
  const n = Math.floor(content.length * smoothstep(start, end, t));
  return content.slice(0, n);
}

function bg(t) {
  const drift = Math.sin(t * 0.25) * 80;
  return `
    <rect width="${WIDTH}" height="${HEIGHT}" fill="#0b0d12"/>
    <rect width="${WIDTH}" height="${HEIGHT}" fill="url(#grid)" opacity="0.18"/>
    <circle cx="${1020 + drift}" cy="110" r="330" fill="url(#glowRed)" opacity="0.48"/>
    <circle cx="${140 + drift * 0.35}" cy="620" r="270" fill="url(#glowGreen)" opacity="0.35"/>
    <circle cx="${640 - drift * 0.2}" cy="360" r="420" fill="url(#glowBlue)" opacity="0.28"/>
  `;
}

function movingParticles(t) {
  return particles
    .map((p, i) => {
      const x = (p.x + t * p.speed) % WIDTH;
      const y = (p.y + Math.sin(t * 0.7 + i) * 18 + HEIGHT) % HEIGHT;
      const colors = ["#ff4d5f", "#38f8c7", "#fbbf24"];
      return `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="${p.r}" fill="${colors[p.hue]}" opacity="${0.22 + (i % 5) * 0.06}"/>`;
    })
    .join("");
}

function skillChips(t, revealStart, revealEnd) {
  return skills
    .map((name, i) => {
      const row = Math.floor(i / 4);
      const col = i % 4;
      const x = 86 + col * 278;
      const y = 420 + row * 58;
      const p = smoothstep(revealStart + i * 0.04, revealEnd + i * 0.04, t);
      const dy = (1 - p) * 20;
      const opacity = p.toFixed(3);
      return `
        <g opacity="${opacity}" transform="translate(0 ${dy.toFixed(1)})">
          <rect x="${x}" y="${y}" width="232" height="38" rx="4" fill="rgba(255,255,255,0.07)" stroke="rgba(255,255,255,0.28)"/>
          ${text(name, x + 14, y + 25, 15, 700, "#f8fafc")}
        </g>`;
    })
    .join("");
}

function sceneOpening(t) {
  const title = typeText("Doubao Skill", t, 0.4, 1.8);
  const subtitle = typeText("把经验开放成能力", t, 1.8, 3.0);
  const pulse = 1 + Math.sin(t * 7) * 0.025;
  return `
    <g transform="translate(0 0)">
      ${text(".skills / SKILL.md / references / scripts", 80, 92, 18, 700, "#38f8c7", `opacity="${smoothstep(0.2, 1.0, t)}" letter-spacing="2"`)}
      <g transform="translate(80 210) scale(${pulse})">
        ${text(title, 0, 0, 86, 900, "#ffffff", `letter-spacing="1"`)}
        <rect x="0" y="24" width="${Math.max(20, title.length * 46)}" height="6" fill="#ff334e" opacity="${smoothstep(1.2, 2.0, t)}"/>
      </g>
      ${text(subtitle, 86, 315, 42, 800, "#fbbf24", `opacity="${smoothstep(1.8, 3.1, t)}"`)}
      ${text("37 Skills", 88, 392, 30, 800, "#38f8c7", `opacity="${smoothstep(2.7, 3.5, t)}"`)}
      ${text("One Open Workflow", 258, 392, 30, 800, "#ffffff", `opacity="${smoothstep(3.0, 3.8, t)}"`)}
      ${skillChips(t, 3.2, 4.4)}
    </g>
  `;
}

function sceneManifesto(t) {
  const local = t - 6;
  const p = smoothstep(0, 1.2, local);
  return `
    <g opacity="${p}">
      ${text("不是孤立的提示词", 86, 180, 48, 900, "#ffffff")}
      ${text("而是一套可复用、可协作、可验证的能力网络", 86, 250, 36, 800, "#fbbf24")}
      <g transform="translate(96 330)">
        <rect width="320" height="62" rx="5" fill="rgba(255,255,255,0.08)" stroke="#ff4d5f"/>
        ${text("OPEN", 28, 42, 32, 900, "#ff4d5f")}
        <rect x="360" width="320" height="62" rx="5" fill="rgba(255,255,255,0.08)" stroke="#38f8c7"/>
        ${text("SHARE", 388, 42, 32, 900, "#38f8c7")}
        <rect x="720" width="320" height="62" rx="5" fill="rgba(255,255,255,0.08)" stroke="#fbbf24"/>
        ${text("BUILD", 748, 42, 32, 900, "#fbbf24")}
      </g>
      ${line(256, 392, 456, 392, 0.55, "#ffffff", 2)}
      ${line(616, 392, 816, 392, 0.55, "#ffffff", 2)}
      ${text("把个人经验，沉淀为社区可以继续生长的工作流。", 90, 505, 28, 700, "#d1d5db")}
    </g>
  `;
}

function sceneProfessional(t) {
  const local = t - 15;
  const cards = [
    ["豆包能力", "网页应用 / 创意设计 / 视频生成 / 产品问答", "#ff4d5f"],
    ["飞书 Lark", "文档 / 表格 / 云空间 / IM / 日历 / 任务", "#38f8c7"],
    ["金融分析", "事实契约 / 行情取数 / 质量校验 / 报告渲染", "#fbbf24"],
    ["通用任务", "浏览器任务 / 技能创建 / 自动化流程", "#8b5cf6"]
  ];
  const cardSvg = cards
    .map(([head, body, color], i) => {
      const x = 88 + (i % 2) * 552;
      const y = 170 + Math.floor(i / 2) * 170;
      const p = smoothstep(i * 0.35, i * 0.35 + 0.75, local);
      return `
        <g opacity="${p}" transform="translate(${(1 - p) * 28} 0)">
          <rect x="${x}" y="${y}" width="488" height="124" rx="5" fill="rgba(255,255,255,0.075)" stroke="${color}" stroke-width="2"/>
          <rect x="${x}" y="${y}" width="8" height="124" fill="${color}"/>
          ${text(head, x + 28, y + 46, 30, 900, "#ffffff")}
          ${text(body, x + 28, y + 84, 19, 700, "#d1d5db")}
        </g>`;
    })
    .join("");
  return `
    <g>
      ${text("专业，不止是提示词。", 88, 104, 48, 900, "#ffffff", `opacity="${smoothstep(0, 0.8, local)}"`)}
      ${cardSvg}
      <g opacity="${smoothstep(3.0, 4.2, local)}">
        ${text("references", 96, 610, 24, 900, "#ff4d5f")}
        ${text("scripts", 296, 610, 24, 900, "#38f8c7")}
        ${text("assets", 446, 610, 24, 900, "#fbbf24")}
        ${text("data contract", 596, 610, 24, 900, "#8b5cf6")}
        ${text("quality gate", 846, 610, 24, 900, "#ffffff")}
      </g>
    </g>
  `;
}

function sceneNetwork(t) {
  const local = t - 30;
  const nodes = [
    [640, 210, "SKILL.md", "#ffffff"],
    [410, 340, "references", "#ff4d5f"],
    [640, 390, "scripts", "#38f8c7"],
    [870, 340, "assets", "#fbbf24"],
    [315, 505, "Doubao", "#ff4d5f"],
    [555, 545, "Finance", "#fbbf24"],
    [775, 545, "Lark", "#38f8c7"],
    [995, 505, "Creative", "#8b5cf6"]
  ];
  const p = smoothstep(0, 1.0, local);
  const edges = [
    [0, 1], [0, 2], [0, 3], [1, 4], [2, 5], [2, 6], [3, 7], [4, 5], [5, 6], [6, 7]
  ];
  return `
    <g opacity="${p}">
      ${text("开放，是让能力被看见、被复用、被继续改进。", 86, 112, 38, 900, "#ffffff")}
      ${edges.map(([a, b], i) => line(nodes[a][0], nodes[a][1], nodes[b][0], nodes[b][1], smoothstep(i * 0.08, i * 0.08 + 0.5, local) * 0.65, "#d1d5db", 2)).join("")}
      ${nodes.map(([x, y, label, color], i) => {
        const q = smoothstep(i * 0.08, i * 0.08 + 0.55, local);
        return `
          <g opacity="${q}" transform="translate(${x} ${y})">
            <circle r="42" fill="rgba(255,255,255,0.08)" stroke="${color}" stroke-width="2"/>
            ${text(label, -Math.min(label.length * 5.5, 42), 7, 17, 800, color)}
          </g>`;
      }).join("")}
    </g>
  `;
}

function sceneClosing(t) {
  const local = t - 39;
  const p = smoothstep(0, 0.8, local);
  return `
    <g opacity="${p}">
      <rect x="0" y="0" width="${WIDTH}" height="${HEIGHT}" fill="rgba(0,0,0,${0.15 + p * 0.35})"/>
      ${text("Doubao Skill", 86, 278, 86, 900, "#ffffff")}
      ${text("把经验开放成能力", 92, 348, 40, 900, "#fbbf24")}
      ${text("Open workflows. Professional skills.", 94, 420, 30, 800, "#38f8c7")}
      ${text("仅限个人学习、研究与交流使用", 94, 650, 18, 600, "#9ca3af")}
      <rect x="88" y="460" width="${smoothstep(1.2, 3.2, local) * 660}" height="5" fill="#ff4d5f"/>
    </g>
  `;
}

function sceneSvg(frame) {
  const t = frame / FPS;
  const transition = Math.sin(t * Math.PI * 2) * 0.5 + 0.5;
  let scene = "";
  if (t < 6) scene = sceneOpening(t);
  else if (t < 15) scene = sceneManifesto(t);
  else if (t < 30) scene = sceneProfessional(t);
  else if (t < 39) scene = sceneNetwork(t);
  else scene = sceneClosing(t);

  return `<?xml version="1.0" encoding="UTF-8"?>
  <svg width="${WIDTH}" height="${HEIGHT}" viewBox="0 0 ${WIDTH} ${HEIGHT}" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <pattern id="grid" width="42" height="42" patternUnits="userSpaceOnUse">
        <path d="M 42 0 L 0 0 0 42" fill="none" stroke="#ffffff" stroke-width="1" opacity="0.28"/>
      </pattern>
      <radialGradient id="glowRed"><stop offset="0%" stop-color="#ff334e"/><stop offset="100%" stop-color="#ff334e" stop-opacity="0"/></radialGradient>
      <radialGradient id="glowGreen"><stop offset="0%" stop-color="#38f8c7"/><stop offset="100%" stop-color="#38f8c7" stop-opacity="0"/></radialGradient>
      <radialGradient id="glowBlue"><stop offset="0%" stop-color="#2563eb"/><stop offset="100%" stop-color="#2563eb" stop-opacity="0"/></radialGradient>
    </defs>
    ${bg(t)}
    ${movingParticles(t)}
    ${line(70, 132 + transition * 8, 1210, 132 + transition * 8, 0.18, "#ffffff")}
    ${scene}
  </svg>`;
}

async function renderFrames() {
  fs.rmSync(FRAME_DIR, { recursive: true, force: true });
  fs.mkdirSync(FRAME_DIR, { recursive: true });
  for (let frame = 0; frame < TOTAL_FRAMES; frame += 1) {
    const svg = sceneSvg(frame);
    const filename = path.join(FRAME_DIR, `frame-${String(frame).padStart(5, "0")}.png`);
    await sharp(Buffer.from(svg)).png().toFile(filename);
    if (frame % 120 === 0) {
      process.stdout.write(`rendered ${frame}/${TOTAL_FRAMES}\n`);
    }
  }
}

function encodeVideo() {
  fs.rmSync(OUTPUT, { force: true });
  const input = path.join(FRAME_DIR, "frame-%05d.png");
  const args = [
    "-y",
    "-framerate", String(FPS),
    "-i", input,
    "-f", "lavfi",
    "-i", "sine=frequency=62:duration=45",
    "-f", "lavfi",
    "-i", "sine=frequency=124:duration=45",
    "-filter_complex", "[1:a]volume=0.10[a1];[2:a]volume=0.035[a2];[a1][a2]amix=inputs=2:duration=first[a]",
    "-map", "0:v",
    "-map", "[a]",
    "-c:v", "libx264",
    "-pix_fmt", "yuv420p",
    "-profile:v", "high",
    "-level", "4.0",
    "-r", String(FPS),
    "-c:a", "aac",
    "-b:a", "128k",
    "-shortest",
    OUTPUT
  ];
  const result = spawnSync(ffmpeg.path, args, { stdio: "inherit" });
  if (result.status !== 0) {
    throw new Error(`ffmpeg failed with status ${result.status}`);
  }
}

async function main() {
  fs.mkdirSync(OUT_DIR, { recursive: true });
  await renderFrames();
  encodeVideo();
  console.log(`Wrote ${OUTPUT}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
