(function () {
  "use strict";

  TNG.components.createEnvironmentSensor = function createEnvironmentSensor() {
    const sensor = new THREE.Group();
    sensor.name = "Environmental sensor";
    const casing = new THREE.MeshStandardMaterial({
      color: 0xf3f6f8,
      roughness: 0.42,
      metalness: 0.2,
    });
    const screen = new THREE.MeshStandardMaterial({
      color: 0x17324c,
      emissive: 0x126f91,
      emissiveIntensity: 0.75,
      roughness: 0.25,
    });
    const signalMaterial = new THREE.MeshStandardMaterial({
      color: 0x00e85a,
      emissive: 0x18b94d,
      emissiveIntensity: 1.6,
      roughness: 0.18,
    });
    const signalBase = new THREE.MeshStandardMaterial({
      color: 0x263746,
      roughness: 0.35,
      metalness: 0.55,
    });
    const add = (geometry, material, x, y, z) => {
      const mesh = new THREE.Mesh(geometry, material);
      mesh.position.set(x, y, z);
      mesh.castShadow = true;
      sensor.add(mesh);
      return mesh;
    };
    add(new THREE.BoxGeometry(0.62, 0.84, 0.2), casing, 0, 0, 0);
    add(new THREE.BoxGeometry(0.45, 0.25, 0.025), screen, 0, 0.12, 0.112);
    add(new THREE.CylinderGeometry(0.09, 0.09, 0.12, 16), casing, 0, -0.42, 0);

    // Đèn tháp báo trạng thái, đặt cao để dễ nhận biết trên mô hình nhà xưởng.
    add(new THREE.CylinderGeometry(0.045, 0.045, 0.27, 12), signalBase, 0, 0.55, 0);
    const signal = add(
      new THREE.CylinderGeometry(0.13, 0.13, 0.18, 16),
      signalMaterial,
      0,
      0.77,
      0,
    );
    signal.name = "Sensor status signal";
    const signalLight = new THREE.PointLight(0x48ff7a, 0.55, 2.4);
    signalLight.position.set(0, 0.77, 0.14);
    sensor.add(signalLight);
    const signalBeamMaterial = new THREE.MeshBasicMaterial({
      color: 0x48ff7a,
      transparent: true,
      opacity: 0.38,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      side: THREE.DoubleSide,
    });
    const signalBeam = new THREE.Mesh(
      new THREE.SphereGeometry(0.48, 24, 12, 0, Math.PI * 2, 0, Math.PI / 2),
      signalBeamMaterial,
    );
    signalBeam.name = "Sensor signal light dome";
    signalBeam.position.set(0, 0.86, 0);
    signalBeam.renderOrder = 1;
    sensor.add(signalBeam);
    sensor.userData.signalMaterial = signalMaterial;
    sensor.userData.signalLight = signalLight;
    sensor.userData.signalBeamMaterial = signalBeamMaterial;
    return sensor;
  };
})();
