import type {GradientOptions} from '@dye/gradient';
import type {AO} from '@dye/types';

export type {GradientOptions} from '@dye/gradient';

export interface ClipPath {
  id: string;
  path: string;
}

export interface IGraphicsRenderer {
  get el(): HTMLCanvasElement | SVGSVGElement;

  getSize(): {width: number; height: number};

  resize(size: {width: number; height: number}): void;

  dispose(): void;

  clear(): void;

  save(createChild?: boolean): void;

  restore(): void;

  translate(tx: number, ty: number): void;

  rotate(radian: number): void;

  scale(sx: number, sy: number): void;

  setTransform(a: number, b: number, c: number, d: number, e: number, f: number): void;

  setAttributes(attributes: AO): void;

  rect(x: number, y: number, width: number, height: number): void;

  line(x1: number, y1: number, x2: number, y2: number): void;

  circle(x: number, y: number, radius: number): void;

  text(text: string, x: number, y: number): void;

  path(path: string): void;

  clipPath(clipPath: ClipPath): void;

  gradient(options: GradientOptions): void;
}
