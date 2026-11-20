"use client";

import { useSyncExternalStore } from "react";

import {
  CONTROL_GROUPS, controlsStore, layoutStore, runAction, setLayout,
} from "../model/viewer-ui";

export default function FactoryToolbar() {
  const { pressed, titles } = useSyncExternalStore(
    controlsStore.subscribe, controlsStore.getSnapshot, controlsStore.getServerSnapshot
  );
  const { toolbarCollapsed } = useSyncExternalStore(
    layoutStore.subscribe, layoutStore.getSnapshot, layoutStore.getServerSnapshot
  );
  return (
    <nav className={`toolbar${toolbarCollapsed ? " is-collapsed" : ""}`} aria-label="Chế độ xem">
      <button
        id="toggleToolbar" type="button" className="toolbar-toggle"
        aria-controls="toolbarBody" aria-expanded={!toolbarCollapsed}
        onClick={() => setLayout({ toolbarCollapsed: !toolbarCollapsed })}
      >
        {toolbarCollapsed ? "▸ Điều khiển" : "▾ Thu gọn điều khiển"}
      </button>
      <div id="toolbarBody" className="toolbar-body" hidden={toolbarCollapsed}>
        {CONTROL_GROUPS.map(([name, controls]) => (
          <div key={name} className="toolbar-group" role="group" aria-label={name}>
            <span className="toolbar-group-label">{name}</span>
            {controls.map(([id, label]) => (
              <button key={id} id={id} type="button" aria-pressed={pressed[id]}
                title={titles[id]} onClick={() => runAction(id)}>
                {label}
              </button>
            ))}
          </div>
        ))}
      </div>
    </nav>
  );
}
