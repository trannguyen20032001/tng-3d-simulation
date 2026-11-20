import * as Three from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import {
  CSS2DObject,
  CSS2DRenderer,
} from "three/examples/jsm/renderers/CSS2DRenderer.js";

import { electricityStore } from "@/features/electricity/model/electricity-store";

let startupPromise;

export function startFactory() {
  if (startupPromise) return startupPromise;

  // Existing geometry modules register factories on TNG. Loading in this order
  // preserves their dependencies while Next.js bundles every module locally.
  window.THREE = { ...Three, OrbitControls, CSS2DObject, CSS2DRenderer };
  startupPromise = (async () => {
    await import("@/common/three/core/app");
    window.TNG.state.electricity = electricityStore;
    await import("@/common/three/core/textures");
    await import("@/common/three/core/random");
    await import("@/common/three/core/coordinates");
    await import("@/common/three/core/interaction-manager");
    await import("@/common/three/objects/ui/warning-marker");
    await import("@/common/three/objects/people/standing-person");
    await import("@/common/three/objects/storage/pallet-rack");
    await import("@/common/three/objects/storage/shelf");
    await import("@/common/three/objects/machines/cutting-table");
    await import("@/common/three/objects/machines/agv");
    await import("@/common/three/objects/machines/environment-sensor");
    await import("@/common/three/objects/storage/crate");
    await import("@/common/three/objects/storage/carton-stack");
    await import("@/common/three/objects/storage/trolley");
    await import("@/common/three/objects/outdoor/forklift");
    await import("@/common/three/objects/storage/accessory-shelf");
    await import("@/common/three/objects/outdoor/car");
    await import("@/common/three/objects/outdoor/truck");
    await import("@/common/three/objects/outdoor/lamp");
    await import("@/common/three/objects/furniture/stool");
    await import("@/common/three/objects/furniture/table");
    await import("@/common/three/objects/people/seated-worker");
    await import("@/common/three/objects/furniture/chair");
    await import("@/common/three/objects/furniture/sofa-set");
    await import("./layout/floor-2/data/d");
    await import("./layout/floor-2/data/w2");
    await import("./layout/floor-2/data/t3");
    await import("./layout/canteen/data/cseg");
    await import("@/common/three/core/instance-batch");
    await import("./layout/canteen/build");
    await import("@/common/three/core/static-batch");
    await import("./simulation/floor-controls");
    await import("./simulation/agv");
    await import("./simulation/environment-sensors");
    await import("./simulation/sewing-teams");
    await import("./simulation/hover-outline");
    await import("./simulation/preferences");
    await import("./simulation/slideshow");
    await import("./layout/floor-1/build");
    await import("./layout/floor-2/build");
    await import("./bootstrap-legacy");
  })();

  return startupPromise;
}
