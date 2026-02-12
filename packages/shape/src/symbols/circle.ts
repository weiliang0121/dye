import type {SymbolCreator} from './types';

export const createCircleSymbol: SymbolCreator = (path, {cx, cy, r}) => {
  (cx = +cx), (cy = +cy), (r = +r);
  path.M(cx, cy - r);
  path.A(r, r, 0, 1, 0, cx, cy + r);
  path.A(r, r, 0, 1, 0, cx, cy - r);
  path.Z();
};
