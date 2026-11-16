(function () {
  "use strict";

  TNG.features.setupEnvironmentSensors = function setupEnvironmentSensors(app) {
    const F1 = app.f1;
    const floor1Group = new THREE.Group();
    floor1Group.name = "Environment sensors floor 1";
    floor1Group.userData.role = "environment-sensors";
    app.f2.f1root.add(floor1Group);
    const floor2Group = new THREE.Group();
    floor2Group.name = "Environment sensors floor 2";
    floor2Group.userData.role = "environment-sensors";
    app.f2.f2.add(floor2Group);
    const LIMITS = {
      temperature: { warning: 26.5, critical: 27 },
      humidity: { warning: 60, critical: 65 },
    };
    const STATUS = {
      normal: { label: "Hoạt động bình thường", color: 0x00e85a },
      warning: { label: "Gần ngưỡng cảnh báo", color: 0xffb000 },
      critical: { label: "Vượt ngưỡng cảnh báo", color: 0xff2020 },
    };
    const specs = [
      {
        floor: "Tầng 1",
        position: [-58, 2.2, 12],
        temperature: 25.4,
        humidity: 59,
        // Mỗi điểm là [x, z] tính bằng mét, tương đối so với vị trí sensor.
        // Ba điểm sẽ tạo thành vùng tam giác.
        coveragePoints: [
          [-5.5, -3.5],
          [5, -2.5],
          [-0.5, 5.5],
        ],
      },
      {
        floor: "Tầng 1",
        position: [-7, 2.2, -3],
        temperature: 25.9,
        humidity: 57,
        // Bốn điểm sẽ tạo vùng tứ giác.
        coveragePoints: [
          [-5.5, -4],
          [5.5, -4],
          [4.5, 4.5],
          [-5, 4.5],
        ],
      },
      {
        floor: "Tầng 1",
        position: [54, 2.2, 12],
        temperature: 26.6,
        humidity: 56,
        coveragePoints: [
          [-5.5, -3],
          [-1.5, -5],
          [5, -3.5],
          [4.5, 4],
          [-4, 4.5],
        ],
      },
      {
        floor: "Tầng 2",
        position: [-24, 2.2, -4],
        temperature: 20.8,
        humidity: 55,
        coveragePoints: [
          [-21, -21],
          [15, -21],
          [15, 15],
          [-21, 15],
        ],
      },
      {
        floor: "Tầng 2",
        position: [-4, 2.2, -5],
        temperature: 30.1,
        humidity: 54,
        coveragePoints: [
          [-4.5, -21],
          [25.5, -21],
          [25.5, 16.5],
          [-4.5, 16.5],
        ],
      },
      {
        floor: "Tầng 2",
        position: [48, 2.2, -12],
        temperature: 25.5,
        humidity: 53,
        coveragePoints: [
          [-25, 9],
          [10, 9],
          [10, -30],
          [-25, -30],
        ],
      },
    ];
    const sensors = specs.map((spec, index) => {
      const sensor = TNG.components.createEnvironmentSensor();
      sensor.position.set(...spec.position);
      const parent = spec.floor === "Tầng 1" ? floor1Group : floor2Group;
      parent.add(sensor);
      const coverage = new THREE.Group();
      coverage.name = "Sensor measurement area";
      coverage.position.set(spec.position[0], 0.035, spec.position[2]);
      coverage.visible = false;
      const coveragePoints = spec.coveragePoints;
      if (!Array.isArray(coveragePoints) || coveragePoints.length < 3)
        throw new Error(
          `${spec.floor} sensor needs at least three coverage points.`,
        );
      const coverageShape = new THREE.Shape();
      coverageShape.moveTo(...coveragePoints[0]);
      coveragePoints
        .slice(1)
        .forEach((point) => coverageShape.lineTo(...point));
      coverageShape.closePath();
      const coverageFill = new THREE.Mesh(
        new THREE.ShapeGeometry(coverageShape),
        new THREE.MeshBasicMaterial({
          color: 0x00e85a,
          transparent: true,
          opacity: 0.16,
          depthWrite: false,
          side: THREE.DoubleSide,
        }),
      );
      coverageFill.rotation.x = -Math.PI / 2;
      const coverageEdge = new THREE.LineLoop(
        new THREE.BufferGeometry().setFromPoints(
          coveragePoints.map(([x, z]) => new THREE.Vector3(x, z, 0)),
        ),
        new THREE.LineBasicMaterial({
          color: 0x00e85a,
          transparent: true,
          opacity: 0.82,
          depthWrite: false,
        }),
      );
      coverageEdge.rotation.x = -Math.PI / 2;
      coverage.add(coverageFill, coverageEdge);
      parent.add(coverage);
      const data = {
        ...spec,
        id: `ENV-${String(index + 1).padStart(2, "0")}`,
        sensor,
        phase: index * 1.4,
        alert: "normal",
        currentTemperature: spec.temperature,
        currentHumidity: spec.humidity,
        coveragePoints,
        coverage,
        coverageFill,
        coverageEdge,
      };
      sensor.userData.environmentSensor = data;
      return data;
    });
    let selectedSensor = null;
    let hoveredSensor = null;
    const updateCoverage = () => {
      const activeSensor = hoveredSensor || selectedSensor;
      sensors.forEach((data) => {
        data.coverage.visible = data === activeSensor;
      });
      F1.invalidate();
    };
    const showInfo = (data) => {
      selectedSensor = data;
      app.objectInfo.show({
        name: data.id,
        floor: data.floor,
        status: STATUS[data.alert].label,
        temperature: `${data.currentTemperature.toFixed(1)} °C`,
        humidity: `${Math.round(data.currentHumidity)}%`,
        followObject: data.sensor,
      });
      updateCoverage();
    };
    const raycaster = new THREE.Raycaster();
    const pointer = new THREE.Vector2();
    const hoverPosition = new THREE.Vector3();
    const warningPosition = new THREE.Vector3();
    const stage = document.getElementById("stage");
    const warningMarkers = sensors.map((data) => {
      const element = document.createElement("button");
      element.type = "button";
      element.className = "sensor-warning-marker";
      element.textContent = "!";
      element.hidden = true;
      element.dataset.sensorId = data.id;
      element.dataset.sensorId = data.id;
      element.setAttribute(
        "aria-label",
        `Đến ${data.id} đang vượt ngưỡng cảnh báo`,
      );
      element.title = `Đến ${data.id} đang vượt ngưỡng cảnh báo`;
      element.addEventListener("click", () => showInfo(data));
      stage.appendChild(element);
      return { data, element };
    });
    const hoverPanel = document.createElement("div");
    hoverPanel.className = "sensor-hover-panel";
    hoverPanel.setAttribute("role", "tooltip");
    hoverPanel.hidden = true;
    hoverPanel.innerHTML =
      '<strong class="sensor-hover-name"></strong>' +
      '<span>Nhiệt độ <b class="sensor-hover-temperature"></b></span>' +
      '<span>Độ ẩm <b class="sensor-hover-humidity"></b></span>';
    stage.appendChild(hoverPanel);
    const hoverName = hoverPanel.querySelector(".sensor-hover-name");
    const hoverTemperature = hoverPanel.querySelector(
      ".sensor-hover-temperature",
    );
    const hoverHumidity = hoverPanel.querySelector(".sensor-hover-humidity");
    let pointerTarget = null;
    let hoverTimeout = null;
    const visibleInScene = (object) => {
      for (let node = object; node; node = node.parent)
        if (!node.visible) return false;
      return true;
    };
    const setHoveredSensor = (data) => {
      if (!data) pointerTarget = null;
      if (!data && !hoveredSensor) return;
      clearTimeout(hoverTimeout);
      hoverTimeout = null;
      hoveredSensor = data;
      hoverPanel.hidden = !data;
      if (data) {
        hoverName.textContent = data.id;
        hoverTimeout = setTimeout(() => setHoveredSensor(null), 15000);
      }
      updateCoverage();
    };
    const dismissHoverPanel = () => {
      pointerTarget = null;
      setHoveredSensor(null);
    };
    const findPointerTarget = () => {
      const targets = [
        ...sensors.map((data) => data.sensor),
        ...(app.agv?.agents || []).map((agent) => agent.robot),
      ].filter(visibleInScene);
      targets.forEach((object) => object.updateWorldMatrix(true, false));
      raycaster.setFromCamera(pointer, F1.camera);
      const hit = raycaster.intersectObjects(targets, true)[0];
      let object = hit?.object;
      while (
        object &&
        !object.userData.environmentSensor &&
        !object.userData.agvAgent
      )
        object = object.parent;
      return (
        object?.userData.environmentSensor || object?.userData.agvAgent || null
      );
    };
    F1.labelRenderers.push(() => {
      const canvas = F1.renderer.domElement;
      for (const { data, element } of warningMarkers) {
        if (data.alert !== "critical" || !visibleInScene(data.sensor)) {
          element.hidden = true;
          continue;
        }
        data.sensor.getWorldPosition(warningPosition);
        warningPosition.y += 1.55;
        warningPosition.project(F1.camera);
        element.hidden =
          warningPosition.z < -1 ||
          warningPosition.z > 1 ||
          Math.abs(warningPosition.x) > 1 ||
          Math.abs(warningPosition.y) > 1;
        if (element.hidden) continue;
        element.style.left = `${((warningPosition.x + 1) * canvas.clientWidth) / 2}px`;
        element.style.top = `${((1 - warningPosition.y) * canvas.clientHeight) / 2}px`;
      }
      if (!hoveredSensor) return;
      hoveredSensor.sensor.getWorldPosition(hoverPosition);
      hoverPosition.y += 1.1;
      hoverPosition.project(F1.camera);
      if (
        hoverPosition.z < -1 ||
        hoverPosition.z > 1 ||
        Math.abs(hoverPosition.x) > 1 ||
        Math.abs(hoverPosition.y) > 1
      ) {
        hoverPanel.style.visibility = "hidden";
        return;
      }
      hoverPanel.style.visibility = "visible";
      hoverPanel.style.left = `${Math.max(110, Math.min(canvas.clientWidth - 110, ((hoverPosition.x + 1) * canvas.clientWidth) / 2))}px`;
      hoverPanel.style.top = `${Math.max(88, ((1 - hoverPosition.y) * canvas.clientHeight) / 2 - 12)}px`;
    });
    let pointerDown = null;
    const canvas = F1.renderer.domElement;
    canvas.addEventListener("pointermove", (event) => {
      if (event.pointerType === "touch") return;
      const bounds = canvas.getBoundingClientRect();
      pointer.set(
        ((event.clientX - bounds.left) / bounds.width) * 2 - 1,
        -((event.clientY - bounds.top) / bounds.height) * 2 + 1,
      );
      const target = findPointerTarget();
      if (target === pointerTarget && hoveredSensor) return;
      pointerTarget = target;
      if (target?.sensor) setHoveredSensor(target);
      else if (target) setHoveredSensor(null);
    });
    canvas.addEventListener("pointerleave", () => {
      pointerTarget = null;
    });
    document.addEventListener("pointerdown", dismissHoverPanel, true);
    document.addEventListener("wheel", dismissHoverPanel, true);
    document.addEventListener("keydown", dismissHoverPanel, true);
    canvas.addEventListener("pointerdown", (event) => {
      if (event.button === 0)
        pointerDown = { x: event.clientX, y: event.clientY };
    });
    canvas.addEventListener("pointerup", (event) => {
      if (
        !pointerDown ||
        Math.hypot(
          event.clientX - pointerDown.x,
          event.clientY - pointerDown.y,
        ) > 7
      )
        return;
      pointerDown = null;
      const bounds = canvas.getBoundingClientRect();
      pointer.set(
        ((event.clientX - bounds.left) / bounds.width) * 2 - 1,
        -((event.clientY - bounds.top) / bounds.height) * 2 + 1,
      );
      F1.scene.updateMatrixWorld(true);
      raycaster.setFromCamera(pointer, F1.camera);
      const hit = raycaster.intersectObjects(
        sensors.map((data) => data.sensor),
        true,
      )[0];
      let object = hit?.object;
      while (object && !object.userData.environmentSensor)
        object = object.parent;
      if (object?.userData.environmentSensor)
        showInfo(object.userData.environmentSensor);
    });
    F1.frameHooks.push((_, now) => {
      if (hoveredSensor && !visibleInScene(hoveredSensor.sensor))
        dismissHoverPanel();
      sensors.forEach((data) => {
        const previousAlert = data.alert;
        data.currentTemperature =
          data.temperature + Math.sin(now * 0.00035 + data.phase) * 0.35;
        data.currentHumidity =
          data.humidity + Math.sin(now * 0.00023 + data.phase + 1) * 2;
        data.alert =
          data.currentTemperature >= LIMITS.temperature.critical ||
          data.currentHumidity >= LIMITS.humidity.critical
            ? "critical"
            : data.currentTemperature >= LIMITS.temperature.warning ||
                data.currentHumidity >= LIMITS.humidity.warning
              ? "warning"
              : "normal";
        if (data.alert !== previousAlert) F1.invalidate();
        const status = STATUS[data.alert];
        const { signalMaterial, signalLight, signalBeamMaterial } =
          data.sensor.userData;
        const flash = Math.max(0, Math.sin(now * 0.009 + data.phase));
        signalMaterial.color.setHex(status.color);
        signalMaterial.emissive.setHex(status.color);
        signalMaterial.emissiveIntensity = 0.7 + flash * 2.5;
        signalLight.color.setHex(status.color);
        signalBeamMaterial.color.setHex(status.color);
        signalBeamMaterial.opacity = 0.2 + flash * 0.42;
        data.coverageFill.material.color.setHex(status.color);
        data.coverageEdge.material.color.setHex(status.color);
        signalLight.intensity =
          data.alert === "critical"
            ? 1.15
            : data.alert === "warning"
              ? 0.85
              : 0.6;
      });
      if (hoveredSensor) {
        hoverTemperature.textContent = `${hoveredSensor.currentTemperature.toFixed(1)} °C`;
        hoverHumidity.textContent = `${Math.round(hoveredSensor.currentHumidity)}%`;
      }
      return floor1Group.visible || floor2Group.visible;
    });
    const button = document.createElement("button");
    button.id = "tEnvSensors";
    button.textContent = "Cảm biến";
    button.title = "Ẩn hoặc hiện cảm biến nhiệt độ và độ ẩm";
    button.setAttribute("aria-pressed", "true");
    document.querySelector(".toolbar").appendChild(button);
    button.onclick = () => {
      const visible = button.getAttribute("aria-pressed") !== "true";
      floor1Group.visible = visible;
      floor2Group.visible = visible;
      F1.setPressed("tEnvSensors", visible);
      if (!visible) {
        app.objectInfo.close();
        dismissHoverPanel();
        selectedSensor = null;
        updateCoverage();
      }
      F1.invalidate(true);
    };
    app.environmentSensors = {
      dismissHoverPanel,
      groups: [floor1Group, floor2Group],
      sensors,
      select: showInfo,
      clearSelected() {
        if (!selectedSensor) return;
        selectedSensor = null;
        updateCoverage();
      },
    };
    F1.invalidate(true);
  };
})();
