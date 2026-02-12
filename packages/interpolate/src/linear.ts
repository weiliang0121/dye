import {vec2} from 'gl-matrix';

/**
 * 线型插值构造器
 * @param a 向量 a
 * @param b 向量 b
 * @returns 插值函数
 */
export const lerp = (a: number, b: number) => (t: number) => (1 - t) * a + t * b;

/**
 * 球面二维向量插值构造器
 * @param a 向量 a
 * @param b 向量 b
 * @returns 插值函数
 */
export const slerp = (a: vec2, b: vec2) => {
  const dot = vec2.dot(a, b);
  const clampedDot = Math.max(-1, Math.min(dot, 1));
  const angle = Math.acos(clampedDot);
  const sinAngle = Math.sin(angle);
  return (t: number) => {
    if (angle === 0 || sinAngle === 0) return vec2.clone(a);
    const s1 = Math.sin((1 - t) * angle) / sinAngle;
    const s2 = Math.sin(t * angle) / sinAngle;
    return vec2.fromValues(s1 * a[0] + s2 * b[0], s1 * a[1] + s2 * b[1]);
  };
};
