import {
  bindAction, areaDetailsStore, setControlTitle,
} from "@/features/factory-viewer/model/viewer-ui";

(function () {
  "use strict";

  TNG.features.setupSlideshow = function setupSlideshow(app) {
    const F1 = app.f1;
    const durationMs = 30000;
    const orbitRadiansPerSecond = 0.2;
    const zoomDurationMs = 900;
    const zoomScale = 0.88;
    const orbitAxis = new THREE.Vector3(0, 1, 0);
    const cameraOffset = new THREE.Vector3();
    const highlightBox = new THREE.Box3();
    const highlight = new THREE.Box3Helper(highlightBox, 0x48ff7a);
    highlight.name = "Slideshow highlight";
    highlight.userData.hoverOutline = true;
    highlight.material.transparent = true;
    highlight.material.depthTest = false;
    highlight.visible = false;
    F1.scene.add(highlight);
    const button = document.getElementById("tSlideshow");

    let running = false;
    let advancing = false;
    let timer = null;
    let queue = [];
    let index = 0;
    let current = null;
    let focusedAt = 0;
    let focusDistance = 0;
    const teamFocusPoints = new Map();
    app.sewingTeams.teams.forEach((team) => {
      const anchor = new THREE.Object3D();
      anchor.name = `Slideshow focus · ${team.name}`;
      // followObject adds 1 m to the target: the sign center is at y=4.3.
      anchor.position.set(team.x, 3.3, team.headZ - 1);
      team.area.parent.add(anchor);
      teamFocusPoints.set(team, anchor);
    });
    const buildQueue = () => {
      const targets = [];
      app.agv.agents.forEach((agent) =>
        targets.push({
          id: agent.id,
          kind: "agv",
          object: agent.robot,
          floor: agent.floor,
          priority: agent.stalled ? 0 : agent.battery <= 25 ? 1 : 2,
          activate: () => app.agv.select(agent),
        }),
      );
      app.environmentSensors.sensors.forEach((sensor) =>
        targets.push({
          id: sensor.id,
          kind: "sensor",
          object: sensor.sensor,
          floor: sensor.floor,
          priority:
            sensor.alert === "critical"
              ? 0
              : sensor.alert === "warning"
                ? 1
                : 2,
          activate: () => app.environmentSensors.select(sensor),
        }),
      );
      app.sewingTeams.teams.forEach((team) =>
        targets.push({
          id: `team-${team.id}`,
          kind: "team",
          object: team.area,
          floor: "Tầng 2",
          priority:
            team.output / team.target < 0.85
              ? 0
              : team.output / team.target < 0.95
                ? 1
                : 2,
          activate() {
            app.sewingTeams.select(team);
            F1.followObject(teamFocusPoints.get(team));
          },
        }),
      );
      document
        .querySelectorAll("ol.zones button:not(#z-all)")
        .forEach((zone) => {
          const floor = zone.id.startsWith("z2-") ? "Tầng 2" : "Tầng 1";
          targets.push({
            id: zone.id,
            kind: "area",
            floor,
            priority: 2,
            activate() {
              zone.click();
              areaDetailsStore.set({ reading: {
                name: zone.querySelector(".zn").textContent, floor,
                description: zone.querySelector(".zd").textContent,
              } });
            },
          });
        });
      F1.slideshowAreas.forEach((area) =>
        targets.push({
          id: area.id,
          kind: "area",
          floor: "Tầng 1",
          priority: 2,
          activate() {
            const target = area.position.clone();
            F1.flyTo(target.clone().add(new THREE.Vector3(10, 12, 16)), target);
            areaDetailsStore.set({ reading: {
              name: area.name, floor: "Tầng 1", description: area.description,
            } });
          },
        }),
      );
      return targets.sort((first, second) => first.priority - second.priority);
    };
    const schedule = () => {
      clearTimeout(timer);
      timer = null;
      if (running && !document.hidden)
        timer = window.setTimeout(next, durationMs);
    };
    const next = () => {
      if (!running) return;
      if (index >= queue.length) {
        queue = buildQueue();
        index = 0;
      }
      if (!queue.length) {
        stop();
        return;
      }
      current = queue[index++];
      focusedAt = 0;
      highlight.visible = false;
      advancing = true;
      try {
        app.agv.dismissHoverPanel();
        app.environmentSensors.dismissHoverPanel();
        app.sewingTeams.clear();
        app.objectInfo.close();
        app.sewingTeams.closeDetails();
        areaDetailsStore.set({ reading: null });
        app.f2.setMode(current.floor === "Tầng 1" ? "f1" : "f2");
        F1.extGroup.visible = false;
        ["vExt", "vPersp", "vTop"].forEach((id) => F1.setPressed(id, false));
        current.activate();
        F1.invalidate(true);
      } finally {
        advancing = false;
      }
      setControlTitle("tSlideshow", `Slideshow · ${current.id} · ${durationMs / 1000} giây · Bấm để dừng`);
      schedule();
    };
    const stop = () => {
      running = false;
      highlight.visible = false;
      clearTimeout(timer);
      timer = null;
      F1.stopFollowing();
      areaDetailsStore.set({ reading: null });
      F1.setPressed("tSlideshow", false);
      setControlTitle("tSlideshow", "Tự động xem từng khu vực và thiết bị");
      F1.invalidate();
    };
    const start = () => {
      if (running) return;
      advancing = true;
      try {
        ["tAgv", "tEnvSensors", "tSewingBalance"].forEach((id) => {
          const toggle = document.getElementById(id);
          if (toggle.getAttribute("aria-pressed") !== "true") toggle.click();
        });
        if (F1.controls.autoRotate) document.getElementById("tSpin").click();
        if (
          document.getElementById("tCeil2").getAttribute("aria-pressed") ===
          "true"
        ) {
          document.getElementById("tCeil2").click();
        }
      } finally {
        advancing = false;
      }
      running = true;
      queue = buildQueue();
      index = 0;
      F1.setPressed("tSlideshow", true);
      next();
    };
    bindAction("tSlideshow", () => (running ? stop() : start()));
    bindAction("closeAreaDetails", stop);
    const stopForInteraction = () => {
      if (running && !advancing) stop();
    };
    F1.renderer.domElement.addEventListener("pointerdown", stopForInteraction);
    F1.renderer.domElement.addEventListener("wheel", stopForInteraction, {
      passive: true,
    });
    document.addEventListener(
      "click",
      (event) => {
        if (
          event.target.closest("button") === button ||
          event.target.closest("#toggleToolbar")
        )
          return;
        if (
          event.target.closest(".toolbar, ol.zones, .object-info header button")
        ) {
          stopForInteraction();
        }
      },
      true,
    );
    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape") {
        stopForInteraction();
        areaDetailsStore.set({ reading: null });
      }
    });
    document.addEventListener("visibilitychange", schedule);
    F1.frameHooks.push((dt, now) => {
      if (!running) return false;
      if (F1.isFlying) return true;
      cameraOffset.subVectors(F1.camera.position, F1.controls.target);
      if (!focusedAt) {
        focusedAt = now;
        focusDistance = cameraOffset.length();
      }
      const progress = Math.min(1, (now - focusedAt) / zoomDurationMs);
      const eased = progress * progress * (3 - 2 * progress);
      cameraOffset.setLength(focusDistance * (1 - (1 - zoomScale) * eased));
      if (progress === 1)
        cameraOffset.applyAxisAngle(orbitAxis, orbitRadiansPerSecond * dt);
      F1.camera.position.copy(F1.controls.target).add(cameraOffset);
      if (current.object) {
        current.object.updateWorldMatrix(true, true);
        highlightBox.setFromObject(current.object).expandByScalar(0.12);
      } else {
        const size = Math.max(3, focusDistance * 0.18);
        highlightBox.min
          .copy(F1.controls.target)
          .add(new THREE.Vector3(-size, 0.1, -size));
        highlightBox.max
          .copy(F1.controls.target)
          .add(new THREE.Vector3(size, 0.25, size));
      }
      highlight.visible = true;
      highlight.material.opacity =
        0.4 + 0.6 * (0.5 + 0.5 * Math.sin(now * 0.007));
      return true;
    });
    app.slideshow = {
      start,
      stop,
      next,
      buildQueue,
      durationMs,
      orbitRadiansPerSecond,
      get running() {
        return running;
      },
      get current() {
        return current;
      },
    };
  };
})();
