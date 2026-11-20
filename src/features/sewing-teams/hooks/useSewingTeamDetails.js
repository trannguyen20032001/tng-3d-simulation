"use client";

import { useEffect, useState, useSyncExternalStore } from "react";

import { sewingTeamStore, STOP_TIMEOUT_SECONDS } from "../model/sewing-team-store";

export function useSewingTeamDetails() {
  const team = useSyncExternalStore(
    sewingTeamStore.subscribe,
    sewingTeamStore.getSnapshot,
    sewingTeamStore.getServerSnapshot
  );
  const [now, setNow] = useState(null);

  useEffect(() => {
    if (!team) return;
    const updateTime = () => {
      if (!document.hidden) setNow(Date.now());
    };
    updateTime();
    const timer = window.setInterval(updateTime, 1000);
    document.addEventListener("visibilitychange", updateTime);
    return () => {
      window.clearInterval(timer);
      document.removeEventListener("visibilitychange", updateTime);
    };
  }, [team]);

  const idleSeconds = team
    ? Math.max(0, Math.floor(((now ?? Date.now()) - team.lastProductAt) / 1000))
    : 0;

  return {
    team,
    idleSeconds,
    isStopped: idleSeconds >= STOP_TIMEOUT_SECONDS,
    closeDetails: sewingTeamStore.close,
  };
}
