import {lerp} from '@dye/interpolate';

interface TransformAttrs {
  startAngle?: [number, number];
  endAngle?: [number, number];
  innerRadius?: [number, number];
  outerRadius?: [number, number];
}

interface TransformValues {
  startAngle: number;
  endAngle: number;
  innerRadius: number;
  outerRadius: number;
}

export class SectorTransform {
  V: TransformValues = {startAngle: 0, endAngle: Math.PI * 2, innerRadius: 0, outerRadius: 1};
  attrs: TransformAttrs = {};
  values: Partial<TransformValues> = {};
  #duration: number = 0;
  #delay: number = 0;
  // #easing: string = 'linear';
  status: 'start' | 'waiting' | 'running' | 'last' | 'end' = 'start';
  #time: number = -1;

  constructor(values: TransformValues) {
    this.V = values;
  }

  startAngle(a: number) {
    if (!this.attrs.startAngle) {
      const {startAngle} = this.V;
      this.attrs.startAngle = [startAngle, a];
    } else {
      const [a0] = this.attrs.startAngle;
      this.attrs.startAngle = [a0, a];
    }
    this.status = 'start';
    this.#time = -1;
    return this;
  }

  endAngle(a: number) {
    if (!this.attrs.endAngle) {
      const {endAngle} = this.V;
      this.attrs.endAngle = [endAngle, a];
    } else {
      const [a0] = this.attrs.endAngle;
      this.attrs.endAngle = [a0, a];
    }
    this.status = 'start';
    this.#time = -1;
    return this;
  }

  innerRadius(r: number) {
    if (!this.attrs.innerRadius) {
      const {innerRadius} = this.V;
      this.attrs.innerRadius = [innerRadius, r];
    } else {
      const [r0] = this.attrs.innerRadius;
      this.attrs.innerRadius = [r0, r];
    }
    this.status = 'start';
    this.#time = -1;
    return this;
  }

  outerRadius(r: number) {
    if (!this.attrs.outerRadius) {
      const {outerRadius} = this.V;
      this.attrs.outerRadius = [outerRadius, r];
    } else {
      const [r0] = this.attrs.outerRadius;
      this.attrs.outerRadius = [r0, r];
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

  // easing(easing: string) {
  //   this.#easing = easing;
  //   return this;
  // }

  interpolate(time: number) {
    if (this.status === 'end') return;

    if (this.status === 'last') {
      this.status = 'end';
      this.attrs = {};
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

    const {startAngle, endAngle, innerRadius, outerRadius} = this.attrs;
    if (startAngle) {
      this.values.startAngle = lerp(startAngle[0], startAngle[1])(t);
    }
    if (endAngle) {
      this.values.endAngle = lerp(endAngle[0], endAngle[1])(t);
    }
    if (innerRadius) {
      this.values.innerRadius = lerp(innerRadius[0], innerRadius[1])(t);
    }
    if (outerRadius) {
      this.values.outerRadius = lerp(outerRadius[0], outerRadius[1])(t);
    }
  }
}
