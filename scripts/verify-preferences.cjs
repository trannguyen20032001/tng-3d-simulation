const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");

const source = fs.readFileSync(
  path.join(__dirname, "../src/features/preferences.js"), "utf8",
);
const modeIds = ["mT1", "mT2", "mBoth"];
for (const mode of modeIds) {
  for (const split of [false, true]) {
    const elements = new Map();
    const storageKey = "tng-viet-duc-3d:toolbar-v1";
    let stored = JSON.stringify({ [mode]: true, mSplit: split });
    let saveOnClick;
    const selectMode = (id) => {
      modeIds.forEach((modeId) => { element(modeId).pressed = modeId === id; });
    };
    const element = (id) => {
      if (!elements.has(id)) elements.set(id, {
        pressed: id === "mBoth" || id === "vPersp",
        classList: { contains: () => false },
        getAttribute() { return String(this.pressed); },
        click() {
          if (modeIds.includes(id)) selectMode(id);
          else {
            this.pressed = !this.pressed;
            if (id === "mSplit" && this.pressed) selectMode("mBoth");
          }
          saveOnClick?.();
        },
      });
      return elements.get(id);
    };
    const context = {
      TNG: { features: {} },
      document: {
        getElementById: element,
        querySelector: element,
        addEventListener: (_, handler) => { saveOnClick = handler; },
      },
      window: { addEventListener() {} },
      localStorage: {
        getItem: (key) => { assert.equal(key, storageKey); return stored; },
        setItem: (key, value) => { assert.equal(key, storageKey); stored = value; },
      },
      queueMicrotask: (callback) => callback(),
    };
    vm.runInNewContext(source, context);
    context.TNG.features.restorePreferences();
    assert.equal(element(mode).pressed, true);
    assert.equal(element("mSplit").pressed, split);
    for (const selected of modeIds) {
      element(selected).click();
      const saved = JSON.parse(stored);
      modeIds.forEach((id) => assert.equal(saved[id], id === selected));
    }
  }
}
console.log("PASS: all floor choices save and restore with split mode on or off.");
