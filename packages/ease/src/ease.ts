import {easeInPoly, easeOutPoly, easeInOutPoly, easeInQuad, easeOutQuad, easeInOutQuad, easeInCubic, easeOutCubic, easeInOutCubic, easeInQuart, easeOutQuart, easeInOutQuart} from './poly';
import {bounceIn, bounceOut, bounceInOut} from './bounce';
import {easeInExp, easeOutExp, easeInOutExp} from './exp';
import {easeLinear} from './linear';

import type {Ease} from './types';

export const easeMap: Record<string, Ease> = {
  linear: easeLinear,
  inQuad: easeInQuad,
  outQuad: easeOutQuad,
  inOutQuad: easeInOutQuad,
  inCubic: easeInCubic,
  outCubic: easeOutCubic,
  inOutCubic: easeInOutCubic,
  inQuart: easeInQuart,
  outQuart: easeOutQuart,
  inOutQuart: easeInOutQuart,
  inPoly: easeInPoly,
  outPoly: easeOutPoly,
  inOutPoly: easeInOutPoly,
  inExp: easeInExp,
  outExp: easeOutExp,
  inOutExp: easeInOutExp,
  inBounce: bounceIn,
  outBounce: bounceOut,
  inOutBounce: bounceInOut,
};

export const ease = (name: string): Ease => {
  if (Reflect.has(easeMap, name)) return Reflect.get(easeMap, name);
  return easeLinear;
};
