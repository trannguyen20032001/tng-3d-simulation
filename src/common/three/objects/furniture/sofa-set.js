(function () {
  "use strict";
  TNG.components.sofaSet = function createSofaSet({ X, Z, SOFA, addMesh }) {
    function sofaSet(dx, dy, faceZ) {
      const x = X(dx),
        z = Z(dy),
        m = new THREE.MeshStandardMaterial({ color: SOFA, roughness: 0.95 });
      addMesh(
        new THREE.BoxGeometry(2.6, 0.5, 0.95),
        m,
        x,
        0.3,
        z - faceZ * 1.2,
      );
      addMesh(
        new THREE.BoxGeometry(2.6, 0.55, 0.22),
        m,
        x,
        0.6,
        z - faceZ * 1.62,
      ); // sofa dài tựa tường
      for (const s of [-1, 1]) {
        addMesh(new THREE.BoxGeometry(0.9, 0.5, 0.95), m, x + s * 1.6, 0.3, z);
        addMesh(
          new THREE.BoxGeometry(0.22, 0.55, 0.95),
          m,
          x + s * 2.0,
          0.55,
          z,
        );
      } // 2 ghế đơn
      addMesh(
        new THREE.BoxGeometry(1.1, 0.35, 0.7),
        new THREE.MeshStandardMaterial({ color: 0xf3f1ea, roughness: 0.5 }),
        x,
        0.2,
        z - faceZ * 0.2,
      ); // bàn trà
    }
    return sofaSet;
  };
})();
