(function () {
  "use strict";
  TNG.areas.buildFloor1(TNG.state);
  TNG.areas.buildFloor2(TNG.state);
  TNG.state.interaction = TNG.core.createInteractionManager(TNG.state);
  TNG.features.setupAgv(TNG.state);
  TNG.features.setupEnvironmentSensors(TNG.state);
  TNG.features.setupSewingTeams(TNG.state);
  const hoverOutline = TNG.features.createHoverOutline(TNG.state.f1);
  TNG.state.agv.agents.forEach((agent) => hoverOutline.register(agent.robot));
  TNG.state.environmentSensors.sensors.forEach((sensor) => hoverOutline.register(sensor.sensor));
  TNG.state.hoverOutline = hoverOutline;
  TNG.features.setupSlideshow(TNG.state);
  const toolbar = document.querySelector(".toolbar");
  const toolbarBody = document.createElement("div");
  toolbarBody.id = "toolbarBody";
  toolbarBody.className = "toolbar-body";
  const groups = [
    ["Góc nhìn", ["vExt", "vPersp", "vTop"]],
    ["Tầng", ["mT1", "mT2", "mBoth"]],
    ["Kết cấu tầng", ["mSplit", "tCeil2"]],
    ["Trình chiếu", ["tSlideshow", "tSpin", "tMotion"]],
    ["Hiển thị", ["tLabels", "tFlow", "tWalls", "tTrees", "tArea", "tAgv",
      "tAgvRoutes", "tEnvSensors", "tSewingBalance"]],
  ];
  groups.forEach(([name, ids]) => {
    const group = document.createElement("div");
    group.className = "toolbar-group";
    group.setAttribute("role", "group");
    group.setAttribute("aria-label", name);
    const label = document.createElement("span");
    label.className = "toolbar-group-label";
    label.textContent = name;
    group.appendChild(label);
    ids.forEach((id) => group.appendChild(document.getElementById(id)));
    toolbarBody.appendChild(group);
  });
  toolbar.querySelectorAll(".sep").forEach((separator) => separator.remove());
  const toolbarToggle = document.createElement("button");
  toolbarToggle.id = "toggleToolbar";
  toolbarToggle.type = "button";
  toolbarToggle.className = "toolbar-toggle";
  toolbarToggle.setAttribute("aria-controls", toolbarBody.id);
  toolbarToggle.setAttribute("aria-expanded", "true");
  toolbarToggle.textContent = "▾ Thu gọn điều khiển";
  toolbarToggle.onclick = () => {
    const expanded = toolbarToggle.getAttribute("aria-expanded") !== "true";
    toolbarBody.hidden = !expanded;
    toolbar.classList.toggle("is-collapsed", !expanded);
    toolbarToggle.setAttribute("aria-expanded", String(expanded));
    toolbarToggle.textContent = expanded ? "▾ Thu gọn điều khiển" : "▸ Điều khiển";
  };
  toolbar.append(toolbarBody, toolbarToggle);
  TNG.features.restorePreferences();
  const panelHeader = document.querySelector(".panel header");
  const updatePanelLayout = () => {
    document.documentElement.style.setProperty(
      "--toolbar-height", `${toolbar.getBoundingClientRect().height}px`,
    );
    document.documentElement.style.setProperty(
      "--panel-header-height", `${panelHeader.getBoundingClientRect().height}px`,
    );
  };
  const layoutObserver = new ResizeObserver(updatePanelLayout);
  layoutObserver.observe(toolbar);
  layoutObserver.observe(panelHeader);
  updatePanelLayout();
})();
