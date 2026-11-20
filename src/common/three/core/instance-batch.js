TNG.core.createInstanceBatch = function () {
  const BOX = {},
    CYL = {},
    SPH = {};
  // Keep the color slot even when omitted; dimensions are never color values.
  const box = (k, x, y, z, sx, sy, sz, c) =>
    (BOX[k] ||= []).push([x, y, z, sx, sy, sz, c]);
  const cyl = (k, x, y, z, r, len, axis, c) =>
    (CYL[k] ||= []).push([x, y, z, r, len, axis, c]);
  const sph = (k, x, y, z, r, c) => (SPH[k] ||= []).push([x, y, z, r, c]);
  function build(
    parent,
    materials,
    { glass = false, fallbackColor = true, shadow = () => true } = {},
  ) {
    const tmp = new THREE.Object3D(),
      color = new THREE.Color();
    const meshes = [];
    function instance(geometry, key, parts, setTransform) {
      const d = materials[key] || {};
      const transparent = glass && key === "glassDark";
      const material = new THREE.MeshStandardMaterial({
        color: 0xffffff,
        roughness: d.r ?? 0.7,
        metalness: d.m || 0,
        transparent,
        opacity: transparent ? 0.45 : 1,
        depthWrite: !transparent,
      });
      const mesh = new THREE.InstancedMesh(geometry, material, parts.length);
      parts.forEach((part, index) => {
        setTransform(part);
        tmp.updateMatrix();
        mesh.setMatrixAt(index, tmp.matrix);
        color.setHex(
          fallbackColor ? (part.at(-1) ?? d.color ?? 0xffffff) : part.at(-1),
        );
        mesh.setColorAt(index, color);
      });
      mesh.instanceMatrix.needsUpdate = true;
      if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
      mesh.castShadow = shadow(key);
      mesh.receiveShadow = true;
      parent.add(mesh);
      meshes.push(mesh);
    }
    const boxGeometry = new THREE.BoxGeometry(1, 1, 1);
    const cylinderGeometry = new THREE.CylinderGeometry(1, 1, 1, 14);
    const sphereGeometry = new THREE.SphereGeometry(1, 12, 10);
    for (const [key, parts] of Object.entries(BOX))
      instance(boxGeometry, key, parts, ([x, y, z, sx, sy, sz]) => {
        tmp.position.set(x, y, z);
        tmp.rotation.set(0, 0, 0);
        tmp.scale.set(sx, sy, sz);
      });
    for (const [key, parts] of Object.entries(CYL))
      instance(cylinderGeometry, key, parts, ([x, y, z, r, len, axis]) => {
        tmp.position.set(x, y, z);
        tmp.rotation.set(
          axis === "z" ? Math.PI / 2 : 0,
          0,
          axis === "x" ? Math.PI / 2 : 0,
        );
        tmp.scale.set(r, len, r);
      });
    for (const [key, parts] of Object.entries(SPH))
      instance(sphereGeometry, key, parts, ([x, y, z, r]) => {
        tmp.position.set(x, y, z);
        tmp.rotation.set(0, 0, 0);
        tmp.scale.set(r, r, r);
      });
    return meshes;
  }
  return { BOX, CYL, SPH, box, cyl, sph, build };
};
