import {vec2} from 'gl-matrix';

import {lerp, slerp} from './linear';

/**
 * 向量插值函数构造器
 * @param a 向量
 * @param b 向量
 * @returns 插值函数
 */
export const interpolateVec2 = (a: vec2, b: vec2) => {
  const [a0, a1] = a;
  const [b0, b1] = b;
  const x = lerp(a0, b0);
  const y = lerp(a1, b1);
  return (t: number) => vec2.fromValues(x(t), y(t));
};

// 避免角度循环在线性插值下的问题；
// 使用球面插值来插值角度；

/**
 * 角度插值函数构造器
 * @param a 角度
 * @param b 角度
 * @returns 插值函数
 */
export const interpolateRotate = (a: number, b: number) => {
  const v1 = vec2.fromValues(Math.cos(a), Math.sin(a));
  const v2 = vec2.fromValues(Math.cos(b), Math.sin(b));
  const i = slerp(v1, v2);
  return (t: number) => {
    const v = i(t);
    return Math.atan2(v[1], v[0]);
  };
};
