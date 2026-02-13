import type {GF, AO} from '../types';

/** 数字类型守卫（排除 NaN） */
export const isNum = (v: unknown): v is number => typeof v === 'number' && !Number.isNaN(v);
export const isArr = (v: unknown): v is unknown[] => Array.isArray(v);
export const isStr = (v: unknown): v is string => typeof v === 'string';
export const isBool = (v: unknown): v is boolean => typeof v === 'boolean';
export const isObj = (v: unknown): v is AO => typeof v === 'object' && v !== null;
export const isFunc = (v: unknown): v is GF => typeof v === 'function';
export const isUndef = (v: unknown): v is undefined => v === undefined;
export const isNull = (v: unknown): v is null => v === null;
/** null 或 undefined */
export const isNil = (v: unknown): v is undefined | null => isUndef(v) || isNull(v);
/** 判断是否为字符串 'none'（用于 CSS 属性值检测） */
export const isNone = (v: unknown): v is 'none' => v === 'none';
export const isNaN = (v: unknown) => Number.isNaN(v);
/** 判断值是否为空（nil/空字符串/空数组/空对象） */
export const isEmpty = (v: unknown) => {
  if (isNil(v)) return true;
  if (isStr(v)) return v === '';
  if (isArr(v)) return v.length === 0;
  if (isObj(v)) return Object.keys(v).length === 0;
  return false;
};
/** 判断字符串是否可解析为 Date */
export const isDateString = (v: unknown) => {
  if (isStr(v)) return !isNaN(Date.parse(v));
  return false;
};
/** Date 实例或可解析日期字符串 */
export const isDate = (v: unknown) => {
  return v instanceof Date || isDateString(v);
};
export const isHTMLElement = (v: unknown): v is HTMLElement => v instanceof HTMLElement;
