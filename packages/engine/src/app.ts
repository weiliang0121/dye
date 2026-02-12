import {Renderer} from './renderers';
import {Scene} from './scene';
import {EventObserver} from './events';

import type {RendererConfig} from './renderers/renderer';

export type AppConfig = RendererConfig;

export class App {
  cfg: AppConfig;
  scene: Scene;
  renderer: Renderer;
  observer: EventObserver;

  constructor(cfg: Partial<AppConfig> = {}) {
    this.cfg = cfg as AppConfig;
    this.scene = new Scene();
    this.renderer = new Renderer(this.cfg);
    this.renderer.submit(this.scene);
    this.observer = new EventObserver(this.scene, this.renderer);
    this.observer.handleEvents();
  }

  render() {
    this.renderer.render();
  }

  start(duration: number = -1) {
    this.renderer.start(duration);
  }

  end() {
    this.renderer.end();
  }

  clear() {
    this.renderer.clear();
    this.scene.clear();
  }

  dispose() {
    this.renderer.dispose();
    this.scene.dispose();
    this.observer.dispose();
  }
}
