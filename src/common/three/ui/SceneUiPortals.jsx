"use client";

import { useEffect, useSyncExternalStore } from "react";
import { createPortal } from "react-dom";

import { createStore } from "@/common/state/create-store";

const sceneUiStore = createStore({ entries: [] });
let nextId = 0;

function createHost(kind, props, parent) {
  // CSS2DRenderer requires a DOM anchor. React owns the anchor's UI children.
  const host = document.createElement("div");
  const entry = { id: ++nextId, kind, host, props };
  if (parent) parent.appendChild(host);
  sceneUiStore.set({ entries: [...sceneUiStore.getSnapshot().entries, entry] });
  return host;
}

export function createSceneLabel(props) {
  return createHost("label", props);
}

export function createWarningHost(props, stage) {
  const host = createHost("warning", props, stage);
  host.style.display = "contents";
  host.hidden = true;
  return host;
}

function SceneLabel({ text, badge, className = "", area = false }) {
  if (area) {
    return (
      <div className="lbl scene-area-label">
        Tổng diện tích xây dựng <b>40.521 m²</b>
      </div>
    );
  }
  return (
    <div className={`lbl ${className}`.trim()}>
      {badge && <span className="num" style={{ background: badge.color }}>{badge.number}</span>}
      {text}
    </div>
  );
}

function WarningMarker({ className, data, label, onActivate }) {
  const attributes = Object.fromEntries(Object.entries(data).map(([key, value]) => [
    `data-${key.replace(/[A-Z]/g, (letter) => `-${letter.toLowerCase()}`)}`, value,
  ]));
  return (
    <button {...attributes} type="button" className={`warning-marker ${className}`.trim()}
      title={label} aria-label={label} onClick={onActivate}>!</button>
  );
}

export default function SceneUiPortals() {
  const { entries } = useSyncExternalStore(
    sceneUiStore.subscribe, sceneUiStore.getSnapshot, sceneUiStore.getServerSnapshot
  );
  useEffect(() => {
    window.TNG?.state?.f1?.invalidate();
  }, [entries]);
  return entries.map(({ id, kind, host, props }) => createPortal(
    kind === "label" ? <SceneLabel {...props} /> : <WarningMarker {...props} />,
    host,
    id
  ));
}
