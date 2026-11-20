(function () {
  "use strict";
  TNG.components.trolley = function createTrolley({
    box,
    rnd,
    pick,
    garments,
  }) {
    function trolley(x, z, alongX, pal) {
      const w = alongX ? 1.6 : 0.7,
        d = alongX ? 0.7 : 1.6;
      for (const ly of [0.25, 0.85, 1.45]) {
        box("steelWhite", x, ly, z, w, 0.03, d);
      }
      for (const sx of [-1, 1])
        for (const sz of [-1, 1])
          box(
            "steelWhite",
            x + sx * (w / 2 - 0.03),
            0.85,
            z + sz * (d / 2 - 0.03),
            0.04,
            1.5,
            0.04,
          );
      for (const ly of [0.27, 0.87])
        for (let i = 0; i < 3; i++) {
          const hh = 0.15 + rnd() * 0.3;
          const off = ((i - 1) * (alongX ? w : d)) / 3;
          box(
            "cloth",
            x + (alongX ? off : 0),
            ly + hh / 2 + 0.02,
            z + (alongX ? 0 : off),
            alongX ? w / 3 - 0.05 : d * 0.85 - 0.1,
            hh,
            alongX ? d * 0.85 : d / 3 - 0.05,
            pick(pal || garments),
          );
        }
    }
    return trolley;
  };
})();
