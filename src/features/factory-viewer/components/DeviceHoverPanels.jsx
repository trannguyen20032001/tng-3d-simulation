"use client";

import { useSyncExternalStore } from "react";

import { agvHoverStore, sensorHoverStore } from "../model/viewer-ui";

function AgvHoverPanel() {
  const { reading } = useSyncExternalStore(
    agvHoverStore.subscribe, agvHoverStore.getSnapshot, agvHoverStore.getServerSnapshot
  );
  return (
    <div id="agvHoverPanel" className="agv-hover-panel" role="tooltip" hidden={!reading}>
      <strong className="agv-hover-name">{reading?.name}</strong>
      <span className={`agv-hover-status ${reading?.severity || ""}`}>{reading?.status}</span>
      <span className="agv-hover-caption">Nhiệm vụ hiện tại</span>
      <span className="agv-hover-task">{reading?.task}</span>
    </div>
  );
}

function SensorHoverPanel() {
  const { reading } = useSyncExternalStore(
    sensorHoverStore.subscribe, sensorHoverStore.getSnapshot, sensorHoverStore.getServerSnapshot
  );
  return (
    <div id="sensorHoverPanel" className="sensor-hover-panel" role="tooltip" hidden={!reading}>
      <strong className="sensor-hover-name">{reading?.name}</strong>
      <span>Nhiệt độ <b className="sensor-hover-temperature">{reading?.temperature}</b></span>
      <span>Độ ẩm <b className="sensor-hover-humidity">{reading?.humidity}</b></span>
    </div>
  );
}

export default function DeviceHoverPanels() {
  return <><AgvHoverPanel /><SensorHoverPanel /></>;
}
