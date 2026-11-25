/* Wedding invitation. All wording lives in content/details.txt, edit that file. */
(function(){
function start(text, rsvpSrc){
const $ = id => document.getElementById(id);
const nb = s => s.replace(/(\d) (am|pm)\b/gi, "$1\u00A0$2");   // keep "7:00 am" together when text wraps
const esc = s => String(s).replace(/[&<>"]/g, c => ({ "&":"&amp;", "<":"&lt;", ">":"&gt;", '"':"&quot;" }[c]));

// ----- Read details.txt (label: value lines, plus "- a | b | c" lists) -----
function parse(src){
  const out = { schedule: [], places: [], fields: [], columns: [], info: [] }; let section = "";
  src.split(/\r?\n/).forEach(raw => {
    const line = raw.trim();
    if (!line) return;
    if (line.startsWith("## ")){ section = line.slice(3).trim().toLowerCase(); return; }
    if (line.startsWith("#")) return;
    if (line.startsWith("- ") && out[section] instanceof Array){
      const p = line.slice(2).split("|").map(s => s.trim());
      if (section === "schedule") out.schedule.push({ time: p[0] || "", title: p[1] || "", note: p[2] || "" });
      else if (section === "places") out.places.push({ name: p[0] || "", address: p[1] || "", map: p[2] || "" });
      else out[section].push(p);
      return;
    }
    const i = line.indexOf(":");
    if (i > 0) out[line.slice(0, i).trim().toLowerCase()] = line.slice(i + 1).trim();
  });
  return out;
}
const T = parse(text);
const g = k => T[k] || "";
const C = { bgm: [g("bgm1"), g("bgm2")].filter(Boolean) };
const set = (id, v) => { const e = $(id); if (e) e.textContent = v; };

// ----- Fill the page -----
document.title = g("page title") || "Wedding invitation";
set("hint", g("intro hint"));
set("groom", g("groom")); set("andWord", g("and word")); set("bride", g("bride"));
set("context", g("context")); set("when", g("date"));
set("knotText", nb(g("tying the knot"))); set("muhurtham", nb(g("muhurtham"))); set("where", g("venue line"));
set("countHeading", g("countdown heading")); set("dayHeading", g("day heading"));
set("findHeading", g("find heading")); set("rsvpHeading", g("rsvp heading"));
set("yes", g("accept button")); set("no", g("decline button"));
set("closing", g("closing line")); set("footerText", g("footer"));
set("family", g("family line")); set("cue", g("scroll hint")); set("skip", g("skip text")); set("infoHeading", g("info heading"));
window.INVITE={groom:g("groom"),bride:g("bride"),family:g("family line"),context:g("context"),date:g("date"),knot:g("tying the knot"),muhurtham:g("muhurtham"),venue:g("venue line"),invite:g("card heading")};
window.dispatchEvent(new Event("invite:ready"));
$("infoList").innerHTML = T.info.map(p => '<li><strong>' + esc(p[0] || "") + '</strong><span>' + esc(p[1] || "") + '</span></li>').join("");
$("infoSection").hidden = !T.info.length;
set("rsvpText", (g("rsvp by") ? g("rsvp by sentence").replace("{date}", g("rsvp by")) + " " : "") + g("rsvp text"));
$("schedule").innerHTML = T.schedule.map(e =>
  '<li><time>' + esc(nb(e.time)) + '</time><div><strong>' + esc(e.title) + '</strong><small>' + esc(e.note) + '</small></div></li>').join("");
$("places").innerHTML = T.places.map(p =>
  '<div class="place"><p class="name">' + esc(p.name) + '</p><address>' + esc(p.address) + '</address>' +
  (p.map ? '<a class="btn" href="' + esc(p.map) + '" target="_blank" rel="noopener">' + esc(g("map button")) + '</a>' : '') + '</div>').join("");

// ----- Typewriter title on the first page (slow) -----
let introText = g("intro title"), typingDone = false;
const introEl = $("introLine");
function showIntro(t, n){
  introEl.innerHTML = '<span class="typed"></span><span class="rest"></span>';
  introEl.firstChild.textContent = t.slice(0, n); introEl.lastChild.textContent = t.slice(n);
}
(function typeIntro(){
  const speed = Math.max(30, parseInt(g("typing speed"), 10) || 170);
  const calm = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  let n = 0;
  showIntro(introText, calm ? introText.length : 0);
  if (calm){ typingDone = true; return; }
  setTimeout(function step(){
    n++; showIntro(introText, n);
    if (n < introText.length) setTimeout(step, speed);
    else { typingDone = true; setTimeout(() => introEl.classList.add("caret-off"), 1800); }
  }, 900);
})();

// ----- Golden sparkles around the "tying the knot" line -----
(function(){
  const box = $("knot"); if (!box) return;
  for (let i = 0; i < 16; i++){
    const s = document.createElement("i"); s.className = "spark"; s.textContent = "✦"; s.setAttribute("aria-hidden", "true");
    s.style.left = (Math.random() * 108 - 4) + "%"; s.style.top = (Math.random() * 110 - 5) + "%";
    s.style.fontSize = (8 + Math.random() * 10).toFixed(1) + "px";
    s.style.setProperty("--d", (1.8 + Math.random() * 1.8).toFixed(2) + "s");
    s.style.setProperty("--w", (Math.random() * 3.2).toFixed(2) + "s");
    box.appendChild(s);
  }
})();

// ----- Countdown. When it reaches zero: "Just Married" (also replaces the first-page title) -----
const target = new Date(g("countdown ends")).getTime();
let married = false;
function tick(){
  if (!isFinite(target)) return false;
  const left = target - Date.now();
  if (left <= 0){
    if (!married){
      married = true;
      introText = g("just married"); if (typingDone) showIntro(introText, introText.length);
      // after the wedding: past-tense wording, no schedule, no RSVP form
      if (g("context after")) set("context", g("context after")); if (g("context after") && window.INVITE){ window.INVITE.context = g("context after"); window.dispatchEvent(new Event("invite:ready")); }
      $("dayHeading").parentElement.hidden = true;
      set("rsvpHeading", g("thank you heading")); set("rsvpText", g("thank you text"));
      $("rsvpFields").hidden = true; document.querySelector(".rsvp .row").hidden = true; $("note").hidden = true; document.querySelector(".rsvp").hidden = false;
      $("countHeading").hidden = true;
      $("count").innerHTML = '<p class="married">' + esc(g("just married")) + '</p>';
    }
    return false;
  }
  const d = Math.floor(left / 864e5), h = Math.floor(left % 864e5 / 36e5),
        m = Math.floor(left % 36e5 / 6e4), s = Math.floor(left % 6e4 / 1e3);
  $("count").innerHTML = [[d, g("label days")], [h, g("label hours")], [m, g("label minutes")], [s, g("label seconds")]]
    .map(p => '<div><b>' + String(p[0]).padStart(2, "0") + '</b><span>' + esc(p[1]) + '</span></div>').join("");
  return true;
}
if (tick()) { const t = setInterval(() => { if (!tick()) clearInterval(t); }, 1000); }

// ----- RSVP: saves to a Google Sheet and/or opens WhatsApp (settings in content/rsvp-config.txt) -----
const R = parse(rsvpSrc || "");
const rg = k => R[k] || "";
const appUrl = rg("web app url"), sheetLink = rg("sheet link");
let mode = (rg("rsvp mode") || "whatsapp").toLowerCase();
if (!appUrl) mode = "whatsapp";                       // sheet not connected yet
const useSheet = mode === "sheet" || mode === "both", useWa = mode !== "sheet";
const fields = R.fields.map(p => ({ key: p[0], label: p[1] || p[0], type: (p[2] || "text").toLowerCase(), required: /^req/i.test(p[3] || ""), ph: p[4] || "" })).filter(f => f.key);
if (!fields.length) fields.push({ key: "name", label: "Your name", type: "text", required: true, ph: "" });
$("rsvpFields").innerHTML = fields.map(f =>
  '<label><span>' + esc(f.label) + (f.required ? ' *' : '') + '</span>' +
  (f.type === "textarea" ? '<textarea' : '<input type="' + (["number","tel","email"].indexOf(f.type) > -1 ? f.type : "text") + '"') +
  ' data-key="' + esc(f.key) + '" placeholder="' + esc(f.ph) + '"' + (f.key === "name" ? ' autocomplete="name"' : '') + '>' +
  (f.type === "textarea" ? '</textarea>' : '') + '</label>').join("");
const readData = () => { const d = {}; document.querySelectorAll("#rsvpFields [data-key]").forEach(el => { d[el.dataset.key] = el.value.trim(); }); return d; };
function waHref(msgKey, d){
  const dd = Object.assign({}, d); if (!dd.name) dd.name = g("guest default");
  const m = g(msgKey).replace(/\{(\w+)\}/g, (x, k) => dd[k] !== undefined ? dd[k] : "");
  return "https://wa.me/" + g("whatsapp") + "?text=" + encodeURIComponent(m);
}
function sheetPayload(d, attending){
  const id = (sheetLink.match(/\/d\/([\w-]+)/) || [])[1] || "";
  const gid = (sheetLink.match(/[#&?]gid=(\d+)/) || [])[1];
  return {
    sheetId: id,
    tab: { name: rg("sheet tab name"), number: parseInt(rg("sheet number"), 10) || 0, gid: gid === undefined ? "" : gid },
    writeHeader: /^y/i.test(rg("write header")),
    columns: R.columns.map(p => ({ header: p[0] || "", value: p[1] || "" })),
    data: Object.assign({}, d, { attending: attending })
  };
}
let saved = false;
function wire(btn, attending, msgKey){
  if (!useWa){ btn.setAttribute("role", "button"); btn.tabIndex = 0;
    btn.addEventListener("keydown", e => { if (e.key === "Enter" || e.key === " "){ e.preventDefault(); btn.click(); } }); }
  btn.addEventListener("click", e => {
    const d = readData();
    const bad = fields.find(f => f.required && !d[f.key]);
    if (bad){ e.preventDefault(); $("note").textContent = g("required note"); const el = document.querySelector('#rsvpFields [data-key="' + bad.key + '"]'); if (el) el.focus(); return; }
    if (useWa) btn.href = waHref(msgKey, d);          // WhatsApp opens as the link is followed
    if (!useSheet){ $("note").textContent = g("thank you note"); return; }
    if (!useWa) e.preventDefault();
    if (saved){ $("note").textContent = g("already note"); return; }
    saved = true; $("note").textContent = g("sending note");
    fetch(appUrl, { method: "POST", mode: "no-cors", headers: { "Content-Type": "text/plain;charset=utf-8" },
                    body: JSON.stringify(sheetPayload(d, attending === "yes" ? rg("accept value") : rg("decline value"))) })
      .then(() => { $("note").textContent = g("saved note"); })
      .catch(() => { saved = false; $("note").textContent = g("save failed note"); });
  });
}
wire($("yes"), "yes", "whatsapp accept"); wire($("no"), "no", "whatsapp decline");
// keep the WhatsApp links filled in while the guest types, so they work on every phone
function refreshLinks(){ if (!useWa) return; const d = readData(); $("yes").href = waHref("whatsapp accept", d); $("no").href = waHref("whatsapp decline", d); }
$("rsvpFields").addEventListener("input", refreshLinks); refreshLinks();

// ===== Background music =====
// bgm1 plays once on the first page. When it ends the GIF stops on the hands-touching frame.
// One second after bgm1 ends the invitation opens by itself, and bgm2 starts (once).
const tracks = C.bgm.map(src => { const a = new Audio(src); a.preload = "auto"; a.volume = 0.8; return a; });
let stage = 0, pausedByTab = false, gifStarted = false;
const cur = () => tracks[Math.min(stage, tracks.length - 1)];
const introImg = document.querySelector("#intro .front img");
const showHint = () => {};   // the "tap for sound" hint is no longer shown; the first tap still starts the music quietly
function startGif(){ if (gifStarted) return; gifStarted = true; introImg.src = introImg.dataset.gif; }
function freezeGif(){ gifStarted = true; introImg.src = introImg.dataset.end; }   // hands-touching frame
new Image().src = introImg.dataset.gif;   // preload so it starts instantly
function fade(a, to, ms, then){
  const from = a.volume, t0 = performance.now();
  (function step(now){
    const p = Math.min(1, (now - t0) / ms);
    a.volume = Math.max(0, Math.min(1, from + (to - from) * p));
    if (p < 1) requestAnimationFrame(step); else if (then) then();
  })(t0);
}
function playStage(i){
  const a = tracks[i]; if (!a) return Promise.resolve();
  stage = i; a.currentTime = 0; a.volume = 0;
  return a.play().then(() => fade(a, 0.8, 1200));
}
if (tracks[0]) tracks[0].addEventListener("ended", () => { if (stage === 0){ freezeGif(); setTimeout(openInvitation, 1000); } });
if (tracks[0]) tracks[0].addEventListener("error", () => setTimeout(openInvitation, 3000));   // music file missing: open anyway

// Start bgm1 (and the GIF with it) as soon as the page loads. Browsers often block sound until the
// first tap, so then the GIF starts after a moment and the first tap (other than Open) starts the music.
// ----- Sound -----
// Browsers only allow music after a tap, so the first tap anywhere starts it, and a small speaker button turns it on/off.
let userOff = false, ended2 = false;
const snd = document.createElement("button"); snd.id = "sound"; snd.type = "button"; snd.setAttribute("aria-label", "Music on or off");
const SV = '<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">';
const ICON_ON = SV + '<path d="M4 9v6h4l5 4V5L8 9H4z"/><path d="M16 9a4 4 0 0 1 0 6M18.5 6.5a8 8 0 0 1 0 11"/></svg>';
const ICON_OFF = SV + '<path d="M4 9v6h4l5 4V5L8 9H4z"/><path d="M17 9l5 6M22 9l-5 6"/></svg>';
document.body.appendChild(snd);
const isOpen = () => !document.body.classList.contains("locked");
const active = () => isOpen() ? (tracks[1] || tracks[0]) : tracks[0];
function refreshSnd(){ const a = active(); const on = !!a && !a.paused; snd.dataset.on = on ? "1" : "0"; snd.dataset.user = userOff ? "1" : "0"; snd.innerHTML = on ? ICON_ON : ICON_OFF; snd.hidden = !tracks.length; }
tracks.forEach(a => ["play", "pause", "ended"].forEach(ev => a.addEventListener(ev, refreshSnd)));
if (tracks[1]) tracks[1].addEventListener("ended", () => { ended2 = true; });
const GEST = ["pointerdown", "touchend", "click", "keydown"];
function detach(){ GEST.forEach(n => document.removeEventListener(n, onGesture, true)); }
function tryPlay(){
  if (userOff || !tracks.length) return Promise.resolve();
  const a = active(); if (!a || !a.paused) return Promise.resolve();
  if (isOpen() ? ended2 : (stage === 0 && a.ended)) return Promise.resolve();
  return playStage(isOpen() ? Math.min(1, tracks.length - 1) : 0).then(() => { if (!isOpen()) startGif(); detach(); });
}
function onGesture(e){ if (e.target && e.target.closest && e.target.closest("#sound")) return; tryPlay().catch(() => {}); }
function armFirstGesture(){ GEST.forEach(n => document.addEventListener(n, onGesture, true)); }
snd.addEventListener("click", () => {
  const a = active(); if (!a) return;
  if (!a.paused){ userOff = true; fade(a, 0, 400, () => { a.pause(); refreshSnd(); }); }
  else { userOff = false; ended2 = false; playStage(isOpen() ? Math.min(1, tracks.length - 1) : 0).then(() => { if (!isOpen()) startGif(); }).catch(() => {}); }
  refreshSnd();
});
if (tracks.length){
  playStage(0).then(() => { showHint(false); startGif(); })
    .catch(() => { showHint(true); armFirstGesture(); setTimeout(startGif, 2500); });   // sound blocked: ask for a tap
} else { startGif(); }
armFirstGesture(); refreshSnd();

document.addEventListener("visibilitychange", () => {
  const a = cur(); if (!a) return;
  if (document.hidden && !a.paused){ a.pause(); pausedByTab = true; }
  else if (!document.hidden && pausedByTab){ pausedByTab = false; a.play().catch(() => {}); }
});

// Called when the invitation opens: bgm2 starts (bgm1 fades out if it is somehow still playing).
function switchToBgm2(){
  if (tracks.length < 2) return;
  const first = tracks[0];
  showHint(false);
  if (!first.paused) fade(first, 0, 900, () => first.pause());
  if (!userOff) playStage(1).catch(() => {});
}

// ===== Page turn: the cover is cut into thin strips that bend as the page lifts =====
const TURN_MS = 2200;   // quicker page turn
function turnPage(onDone){
  const intro = $("intro"), front = intro.querySelector(".front"), img = front.querySelector("img");
  const W = intro.clientWidth, H = intro.clientHeight, N = ((navigator.hardwareConcurrency || 8) <= 4 ? 24 : 40), h = H / N;
  let snap = null;   // still of the GIF frame on screen right now, so every strip matches
  try {
    const c = document.createElement("canvas"); c.width = img.naturalWidth; c.height = img.naturalHeight;
    c.getContext("2d").drawImage(img, 0, 0); snap = c.toDataURL("image/jpeg", 0.92);
  } catch (e) {}
  const leaf = document.createElement("div"); leaf.className = "pleaf"; leaf.setAttribute("aria-hidden", "true");
  const strips = []; let parent = leaf;
  for (let i = 0; i < N; i++){
    const s = document.createElement("div"); s.className = "pstrip";
    s.style.top = (i ? h : 0) + "px"; s.style.height = (h + 1) + "px";
    const face = document.createElement("div"); face.className = "pface";
    const clone = front.cloneNode(true);
    clone.querySelectorAll("[id]").forEach(e => e.removeAttribute("id"));
    clone.querySelectorAll("button").forEach(b => { b.tabIndex = -1; });
    Object.assign(clone.style, { inset: "auto", left: "0", top: (-i * h) + "px", width: W + "px", height: H + "px" });
    if (snap) clone.querySelector("img").src = snap;
    const fs = document.createElement("div"); fs.className = "psh";
    face.append(clone, fs);
    const back = document.createElement("div"); back.className = "pback";
    const bs = document.createElement("div"); bs.className = "psh"; back.append(bs);
    s.append(face, back); parent.append(s); parent = s; strips.push({ s, fs, bs });
  }
  intro.append(leaf); intro.classList.add("turning");
  const shade = $("shade"), t0 = performance.now();
  (function frame(now){
    const p = Math.min(1, (now - t0) / TURN_MS), e = 0.5 - 0.5 * Math.cos(Math.PI * p);
    const theta = 180 * e, bend = 62 * Math.sin(Math.PI * p);   // bend peaks mid-turn, flat at start and end
    let A = 0;
    strips.forEach((o, i) => {
      const a = theta / N + bend * (0.3 + 1.4 * i / (N - 1)) / N;   // free edge leads, hinge follows
      A += a; o.s.style.transform = "rotateX(" + a.toFixed(3) + "deg)";
      const dark = (0.55 * Math.abs(Math.sin(A * Math.PI / 180))).toFixed(3);
      o.fs.style.opacity = dark; o.bs.style.opacity = dark;
    });
    shade.style.opacity = (0.9 * Math.sin(Math.PI * p)).toFixed(3);
    if (p < 1) requestAnimationFrame(frame); else { leaf.remove(); onDone(); }
  })(t0);
}

// ===== Open the invitation (automatic), then scroll down to the details =====
let opened = false;
function openInvitation(){
  if (opened) return; opened = true;
  switchToBgm2();
  const calm0 = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const done = () => { $("intro").classList.add("gone"); $("shade").classList.add("gone"); };
  if (calm0) done(); else turnPage(done);
  document.body.classList.remove("locked");
  $("main").removeAttribute("aria-hidden");
  window.scrollTo(0, 0);
  const calm = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  // no auto-scroll any more: the guest stays on the card and scrolls down themselves
}

$("skip").addEventListener("click", openInvitation);
// If the music never starts (sound blocked and no tap), open the invitation anyway after a while
setTimeout(openInvitation, (parseFloat(g("auto open seconds")) || 6) * 1000);   // short intro: always opens by itself

}  // end start()

if (typeof window.DETAILS_TEXT === "string") start(window.DETAILS_TEXT, window.RSVP_TEXT || "");
else Promise.all([
  fetch("content/details.txt", { cache: "no-store" }).then(r => { if (!r.ok) throw new Error(r.status); return r.text(); }),
  fetch("content/rsvp-config.txt", { cache: "no-store" }).then(r => r.ok ? r.text() : "").catch(() => "")
]).then(a => start(a[0], a[1]))
  .catch(() => {
    document.body.insertAdjacentHTML("afterbegin",
      '<div style="position:fixed;inset:0;z-index:99;background:#000;color:#ece9e2;display:grid;place-items:center;padding:2rem;text-align:center;font:1rem/1.6 system-ui,sans-serif">' +
      '<p>Sorry, this invitation could not be loaded.<br>Please check your connection and open the link again.</p></div>');
  });
})();
