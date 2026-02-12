import type {Path} from '@dye/path';

export const createCurveLinear = (path: Path, points: [number, number][], start = true) => {
  if (points.length <= 0) return;
  if (start) {
    const [x0, y0] = points.at(0)!;
    path.M(x0, y0);
  }
  for (let i = 1; i < points.length; i++) {
    const [xi, yi] = points[i]!;
    path.L(xi, yi);
  }
};
