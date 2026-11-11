(function () {
  "use strict";
  TNG.components.chairAt = function createChairAt({ box, cyl, C }) {
    function chairAt(x, z) {
      TNG.components.stool({ cyl }, x, z, {
        radius: 0.2,
        seatColor: C.chair,
        legColor: 0x888e94,
      });
      box("chairBack", x, 0.75, z - 0.2, 0.42, 0.5, 0.06, C.chair);
    }
    return chairAt;
  };
})();
