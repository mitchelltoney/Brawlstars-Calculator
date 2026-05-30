// Slow-load-only loading overlay.
//
// The overlay is *never* shown on fast or warm-cache loads — we only reveal it
// if the page hasn't fully loaded by REVEAL_DELAY_MS, and once revealed we
// hold it for at least MIN_VISIBLE_MS so it never flickers. HARD_TIMEOUT_MS
// is an unconditional safety dismiss in case an asset hangs.
//
// "Loaded" here means the window 'load' event, which waits for all referenced
// images (icon PNGs) and fonts — exactly the cold-cache cost we want to mask.
//
// Tune the three constants below if the loader appears too eagerly / too late.
(function () {
  "use strict";

  var REVEAL_DELAY_MS = 400;
  var MIN_VISIBLE_MS  = 400;
  var HARD_TIMEOUT_MS = 10000;

  var overlay   = null;
  var shownAt   = 0;
  var revealed  = false;
  var ready     = false;
  var dismissed = false;

  function makeOverlay() {
    var el = document.createElement("div");
    el.id = "loading-screen";
    el.setAttribute("role", "presentation");
    el.setAttribute("aria-hidden", "true");
    var img = document.createElement("img");
    img.src = "loading_chester.png";
    img.alt = "";
    el.appendChild(img);
    return el;
  }

  function tryReveal() {
    if (revealed || dismissed || ready) return;
    if (!document.body) return; // retried on DOMContentLoaded below
    if (!overlay) overlay = makeOverlay();
    if (!overlay.isConnected) document.body.appendChild(overlay);
    // Force a frame so the CSS transition runs from opacity:0 → 1.
    overlay.getBoundingClientRect();
    overlay.classList.add("visible");
    shownAt = performance.now();
    revealed = true;
  }

  function removeOverlay() {
    if (overlay && overlay.parentNode) overlay.parentNode.removeChild(overlay);
  }

  function dismiss() {
    if (dismissed) return;
    dismissed = true;
    if (!revealed) {
      removeOverlay();
      return;
    }
    var elapsed = performance.now() - shownAt;
    var wait = Math.max(0, MIN_VISIBLE_MS - elapsed);
    setTimeout(function () {
      overlay.classList.add("fading");
      overlay.addEventListener("transitionend", removeOverlay, { once: true });
      // Fallback in case transitionend never fires.
      setTimeout(removeOverlay, 500);
    }, wait);
  }

  function onReady() {
    ready = true;
    dismiss();
  }

  // Reveal at REVEAL_DELAY_MS unless we're already done.
  setTimeout(function () {
    if (!ready) tryReveal();
  }, REVEAL_DELAY_MS);

  // Absolute safety net.
  setTimeout(dismiss, HARD_TIMEOUT_MS);

  // The "ready" signal: window 'load' (icons + fonts loaded).
  if (document.readyState === "complete") {
    onReady();
  } else {
    window.addEventListener("load", onReady, { once: true });
  }

  // If REVEAL fired before <body> existed (very slow HTML), retry once body lands.
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", function () {
      if (!ready && !revealed && performance.now() >= REVEAL_DELAY_MS) {
        tryReveal();
      }
    }, { once: true });
  }
})();
