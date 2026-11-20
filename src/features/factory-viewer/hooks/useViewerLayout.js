"use client";

import { useEffect } from "react";

import { setLayout } from "@/features/factory-viewer/model/viewer-ui";

export function useViewerLayout(ready) {
  useEffect(() => {
    if (!ready) return;
    return observeViewerLayout();
  }, [ready]);
}

function observeViewerLayout() {
  const toolbar = document.querySelector(".toolbar");
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
  window.addEventListener("resize", updatePanelLayout);
  updatePanelLayout();

  const mobilePopups = window.matchMedia("(max-width: 767.98px)");
  const panel = document.getElementById("panel");
  const electricity = document.getElementById("electricityCard");
  const objectInfo = document.getElementById("objectInfo");
  const teamDetails = document.querySelector(".sewing-team-details");
  const areaDetails = document.querySelector(".slideshow-area-details");
  const popups = [
    { element: panel, isOpen: () => !panel.classList.contains("collapsed"),
      close: () => setLayout({ panelCollapsed: true }) },
    { element: toolbar, isOpen: () => !toolbar.classList.contains("is-collapsed"),
      close: () => setLayout({ toolbarCollapsed: true }) },
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
  let active = true;
  queueMicrotask(() => {
    if (active) reconcilePopups();
  });

  const dismissOnOutsideClick = [popups[0], popups[1], popups[2], popups[5]];
  const dismissOutside = (event) => {
    const target = event.target;
    if (!(target instanceof Element)) return;
    dismissOnOutsideClick.forEach((popup) => {
      if (!popup.isOpen() || popup.element.contains(target)) return;
      // The slideshow button handles its own open/close action.
      if (popup.element === areaDetails && target.closest("#tSlideshow")) return;
      popup.close();
    });
  };
  document.addEventListener("click", dismissOutside, true);
  return () => {
    active = false;
    layoutObserver.disconnect();
    popupObserver.disconnect();
    mobilePopups.removeEventListener("change", reconcilePopups);
    window.removeEventListener("resize", updatePanelLayout);
    document.removeEventListener("click", dismissOutside, true);
    document.documentElement.style.removeProperty("--toolbar-height");
    document.documentElement.style.removeProperty("--panel-header-height");
  };
}
