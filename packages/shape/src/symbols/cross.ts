import type {SymbolCreator} from './types';

export const createCrossSymbol: SymbolCreator = (path, {cx, cy, r}) => {
  (cx = +cx), (cy = +cy), (r = +r);
  const lineWidth = r * (1 - 0.618);
  const points = [
    {x: cx - r, y: cy - lineWidth},
    {x: cx - lineWidth, y: cy - lineWidth},
    {x: cx - lineWidth, y: cy - r},
    {x: cx + lineWidth, y: cy - r},
    {x: cx + lineWidth, y: cy - lineWidth},
    {x: cx + r, y: cy - lineWidth},
    {x: cx + r, y: cy + lineWidth},
    {x: cx + lineWidth, y: cy + lineWidth},
    {x: cx + lineWidth, y: cy + r},
    {x: cx - lineWidth, y: cy + r},
    {x: cx - lineWidth, y: cy + lineWidth},
    {x: cx - r, y: cy + lineWidth},
  ];
  path.M(points[0].x, points[0].y);
  for (let i = 1; i < points.length; i++) {
    path.L(points[i].x, points[i].y);
  }
  path.Z();
};
