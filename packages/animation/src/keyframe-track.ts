import {interpolateNumber, interpolateColor, interpolateMat2d, interpolateVec2} from '@dye/interpolate';
import {ease} from '@dye/ease';

import type {GF} from '@dye/types';

export interface Keyframe {
  time: number;
  value: any;
}

export type KeyframeSequence = number[];

export interface KeyFrameAttr {
  name: string;
  value: any;
}

export interface KeyframeTrackOptions {
  name: string;
  frames: Keyframe[];
  startTime: number;
  endTime: number;
  easing?: string;
}

export class KeyframeTrack {
  name: string = '';
  startTime: number = 0;
  endTime: number = 0;
  easing: string = 'linear';
  times: number[] = [];
  values: any[] = [];
  cache: GF[] = [];
  interpolate: GF;
  value: any;

  constructor(options: KeyframeTrackOptions, interpolate: GF) {
    this.update(options);
    this.interpolate = interpolate;
  }

  update(options: Partial<KeyframeTrackOptions>) {
    const {name, frames, startTime, endTime, easing} = options;
    if (name) this.name = name;
    if (startTime) this.startTime = startTime;
    if (endTime) this.endTime = endTime;
    if (easing) this.easing = easing;
    if (frames) {
      this.times = frames.map(({time}) => time);
      this.values = frames.map(({value}) => value);
    }
    this.cache = [];
  }

  normalize(time: number) {
    const {startTime, endTime} = this;
    return (time - startTime) / (endTime - startTime);
  }

  findFrameIndex(t: number) {
    const {times} = this;
    let i = -1;
    while (i < times.length && times[i + 1] <= t) i++;
    return i;
  }

  createInterpolator(i: number) {
    const a = this.values[i];
    const b = this.values[i + 1];
    const f = this.interpolate;
    return f(a, b);
  }

  at(time: number) {
    let t = this.normalize(time);
    const i = this.findFrameIndex(t);
    if (i === -1) {
      this.value = this.values.at(0);
    } else if (i === this.times.length - 1) {
      this.value = this.values.at(-1);
    } else {
      if (!this.cache[i]) this.cache[i] = this.createInterpolator(i);
      t = (t - this.times[i]) / (this.times[i + 1] - this.times[i]);
      t = ease(this.easing)(t);
      this.value = this.cache[i](t);
    }
    return this.value;
  }

  attr(time: number): KeyFrameAttr {
    return {name: this.name, value: this.at(time)!};
  }
}

export class ColorKeyframeTrack extends KeyframeTrack {
  constructor(options: KeyframeTrackOptions) {
    super(options, interpolateColor);
  }
}

export class NumberKeyframeTrack extends KeyframeTrack {
  constructor(options: KeyframeTrackOptions) {
    super(options, interpolateNumber);
  }
}

export class Vec2KeyframeTrack extends KeyframeTrack {
  constructor(options: KeyframeTrackOptions) {
    super(options, interpolateVec2);
  }
}

export class Mat2dKeyframeTrack extends KeyframeTrack {
  constructor(options: KeyframeTrackOptions) {
    super(options, interpolateMat2d);
  }
}
