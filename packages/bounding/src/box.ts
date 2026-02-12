export class BoundingBox {
  x: number = 0;
  y: number = 0;
  width: number = 0;
  height: number = 0;

  static fromRect(x: number, y: number, width: number, height: number) {
    return new BoundingBox().from(x, y, width, height);
  }

  static fromPoints(x1: number, y1: number, x2: number, y2: number) {
    return new BoundingBox().from(x1, y1, x2 - x1, y2 - y1);
  }

  static fromLayout(layout: {x: number; y: number; width: number; height: number}) {
    return new BoundingBox().from(layout.x, layout.y, layout.width, layout.height);
  }

  get cx() {
    return this.x + this.width / 2;
  }

  get cy() {
    return this.y + this.height / 2;
  }

  get r() {
    return Math.min(this.width, this.height) / 2;
  }

  get aspect() {
    return this.height / this.width;
  }

  get radius() {
    return Math.min(this.width, this.height) / 2;
  }

  from(x: number, y: number, width: number, height: number) {
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
    return this;
  }

  vertices() {
    const {x, y, width, height} = this;
    const [x0, y0, x1, y1] = [x, y, x + width, y + height];
    return [
      [x0, y0],
      [x0, y1],
      [x1, y1],
      [x1, y0],
    ];
  }

  in(x: number, y: number) {
    return x >= this.x && x <= this.x + this.width && y >= this.y && y <= this.y + this.height;
  }

  contains(box: BoundingBox) {
    const {x, y, width, height} = this;
    return x <= box.x && x + width >= box.x + box.width && y <= box.y && y + height >= box.y + box.height;
  }

  intersect(box: BoundingBox) {
    const {x, y, width, height} = this;
    return x < box.x + box.width && x + width > box.x && y < box.y + box.height && y + height > box.y;
  }

  cut(box: BoundingBox) {
    const {x, y, width, height} = this;
    const {x: bx, y: by, width: bw, height: bh} = box;
    const x0 = Math.max(x, bx);
    const y0 = Math.max(y, by);
    const x1 = Math.min(x + width, bx + bw);
    const y1 = Math.min(y + height, by + bh);
    this.from(x0, y0, x1 - x0, y1 - y0);
    return this;
  }

  localXY(x: number, y: number) {
    return [x - this.x, y - this.y];
  }

  divideX(count: number, index: number) {
    const {x, width} = this;
    const xi = x + (width / count) * index;
    const wi = width / count;
    return new BoundingBox().from(xi, this.y, wi, this.height);
  }

  divideXByScale(scale: any, index: number) {
    const x0 = scale.scale(index);
    const x1 = x0 + scale.bandwidth;
    return new BoundingBox().from(x0, this.y, x1 - x0, this.height);
  }

  divideY(count: number, index: number) {
    const {y, height} = this;
    const yi = y + (height / count) * index;
    const hi = height / count;
    return new BoundingBox().from(this.x, yi, this.width, hi);
  }

  divideYByScale(scale: any, index: number) {
    const y0 = scale.scale(index);
    const y1 = y0 + scale.bandwidth;
    return new BoundingBox().from(this.x, y0, this.width, y1 - y0);
  }

  pad(padding: [number, number, number, number], isOut: boolean = false) {
    const [t, r, b, l] = padding;
    const {x, y, width, height} = this;
    if (isOut) return BoundingBox.fromRect(x - l, y - t, width + l + r, height + t + b);
    return BoundingBox.fromRect(x + l, y + t, width - l - r, height - t - b);
  }

  copy() {
    const {x, y, width, height} = this;
    return new BoundingBox().from(x, y, width, height);
  }
}
