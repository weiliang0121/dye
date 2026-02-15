import {BoundingBox} from 'rendx-bounding';
import {pathBBox} from 'rendx-path';

import {Shape} from '../core';

export class PathShape extends Shape {
  command = 'path' as const;

  from(d: string) {
    this.d = d;
    this.p = null;
    if (this.autoNeedUpdate) this.needUpdate = true;
  }

  box() {
    const result = pathBBox(this.d);
    if (result) {
      this.boundingBox = BoundingBox.fromPoints(result[0], result[1], result[2], result[3]);
    }
    return this.boundingBox;
  }
}
