(function () {
  "use strict";

  TNG.components.createWarningMarker = function createWarningMarker({
    stage,
    className = "",
    data = {},
    label,
    onActivate,
  }) {
    const element = document.createElement("button");
    const projectedPosition = new THREE.Vector3();
    element.type = "button";
    element.className = `warning-marker ${className}`.trim();
    element.textContent = "!";
    element.hidden = true;
    element.title = label;
    element.setAttribute("aria-label", label);
    Object.entries(data).forEach(([key, value]) => {
      element.dataset[key] = value;
    });
    element.addEventListener("click", onActivate);
    stage.appendChild(element);

    const hide = () => {
      element.hidden = true;
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
      element.hidden = !isInView;
      if (!isInView) return;
      element.style.left = `${((projectedPosition.x + 1) * canvas.clientWidth) / 2}px`;
      element.style.top = `${((1 - projectedPosition.y) * canvas.clientHeight) / 2}px`;
    };

    return { element, hide, update };
  };
})();
