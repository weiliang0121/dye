import {isUndef} from '../guards';

/**
 * 小写转换（支持指定位置）
 * @param str - 原字符串
 * @param start - 仅小写起始位置的字符（省略则全串）
 * @param stop - 仅小写 [start, stop) 范围
 */
export const lowercase = (str: string, start?: number, stop?: number): string => {
  if (isUndef(stop) && !isUndef(start)) {
    return str.slice(0, start) + str.charAt(start).toLowerCase() + str.slice(start + 1);
  } else if (!isUndef(start) && !isUndef(stop)) {
    return str.slice(0, start) + str.slice(start, stop).toLowerCase() + str.slice(stop);
  }
  return str.toLowerCase();
};

/**
 * 大写转换（支持指定位置）
 * @param str - 原字符串
 * @param start - 仅大写起始位置的字符（省略则全串）
 * @param stop - 仅大写 [start, stop) 范围
 */
export const uppercase = (str: string, start?: number, stop?: number): string => {
  if (isUndef(stop) && !isUndef(start)) {
    return str.slice(0, start) + str.charAt(start).toUpperCase() + str.slice(start + 1);
  } else if (!isUndef(start) && !isUndef(stop)) {
    return str.slice(0, start) + str.slice(start, stop).toUpperCase() + str.slice(stop);
  }
  return str.toUpperCase();
};

/** FNV-1a 32位哈希（用于快速字符串哈希） */
export const hashFnv32a = (str: string, asString: boolean, seed?: number): number | string => {
  let val = seed === undefined ? 0x811c9dc5 : seed;
  for (let i = 0; i < str.length; i++) {
    val ^= str.charCodeAt(i);
    val += (val << 1) + (val << 4) + (val << 7) + (val << 8) + (val << 24);
  }
  if (asString) return ('0000000' + (val >>> 0).toString(16)).slice(-8);
  return val >>> 0;
};
