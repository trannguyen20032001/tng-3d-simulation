(function () {
  "use strict";
  TNG.components.tableAt = function createTableAt({ box, C }) {
    function tableAt(x, z, sx, sz, h, col, legCol) {
      box("top", x, h, z, sx, 0.05, sz, col);
      for (const a of [-1, 1])
        for (const b of [-1, 1])
          box(
            "leg",
            x + a * (sx / 2 - 0.06),
            h / 2,
            z + b * (sz / 2 - 0.06),
            0.05,
            h,
            0.05,
            legCol == null ? C.leg : legCol,
          );
    }
    return tableAt;
  };
})();
