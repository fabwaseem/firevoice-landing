// Walks through the whole API against a running server and fails on the first surprise:
//   node scripts/api-check.mjs http://localhost:3000 <admin password>
// It creates a test install, account, events, feedback and waitlist entry (all marked "api-check"), checks the
// refusals (bad tokens, bad input, too large, cross-site, wrong passwords), then deletes the account and install.
import { createHash, randomBytes } from "node:crypto";

const base = (process.argv[2] ?? "http://localhost:3000").replace(/\/$/, "");
const adminPassword = process.argv[3];
let failures = 0;
const ok = (cond, what) => {
  console.log(`${cond ? "  ok " : "FAIL "} ${what}`);
  if (!cond) failures++;
};

async function call(method, path, { body, token, session, headers = {}, raw } = {}) {
  const h = { ...headers };
  if (body !== undefined && !raw) h["content-type"] = "application/json";
  if (token) h.authorization = `Bearer ${token}`;
  if (session) h["x-firevoice-session"] = session;
  const r = await fetch(base + path, { method, headers: h, body: raw ?? (body === undefined ? undefined : JSON.stringify(body)) });
  let data = null;
  try {
    data = await r.json();
  } catch {}
  return { status: r.status, data, headers: r.headers };
}

const deviceId = createHash("sha256").update(randomBytes(16)).digest("hex");
const device = { appVersion: "0.9.0", os: "windows", osVersion: "11 26300", arch: "x86_64", cores: 16, ramGb: 31.8, locale: "en-US", timezone: "Asia/Karachi", hostname: "api-check" };

console.log(`API check against ${base}`);

let r = await call("GET", "/api/v1/config");
ok(r.status === 200 && r.data.licensing === false && r.data.plan === "free", "config: free, licensing off");

r = await call("POST", "/api/v1/installs", { body: { ...device, deviceId: "nope" } });
ok(r.status === 400 && r.data.error === "invalid", "register refuses a bad device id");
r = await call("POST", "/api/v1/installs", { raw: "x".repeat(10), headers: { "content-type": "text/plain" } });
ok(r.status === 415, "register refuses a body that is not JSON");
r = await call("POST", "/api/v1/installs", { body: { ...device, deviceId } });
ok(r.status === 201 && r.data.token && r.data.installId, "register an install");
const { token, installId } = r.data;

r = await call("POST", "/api/v1/installs", { body: { ...device, deviceId, appVersion: "0.9.1" } });
ok(r.status === 201 && r.data.installId === installId && r.data.token !== token, "reinstall keeps the install, rotates the token");
const oldToken = token;
const tok = r.data.token;
r = await call("POST", "/api/v1/events", { token: oldToken, body: { events: [{ name: "app.launch", at: new Date().toISOString() }] } });
ok(r.status === 401, "the old token stops working");

r = await call("POST", "/api/v1/events", { token: "x".repeat(43), body: { events: [{ name: "app.launch", at: new Date().toISOString() }] } });
ok(r.status === 401, "events refuse an unknown token");
r = await call("POST", "/api/v1/events", { token: tok, body: { events: [{ name: "Bad Name!", at: new Date().toISOString() }] } });
ok(r.status === 400, "events refuse a bad event name");
r = await call("POST", "/api/v1/events", { token: tok, raw: JSON.stringify({ events: [{ name: "a.b", at: new Date().toISOString(), props: { x: "y".repeat(400) } }], pad: "z".repeat(600 * 1024) }), headers: { "content-type": "application/json" } });
ok(r.status === 413, "events refuse a body over 512 KB");

const now = Date.now();
const events = [
  { name: "app.launch", at: new Date(now - 5000).toISOString(), session: "s1" },
  { name: "dictation.done", at: new Date(now - 4000).toISOString(), props: { words: 42, app: "notepad.exe", language: "en", wake: true }, session: "s1" },
  { name: "app.heartbeat", at: new Date(now - 3000).toISOString(), props: { seconds: 300 }, session: "s1" },
  { name: "tts.generate", at: new Date(now + 10 * 86_400_000).toISOString(), props: { engine: "inferno", chars: 120 }, session: "s1" },
];
r = await call("POST", "/api/v1/events", { token: tok, body: { events } });
ok(r.status === 202 && r.data.stored === 4, "events: a batch of 4 stored");

r = await call("PATCH", "/api/v1/installs/me", { token: tok, body: { gpu: "RTX 4070", consent: true } });
ok(r.status === 200, "update the install's details");

r = await call("POST", "/api/v1/crashes", { token: tok, body: { kind: "panic", message: "api-check: test crash", stack: "at main" } });
ok(r.status === 201, "crash report stored");

// accounts
const email = `api-check-${randomBytes(4).toString("hex")}@example.com`;
r = await call("POST", "/api/v1/auth/signup", { token: tok, body: { email, password: "short" } });
ok(r.status === 400, "signup refuses a short password");
r = await call("POST", "/api/v1/auth/signup", { token: tok, body: { email, password: "correct horse battery", name: "API Check" } });
ok(r.status === 201 && r.data.token && r.data.user.email === email && r.data.user.verified === false, "sign up (signed in on this install)");
let session = r.data.token;
r = await call("POST", "/api/v1/auth/signup", { body: { email: email.toUpperCase(), password: "correct horse battery" } });
ok(r.status === 409, "signup refuses the same email in other casing");
r = await call("GET", "/api/v1/auth/me", { token: tok, session });
ok(r.status === 200 && r.data.user.email === email && r.data.installs === 1, "me: the account, linked to the install");
r = await call("POST", "/api/v1/auth/login", { body: { email, password: "wrong password!" } });
ok(r.status === 401 && r.data.error === "wrong_credentials", "login refuses a wrong password");
r = await call("POST", "/api/v1/auth/login", { body: { email: "nobody-here@example.com", password: "whatever123" } });
ok(r.status === 401 && r.data.error === "wrong_credentials", "login gives the same answer for an unknown email");
r = await call("POST", "/api/v1/auth/login", { token: tok, body: { email, password: "correct horse battery" } });
ok(r.status === 200 && r.data.token, "login");
const second = r.data.token;
r = await call("PATCH", "/api/v1/auth/me", { token: tok, session, body: { currentPassword: "nope", newPassword: "another good password" } });
ok(r.status === 401, "password change needs the current password");
r = await call("PATCH", "/api/v1/auth/me", { token: tok, session, body: { currentPassword: "correct horse battery", newPassword: "another good password" } });
ok(r.status === 200, "password changed");
r = await call("GET", "/api/v1/auth/me", { token: tok, session: second });
ok(r.status === 401, "a password change signs out the other devices");
r = await call("POST", "/api/v1/auth/forgot", { body: { email } });
ok(r.status === 200, "forgot password answers ok");
r = await call("POST", "/api/v1/auth/forgot", { body: { email: "nobody-here@example.com" } });
ok(r.status === 200, "forgot password answers the same for an unknown email");
r = await call("POST", "/api/v1/auth/verify", { body: { token: "x".repeat(43) } });
ok(r.status === 400 && r.data.error === "bad_link", "verify refuses a bad link");

// events now carry the person
r = await call("POST", "/api/v1/events", { token: tok, session, body: { events: [{ name: "page.view", at: new Date().toISOString(), props: { route: "/home" } }] } });
ok(r.status === 202, "events while signed in");

// licences (off)
r = await call("GET", "/api/v1/license", { token: tok, session });
ok(r.status === 200 && r.data.licensing === false && r.data.plan === "free", "licence: free while licensing is off");
r = await call("POST", "/api/v1/license/activate", { token: tok, body: { key: "FV-AAAAA-BBBBB-CCCCC-DDDDD" } });
ok(r.status === 409 && r.data.error === "licensing_off", "activation refused while licensing is off");

// feedback and waitlist
r = await call("POST", "/api/v1/feedback", { token: tok, session, body: { kind: "idea", message: "api-check: feedback from the app", rating: 5 } });
ok(r.status === 201, "feedback from the app");
r = await call("POST", "/api/v1/feedback", { body: { kind: "bug", message: "api-check: from the web", email: "" } });
ok(r.status === 201, "feedback from the web");
r = await call("POST", "/api/v1/feedback", { body: { kind: "rant", message: "x" } });
ok(r.status === 400, "feedback refuses a bad kind");
const wl = `api-check-${randomBytes(4).toString("hex")}@example.com`;
r = await call("POST", "/api/v1/waitlist", { body: { email: wl, interest: "mac", source: "api-check" } });
ok(r.status === 200 && r.data.ok && !r.data.already, "waitlist sign-up");
r = await call("POST", "/api/v1/waitlist", { body: { email: wl.toUpperCase(), interest: "mac", source: "api-check" } });
ok(r.status === 200 && r.data.already === true, "waitlist: twice is fine");
r = await call("POST", "/api/v1/waitlist", { body: { email: "not an email" } });
ok(r.status === 400, "waitlist refuses a bad email");

// admin
r = await call("GET", "/api/admin/overview");
ok(r.status === 401, "admin API refuses without signing in");
r = await call("POST", "/api/admin/session", { body: { password: "x" }, headers: { origin: "https://evil.example" } });
ok(r.status === 403, "admin sign-in refuses another site");
if (adminPassword) {
  const host = new URL(base).host;
  r = await call("POST", "/api/admin/session", { body: { password: "wrong-password-here" }, headers: { origin: base } });
  ok(r.status === 401, "admin sign-in refuses a wrong password");
  const res = await fetch(`${base}/api/admin/session`, { method: "POST", headers: { "content-type": "application/json", origin: base }, body: JSON.stringify({ password: adminPassword }) });
  const cookie = res.headers.get("set-cookie")?.split(";")[0];
  ok(res.status === 200 && cookie?.startsWith("fv_admin="), "admin sign-in");
  const ah = { cookie, origin: base, host };
  r = await call("GET", "/api/admin/overview?days=30", { headers: ah });
  ok(r.status === 200 && r.data.totals.installs >= 1 && r.data.daily.length >= 29, "admin overview");
  r = await call("GET", `/api/admin/installs/${installId}`, { headers: ah });
  ok(r.status === 200 && r.data.install.events.length >= 5 && !("tokenHash" in r.data.install), "admin install detail, no token hash");
  r = await call("GET", "/api/admin/events?name=dictation.*", { headers: ah });
  ok(r.status === 200 && Array.isArray(r.data.rows), "admin events");
  r = await call("POST", "/api/admin/licenses", { headers: { ...ah, origin: "https://evil.example" }, body: { plan: "PRO" } });
  ok(r.status === 403, "admin changes refuse another site");
  r = await call("POST", "/api/admin/licenses", { headers: ah, body: { plan: "PRO", seats: 1, note: "api-check" } });
  ok(r.status === 201 && /^FV(-[A-Z0-9]{5}){4}$/.test(r.data.key), "admin makes a licence key");
  if (r.data?.license) await call("PATCH", `/api/admin/licenses/${r.data.license.id}`, { headers: ah, body: { status: "REVOKED" } });
}

// clean up: delete the account, then erase the install
r = await call("DELETE", "/api/v1/auth/me", { token: tok, session, body: { password: "wrong" } });
ok(r.status === 401, "account deletion needs the password");
r = await call("DELETE", "/api/v1/auth/me", { token: tok, session, body: { password: "another good password" } });
ok(r.status === 200, "account deleted");
r = await call("GET", "/api/v1/auth/me", { token: tok, session });
ok(r.status === 401, "the deleted account's session is gone");
r = await call("DELETE", "/api/v1/installs/me", { token: tok });
ok(r.status === 200, "install erased");
r = await call("POST", "/api/v1/events", { token: tok, body: { events: [{ name: "app.launch", at: new Date().toISOString() }] } });
ok(r.status === 401, "an erased install cannot send");

console.log(failures ? `\n${failures} check(s) failed` : "\nall checks passed");
process.exit(failures ? 1 : 0);
