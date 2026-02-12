import {mat2d, vec2} from 'gl-matrix';

import {interpolateVec2, interpolateRotate} from './vector';

/**
 * 解构矩阵
 * @param mat 矩阵
 * @returns 返回平移、旋转、缩放
 */
export const decompose = (mat: mat2d) => {
  const [a, b, c, d, e, f] = mat;
  const translation = [e, f] as vec2;
  const scale = [vec2.length([a, b]), vec2.length([c, d])] as vec2;
  const rotation = Math.atan2(b, a) as number;
  return {translation, rotation, scale};
};

/**
 * 插值矩阵函数构造器
 * @param a 起始矩阵
 * @param b 结束矩阵
 * @returns 插值矩阵函数
 */
export const interpolateMat2d = (a: mat2d, b: mat2d) => {
  const {translation: ta, rotation: ra, scale: sa} = decompose(a);
  const {translation: tb, rotation: rb, scale: rs} = decompose(b);
  const is = interpolateVec2(sa, rs);
  const ir = interpolateRotate(ra, rb);
  const it = interpolateVec2(ta, tb);
  return (t: number) => {
    const m = mat2d.create();
    mat2d.scale(m, m, is(t));
    mat2d.rotate(m, m, ir(t));
    mat2d.translate(m, m, it(t));
    return m;
  };
};
