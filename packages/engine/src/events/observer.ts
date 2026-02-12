import {SimulatedEvent} from './event';
import {EventDispatcher} from './dispatcher';

import type {Renderer} from '../renderers';
import type {Scene} from '../scene';

const SIMULATE_EVENT_MAP: Record<string, string> = {
  pointerenter: 'pointermove',
  pointerover: 'pointermove',
  pointerdown: 'pointerdown',
  pointerup: 'pointerup',
  pointerleave: 'pointermove',
  pointerout: 'pointermove',
  pointercancel: 'pointercancel',
};
const MOVE_EVENTS: string[] = ['pointermove', 'pointerover', 'pointerout', 'pointerenter', 'pointerleave'];
const CLICK_EVENTS: string[] = ['pointerdown', 'pointerup', 'click'];
const WHEEL_EVENT: string[] = ['wheel'];
const FEAT_EVENTS: Record<string, string[]> = {move: MOVE_EVENTS, click: CLICK_EVENTS, wheel: WHEEL_EVENT};

export class EventObserver {
  feats: Record<string, boolean> = {move: true, click: true, wheel: true};
  scene: Scene;
  renderer: Renderer;
  dispatcher = new EventDispatcher();
  eventQueue: Record<string, Event[]> = {};
  subscriptions: (() => void)[] = [];

  constructor(scene: Scene, renderer: Renderer) {
    this.scene = scene;
    this.renderer = renderer;
  }

  createListener(type: string) {
    return (evt: Event) => {
      const {clientX, clientY} = evt as PointerEvent;
      const offset = this.renderer.position([clientX, clientY]);
      const world = this.scene.position(offset);
      const target = this.scene.pick(offset) || this.scene;
      target.setDispatcher(this.dispatcher);
      const event = new SimulatedEvent(type, target, evt);
      event.offsetX = offset[0];
      event.offsetY = offset[1];
      event.worldX = world[0];
      event.worldY = world[1];
      target.dispatchEvent(event);
    };
  }

  requestAnimationFrame(type: string) {
    const fn = this.createListener(type);
    const listener = () => {
      fn(this.eventQueue[type].pop()!);
      this.eventQueue[type] = [];
    };
    return (evt: Event) => {
      if (!this.eventQueue[type]) this.eventQueue[type] = [];
      this.eventQueue[type].push(evt);
      listener();
    };
  }

  addEvent(type: string) {
    const {renderer} = this;
    const {domElement} = renderer;
    const listener = this.requestAnimationFrame(type);
    domElement.addEventListener(type, listener);
    this.subscribe(() => domElement.removeEventListener(type, listener));
  }

  handleEvents() {
    Object.entries(this.feats).forEach(([feat, enabled]) => {
      if (!enabled) return;
      FEAT_EVENTS[feat].forEach(type => {
        const simulatedType = SIMULATE_EVENT_MAP[type];
        if (simulatedType !== type) this.addEvent(simulatedType);
        this.addEvent(type);
      });
    });
  }

  subscribe(fn: () => void) {
    this.subscriptions.push(fn);
  }

  unsubscribe() {
    this.subscriptions.forEach(fn => fn());
  }

  clear() {
    this.unsubscribe();
    this.subscriptions = [];
  }

  dispose() {
    this.clear();
    this.dispatcher.dispose();
  }
}
