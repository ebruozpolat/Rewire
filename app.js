/* rewire — günlük zihin pratiği
 * Veri tarayıcının localStorage'ında saklanır; sunucu yok, hesap yok. */

(function () {
  "use strict";

  var STORAGE_KEY = "rewire-state-v1";

  var SCIENCE_NOTES = [
    "<strong>Hebb kuralı:</strong> Birlikte ateşlenen nöronlar birlikte bağlanır. Her tekrar aynı sinaptik yolu güçlendirir.",
    "<strong>Miyelinasyon:</strong> Sık kullanılan yollar yalıtılır; yeni hikâyen eskisinden daha hızlı ateşlenmeye başlar.",
    "<strong>Aralıklı tekrar:</strong> Günde bir dürüst tekrar, bir saatte on tekrardan daha kalıcı iz bırakır.",
    "<strong>Yazmanın gücü:</strong> Yazmak, yalnızca düşünmekten daha fazla devreyi çalıştırır — motor, görsel ve dil ağları hikâyeyi birlikte kodlar.",
    "<strong>Dikkat:</strong> Nöroplastisiteyi dikkat yönlendirir. Neyi prova edersen onu pekiştirirsin.",
    "<strong>Eski yollar silinmez:</strong> Sadece yarışı kaybeder. Üstü çizili hikâyen bu yüzden hâlâ görünür — ama artık ateşlemiyorsun."
  ];

  /* ---------- state ---------- */

  function load() {
    try {
      var raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        var parsed = JSON.parse(raw);
        if (parsed && Array.isArray(parsed.stories)) return parsed;
      }
    } catch (e) { /* bozuk kayıt — sıfırdan başla */ }
    return { stories: [] };
  }

  function save() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }

  var state = load();

  /* ---------- tarih yardımcıları (yerel saat) ---------- */

  function todayStr() {
    var d = new Date();
    return d.getFullYear() + "-" +
      String(d.getMonth() + 1).padStart(2, "0") + "-" +
      String(d.getDate()).padStart(2, "0");
  }

  function shiftDay(dateStr, delta) {
    var p = dateStr.split("-");
    var d = new Date(+p[0], +p[1] - 1, +p[2] + delta);
    return d.getFullYear() + "-" +
      String(d.getMonth() + 1).padStart(2, "0") + "-" +
      String(d.getDate()).padStart(2, "0");
  }

  /* Pratik yapılan tüm günler: dikim günü + her tekrar günü. */
  function practiceDays() {
    var days = {};
    state.stories.forEach(function (s) {
      days[s.plantedOn] = true;
      s.repeats.forEach(function (r) { days[r] = true; });
    });
    return days;
  }

  /* Seri: bugünden (ya da bugün henüz pratik yoksa dünden) geriye kesintisiz günler. */
  function computeStreak() {
    var days = practiceDays();
    var cursor = todayStr();
    if (!days[cursor]) cursor = shiftDay(cursor, -1);
    var streak = 0;
    while (days[cursor]) {
      streak++;
      cursor = shiftDay(cursor, -1);
    }
    return streak;
  }

  function repeatedToday(story) {
    return story.repeats.indexOf(todayStr()) !== -1;
  }

  /* Güç: 0..1 — çiçeğin ve sinapsların boyutunu belirler. ~21 tekrarda doyuma ulaşır. */
  function strength(story) {
    return Math.min(1, story.repeats.length / 21);
  }

  /* ---------- DOM ---------- */

  var $ = function (id) { return document.getElementById(id); };

  var els = {
    streakCount: $("streak-count"),
    scienceText: $("science-text"),
    garden: $("garden"),
    gardenEmpty: $("garden-empty"),
    btnNewStory: $("btn-new-story"),
    form: $("rewrite-form"),
    oldStory: $("old-story"),
    newStory: $("new-story"),
    btnCancel: $("btn-cancel"),
    stories: $("stories"),
    modal: $("repeat-modal"),
    modalStory: $("repeat-story-text"),
    btnRepeatCancel: $("btn-repeat-cancel"),
    btnRepeatConfirm: $("btn-repeat-confirm")
  };

  /* ---------- bilim notu (her açılışta döner) ---------- */

  function renderScienceNote() {
    var start = Math.floor(Date.now() / 864e5); // güne göre kaydır
    var seen = 0;
    try {
      seen = +(sessionStorage.getItem("rewire-note-offset") || 0);
      sessionStorage.setItem("rewire-note-offset", String(seen + 1));
    } catch (e) { /* sessionStorage yoksa sadece güne göre dön */ }
    els.scienceText.innerHTML = SCIENCE_NOTES[(start + seen) % SCIENCE_NOTES.length];
  }

  /* ---------- bahçe (SVG) ---------- */

  var SVG_NS = "http://www.w3.org/2000/svg";

  function svgEl(name, attrs) {
    var el = document.createElementNS(SVG_NS, name);
    for (var k in attrs) el.setAttribute(k, attrs[k]);
    return el;
  }

  /* Deterministik sözde rastgele — yıldızlar her açılışta aynı yerde dursun. */
  function mulberry(seed) {
    return function () {
      seed |= 0; seed = (seed + 0x6D2B79F5) | 0;
      var t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  function renderGarden() {
    var svg = els.garden;
    svg.innerHTML = "";

    var W = 800, H = 300, GROUND = 262;
    var rand = mulberry(20260705);

    // yıldızlar
    for (var i = 0; i < 40; i++) {
      var star = svgEl("circle", {
        cx: (rand() * W).toFixed(1),
        cy: (rand() * (GROUND - 60)).toFixed(1),
        r: (0.6 + rand() * 1.2).toFixed(2),
        fill: "#D9BA79",
        "class": "star"
      });
      star.style.animationDelay = (rand() * 5).toFixed(2) + "s";
      svg.appendChild(star);
    }

    // zemin
    svg.appendChild(svgEl("line", {
      x1: 0, y1: GROUND, x2: W, y2: GROUND,
      stroke: "rgba(156,199,155,0.35)", "stroke-width": 1.5
    }));

    var stories = state.stories;
    els.gardenEmpty.classList.toggle("hidden", stories.length > 0);
    if (!stories.length) return;

    var gap = W / (stories.length + 1);
    var positions = stories.map(function (s, idx) {
      var st = strength(s);
      return {
        x: gap * (idx + 1),
        topY: GROUND - (70 + st * 130), // sap boyu tekrarla uzar
        strength: st,
        story: s
      };
    });

    // sinaps kavisleri — komşu hikâyeler arasında, güçlendikçe kalınlaşır
    for (var j = 0; j < positions.length - 1; j++) {
      var a = positions[j], b = positions[j + 1];
      var combined = (a.strength + b.strength) / 2;
      var midX = (a.x + b.x) / 2;
      var midY = Math.min(a.topY, b.topY) - 30 - combined * 25;
      svg.appendChild(svgEl("path", {
        d: "M " + a.x + " " + a.topY + " Q " + midX + " " + midY + " " + b.x + " " + b.topY,
        fill: "none",
        stroke: "rgba(217,186,121," + (0.15 + combined * 0.55).toFixed(2) + ")",
        "stroke-width": (0.8 + combined * 3).toFixed(2),
        "stroke-linecap": "round"
      }));
    }

    positions.forEach(function (p) {
      var g = svgEl("g", {});
      var title = svgEl("title", {});
      title.textContent = p.story.newText + " (" + p.story.repeats.length + " tekrar)";
      g.appendChild(title);

      // sap — hafif kavisli
      var sway = (mulberry(hashCode(p.story.id))() - 0.5) * 30;
      g.appendChild(svgEl("path", {
        d: "M " + p.x + " " + GROUND + " Q " + (p.x + sway) + " " + ((GROUND + p.topY) / 2) + " " + p.x + " " + p.topY,
        fill: "none",
        stroke: "#9CC79B",
        "stroke-width": (1.5 + p.strength * 2).toFixed(2),
        "stroke-linecap": "round"
      }));

      // yapraklar
      var leafY = GROUND - (GROUND - p.topY) * 0.45;
      g.appendChild(svgEl("ellipse", {
        cx: p.x - 8, cy: leafY, rx: 8, ry: 3.2,
        fill: "rgba(156,199,155,0.8)",
        transform: "rotate(-28 " + (p.x - 8) + " " + leafY + ")"
      }));
      g.appendChild(svgEl("ellipse", {
        cx: p.x + 8, cy: leafY + 12, rx: 7, ry: 3,
        fill: "rgba(156,199,155,0.65)",
        transform: "rotate(24 " + (p.x + 8) + " " + (leafY + 12) + ")"
      }));

      // altın çiçek — tekrar sayısıyla büyür; ışıma bugünkü ateşlemede daha parlak
      var flowerR = 4 + p.strength * 12;
      var glow = svgEl("circle", {
        cx: p.x, cy: p.topY, r: (flowerR * 2.2).toFixed(1),
        fill: "rgba(217,186,121," + (repeatedToday(p.story) ? 0.30 : 0.12) + ")",
        "class": "flower-glow"
      });
      glow.style.animationDelay = (p.x % 4) + "s";
      g.appendChild(glow);
      g.appendChild(svgEl("circle", {
        cx: p.x, cy: p.topY, r: flowerR.toFixed(1), fill: "#D9BA79"
      }));
      g.appendChild(svgEl("circle", {
        cx: p.x, cy: p.topY, r: Math.max(1.4, flowerR * 0.35).toFixed(1), fill: "#0D0A1C"
      }));

      svg.appendChild(g);
    });
  }

  function hashCode(str) {
    var h = 0;
    for (var i = 0; i < str.length; i++) h = (Math.imul(31, h) + str.charCodeAt(i)) | 0;
    return h;
  }

  /* ---------- hikâye kartları ---------- */

  function renderStories() {
    els.stories.innerHTML = "";

    state.stories.forEach(function (story) {
      var card = document.createElement("article");
      card.className = "story-card";

      var release = document.createElement("button");
      release.className = "btn-release";
      release.title = "Bu hikâyeyi serbest bırak";
      release.setAttribute("aria-label", "Hikâyeyi serbest bırak");
      release.textContent = "✕";
      release.addEventListener("click", function () { releaseStory(story.id); });

      var oldP = document.createElement("p");
      oldP.className = "story-old";
      oldP.textContent = story.oldText;

      var newP = document.createElement("p");
      newP.className = "story-new";
      newP.textContent = story.newText;

      var meta = document.createElement("div");
      meta.className = "story-meta";

      var stats = document.createElement("span");
      stats.className = "story-stats";
      stats.textContent = "✨ " + story.repeats.length + " tekrar · dikildi " + story.plantedOn;

      var btn = document.createElement("button");
      var done = repeatedToday(story);
      btn.className = "btn btn-repeat" + (done ? " done" : "");
      btn.disabled = done;
      btn.textContent = done ? "✓ Bugün ateşlendi" : "⚡ Bugün tekrarla";
      if (!done) btn.addEventListener("click", function () { openRepeatModal(story.id); });

      meta.appendChild(stats);
      meta.appendChild(btn);
      card.appendChild(release);
      card.appendChild(oldP);
      card.appendChild(newP);
      card.appendChild(meta);
      els.stories.appendChild(card);
    });
  }

  /* ---------- eylemler ---------- */

  function plantStory(oldText, newText) {
    state.stories.push({
      id: "s-" + Date.now() + "-" + Math.random().toString(36).slice(2, 8),
      oldText: oldText,
      newText: newText,
      plantedOn: todayStr(),
      repeats: []
    });
    save();
    renderAll();
  }

  function releaseStory(id) {
    var story = state.stories.find(function (s) { return s.id === id; });
    if (!story) return;
    if (!confirm("Bu hikâyeyi serbest bırakmak istiyor musun?\n\n“" + story.newText + "”\n\nBahçenden kalkacak.")) return;
    state.stories = state.stories.filter(function (s) { return s.id !== id; });
    save();
    renderAll();
  }

  var pendingRepeatId = null;

  function openRepeatModal(id) {
    var story = state.stories.find(function (s) { return s.id === id; });
    if (!story || repeatedToday(story)) return;
    pendingRepeatId = id;
    els.modalStory.textContent = "“" + story.newText + "”";
    els.modal.classList.remove("hidden");
    els.btnRepeatConfirm.focus();
  }

  function closeRepeatModal() {
    pendingRepeatId = null;
    els.modal.classList.add("hidden");
  }

  function confirmRepeat() {
    var story = state.stories.find(function (s) { return s.id === pendingRepeatId; });
    closeRepeatModal();
    if (!story || repeatedToday(story)) return;
    story.repeats.push(todayStr());
    save();
    renderAll();
    // ateşleme geri bildirimi: kartı kısa süre parlat
    var cards = els.stories.querySelectorAll(".story-card");
    var idx = state.stories.indexOf(story);
    if (cards[idx]) {
      cards[idx].classList.add("just-fired");
      setTimeout(function () { cards[idx].classList.remove("just-fired"); }, 1600);
    }
  }

  /* ---------- form ---------- */

  function toggleForm(show) {
    els.form.classList.toggle("hidden", !show);
    els.btnNewStory.classList.toggle("hidden", show);
    if (show) els.oldStory.focus();
  }

  els.btnNewStory.addEventListener("click", function () { toggleForm(true); });
  els.btnCancel.addEventListener("click", function () {
    els.form.reset();
    toggleForm(false);
  });

  els.form.addEventListener("submit", function (e) {
    e.preventDefault();
    var oldText = els.oldStory.value.trim();
    var newText = els.newStory.value.trim();
    if (!oldText || !newText) return;
    plantStory(oldText, newText);
    els.form.reset();
    toggleForm(false);
  });

  /* ---------- modal olayları ---------- */

  els.btnRepeatCancel.addEventListener("click", closeRepeatModal);
  els.btnRepeatConfirm.addEventListener("click", confirmRepeat);
  els.modal.addEventListener("click", function (e) {
    if (e.target === els.modal) closeRepeatModal();
  });
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && !els.modal.classList.contains("hidden")) closeRepeatModal();
  });

  /* ---------- render ---------- */

  function renderAll() {
    els.streakCount.textContent = computeStreak();
    renderGarden();
    renderStories();
  }

  /* ---------- gün rollover (yerel gece yarısı) ----------
   * Sayfa açıkken etkileşim beklemeden: "Bugün ateşlendi" kilitleri açılır,
   * seri ve çiçek ışıması yeni güne göre güncellenir.
   * Arka planda timer throttle olursa visibility/focus ile yakalanır. */

  var knownDay = todayStr();
  var dayTimer = null;

  function msUntilNextLocalMidnight() {
    var now = new Date();
    var next = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
    return Math.max(0, next.getTime() - now.getTime());
  }

  function onDayChange() {
    knownDay = todayStr();
    renderAll();
    scheduleDayRollover();
  }

  function scheduleDayRollover() {
    if (dayTimer) clearTimeout(dayTimer);
    // Gece yarısından biraz sonra ateşle — sınırda erken tetiklenmeyi önler.
    var delay = msUntilNextLocalMidnight() + 50;
    dayTimer = setTimeout(function () {
      if (todayStr() !== knownDay) onDayChange();
      else scheduleDayRollover();
    }, delay);
  }

  function checkDayRollover() {
    if (todayStr() !== knownDay) onDayChange();
  }

  document.addEventListener("visibilitychange", function () {
    if (document.visibilityState === "visible") checkDayRollover();
  });
  window.addEventListener("focus", checkDayRollover);

  /* ---------- PWA: service worker + install tip ---------- */

  var deferredPrompt = null;
  var installTip = $("install-tip");
  var installMsg = $("install-msg");
  var btnInstall = $("btn-install");
  var btnInstallClose = $("btn-install-close");
  var standalone =
    (window.matchMedia && window.matchMedia("(display-mode: standalone)").matches) ||
    navigator.standalone === true;
  var installDismissed = false;
  try { installDismissed = !!localStorage.getItem("rewire-install-dismissed"); } catch (e) {}
  var isIOS = /iphone|ipad|ipod/i.test(navigator.userAgent || "");

  function showInstallTip() {
    if (!installTip || standalone || installDismissed) return;
    installTip.classList.remove("hidden");
  }

  if (isIOS) {
    if (installMsg) {
      installMsg.textContent = "Yüklemek için: Paylaş düğmesine, sonra “Ana Ekrana Ekle”ye dokun.";
    }
    if (btnInstall) btnInstall.classList.add("hidden");
    showInstallTip();
  }

  window.addEventListener("beforeinstallprompt", function (e) {
    e.preventDefault();
    deferredPrompt = e;
    if (btnInstall) btnInstall.classList.remove("hidden");
    if (installMsg) {
      installMsg.textContent = "Tam uygulama deneyimi için rewire’ı ana ekranına ekle.";
    }
    showInstallTip();
  });

  if (btnInstall) {
    btnInstall.addEventListener("click", function () {
      if (!deferredPrompt) return;
      deferredPrompt.prompt();
      deferredPrompt.userChoice.then(function () {
        deferredPrompt = null;
        if (installTip) installTip.classList.add("hidden");
      });
    });
  }

  if (btnInstallClose) {
    btnInstallClose.addEventListener("click", function () {
      if (installTip) installTip.classList.add("hidden");
      try { localStorage.setItem("rewire-install-dismissed", "1"); } catch (e) {}
      installDismissed = true;
    });
  }

  if ("serviceWorker" in navigator) {
    navigator.serviceWorker.register("./sw.js").catch(function () { /* offline register fail ok */ });
  }

  renderScienceNote();
  renderAll();
  scheduleDayRollover();
})();
