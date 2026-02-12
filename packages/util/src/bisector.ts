import {ascending, descending} from './array';

import type {GF} from '@dye/types';

const zero = () => 0;

type Compare = (a: any, b: any) => number;

export class Bisector {
  field?: any;
  checkReflexivity: Compare = ascending;
  compare: Compare = ascending;
  delta: Compare = ascending;

  static fromField(field: any) {
    return new Bisector().setField(field);
  }

  static fromCompare(compare: Compare) {
    return new Bisector().setOrder(compare);
  }

  setField(field: GF) {
    this.field = field;
    this.checkReflexivity = ascending;
    this.compare = ascending;
    this.delta = (a: any, b: any) => +a - +b;
    return this;
  }

  setOrder(compare: Compare) {
    this.checkReflexivity = compare === ascending || compare === descending ? compare : zero;
    this.compare = compare;
    this.delta = compare;
    return this;
  }

  left(arr: any[], x: any, lo = 0, hi = arr.length): number {
    if (lo < hi) {
      if (this.checkReflexivity(x, x) !== 0) return hi;
      do {
        const mid = (lo + hi) >>> 1;
        const i = this.field ? this.field(arr[mid] as object) : arr[mid];
        if (this.compare(i, x) < 0) lo = mid + 1;
        else hi = mid;
      } while (lo < hi);
    }
    return lo;
  }

  right(arr: any[], x: any, lo = 0, hi = arr.length): number {
    if (lo < hi) {
      if (this.checkReflexivity(x, x) !== 0) return hi;
      do {
        const mid = (lo + hi) >>> 1;
        const i = this.field ? this.field(arr[mid]) : arr[mid];
        if (this.compare(i, x) <= 0) lo = mid + 1;
        else hi = mid;
      } while (lo < hi);
    }
    return lo;
  }

  center(arr: any[], x: any, lo = 0, hi = arr.length): number {
    const i = this.left(arr, x, lo, hi - 1);
    const k = this.field ? this.field(arr[i] as object) : arr[i];
    return i > lo && this.delta(k, x) > -this.delta(k, x) ? i - 1 : i;
  }
}
