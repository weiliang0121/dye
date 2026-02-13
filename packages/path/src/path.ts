/**
 * SVG 路径命令构建器
 *
 * 使用直接字符串拼接（+=）替代 string[] + join，
 * V8 引擎对 += 使用 cons string（rope）优化，amortized O(1)，
 * 消除了数组分配、push 和 join 的开销。
 */
/**
 * SVG 路径命令构建器，链式 API 生成 SVG path d 属性。
 * 内部使用字符串拼接（`+=`）优化性能。
 *
 * @example
 * ```ts
 * const p = new Path();
 * p.M(0, 0).L(100, 0).L(100, 100).Z();
 * p.toString(); // "M0 0 L100 0 L100 100 Z "
 * ```
 */
export class Path {
  #d = '';

  /** 返回完整路径字符串 */
  toString() {
    return this.#d;
  }

  /** 清空路径 */
  clear() {
    this.#d = '';
  }

  // 相对坐标命令
  h(x: number) {
    this.#d += `h${x} `;
    return this;
  }
  v(y: number) {
    this.#d += `v${y} `;
    return this;
  }
  l(x: number, y: number) {
    this.#d += `l${x} ${y} `;
    return this;
  }
  q(x1: number, y1: number, x: number, y: number) {
    this.#d += `q${x1} ${y1} ${x} ${y} `;
    return this;
  }
  c(x1: number, y1: number, x2: number, y2: number, x: number, y: number) {
    this.#d += `c${x1} ${y1} ${x2} ${y2} ${x} ${y} `;
    return this;
  }
  a(rx: number, ry: number, angle: number, largeArcFlag: number, sweepFlag: number, x: number, y: number) {
    this.#d += `a${rx} ${ry} ${angle} ${largeArcFlag} ${sweepFlag} ${x} ${y} `;
    return this;
  }

  // 绝对坐标命令
  M(x: number, y: number) {
    this.#d += `M${x} ${y} `;
    return this;
  }
  H(x: number) {
    this.#d += `H${x} `;
    return this;
  }
  V(y: number) {
    this.#d += `V${y} `;
    return this;
  }
  L(x: number, y: number) {
    this.#d += `L${x} ${y} `;
    return this;
  }
  Q(x1: number, y1: number, x: number, y: number) {
    this.#d += `Q${x1} ${y1} ${x} ${y} `;
    return this;
  }
  /**
   * 绝对坐标三次贝塞尔曲线
   * @param x1 - 控制点1 X
   * @param y1 - 控制点1 Y
   * @param x2 - 控制点2 X
   * @param y2 - 控制点2 Y
   * @param x - 终点 X
   * @param y - 终点 Y
   */
  C(x1: number, y1: number, x2: number, y2: number, x: number, y: number) {
    this.#d += `C${x1} ${y1} ${x2} ${y2} ${x} ${y} `;
    return this;
  }
  /**
   * 绝对坐标椭圆弧
   * @param rx - X 轴半径
   * @param ry - Y 轴半径
   * @param angle - X 轴旋转角度
   * @param largeArcFlag - 大弧标志 (0|1)
   * @param sweepFlag - 顺时针标志 (0|1)
   * @param x - 终点 X
   * @param y - 终点 Y
   */
  A(rx: number, ry: number, angle: number, largeArcFlag: number, sweepFlag: number, x: number, y: number) {
    this.#d += `A${rx} ${ry} ${angle} ${largeArcFlag} ${sweepFlag} ${x} ${y} `;
    return this;
  }

  // 闭合路径
  Z() {
    this.#d += 'Z ';
    return this;
  }
}
