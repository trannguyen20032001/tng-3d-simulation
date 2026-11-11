// Drawing coordinates are millimeters; model coordinates are meters.
TNG.core.createCoordinates = function (originX, originY, zDirection = 1) {
  return {
    X: x => (x - originX) / 1000,
    Z: y => zDirection * (y - originY) / 1000,
    M: value => value / 1000
  };
};
