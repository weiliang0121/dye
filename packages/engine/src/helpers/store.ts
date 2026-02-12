import {createShape} from '../shapes';
import {Attributes} from '../core';

export class Store {
  shapeMap: Map<string, any> = new Map();
  attributesMap: Map<string, any> = new Map();

  createShape(name: string, type: string) {
    const shape = createShape(type);
    shape.name = name;
    this.addShape(name, shape);
    return shape;
  }

  addShape(name: string, shape: any) {
    this.shapeMap.set(name, shape);
  }

  getShape(name: string) {
    return this.shapeMap.get(name);
  }

  createAttributes(name: string) {
    const attributes = new Attributes();
    attributes.name = name;
    this.addAttributes(name, attributes);
    return attributes;
  }

  addAttributes(name: string, attributes: any) {
    this.attributesMap.set(name, attributes);
  }

  getAttributes(name: string) {
    return this.attributesMap.get(name);
  }
}
