"use client";

import { useSyncExternalStore } from "react";

import { objectInfoStore, runAction } from "../model/viewer-ui";

export default function ObjectInfoPanel() {
  const { reading } = useSyncExternalStore(
    objectInfoStore.subscribe, objectInfoStore.getSnapshot, objectInfoStore.getServerSnapshot
  );
  const sensor = reading?.kind === "sensor";
  const fields = [
    ["floor", "Tầng"], ["status", "Trạng thái"], ["battery", "Pin"],
    ["load", "Hàng đang tải"], ["speed", "Tốc độ"],
    ["temperature", "Nhiệt độ"], ["humidity", "Độ ẩm"],
  ];
  return (
    <aside className="object-info" id="objectInfo" hidden={!reading} aria-live="polite">
      <header>
        <div><p>THIẾT BỊ ĐANG CHỌN</p><h2 id="objectInfoName">{reading?.name}</h2></div>
        <button id="closeObjectInfo" type="button" aria-label="Đóng thông tin"
          onClick={() => runAction("closeObjectInfo")}>×</button>
      </header>
      <dl>
        {fields.map(([key, label], index) => (
          <div key={key} hidden={index >= 2 && (index >= 5 ? !sensor : sensor)}
            style={key === "speed" && !sensor ? { borderBottom: 0 } : undefined}>
            <dt>{label}</dt>
            <dd id={`objectInfo${key[0].toUpperCase()}${key.slice(1)}`}>{reading?.[key] || "—"}</dd>
          </div>
        ))}
      </dl>
    </aside>
  );
}
