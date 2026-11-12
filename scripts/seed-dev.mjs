// Fills a DEVELOPMENT database with believable activity through the real API, so the dashboard has something to show:
//   node scripts/seed-dev.mjs http://localhost:3005
// It pretends to be Cloudflare (location headers), which only works because development has no Cloudflare in front.
import { createHash, randomBytes } from "node:crypto";

const base = (process.argv[2] ?? "http://localhost:3005").replace(/\/$/, "");
if (!/localhost|127\.0\.0\.1/.test(base)) throw new Error("seed only a local server");

const PLACES = [
  ["PK", "Punjab", "Lahore", 31.55, 74.34],
  ["PK", "Sindh", "Karachi", 24.86, 67.0],
  ["US", "California", "San Francisco", 37.77, -122.42],
  ["US", "New York", "New York", 40.71, -74.0],
  ["GB", "England", "London", 51.5, -0.12],
  ["DE", "Berlin", "Berlin", 52.52, 13.4],
  ["IN", "Karnataka", "Bengaluru", 12.97, 77.59],
  ["BR", "São Paulo", "São Paulo", -23.55, -46.63],
  ["JP", "Tokyo", "Tokyo", 35.68, 139.69],
  ["AU", "New South Wales", "Sydney", -33.87, 151.21],
];
const APPS = ["chrome.exe", "Code.exe", "slack.exe", "WINWORD.EXE", "notepad.exe", "Discord.exe", "firefox"];
const ENGINES = ["inferno", "torch", "beacon", "forge", "spark"];
const PAGES = ["/", "/dictation", "/history", "/dictionary", "/speech", "/voices", "/settings"];
const pick = (a) => a[Math.floor(Math.random() * a.length)];

async function post(path, body, headers = {}) {
  const r = await fetch(base + path, { method: "POST", headers: { "content-type": "application/json", ...headers }, body: JSON.stringify(body) });
  if (!r.ok) throw new Error(`${path}: ${r.status} ${await r.text()}`);
  return r.json();
}

for (let n = 0; n < 24; n++) {
  const [cc, region, city, lat, lon] = pick(PLACES);
  const geo = {
    "cf-connecting-ip": `203.0.113.${n + 10}`,
    "cf-ipcountry": cc,
    "cf-region": region,
    "cf-ipcity": encodeURIComponent(city).includes("%") ? unescape(encodeURIComponent(city)) : city,
    "cf-iplatitude": String(lat + (Math.random() - 0.5)),
    "cf-iplongitude": String(lon + (Math.random() - 0.5)),
  };
  const linux = Math.random() < 0.2;
  const { token } = await post(
    "/api/v1/installs",
    {
      deviceId: createHash("sha256").update(randomBytes(16)).digest("hex"),
      appVersion: pick(["0.9.0", "0.9.1", "0.9.1", "0.9.2"]),
      os: linux ? "linux" : "windows",
      osVersion: linux ? "Ubuntu 24.04" : pick(["11 26100", "11 26300", "10 19045"]),
      arch: "x86_64",
      cpu: pick(["AMD Ryzen 7 7800X3D", "Intel Core i7-13700H", "Intel Core i5-12400"]),
      cores: pick([8, 12, 16, 24]),
      ramGb: pick([16, 32, 64]),
      gpu: pick(["NVIDIA GeForce RTX 4070", "NVIDIA GeForce RTX 3060", "AMD Radeon RX 7800 XT", null]),
      locale: "en-US",
      timezone: "UTC",
      screen: pick(["1920x1080", "2560x1440", "3840x2160"]),
      hostname: `DESKTOP-${randomBytes(3).toString("hex").toUpperCase()}`,
    },
    geo,
  );
  const auth = { ...geo, authorization: `Bearer ${token}` };
  const events = [];
  const daysActive = 1 + Math.floor(Math.random() * 6);
  for (let d = 0; d < daysActive; d++) {
    const day = Date.now() - Math.floor(Math.random() * 6.5 * 86_400_000);
    events.push({ name: "app.launch", at: new Date(day).toISOString() });
    for (let k = 0; k < 3 + Math.floor(Math.random() * 10); k++) {
      const at = new Date(day + k * 60_000).toISOString();
      const r = Math.random();
      if (r < 0.45) events.push({ name: "dictation.done", at, props: { words: 5 + Math.floor(Math.random() * 80), app: pick(APPS), language: "en", wake: Math.random() < 0.3, ms: 4000 } });
      else if (r < 0.6) events.push({ name: "tts.generate", at, props: { engine: pick(ENGINES), chars: 40 + Math.floor(Math.random() * 600) } });
      else if (r < 0.85) events.push({ name: "page.view", at, props: { route: pick(PAGES) } });
      else events.push({ name: "app.heartbeat", at, props: { seconds: 300 } });
    }
  }
  await post("/api/v1/events", { events: events.slice(0, 200) }, auth);
  if (Math.random() < 0.25) await post("/api/v1/feedback", { kind: pick(["bug", "idea", "praise"]), message: pick(["Dictation into Slack sometimes drops the first word.", "Could the pill sit at the top of the screen?", "Hey FireVoice works great with my accent now!", "Please add a macOS version."]), rating: 4 }, auth);
  if (Math.random() < 0.15) await post("/api/v1/crashes", { kind: pick(["panic", "backend"]), message: "engine stopped: CUDA out of memory", stack: "at synth (engine.py:212)\nat run (service.py:88)" }, auth);
}
for (const e of ["ada@example.com", "linus@example.com", "grace@example.com"])
  await post("/api/v1/waitlist", { email: e, interest: pick(["mac", "pro", "news"]), source: "landing" }, { "cf-ipcountry": pick(PLACES)[0] });
console.log("seeded 24 installs with events, some feedback, crashes and waitlist entries");
