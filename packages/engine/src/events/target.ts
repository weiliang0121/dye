import EventEmitter from 'eventemitter3';

import {isStr} from '@dye/util';

import type {SimulatedEvent} from './event';
import type {EventDispatcher} from './dispatcher';

export interface EventListenerOptions {
  once?: boolean;
  capture?: boolean;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type EventListener = (...args: any[]) => void;

export class EventTarget {
  emitter = new EventEmitter();
  dispatcher: EventDispatcher | null = null;

  setDispatcher(dispatcher: EventDispatcher) {
    this.dispatcher = dispatcher;
  }

  on(event: string, listener: EventListener, options?: EventListenerOptions) {
    const {once = false, capture} = options || {};
    if (capture) event = `capture-${event}`;
    if (once) this.emitter.once(event, listener);
    else this.emitter.on(event, listener);
  }

  off(event: string, listener: EventListener, options?: EventListenerOptions) {
    const {capture} = options || {};
    if (capture) event = `capture-${event}`;
    this.emitter.off(event, listener);
  }

  emit(event: string, payload?: any) {
    this.emitter.emit(event, payload);
  }

  eventNames() {
    return this.emitter.eventNames();
  }

  eventTypes() {
    return (this.eventNames().filter(name => isStr(name)) as string[]).map(name => {
      return name.startsWith('capture-') ? name.slice(8) : name;
    });
  }

  listeners(event: string) {
    return this.emitter.listeners(event);
  }

  hasEvent(event: string) {
    return this.emitter.listenerCount(event) > 0;
  }

  dispatchEvent(evt: SimulatedEvent) {
    this.dispatcher?.process(evt);
  }
}
