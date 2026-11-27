// Portfolio chat widget. Add to your site with:
// <script src="/chat-widget.js" defer></script>
(function () {
  // ---- EDIT THESE ----
  const WORKER_URL = "https://mabel-chat.mabelkasunic.workers.dev";
  const TITLE = "Ask about Mabel";
  const GREETING = "Hi! Ask me anything about Mabel's work, projects or experience.";
  const ACCENT = "#1f1f1f"; // match your site's main color
  const HOVER_TEXT = "Ask me"; // text that slides out when you hover the button
  // --------------------

  const history = [];

  const style = document.createElement("style");
  style.textContent = `
    .mk-chat-btn{position:fixed;right:20px;bottom:20px;z-index:9999;height:56px;min-width:56px;max-width:56px;padding:0 16px;
      border-radius:28px;border:none;background:${ACCENT};color:#fff;cursor:pointer;box-shadow:0 4px 14px rgba(0,0,0,.2);
      display:flex;align-items:center;justify-content:flex-start;gap:0;overflow:hidden;white-space:nowrap;
      font:600 15px/1 system-ui,-apple-system,sans-serif;
      transition:max-width .35s cubic-bezier(.2,.8,.2,1),gap .35s cubic-bezier(.2,.8,.2,1),transform .2s ease,box-shadow .2s ease}
    .mk-chat-btn svg{flex:0 0 24px;transition:transform .35s cubic-bezier(.2,.8,.2,1)}
    .mk-chat-btn .mk-label{opacity:0;transform:translateX(-6px);transition:opacity .25s ease,transform .35s cubic-bezier(.2,.8,.2,1)}
    .mk-chat-btn:hover,.mk-chat-btn:focus-visible{max-width:160px;gap:10px;transform:translateY(-2px);box-shadow:0 8px 20px rgba(0,0,0,.25)}
    .mk-chat-btn:hover svg,.mk-chat-btn:focus-visible svg{transform:rotate(-8deg)}
    .mk-chat-btn:hover .mk-label,.mk-chat-btn:focus-visible .mk-label{opacity:1;transform:none;transition-delay:.08s}
    @media (prefers-reduced-motion:reduce){.mk-chat-btn,.mk-chat-btn *{transition:none!important}}
    .mk-chat{position:fixed;right:20px;bottom:88px;z-index:9999;width:min(360px,calc(100vw - 40px));height:min(500px,calc(100vh - 120px));
      background:#fff;color:#1f1f1f;border-radius:14px;box-shadow:0 10px 40px rgba(0,0,0,.2);display:none;flex-direction:column;
      overflow:hidden;font:14px/1.45 system-ui,-apple-system,sans-serif}
    .mk-chat.open{display:flex}
    .mk-head{padding:14px 16px;background:${ACCENT};color:#fff;font-weight:600;display:flex;justify-content:space-between;align-items:center}
    .mk-head button{background:none;border:none;color:#fff;font-size:18px;cursor:pointer}
    .mk-log{flex:1;overflow-y:auto;padding:14px;display:flex;flex-direction:column;gap:8px}
    .mk-msg{max-width:85%;padding:8px 12px;border-radius:12px;white-space:pre-wrap;word-wrap:break-word}
    .mk-bot{background:#f1f1f1;align-self:flex-start}
    .mk-user{background:${ACCENT};color:#fff;align-self:flex-end}
    .mk-form{display:flex;border-top:1px solid #e5e5e5}
    .mk-form input{flex:1;border:none;padding:12px 14px;font:inherit;outline:none}
    .mk-form button{border:none;background:none;padding:0 16px;color:${ACCENT};font-weight:600;cursor:pointer}
    .mk-form button:disabled{opacity:.4;cursor:default}
  `;
  document.head.appendChild(style);

  const btn = document.createElement("button");
  btn.className = "mk-chat-btn";
  btn.setAttribute("aria-label", "Open chat");
  btn.innerHTML =
    '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" ' +
    'stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' +
    '<path d="M21 12a8 8 0 0 1-11.6 7.1L4 20l1-4.6A8 8 0 1 1 21 12z"/></svg>' +
    '<span class="mk-label">' + HOVER_TEXT + '</span>';

  const panel = document.createElement("div");
  panel.className = "mk-chat";
  panel.setAttribute("role", "dialog");
  panel.setAttribute("aria-label", TITLE);
  panel.innerHTML = `
    <div class="mk-head"><span></span><button aria-label="Close chat">×</button></div>
    <div class="mk-log" aria-live="polite"></div>
    <form class="mk-form"><input maxlength="1000" placeholder="Type a question…" aria-label="Message"><button type="submit">Send</button></form>
  `;
  panel.querySelector(".mk-head span").textContent = TITLE;

  document.body.append(btn, panel);

  const log = panel.querySelector(".mk-log");
  const form = panel.querySelector(".mk-form");
  const input = form.querySelector("input");
  const sendBtn = form.querySelector("button");

  function add(text, who) {
    const el = document.createElement("div");
    el.className = "mk-msg " + (who === "user" ? "mk-user" : "mk-bot");
    el.textContent = text; // textContent keeps replies from injecting HTML
    log.appendChild(el);
    log.scrollTop = log.scrollHeight;
    return el;
  }

  add(GREETING, "bot");

  btn.onclick = () => { panel.classList.toggle("open"); if (panel.classList.contains("open")) input.focus(); };
  panel.querySelector(".mk-head button").onclick = () => panel.classList.remove("open");

  form.onsubmit = async (e) => {
    e.preventDefault();
    const text = input.value.trim();
    if (!text) return;
    input.value = "";
    add(text, "user");
    history.push({ role: "user", content: text });

    sendBtn.disabled = true;
    const thinking = add("…", "bot");
    try {
      const res = await fetch(WORKER_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: history.slice(-12) }),
      });
      const data = await res.json();
      const reply = data.reply || data.error || "Sorry, something went wrong.";
      thinking.textContent = reply;
      if (data.reply) history.push({ role: "assistant", content: reply });
      else history.pop();
    } catch {
      thinking.textContent = "Sorry, I couldn't connect. Please try again.";
      history.pop();
    } finally {
      sendBtn.disabled = false;
      input.focus();
    }
  };
})();
