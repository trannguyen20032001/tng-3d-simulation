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
      normal: { label: "Hoạt động bình thường", color: 0x48ff7a },
      warning: { label: "Gần ngưỡng cảnh báo", color: 0xffd33d },
      critical: { label: "Vượt ngưỡng cảnh báo", color: 0xff3b3b },
    };
    const specs = [
      {
        floor: "Tầng 1",
        position: [-58, 2.2, 12],
        temperature: 25.4,
        humidity: 59,
      },
      {
        floor: "Tầng 1",
        position: [-7, 2.2, -3],
        temperature: 25.9,
        humidity: 57,
      },
      {
        floor: "Tầng 1",
        position: [54, 2.2, 12],
        temperature: 26.6,
        humidity: 56,
      },
      {
        floor: "Tầng 2",
        position: [-57, 2.2, 11],
        temperature: 24.8,
        humidity: 55,
      },
      {
        floor: "Tầng 2",
        position: [-4, 2.2, -5],
        temperature: 25.1,
        humidity: 54,
      },
      {
        floor: "Tầng 2",
        position: [48, 2.2, -12],
        temperature: 27.2,
        humidity: 53,
      },
    ];
    const sensors = specs.map((spec, index) => {
      const sensor = TNG.components.createEnvironmentSensor();
      sensor.position.set(...spec.position);
      (spec.floor === "Tầng 1" ? floor1Group : floor2Group).add(sensor);
      const data = {
        ...spec,
        id: `ENV-${String(index + 1).padStart(2, "0")}`,
        sensor,
        phase: index * 1.4,
        alert: "normal",
        currentTemperature: spec.temperature,
        currentHumidity: spec.humidity,
      };
      sensor.userData.environmentSensor = data;
      return data;
    });
    const showInfo = (data) =>
      app.objectInfo.show({
        name: data.id,
        floor: data.floor,
        status: STATUS[data.alert].label,
        temperature: `${data.currentTemperature.toFixed(1)} °C`,
        humidity: `${Math.round(data.currentHumidity)}%`,
      });
    const raycaster = new THREE.Raycaster();
    const pointer = new THREE.Vector2();
    let pointerDown = null;
    const canvas = F1.renderer.domElement;
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
      sensors.forEach((data) => {
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
        const status = STATUS[data.alert];
        const { haloMaterial, haloLight, halo, indicatorMaterial } =
          data.sensor.userData;
        haloMaterial.color.setHex(status.color);
        haloLight.color.setHex(status.color);
        indicatorMaterial.color.setHex(status.color);
        indicatorMaterial.emissive.setHex(status.color);
        haloMaterial.opacity =
          0.5 + Math.sin(now * 0.006 + data.phase) * 0.18;
        halo.scale.setScalar(
          1 + Math.sin(now * 0.004 + data.phase) * 0.055,
        );
        haloLight.intensity =
          data.alert === "critical"
            ? 1.1
            : data.alert === "warning"
              ? 0.85
              : 0.65;
        data.sensor.userData.indicatorMaterial.emissiveIntensity =
          1.35 + Math.sin(now * 0.006 + data.phase) * 0.65;
      });
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
      if (!visible) app.objectInfo.close();
      F1.invalidate(true);
    };
    app.environmentSensors = {
      groups: [floor1Group, floor2Group],
      sensors,
      select: showInfo,
    };
    F1.invalidate(true);
  };
})();
