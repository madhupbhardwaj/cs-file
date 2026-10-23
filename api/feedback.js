// Feedback from cs-file.vercel.app → a Telegram message to the site owner.
// Needs two environment variables in Vercel (Project → Settings → Environment Variables):
//   TELEGRAM_BOT_TOKEN  the token BotFather gives you
//   TELEGRAM_CHAT_ID    your chat id with the bot
// The token never reaches the browser; visitors only ever talk to this function.

const TYPES = { problem: "🐞 Problem", idea: "💡 Idea", other: "💬 Feedback" };
const LIMITS = { message: 3000, email: 200, field: 300, programs: 120000 };
const WINDOW_MS = 10 * 60 * 1000, MAX_PER_WINDOW = 5;
const recent = new Map(); // best-effort rate limit per visitor (resets when Vercel starts a fresh instance)

const esc = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
const clip = (s, n) => { s = typeof s === "string" ? s : ""; return s.length > n ? s.slice(0, n - 1) + "…" : s; };

function rateLimited(ip) {
  const now = Date.now();
  const list = (recent.get(ip) || []).filter((t) => now - t < WINDOW_MS);
  if (list.length >= MAX_PER_WINDOW) { recent.set(ip, list); return true; }
  list.push(now); recent.set(ip, list);
  if (recent.size > 5000) recent.clear();
  return false;
}

function sameSite(req) {
  const origin = req.headers.origin;
  if (!origin) return true; // some browsers omit it on same-origin requests
  try { return new URL(origin).host === req.headers.host; } catch { return false; }
}

function buildMessage(b) {
  const c = b.context && typeof b.context === "object" ? b.context : {};
  const s = c.settings && typeof c.settings === "object" ? c.settings : {};
  const lines = [
    `<b>${TYPES[b.type] || TYPES.other}</b>`,
    "",
    esc(clip(b.message, LIMITS.message)),
    "",
    `<b>Reply to:</b> ${b.email ? esc(clip(b.email, LIMITS.email)) : "no email given"}`,
    `<b>Device:</b> ${esc(clip(c.browser, LIMITS.field))} · ${esc(clip(c.os, LIMITS.field))} · ${esc(clip(c.screen, 40))}`,
    `<b>Settings:</b> ${esc([s.look, s.perPage, s.cover, s.colour, s.pyver].filter(Boolean).join(" · ").slice(0, LIMITS.field))}`,
    `<b>Programs in file:</b> ${Number(c.programCount) || 0}`,
  ];
  if (c.lastError) lines.push(`<b>Last error:</b> <code>${esc(clip(c.lastError, 700))}</code>`);
  lines.push(`<b>Site:</b> ${esc(clip(c.version, 40))} · ${esc(clip(c.page, 120))}`);
  if (b.programsText) lines.push("", "📎 Programs attached as a file.");
  return lines.join("\n").slice(0, 4000); // Telegram's limit is 4096 characters
}

async function telegram(method, token, payload, isForm) {
  const r = await fetch(`https://api.telegram.org/bot${token}/${method}`, isForm
    ? { method: "POST", body: payload }
    : { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
  const data = await r.json().catch(() => ({}));
  if (!r.ok || !data.ok) throw new Error(`Telegram ${method} failed: ${r.status} ${data.description || ""}`);
  return data;
}

module.exports = async function handler(req, res) {
  if (req.method !== "POST") { res.setHeader("Allow", "POST"); return res.status(405).json({ ok: false, error: "method" }); }
  if (!sameSite(req)) return res.status(403).json({ ok: false, error: "origin" });

  const token = process.env.TELEGRAM_BOT_TOKEN, chatId = process.env.TELEGRAM_CHAT_ID;
  if (!token || !chatId) return res.status(503).json({ ok: false, error: "not_configured" });

  let b = req.body;
  if (typeof b === "string") { try { b = JSON.parse(b); } catch { b = null; } }
  if (!b || typeof b !== "object") return res.status(400).json({ ok: false, error: "bad_request" });
  if (b.website) return res.status(200).json({ ok: true }); // hidden field only bots fill in; pretend success
  if (typeof b.message !== "string" || !b.message.trim()) return res.status(400).json({ ok: false, error: "empty" });
  if (b.message.length > LIMITS.message + 200) return res.status(413).json({ ok: false, error: "too_long" });
  if (typeof b.programsText === "string" && b.programsText.length > LIMITS.programs) b.programsText = b.programsText.slice(0, LIMITS.programs) + "\n…(cut short)";

  const ip = String(req.headers["x-forwarded-for"] || "").split(",")[0].trim() || "unknown";
  if (rateLimited(ip)) return res.status(429).json({ ok: false, error: "rate_limited" });

  try {
    await telegram("sendMessage", token, { chat_id: chatId, text: buildMessage(b), parse_mode: "HTML", disable_web_page_preview: true });
    if (typeof b.programsText === "string" && b.programsText.trim()) {
      const form = new FormData();
      form.append("chat_id", chatId);
      form.append("document", new Blob([b.programsText], { type: "text/plain" }), "programs.txt");
      await telegram("sendDocument", token, form, true);
    }
    return res.status(200).json({ ok: true });
  } catch (e) {
    console.error(e);
    return res.status(502).json({ ok: false, error: "send_failed" });
  }
};
