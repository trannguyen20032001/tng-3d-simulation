(function () {
  "use strict";
  TNG.components.forklift = function createForklift({ box }) {
    function forklift(x, z, rotX) {
      const g = 0x2f8f5b;
      box("machine", x, 0.75, z, rotX ? 2.0 : 1.1, 0.9, rotX ? 1.1 : 2.0, g);
      box(
        "machine",
        x + (rotX ? -0.5 : 0),
        1.5,
        z + (rotX ? 0 : -0.5),
        rotX ? 0.9 : 1.0,
        0.08,
        rotX ? 1.0 : 0.9,
        0x222222,
      );
      box(
        "machine",
        x + (rotX ? 1.15 : 0),
        1.3,
        z + (rotX ? 0 : 1.15),
        rotX ? 0.1 : 1.0,
        2.4,
        rotX ? 1.0 : 0.1,
        0x333333,
      );
      box(
        "machine",
        x + (rotX ? 1.5 : 0),
        0.1,
        z + (rotX ? 0 : 1.5),
        rotX ? 1.0 : 0.8,
        0.06,
        rotX ? 0.8 : 1.0,
        0x333333,
      );
    }
    return forklift;
  };
})();
