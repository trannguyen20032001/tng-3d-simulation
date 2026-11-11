(function () {
  "use strict";
  const paths = {
    sky: "assets/textures/sky.jpg",
    grass: "assets/textures/grass.jpg",
    asph: "assets/textures/asph.jpg",
    leaf: "assets/textures/leaf.jpg",
  };
  TNG.core.loadTexture = function (key) {
    // Keep independent Texture objects: callers change repeat, wrap and offset.
    const t = new THREE.TextureLoader().load(paths[key]);
    t.wrapS = t.wrapT = THREE.RepeatWrapping;
    t.encoding = THREE.sRGBEncoding;
    t.anisotropy = 8;
    return t;
  };
})();
