const fs = require("node:fs");
const vm = require("node:vm");
const assert = require("node:assert/strict");
const path = require("node:path");
const context = { TNG: { components: {} } };
vm.runInNewContext(fs.readFileSync(path.join(__dirname,
  "../src/common/three/objects/storage/pallet-rack.js"), "utf8"), context);
let highest = 0;
for (let seed = 1; seed <= 100; seed++) {
  let state = seed;
  const rnd = () => ((state = (state * 1664525 + 1013904223) >>> 0) / 4294967296);
  const rack = context.TNG.components.palletRack({
    box(key, x, y, z, width, height) { highest = Math.max(highest, y + height / 2); },
    cyl(key, x, y, z, radius) { highest = Math.max(highest, y + radius); },
    X: (value) => value / 1000,
    Z: (value) => value / 1000,
    M: (value) => value / 1000,
    rnd,
    pick: (values) => values[Math.floor(rnd() * values.length)],
    fabricBags: [0], cartonC: [0],
  });
  for (const load of ["rolls", "cartons"]) {
    rack(0, 0, 12000, 2000, load);
    rack(0, 0, 2000, 12000, load);
  }
}
assert.ok(highest < 4.3, `Rack or goods penetrate the upper slab: ${highest} m`);
console.log(`PASS: rack frames and goods stay below slab; highest point ${highest.toFixed(3)} m.`);
