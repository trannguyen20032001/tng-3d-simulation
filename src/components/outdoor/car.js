(function () {
  "use strict";
  TNG.components.car = function createCar({ box, cyl, pick, carC }) {
    function car(x, z, alongX, c, type, dir) {
      c = c == null ? pick(carC) : c;
      type = type || pick(["sedan", "sedan", "suv", "pickup"]);
      const f = dir || 1;
      const P = (u, v) => (alongX ? [x + u * f, z + v] : [x + v, z + u * f]),
        S = (su, sv) => (alongX ? [su, sv] : [sv, su]);
      const L = type === "pickup" ? 5.2 : type === "suv" ? 4.6 : 4.5,
        W = type === "suv" ? 1.9 : 1.8,
        hb = type === "suv" ? 0.78 : 0.62;
      const put = (k, u, y, v, su, sy, sv, col) => {
        const [px, pz] = P(u, v),
          [sx, sz] = S(su, sv);
        box(k, px, y, pz, sx, sy, sz, col);
      };
      put("car", 0, 0.28 + hb / 2, 0, L, hb, W, c); // thân xe
      const cu = type === "pickup" ? 0.45 : -0.15,
        cl = type === "pickup" ? 1.9 : type === "suv" ? 2.7 : 2.2,
        ch = type === "suv" ? 0.62 : 0.5;
      put("glassDark", cu, 0.28 + hb + ch / 2, 0, cl, ch, W * 0.9, 0x1d2630); // cabin kính
      put("car", cu, 0.28 + hb + ch + 0.04, 0, cl * 0.9, 0.08, W * 0.86, c); // nóc
      if (type === "pickup") {
        put("car", -1.55, 0.28 + hb + 0.14, 0, 1.8, 0.28, W, c);
        put("tire", -1.55, 0.28 + hb + 0.02, 0, 1.6, 0.05, W * 0.86, 0x2b2f36);
      }
      for (const u of [L * 0.32, -L * 0.32])
        for (const v of [-1, 1]) {
          const [px, pz] = P(u, v * (W / 2 - 0.02));
          cyl("tire", px, 0.33, pz, 0.33, 0.26, alongX ? "z" : "x", 0x16181b);
        }
      for (const v of [-1, 1]) {
        put("light", L / 2, 0.6, v * 0.6, 0.04, 0.12, 0.3, 0xfff4c8);
        put("light", -L / 2, 0.6, v * 0.6, 0.04, 0.12, 0.3, 0xc8202a);
      }
    }
    return car;
  };
})();
