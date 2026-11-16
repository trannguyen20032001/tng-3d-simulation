(function () {
  "use strict";

  TNG.features.restorePreferences = function restorePreferences() {
    const storageKey = "tng-viet-duc-3d:toolbar-v1";
    const viewIds = ["vExt", "vPersp", "vTop"];
    const modeIds = ["mT1", "mT2", "mBoth"];
    const panels = [
      { key: "panelCollapsed", id: "panel", className: "collapsed", toggle: "toggleList" },
      { key: "toolbarCollapsed", selector: ".toolbar", className: "is-collapsed",
        toggle: "toggleToolbar" },
    ];
    const panelElement = (panel) => panel.id ? document.getElementById(panel.id) :
      document.querySelector(panel.selector);
    const toggleIds = [
      "tFlow", "tLabels", "tWalls", "tTrees", "tSpin", "tMotion", "tQuality",
      "mSplit", "tCeil2", "tArea", "tAgv", "tAgvRoutes", "tEnvSensors", "tSewingBalance",
    ];
    const isPressed = (id) =>
      document.getElementById(id)?.getAttribute("aria-pressed") === "true";
    const save = () => {
      try {
        const ids = [...new Set([...viewIds, ...modeIds, ...toggleIds])];
        const state = Object.fromEntries(
          ids.filter((id) => document.getElementById(id)).map((id) => [id, isPressed(id)]),
        );
        panels.forEach((panel) => {
          state[panel.key] = panelElement(panel).classList.contains(panel.className);
        });
        localStorage.setItem(storageKey, JSON.stringify(state));
      } catch (_) {
        // LocalStorage có thể bị chặn trong cửa sổ riêng tư hoặc sandbox.
      }
    };
    let saved;
    try {
      saved = JSON.parse(localStorage.getItem(storageKey) || "null");
    } catch (_) {
      saved = null;
    }
    if (saved && typeof saved === "object") {
      const restoreChoice = (ids) => {
        const selected = ids.find((id) => saved[id] === true);
        if (selected && !isPressed(selected)) document.getElementById(selected).click();
      };
      restoreChoice(viewIds);
      restoreChoice(modeIds);
      toggleIds.forEach((id) => {
        if (typeof saved[id] === "boolean" && saved[id] !== isPressed(id)) {
          document.getElementById(id)?.click();
        }
      });
      panels.forEach((panel) => {
        if (typeof saved[panel.key] === "boolean" &&
          saved[panel.key] !== panelElement(panel).classList.contains(panel.className)) {
          document.getElementById(panel.toggle).click();
        }
      });
    }
    document.addEventListener("click", () => queueMicrotask(save));
    window.addEventListener("beforeunload", save);
    save();
  };
})();
