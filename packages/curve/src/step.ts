import type {Path} from '@dye/path';

const step = (path: Path, points: [number, number][], method: string, start = true) => {
  if (start) {
    const [x, y] = points[0];
    path.M(x, y);
  }
  for (let i = 1; i < points.length; i++) {
    const [x0, y0] = points[i - 1];
    const [x1, y1] = points[i];
    if (method === 'start') {
      path.L(x0, y1);
    } else if (method === 'mid') {
      path.L((x0 + x1) / 2, y0);
      path.L((x0 + x1) / 2, y1);
    } else {
      path.L(x1, y0);
    }
    path.L(x1, y1);
  }
};

export const createCurveStep = (path: Path, points: [number, number][], start = true) => {
  step(path, points, 'mid', start);
};

export const createCurveStepBefore = (path: Path, points: [number, number][], start = true) => {
  step(path, points, 'start', start);
};

export const createCurveStepAfter = (path: Path, points: [number, number][], start = true) => {
  step(path, points, 'end', start);
};
