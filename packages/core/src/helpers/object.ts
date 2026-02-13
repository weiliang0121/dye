import {isArr, isFunc, isNil, isObj, isUndef} from '../guards';
import {lowercase} from './string';

import type {AO, GF} from '../types';

/** 过滤出指定前缀开头的属性 */
export const startsWith = (obj: AO, prefix: string): AO => {
  return Object.fromEntries(Object.entries(obj).filter(([key]) => key.startsWith(prefix)));
};

/** 移除属性名的前缀并首字母小写 */
export const replace = (obj: AO, prefix: string): AO => {
  return Object.fromEntries(
    Object.entries(obj).map(([key, value]) => {
      return key === prefix ? [key, value] : [lowercase(key.replace(prefix, ''), 0), value];
    }),
  );
};

/** 提取并去前缀的子属性集（startsWith + replace 组合） */
export const subAttrs = (obj: AO, prefix: string): AO => {
  return replace(startsWith(obj, prefix), prefix);
};

/** 深度合并默认值（仅填充 undefined 的字段） */
export const defaultsDeep = (target: AO, sources: AO[], index = 0): AO => {
  if (index >= sources.length) return target;
  const source = sources[index];
  if (!source) return target;
  Object.entries(source).forEach(([key, value]) => {
    if (isObj(value) && !isArr(value)) {
      if (!isObj(target[key])) target[key] = {};
      defaultsDeep(target[key], [value]);
    } else {
      if (isUndef(target[key])) target[key] = value;
    }
  });
  return defaultsDeep(target, sources, index + 1);
};

/** 从对象中按 key 或访问器取值 */
export const attrOf = (obj: AO, of: undefined | string | GF): unknown => {
  return isNil(of) ? undefined : isFunc(of) ? of(obj) : obj[of];
};

/** 多级分组（支持多个 key 递归分组） */
export const groupBy = (arr: AO[], ...keys: (string | GF)[]): AO => {
  if (!keys.length) return arr;
  const key = keys[0];
  const remainingKeys = keys.slice(1);

  const grouped = arr.reduce((acc, item) => {
    const group = String(attrOf(item, key));
    if (!acc[group]) acc[group] = [];
    acc[group].push(item);
    return acc;
  }, {} as AO);

  if (remainingKeys.length) {
    Object.keys(grouped).forEach(group => {
      grouped[group] = groupBy(grouped[group], ...remainingKeys);
    });
  }

  return grouped;
};

/** 扁平化分组（多 key 拼接为单层 key） */
export const flatGroupBy = (arr: AO[], ...keys: (string | GF)[]): AO => {
  return arr.reduce((acc, item) => {
    const group = keys.map(key => attrOf(item, key)).join('-');
    if (!acc[group]) acc[group] = [];
    acc[group].push(item);
    return acc;
  }, {});
};
