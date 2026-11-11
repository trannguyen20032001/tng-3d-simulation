(function () {
  "use strict";
  TNG.components.cartonStack = function createCartonStack({
    box,
    rnd,
    pick,
    cartonC,
  }) {
    function cartonStack(x, z, nx, nz, lv) {
      for (let i = 0; i < nx; i++)
        for (let j = 0; j < nz; j++) {
          const h = lv || 1 + Math.floor(rnd() * 3);
          for (let k = 0; k < h; k++)
            box(
              "carton",
              x + i * 0.62,
              0.22 + k * 0.44,
              z + j * 0.47,
              0.6,
              0.42,
              0.45,
              pick(cartonC),
            );
        }
    }
    return cartonStack;
  };
})();
