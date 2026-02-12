import type {Path} from '@dye/path';

export const createCurveBump = (path: Path, points: [number, number][], orient: string, start: boolean) => {
  if (points.length <= 0) return;
  if (start) {
    const [x0, y0] = points.at(0)!;
    path.M(x0, y0);
  }
  for (let i = 1; i < points.length; i++) {
    const [xi, yi] = points.at(i)!;
    const [xj, yj] = points[i - 1];
    if (orient === 'y') {
      const cpy = (yj + yi) / 2;
      path.C(xj, cpy, xi, cpy, xi, yi);
    } else {
      const cpx = (xj + xi) / 2;
      path.C(cpx, yj, cpx, yi, xi, yi);
    }
  }
};

export const createCurveBumpX = (path: Path, points: [number, number][], start = true) => {
  return createCurveBump(path, points, 'x', start);
};

export const createCurveBumpY = (path: Path, points: [number, number][], start = true) => {
  return createCurveBump(path, points, 'y', start);
};
