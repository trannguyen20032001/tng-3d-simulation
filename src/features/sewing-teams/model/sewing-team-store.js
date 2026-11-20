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

function createSewingTeamStore() {
  const listeners = new Set();
  let selection = null;
  let closeSelection = null;

  const publish = () => listeners.forEach((listener) => listener());

  return {
    subscribe(listener) {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
    getSnapshot: () => selection,
    getServerSnapshot: () => null,
    select(team, onClose) {
      // Pass production data to React without retaining scene meshes in its state.
      const { area, edge, floor, ...production } = team;
      selection = production;
      closeSelection = onClose;
      publish();
    },
    clear() {
      if (!selection) return;
      selection = null;
      closeSelection = null;
      publish();
    },
    close() {
      closeSelection?.();
    },
  };
}

export const sewingTeamStore = createSewingTeamStore();
