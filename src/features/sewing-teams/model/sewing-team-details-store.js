export const STOP_TIMEOUT_SECONDS = 120;

export const percent = (ratio) => `${(ratio * 100).toFixed(1)}%`;

export const bottleneckOf = (team) =>
  team.operations.reduce((previous, operation) =>
    operation.output < previous.output ? operation : previous
  );

export function getProductionMetrics(team) {
  return {
    bottleneck: bottleneckOf(team),
    ratio: team.output / team.target,
    efficiency: team.output * team.standardLaborSeconds / (team.workers * team.elapsedSeconds),
    actualTakt: team.elapsedSeconds / team.output,
    requiredTakt: team.elapsedSeconds / team.target,
    forecast: Math.round(team.output / team.elapsedSeconds * team.shiftSeconds),
  };
}

const listeners = new Set();
let selectedTeam = null;
let closeSelection = null;

export const sewingTeamDetailsStore = {
  subscribe(listener) {
    listeners.add(listener);
    return () => listeners.delete(listener);
  },
  getSnapshot: () => selectedTeam,
  getServerSnapshot: () => null,
  open(team, onClose) {
    // Keep scene objects out of React's view model.
    const { area, edge, floor, ...production } = team;
    selectedTeam = production;
    closeSelection = onClose;
    listeners.forEach((listener) => listener());
  },
  clear() {
    if (!selectedTeam) return;
    selectedTeam = null;
    closeSelection = null;
    listeners.forEach((listener) => listener());
  },
  close() {
    closeSelection?.();
  },
};
