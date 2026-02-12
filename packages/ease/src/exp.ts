export const easeInExp = (t: number): number => {
  return t === 0 ? 0 : Math.pow(2, 10 * (t - 1));
};

export const easeOutExp = (t: number): number => {
  return t === 1 ? 1 : 1 - Math.pow(2, -10 * t);
};

export const easeInOutExp = (t: number): number => {
  if (t === 0) return 0;
  if (t === 1) return 1;
  if ((t /= 0.5) < 1) return 0.5 * Math.pow(2, 10 * (t - 1));
  return 0.5 * (2 - Math.pow(2, -10 * --t));
};
