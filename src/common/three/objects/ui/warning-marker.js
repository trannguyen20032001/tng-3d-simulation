import { createWarningHost } from "@/common/three/ui/SceneUiPortals";

(function () {
  "use strict";

  TNG.components.createWarningMarker = function createWarningMarker({
    stage,
    className = "",
    data = {},
    label,
    onActivate,
  }) {
    const host = createWarningHost({ className, data, label, onActivate }, stage);
    const projectedPosition = new THREE.Vector3();

    const hide = () => {
      host.hidden = true;
    };
    const update = ({ camera, canvas, isVisible = true, getWorldPosition }) => {
      if (!isVisible) return hide();
      getWorldPosition(projectedPosition);
      projectedPosition.project(camera);
      const isInView =
        projectedPosition.z >= -1 &&
        projectedPosition.z <= 1 &&
        Math.abs(projectedPosition.x) <= 1 &&
        Math.abs(projectedPosition.y) <= 1;
      host.hidden = !isInView;
      if (!isInView) return;
      const element = host.firstElementChild;
      if (!element) return;
      element.style.left = `${((projectedPosition.x + 1) * canvas.clientWidth) / 2}px`;
      element.style.top = `${((1 - projectedPosition.y) * canvas.clientHeight) / 2}px`;
    };

    return { element: host, hide, update };
  };
})();
