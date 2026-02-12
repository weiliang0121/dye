import {interpolateNumber} from './number';
import {interpolateColor} from './color';

export const interpolateValue = (a: any, b: any) => {
  if (typeof a === 'number' && typeof b === 'number') return interpolateNumber(a, b);
  else if (typeof a === 'string' && typeof b === 'string') return interpolateColor(a, b);
  return () => a;
};
