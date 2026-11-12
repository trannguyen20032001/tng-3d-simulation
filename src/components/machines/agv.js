(function () {
  "use strict";

  TNG.components.createAgv = function createAgv({
    color = 0x2f7bc4,
    loadColor = 0xd7aa68,
  } = {}) {
    const agv = new THREE.Group();
    agv.name = "AGV";

    const bodyMaterial = new THREE.MeshStandardMaterial({
      color,
      roughness: 0.38,
      metalness: 0.42,
    });
    const darkMaterial = new THREE.MeshStandardMaterial({
      color: 0x1b2530,
      roughness: 0.5,
      metalness: 0.6,
    });
    const loadMaterial = new THREE.MeshStandardMaterial({
      color: loadColor,
      roughness: 0.72,
    });
    const beaconMaterial = new THREE.MeshStandardMaterial({
      color: 0x8ee8ff,
      emissive: 0x1d9bd6,
      emissiveIntensity: 1.8,
      roughness: 0.25,
    });
    const add = (geometry, material, x, y, z) => {
      const mesh = new THREE.Mesh(geometry, material);
      mesh.position.set(x, y, z);
      mesh.castShadow = true;
      mesh.receiveShadow = true;
      agv.add(mesh);
      return mesh;
    };

    add(new THREE.BoxGeometry(1.32, 0.24, 1.72), bodyMaterial, 0, 0.26, 0);
    add(new THREE.BoxGeometry(1.08, 0.16, 1.32), darkMaterial, 0, 0.46, -0.08);
    add(new THREE.BoxGeometry(0.94, 0.2, 1.06), loadMaterial, 0, 0.64, -0.04);
    add(new THREE.BoxGeometry(1.02, 0.035, 1.14), darkMaterial, 0, 0.76, -0.04);
    const beacon = add(
      new THREE.CylinderGeometry(0.09, 0.09, 0.1, 12),
      beaconMaterial,
      0,
      0.86,
      -0.42,
    );
    beacon.userData.beacon = true;

    for (const x of [-0.56, 0.56]) {
      for (const z of [-0.52, 0.52]) {
        const wheel = add(
          new THREE.CylinderGeometry(0.17, 0.17, 0.12, 12),
          darkMaterial,
          x,
          0.17,
          z,
        );
        wheel.rotation.z = Math.PI / 2;
      }
    }
    for (const x of [-0.34, 0.34])
      add(
        new THREE.BoxGeometry(0.12, 0.1, 0.035),
        beaconMaterial,
        x,
        0.34,
        0.88,
      );

    agv.userData.beaconMaterial = beaconMaterial;
    return agv;
  };
})();
