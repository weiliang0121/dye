import type {GF} from '../types';

/** 生成 UUID v4 */
export const uid = (): string => {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
};

/** 生成 8 位短 UUID */
export const uid8 = (): string => uid().slice(0, 8);

/** 恒等函数，返回输入本身 */
export const identity = <T>(x: T): T => x;

/** 函数组合（从左到右依次执行） */
export const compose = (...fns: GF[]): GF => {
  return x => fns.reduce((v, f) => f(v), x);
};

export const debounce = (fn: GF, delay: number): GF => {
  let timer: number;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => {
      fn(...args);
    }, delay);
    return timer;
  };
};

export const throttle = (fn: GF, delay: number): GF => {
  let last = 0;
  let timer: ReturnType<typeof setTimeout> | null = null;

  return (...args) => {
    const now = performance.now();

    if (now - last < delay) {
      if (timer) clearTimeout(timer);
      timer = setTimeout(
        () => {
          last = now;
          fn(...args);
        },
        delay - (now - last),
      );
    } else {
      last = now;
      fn(...args);
    }
    return timer;
  };
};
