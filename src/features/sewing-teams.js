(function () {
  "use strict";

  TNG.features.setupSewingTeams = function (app) {
    const F1 = app.f1;
    const HIGHLIGHT_COLOR = 0x48ff7a;
    const STOP_TIMEOUT_SECONDS = 120;
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
    const demoOutputs = app.f2.sewingTeams.map((_, index) => 95 + index % 8);
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
      pair.forEach((index, position) => { demoOutputs[index] = outputs[position]; });
    };
    // Each pair has at least seven intervening teams; assignments refresh on page load.
    assignSeparatedPair([78, 84]);
    assignSeparatedPair([85, 90]);
    const teams = app.f2.sewingTeams.map((team, index) => {
      const output = demoOutputs[index];
      const target = 100;
      const operations = ["May vai", "Tra tay", "May sườn", "Lên lai"].map((name, step) => ({
        name,
        device: `CB-${String(team.id).padStart(2, "0")}-${step + 1}`,
        output: output + (3 - step) * (3 + index % 4),
        target,
      }));
      const width = team.maxX - team.minX;
      const depth = team.maxZ - team.minZ;
      const area = new THREE.Mesh(
        new THREE.BoxGeometry(width, 1.5, depth),
        new THREE.MeshBasicMaterial({
          color: HIGHLIGHT_COLOR, transparent: true, opacity: 0, depthWrite: false,
        }),
      );
      area.position.set((team.minX + team.maxX) / 2, 0.8, (team.minZ + team.maxZ) / 2);
      group.add(area);
      const edge = new THREE.LineSegments(
        new THREE.EdgesGeometry(area.geometry),
        new THREE.LineBasicMaterial({ color: HIGHLIGHT_COLOR, transparent: true, opacity: 0.95 }),
      );
      edge.position.copy(area.position);
      edge.visible = false;
      group.add(edge);
      const floor = new THREE.Mesh(
        new THREE.PlaneGeometry(width - 0.08, depth - 0.08),
        new THREE.MeshBasicMaterial({
          color: getAchievementColor(output / target), transparent: true,
          opacity: 0.35, depthWrite: false, side: THREE.DoubleSide,
        }),
      );
      floor.rotation.x = -Math.PI / 2;
      floor.position.set(area.position.x, 0.045, area.position.z);
      group.add(floor);
      const hourlyOutput = [0.2, 0.25, 0.3].map((share) => Math.floor(output * share));
      hourlyOutput.push(output - hourlyOutput.reduce((sum, value) => sum + value, 0));
      const production = {
        ...team, output, target, operations, area, edge, floor,
        styleCode: `TNG-${2026 + index}`,
        workers: 24 + index % 7,
        elapsedSeconds: 4 * 3600,
        shiftSeconds: 8 * 3600,
        standardLaborSeconds: 3600,
        lastProductAt: Date.now() - (index % 3 === 0 ? 180 : 35) * 1000,
        hourlyOutput,
        quality: index % 3 === 0 ? null : { inspected: output, defects: index % 4 },
      };
      area.userData.sewingTeam = production;
      return production;
    });

    const stage = document.getElementById("stage");
    const panel = document.createElement("div");
    panel.className = "sewing-team-panel";
    panel.setAttribute("role", "tooltip");
    panel.hidden = true;
    // panel.innerHTML = '<strong></strong><small>Cân bằng chuyền · Dữ liệu mô phỏng</small><span>Sản lượng / mục tiêu <b class="team-output"></b></span><span>Công đoạn nghẽn <b class="team-bottleneck"></b></span><span>Sản lượng công đoạn <b class="team-operation-output"></b></span>';
    stage.appendChild(panel);
    const details = document.createElement("section");
    details.className = "object-info sewing-team-details";
    details.setAttribute("aria-label", "Chi tiết tổ may");
    details.hidden = true;
    details.innerHTML = '<header><div><p>CÂN BẰNG CHUYỀN · MÔ PHỎNG</p><h2></h2></div><button type="button" aria-label="Đóng chi tiết tổ may">×</button></header><div class="team-details-body"></div>';
    stage.appendChild(details);

    const pointer = new THREE.Vector2();
    const raycaster = new THREE.Raycaster();
    const anchor = new THREE.Vector3();
    const canvas = F1.renderer.domElement;
    let current = null;
    let selected = null;
    let pointerDown = null;
    let isEnabled = true;
    const visible = (object) => {
      for (let node = object; node; node = node.parent) if (!node.visible) return false;
      return true;
    };
    const bottleneckOf = (team) => team.operations.reduce((a, b) => b.output < a.output ? b : a);
    const updateHighlight = (team) => {
      team.edge.visible = isEnabled && (team === current || team === selected);
      team.area.material.opacity = team.edge.visible ? 0.12 : 0;
    };
    const clear = () => {
      const previous = current;
      current = null;
      if (previous) updateHighlight(previous);
      panel.hidden = true;
      F1.invalidate();
    };
    const closeDetails = () => {
      const previous = selected;
      selected = null;
      if (previous) {
        updateHighlight(previous);
        F1.stopFollowing();
      }
      details.hidden = true;
      F1.invalidate();
    };
    details.querySelector("button").onclick = closeDetails;
    const percent = (ratio) => `${(ratio * 100).toFixed(1)}%`;
    const renderDetails = (team) => {
      const bottleneck = bottleneckOf(team);
      const ratio = team.output / team.target;
      const efficiency = team.output * team.standardLaborSeconds /
        (team.workers * team.elapsedSeconds);
      const actualTakt = team.elapsedSeconds / team.output;
      const requiredTakt = team.elapsedSeconds / team.target;
      const forecast = Math.round(team.output / team.elapsedSeconds * team.shiftSeconds);
      const quality = team.quality;
      const metric = (name, value) => `<div><dt>${name}</dt><dd>${value}</dd></div>`;
      details.querySelector("h2").textContent = team.name;
      details.querySelector(".team-details-body").innerHTML = `
        <div class="team-achievement">${team.output} / ${team.target}<small>Sản lượng lũy kế / mục tiêu hiện tại · ${percent(ratio)}</small></div>
        <dl>
          ${metric("Mã hàng", team.styleCode)}
          ${metric("Số lao động", `${team.workers} người`)}
          ${metric("Mục tiêu / thực tế", `${team.target} / ${team.output} SP`)}
          ${metric("Tỷ lệ hoàn thành", percent(ratio))}
          ${metric("Hiệu suất lao động", percent(efficiency))}
          ${metric("Công đoạn nghẽn", `${bottleneck.name} (${bottleneck.output} SP)`)}
          ${metric("Từ sản phẩm cuối", '<span class="team-idle-time"></span>')}
          ${metric("Trạng thái máy", '<span class="team-machine-state"></span>')}
          ${metric("Nhịp thực tế / yêu cầu", `${actualTakt.toFixed(1)} / ${requiredTakt.toFixed(1)} giây/SP`)}
          ${metric("Dự báo cuối ca 8 giờ", `${forecast} SP`)}
          ${metric("Tỷ lệ lỗi", quality ? `${percent(quality.defects / quality.inspected)} (${quality.defects}/${quality.inspected} SP kiểm)` : "Chưa có dữ liệu kiểm hàng")}
        </dl>
        <h3>Sản lượng từng công đoạn</h3>
        <table><thead><tr><th>Công đoạn / thiết bị</th><th>Thực tế / KH</th><th>Δ so với trước</th></tr></thead>
        <tbody>${team.operations.map((operation, index) => {
          const delta = index ? operation.output - team.operations[index - 1].output : null;
          return `<tr${operation === bottleneck ? ' class="is-bottleneck"' : ""}><td>${operation.name}<small>${operation.device}</small></td><td>${operation.output} / ${operation.target}</td><td>${delta === null ? "—" : `${delta > 0 ? "+" : ""}${delta} SP`}</td></tr>`;
        }).join("")}</tbody></table>
        <p class="team-note">Δ = sản lượng công đoạn này − công đoạn liền trước.</p>
        <h3>Sản lượng theo giờ</h3>
        <div class="team-hourly">${team.hourlyOutput.map((output, index) => `<span>Giờ ${index + 1}<b>${output} SP</b></span>`).join("")}</div>
        <p class="team-note">Dữ liệu mô phỏng sau 4 giờ. Hiệu suất = sản lượng × thời gian lao động chuẩn / tổng thời gian lao động. Trạng thái chạy/dừng suy ra từ thời điểm sản phẩm cuối (ngưỡng 120 giây). Dự báo giữ nguyên tốc độ sản xuất hiện tại.</p>`;
    };
    const updateIdleTime = () => {
      if (!selected) return;
      const seconds = Math.max(0, Math.floor((Date.now() - selected.lastProductAt) / 1000));
      details.querySelector(".team-idle-time").textContent = `${Math.floor(seconds / 60)} phút ${seconds % 60} giây`;
      details.querySelector(".team-machine-state").textContent =
        seconds >= STOP_TIMEOUT_SECONDS ? "Dừng (không có sản phẩm mới)" : "Đang chạy";
    };
    const select = (team, focus = false) => {
      app.objectInfo.close();
      closeDetails();
      clear();
      selected = team;
      updateHighlight(team);
      renderDetails(team);
      updateIdleTime();
      details.hidden = false;
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
        (event.clientX - bounds.left) / bounds.width * 2 - 1,
        -(event.clientY - bounds.top) / bounds.height * 2 + 1,
      );
      group.updateWorldMatrix(true, true);
      raycaster.setFromCamera(pointer, F1.camera);
      if (app.interaction.pickDevice(pointer)) return null;
      return raycaster.intersectObjects(teams.map((team) => team.area))[0]?.object.userData.sewingTeam;
    };
    canvas.addEventListener("pointermove", (event) => {
      if (!isEnabled || event.buttons || event.pointerType === "touch") return clear();
      const next = pickTeam(event);
      if (!next) return clear();
      if (next === current) return;
      clear();
      current = next;
      app.agv.dismissHoverPanel();
      app.environmentSensors.dismissHoverPanel();
      updateHighlight(next);
      const bottleneck = bottleneckOf(next);
      panel.querySelector("strong").textContent = next.name;
      panel.querySelector(".team-output").textContent = `${next.output}/${next.target}`;
      panel.querySelector(".team-bottleneck").textContent = bottleneck.name;
      panel.querySelector(".team-operation-output").textContent = `${bottleneck.output} sản phẩm`;
      panel.hidden = false;
      F1.invalidate();
    });
    canvas.addEventListener("pointerdown", (event) => {
      pointerDown = event.button === 0 ? { x: event.clientX, y: event.clientY } : null;
    });
    canvas.addEventListener("pointerup", (event) => {
      const start = pointerDown;
      pointerDown = null;
      if (!start || event.button !== 0 || Math.hypot(event.clientX - start.x, event.clientY - start.y) > 7) return;
      const team = pickTeam(event);
      if (team) select(team);
    });
    canvas.addEventListener("pointercancel", () => { pointerDown = null; });
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
    const button = document.createElement("button");
    button.id = "tSewingBalance";
    button.type = "button";
    button.textContent = "Cân bằng chuyền";
    button.title = "Ẩn/hiện cảnh báo, màu sàn và highlight cân bằng chuyền";
    button.setAttribute("aria-pressed", "true");
    document.querySelector(".toolbar").appendChild(button);
    button.onclick = () => {
      isEnabled = !isEnabled;
      button.setAttribute("aria-pressed", String(isEnabled));
      clear();
      teams.forEach((team) => {
        team.floor.visible = isEnabled;
        updateHighlight(team);
      });
      if (!isEnabled) markers.forEach(({ marker }) => marker.hide());
      F1.invalidate();
    };
    window.setInterval(() => {
      if (!document.hidden && selected) updateIdleTime();
    }, 1000);
    F1.frameHooks.push(() => {
      if (!visible(group)) {
        if (current) clear();
        if (selected) closeDetails();
      }
      return false;
    });
    F1.overlayRenderers.push(() => {
      if (current) {
        current.area.getWorldPosition(anchor);
        anchor.y += 2;
        anchor.project(F1.camera);
        panel.style.visibility = Math.abs(anchor.z) > 1 ? "hidden" : "visible";
        panel.style.left = `${Math.max(155, Math.min(canvas.clientWidth - 155, (anchor.x + 1) * canvas.clientWidth / 2))}px`;
        panel.style.top = `${Math.max(145, (1 - anchor.y) * canvas.clientHeight / 2)}px`;
      }
      markers.forEach(({ team, marker }) => {
        marker.update({
          camera: F1.camera,
          canvas,
          isVisible: isEnabled && visible(group) && team.output / team.target < 0.85,
          getWorldPosition(position) {
            position.set(team.x, 4.9, team.headZ).applyMatrix4(group.matrixWorld);
          },
        });
      });
    });
    app.sewingTeams = { teams, clear, select, closeDetails, getAchievementColor };
  };
})();
