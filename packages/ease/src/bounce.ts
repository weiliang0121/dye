// https://github.com/d3/d3-ease/blob/main/src/bounce.js

import type {Ease} from './types';

const b1 = 4 / 11;
const b2 = 6 / 11;
const b3 = 8 / 11;
const b4 = 3 / 4;
const b5 = 9 / 11;
const b6 = 10 / 11;
const b7 = 15 / 16;
const b8 = 21 / 22;
const b9 = 63 / 64;
const b0 = 1 / b1 / b1;

export const bounceIn: Ease = (t: number): number => {
  return 1 - bounceOut(1 - t);
};

export const bounceOut: Ease = (t: number): number => {
  return (t = +t) < b1 ? b0 * t * t : t < b3 ? b0 * (t -= b2) * t + b4 : t < b6 ? b0 * (t -= b5) * t + b7 : b0 * (t -= b8) * t + b9;
};

export const bounceInOut: Ease = (t: number): number => {
  return ((t *= 2) <= 1 ? 1 - bounceOut(1 - t) : bounceOut(t - 1) + 1) / 2;
};
