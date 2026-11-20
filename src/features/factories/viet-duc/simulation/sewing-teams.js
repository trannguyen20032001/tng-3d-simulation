import { percent, sewingTeamStore } from "@/features/sewing-teams/model/sewing-team-store";
import { bindAction } from "@/features/factory-viewer/model/viewer-ui";

(function () {
  "use strict";

  TNG.features.setupSewingTeams = function (app) {
    const F1 = app.f1;
    const HIGHLIGHT_COLOR = 0x48ff7a;
    const group = new THREE.Group();
    group.name = "Sewing team production areas";
    group.userData.role = "sewing-team-interaction";
    app.f2.f2.add(group);

    const getAchievementColor = (ratio) => {
      if (ratio >= 0.95) return 0x22c55e;
      if (ratio >= 0.85) return 0xfacc15;
      return 0xef4444;
    };
    // Demo snapshot: replace these production values when telemetry is available.
    const demoOutputs = app.f2.sewingTeams.map((_, index) => 95 + (index % 8));
    const assignSeparatedPair = (outputs) => {
      const pairs = [];
      for (let first = 0; first < demoOutputs.length; first++) {
        for (let second = first + 8; second < demoOutputs.length; second++) {
          if (demoOutputs[first] >= 95 && demoOutputs[second] >= 95) {
            pairs.push([first, second]);
          }
        }
      }
      const pair = pairs[Math.floor(Math.random() * pairs.length)];
      pair.forEach((index, position) => {
        demoOutputs[index] = outputs[position];
      });
    };
    // Each pair has at least seven intervening teams; assignments refresh on page load.
    assignSeparatedPair([78, 84]);
    assignSeparatedPair([85, 90]);
    const teams = app.f2.sewingTeams.map((team, index) => {
      const output = demoOutputs[index];
      const target = 100;
      const operations = ["May vai", "Tra tay", "May sườn", "Lên lai"].map(
        (name, step) => ({
          name,
          device: `CB-${String(team.id).padStart(2, "0")}-${step + 1}`,
          output: output + (3 - step) * (3 + (index % 4)),
          target,
        }),
      );
      const width = team.maxX - team.minX;
      const depth = team.maxZ - team.minZ;
      const area = new THREE.Mesh(
        new THREE.BoxGeometry(width, 1.5, depth),
        new THREE.MeshBasicMaterial({
          color: HIGHLIGHT_COLOR,
          transparent: true,
          opacity: 0,
          depthWrite: false,
        }),
      );
      area.position.set(
        (team.minX + team.maxX) / 2,
        0.8,
        (team.minZ + team.maxZ) / 2,
      );
      group.add(area);
      const edge = new THREE.LineSegments(
        new THREE.EdgesGeometry(area.geometry),
        new THREE.LineBasicMaterial({
          color: HIGHLIGHT_COLOR,
          transparent: true,
          opacity: 0.95,
        }),
      );
      edge.position.copy(area.position);
      edge.visible = false;
      group.add(edge);
      const floor = new THREE.Mesh(
        new THREE.PlaneGeometry(width - 0.08, depth - 0.08),
        new THREE.MeshBasicMaterial({
          color: getAchievementColor(output / target),
          transparent: true,
          opacity: 0.35,
          depthWrite: false,
          side: THREE.DoubleSide,
        }),
      );
      floor.rotation.x = -Math.PI / 2;
      floor.position.set(area.position.x, 0.045, area.position.z);
      group.add(floor);
      const hourlyOutput = [0.2, 0.25, 0.3].map((share) =>
        Math.floor(output * share),
      );
      hourlyOutput.push(
        output - hourlyOutput.reduce((sum, value) => sum + value, 0),
      );
      const production = {
        ...team,
        output,
        target,
        operations,
        area,
        edge,
        floor,
        styleCode: `TNG-${2026 + index}`,
        workers: 24 + (index % 7),
        elapsedSeconds: 4 * 3600,
        shiftSeconds: 8 * 3600,
        standardLaborSeconds: 3600,
        lastProductAt: Date.now() - (index % 3 === 0 ? 180 : 35) * 1000,
        hourlyOutput,
        quality:
          index % 3 === 0 ? null : { inspected: output, defects: index % 4 },
      };
      area.userData.sewingTeam = production;
      return production;
    });

    const stage = document.getElementById("stage");

    const pointer = new THREE.Vector2();
    const raycaster = new THREE.Raycaster();
    const canvas = F1.renderer.domElement;
    let current = null;
    let selected = null;
    let pointerDown = null;
    let isEnabled = true;
    const visible = (object) => {
      for (let node = object; node; node = node.parent)
        if (!node.visible) return false;
      return true;
    };
    const updateHighlight = (team) => {
      team.edge.visible = isEnabled && (team === current || team === selected);
      team.area.material.opacity = team.edge.visible ? 0.12 : 0;
    };
    const clear = () => {
      const previous = current;
      current = null;
      if (previous) updateHighlight(previous);
      F1.invalidate();
    };
    const closeDetails = () => {
      const previous = selected;
      selected = null;
      if (previous) {
        updateHighlight(previous);
        F1.stopFollowing();
      }
      sewingTeamStore.clear();
      F1.invalidate();
    };
    const select = (team, focus = false) => {
      app.objectInfo.close();
      closeDetails();
      clear();
      selected = team;
      updateHighlight(team);
      sewingTeamStore.select(team, closeDetails);
      if (focus) F1.followObject(team.area);
      F1.invalidate();
    };
    const showObjectInfo = app.objectInfo.show;
    app.objectInfo.show = (info) => {
      closeDetails();
      showObjectInfo(info);
    };
    const pickTeam = (event) => {
      if (!visible(group)) return null;
      const bounds = canvas.getBoundingClientRect();
      pointer.set(
        ((event.clientX - bounds.left) / bounds.width) * 2 - 1,
        (-(event.clientY - bounds.top) / bounds.height) * 2 + 1,
      );
      group.updateWorldMatrix(true, true);
      raycaster.setFromCamera(pointer, F1.camera);
      if (app.interaction.pickDevice(pointer)) return null;
      return raycaster.intersectObjects(teams.map((team) => team.area))[0]
        ?.object.userData.sewingTeam;
    };
    canvas.addEventListener("pointermove", (event) => {
      if (!isEnabled || event.buttons || event.pointerType === "touch")
        return clear();
      const next = pickTeam(event);
      if (!next) return clear();
      if (next === current) return;
      clear();
      current = next;
      app.agv.dismissHoverPanel();
      app.environmentSensors.dismissHoverPanel();
      updateHighlight(next);
      F1.invalidate();
    });
    canvas.addEventListener("pointerdown", (event) => {
      pointerDown =
        event.button === 0 ? { x: event.clientX, y: event.clientY } : null;
    });
    canvas.addEventListener("pointerup", (event) => {
      const start = pointerDown;
      pointerDown = null;
      if (
        !start ||
        event.button !== 0 ||
        Math.hypot(event.clientX - start.x, event.clientY - start.y) > 7
      )
        return;
      const team = pickTeam(event);
      if (team) select(team);
    });
    canvas.addEventListener("pointercancel", () => {
      pointerDown = null;
    });
    canvas.addEventListener("pointerleave", clear);
    document.addEventListener("pointerdown", clear, true);
    document.addEventListener("wheel", clear, true);
    document.addEventListener("keydown", (event) => {
      clear();
      if (event.key === "Escape") closeDetails();
    });
    const markers = teams.map((team) => {
      const marker = TNG.components.createWarningMarker({
        stage,
        className: "sensor-warning-marker sewing-team-warning",
        data: { teamId: team.id },
        label: `${team.name}: đạt ${percent(team.output / team.target)} mục tiêu`,
        onActivate: () => select(team, true),
      });
      return { team, marker };
    });
    bindAction("tSewingBalance", () => {
      isEnabled = !isEnabled;
      F1.setPressed("tSewingBalance", isEnabled);
      clear();
      teams.forEach((team) => {
        team.floor.visible = isEnabled;
        updateHighlight(team);
      });
      if (!isEnabled) markers.forEach(({ marker }) => marker.hide());
      F1.invalidate();
    });
    F1.frameHooks.push(() => {
      if (!visible(group)) {
        if (current) clear();
        if (selected) closeDetails();
      }
      return false;
    });
    F1.overlayRenderers.push(() => {
      markers.forEach(({ team, marker }) => {
        marker.update({
          camera: F1.camera,
          canvas,
          isVisible:
            isEnabled && visible(group) && team.output / team.target < 0.85,
          getWorldPosition(position) {
            position
              .set(team.x, 4.9, team.headZ)
              .applyMatrix4(group.matrixWorld);
          },
        });
      });
    });
    app.sewingTeams = {
      teams,
      clear,
      select,
      closeDetails,
      getAchievementColor,
    };
  };
})();
