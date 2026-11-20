export function createStore(initialState) {
  let snapshot = initialState;
  const listeners = new Set();
  return {
    getSnapshot: () => snapshot,
    getServerSnapshot: () => initialState,
    subscribe(listener) {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
    set(changes) {
      if (Object.keys(changes).every((key) => Object.is(snapshot[key], changes[key]))) return;
      snapshot = { ...snapshot, ...changes };
      listeners.forEach((listener) => listener());
    },
  };
}
