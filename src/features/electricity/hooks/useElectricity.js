"use client";

import { useEffect, useSyncExternalStore } from "react";

import { ELECTRICITY_STORAGE_KEY, electricityStore } from "../model/electricity-store";

export function useElectricity() {
  const snapshot = useSyncExternalStore(
    electricityStore.subscribe,
    electricityStore.getSnapshot,
    electricityStore.getServerSnapshot
  );

  useEffect(() => {
    try {
      electricityStore.setCollapsed(localStorage.getItem(ELECTRICITY_STORAGE_KEY) === "true");
    } catch (error) {
      console.warn("Không thể đọc tùy chọn giám sát điện:", error);
    }
    const persist = () => {
      try {
        localStorage.setItem(
          ELECTRICITY_STORAGE_KEY,
          String(electricityStore.getSnapshot().collapsed)
        );
      } catch (error) {
        console.warn("Không thể lưu tùy chọn giám sát điện:", error);
      }
    };
    return electricityStore.subscribe(persist);
  }, []);

  return { ...snapshot, config: electricityStore.config, setCollapsed: electricityStore.setCollapsed };
}
