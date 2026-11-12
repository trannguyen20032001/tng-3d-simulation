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
          speedMs: length * route.speed * (shuttle ? 2 : 1),
          loadKg: route.loadKg || 0,
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

    // Hai AGV ở tầng 2 phục vụ các tổ may và khu văn phòng. Vì thuộc f2,
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
      // temperature: document.getElementById("objectInfoTemperature"),
      // humidity: document.getElementById("objectInfoHumidity"),
    };
    let selectedAgent = null;
    const showInfo = (agent) => {
      selectedAgent = agent;
      info.root.hidden = false;
      info.name.textContent = agent.id;
      info.floor.textContent = agent.floor;
      info.status.textContent = "Đang vận chuyển";
      info.load.textContent = `${agent.loadKg} kg`;
      info.speed.textContent = `${agent.speedMs.toFixed(2)} m/s`;
      // info.temperature.textContent = "—";
      // info.humidity.textContent = "—";
    };
    const hideInfo = () => {
      selectedAgent = null;
      info.root.hidden = true;
    };
    document.getElementById("closeObjectInfo").onclick = hideInfo;
    app.objectInfo = {
      show(data) {
        selectedAgent = null;
        info.root.hidden = false;
        info.name.textContent = data.name;
        info.floor.textContent = data.floor;
        info.status.textContent = data.status;
        info.battery.textContent = data.battery || "—";
        info.load.textContent = data.load || "—";
        info.speed.textContent = data.speed || "—";
        // info.temperature.textContent = data.temperature || "—";
        // info.humidity.textContent = data.humidity || "—";
      },
      close: hideInfo,
    };

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
        agents.map((agent) => agent.robot),
        true,
      )[0];
      let object = hit?.object;
      while (object && !object.userData.agvAgent) object = object.parent;
      if (object?.userData.agvAgent) showInfo(object.userData.agvAgent);
    });

    const point = new THREE.Vector3();
    const tangent = new THREE.Vector3();
    let elapsed = 0;
    F1.frameHooks.push((dt) => {
      const floor1Active =
        system.visible && robotGroup.visible && parent.visible;
      const floor2Active =
        floor2System.visible && floor2RobotGroup.visible && app.f2.f2.visible;
      if (!floor1Active && !floor2Active) return false;
      elapsed += dt;
      agents.forEach((agent, index) => {
        const {
          curve,
          robot,
          speed,
          offset,
          robotsParent,
          floorSystem,
          shuttle,
        } = agent;
        if (
          !robotsParent.visible ||
          !floorSystem.visible ||
          !floorSystem.parent.visible
        )
          return;
        const phase = (elapsed * speed + offset) % 1;
        const u = shuttle ? 1 - Math.abs(phase * 2 - 1) : phase;
        curve.getPointAt(u, point);
        curve.getTangentAt(u, tangent);
        if (shuttle && phase >= 0.5) tangent.negate();
        robot.position.copy(point);
        robot.position.y = 0.02;
        robot.rotation.y = Math.atan2(tangent.x, tangent.z);
        robot.userData.beaconMaterial.emissiveIntensity =
          1.15 + Math.sin(elapsed * 7 + index) * 0.65;
        agent.battery = Math.max(20, agent.battery - dt * 0.005);
      });
      if (selectedAgent) {
        if (
          !selectedAgent.robotsParent.visible ||
          !selectedAgent.floorSystem.parent.visible
        ) {
          hideInfo();
        } else {
          info.battery.textContent = `${Math.round(selectedAgent.battery)}%`;
        }
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
