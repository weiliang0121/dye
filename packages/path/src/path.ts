export class Path {
  #path: string[] = [];
  #pathStr: string = '';

  toString() {
    if (this.#pathStr === '') this.#pathStr = this.#path.join('');
    return this.#pathStr;
  }

  clear() {
    this.#path = [];
    this.#pathStr = '';
  }

  h(x: number) {
    this.#path.push(`h${x} `);
    return this;
  }

  v(y: number) {
    this.#path.push(`v${y} `);
    return this;
  }

  l(x: number, y: number) {
    this.#path.push(`l${x} ${y} `);
    return this;
  }

  q(x1: number, y1: number, x: number, y: number) {
    this.#path.push(`q${x1} ${y1} ${x} ${y} `);
    return this;
  }

  c(x1: number, y1: number, x2: number, y2: number, x: number, y: number) {
    this.#path.push(`c${x1} ${y1} ${x2} ${y2} ${x} ${y} `);
    return this;
  }

  a(rx: number, ry: number, angle: number, largeArcFlag: number, sweepFlag: number, x: number, y: number) {
    this.#path.push(`a${rx} ${ry} ${angle} ${largeArcFlag} ${sweepFlag} ${x} ${y} `);
    return this;
  }

  M(x: number, y: number) {
    this.#path.push(`M${x} ${y} `);
    return this;
  }

  H(x: number) {
    this.#path.push(`H${x} `);
    return this;
  }

  V(y: number) {
    this.#path.push(`V${y} `);
    return this;
  }

  L(x: number, y: number) {
    this.#path.push(`L${x} ${y} `);
    return this;
  }

  Q(x1: number, y1: number, x: number, y: number) {
    this.#path.push(`Q${x1} ${y1} ${x} ${y} `);
    return this;
  }

  C(x1: number, y1: number, x2: number, y2: number, x: number, y: number) {
    this.#path.push(`C${x1} ${y1} ${x2} ${y2} ${x} ${y} `);
    return this;
  }

  A(rx: number, ry: number, angle: number, largeArcFlag: number, sweepFlag: number, x: number, y: number) {
    this.#path.push(`A${rx} ${ry} ${angle} ${largeArcFlag} ${sweepFlag} ${x} ${y} `);
    return this;
  }

  Z() {
    this.#path.push('Z ');
    return this;
  }
}
