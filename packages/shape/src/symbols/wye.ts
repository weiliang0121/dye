import type {SymbolCreator} from './types';

const sin = 0.5;
const cos = Math.sqrt(3) / 2;

export const createWyeSymbol: SymbolCreator = (path, {cx, cy, r}) => {
  const lineWidth = r * (1 - 0.618);
  const r1 = r;
  const r2 = (1 / cos) * lineWidth;
  const r3 = r - r2 * sin;
  const r4 = r - lineWidth * (cos / sin);
  path.M(cx - r2 * cos, cy + r2 * sin);
  path.L(cx - r2 * cos, cy + r1);
  path.L(cx + r2 * cos, cy + r1);
  path.L(cx + r2 * cos, cy + r2 * sin);
  path.L(cx + 2 * lineWidth + r4 * cos, cy - r4 * sin);
  path.L(cx + r3 * cos, cy - r2 - r3 * sin);
  path.L(cx, cy - r2);
  path.L(cx - r3 * cos, cy - r2 - r3 * sin);
  path.L(cx - 2 * lineWidth - r4 * cos, cy - r4 * sin);
  path.Z();
};
