import type {SymbolCreator} from './types';

type Point = {x: number; y: number};

const d2r = (deg: number) => (deg * Math.PI) / 180;

const calcStarPoints = (cx: number, cy: number, r: number): Point[] => {
  const points: Point[] = [];
  for (let i = 0; i < 5; i++) {
    const a0 = d2r(i * 72 - 18);
    const a1 = a0 + d2r(36);
    points.push({x: cx + r * Math.cos(a0), y: cy + r * Math.sin(a0)});
    points.push({x: cx + r * 0.5 * Math.cos(a1), y: cy + r * 0.5 * Math.sin(a1)});
  }
  return points;
};

export const createStarSymbol: SymbolCreator = (path, {cx, cy, r}) => {
  (cx = +cx), (cy = +cy), (r = +r);
  const points = calcStarPoints(cx, cy, r);
  path.M(points[0].x, points[0].y);
  for (let i = 1; i < points.length; i++) {
    path.L(points[i].x, points[i].y);
  }
  path.Z();
};
