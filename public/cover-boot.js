/* Grid Pop cover — vanilla, not owned by React (hydrate must not restore it). */
(function () {
  try {
    var TYPES = [
      "pointerdown",
      "pointerup",
      "click",
      "touchstart",
      "touchend",
      "mousedown",
      "mouseup",
    ];

    function hideNode() {
      var el = document.getElementById("gp-boot-cover");
      if (el && el.parentNode) el.parentNode.removeChild(el);
      try {
        document.documentElement.classList.add("gp-cover-off");
        document.documentElement.setAttribute("data-gp-cover", "off");
      } catch (e0) {}
    }

    function skip() {
      var first = !window.__GP_COVER || window.__GP_COVER.on !== false;
      if (window.__GP_COVER) window.__GP_COVER.on = false;
      hideNode();
      if (!first) return;
      for (var i = 0; i < TYPES.length; i++) {
        document.removeEventListener(TYPES[i], onPtr, true);
        window.removeEventListener(TYPES[i], onPtr, true);
      }
      document.removeEventListener("keydown", onKey, true);
      try {
        window.dispatchEvent(new Event("gp-cover-skip"));
      } catch (e1) {}
    }

    function hitsCover(e) {
      var cover = document.getElementById("gp-boot-cover");
      if (!cover) return false;
      var t = e && e.target;
      if (t && (t === cover || (t.nodeType === 1 && cover.contains(t)))) return true;
      if (e && typeof e.clientX === "number" && typeof e.clientY === "number") {
        try {
          var top = document.elementFromPoint(e.clientX, e.clientY);
          if (top && (top === cover || cover.contains(top))) return true;
        } catch (e2) {}
        return false;
      }
      return true;
    }

    function onPtr(e) {
      if (!hitsCover(e)) return;
      skip();
    }
    function onKey(e) {
      var k = e && (e.key || e.code);
      if (k === "Enter" || k === " " || k === "Spacebar" || k === "Space") skip();
    }

    function paint() {
      if (window.__GP_COVER && window.__GP_COVER.on === false) return;
      if (document.getElementById("gp-boot-cover")) return;
      var host = document.body;
      if (!host) return;
      var btn = document.createElement("button");
      btn.id = "gp-boot-cover";
      btn.type = "button";
      btn.className = "gp-boot-cover";
      btn.setAttribute("aria-label", "輕觸進入");
      var img = document.createElement("img");
      img.className = "gp-cover gp-splash-logo";
      img.src = "/cover.png?v=5";
      img.alt = "";
      img.width = 1430;
      img.height = 875;
      img.draggable = false;
      var hint = document.createElement("p");
      hint.className = "gp-splash-hint is-on";
      hint.textContent = "輕觸進入";
      btn.appendChild(img);
      btn.appendChild(hint);
      btn.addEventListener("pointerdown", onPtr);
      btn.addEventListener("click", onPtr);
      host.appendChild(btn);
    }

    if (!window.__GP_COVER) {
      window.__GP_COVER = { on: true, skip: skip };
      for (var j = 0; j < TYPES.length; j++) {
        document.addEventListener(TYPES[j], onPtr, true);
        window.addEventListener(TYPES[j], onPtr, true);
      }
      document.addEventListener("keydown", onKey, true);
    } else {
      window.__GP_COVER.skip = skip;
    }

    if (document.body) paint();
    else document.addEventListener("DOMContentLoaded", paint);
  } catch (err) {}
})();
