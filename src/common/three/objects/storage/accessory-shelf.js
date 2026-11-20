(function () {
  "use strict";
  TNG.components.accShelf = function createAccShelf({
    box,
    X,
    Z,
    M,
    rnd,
    pick,
    accGoods,
    cartonC,
    crate,
  }) {
    function accShelf(x, y, w, h) {
      const L = M(w),
        D = M(h),
        x0 = X(x),
        z0 = Z(y),
        H = 2.6,
        lv = [0.1, 0.62, 1.14, 1.66, 2.18, 2.58];
      const bays = Math.max(1, Math.round(L / 1.8)),
        bw = L / bays;
      for (let i = 0; i <= bays; i++)
        for (const v of [0.03, D - 0.03])
          box("galv", x0 + i * bw, H / 2, z0 + v, 0.07, H, 0.07);
      for (const ly of lv)
        box("galvShelf", x0 + L / 2, ly, z0 + D / 2, L, 0.035, D);
      for (let i = 0; i < bays; i++)
        for (let li = 0; li < lv.length - 1; li++) {
          if (rnd() < 0.1) continue;
          const n = 2 + Math.floor(rnd() * 2);
          for (let j = 0; j < n; j++) {
            const cx = x0 + i * bw + (bw * (j + 0.5)) / n,
              cw = bw / n - 0.06;
            if (li === 0 && rnd() < 0.45) {
              crate(cx, z0 + D / 2, lv[0] + 0.02, 0x1f5fd6);
              continue;
            }
            const isBox = rnd() < 0.55,
              hh = isBox ? 0.3 + rnd() * 0.15 : 0.22 + rnd() * 0.22;
            box(
              isBox ? "carton" : "bag",
              cx,
              lv[li] + 0.02 + hh / 2,
              z0 + D / 2,
              cw,
              hh,
              D * 0.86,
              isBox ? pick(cartonC) : pick(accGoods),
            );
          }
        }
    }
    return accShelf;
  };
})();
