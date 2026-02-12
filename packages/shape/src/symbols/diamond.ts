import type {SymbolCreator} from './types';

export const createDiamondSymbol: SymbolCreator = (path, {cx, cy, r}) => {
  (cx = +cx), (cy = +cy), (r = +r);
  path.M(cx - r, cy);
  path.L(cx, cy - r);
  path.L(cx + r, cy);
  path.L(cx, cy + r);
  path.Z();
};
