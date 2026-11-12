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
    const led = new THREE.MeshStandardMaterial({
      color: 0x5dff93,
      emissive: 0x20d85d,
      emissiveIntensity: 1.7,
      roughness: 0.2,
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
    add(new THREE.SphereGeometry(0.045, 12, 8), led, 0.19, -0.22, 0.13);
    add(new THREE.CylinderGeometry(0.09, 0.09, 0.12, 16), casing, 0, -0.42, 0);
    const haloMaterial = new THREE.MeshBasicMaterial({
      color: 0x48ff7a,
      transparent: true,
      opacity: 0.68,
      wireframe: true,
      depthWrite: false,
    });
    const halo = new THREE.Mesh(
      new THREE.SphereGeometry(0.6, 16, 12),
      haloMaterial,
    );
    halo.name = "Sensor status halo";
    sensor.add(halo);
    const haloLight = new THREE.PointLight(0x48ff7a, 0.65, 3.2);
    sensor.add(haloLight);
    sensor.userData.indicatorMaterial = led;
    sensor.userData.haloMaterial = haloMaterial;
    sensor.userData.halo = halo;
    sensor.userData.haloLight = haloLight;
    return sensor;
  };
})();
