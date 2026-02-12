import {lerp, interpolateColor} from '@dye/interpolate';

import type {AO} from '@dye/types';

interface TransformAttrs {
  opacity?: [number, number];
  fill?: [string, string];
  fillOpacity?: [number, number];
  stroke?: [string, string];
  strokeOpacity?: [number, number];
  [key: string]: any;
}

export class AttributeTransform {
  V: AO = {};
  attrs: TransformAttrs = {};
  #duration: number = 0;
  #delay: number = 0;
  status: 'start' | 'waiting' | 'running' | 'last' | 'end' = 'start';
  #time: number = -1;
  // #easing: string = 'linear';

  constructor(values: AO) {
    this.V = values;
  }

  // tips: 基于设计的问题，Attributes 的属性应该在 Transform 的方法调用前就已经设置好
  attr(key: string, value: any) {
    this.attrs[key as any] = [this.V[key] ?? value, value];
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

  // waiting running end

  interpolate(time: number) {
    if (this.status === 'end') return;

    if (this.status === 'last') {
      this.status = 'end';
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

    const t = Math.max(0, Math.min(1, (time - this.#delay) / this.#duration));

    const {opacity, fill, fillOpacity, stroke, strokeOpacity} = this.attrs;
    if (opacity) this.V.opacity = lerp(opacity[0], opacity[1])(t);
    if (fill) this.V.fill = interpolateColor(fill[0], fill[1])(t);
    if (fillOpacity) this.V.fillOpacity = lerp(fillOpacity[0], fillOpacity[1])(t);
    if (stroke) this.V.stroke = interpolateColor(stroke[0], stroke[1])(t);
    if (strokeOpacity) this.V.strokeOpacity = lerp(strokeOpacity[0], strokeOpacity[1])(t);
  }
}
