import {setSVGAttrs, createSvgEl} from '@dye/style';

import type {AO} from '@dye/types';

export type GradientType = 'linear' | 'radial';
export type GradientStops = [number, string][];

export interface GradientOptions {
  id: string;
  type: GradientType;
  direction: number[];
  stops: GradientStops;
  region?: [number, number, number, number];
}

// l(id, [x0, y0, x1, y1], [[0, string], [1, string]])
// r(id, [x0, y0, r0, x1, y1, r1], [[0, string], [1, string]])

const gradientRegex = /(l|r)\((.+?), \[(.+?)\], \[(.+?)\]\)/;
const stopsRegex = /\[\d+, '[^']*'\]/g;
const stopRegex = /\d+|'[^']*'/g;

/**
 * 解析渐变类型命令
 * @param type 渐变类型命令
 * @returns 渐变类型
 */
const parseType = (type: string): GradientType => (type === 'l' ? 'linear' : 'radial');

/**
 * 解析方向字符串
 * @param directionStr 方向字符串
 * @returns 方向数组
 */
const parseDirection = (directionStr: string): number[] => {
  return directionStr.split(',').map(Number);
};

/**
 * 解析停止点字符串
 * @param stopsStr 停止点字符串
 * @returns 停止点数组
 */
const parseStops = (stopsStr: string): GradientStops => {
  return stopsStr.match(stopsRegex)?.map(s => {
    const [offset, color] = s.match(stopRegex) ?? [];
    return [Number(offset), color];
  }) as GradientStops;
};

/**
 * 解析渐变命令
 * @param command 渐变命令
 * @returns 渐变对象
 * @example parseGradientCommand('l(id, [0, 0, 1, 0], [[0, #000], [1, #fff]])')
 * @example parseGradientCommand('r(id, [0.5, 0.5, 0, 0.5, 0.5, 0.5], [[0, #000], [1, #fff]])')
 */
export const parseGradientCommand = (command: string) => {
  const match = command.match(gradientRegex);
  if (!match) throw new Error('Invalid gradient command');
  const [, typeKey, id, directionStr, stopsStr] = match;
  const type = parseType(typeKey);
  const direction = parseDirection(directionStr);
  const stops = parseStops(stopsStr);
  return {id, type, direction, stops};
};

/**
 * 调整方向数组
 * @param type 渐变类型
 * @param direction 方向数组
 * @param x 区域 x 坐标
 * @param y 区域 y 坐标
 * @param w 区域宽度
 * @param h 区域高度
 * @returns 调整后的方向数组
 */
const adjustDirection = (type: string, direction: number[], x: number, y: number, w: number, h: number): number[] => {
  if (type === 'linear') {
    const [x0 = 0, y0 = 0, x1 = 1, y1 = 0] = direction;
    return [x + w * x0, y + h * y0, x + w * x1, y + h * y1];
  } else if (type === 'radial') {
    const [x1 = 0.5, y1 = 0.5, r1 = 0.5, x2 = 0.5, y2 = 0.5, r2 = 0] = direction;
    return [x + w * x1, y + h * y1, r1 * Math.max(w, h), x + w * x2, y + h * y2, r2 * Math.max(w, h)];
  }
  return direction;
};

/**
 * 创建渐变对象
 * @param ctx canvas 2d 上下文
 * @param type 渐变类型
 * @param direction 方向数组
 * @returns CanvasGradient
 */
const createGradient = (ctx: CanvasRenderingContext2D, type: string, direction: number[]): CanvasGradient | undefined => {
  if (type === 'linear') {
    const [x1 = 0, y1 = 0, x2 = 1, y2 = 0] = direction;
    return ctx.createLinearGradient(x1, y1, x2, y2);
  } else if (type === 'radial') {
    const [x1 = 0.5, y1 = 0.5, r1 = 0, x2 = 0.5, y2 = 0.5, r2 = 0.5] = direction;
    return ctx.createRadialGradient(x1, y1, r1, x2, y2, r2);
  }
  return undefined;
};

/**
 * 创建 Canvas 渐变对象
 * @param ctx canvas 2d 上下文
 * @param options 渐变对象配置
 * @returns CanvasGradient
 */
export const createCanvasGradient = (ctx: CanvasRenderingContext2D, options: GradientOptions | string): CanvasGradient | undefined => {
  if (typeof options === 'string') options = parseGradientCommand(options);

  const {type, direction, stops, region} = options;

  let d = direction;

  if (Array.isArray(region)) {
    const [x, y, w, h] = region;
    d = adjustDirection(type, d, x, y, w, h);
  }

  const gradient = createGradient(ctx, type, d);

  if (!gradient) return;

  for (const [offset, color] of stops) {
    gradient.addColorStop(offset, color);
  }

  return gradient;
};

/**
 * 获取渐变属性
 * @param type 渐变类型
 * @param direction 方向数组
 * @returns 渐变属性对象
 */
const getGradientAttributes = (type: string, direction: number[]): AO => {
  if (type === 'linear') {
    const [x1 = 0, y1 = 0, x2 = 1, y2 = 0] = direction;
    return {x1, y1, x2, y2};
  } else if (type === 'radial') {
    const [fx = 0.5, fy = 0.5, fr = 0, cx = 0.5, cy = 0.5, r = 0.5] = direction;
    return {cx, cy, r, fx, fy, fr};
  }
  return {};
};

/**
 * 创建 SVG 渐变元素
 * @param options 渐变对象配置
 * @param gradientUnits 渐变布局方式
 * @returns 渐变元素
 */
export const createSVGGradient = (options: GradientOptions | string) => {
  if (typeof options === 'string') options = parseGradientCommand(options);

  const {id, type, direction, stops, region} = options;

  const gradient = createSvgEl(`${type}Gradient` as keyof SVGElementTagNameMap) as SVGGradientElement;
  if (!gradient) return;

  let d = direction;

  if (Array.isArray(region)) {
    const [x, y, w, h] = region;
    d = adjustDirection(type, d, x, y, w, h);
  }

  const gradientUnits = Array.isArray(region) ? 'userSpaceOnUse' : 'objectBoundingBox';
  setSVGAttrs(gradient, {id, gradientUnits, ...getGradientAttributes(type, d)});

  for (const [offset, stopColor] of stops) {
    const stop = createSvgEl('stop');
    setSVGAttrs(stop, {offset, stopColor});
    gradient.appendChild(stop);
  }

  return gradient;
};
