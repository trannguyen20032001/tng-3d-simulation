export const ELECTRICITY_STORAGE_KEY = "tng-viet-duc-3d:electricity-collapsed";

export const ELECTRICITY_PERIODS = [
  ["peak", "Cao điểm"],
  ["normal", "Bình thường"],
  ["offPeak", "Thấp điểm"],
];

const factoryReading = {
  name: "Toàn nhà máy",
  shift: { peak: 168, normal: 612, offPeak: 84 },
  day: { peak: 360, normal: 960, offPeak: 240 },
  hourly: [
    10, 8, 8, 8, 10, 16, 35, 70, 112, 122, 127, 97,
    77, 112, 127, 132, 122, 112, 80, 65, 45, 30, 20, 15,
  ],
  powerFactor: 0.87,
  temperature: 62,
  simulated: true,
};

export function formatNumber(value, digits = 1) {
  return Number.isFinite(value)
    ? value.toLocaleString("vi-VN", {
        minimumFractionDigits: digits,
        maximumFractionDigits: digits,
      })
    : "—";
}

export function totalEnergy(buckets) {
  return ELECTRICITY_PERIODS.reduce((sum, [key]) => sum + buckets[key], 0);
}

export function createElectricityStore() {
  const readings = new Map([["factory", factoryReading]]);
  const listeners = new Set();
  const config = { minPowerFactor: 0.9, maxTemperature: 60 };
  const initialSnapshot = { scope: "factory", reading: factoryReading, collapsed: false };
  let snapshot = initialSnapshot;

  const publish = (changes) => {
    snapshot = { ...snapshot, ...changes };
    listeners.forEach((listener) => listener());
  };

  return {
    config,
    subscribe(listener) {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
    getSnapshot: () => snapshot,
    getServerSnapshot: () => initialSnapshot,
    render: () => publish({}),
    setCollapsed(collapsed) {
      if (snapshot.collapsed !== collapsed) publish({ collapsed });
    },
    setReading(id, reading) {
      readings.set(id, reading);
      if (snapshot.scope === id) publish({ reading });
    },
    selectScope(scope) {
      if (!readings.has(scope)) return false;
      publish({ scope, reading: readings.get(scope) });
      return true;
    },
    get scope() {
      return snapshot.scope;
    },
    get reading() {
      return snapshot.reading;
    },
  };
}

// Shared with the Three.js adapter; the React panel subscribes only to electricity changes.
export const electricityStore = createElectricityStore();
