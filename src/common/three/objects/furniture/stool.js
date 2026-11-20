// Also used as the base of the office chair. Dimensions remain in meters.
TNG.components.stool = function (
  { cyl },
  x,
  z,
  { radius = 0.19, seatColor = 0x6b7178, legColor = 0x555b61 } = {},
) {
  cyl("stool", x, 0.42, z, radius, 0.05, "y", seatColor);
  cyl("stool", x, 0.2, z, 0.025, 0.4, "y", legColor);
};
