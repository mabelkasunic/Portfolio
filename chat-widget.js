// Portfolio chat widget. Add to your site with:
// <script src="/chat-widget.js" defer></script>
(function () {
  // ---- EDIT THESE ----
  const WORKER_URL = "https://mabel-chat.mabelkasunic.workers.dev";
  const TITLE = "Ask about Mabel";
  const GREETING = "Hi! Ask me anything about Mabel's work, projects or experience.";
  const ACCENT = "#1f1f1f"; // match your site's main color
  // --------------------

  const history = [];

  const style = document.createElement("style");
  style.textContent = `
    .mk-chat-btn{position:fixed;right:20px;bottom:20px;z-index:9999;width:56px;height:56px;border-radius:50%;
      border:none;background:${ACCENT};color:#fff;font-size:24px;cursor:pointer;box-shadow:0 4px 14px rgba(0,0,0,.2)}
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
  btn.textContent = "💬";

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
