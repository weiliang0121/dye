import {GF} from '@dye/types';

export class RafSchedule {
  tasks: GF[] = [];
  #rafId: number | null = null;
  #loopStartTime: number = -1;

  add(task: GF) {
    this.tasks.push(task);
  }

  remove(task: GF) {
    const index = this.tasks.indexOf(task);
    if (index !== -1) this.tasks.splice(index, 1);
  }

  #cancelRaf() {
    if (this.#rafId) {
      cancelAnimationFrame(this.#rafId);
      this.#rafId = null;
    }
  }

  #loop = (t: number) => {
    if (this.#loopStartTime < 0) this.#loopStartTime = t;
    const deltaTime = t - this.#loopStartTime;
    for (let i = 0; i < this.tasks.length; i++) {
      this.tasks[i](deltaTime);
    }
    this.#cancelRaf();
    this.#rafId = requestAnimationFrame(this.#loop);
  };

  start() {
    this.#cancelRaf();
    this.#loopStartTime = -1;
    this.#rafId = requestAnimationFrame(this.#loop);
  }

  end() {
    this.#cancelRaf();
  }

  clear() {
    this.#cancelRaf();
    this.tasks.length = 0;
  }

  dispose() {
    this.clear();
  }
}
