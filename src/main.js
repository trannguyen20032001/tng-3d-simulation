(function () {
  "use strict";
  TNG.areas.buildFloor1(TNG.state);
  TNG.areas.buildFloor2(TNG.state);
  TNG.state.interaction = TNG.core.createInteractionManager(TNG.state);
  TNG.features.setupAgv(TNG.state);
  TNG.features.setupEnvironmentSensors(TNG.state);
  TNG.state.f1.updatePointLights();
  TNG.features.setupSewingTeams(TNG.state);
  const hoverOutline = TNG.features.createHoverOutline(TNG.state.f1);
  TNG.state.agv.agents.forEach((agent) => hoverOutline.register(agent.robot));
  TNG.state.environmentSensors.sensors.forEach((sensor) => hoverOutline.register(sensor.sensor));
  TNG.state.hoverOutline = hoverOutline;
  TNG.features.setupSlideshow(TNG.state);
  TNG.features.setupElectricity(TNG.state);
  const toolbar = document.querySelector(".toolbar");
  const toolbarBody = document.createElement("div");
  toolbarBody.id = "toolbarBody";
  toolbarBody.className = "toolbar-body";
  const groups = [
    ["Góc nhìn", ["vExt", "vPersp", "vTop"]],
    ["Tầng", ["mT1", "mT2", "mBoth"]],
    ["Kết cấu tầng", ["mSplit", "tCeil2"]],
    ["Trình chiếu", ["tSlideshow", "tSpin", "tMotion", "tQuality"]],
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
  toolbar.append(toolbarToggle, toolbarBody);
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

  const mobilePopups = window.matchMedia("(max-width: 767.98px)");
  const panel = document.getElementById("panel");
  const electricity = document.getElementById("electricityCard");
  const objectInfo = document.getElementById("objectInfo");
  const teamDetails = document.querySelector(".sewing-team-details");
  const areaDetails = document.querySelector(".slideshow-area-details");
  const popups = [
    { element: panel, isOpen: () => !panel.classList.contains("collapsed"),
      close: () => {
        panel.classList.add("collapsed");
        document.getElementById("toggleList").textContent = "▸";
      } },
    { element: toolbar, isOpen: () => !toolbar.classList.contains("is-collapsed"),
      close: () => {
        toolbarBody.hidden = true;
        toolbar.classList.add("is-collapsed");
        toolbarToggle.setAttribute("aria-expanded", "false");
        toolbarToggle.textContent = "▸ Điều khiển";
      } },
    { element: electricity, isOpen: () => !electricity.classList.contains("is-collapsed"),
      close: () => TNG.state.electricity.setCollapsed(true) },
    { element: objectInfo, isOpen: () => !objectInfo.hidden,
      close: () => TNG.state.objectInfo.close() },
    { element: teamDetails, isOpen: () => !teamDetails.hidden,
      close: () => TNG.state.sewingTeams.closeDetails() },
    { element: areaDetails, isOpen: () => !areaDetails.hidden,
      close: () => areaDetails.querySelector("header button").click() },
  ];
  const showOnly = (active) => {
    if (!mobilePopups.matches || !active) return;
    popups.forEach((popup) => {
      if (popup !== active && popup.isOpen()) popup.close();
    });
  };
  const popupObserver = new MutationObserver((records) => {
    const opened = records
      .map(({ target }) => popups.find(({ element }) => element === target))
      .filter((popup) => popup?.isOpen());
    showOnly(opened.at(-1));
  });
  popups.forEach(({ element }) => popupObserver.observe(element, {
    attributes: true,
    attributeFilter: ["class", "hidden"],
  }));
  const reconcilePopups = () => {
    showOnly(popups.find(({ element, isOpen }) => element === toolbar && isOpen()) ||
      popups.find(({ isOpen }) => isOpen()));
  };
  mobilePopups.addEventListener("change", reconcilePopups);
  reconcilePopups();

  const dismissOnOutsideClick = [popups[0], popups[1], popups[2], popups[5]];
  document.addEventListener("click", (event) => {
    const target = event.target;
    if (!(target instanceof Element)) return;
    dismissOnOutsideClick.forEach((popup) => {
      if (!popup.isOpen() || popup.element.contains(target)) return;
      // The slideshow button handles its own open/close action.
      if (popup.element === areaDetails && target.closest("#tSlideshow")) return;
      popup.close();
    });
  }, true);
})();
