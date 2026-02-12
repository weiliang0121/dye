import {isNone, isNil, isStr, isNum} from '@dye/util';
import {convertFontOptionsToCSS} from '@dye/measure';
import {createCanvasGradient} from '@dye/gradient';

import type {ClipPath, GradientOptions} from '@dye/renderer';
import type {AO} from '@dye/types';

export type Gradients = Map<string, GradientOptions>;
export type ClipPaths = Map<string, ClipPath>;

export interface FillOrStrokeTarget {
  path?: Path2D;
  x?: number;
  y?: number;
  text?: string;
}

const getRef = (url: string) => {
  const match = url?.match(/url\(#(.*)\)/);
  return match ? match[1] : '';
};

/**
 * 设置 Canvas 的全局合成操作
 * @param ctx CanvasRenderingContext2D 上下文
 * @param attrs 属性对象
 */
const setCompositeOperation = (ctx: CanvasRenderingContext2D, attrs: AO): void => {
  const {globalCompositeOperation: gco} = attrs;
  if (isStr(gco)) ctx.globalCompositeOperation = gco as any;
};

/**
 * 检查是否需要更新填充或描边
 * @param value 填充或描边值
 * @returns 是否需要更新
 */
const shouldUpdateFillOrStroke = (value: string | number | undefined): boolean => !isNil(value) && !isNone(value) && isStr(value);

/**
 * 设置 Canvas 的样式（填充或描边）
 * @param ctx CanvasRenderingContext2D 上下文
 * @param style 样式颜色或渐变 ID
 * @param gradients 渐变对象
 * @param isFill 是否为填充样式
 */
const setStyle = (ctx: CanvasRenderingContext2D, style: string, gradients: Gradients, isFill: boolean): void => {
  const id = getRef(style);
  if (id && !gradients.has(id)) return;
  const styleValue = id ? createCanvasGradient(ctx, gradients.get(id)!)! : style;
  if (isFill) ctx.fillStyle = styleValue;
  else ctx.strokeStyle = styleValue;
};

/**
 * 设置全局透明度
 * @param ctx CanvasRenderingContext2D 上下文
 * @param fillOrStrokeOpacity 填充或描边透明度
 * @param opacity 全局透明度
 */
const setGlobalAlpha = (ctx: CanvasRenderingContext2D, fillOrStrokeOpacity: number | undefined, opacity: number | undefined): void => {
  ctx.globalAlpha = fillOrStrokeOpacity ?? opacity ?? 1;
};

/**
 * 设置描边属性
 * @param ctx CanvasRenderingContext2D 上下文
 * @param attrs 属性对象
 */
const setStrokeAttributes = (ctx: CanvasRenderingContext2D, attrs: AO): void => {
  const {strokeWidth, strokeLinecap, strokeLinejoin, strokeMiterlimit, strokeDasharray, strokeDashoffset} = attrs;
  if (isNum(strokeWidth)) ctx.lineWidth = strokeWidth;
  if (isStr(strokeLinecap)) ctx.lineCap = strokeLinecap as CanvasLineCap;
  if (isStr(strokeLinejoin)) ctx.lineJoin = strokeLinejoin as CanvasLineJoin;
  if (isNum(strokeMiterlimit)) ctx.miterLimit = strokeMiterlimit;
  if (isNum(strokeDashoffset)) ctx.lineDashOffset = strokeDashoffset;
  if (isStr(strokeDasharray)) ctx.setLineDash(strokeDasharray.split(',').map(x => Number(x.trim())));
};

/**
 * 设置填充或描边
 * @param ctx CanvasRenderingContext2D 上下文
 * @param gradients 渐变对象
 * @param isFill 是否为填充样式
 * @param attrs 属性对象
 * @returns 是否成功设置填充或描边
 */
const setFillOrStroke = (ctx: CanvasRenderingContext2D, gradients: Gradients, isFill: boolean, attrs: AO): boolean => {
  const {fill, stroke, fillOpacity, strokeOpacity, opacity} = attrs;
  const value = isFill ? fill : stroke;
  const opacityValue = isFill ? fillOpacity : strokeOpacity;
  // tips: 如果填充或描边值为 none 或者 undefined，则不进行绘制
  // 但是 canvas 或者 svg 中 fill 和 stroke 属性可以为 none，表示不填充或描边
  // 且如果 fill 和 stroke 属性不通过则都不会进行绘制，这与canvas画布有默认fillStyle和strokeStyle不同
  if (!shouldUpdateFillOrStroke(value)) return false;
  setStyle(ctx, value as string, gradients, isFill);
  setGlobalAlpha(ctx, opacityValue, opacity);
  setCompositeOperation(ctx, attrs);
  if (!isFill) setStrokeAttributes(ctx, attrs);
  return true;
};

const TEXT_ALIGN_MAP: Record<string, CanvasTextAlign> = {
  start: 'left',
  middle: 'center',
  end: 'right',
};

const DOMINANT_BASELINE_MAP: Record<string, CanvasTextBaseline> = {
  auto: 'alphabetic',
  'text-bottom': 'alphabetic',
  alphabetic: 'alphabetic',
  ideographic: 'ideographic',
  middle: 'middle',
  central: 'middle',
  mathematical: 'hanging',
  hanging: 'hanging',
  'text-top': 'alphabetic',
};

/**
 * 设置字体样式
 * @param ctx CanvasRenderingContext2D 上下文
 * @param attrs 属性对象
 */
const setFont = (ctx: CanvasRenderingContext2D, attrs: AO) => {
  const {fontFamily, fontSize, fontStyle, fontWeight, textAnchor, dominantBaseline} = attrs;
  ctx.font = convertFontOptionsToCSS({fontFamily, fontSize, fontStyle, fontWeight} as any);
  if (isStr(textAnchor)) ctx.textAlign = TEXT_ALIGN_MAP[textAnchor];
  if (isStr(dominantBaseline)) ctx.textBaseline = DOMINANT_BASELINE_MAP[dominantBaseline];
};

/**
 * 绘制填充或描边
 * @param ctx CanvasRenderingContext2D 上下文
 * @param target 填充或描边目标
 * @param isFill 是否为填充
 * @param attrs 属性对象
 * @param gradients 渐变对象
 */
const draw = (ctx: CanvasRenderingContext2D, target: FillOrStrokeTarget, isFill: boolean, attrs: AO, gradients: Gradients) => {
  if (setFillOrStroke(ctx, gradients, isFill, attrs)) {
    if (target.path) {
      isFill ? ctx.fill(target.path) : ctx.stroke(target.path);
    } else if (!isNil(target.text)) {
      const {x = 0, y = 0} = target;
      setFont(ctx, attrs);
      isFill ? ctx.fillText(target.text, x, y) : ctx.strokeText(target.text, x, y);
    } else {
      isFill ? ctx.fill() : ctx.stroke();
    }
  }
};

/**
 * 填充或描边目标
 * @param ctx CanvasRenderingContext2D 上下文
 * @param target 填充或描边目标
 * @param gradients 渐变对象
 * @param attrs 属性对象
 */
export const fillAndStrokeTarget = (ctx: CanvasRenderingContext2D, target: FillOrStrokeTarget, gradients: Gradients, attrs: AO) => {
  draw(ctx, target, true, attrs, gradients); // Fill
  draw(ctx, target, false, attrs, gradients); // Stroke
};

/**
 * 剪裁
 * @param ctx CanvasRenderingContext2D 上下文
 * @param clipPaths 剪裁路径
 * @param attrs 属性对象
 */
export const clip = (ctx: CanvasRenderingContext2D, clipPaths: ClipPaths, attrs: AO): void => {
  const clipPath = attrs.clipPath as string;
  if (!clipPath) return;

  const id = getRef(clipPath);
  if (id && clipPaths.has(id)) {
    const clipPath = clipPaths.get(id);
    if (clipPath) ctx.clip(new Path2D(clipPath.path));
  }
};
