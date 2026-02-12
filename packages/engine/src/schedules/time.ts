import {GF} from '@dye/types';

export class TimeSchedule {
  tasks: GF[] = [];
  #interval: number;
  #timeoutId: number | null = null;
  #loopStartTime: number = -1;

  constructor(interval: number = 16) {
    this.#interval = interval;
  }

  add(task: GF) {
    this.tasks.push(task);
  }

  remove(task: GF) {
    const index = this.tasks.indexOf(task);
    if (index !== -1) this.tasks.splice(index, 1);
  }

  #cancelTimeout() {
    if (this.#timeoutId !== null) {
      clearTimeout(this.#timeoutId);
      this.#timeoutId = null;
    }
  }

  #loop = () => {
    const now = performance.now();
    if (this.#loopStartTime < 0) this.#loopStartTime = now;
    const deltaTime = now - this.#loopStartTime;
    for (const task of this.tasks) {
      task(deltaTime);
    }
    this.#timeoutId = setTimeout(this.#loop, this.#interval);
  };

  start() {
    this.#cancelTimeout();
    this.#loopStartTime = -1;
    this.#timeoutId = setTimeout(this.#loop, this.#interval);
  }

  end() {
    this.#cancelTimeout();
  }

  clear() {
    this.#cancelTimeout();
    this.tasks.length = 0;
  }

  dispose() {
    this.clear();
  }
}
