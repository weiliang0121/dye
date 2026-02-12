/**
 * 归一化函数构造器
 * @param a 左界
 * @param b 右界
 * @returns 归一化函数
 */
export const normalize = (a: number, b: number) => {
  const _a = Number(a);
  const _b = Number(b) - _a;
  return _b ? (x: number) => (x - _a) / _b : () => (isNaN(_b) ? NaN : 0.5);
};
