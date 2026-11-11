(function () {
  "use strict";
  TNG.components.lamp = function createLamp({ box, cyl, sph }) {
    function lamp(x, z, dx, dz) {
      cyl("steelD", x, 4, z, 0.09, 8, "y", 0x3a3f45);
      box(
        "steelD",
        x + dx * 1.2,
        7.95,
        z + dz * 1.2,
        dx ? 2.4 : 0.08,
        0.08,
        dz ? 2.4 : 0.08,
        0x3a3f45,
      );
      box(
        "steelD",
        x + dx * 2.3,
        7.85,
        z + dz * 2.3,
        dx ? 1.0 : 0.4,
        0.14,
        dz ? 1.0 : 0.4,
        0x2a2f35,
      );
      box(
        "lampGlow",
        x + dx * 2.3,
        7.75,
        z + dz * 2.3,
        dx ? 0.8 : 0.3,
        0.04,
        dz ? 0.8 : 0.3,
        0xfff0b8,
      );
    }
    return lamp;
  };
})();
