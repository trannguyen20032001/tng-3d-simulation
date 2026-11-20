(function () {
  "use strict";
  TNG.components.person = function createPerson({ box, cyl, sph, pick }) {
    function person(x, z, shirt, rot) {
      const c =
        shirt ||
        pick([0x2f5fa8, 0x2f5fa8, 0x3c76c4, 0xf1f1f1, 0x6b8e4e, 0x24324a]);
      box("legs", x, 0.42, z, 0.32, 0.84, 0.2, 0x2a2f38);
      cyl("body", x, 1.17, z, 0.2, 0.66, "y", c);
      sph("head", x, 1.64, z, 0.13, 0xe0b48f);
      sph("hair", x, 1.69, z + 0.02, 0.125, 0x1b1612);
    }
    return person;
  };
})();
