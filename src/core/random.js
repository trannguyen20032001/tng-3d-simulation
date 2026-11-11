TNG.core.createRandom = function (seed) {
  const rnd = () => {
    seed = (seed * 16807) % 2147483647;
    return (seed - 1) / 2147483646;
  };
  return { rnd, pick: (values) => values[Math.floor(rnd() * values.length)] };
};
