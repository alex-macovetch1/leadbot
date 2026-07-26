/* LeadBot embeddable chat widget.
   Add to any site with:
     <script src="https://leadbot-inky.vercel.app/widget.js" data-biz="alexweb" defer></script>
   Optional attributes: data-api (API base), data-accent (hex colour override).

   Everything is scoped under #lb-root and uses lb- prefixes, so it cannot
   collide with the host page's styles. */
(function () {
  "use strict";
  if (window.__leadbotLoaded) return;
  window.__leadbotLoaded = true;

  var script =
    document.currentScript ||
    (function () {
      var s = document.querySelectorAll("script[src*='widget.js']");
      return s[s.length - 1];
    })();
  var BIZ = (script && script.getAttribute("data-biz")) || "alexweb";
  var API = (script && script.getAttribute("data-api")) || "https://leadbot-inky.vercel.app";
  var accentOverride = script && script.getAttribute("data-accent");

  var LANGS = [
    { code: "ro", flag: "🇷🇴", name: "Română" },
    { code: "ru", flag: "🇷🇺", name: "Русский" },
    { code: "en", flag: "🇬🇧", name: "English" },
  ];

  var cfg = {
    accent: accentOverride || "#1B36FF",
    title: { ro: "Asistent", ru: "Ассистент", en: "Assistant" },
    greeting: {
      ro: "Bună! 👋 Cu ce vă ajut?",
      ru: "Здравствуйте! 👋 Чем помочь?",
      en: "Hi! 👋 How can I help?",
    },
    suggestions: { ro: [], ru: [], en: [] },
  };

  var T = {
    open: { ro: "Scrie-ne", ru: "Напишите нам", en: "Chat with us" },
    online: { ro: "online · răspunde imediat", ru: "онлайн · отвечает сразу", en: "online · replies instantly" },
    ph: { ro: "Scrie un mesaj…", ru: "Напишите сообщение…", en: "Type a message…" },
    restart: { ro: "De la început", ru: "Сначала", en: "Start over" },
    hint: { ro: "Sau alege o întrebare", ru: "Или выберите вопрос", en: "Or pick a question" },
    pickT: { ro: "Alege limba", ru: "Выберите язык", en: "Choose a language" },
    pickS: {
      ro: "În ce limbă vorbim?",
      ru: "На каком языке говорим?",
      en: "Which language shall we use?",
    },
    doneT: { ro: "Te-am notat", ru: "Записали", en: "Got it" },
    doneD: {
      ro: "Revenim la tine cât de curând.",
      ru: "Свяжемся с вами в ближайшее время.",
      en: "We will get back to you shortly.",
    },
    err: {
      ro: "Scuze, ceva n-a mers. Mai încearcă o dată.",
      ru: "Извините, что-то пошло не так. Попробуйте ещё раз.",
      en: "Sorry, something went wrong. Please try again.",
    },
  };

  var lang = null,
    convo = [],
    loading = false,
    done = false;

  var CSS = [
    "#lb-root,#lb-root *{box-sizing:border-box;margin:0;padding:0;font-family:ui-sans-serif,system-ui,-apple-system,'Segoe UI',Roboto,sans-serif}",
    "#lb-root{--a:#1B36FF}",

    /* launcher */
    "#lb-launch{position:fixed;bottom:20px;right:20px;z-index:2147483000;display:inline-flex;align-items:center;gap:9px;border:0;cursor:pointer;color:#fff;border-radius:999px;padding:13px 20px 13px 16px;font-size:14.5px;font-weight:600;letter-spacing:-.01em;box-shadow:0 10px 30px -8px rgba(0,0,0,.35);animation:lb-pop .5s cubic-bezier(.16,1,.3,1) both;transition:transform .3s cubic-bezier(.16,1,.3,1),box-shadow .3s}",
    "#lb-launch:hover{transform:translateY(-2px) scale(1.02);box-shadow:0 16px 38px -10px rgba(0,0,0,.42)}",
    "#lb-launch svg{width:19px;height:19px;flex:none}",
    "#lb-launch::after{content:'';position:absolute;inset:0;border-radius:999px;border:2px solid currentColor;opacity:0;animation:lb-ring 3.2s ease-out infinite 1.2s}",

    /* panel */
    "#lb-panel{position:fixed;bottom:20px;right:20px;z-index:2147483000;width:min(94vw,384px);height:min(82vh,596px);display:none;flex-direction:column;overflow:hidden;border-radius:22px;background:#fff;color:#0f172a;box-shadow:0 2px 6px rgba(15,23,42,.06),0 30px 70px -22px rgba(15,23,42,.45)}",
    "#lb-panel.lb-in{display:flex;animation:lb-up .42s cubic-bezier(.16,1,.3,1) both}",

    /* header */
    "#lb-head{display:flex;align-items:center;gap:11px;padding:12px 13px;border-bottom:1px solid rgba(0,0,0,.07);background:rgba(255,255,255,.9);backdrop-filter:blur(14px)}",
    "#lb-av{position:relative;display:flex;align-items:center;justify-content:center;width:34px;height:34px;border-radius:999px;color:#fff;flex:none}",
    "#lb-av svg{width:15px;height:15px}",
    "#lb-htxt{min-width:0;flex:1;line-height:1.25}",
    "#lb-htxt b{display:block;font-size:13.5px;font-weight:650;letter-spacing:-.01em;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}",
    "#lb-htxt span{display:flex;align-items:center;gap:6px;margin-top:2px;font-size:11px;color:#64748b}",
    ".lb-live{width:6px;height:6px;border-radius:999px;background:#10b981;flex:none;animation:lb-blip 2.2s infinite}",
    "#lb-flags{display:flex;gap:1px;background:#f1f5f9;border-radius:999px;padding:3px;flex:none}",
    "#lb-flags button{border:0;background:0;cursor:pointer;font-size:13px;line-height:1;padding:5px 6px;border-radius:999px;opacity:.4;transition:opacity .2s,background-color .2s}",
    "#lb-flags button:hover{opacity:.8}",
    "#lb-flags button[aria-pressed='true']{opacity:1;background:#fff;box-shadow:0 1px 3px rgba(0,0,0,.12)}",
    ".lb-flag{display:block;overflow:hidden;border-radius:3px;box-shadow:0 0 0 1px rgba(0,0,0,.12)}",
    ".lb-flag svg{display:block;width:100%;height:100%}",
    "#lb-x{border:0;background:0;cursor:pointer;color:#94a3b8;width:28px;height:28px;border-radius:999px;display:grid;place-items:center;flex:none;transition:background-color .2s,color .2s}",
    "#lb-x:hover{background:#f1f5f9;color:#0f172a}",
    "#lb-x svg{width:15px;height:15px}",

    /* messages */
    "#lb-msgs{flex:1;overflow-y:auto;padding:16px 14px;display:flex;flex-direction:column;gap:10px;scrollbar-width:thin;scrollbar-color:#cbd5e1 transparent}",
    "#lb-msgs::-webkit-scrollbar{width:6px}#lb-msgs::-webkit-scrollbar-thumb{background:#cbd5e1;border-radius:999px}",
    ".lb-row{display:flex;align-items:flex-end;gap:8px;animation:lb-msg .34s cubic-bezier(.22,1,.36,1) both}",
    ".lb-row.me{justify-content:flex-end}",
    ".lb-sav{width:28px;height:28px;border-radius:999px;color:#fff;display:flex;align-items:center;justify-content:center;flex:none;margin-bottom:1px}",
    ".lb-sav svg{width:13px;height:13px}",
    ".lb-pad{width:36px;flex:none}",
    ".lb-b{max-width:78%;padding:9px 14px;border-radius:18px;font-size:13.5px;line-height:1.55;white-space:pre-line;word-wrap:break-word;overflow-wrap:anywhere}",
    ".lb-bot{background:#fff;color:#334155;border-bottom-left-radius:6px;box-shadow:0 1px 1px rgba(15,23,42,.05),0 6px 16px -8px rgba(15,23,42,.2)}",
    ".lb-me2{color:#fff;border-bottom-right-radius:6px}",

    /* chips */
    ".lb-chips{display:flex;flex-direction:column;align-items:flex-start;gap:6px;padding-left:36px}",
    ".lb-hint{font-size:10.5px;font-weight:500;text-transform:uppercase;letter-spacing:.12em;color:#94a3b8;margin-bottom:2px;animation:lb-chip .4s cubic-bezier(.22,1,.36,1) both}",
    ".lb-chip{display:inline-flex;align-items:center;gap:7px;border:1px solid #e2e8f0;background:#fff;border-radius:999px;padding:7px 13px;font-size:12.5px;font-weight:500;text-align:left;cursor:pointer;animation:lb-chip .45s cubic-bezier(.22,1,.36,1) both;transition:transform .22s cubic-bezier(.16,1,.3,1),border-color .22s,box-shadow .22s}",
    ".lb-chip:hover{transform:translateY(-1px)}",
    ".lb-chip svg{width:11px;height:11px;opacity:.35;transition:transform .22s,opacity .22s}",
    ".lb-chip:hover svg{opacity:1;transform:translateX(2px)}",

    /* language picker */
    "#lb-pick{margin:auto 0;padding:6px 4px;animation:lb-msg .4s cubic-bezier(.22,1,.36,1) both}",
    "#lb-pick h4{font-size:15.5px;font-weight:650;letter-spacing:-.02em;text-align:center}",
    "#lb-pick p{margin-top:5px;font-size:12.5px;color:#94a3b8;text-align:center}",
    "#lb-pick .lb-langs{display:flex;flex-direction:column;gap:8px;margin-top:18px}",
    "#lb-pick button{display:flex;align-items:center;gap:12px;width:100%;border:1px solid #e2e8f0;background:#fff;border-radius:16px;padding:13px 16px;font-size:14.5px;font-weight:550;cursor:pointer;text-align:left;animation:lb-chip .5s cubic-bezier(.22,1,.36,1) both;transition:transform .24s cubic-bezier(.16,1,.3,1),border-color .24s,box-shadow .24s}",
    "#lb-pick button:hover{transform:translateY(-2px)}",
    "#lb-pick .lb-flag{flex:none}",
    "#lb-pick .lb-go{margin-left:auto;opacity:.3;transition:transform .24s,opacity .24s}",
    "#lb-pick button:hover .lb-go{opacity:1;transform:translateX(3px)}",

    /* typing */
    ".lb-typing{display:flex;align-items:center;gap:4px;padding:12px 14px}",
    ".lb-typing i{width:6px;height:6px;border-radius:999px;background:#94a3b8;display:block;animation:lb-bounce 1.25s infinite ease-in-out}",
    ".lb-typing i:nth-child(2){animation-delay:.16s}.lb-typing i:nth-child(3){animation-delay:.32s}",

    /* done */
    "#lb-done{display:flex;gap:11px;align-items:flex-start;border:1px solid rgba(16,185,129,.22);background:rgba(236,253,245,.9);border-radius:16px;padding:13px 14px;animation:lb-msg .4s cubic-bezier(.22,1,.36,1) both}",
    "#lb-done .lb-ok{width:20px;height:20px;border-radius:999px;background:#10b981;color:#fff;display:grid;place-items:center;flex:none;margin-top:1px}",
    "#lb-done .lb-ok svg{width:11px;height:11px}",
    "#lb-done b{display:block;font-size:13px;font-weight:650;color:#065f46}",
    "#lb-done span{display:block;margin-top:1px;font-size:12.5px;color:rgba(6,95,70,.75)}",

    /* composer */
    "#lb-foot{padding:11px;border-top:1px solid rgba(0,0,0,.07);background:rgba(255,255,255,.9);backdrop-filter:blur(14px)}",
    "#lb-form{display:flex;align-items:center;gap:4px;background:#f4f4f2;border:1px solid #e6e6e2;border-radius:999px;padding:4px 4px 4px 0;transition:border-color .22s,background-color .22s}",
    "#lb-form:focus-within{background:#fff}",
    "#lb-input{flex:1;min-width:0;border:0;background:0;outline:none;padding:0 16px;font-size:13.5px;color:#0f172a}",
    "#lb-input::placeholder{color:#94a3b8}",
    "#lb-send{border:0;cursor:pointer;color:#fff;width:36px;height:36px;border-radius:999px;display:grid;place-items:center;flex:none;transition:transform .22s cubic-bezier(.16,1,.3,1),opacity .22s}",
    "#lb-send:hover:not(:disabled){transform:scale(1.06)}",
    "#lb-send:disabled{opacity:.32;cursor:default}",
    "#lb-send svg{width:16px;height:16px}",
    "#lb-restart{width:100%;border:0;cursor:pointer;background:#f1f5f9;color:#334155;border-radius:999px;padding:11px;font-size:13.5px;font-weight:600;display:flex;align-items:center;justify-content:center;gap:8px;transition:background-color .22s}",
    "#lb-restart:hover{background:#e2e8f0}",
    "#lb-restart svg{width:14px;height:14px}",

    /* animations */
    "@keyframes lb-pop{from{opacity:0;transform:scale(.85) translateY(10px)}to{opacity:1;transform:none}}",
    "@keyframes lb-up{from{opacity:0;transform:translateY(18px) scale(.97)}to{opacity:1;transform:none}}",
    "@keyframes lb-msg{from{opacity:0;transform:translateY(8px) scale(.98)}to{opacity:1;transform:none}}",
    "@keyframes lb-chip{from{opacity:0;transform:translateY(7px)}to{opacity:1;transform:none}}",
    "@keyframes lb-bounce{0%,80%,100%{opacity:.25;transform:translateY(0)}40%{opacity:1;transform:translateY(-3px)}}",
    "@keyframes lb-blip{0%,100%{box-shadow:0 0 0 0 rgba(16,185,129,.55)}50%{box-shadow:0 0 0 5px rgba(16,185,129,0)}}",
    "@keyframes lb-ring{0%{opacity:.5;transform:scale(1)}70%,100%{opacity:0;transform:scale(1.35)}}",
    "@media (prefers-reduced-motion:reduce){#lb-root *{animation:none!important;transition:none!important}}",
  ].join("");

  /* Emoji flags do not render on Windows, so they are drawn instead. */
  var FLAG = {
    ro: "<svg viewBox='0 0 3 2'><rect width='1' height='2' fill='#002B7F'/><rect x='1' width='1' height='2' fill='#FCD116'/><rect x='2' width='1' height='2' fill='#CE1126'/></svg>",
    ru: "<svg viewBox='0 0 3 2'><rect width='3' height='2' fill='#fff'/><rect y='.667' width='3' height='.667' fill='#0039A6'/><rect y='1.333' width='3' height='.667' fill='#D52B1E'/></svg>",
    en: "<svg viewBox='0 0 60 40'><rect width='60' height='40' fill='#012169'/><path d='M0 0l60 40M60 0L0 40' stroke='#fff' stroke-width='9'/><path d='M0 0l60 40M60 0L0 40' stroke='#C8102E' stroke-width='4'/><path d='M30 0v40M0 20h60' stroke='#fff' stroke-width='14'/><path d='M30 0v40M0 20h60' stroke='#C8102E' stroke-width='8'/></svg>"
  };
  function flag(code, w, h) {
    var s = el("span", { class: "lb-flag" });
    s.style.width = w + "px"; s.style.height = h + "px";
    s.innerHTML = FLAG[code] || "";
    return s;
  }

  var root, launch, panel, msgsEl, footEl, headName, headOn, flagsEl;

  function el(tag, attrs, text) {
    var e = document.createElement(tag);
    if (attrs) for (var k in attrs) e.setAttribute(k, attrs[k]);
    if (text != null) e.textContent = text;
    return e;
  }
  function svg(d, w, sw) {
    var s =
      "<svg viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='" +
      (sw || 2) +
      "' stroke-linecap='round' stroke-linejoin='round'>" +
      d +
      "</svg>";
    var t = document.createElement("span");
    t.innerHTML = s;
    t.style.display = "flex";
    return t.firstChild;
  }
  var ICON = {
    bot: "<rect x='4' y='8' width='16' height='12' rx='3'/><path d='M12 8V4'/><circle cx='12' cy='3' r='1' fill='currentColor'/><path d='M9 14h.01M15 14h.01'/>",
    send: "<path d='m5 12 14-7-5 14-2.5-5.5z'/>",
    close: "<path d='M18 6 6 18M6 6l12 12'/>",
    arrow: "<path d='M5 12h14M13 6l6 6-6 6'/>",
    check: "<path d='m5 13 4.5 4.5L19 7'/>",
    refresh: "<path d='M3 12a9 9 0 0 1 15-6.7L21 8'/><path d='M21 3v5h-5'/><path d='M21 12a9 9 0 0 1-15 6.7L3 16'/><path d='M3 21v-5h5'/>",
    chat: "<path d='M20.5 12.5a7.5 7.5 0 0 1-10.9 6.7L4 20.5l1.4-5.4A7.5 7.5 0 1 1 20.5 12.5z'/>",
  };
  function L() {
    return lang || "ro";
  }
  function pick(obj, fallback) {
    if (!obj) return fallback || "";
    return obj[L()] || obj.ro || fallback || "";
  }
  function scroll() {
    msgsEl.scrollTop = msgsEl.scrollHeight;
  }

  /* ---------- build ---------- */
  function build() {
    root = el("div", { id: "lb-root" });
    var st = el("style");
    st.textContent = CSS;
    root.appendChild(st);

    launch = el("button", { id: "lb-launch", type: "button", "aria-label": "Chat" });
    launch.style.position = "fixed";
    launch.appendChild(svg(ICON.chat, 19, 1.9));
    var lt = el("span", { id: "lb-launch-t" });
    launch.appendChild(lt);
    launch.onclick = open;

    panel = el("div", { id: "lb-panel", role: "dialog", "aria-label": "Chat" });

    var head = el("div", { id: "lb-head" });
    var av = el("span", { id: "lb-av" });
    av.appendChild(svg(ICON.bot, 15, 2));
    var htxt = el("div", { id: "lb-htxt" });
    headName = el("b");
    headOn = el("span");
    var liveDot = el("i", { class: "lb-live" });
    var onT = el("span", { id: "lb-on-t" });
    headOn.appendChild(liveDot);
    headOn.appendChild(onT);
    htxt.appendChild(headName);
    htxt.appendChild(headOn);

    flagsEl = el("div", { id: "lb-flags" });
    LANGS.forEach(function (lg) {
      var b = el("button", { type: "button", "aria-pressed": "false", title: lg.name });
      b.appendChild(flag(lg.code, 18, 13));
      b.setAttribute("data-lg", lg.code);
      b.onclick = function () {
        if (lg.code === lang) return;
        lang = lg.code;
        convo = [];
        done = false;
        loading = false;
        paint();
      };
      flagsEl.appendChild(b);
    });

    var x = el("button", { id: "lb-x", type: "button", "aria-label": "Close" });
    x.appendChild(svg(ICON.close, 15, 2));
    x.onclick = close;

    head.appendChild(av);
    head.appendChild(htxt);
    head.appendChild(flagsEl);
    head.appendChild(x);

    msgsEl = el("div", { id: "lb-msgs" });
    footEl = el("div", { id: "lb-foot" });

    panel.appendChild(head);
    panel.appendChild(msgsEl);
    panel.appendChild(footEl);
    root.appendChild(launch);
    root.appendChild(panel);
    document.body.appendChild(root);
    tint();
  }

  function tint() {
    root.style.setProperty("--a", cfg.accent);
    launch.style.background = cfg.accent;
    var av = document.getElementById("lb-av");
    if (av) av.style.background = cfg.accent;
    msgsEl.style.background =
      "radial-gradient(24rem 14rem at 50% -8%, " + hexa(cfg.accent, 0.09) + ", transparent 70%), #fbfbfa";
  }
  function hexa(hex, a) {
    var h = String(hex).replace("#", "");
    if (h.length === 3) h = h[0] + h[0] + h[1] + h[1] + h[2] + h[2];
    var n = parseInt(h, 16);
    return "rgba(" + ((n >> 16) & 255) + "," + ((n >> 8) & 255) + "," + (n & 255) + "," + a + ")";
  }

  function open() {
    launch.style.display = "none";
    panel.classList.add("lb-in");
    paint();
  }
  function close() {
    panel.classList.remove("lb-in");
    launch.style.display = "inline-flex";
  }

  /* ---------- render ---------- */
  function paint() {
    document.getElementById("lb-launch-t").textContent = pick(T.open);
    headName.textContent = lang ? pick(cfg.title) : pick(T.pickT);
    document.getElementById("lb-on-t").textContent = pick(T.online);
    headOn.style.display = lang ? "flex" : "none";
    flagsEl.style.display = lang ? "flex" : "none";
    [].forEach.call(flagsEl.children, function (b) {
      b.setAttribute("aria-pressed", String(b.getAttribute("data-lg") === lang));
    });

    msgsEl.innerHTML = "";
    footEl.innerHTML = "";

    if (!lang) {
      msgsEl.style.justifyContent = "center";
      renderPicker();
      return;
    }
    msgsEl.style.justifyContent = "";
    bubble(pick(cfg.greeting), false);
    if (convo.length === 0) renderChips();
    footEl.appendChild(composer());
    setTimeout(function () {
      var i = document.getElementById("lb-input");
      if (i) i.focus();
    }, 40);
  }

  function renderPicker() {
    var box = el("div", { id: "lb-pick" });
    box.appendChild(el("h4", null, "Alege limba · Выберите язык · Choose a language"));
    var list = el("div", { class: "lb-langs" });
    LANGS.forEach(function (lg, i) {
      var b = el("button", { type: "button" });
      b.style.animationDelay = 90 + i * 80 + "ms";
      var f = flag(lg.code, 27, 19);
      var n = el("span", null, lg.name);
      var go = svg(ICON.arrow, 14, 2.4);
      go.setAttribute("class", "lb-go");
      go.style.width = "14px";
      go.style.height = "14px";
      b.appendChild(f);
      b.appendChild(n);
      b.appendChild(go);
      b.onmouseenter = function () {
        b.style.borderColor = cfg.accent;
        b.style.boxShadow = "0 8px 20px -10px " + hexa(cfg.accent, 0.6);
      };
      b.onmouseleave = function () {
        b.style.borderColor = "";
        b.style.boxShadow = "";
      };
      b.onclick = function () {
        lang = lg.code;
        paint();
      };
      list.appendChild(b);
    });
    box.appendChild(list);
    msgsEl.appendChild(box);
  }

  function bubble(text, me) {
    var row = el("div", { class: "lb-row" + (me ? " me" : "") });
    if (!me) {
      var av = el("span", { class: "lb-sav" });
      av.style.background = cfg.accent;
      av.appendChild(svg(ICON.bot, 13, 2));
      row.appendChild(av);
    }
    var b = el("div", { class: "lb-b " + (me ? "lb-me2" : "lb-bot") }, text);
    if (me) b.style.background = cfg.accent;
    row.appendChild(b);
    msgsEl.appendChild(row);
    scroll();
    return row;
  }

  function renderChips() {
    var list = (cfg.suggestions && (cfg.suggestions[L()] || cfg.suggestions.ro)) || [];
    if (!list.length) return;
    var wrap = el("div", { class: "lb-chips" });
    wrap.appendChild(el("p", { class: "lb-hint" }, pick(T.hint)));
    list.forEach(function (s, i) {
      var b = el("button", { class: "lb-chip", type: "button" }, s);
      b.style.color = cfg.accent;
      b.style.animationDelay = 120 + i * 70 + "ms";
      b.appendChild(svg(ICON.arrow, 11, 2.4));
      b.onmouseenter = function () {
        b.style.borderColor = cfg.accent;
        b.style.boxShadow = "0 6px 16px -8px " + hexa(cfg.accent, 0.6);
      };
      b.onmouseleave = function () {
        b.style.borderColor = "";
        b.style.boxShadow = "";
      };
      b.onclick = function () {
        wrap.remove();
        send(s);
      };
      wrap.appendChild(b);
    });
    msgsEl.appendChild(wrap);
    scroll();
  }

  function composer() {
    var form = el("form", { id: "lb-form" });
    var inp = el("input", { id: "lb-input", type: "text", autocomplete: "off", placeholder: pick(T.ph) });
    var btn = el("button", { id: "lb-send", type: "submit", "aria-label": "Send", disabled: "true" });
    btn.style.background = cfg.accent;
    btn.appendChild(svg(ICON.send, 16, 2.1));
    inp.oninput = function () {
      btn.disabled = !inp.value.trim();
    };
    form.onsubmit = function (e) {
      e.preventDefault();
      var v = inp.value;
      inp.value = "";
      btn.disabled = true;
      send(v);
    };
    form.appendChild(inp);
    form.appendChild(btn);
    return form;
  }

  function restartBtn() {
    var b = el("button", { id: "lb-restart", type: "button" });
    b.appendChild(svg(ICON.refresh, 14, 2));
    b.appendChild(el("span", null, pick(T.restart)));
    b.onclick = function () {
      convo = [];
      done = false;
      loading = false;
      paint();
    };
    return b;
  }

  /* ---------- send ---------- */
  function send(text) {
    text = (text || "").trim();
    if (!text || loading || done) return;
    var chips = msgsEl.querySelector(".lb-chips");
    if (chips) chips.remove();

    bubble(text, true);
    convo.push({ role: "user", text: text });
    loading = true;

    var row = el("div", { class: "lb-row" });
    var av = el("span", { class: "lb-sav" });
    av.style.background = cfg.accent;
    av.appendChild(svg(ICON.bot, 13, 2));
    var bb = el("div", { class: "lb-b lb-bot" });
    var t = el("span", { class: "lb-typing" });
    t.appendChild(el("i"));
    t.appendChild(el("i"));
    t.appendChild(el("i"));
    bb.appendChild(t);
    bb.style.padding = "0";
    row.appendChild(av);
    row.appendChild(bb);
    msgsEl.appendChild(row);
    scroll();

    fetch(API + "/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ messages: convo, biz: BIZ, lang: L() }),
    })
      .then(function (r) {
        return r.json().then(function (d) {
          return { ok: r.ok, d: d };
        });
      })
      .then(function (res) {
        row.remove();
        loading = false;
        if (!res.ok || res.d.error) throw new Error("err");
        var reply = res.d.reply || "…";
        bubble(reply, false);
        convo.push({ role: "model", text: reply });
        if (res.d.done) {
          done = true;
          var ok = el("div", { id: "lb-done" });
          var ic = el("span", { class: "lb-ok" });
          ic.appendChild(svg(ICON.check, 11, 3.2));
          var txt = el("div");
          txt.appendChild(el("b", null, pick(T.doneT)));
          txt.appendChild(el("span", null, pick(T.doneD)));
          ok.appendChild(ic);
          ok.appendChild(txt);
          msgsEl.appendChild(ok);
          footEl.innerHTML = "";
          footEl.appendChild(restartBtn());
          scroll();
        }
      })
      .catch(function () {
        row.remove();
        loading = false;
        bubble(pick(T.err), false);
      });
  }

  /* ---------- init ---------- */
  function init() {
    build();
    paint();
    fetch(API + "/api/config?b=" + encodeURIComponent(BIZ))
      .then(function (r) {
        return r.json();
      })
      .then(function (c) {
        if (!c) return;
        if (c.accent && !accentOverride) cfg.accent = c.accent;
        if (c.title) cfg.title = c.title;
        if (c.greeting) cfg.greeting = c.greeting;
        if (c.suggestions) cfg.suggestions = c.suggestions;
        tint();
        paint();
      })
      .catch(function () {});
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();
