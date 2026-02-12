import {lerp} from '@dye/interpolate';
import {easeMap} from '@dye/ease';

interface TransformAttrs {
  translate?: [number, number, number, number];
  rotate?: [number, number];
  scale?: [number, number, number, number];
}

interface TransformValues {
  tx: number;
  ty: number;
  sx: number;
  sy: number;
  rotate: number;
}

export class GraphicsTransform {
  V: TransformValues = {tx: 0, ty: 0, sx: 1, sy: 1, rotate: 0};
  attrs: TransformAttrs = {};
  values: Partial<TransformValues> = {};
  #duration: number = 0;
  #delay: number = 0;
  #easing: string = 'linear';
  #repeat: boolean = false;
  status: 'start' | 'waiting' | 'running' | 'last' | 'end' = 'start';
  #time: number = -1;

  constructor(values: TransformValues) {
    this.V = values;
  }

  translate(x: number, y: number) {
    if (!this.attrs.translate) {
      const {tx, ty} = this.V;
      this.attrs.translate = [tx, ty, x, y];
    } else {
      const [, , tx2, ty2] = this.attrs.translate;
      this.attrs.translate = [tx2, ty2, x, y];
    }
    this.status = 'start';
    this.#time = -1;
    return this;
  }

  rotate(r: number) {
    if (!this.attrs.rotate) {
      const {rotate} = this.V;
      this.attrs.rotate = [rotate, r];
    } else {
      const [, r2] = this.attrs.rotate;
      this.attrs.rotate = [r2, r];
    }
    this.status = 'start';
    this.#time = -1;
    return this;
  }

  scale(x: number, y: number) {
    if (!this.attrs.scale) {
      const {sx, sy} = this.V;
      this.attrs.scale = [sx, sy, x, y];
    } else {
      const [, , sx2, sy2] = this.attrs.scale;
      this.attrs.scale = [sx2, sy2, x, y];
    }
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

  easing(easing: string) {
    this.#easing = easing;
    return this;
  }

  repeat(repeat: boolean) {
    this.#repeat = repeat;
    return this;
  }

  interpolate(time: number) {
    if (this.status === 'end') {
      return;
    }

    if (this.status === 'last') {
      if (this.#repeat) {
        this.status = 'start';
        this.#time = -1;
      } else {
        this.status = 'end';
        this.attrs = {};
      }
      return;
    }

    if (this.#time === -1) this.#time = time;

    time -= this.#time;

    if (time < this.#delay) {
      this.status = 'waiting';
      return;
    }

    if (time > this.#delay + this.#duration) this.status = 'last';
    else this.status = 'running';

    const ease = easeMap[this.#easing];

    const t = ease(Math.max(0, Math.min(1, (time - this.#delay) / this.#duration)));

    const {translate, scale, rotate} = this.attrs;
    if (translate) {
      this.values.tx = lerp(translate[0], translate[2])(t);
      this.values.ty = lerp(translate[1], translate[3])(t);
    }
    if (scale) {
      this.values.sx = lerp(scale[0], scale[2])(t);
      this.values.sy = lerp(scale[1], scale[3])(t);
    }
    if (rotate) {
      this.values.rotate = lerp(rotate[0], rotate[1])(t);
    }
  }
}
