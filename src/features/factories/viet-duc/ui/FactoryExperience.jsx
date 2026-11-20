"use client";

import { useEffect, useState } from "react";

import ElectricityPanel from "@/features/electricity/components/ElectricityPanel";
import SewingTeamDetails from "@/features/sewing-teams/components/SewingTeamDetails";
import FactoryToolbar from "@/features/factory-viewer/components/FactoryToolbar";
import FactoryZones from "@/features/factory-viewer/components/FactoryZones";
import ObjectInfoPanel from "@/features/factory-viewer/components/ObjectInfoPanel";
import SlideshowAreaDetails from "@/features/factory-viewer/components/SlideshowAreaDetails";
import DeviceHoverPanels from "@/features/factory-viewer/components/DeviceHoverPanels";
import SceneUiPortals from "@/common/three/ui/SceneUiPortals";
import { useViewerLayout } from "@/features/factory-viewer/hooks/useViewerLayout";

export default function FactoryExperience() {
  const [loading, setLoading] = useState("Đang dựng mô hình…");
  useViewerLayout(loading === null);
  useEffect(() => {
    let active = true;

    import("../start")
      .then(({ startFactory }) => {
        if (active) return startFactory().then(() => {
          if (active) setLoading(null);
        });
      })
      .catch((error) => {
        console.error("Không thể khởi tạo mô hình 3D:", error);
        if (active) setLoading("Không thể tải mô hình 3D.");
      });

    return () => {
      active = false;
    };
  }, []);

  return (
    <>
      <div id="stage"><DeviceHoverPanels /></div>
      <div id="loading" hidden={!loading}>{loading}</div>
      <ElectricityPanel />
      <SewingTeamDetails />

      <FactoryZones />
      <ObjectInfoPanel />
      <SlideshowAreaDetails />
      <FactoryToolbar />
      <SceneUiPortals />
    </>
  );
}
