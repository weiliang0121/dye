import {BoundingBox} from '@dye/bounding';
import {uid8} from '@dye/util';

import type {Point} from '@dye/types';
import type {Path} from '@dye/path';

export class Shape {
  uid: string = uid8();

  type: number = 0;

  name: string = '';

  command: string = '';

  boundingBox: BoundingBox = new BoundingBox();

  creator: Path | null = null;
  d: string = '';
  p: Path2D | null = null;

  autoNeedUpdate: boolean = true;
  needUpdate: boolean = true;

  setBox(box: BoundingBox) {
    this.boundingBox = box;
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  options(..._args: any[]) {}

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  from(..._args: any[]) {}

  build() {
    if (!this.needUpdate) return;
    this.box();
    this.needUpdate = false;
  }

  path(): string {
    return this.d;
  }

  path2d() {
    if (!this.p) this.p = new Path2D(this.d);
    return this.p;
  }

  box(): BoundingBox {
    return this.boundingBox;
  }

  useTransform() {
    return this;
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  tick(_time: number) {}

  hit(point: Point) {
    if (!this.boundingBox) this.box();
    if (!this.boundingBox) return false;
    return this.boundingBox.in(...point);
  }

  clear() {
    this.needUpdate = true;
    this.autoNeedUpdate = true;
  }

  dispose() {
    this.clear();
  }
}
