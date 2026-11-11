(function () {
  "use strict";
  TNG.components.cutTable = function createCutTable({
    box,
    X,
    Z,
    M,
    C,
    rnd,
    pick,
  }) {
    function cutTable(x0, x1, yc, gantry) {
      const len = M(x1 - x0),
        cx = X((x0 + x1) / 2),
        cz = Z(yc),
        wd = 2.1;
      box("table", cx, 0.88, cz, len, 0.06, wd, C.table);
      for (let u = 0.4; u < len; u += 2.4) {
        for (const s of [-1, 1])
          box(
            "leg",
            X(x0) + u,
            0.43,
            cz + s * (wd / 2 - 0.1),
            0.07,
            0.86,
            0.07,
            C.leg,
          );
      }
      // spread lays
      let u = 1.0;
      while (u < len - 2) {
        const l = Math.min(len - 1 - u, 4 + rnd() * 7),
          hh = 0.05 + rnd() * 0.14,
          c = pick([
            0x1d2740, 0xb8322f, 0xe9e4d6, 0x9cc3e6, 0x3a4a5e, 0x6b7f5a,
            0x111418,
          ]);
        box("cloth", X(x0) + u + l / 2, 0.91 + hh / 2, cz, l, hh, wd * 0.85, c);
        box(
          "paper",
          X(x0) + u + l / 2,
          0.915 + hh,
          cz,
          l,
          0.004,
          wd * 0.86,
          0xf8f8f8,
        );
        u += l + 0.8 + rnd() * 2;
      }
      if (gantry) {
        // automatic cutter (TAKAOKA style): green conveyor bed + white bridge
        const gx = X(x1) - 3.2;
        box("cutterBed", gx, 0.9, cz, 4.6, 0.12, wd + 0.2, 0x2f5f4f);
        box("machine", gx + 0.6, 1.35, cz, 0.55, 0.4, wd + 0.5, 0xf2f2f2);
        box("machine", gx - 2.6, 0.45, cz, 1.3, 0.9, wd + 0.4, 0xeceff1);
        for (const s of [-1, 1])
          box(
            "machine",
            gx + 0.6,
            1.0,
            cz + s * (wd / 2 + 0.25),
            0.4,
            0.7,
            0.2,
            0xd7dde3,
          );
        box(
          "accent",
          gx - 2.6,
          0.95,
          cz + wd / 2 + 0.21,
          1.0,
          0.12,
          0.01,
          0x1f5fa8,
        );
      }
      // spreader carriage
      const sx = X(x0) + 1 + rnd() * (len - 4);
      box("machine", sx, 1.15, cz, 0.7, 0.5, wd + 0.3, 0xe3e6e9);
    }
    return cutTable;
  };
})();
