import type {Path} from '@dye/path';

interface Cache {
  x0: number;
  y0: number;
  x1: number;
  y1: number;
  t: number;
}

const sign = (x: number) => (x < 0 ? -1 : 1);

const calcT1 = (cache: Cache, x2: number, y2: number): number => {
  const {x0, y0, x1, y1} = cache;
  const h0 = x1 - x0;
  const h1 = x2 - x1;
  const s0 = (y1 - y0) / (h0 || (h1 < 0 ? -0 : 1));
  const s1 = (y2 - y1) / (h1 || (h0 < 0 ? -0 : 1));
  const p = (s0 * h1 + s1 * h0) / (h0 + h1);
  return (sign(s0) + sign(s1)) * Math.min(Math.abs(s0), Math.abs(s1), 0.5 * Math.abs(p)) || 0;
};

const calcT0 = (cache: Cache, t: number): number => {
  const {x0, y0, x1, y1} = cache;
  const h = x1 - x0;
  return h ? ((3 * (y1 - y0)) / h - t) / 2 : t;
};

const controlPoints = (cache: Cache, t0: number, t1: number): number[] => {
  const {x0, y0, x1, y1} = cache;
  const dx = (x1 - x0) / 3;
  return [x0 + dx, y0 + dx * t0, x1 - dx, y1 - dx * t1];
};

export const createCurveMonotone = (path: Path, points: [number, number][], orient: string, start: boolean) => {
  if (points.length <= 0) return;
  if (start) {
    const [x0, y0] = points.at(0)!;
    path.M(x0, y0);
  }
  if (points.length === 1) return;
  if (points.length === 2) {
    const [x1, y1] = points.at(1)!;
    path.L(x1, y1);
    return;
  }
  let [x0, y0] = points.at(0)!;
  let [x1, y1] = points.at(1)!;
  if (orient === 'y') ([x0, y0] = [y0, x0]), ([x1, y1] = [y1, x1]);
  const cache: Cache = {x0, y0, x1, y1, t: NaN};
  if (points.length >= 2) {
    const [x2, y2] = points.at(2)!;
    if (orient === 'x') {
      const t1 = calcT1(cache, x2, y2);
      const t0 = calcT0(cache, t1);
      const [cx1, cy1, cx2, cy2] = controlPoints(cache, t0, t1);
      path.C(cx1, cy1, cx2, cy2, cache.x1, cache.y1);
      cache.t = t1;
    } else {
      const t1 = calcT1(cache, y2, x2);
      const t0 = calcT0(cache, t1);
      const [cy1, cx1, cy2, cx2] = controlPoints(cache, t0, t1);
      path.C(cy1, cx1, cy2, cx2, cache.y1, cache.x1);
      cache.t = t1;
    }
    cache.x0 = cache.x1;
    cache.y0 = cache.y1;
    cache.x1 = x2;
    cache.y1 = y2;
  }

  for (let i = 3; i < points.length; i++) {
    const [x2, y2] = points.at(i)!;
    if (orient === 'x') {
      const t1 = calcT1(cache, x2, y2);
      const [cx1, cy1, cx2, cy2] = controlPoints(cache, cache.t, t1);
      path.C(cx1, cy1, cx2, cy2, cache.x1, cache.y1);
      cache.t = t1;
    } else {
      const t1 = calcT1(cache, y2, x2);
      const [cy1, cx1, cy2, cx2] = controlPoints(cache, cache.t, t1);
      path.C(cy1, cx1, cy2, cx2, cache.y1, cache.x1);
    }
    cache.x0 = cache.x1;
    cache.y0 = cache.y1;
    cache.x1 = x2;
    cache.y1 = y2;
  }

  if (orient === 'x') {
    const t1 = calcT0(cache, cache.t);
    const [cx1, cy1, cx2, cy2] = controlPoints(cache, cache.t, t1);
    path.C(cx1, cy1, cx2, cy2, cache.x1, cache.y1);
    cache.t = t1;
  } else {
    const t1 = calcT0(cache, cache.t);
    const [cy1, cx1, cy2, cx2] = controlPoints(cache, cache.t, t1);
    path.C(cy1, cx1, cy2, cx2, cache.y1, cache.x1);
  }
};

export const createCurveMonotoneX = (path: Path, points: [number, number][], start = true) => {
  return createCurveMonotone(path, points, 'x', start);
};

export const createCurveMonotoneY = (path: Path, points: [number, number][], start = true) => {
  return createCurveMonotone(path, points, 'y', start);
};
