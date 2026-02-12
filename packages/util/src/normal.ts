import type {GF, AO} from '@dye/types';

export const isNum = (v: any): v is number => typeof v === 'number' && !Number.isNaN(v);
export const isArr = (v: any): v is any[] => Array.isArray(v);
export const isStr = (v: any): v is string => typeof v === 'string';
export const isBool = (v: any): v is boolean => typeof v === 'boolean';
export const isObj = (v: any): v is AO => typeof v === 'object' && v !== null;
export const isFunc = (v: any): v is GF => typeof v === 'function';
export const isUndef = (v: any): v is undefined => v === undefined;
export const isNull = (v: any): v is null => v === null;
export const isNil = (v: any): v is undefined | null => isUndef(v) || isNull(v);
export const isNone = (v: any): v is 'none' => v === 'none';
export const isNaN = (v: any) => Number.isNaN(v);
export const isEmpty = (v: any) => {
  if (isNil(v)) return true;
  if (isStr(v)) return v === '';
  if (isArr(v)) return (v as any[]).length === 0;
  if (isObj(v)) return Object.keys(v as object).length === 0;
  return false;
};
export const isDateString = (v: any) => {
  if (isStr(v)) return !isNaN(Date.parse(v));
  return false;
};
export const isDate = (v: any) => {
  return v instanceof Date || isDateString(v);
};
export const isNumEq = (a: number, b: number, p: number): boolean => Math.abs(a - b) < p;
export const isHTMLElement = (v: any): v is HTMLElement => v instanceof HTMLElement;
export const inRange = (v: number, min: number, max: number): boolean => min <= v && v <= max;
export const clamper = (min: number, max: number) => {
  if (min > max) [min, max] = [max, min];
  return (v: number) => Math.min(max, Math.max(min, v));
};
