(function () {
  "use strict";
  TNG.components.crate = function createCrate({ box }) {
    function crate(x, z, y0, c) {
      box("crate", x, y0 + 0.18, z, 0.6, 0.36, 0.4, c || 0x1f4fbf);
    }
    return crate;
  };
})();
