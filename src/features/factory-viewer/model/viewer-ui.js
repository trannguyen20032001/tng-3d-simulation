import { flushSync } from "react-dom";

import { createStore } from "@/common/state/create-store";

export const CONTROL_GROUPS = [
  ["Góc nhìn", [["vExt", "Ngoại cảnh"], ["vPersp", "Bên trong", true], ["vTop", "Mặt bằng"]]],
  ["Tầng", [["mT1", "Tầng 1"], ["mT2", "Tầng 2"], ["mBoth", "Cả hai", true]]],
  ["Kết cấu tầng", [["mSplit", "Tách tầng"], ["tCeil2", "Trần T2"]]],
  ["Trình chiếu", [
    ["tSlideshow", "Slideshow"], ["tSpin", "Tự xoay"],
    ["tMotion", "Chuyển động"], ["tQuality", "Chất lượng cao"],
  ]],
  ["Hiển thị", [
    ["tLabels", "Nhãn", true], ["tFlow", "Luồng hàng", true],
    ["tWalls", "Tường", true], ["tTrees", "Cây", true], ["tArea", "Diện tích", true],
    ["tAgv", "AGV", true], ["tAgvRoutes", "Tuyến AGV", true],
    ["tEnvSensors", "Cảm biến", true], ["tSewingBalance", "Cân bằng chuyền", true],
  ]],
];

export const controlsStore = createStore({
  pressed: Object.fromEntries(CONTROL_GROUPS.flatMap(([, controls]) =>
    controls.map(([id, , pressed]) => [id, Boolean(pressed)])
  )),
  titles: { tQuality: "Tăng độ phân giải, bật đèn điểm và tăng độ nét bóng đổ" },
});
export const layoutStore = createStore({ panelCollapsed: false, toolbarCollapsed: false });
export const zonesStore = createStore({ floor1: [], floor2: [], selected: null });
export const objectInfoStore = createStore({ reading: null });
export const areaDetailsStore = createStore({ reading: null });
export const agvHoverStore = createStore({ reading: null });
export const sensorHoverStore = createStore({ reading: null });

const actions = new Map();
export const bindAction = (id, action) => actions.set(id, action);
export const runAction = (id, ...args) => actions.get(id)?.(...args);

// Legacy preference restoration reads DOM state immediately after each action.
// Commit only discrete controls synchronously; frame updates never use this path.
export function setPressed(id, pressed) {
  const current = controlsStore.getSnapshot().pressed;
  if (current[id] === pressed) return;
  flushSync(() => controlsStore.set({ pressed: { ...current, [id]: pressed } }));
}

export function setLayout(changes) {
  flushSync(() => layoutStore.set(changes));
}

export function setZones(floor, zones) {
  flushSync(() => zonesStore.set({ [floor]: zones }));
}

export function setControlTitle(id, title) {
  controlsStore.set({ titles: { ...controlsStore.getSnapshot().titles, [id]: title } });
}
