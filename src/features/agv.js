(function () {
  "use strict";

  TNG.features.setupAgv = function setupAgv(app) {
    const F1 = app.f1;
    const parent = app.f2.f1root;
    const system = new THREE.Group();
    system.name = "AGV transport system";
    system.userData.role = "agv-system";
    const routeGroup = new THREE.Group();
    routeGroup.name = "Tuyến chạy AGV";
    const robotGroup = new THREE.Group();
    robotGroup.name = "AGV";
    system.add(routeGroup, robotGroup);
    parent.add(system);

    // Tầng 2 có group riêng để đi theo nút Tầng 2 và hiệu ứng Tách tầng.
    const floor2System = new THREE.Group();
    floor2System.name = "AGV transport system — tầng 2";
    floor2System.userData.role = "agv-system";
    const floor2RouteGroup = new THREE.Group();
    floor2RouteGroup.name = "Tuyến chạy AGV — tầng 2";
    const floor2RobotGroup = new THREE.Group();
    floor2RobotGroup.name = "AGV — tầng 2";
    floor2System.add(floor2RouteGroup, floor2RobotGroup);
    app.f2.f2.add(floor2System);

    const routes = [
      // {
      //   color: 0x2e83cc,
      //   points: [
      //     [58, 22],
      //     [58, 7],
      //     [42, 7],
      //     [42, -14],
      //     [58, -14],
      //   ],
      //   speed: 0.045,
      //   load: 0xd7aa68,
      // },
      // {
      //   color: 0x16a085,
      //   points: [
      //     [31, 20],
      //     [9, 20],
      //     [9, 4],
      //     [31, 4],
      //   ],
      //   speed: 0.057,
      //   load: 0x92bde6,
      // },
      // {
      //   color: 0xe58a2f,
      //   points: [
      //     [-7, 12],
      //     [-29, 12],
      //     [-29, -11],
      //     [-7, -11],
      //   ],
      //   speed: 0.051,
      //   load: 0xd9b784,
      // },
      {
        color: 0x2f60b4,
        points: [
          [-44, 16],
          [-90, 16],
          // [-69, -14],
          // [-42, -14],
        ],
        speed: 0.042,
        load: 0xc4b1df,
        loadKg: 120,
        task: "Vận chuyển hàng trên tuyến tầng 1",
      },
    ];
    const agents = [];

    const addRoutes = (
      items,
      routesParent,
      robotsParent,
      floorSystem,
      offset = 0,
    ) => {
      items.forEach((route, index) => {
        const points = route.points.map(
          ([x, z]) => new THREE.Vector3(x, 0.075, z),
        );
        const shuttle = points.length === 2;
        const linePoints = shuttle ? points : [...points, points[0].clone()];
        const lineGeometry = new THREE.BufferGeometry().setFromPoints(
          linePoints,
        );
        const line = new THREE.Line(
          lineGeometry,
          new THREE.LineDashedMaterial({
            color: route.color,
            dashSize: 0.7,
            gapSize: 0.45,
            transparent: true,
            opacity: 0.78,
          }),
        );
        line.computeLineDistances();
        routesParent.add(line);

        for (const point of points) {
          const stop = new THREE.Mesh(
            new THREE.RingGeometry(0.27, 0.4, 20),
            new THREE.MeshBasicMaterial({
              color: route.color,
              transparent: true,
              opacity: 0.7,
              side: THREE.DoubleSide,
            }),
          );
          stop.rotation.x = -Math.PI / 2;
          stop.position.copy(point);
          stop.position.y = 0.078;
          routesParent.add(stop);
        }

        const curve = shuttle
          ? new THREE.LineCurve3(points[0], points[1])
          : new THREE.CatmullRomCurve3(points, true, "centripetal");
        const robot = TNG.components.createAgv({
          color: route.color,
          loadColor: route.load,
        });
        robot.scale.setScalar(0.92);
        robotsParent.add(robot);
        const length = curve.getLength();
        const agent = {
          curve,
          robot,
          speed: route.speed,
          speedMs: route.stalled ? 0 : length * route.speed * (shuttle ? 2 : 1),
          stalled: !!route.stalled,
          loadKg: route.loadKg || 0,
          task: route.task,
          battery: 82 + (((index + offset) * 7) % 14),
          id: `AGV-${String(agents.length + 1).padStart(2, "0")}`,
          floor: floorSystem === system ? "Tầng 1" : "Tầng 2",
          offset: (index + offset) * 0.23,
          routesParent,
          robotsParent,
          floorSystem,
          shuttle,
        };
        robot.userData.agvAgent = agent;
        agents.push(agent);
      });
    };
    addRoutes(routes, routeGroup, robotGroup, system);

    // Các AGV ở tầng 2 phục vụ các tổ may và khu văn phòng. Vì thuộc f2,
    // chúng tự nâng cùng tầng khi bật "Tách tầng".
    const floor2Routes = [
      {
        color: 0x2f60b4,
        points: [
          [-75.5, 17.5],
          [59.5, 17.5],
        ],
        speed: 0.015,
        load: 0x9bc9ca,
        loadKg: 90,
        task: "Vận chuyển hàng trên tuyến ngang tầng 2",
      },
      {
        color: 0x2f60b4,
        points: [
          [-8.5, 15],
          [-8.5, -20],
        ],
        speed: 0.046,
        load: 0xe1bd91,
        loadKg: 105,
        task: "Vận chuyển hàng trên tuyến dọc tầng 2",
      },
      {
        color: 0x2f60b4,
        points: [
          // [-8, 15],
          [-42.5, -20],
          [59.5, -20],
          // [-8, -12],
        ],
        speed: 0.015,
        load: 0xe1bd91,
        loadKg: 105,
        task: "Vận chuyển hàng qua khu tầng 2",
      },
      {
        color: 0x2f60b4,
        points: [
          [59.5, 20],
          [59.5, -20],
        ],
        speed: 0.015,
        load: 0xe1bd91,
        loadKg: 105,
        task: "Vận chuyển hàng bị chết giữa đường",
        stalled: true,
      },
    ];
    addRoutes(
      floor2Routes,
      floor2RouteGroup,
      floor2RobotGroup,
      floor2System,
      routes.length,
    );

    const info = {
      root: document.getElementById("objectInfo"),
      name: document.getElementById("objectInfoName"),
      floor: document.getElementById("objectInfoFloor"),
      status: document.getElementById("objectInfoStatus"),
      battery: document.getElementById("objectInfoBattery"),
      load: document.getElementById("objectInfoLoad"),
      speed: document.getElementById("objectInfoSpeed"),
      temperature: document.getElementById("objectInfoTemperature"),
      humidity: document.getElementById("objectInfoHumidity"),
    };
    const showInfoFields = (sensor) => {
      for (const field of [info.battery, info.load, info.speed])
        field.parentElement.hidden = sensor;
      for (const field of [info.temperature, info.humidity])
        field.parentElement.hidden = !sensor;
      info.speed.parentElement.style.borderBottom = sensor ? "" : "0";
    };
    let selectedAgent = null;
    const showInfo = (agent) => {
      app.sewingTeams?.closeDetails();
      selectedAgent = agent;
      app.environmentSensors?.clearSelected();
      F1.followObject(agent.robot);
      showInfoFields(false);
      info.root.hidden = false;
      info.name.textContent = agent.id;
      info.floor.textContent = agent.floor;
      info.status.textContent = agent.stalled
        ? "Cảnh báo: AGV dừng hoạt động"
        : "Đang vận chuyển";
      info.battery.textContent = `${Math.round(agent.battery)}%`;
      info.load.textContent = `${agent.loadKg} kg`;
      info.speed.textContent = `${agent.speedMs.toFixed(2)} m/s`;
    };
    const hideInfo = () => {
      selectedAgent = null;
      F1.stopFollowing();
      info.root.hidden = true;
    };
    document.getElementById("closeObjectInfo").onclick = hideInfo;
    app.objectInfo = {
      show(data) {
        selectedAgent = null;
        if (data.followObject) F1.followObject(data.followObject);
        else F1.stopFollowing();
        showInfoFields(true);
        info.root.hidden = false;
        info.name.textContent = data.name;
        info.floor.textContent = data.floor;
        info.status.textContent = data.status;
        info.temperature.textContent = data.temperature || "—";
        info.humidity.textContent = data.humidity || "—";
      },
      close() {
        hideInfo();
        app.environmentSensors?.clearSelected();
      },
    };

    const pointer = new THREE.Vector2();
    const hoverPosition = new THREE.Vector3();
    const stage = document.getElementById("stage");
    const hoverPanel = document.createElement("div");
    hoverPanel.className = "agv-hover-panel";
    hoverPanel.setAttribute("role", "tooltip");
    hoverPanel.hidden = true;
    hoverPanel.innerHTML =
      '<strong class="agv-hover-name"></strong>' +
      '<span class="agv-hover-status"></span>' +
      '<span class="agv-hover-caption">Nhiệm vụ hiện tại</span>' +
      '<span class="agv-hover-task"></span>';
    stage.appendChild(hoverPanel);
    const warningMarkers = agents
      .filter((agent) => agent.stalled)
      .map((agent) => {
        const marker = TNG.components.createWarningMarker({
          stage,
          className: "agv-warning-marker warning-marker--large",
          label: `Đến ${agent.id} đang dừng hoạt động`,
          onActivate: () => showInfo(agent),
        });
        agent.robot.userData.beaconMaterial.color.setHex(0xff4040);
        agent.robot.userData.beaconMaterial.emissive.setHex(0xe02020);
        agent.robot.userData.beaconBeamMaterial.color.setHex(0xff3030);
        agent.robot.userData.beaconLight.color.setHex(0xff3030);
        return { agent, marker };
      });
    const hoverName = hoverPanel.querySelector(".agv-hover-name");
    const hoverStatus = hoverPanel.querySelector(".agv-hover-status");
    const hoverTask = hoverPanel.querySelector(".agv-hover-task");
    let hoveredAgent = null;
    let pointerTarget = null;
    let hoverTimeout = null;
    const visibleInScene = (object) => {
      for (let node = object; node; node = node.parent)
        if (!node.visible) return false;
      return true;
    };
    const setHoveredAgent = (agent) => {
      if (!agent) pointerTarget = null;
      if (!agent && !hoveredAgent) return;
      clearTimeout(hoverTimeout);
      hoverTimeout = null;
      hoveredAgent = agent;
      hoverPanel.hidden = !agent;
      if (agent) {
        hoverName.textContent = agent.id;
        hoverTask.textContent = agent.task;
        hoverTimeout = setTimeout(() => setHoveredAgent(null), 15000);
      }
      F1.invalidate();
    };
    const dismissHoverPanel = () => {
      pointerTarget = null;
      setHoveredAgent(null);
    };
    const findPointerTarget = () => {
      const object = app.interaction.pickDevice(pointer);
      return object?.userData.agvAgent || object?.userData.environmentSensor || null;
    };
    F1.overlayRenderers.push(() => {
      const canvas = F1.renderer.domElement;
      for (const { agent, marker } of warningMarkers) {
        marker.update({
          camera: F1.camera,
          canvas,
          isVisible: visibleInScene(agent.robot),
          getWorldPosition(position) {
            agent.robot.getWorldPosition(position);
            position.y += 1.8;
          },
        });
      }
      if (!hoveredAgent) return;
      hoveredAgent.robot.getWorldPosition(hoverPosition);
      hoverPosition.y += hoveredAgent.stalled ? 3.3 : 1.8;
      hoverPosition.project(F1.camera);
      const stage = canvas;
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
      const x = ((hoverPosition.x + 1) * stage.clientWidth) / 2;
      const y = ((1 - hoverPosition.y) * stage.clientHeight) / 2;
      hoverPanel.style.left = `${Math.max(120, Math.min(stage.clientWidth - 120, x))}px`;
      hoverPanel.style.top = `${Math.max(112, y - (hoveredAgent.stalled ? 46 : 12))}px`;
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
      if (target === pointerTarget && hoveredAgent) return;
      pointerTarget = target;
      if (target?.robot) setHoveredAgent(target);
      else if (target) setHoveredAgent(null);
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
      const object = app.interaction.pickDevice(pointer);
      if (object?.userData.agvAgent) showInfo(object.userData.agvAgent);
    });

    const point = new THREE.Vector3();
    const tangent = new THREE.Vector3();
    let elapsed = 0;
    let lastPanelUpdate = -Infinity;
    F1.frameHooks.push((dt) => {
      const floor1Active =
        system.visible && robotGroup.visible && parent.visible;
      const floor2Active =
        floor2System.visible && floor2RobotGroup.visible && app.f2.f2.visible;
      if (
        selectedAgent &&
        (!selectedAgent.robotsParent.visible ||
          !selectedAgent.floorSystem.visible ||
          !selectedAgent.floorSystem.parent.visible)
      )
        hideInfo();
      if (hoveredAgent && !visibleInScene(hoveredAgent.robot))
        dismissHoverPanel();
      if (!floor1Active && !floor2Active) return false;
      elapsed += dt;
      const shouldUpdatePanel = elapsed - lastPanelUpdate >= 1;
      if (shouldUpdatePanel) lastPanelUpdate = elapsed;
      agents.forEach((agent, index) => {
        const {
          curve,
          robot,
          speed,
          offset,
          robotsParent,
          floorSystem,
          shuttle,
          stalled,
        } = agent;
        if (
          !robotsParent.visible ||
          !floorSystem.visible ||
          !floorSystem.parent.visible
        )
          return;
        const phase = (elapsed * speed + offset) % 1;
        const u = stalled ? 0.5 : shuttle ? 1 - Math.abs(phase * 2 - 1) : phase;
        curve.getPointAt(u, point);
        curve.getTangentAt(u, tangent);
        if (shuttle && phase >= 0.5 && !stalled) tangent.negate();
        robot.position.copy(point);
        robot.position.y = 0.02;
        robot.rotation.y = Math.atan2(tangent.x, tangent.z);
        const flash = 0.5 + Math.max(0, Math.sin(elapsed * 7 + index));
        robot.userData.beaconMaterial.emissiveIntensity = 0.9 + flash * 1.4;
        robot.userData.beaconBeamMaterial.opacity = 0.2 + flash * 0.42;
        robot.userData.beaconLight.intensity = 0.35 + flash * 0.8;
        if (!stalled)
          agent.battery = Math.max(20, agent.battery - dt * 0.005);
      });
      if (hoveredAgent && shouldUpdatePanel) {
        const warning = hoveredAgent.battery <= 25;
        hoverStatus.textContent = hoveredAgent.stalled
          ? "Cảnh báo: AGV dừng hoạt động"
          : warning
            ? "Cảnh báo: pin yếu"
            : "Đang hoạt động";
        hoverStatus.classList.toggle("warning", warning && !hoveredAgent.stalled);
        hoverStatus.classList.toggle("critical", hoveredAgent.stalled);
      }
      if (selectedAgent && shouldUpdatePanel) {
        info.battery.textContent = `${Math.round(selectedAgent.battery)}%`;
      }
      return floor1Active || floor2Active;
    });

    const toolbar = document.querySelector(".toolbar");
    const addButton = (id, text, title, targets) => {
      const button = document.createElement("button");
      button.id = id;
      button.textContent = text;
      button.title = title;
      button.setAttribute("aria-pressed", "true");
      toolbar.appendChild(button);
      button.onclick = () => {
        const visible = button.getAttribute("aria-pressed") !== "true";
        targets.forEach((target) => {
          target.visible = visible;
        });
        F1.setPressed(id, visible);
        F1.invalidate(true);
      };
      return button;
    };
    addButton("tAgv", "AGV", "Ẩn hoặc hiện robot vận chuyển AGV", [
      robotGroup,
      floor2RobotGroup,
    ]);
    addButton("tAgvRoutes", "Tuyến AGV", "Ẩn hoặc hiện tuyến chạy AGV", [
      routeGroup,
      floor2RouteGroup,
    ]);

    app.agv = {
      dismissHoverPanel,
      systems: [system, floor2System],
      routeGroups: [routeGroup, floor2RouteGroup],
      robotGroups: [robotGroup, floor2RobotGroup],
      // Alias tầng 1 để các đoạn code cũ vẫn truy cập được.
      system,
      routes: routeGroup,
      robots: robotGroup,
      agents,
      select: showInfo,
      closeInfo: hideInfo,
    };
    F1.invalidate(true);
  };
})();
