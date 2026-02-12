import {lerp} from './linear';

import type {RGB} from '@dye/types';

const HEX_REGEX = /^#([A-Fa-f0-9]{6})$/;
const RGB_REGEX = /^rgb\(\s*(\d{1,3})\s*,\s*(\d{1,3})\s*,\s*(\d{1,3})\s*\)$/;

const parseColor = (color: string): RGB => {
  let match: RegExpExecArray | null;
  if ((match = HEX_REGEX.exec(color))) {
    const hex = match[1];
    return [parseInt(hex.slice(0, 2), 16), parseInt(hex.slice(2, 4), 16), parseInt(hex.slice(4, 6), 16)];
  }
  if ((match = RGB_REGEX.exec(color))) {
    const [, r, g, b] = match;
    return [Number(r), Number(g), Number(b)];
  }
  throw new Error(`Unsupported color format: ${color}`);
};

const hex = (n: number) => ((n + 0.5) | 0).toString(16).padStart(2, '0');

/**
 * 根据插值系数 t 计算两个颜色的插值颜色构造器
 * @param c0 起始颜色
 * @param c1 结束颜色
 * @returns 插值函数
 */
export const interpolateColor = (c0: string, c1: string) => {
  const [r0, g0, b0] = parseColor(c0);
  const [r1, g1, b1] = parseColor(c1);
  const r = lerp(r0, r1);
  const g = lerp(g0, g1);
  const b = lerp(b0, b1);
  return (t: number) => `#${hex(r(t))}${hex(g(t))}${hex(b(t))}`;
};

const cache = new Map<string, ((t: number) => string)[]>();

/**
 * 根据颜色数组计算插值颜色函数构造器
 * @param colors 颜色数组
 * @returns 插值颜色函数
 */
export const interpolateColors = (colors: string[]) => {
  const key = colors.join(',');
  if (!cache.has(key)) {
    const C = colors.slice(0, -1).map((c, i) => interpolateColor(c, colors[i + 1]));
    cache.set(key, C);
  }
  const interpolators = cache.get(key)!;
  return (t: number) => {
    const n = interpolators.length;
    const j = Math.min(n - 1, Math.floor(t * n));
    return interpolators[j](t * n - j);
  };
};
