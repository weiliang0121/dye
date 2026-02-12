import {KeyframeTrack} from './keyframe-track';

import type {AO} from '@dye/types';

export class AnimationClip {
  name: string;
  duration: number;
  tracks: KeyframeTrack[];
  state: AO = {};
  end: boolean = false;
  autoUpdate: boolean = false;

  constructor(name: string, duration: number, tracks: KeyframeTrack[]) {
    this.name = name;
    this.duration = duration;
    this.tracks = tracks;
    if (this.duration < 0) this.autoUpdate = true;
    this.updateDuration();
  }

  add(track: KeyframeTrack) {
    this.tracks.push(track);
    this.updateDuration();
  }

  updateDuration() {
    if (!this.autoUpdate) return;
    this.duration = this.tracks.reduce((d, track) => Math.max(d, track.endTime), -1);
  }

  at(time: number) {
    const {duration, tracks} = this;
    if (time > duration) this.end = true;
    this.state = Object.fromEntries(tracks.map(track => [track.name, track.at(time)]));
    return this.state;
  }
}
