"use client";

import { useSyncExternalStore } from "react";

import { areaDetailsStore, runAction } from "../model/viewer-ui";

export default function SlideshowAreaDetails() {
  const { reading } = useSyncExternalStore(
    areaDetailsStore.subscribe, areaDetailsStore.getSnapshot, areaDetailsStore.getServerSnapshot
  );
  return (
    <aside className="object-info slideshow-area-details" hidden={!reading} aria-live="polite">
      <header>
        <div><p>KHU VỰC NHÀ MÁY</p><h2>{reading?.name}</h2></div>
        <button type="button" aria-label="Đóng thông tin khu vực"
          onClick={() => runAction("closeAreaDetails")}>×</button>
      </header>
      <dl>
        <div><dt>Tầng</dt><dd className="slide-floor">{reading?.floor}</dd></div>
        <div><dt>Mô tả</dt><dd className="slide-description">{reading?.description}</dd></div>
      </dl>
    </aside>
  );
}
