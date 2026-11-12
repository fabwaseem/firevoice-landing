import "server-only";
import nodemailer, { type Transporter } from "nodemailer";
import { env } from "./env";

// Account mail (verify your email, reset your password). Without SMTP_URL the mail is skipped and logged, so
// accounts still work; nothing else depends on it.
let transport: Transporter | null | undefined;

function mailer(): Transporter | null {
  if (transport !== undefined) return transport;
  const url = env().SMTP_URL;
  return (transport = url ? nodemailer.createTransport(url) : null);
}

const esc = (s: string) => s.replace(/[&<>"']/g, (c) => `&#${c.charCodeAt(0)};`);

function layout(title: string, text: string, button: string, href: string) {
  return `<!doctype html><html><body style="margin:0;background:#0b0b0d;font-family:system-ui,-apple-system,Segoe UI,sans-serif;color:#ececf1">
<table width="100%" cellpadding="0" cellspacing="0"><tr><td align="center" style="padding:40px 16px">
<table width="100%" style="max-width:480px;background:#151519;border:1px solid #26262c;border-radius:16px" cellpadding="0" cellspacing="0"><tr><td style="padding:32px">
<div style="font-weight:700;font-size:15px;color:#ff6a2b;letter-spacing:.02em">FireVoice</div>
<h1 style="font-size:22px;margin:16px 0 8px">${esc(title)}</h1>
<p style="font-size:15px;line-height:1.6;color:#b5b5be;margin:0 0 24px">${esc(text)}</p>
<a href="${esc(href)}" style="display:inline-block;background:#ff6a2b;color:#fff;text-decoration:none;font-weight:600;padding:12px 20px;border-radius:10px">${esc(button)}</a>
<p style="font-size:12px;line-height:1.6;color:#7c7c86;margin:24px 0 0">If you did not ask for this, ignore this email. The link works for a limited time.</p>
</td></tr></table></td></tr></table></body></html>`;
}

async function send(to: string, subject: string, html: string, text: string) {
  const m = mailer();
  if (!m) {
    console.info(`[mail] not configured; would send "${subject}" to ${to}`);
    return;
  }
  try {
    await m.sendMail({ from: env().MAIL_FROM, to, subject, html, text });
  } catch (e) {
    console.error("[mail] send failed", e);
  }
}

const site = () => env().NEXT_PUBLIC_SITE_URL.replace(/\/$/, "");

export function sendVerify(to: string, token: string) {
  const href = `${site()}/account/verify?token=${encodeURIComponent(token)}`;
  return send(
    to,
    "Confirm your FireVoice email",
    layout("Confirm your email", "Confirm this address to finish setting up your FireVoice account.", "Confirm email", href),
    `Confirm your FireVoice email: ${href}`,
  );
}

export function sendReset(to: string, token: string) {
  const href = `${site()}/account/reset?token=${encodeURIComponent(token)}`;
  return send(
    to,
    "Reset your FireVoice password",
    layout("Reset your password", "Choose a new password for your FireVoice account. The link works for one hour.", "Choose a new password", href),
    `Reset your FireVoice password: ${href}`,
  );
}
