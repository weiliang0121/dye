import {BoundingBox} from './box';

export class BoundingRect {
  box: BoundingBox = new BoundingBox();
  padding: number[] = [0, 0, 0, 0];
  map: Map<string, number[]> = new Map();

  constructor(box?: BoundingBox) {
    if (box) this.box = box;
  }

  pad() {
    this.padding = [0, 0, 0, 0];
  }

  set(key: string, padding?: number[]) {
    if (padding) this.padding = padding;
    this.map.set(key, padding ?? this.padding);
    return this;
  }

  create(key: string) {
    if (!this.map.has(key)) return this.box.copy();
    const {x, y, width, height} = this.box;
    const [t, r, b, l] = this.map.get(key)!;
    return BoundingBox.fromRect(x + l, y + t, width - l - r, height - t - b);
  }
}
