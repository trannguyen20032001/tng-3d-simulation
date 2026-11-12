(function () {
  "use strict";

  TNG.features.createHoverOutline = function createHoverOutline(F1) {
    const targets = new Set();
    const raycaster = new THREE.Raycaster();
    const pointer = new THREE.Vector2();
    const box = new THREE.Box3();
    const outline = new THREE.Box3Helper(box, 0x48ff7a);
    outline.name = "Hover outline";
    outline.userData.hoverOutline = true;
    outline.visible = false;
    outline.material.transparent = true;
    outline.material.opacity = 0.95;
    outline.material.depthTest = false;
    F1.scene.add(outline);

    let current = null;
    const isVisibleInScene = (object) => {
      for (let node = object; node; node = node.parent) if (!node.visible) return false;
      return true;
    };
    const update = (object) => {
      if (!object) {
        current = null;
        outline.visible = false;
        F1.renderer.domElement.style.cursor = "";
        return;
      }
      current = object;
      F1.scene.updateMatrixWorld(true);
      box.setFromObject(object).expandByScalar(0.08);
      outline.visible = !box.isEmpty();
      F1.renderer.domElement.style.cursor = "pointer";
      F1.invalidate();
    };
    const findTarget = (object) => {
      while (object) {
        if (targets.has(object)) return object;
        object = object.parent;
      }
      return null;
    };
    const canvas = F1.renderer.domElement;
    canvas.addEventListener("pointermove", (event) => {
      const bounds = canvas.getBoundingClientRect();
      pointer.set(
        ((event.clientX - bounds.left) / bounds.width) * 2 - 1,
        -((event.clientY - bounds.top) / bounds.height) * 2 + 1,
      );
      raycaster.setFromCamera(pointer, F1.camera);
      const hit = raycaster.intersectObjects(
        [...targets].filter(isVisibleInScene),
        true,
      )[0];
      update(hit ? findTarget(hit.object) : null);
    });
    canvas.addEventListener("pointerleave", () => update(null));
    F1.frameHooks.push((_, now) => {
      if (!current || !isVisibleInScene(current)) {
        if (current) update(null);
        return false;
      }
      box.setFromObject(current).expandByScalar(0.08);
      outline.material.color.setHSL(0.36, 1, 0.53 + Math.sin(now * 0.008) * 0.12);
      return true;
    });
    return {
      register(object) {
        targets.add(object);
        return object;
      },
      clear() {
        update(null);
      },
    };
  };
})();
