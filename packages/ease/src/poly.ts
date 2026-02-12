export const easeInPoly = (t: number, n: number = 3) => Math.pow(t, n);
export const easeOutPoly = (t: number, n: number = 3) => 1 - Math.pow(1 - t, n);
export const easeInOutPoly = (t: number, n: number = 3) => (t < 0.5 ? Math.pow(2, n - 1) * Math.pow(t, n) : 1 - Math.pow(-2 * t + 2, n) / 2);

export const easeInQuad = (t: number) => easeInPoly(t, 2);
export const easeOutQuad = (t: number) => easeOutPoly(t, 2);
export const easeInOutQuad = (t: number) => easeInOutPoly(t, 2);

export const easeInCubic = (t: number) => easeInPoly(t, 3);
export const easeOutCubic = (t: number) => easeOutPoly(t, 3);
export const easeInOutCubic = (t: number) => easeInOutPoly(t, 3);

export const easeInQuart = (t: number) => easeInPoly(t, 4);
export const easeOutQuart = (t: number) => easeOutPoly(t, 4);
export const easeInOutQuart = (t: number) => easeInOutPoly(t, 4);
