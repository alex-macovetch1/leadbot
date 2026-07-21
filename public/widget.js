/* LeadBot embeddable chat widget.
   Add to any site with:
     <script src="https://leadbot-inky.vercel.app/widget.js" data-biz="alexweb"></script>
   Optional attributes: data-api (API base), data-accent (hex color override). */
(function () {
  "use strict";
  if (window.__leadbotLoaded) return;
  window.__leadbotLoaded = true;

  var script = document.currentScript;
  var BIZ = (script && script.getAttribute("data-biz")) || "alexweb";
  var API = (script && script.getAttribute("data-api")) || "https://leadbot-inky.vercel.app";
  var accentOverride = script && script.getAttribute("data-accent");

  var cfg = {
    accent: accentOverride || "#7c3aed",
    title: { ro: "Asistent", ru: "Ассистент" },
    greeting: { ro: "Bună! 👋 Cu ce vă ajut?", ru: "Здравствуйте! 👋 Чем помочь?" },
  };

  var lang = null, convo = [], loading = false, done = false, opened = false;

  var T = {
    open: { ro: "Scrie-ne", ru: "Напишите нам" },
    online: { ro: "online", ru: "онлайн" },
    send: { ro: "Trimite", ru: "Отправить" },
    restart: { ro: "De la început", ru: "Сначала" },
    ph: { ro: "Scrie un mesaj…", ru: "Напишите сообщение…" },
    pick: "Alege limba · Выберите язык",
    err: {
      ro: "Scuze, ceva n-a mers. Mai încearcă o dată.",
      ru: "Извините, что-то пошло не так. Попробуйте ещё раз.",
    },
  };

  // ---- styles (scoped under #lb-root) ----
  var css =
    "#lb-root,#lb-root *{box-sizing:border-box;font-family:system-ui,-apple-system,'Segoe UI',Roboto,sans-serif}" +
    "#lb-launch{position:fixed;bottom:20px;right:20px;z-index:2147483000;display:flex;align-items:center;gap:8px;border:0;cursor:pointer;color:#fff;border-radius:999px;padding:12px 18px;font-size:15px;font-weight:600;box-shadow:0 8px 24px rgba(0,0,0,.22)}" +
    "#lb-panel{position:fixed;bottom:20px;right:20px;z-index:2147483000;width:min(92vw,370px);height:min(80vh,540px);display:none;flex-direction:column;overflow:hidden;border-radius:16px;background:#fff;box-shadow:0 18px 50px rgba(0,0,0,.3)}" +
    "#lb-head{display:flex;align-items:center;justify-content:space-between;padding:12px 16px;color:#fff}" +
    "#lb-head b{font-size:14px;font-weight:600}#lb-head .lb-on{font-size:11px;opacity:.85;display:flex;align-items:center;gap:5px}" +
    "#lb-head .lb-dot{width:6px;height:6px;border-radius:50%;background:#fff;opacity:.9}" +
    "#lb-x{background:0;border:0;color:#fff;cursor:pointer;font-size:20px;line-height:1;opacity:.85;padding:2px 6px}" +
    "#lb-msgs{flex:1;overflow-y:auto;padding:14px;background:#f6f7f9;display:flex;flex-direction:column;gap:10px}" +
    ".lb-b{max-width:85%;padding:9px 12px;border-radius:14px;font-size:14px;line-height:1.45;white-space:pre-line;word-wrap:break-word}" +
    ".lb-bot{align-self:flex-start;background:#fff;color:#1e2530;border-bottom-left-radius:4px;box-shadow:0 1px 2px rgba(0,0,0,.08)}" +
    ".lb-me{align-self:flex-end;color:#fff;border-bottom-right-radius:4px}" +
    ".lb-pick{display:flex;gap:8px;flex-wrap:wrap}" +
    ".lb-pickb{border:1px solid #d5d9df;background:#fff;color:#2b3340;border-radius:999px;padding:7px 14px;font-size:14px;cursor:pointer}" +
    "#lb-foot{padding:10px;border-top:1px solid #eceef1;background:#fff}" +
    "#lb-form{display:flex;gap:8px}" +
    "#lb-input{flex:1;min-width:0;border:1px solid #d5d9df;border-radius:10px;padding:9px 12px;font-size:14px;outline:none}" +
    "#lb-send{border:0;color:#fff;border-radius:10px;padding:9px 15px;font-size:14px;font-weight:600;cursor:pointer}" +
    "#lb-restart{width:100%;border:0;background:#eef0f3;color:#333;border-radius:10px;padding:9px;font-size:14px;font-weight:600;cursor:pointer}" +
    ".lb-typing{align-self:flex-start;color:#9aa2ad;background:#fff;border-radius:14px;padding:9px 12px;box-shadow:0 1px 2px rgba(0,0,0,.08)}";

  var root, launch, panel, msgsEl, footEl, headB, headOn;

  function el(tag, attrs, html) {
    var e = document.createElement(tag);
    if (attrs) for (var k in attrs) e.setAttribute(k, attrs[k]);
    if (html != null) e.innerHTML = html;
    return e;
  }
  function L() { return lang || "ro"; }

  function build() {
    root = el("div", { id: "lb-root" });
    var style = el("style"); style.textContent = css; root.appendChild(style);

    launch = el("button", { id: "lb-launch", type: "button" });
    launch.style.background = cfg.accent;
    launch.innerHTML = "<span style='font-size:17px'>💬</span><span id='lb-launch-t'></span>";
    launch.onclick = openPanel;

    panel = el("div", { id: "lb-panel" });
    var head = el("div", { id: "lb-head" }); head.style.background = cfg.accent;
    headB = el("b"); headOn = el("span", { class: "lb-on" });
    var hleft = el("div"); hleft.appendChild(headB);
    hleft.appendChild(el("span", { class: "lb-on" }));
    hleft.lastChild.innerHTML = "<span class='lb-dot'></span><span id='lb-on-t'></span>";
    var xb = el("button", { id: "lb-x", type: "button" }, "×"); xb.onclick = function () { panel.style.display = "none"; launch.style.display = "flex"; };
    head.appendChild(hleft); head.appendChild(xb);

    msgsEl = el("div", { id: "lb-msgs" });
    footEl = el("div", { id: "lb-foot" });

    panel.appendChild(head); panel.appendChild(msgsEl); panel.appendChild(footEl);
    root.appendChild(launch); root.appendChild(panel);
    document.body.appendChild(root);
    render();
  }

  function openPanel() { opened = true; launch.style.display = "none"; panel.style.display = "flex"; render(); }

  function addBubble(text, me) {
    var b = el("div", { class: "lb-b " + (me ? "lb-me" : "lb-bot") }, escapeHtml(text));
    if (me) b.style.background = cfg.accent;
    msgsEl.appendChild(b);
    msgsEl.scrollTop = msgsEl.scrollHeight;
  }
  function escapeHtml(s) { return String(s).replace(/[&<>]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;" }[c]; }); }

  function render() {
    // header + launcher labels
    if (headB) headB.textContent = cfg.title[L()];
    var onT = document.getElementById("lb-on-t"); if (onT) onT.textContent = T.online[L()];
    var lt = document.getElementById("lb-launch-t"); if (lt) lt.textContent = T.open[L()];

    // footer
    footEl.innerHTML = "";
    if (done) {
      var rb = el("button", { id: "lb-restart", type: "button" }, T.restart[L()]);
      rb.onclick = restart; footEl.appendChild(rb);
    } else if (lang) {
      var form = el("form", { id: "lb-form" });
      var inp = el("input", { id: "lb-input", type: "text", placeholder: T.ph[L()], autocomplete: "off" });
      var sb = el("button", { id: "lb-send", type: "submit" }, T.send[L()]); sb.style.background = cfg.accent;
      form.appendChild(inp); form.appendChild(sb);
      form.onsubmit = function (e) { e.preventDefault(); sendMsg(inp.value); inp.value = ""; };
      footEl.appendChild(form);
      setTimeout(function () { inp.focus(); }, 30);
    }
  }

  function startMsgs() {
    msgsEl.innerHTML = "";
    if (!lang) {
      addBubble(T.pick, false);
      var wrap = el("div", { class: "lb-pick" });
      ["ro", "ru"].forEach(function (lg) {
        var b = el("button", { class: "lb-pickb", type: "button" }, lg === "ro" ? "🇷🇴 Română" : "🇷🇺 Русский");
        b.onclick = function () { lang = lg; startMsgs(); render(); };
        wrap.appendChild(b);
      });
      msgsEl.appendChild(wrap);
    } else {
      addBubble(cfg.greeting[L()], false);
    }
  }

  function sendMsg(text) {
    text = (text || "").trim();
    if (!text || loading || done) return;
    addBubble(text, true);
    convo.push({ role: "user", text: text });
    loading = true;
    var typing = el("div", { class: "lb-typing" }, "•••"); msgsEl.appendChild(typing); msgsEl.scrollTop = msgsEl.scrollHeight;

    fetch(API + "/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ messages: convo, biz: BIZ }),
    })
      .then(function (r) { return r.json().then(function (d) { return { ok: r.ok, d: d }; }); })
      .then(function (res) {
        typing.remove(); loading = false;
        if (!res.ok || res.d.error) throw new Error(res.d.error || "err");
        var reply = res.d.reply || "…";
        addBubble(reply, false);
        convo.push({ role: "model", text: reply });
        if (res.d.done) { done = true; render(); }
      })
      .catch(function () { typing.remove(); loading = false; addBubble(T.err[L()], false); });
  }

  function restart() { lang = null; convo = []; done = false; loading = false; startMsgs(); render(); }

  function init() {
    build();
    startMsgs();
    // fetch branding, then re-render
    fetch(API + "/api/config?b=" + encodeURIComponent(BIZ))
      .then(function (r) { return r.json(); })
      .then(function (c) {
        if (c && c.accent) {
          cfg.accent = accentOverride || c.accent;
          cfg.title = c.title || cfg.title;
          cfg.greeting = c.greeting || cfg.greeting;
          launch.style.background = cfg.accent;
          document.getElementById("lb-head").style.background = cfg.accent;
          if (!lang) startMsgs(); // refresh greeting text via language step
          render();
        }
      })
      .catch(function () {});
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();
