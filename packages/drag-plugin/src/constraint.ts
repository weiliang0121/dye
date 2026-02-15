import type {DragConstraint} from './types';

/**
 * 对增量 delta 应用约束（轴锁定），返回约束后的 delta。
 */
export function constrainDelta(dx: number, dy: number, constraint: DragConstraint | undefined): [number, number] {
  if (!constraint) return [dx, dy];

  let cx = dx;
  let cy = dy;

  // 轴约束
  if (constraint.axis === 'x') {
    cy = 0;
  } else if (constraint.axis === 'y') {
    cx = 0;
  }

  return [cx, cy];
}

/**
 * 对绝对位置应用网格吸附，返回吸附后的坐标。
 */
export function snapToGrid(x: number, y: number, constraint: DragConstraint | undefined): [number, number] {
  if (!constraint?.grid) return [x, y];

  const [gx, gy] = typeof constraint.grid === 'number' ? [constraint.grid, constraint.grid] : constraint.grid;

  const sx = gx > 0 ? Math.round(x / gx) * gx : x;
  const sy = gy > 0 ? Math.round(y / gy) * gy : y;

  return [sx, sy];
}

/**
 * 对绝对位置应用边界约束，返回 clamp 后的坐标。
 */
export function clampToBounds(x: number, y: number, constraint: DragConstraint | undefined): [number, number] {
  if (!constraint?.bounds) return [x, y];

  const b = constraint.bounds;

  const cx = Math.max(b.minX ?? -Infinity, Math.min(b.maxX ?? Infinity, x));
  const cy = Math.max(b.minY ?? -Infinity, Math.min(b.maxY ?? Infinity, y));

  return [cx, cy];
}

/**
 * 综合应用所有约束：axis → grid → bounds
 *
 * @param startX - 目标起始 X（快照）
 * @param startY - 目标起始 Y（快照）
 * @param totalDx - 从起点累计的总增量 X
 * @param totalDy - 从起点累计的总增量 Y
 * @param constraint - 约束配置
 * @returns [finalX, finalY] 约束后的绝对位置
 */
export function applyConstraint(startX: number, startY: number, totalDx: number, totalDy: number, constraint: DragConstraint | undefined): [number, number] {
  // 1. 轴约束（作用于增量）
  const [cdx, cdy] = constrainDelta(totalDx, totalDy, constraint);

  // 2. 计算目标位置
  let x = startX + cdx;
  let y = startY + cdy;

  // 3. 网格吸附
  [x, y] = snapToGrid(x, y, constraint);

  // 4. 边界约束
  [x, y] = clampToBounds(x, y, constraint);

  return [x, y];
}
