/**
 * 数字插值函数构造器
 * @param a 数字
 * @param b 数字
 * @returns 插值函数
 */
export const interpolateNumber = (a: number, b: number) => (t: number) => (1 - t) * a + t * b;
/**
 * 数字归一化函数构造器
 * @param a 数字
 * @param b 数字
 * @returns 归一化函数
 */
export const normalizeNumber = (a: number, b: number) => (b - a ? (x: number) => (x - a) / (b - a) : () => 0.5);
