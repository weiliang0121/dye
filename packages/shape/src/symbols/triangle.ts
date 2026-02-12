import type {SymbolCreator} from './types';

const createTriangle = (path: any, cx: number, cy: number, r: number, points: [number, number][]) => {
  path.M(cx + points[0][0] * r, cy + points[0][1] * r);
  points.slice(1).forEach(([dx, dy]) => path.L(cx + dx * r, cy + dy * r));
  path.Z();
};

export const createUpTriangleSymbol: SymbolCreator = (path, {cx, cy, r}) => {
  createTriangle(path, +cx, +cy, +r, [
    [0, -1],
    [-1, 1],
    [1, 1],
  ]);
};

export const createDownTriangleSymbol: SymbolCreator = (path, {cx, cy, r}) => {
  createTriangle(path, +cx, +cy, +r, [
    [0, 1],
    [-1, -1],
    [1, -1],
  ]);
};

export const createLeftTriangleSymbol: SymbolCreator = (path, {cx, cy, r}) => {
  createTriangle(path, +cx, +cy, +r, [
    [-1, 0],
    [1, -1],
    [1, 1],
  ]);
};

export const createRightTriangleSymbol: SymbolCreator = (path, {cx, cy, r}) => {
  createTriangle(path, +cx, +cy, +r, [
    [1, 0],
    [-1, -1],
    [-1, 1],
  ]);
};

export const createTriangleSymbol: SymbolCreator = createUpTriangleSymbol;
export const createInvertedTriangleSymbol: SymbolCreator = createDownTriangleSymbol;
