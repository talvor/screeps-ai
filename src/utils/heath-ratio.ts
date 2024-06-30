export const healthRatio = (hits: number | undefined, hitsMax: number | undefined): number => {
  if (!hits || !hitsMax) return 1;
  const res = hits / hitsMax;
  return res;
};
