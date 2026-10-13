// Starts `next dev` on a free port, loads `/`, fetches the client chunk that
// holds app/counter.tsx, and prints how the compiled Counter names its
// memoized anonymous functions. Run twice: plain, and with RUST_COMPILER=1.
import { spawn } from "node:child_process";
import { setTimeout as sleep } from "node:timers/promises";

const port = 3000 + Math.floor(Math.random() * 1000);
const dev = spawn("node", ["node_modules/next/dist/bin/next", "dev", "--port", String(port)], {
  stdio: ["ignore", "pipe", "pipe"],
  env: { ...process.env, NEXT_TELEMETRY_DISABLED: "1", CI: "1" },
});
let log = "";
dev.stdout.on("data", (d) => (log += d));
dev.stderr.on("data", (d) => (log += d));
const deadline = Date.now() + 180_000;
async function get(path) {
  while (Date.now() < deadline) {
    try {
      const res = await fetch(`http://localhost:${port}${path}`);
      if (res.ok) return await res.text();
    } catch {}
    await sleep(500);
  }
  throw new Error(`timeout fetching ${path}\n${log}`);
}
try {
  const html = await get("/");
  const scripts = [...html.matchAll(/src="([^"]+\.js[^"]*)"/g)].map((m) => m[1].replace(/&amp;/g, "&"));
  let found = null;
  for (const src of scripts) {
    const js = await get(src.startsWith("http") ? new URL(src).pathname + new URL(src).search : src);
    if (js.includes("app/counter.tsx") && js.includes("function Counter")) { found = { src, js }; break; }
  }
  if (!found) throw new Error(`counter.tsx chunk not found in ${scripts.length} scripts\n${log}`);
  const start = found.js.indexOf("function Counter");
  const body = found.js.slice(start, start + 1400);
  console.log(`RUST_COMPILER=${process.env.RUST_COMPILER ?? ""} next ${JSON.parse(await import("node:fs").then((f) => f.promises.readFile("node_modules/next/package.json", "utf8"))).version}`);
  console.log(`chunk: ${found.src}`);
  console.log(`memoized (react/compiler-runtime): ${/compiler-runtime/.test(found.js)}`);
  const names = [...body.matchAll(/"Counter\[[^"]*\]"/g)].map((m) => m[0]);
  console.log(`named anonymous functions: ${names.length ? [...new Set(names)].join(", ") : "none"}`);
  console.log("---- compiled Counter (excerpt) ----");
  console.log(body.split("\n").slice(0, 40).join("\n"));
} finally {
  dev.kill("SIGTERM");
  await sleep(500);
  dev.kill("SIGKILL");
}
