import EventEmitter from 'eventemitter3';
import {mat2d} from 'gl-matrix';

import {defaultsDeep} from '@dye/util';
import {CanvasRenderer} from '@dye/canvas';
import {SvgRenderer} from '@dye/svg';

import {RafSchedule, TimeSchedule} from '../schedules';

import type {IGraphicsRenderer} from '@dye/renderer';
import type {Mat2d, Point, Size} from '@dye/types';

import type {Scene} from '../scene';

type Viewport = [number, number, number, number];

export interface RendererConfig {
  width: number;
  height: number;
  renderer?: 'svg' | 'canvas';
  viewport?: Viewport;
  schedule: 'raf' | 'time' | 'none';
  timeline: boolean;
}

const DEFAULT_CONFIG: RendererConfig = {
  width: 800,
  height: 600,
  renderer: 'canvas',
  schedule: 'none',
  timeline: false,
};

export class Renderer extends EventEmitter {
  cfg: RendererConfig;
  #renderer: IGraphicsRenderer | null = null;
  #viewMat2d: mat2d = mat2d.create();
  #scene: Scene | null = null;
  schedule: RafSchedule | TimeSchedule | null = null;

  constructor(cfg: Partial<RendererConfig>) {
    super();
    this.cfg = defaultsDeep(cfg, [DEFAULT_CONFIG]) as RendererConfig;
    this.#initRenderer();
    this.#initSchedule();
    this.#initViewMat2d();
  }

  #initRenderer() {
    const {width, height, renderer} = this.cfg;
    this.#renderer = renderer === 'svg' ? new SvgRenderer({width, height}) : new CanvasRenderer({width, height});
  }

  #initSchedule() {
    const {schedule} = this.cfg;
    if (schedule === 'raf') this.schedule = new RafSchedule();
    else if (schedule === 'time') this.schedule = new TimeSchedule();
    if (this.schedule) {
      this.schedule.add((time: number) => {
        if (this.cfg.timeline && this.#scene) this.#scene.tick(time);
        this.render();
      });
    }
  }

  #initViewMat2d() {
    const {width, height} = this.cfg;
    const viewport = this.cfg.viewport ?? [0, 0, width, height];
    const [x, y, w, h] = viewport;
    const scaleMat2d = mat2d.fromValues(width / 2, 0, 0, height / 2, 0, 0);
    const viewportMat2d = mat2d.fromValues(2 / w, 0, 0, 2 / h, (-2 * x) / w, (-2 * y) / h);
    this.#viewMat2d = mat2d.multiply(mat2d.create(), scaleMat2d, viewportMat2d);
  }

  get domElement() {
    return this.#renderer!.el;
  }

  resize(size: Size) {
    this.#renderer!.resize(size);
    this.cfg.width = size.width;
    this.cfg.height = size.height;
    this.#initViewMat2d();
    if (this.#scene) this.#scene.setMatrix(this.#viewMat2d as Mat2d);
  }

  position(point: Point): Point {
    const rect = this.#renderer!.el.getBoundingClientRect();
    const x = point[0] - rect.left;
    const y = point[1] - rect.top;
    return [x, y];
  }

  submit(scene: Scene) {
    this.#scene = scene;
    this.#scene.setMatrix(this.#viewMat2d as Mat2d);
  }

  #drawGradient(node: any) {
    if (!this.#renderer) return;
    const {attrs} = node;
    if (attrs.gradientOptions) {
      this.#renderer.gradient(attrs.gradientOptions);
    }
  }

  #drawClipPath(node: any) {
    if (!this.#renderer) return;
    const {attrs} = node;
    if (attrs.clipPath) this.#renderer.clipPath(attrs.clipPath);
  }

  #drawText(node: any) {
    if (!this.#renderer) return;
    const {x, y, text} = node.shape;
    this.#renderer.text(text, x, y);
  }

  #drawCircle(node: any) {
    if (!this.#renderer) return;
    const {cx, cy, r} = node.shape;
    this.#renderer.circle(cx, cy, r);
  }

  #drawRect(node: any) {
    if (!this.#renderer) return;
    const {x, y, width, height} = node.shape;
    this.#renderer.rect(x, y, width, height);
  }

  #drawLine(node: any) {
    if (!this.#renderer) return;
    const {x1, y1, x2, y2} = node.shape;
    this.#renderer.line(x1, y1, x2, y2);
  }

  #drawPath(node: any) {
    if (!this.#renderer) return;
    this.#renderer.path(node.shape.path());
  }

  #drawShape(node: any) {
    if (!this.#renderer) return;
    switch (node.shape.command) {
      case 'text':
        this.#drawText(node);
        break;
      case 'circle':
        this.#drawCircle(node);
        break;
      case 'rect':
        this.#drawRect(node);
        break;
      case 'line':
        this.#drawLine(node);
        break;
      case 'path':
        this.#drawPath(node);
        break;
      default:
        break;
    }
  }

  #drawNode() {
    if (!this.#scene || !this.#renderer) return;
    this.#renderer.clear();
    const queue: any[] = this.#scene.getQueue();
    for (let i = 0; i < queue.length; i++) {
      const node = queue[i];
      if (!node.renderable()) continue;
      this.#renderer.save();
      this.#drawGradient(node);
      this.#drawClipPath(node);
      this.#renderer.setTransform(...(node.worldMatrix as Mat2d));
      this.#renderer.setAttributes(node.attrs.values);
      this.#drawShape(node);
      this.#renderer.restore();
    }
  }

  render() {
    if (!this.#scene || !this.#scene.sign()) return;
    console.log('渲染');
    this.#scene.update();
    this.#drawNode();
  }

  start(duration: number = -1) {
    if (!this.schedule) return;
    this.schedule.start();
    if (duration > 0) setTimeout(() => this.end(), duration);
  }

  end() {
    if (!this.schedule) return;
    this.schedule.end();
  }

  clear() {
    this.#renderer!.clear();
  }

  dispose() {
    this.#renderer!.dispose();
    this.schedule!.dispose();
  }
}
