import {AnimationClip} from './animation-clip';

export class AnimationTimeline {
  clips: Map<string, AnimationClip> = new Map();
  currentTime: number = 0;
  isPlaying: boolean = false;
  state: Record<string, unknown> = {};

  add(clip: AnimationClip) {
    this.clips.set(clip.name, clip);
  }

  remove(clip: AnimationClip) {
    this.clips.delete(clip.name);
  }

  getClip(name: string): AnimationClip | null {
    return this.clips.get(name) || null;
  }

  play() {
    this.isPlaying = true;
  }

  pause() {
    this.isPlaying = false;
  }

  update(deltaTime: number) {
    if (!this.isPlaying) return;
    this.currentTime += deltaTime;

    let end = true;
    this.clips.forEach(clip => {
      if (!clip.end) {
        this.state[clip.name] = clip.at(this.currentTime);
        if (!clip.end) end = false;
      }
    });
    if (end) this.stop();
  }

  stop() {
    this.isPlaying = false;
    this.currentTime = 0;
    this.clips.forEach(clip => {
      clip.end = false;
    });
  }

  clear() {
    this.clips = new Map();
    this.currentTime = 0;
    this.isPlaying = false;
    this.state = {};
  }
}
