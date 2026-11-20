"use client";

import { useSyncExternalStore } from "react";

import { layoutStore, zonesStore, setLayout } from "../model/viewer-ui";

export default function FactoryZones() {
  const { floor1, floor2, selected } = useSyncExternalStore(
    zonesStore.subscribe, zonesStore.getSnapshot, zonesStore.getServerSnapshot
  );
  const { panelCollapsed } = useSyncExternalStore(
    layoutStore.subscribe, layoutStore.getSnapshot, layoutStore.getServerSnapshot
  );
  const renderZone = (zone) => (
    <li key={zone.id}>
      <button type="button" id={zone.id} className={selected === zone.id ? "on" : ""}
        onClick={() => {
          zonesStore.set({ selected: zone.id });
          zone.activate();
        }}>
        <span className="num" style={{ background: zone.col, fontSize: zone.floor === 2 ? 9 : undefined }}>
          {zone.n}
        </span>
        <span><div className="zn">{zone.name}</div><div className="zd">{zone.d}</div></span>
      </button>
    </li>
  );
  return (
    <aside className={`panel${panelCollapsed ? " collapsed" : ""}`} id="panel">
      <header>
        <div><h1>Nhà máy may TNG Việt Đức</h1></div>
        <button id="toggleList" aria-label="Thu gọn danh sách khu" title="Thu gọn"
          onClick={() => setLayout({ panelCollapsed: !panelCollapsed })}>
          {panelCollapsed ? "▸" : "▾"}
        </button>
      </header>
      <ol className="zones" id="zones">
        {floor1.filter((zone) => zone.id !== "z-all").map(renderZone)}
        {floor2.length > 0 && <li><div className="zones-floor-heading">TẦNG 2</div></li>}
        {floor2.map(renderZone)}
        {floor1.filter((zone) => zone.id === "z-all").map(renderZone)}
      </ol>
    </aside>
  );
}
