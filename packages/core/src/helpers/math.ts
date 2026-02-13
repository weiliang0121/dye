/** 弧度转角度系数 (180/π) */
export const r2d = 180 / Math.PI;
/** 角度转弧度系数 (π/180) */
export const d2r = Math.PI / 180;
/** 弧度归一化到 [0, 2π) */
export const normalizeRadian = (r: number) => r % (2 * Math.PI);
/** 角度归一化到 [0, 360) */
export const normalizeDegree = (d: number) => d % 360;
/**
 * 计算两个范围的中心点
 * @param s - 起点 x
 * @param e - 终点 x
 * @param i - 起点 y
 * @param o - 终点 y
 */
export const calcCenter = (s: number, e: number, i: number, o: number): [number, number] => [(s + e) / 2, (i + o) / 2];
/**
 * 极坐标转笛卡尔坐标
 * @param d - 角度（弧度）
 * @param r - 半径
 * @returns [x, y]
 */
export const convertP2C = (d: number, r: number): [number, number] => [r * Math.cos(d), r * Math.sin(d)];
/**
 * 数值近似相等检查
 * @param a - 第一个数
 * @param b - 第二个数
 * @param p - 精度阈值（差值小于此值视为相等）
 */
export const isNumEq = (a: number, b: number, p: number): boolean => Math.abs(a - b) < p;
/** 判断 v 是否在 [min, max] 范围内（闭区间） */
export const inRange = (v: number, min: number, max: number): boolean => min <= v && v <= max;
/** 创建 clamp 函数，将值限制在 [min, max] 范围内 */
export const clamper = (min: number, max: number) => {
  if (min > max) [min, max] = [max, min];
  return (v: number) => Math.min(max, Math.max(min, v));
};
