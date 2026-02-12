import {mat2d, vec2} from 'gl-matrix';

import {Graphics} from '../core/graphics';

import type {Point} from '@dye/types';

export class Scene extends Graphics {
  type: number = 1;
  #queue: any[] = [];
  #invertWorldMatrix: mat2d | null = null;

  getQueue() {
    if (this.dirty) {
      const queue: any[] = [];
      this.traverse((node: any) => {
        if (node.type === 3) queue.push(node);
      });
      queue.sort((a, b) => a.ez - b.ez);
      this.setDirty(false);
      this.#queue = queue;
    }
    return this.#queue;
  }

  pick(point: Point) {
    for (let i = this.#queue.length - 1; i >= 0; i--) {
      const node = this.#queue[i];
      if (node.hit(point)) return node;
    }
  }

  position(point: Point) {
    if (!this.#invertWorldMatrix) this.#invertWorldMatrix = mat2d.invert(mat2d.create(), this.worldMatrix)!;
    return vec2.transformMat2d(vec2.create(), point, this.#invertWorldMatrix) as Point;
  }
}
