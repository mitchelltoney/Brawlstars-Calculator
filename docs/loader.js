// Spinning-Chester loading overlay.
//
// The #loading-screen element is in each page's HTML and is visible from
// first paint. This script simply fades it out as soon as the window 'load'
// event fires (all icon PNGs + fonts in). On warm-cache loads that's near
// instant, so Chester only flickers briefly; on slow loads he spins until
// the assets settle.
//
// HARD_TIMEOUT_MS is a safety dismiss in case a single asset hangs.
(function () {
  "use strict";

  var HARD_TIMEOUT_MS = 10000;

  function dismiss() {
    var el = document.getElementById("loading-screen");
    if (!el) return;
    if (el.classList.contains("fading")) return;
    el.classList.add("fading");
    var remove = function () {
      if (el.parentNode) el.parentNode.removeChild(el);
    };
    el.addEventListener("transitionend", remove, { once: true });
    // Fallback if transitionend never fires.
    setTimeout(remove, 500);
  }

  if (document.readyState === "complete") {
    dismiss();
  } else {
    window.addEventListener("load", dismiss, { once: true });
  }

  setTimeout(dismiss, HARD_TIMEOUT_MS);
})();
