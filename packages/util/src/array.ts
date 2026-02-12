import {isNil, isNull, isNum, isNumEq, isStr, isUndef} from './normal';
import {quickselect} from './quick-select';

import type {AO} from '@dye/types';

export const count = (arr: any[], strict = true): number => {
  let count = 0;
  for (let i = 0; i < arr.length; i++) {
    if (!isNil(arr[i]) && strict) count++;
    else count++;
  }
  return count;
};

export const min = (arr: number[]): number => {
  let min = Infinity;
  for (let i = 0; i < arr.length; i++) {
    const v = arr[i];
    if (!isNum(v) || v !== v) continue;
    if (v < min) min = v;
  }
  return min;
};

export const minBy = (arr: AO[], fn: (d: any) => number): AO => {
  let min = Infinity;
  let minD: AO = {};
  for (let i = 0; i < arr.length; i++) {
    const d = arr[i];
    const v = fn(d);
    if (!isNum(v) || v !== v) continue;
    if (v < min) {
      min = v;
      minD = d;
    }
  }
  return minD;
};

export const max = (arr: number[]): number => {
  let max = -Infinity;
  for (let i = 0; i < arr.length; i++) {
    const v = arr[i];
    if (!isNum(v) || v !== v) continue;
    if (v > max) max = v;
  }
  return max;
};

export const maxBy = (arr: AO[], fn: (d: any) => number): AO => {
  let max = -Infinity;
  let maxD: AO = {};
  for (let i = 0; i < arr.length; i++) {
    const d = arr[i];
    const v = fn(d);
    if (!isNum(v) || v !== v) continue;
    if (v > max) {
      max = v;
      maxD = d;
    }
  }
  return maxD;
};

export const sum = (arr: number[]): number => {
  let sum = 0;
  for (let i = 0; i < arr.length; i++) {
    const v = arr[i];
    if (!isNum(v) || v !== v) continue;
    sum += v;
  }
  return sum;
};

export const mean = (arr: number[]): number => sum(arr) / arr.length;

export const extent = (arr: number[]): [number, number] => {
  let min = Infinity;
  let max = -Infinity;
  for (let i = 0; i < arr.length; i++) {
    const v = arr[i];
    if (!isNum(arr[i]) || v !== v) continue;
    if (v < min) min = v;
    if (v > max) max = v;
  }
  return [min, max];
};

export const extentBy = (arr: AO[], fn: (d: any) => number): [AO | null, AO | null] => {
  let min = Infinity;
  let max = -Infinity;
  let minD: AO | null = null;
  let maxD: AO | null = null;
  for (let i = 0; i < arr.length; i++) {
    const d = arr[i];
    const v = fn(d);
    if (!isNum(v) || v !== v) continue;
    if (v < min) {
      min = v;
      minD = d;
    }
    if (v > max) {
      max = v;
      maxD = d;
    }
  }
  return [minD, maxD];
};

const i10 = Math.sqrt(50);
const i5 = Math.sqrt(10);
const i2 = Math.sqrt(2);

export const tickIncrement = (start: number, stop: number, count: number): number => {
  const i = (stop - start) / Math.max(1, Math.floor(count));
  const p = Math.floor(Math.log10(i));
  const err = i / Math.pow(10, p);
  const e = err >= i10 ? 10 : err >= i5 ? 5 : err >= i2 ? 2 : 1;
  if (p < 0) return -Math.pow(10, -p) / e;
  return e * Math.pow(10, p);
};

export const tickStep = (start: number, end: number, count: number): number => {
  const reverse = start > end;
  if (reverse) [start, end] = [end, start];
  const inc = tickIncrement(start, end, count);
  return (reverse ? -1 : 1) * (inc < 0 ? 1 / -inc : inc);
};

export const nice = (start: number, stop: number, count: number): [number, number] => {
  let preInc;
  // eslint-disable-next-line no-constant-condition
  while (true) {
    const inc = tickIncrement(start, stop, count);
    if (inc === preInc || inc === 0 || !isFinite(inc)) {
      return [start, stop];
    } else if (inc > 0) {
      start = Math.floor(start / inc) * inc;
      stop = Math.ceil(stop / inc) * inc;
    } else if (inc < 0) {
      start = Math.ceil(start * inc) / inc;
      stop = Math.floor(stop * inc) / inc;
    }
    preInc = inc;
  }
};

export const niceForce = (start: number, stop: number, count: number): [number, number] => {
  // eslint-disable-next-line no-constant-condition
  while (true) {
    let inc = tickIncrement(start, stop, count);
    if (inc > 0) {
      start = Math.floor(start / inc) * inc;
      stop = Math.ceil(stop / inc) * inc;
    } else {
      start = Math.ceil(start * inc) / inc;
      stop = Math.floor(stop * inc) / inc;
      inc = 1 / -inc;
    }
    if (isNumEq(count, (stop - start) / inc, 1e-6)) {
      return [start, stop];
    } else {
      stop += inc;
    }
  }
};

export const tickSpec = (start: number, stop: number, count: number): [number, number, number] => {
  const inc = tickIncrement(start, stop, count);
  const spec: [number, number, number] = inc > 0 ? [Math.ceil(start / inc), Math.floor(stop / inc), inc] : [Math.ceil(start * -inc), Math.floor(stop * -inc), inc];
  if (spec[1] < spec[0]) return tickSpec(start, stop, count * 2);
  return spec;
};

export const ticks = (start: number, end: number, count: number): number[] => {
  if (count < 1) return [];
  if (start === end) return [start];
  const reverse = start > end;
  if (reverse) [start, end] = [end, start];
  const [a, b, inc] = tickSpec(start, end, count);
  const n = b - a + 1;
  const values = new Array(n);
  if (inc < 0) for (let i = 0; i < n; i += 1) values[i] = (a + i) / -inc;
  else for (let i = 0; i < n; i += 1) values[i] = (a + i) * inc;
  if (reverse) values.reverse();
  return values;
};

export const range = (start: number, stop: number, step: number = 1): number[] => {
  if (isUndef(stop)) [start, stop] = [0, start];
  (start = Number(start)), (stop = Number(stop)), (step = Number(step));
  const n = Math.max(0, Math.ceil((stop - start) / step)) | 0;
  const result = new Array(n);
  for (let i = 0; i < n; i += 1) result[i] = start + i * step;
  return result;
};

export const uniqueArray = (arr: any[]): any[] => {
  return Array.from(new Set(arr));
};

export const ascending = (a: any, b: any): number => {
  if (isNull(a) || isNull(b)) return NaN;
  if (isStr(a) && isStr(b)) return a.localeCompare(b);
  return a < b ? -1 : a > b ? 1 : a === b ? 0 : NaN;
};

export const descending = (a: any, b: any): number => {
  if (isNull(a) || isNull(b)) return NaN;
  if (isStr(a) && isStr(b)) return b.localeCompare(a);
  return b < a ? -1 : b > a ? 1 : b === a ? 0 : NaN;
};

export const quantile = (arr: number[], p: number): any => {
  const n = arr.length;
  if (n === 0) return NaN;
  if (n < 2) return arr[0];
  if (p <= 0) return min(arr);
  if (p >= 1) return max(arr);
  const h = (n - 1) * p;
  const i = Math.floor(h);
  quickselect(arr, i);
  const a = max(arr.slice(0, i + 1));
  const b = min(arr.slice(i + 1));
  return a + (b - a) * (h - i);
};

export const median = (arr: any[]): any => quantile(arr, 0.5);

export const arrayFromThresholds = (thresholds: number[], domain: [number, number]): [number, number][] => {
  const [min, max] = domain;
  const n = thresholds.length;
  if (n <= 0) return [[min, max]];
  const arr: [number, number][] = new Array(n + 1);
  arr[0] = [min, thresholds[0]];
  for (let i = 1; i < n; i++) arr[i] = [thresholds[i - 1], thresholds[i]];
  arr[n] = [thresholds[n - 1], max];
  return arr;
};

export const arrayFromRange = (range: number[]): [number, number][] => {
  const n = range.length;
  if (n <= 0) return [];
  if (n === 1) return [[range[0], range[0]]];
  const arr: [number, number][] = new Array(n - 1);
  for (let i = 1; i < n; i++) arr[i - 1] = [range[i - 1], range[i]];
  return arr;
};
