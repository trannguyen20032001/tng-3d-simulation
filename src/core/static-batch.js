TNG.core.createStaticBatcher = function (F1) {
  function batchStatic(parent, stats) {
    if (parent === F1.flowGroup || parent === F1.extGroup) return;
    const buckets = new Map();
    for (const o of [...parent.children]) {
      if (o.children.length) {
        batchStatic(o, stats);
        continue;
      }
      if (
        !o.isMesh ||
        o.isInstancedMesh ||
        o === F1.skyDome ||
        !o.visible ||
        Array.isArray(o.material) ||
        o.material.transparent
      )
        continue;
      const g = o.geometry,
        names = Object.keys(g.attributes).sort();
      o.updateMatrix();
      if (
        o.matrix.determinant() <= 0 ||
        Object.keys(g.morphAttributes).length ||
        names.some((n) => g.attributes[n].isInterleavedBufferAttribute)
      )
        continue;
      const format = names
        .map((n) => {
          const a = g.attributes[n];
          return [n, a.itemSize, a.normalized, a.array.constructor.name].join(
            ":",
          );
        })
        .join("|");
      const cell = [
        Math.floor(o.position.x / 30),
        Math.floor(o.position.y / 12),
        Math.floor(o.position.z / 30),
      ].join(",");
      const key = [
        o.material.uuid,
        o.castShadow,
        o.receiveShadow,
        o.renderOrder,
        o.layers.mask,
        format,
        cell,
      ].join("/");
      if (!buckets.has(key)) buckets.set(key, []);
      buckets.get(key).push(o);
    }
    for (const list of buckets.values()) {
      if (list.length < 3) continue;
      const source = list[0],
        names = Object.keys(source.geometry.attributes),
        parts = [],
        indices = [];
      let vertexCount = 0;
      for (const mesh of list) {
        const g = mesh.geometry.clone().applyMatrix4(mesh.matrix),
          count = g.attributes.position.count;
        parts.push(g);
        if (g.index)
          for (let i = 0; i < g.index.count; i++)
            indices.push(g.index.getX(i) + vertexCount);
        else for (let i = 0; i < count; i++) indices.push(i + vertexCount);
        vertexCount += count;
      }
      const merged = new THREE.BufferGeometry();
      for (const name of names) {
        const a = source.geometry.attributes[name],
          array = new a.array.constructor(vertexCount * a.itemSize);
        let offset = 0;
        for (const g of parts) {
          array.set(g.attributes[name].array, offset);
          offset += g.attributes[name].array.length;
        }
        merged.setAttribute(
          name,
          new THREE.BufferAttribute(array, a.itemSize, a.normalized),
        );
      }
      merged.setIndex(indices);
      merged.computeBoundingBox();
      merged.computeBoundingSphere();
      const mesh = new THREE.Mesh(merged, source.material);
      mesh.castShadow = source.castShadow;
      mesh.receiveShadow = source.receiveShadow;
      mesh.renderOrder = source.renderOrder;
      mesh.layers.mask = source.layers.mask;
      parent.add(mesh);
      for (const o of list) {
        parent.remove(o);
        stats.removedGeometries.add(o.geometry);
      }
      for (const g of parts) g.dispose();
      stats.meshesBefore += list.length;
      stats.batches++;
    }
  }
  return batchStatic;
};
