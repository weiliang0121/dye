import {lerp} from '@dye/interpolate';
import {Path} from '@dye/path';

import type {BoundingBox} from '@dye/bounding';
import type {ClipPath} from '@dye/renderer';

export class ClipBoxTransform {
  type: 'lr' | 'rl' | 'tb' | 'bt' | undefined = undefined;
  boundingBox: BoundingBox | null = null;
  clipPath: ClipPath;
  #duration: number = 0;
  #delay: number = 0;
  // #easing: string = 'linear';
  #path: Path | null = null;
  // tips: 基于设计的原因，clipPath 在 Attributes 中没有初始值，需要 Transform 进行初始化
  status: 'start' | 'init' | 'waiting' | 'running' | 'clear' | 'end' = 'start';
  #time: number = -1;

  constructor(clipPath: ClipPath) {
    this.clipPath = clipPath;
  }

  direction(type: 'lr' | 'rl' | 'tb' | 'bt') {
    this.type = type;
    return this;
  }

  box(box: BoundingBox) {
    this.boundingBox = box;
    this.status = 'start';
    this.#time = -1;
    return this;
  }

  duration(time: number) {
    this.#duration = time;
    return this;
  }

  delay(time: number) {
    this.#delay = time;
    return this;
  }

  // easing(easing: string) {
  //   this.#easing = easing;
  //   return this;
  // }

  #generatePath(t: number) {
    if (!this.boundingBox) return;
    if (!this.#path) this.#path = new Path();
    else this.#path.clear();
    const {x, y, width, height} = this.boundingBox;
    const [x0, y0, x1, y1] = [x, y, x + width, y + height];
    if (this.type === 'lr') {
      const x = lerp(x0, x1)(t);
      this.#path.clear();
      this.#path.M(x, y0);
      this.#path.L(x, y1);
      this.#path.L(x0, y1);
      this.#path.L(x0, y0);
      this.#path.Z();
    } else if (this.type === 'rl') {
      const x = lerp(x1, x0)(t);
      this.#path.clear();
      this.#path.M(x, y1);
      this.#path.L(x, y0);
      this.#path.L(x1, y0);
      this.#path.L(x1, y1);
      this.#path.Z();
    } else if (this.type === 'tb') {
      const y = lerp(y0, y1)(t);
      this.#path.clear();
      this.#path.M(x0, y);
      this.#path.L(x1, y);
      this.#path.L(x1, y0);
      this.#path.L(x0, y0);
      this.#path.Z();
    } else if (this.type === 'bt') {
      const y = lerp(y1, y0)(t);
      this.#path.clear();
      this.#path.M(x1, y);
      this.#path.L(x0, y);
      this.#path.L(x0, y1);
      this.#path.L(x1, y1);
      this.#path.Z();
    }
  }

  interpolate(time: number) {
    if (this.status === 'end') return;

    if (this.#time === -1) this.#time = time;

    time -= this.#time;

    if (time < this.#delay) {
      if (this.status === 'init' || this.status === 'waiting') {
        this.status = 'waiting';
        return;
      }
      this.#generatePath(0);
      this.clipPath.path = this.#path!.toString();
      this.status = 'init';
      return;
    }
    if (time - 16 > this.#delay + this.#duration) {
      if (this.status === 'running') this.status = 'clear';
      else if (this.status === 'clear') this.status = 'end';
      return;
    }
    this.status = 'running';
    const t = Math.max(0, Math.min(1, (time - this.#delay) / this.#duration));
    this.#generatePath(t);
    this.clipPath.path = this.#path!.toString();
  }
}
