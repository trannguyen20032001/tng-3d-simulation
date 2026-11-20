TNG.core.createInteractionManager = function (app) {
  const raycaster = new THREE.Raycaster();
  const cache = new Map();
  let epoch = 0;
  const stats = { raycasts: 0, cacheHits: 0 };
  const visible = (object) => {
    for (let node = object; node; node = node.parent) if (!node.visible) return false;
    return true;
  };
  app.f1.frameHooks.push(() => {
    epoch++;
    cache.clear();
    return false;
  });
  return {
    stats,
    pickDevice(pointer) {
      const key = `${epoch}:${pointer.x}:${pointer.y}`;
      if (cache.has(key)) {
        stats.cacheHits++;
        return cache.get(key);
      }
      const targets = [
        ...(app.agv?.agents || []).map((agent) => agent.robot),
        ...(app.environmentSensors?.sensors || []).map((sensor) => sensor.sensor),
      ].filter(visible);
      targets.forEach((object) => object.updateWorldMatrix(true, true));
      raycaster.setFromCamera(pointer, app.f1.camera);
      let object = raycaster.intersectObjects(targets, true)[0]?.object;
      while (object && !object.userData.agvAgent && !object.userData.environmentSensor)
        object = object.parent;
      const result = object || null;
      cache.clear();
      cache.set(key, result);
      stats.raycasts++;
      return result;
    },
  };
};
