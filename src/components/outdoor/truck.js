(function () {
  "use strict";
  TNG.components.truck = function createTruck({ box, cyl }) {
    function truck(x, z, alongX, cab) {
      const L = 11,
        W = 2.5,
        o = L / 2 + 1.3,
        P = (u, v) => (alongX ? [x + u, z + v] : [x + v, z + u]),
        S = (su, sv) => (alongX ? [su, sv] : [sv, su]);
      const put = (k, u, y, v, su, sy, sv, col) => {
        const [px, pz] = P(u, v),
          [sx, sz] = S(su, sv);
        box(k, px, y, pz, sx, sy, sz, col);
      };
      put("car", 0, 2.15, 0, L, 2.6, W, 0xf4f5f6); // thùng container
      put("tire", 0, 0.72, 0, L + 2.6, 0.3, W * 0.7, 0x2b2f36); // khung gầm
      put("car", o, 1.55, 0, 2.4, 2.1, W, cab || 0xf5c400); // cabin
      put("car", o + 0.3, 2.75, 0, 1.6, 0.2, W * 0.9, cab || 0xf5c400); // nóc cabin
      put("glassDark", o + 1.21, 2.0, 0, 0.04, 0.95, W * 0.85, 0x223040); // kính chắn gió
      put("light", o + 1.22, 0.95, 0.75, 0.05, 0.2, 0.3, 0xfff4c8);
      put("light", o + 1.22, 0.95, -0.75, 0.05, 0.2, 0.3, 0xfff4c8);
      for (const u of [-L / 2 + 1.2, -L / 2 + 2.5, o - 0.4])
        for (const v of [-1, 1]) {
          const [px, pz] = P(u, v * (W / 2 - 0.05));
          cyl("tire", px, 0.5, pz, 0.5, 0.4, alongX ? "z" : "x", 0x16181b);
        }
    }
    return truck;
  };
})();
