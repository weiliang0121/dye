import {Shape} from '../core';

export class PathShape extends Shape {
  command: string = 'path';

  from(d: string) {
    this.d = d;
    this.p = null;
  }
}
