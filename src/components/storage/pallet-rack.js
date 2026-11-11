(function () {
  "use strict";
  TNG.components.palletRack = function createPalletRack({
    box,
    cyl,
    X,
    Z,
    M,
    rnd,
    pick,
    fabricBags,
    cartonC,
  }) {
    function palletRack(x, y, w, h, load) {
      const alongX = w >= h,
        L = M(alongX ? w : h),
        D = M(alongX ? h : w);
      const x0 = X(x),
        z0 = Z(y);
      const P = (u, v) => (alongX ? [x0 + u, z0 + v] : [x0 + v, z0 + u]);
      const S = (su, sv) => (alongX ? [su, sv] : [sv, su]);
      const bays = Math.max(1, Math.round(L / 2.75)),
        bw = L / bays;
      const levels = [0.12, 1.45, 2.8, 4.15],
        H = 5.2;
      for (let i = 0; i <= bays; i++) {
        for (const v of [0.04, D - 0.04]) {
          const [px, pz] = P(i * bw, v);
          box("rackBlue", px, H / 2, pz, 0.09, H, 0.09);
        }
      }
      for (const ly of levels.slice(1)) {
        for (const v of [0.04, D - 0.04]) {
          const [px, pz] = P(L / 2, v);
          const [sx, sz] = S(L, 0.06);
          box("beam", px, ly, pz, sx, 0.13, sz);
        }
      }
      for (let i = 0; i < bays; i++) {
        for (let li = 0; li < levels.length; li++) {
          if (rnd() < 0.08) continue;
          const by = levels[li] + 0.08;
          if (load === "rolls") {
            const n = 5,
              r = Math.min(0.25, bw / (2 * n) - 0.01),
              len = D * 0.92,
              st = rnd() < 0.75 ? 2 : 1;
            for (let s = 0; s < st; s++)
              for (let j = 0; j < n; j++) {
                if (rnd() < 0.06) continue;
                const [px, pz] = P(i * bw + (bw * (j + 0.5)) / n, D / 2);
                cyl(
                  "roll",
                  px,
                  by + r + s * 2 * r * 0.92,
                  pz,
                  r,
                  len,
                  alongX ? "z" : "x",
                  pick(fabricBags),
                );
              }
          } else {
            // cartons + white bundles (kho thành phẩm)
            const n = 3,
              cw = bw / n - 0.08;
            for (let j = 0; j < n; j++) {
              const [px, pz] = P(i * bw + (bw * (j + 0.5)) / n, D / 2);
              const [sx, sz] = S(cw, D * 0.9);
              if (rnd() < 0.3) {
                box(
                  "bag",
                  px,
                  by + 0.42,
                  pz,
                  sx,
                  0.84,
                  sz,
                  pick([0xa9b3be, 0x96a2b0, 0x7f8ea0, 0x22345e]),
                );
              } else {
                const hh = 0.5 + rnd() * 0.55;
                box("carton", px, by + hh / 2, pz, sx, hh, sz, pick(cartonC));
              }
            }
          }
        }
      }
    }
    return palletRack;
  };
})();
