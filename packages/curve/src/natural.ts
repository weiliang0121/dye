import type {Path} from '@dye/path';

function controlPoints(x: number[]): [number[], number[]] {
  let i: number;
  let m: number;
  const n = x.length - 1;
  const a = new Array(n);
  const b = new Array(n);
  const r = new Array(n);
  (a[0] = 0), (b[0] = 2), (r[0] = x[0] + 2 * x[1]);
  for (i = 1; i < n - 1; ++i) (a[i] = 1), (b[i] = 4), (r[i] = 4 * x[i] + 2 * x[i + 1]);
  (a[n - 1] = 2), (b[n - 1] = 7), (r[n - 1] = 8 * x[n - 1] + x[n]);
  for (i = 1; i < n; ++i) {
    m = a[i] / b[i - 1];
    b[i] -= m;
    r[i] -= m * r[i - 1];
  }
  a[n - 1] = r[n - 1] / b[n - 1];
  for (i = n - 2; i >= 0; --i) a[i] = (r[i] - a[i + 1]) / b[i];
  b[n - 1] = (x[n] + a[n - 1]) / 2;
  for (i = 0; i < n - 1; ++i) b[i] = 2 * x[i + 1] - a[i + 1];
  return [a, b];
}

export const createCurveNatural = (path: Path, points: [number, number][], start = true) => {
  if (points.length <= 1) return;

  const xs = points.map(p => p[0]);
  const ys = points.map(p => p[1]);

  const [cx, bx] = controlPoints(xs);
  const [cy, by] = controlPoints(ys);

  if (start) {
    const [x0, y0] = points[0];
    path.M(x0, y0);
  }

  for (let i = 0; i < cx.length; i++) {
    path.C(cx[i], cy[i], bx[i], by[i], points[i + 1][0], points[i + 1][1]);
  }
};
