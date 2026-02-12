import {mat2d, vec2} from 'gl-matrix';

import {uid8, uniqueArray, isNil} from '@dye/util';

import {GraphicsTransform} from '../transforms';
import {EventTarget} from '../events/target';

import type {AO, GF, Mat2d} from '@dye/types';

export class Graphics extends EventTarget {
  type: number = 0;
  uid: string = uid8();

  name: string = '';
  className: string = '';

  parent: any = null;
  children: any[] = [];

  #nameMap: Map<string, any> = new Map();

  z: number = 0;

  visible: boolean = true;
  display: boolean = true;
  pointerEvents: boolean = true;
  // 决定是否收到父级的影响
  autoVisible: boolean = true;
  autoDisplay: boolean = true;
  autoPointerEvents: boolean = true;

  autoNeedUpdate: boolean = true;
  autoWorldMatrixNeedUpdate: boolean = true;
  needUpdate: boolean = true;
  worldMatrixNeedUpdate: boolean = true;

  data: AO = {};

  ez: number = 0;

  dirty: boolean = true;

  #classlist: string[] = [];

  // TODO: 私有变量使得外部访问困难，访问变换应该是一个很常见的需求
  #translate: vec2 = vec2.fromValues(0, 0);
  #rotate: number = 0;
  #scale: vec2 = vec2.fromValues(1, 1);

  matrix: mat2d = mat2d.create();
  worldMatrix: mat2d = mat2d.create();

  transform: GraphicsTransform | null = null;

  setName(name: string) {
    this.name = name;
    return this;
  }

  setClassName(className: string) {
    this.className = className;
    this.#classlist = uniqueArray(className.split(' ').filter(Boolean));
    return this;
  }

  addClassName(className: string) {
    if (this.#classlist.includes(className)) return this;
    this.#classlist.push(className);
    this.className = this.#classlist.join(' ');
    return this;
  }

  hasClassName(className: string) {
    return this.#classlist.includes(className);
  }

  setVisible(visible: boolean, bySelf: boolean = true) {
    if (!bySelf && !this.autoVisible) return this;
    this.visible = visible;
    if (bySelf) this.autoVisible = false;
    if (this.children.length) {
      for (let i = 0; i < this.children.length; i++) {
        this.children[i].setVisible(visible, false);
      }
    }
    this.setDirty(true);
    return this;
  }

  setDisplay(display: boolean, bySelf: boolean = true) {
    if (!bySelf && !this.autoDisplay) return this;
    this.display = display;
    if (bySelf) this.autoDisplay = false;
    if (this.children.length) {
      for (let i = 0; i < this.children.length; i++) {
        this.children[i].setDisplay(display, false);
      }
    }
    this.setDirty(true);
    return this;
  }

  setPointerEvents(pointerEvents: boolean, bySelf: boolean = true) {
    if (!bySelf && !this.autoPointerEvents) return this;
    this.pointerEvents = pointerEvents;
    if (bySelf) this.autoPointerEvents = false;
    if (this.children.length) {
      for (let i = 0; i < this.children.length; i++) {
        this.children[i].setPointerEvents(pointerEvents, false);
      }
    }
    return this;
  }

  setDirty(dirty: boolean) {
    this.dirty = dirty;
    if (this.parent && this.dirty) this.parent.setDirty(this.dirty);
    if (!this.dirty) this.children.forEach(child => child.setDirty(this.dirty));
    return this;
  }

  #removeFromNameMap(g: Graphics) {
    if (this.#nameMap.has(g.name)) this.#nameMap.delete(g.name);
  }

  add(child: any) {
    if (child.parent) child.parent.remove(child);
    child.parent = this;
    this.children.push(child);
    if (this.#nameMap.has(child.name)) throw new Error(`The name "${child.name}" is already used.`);
    if (child.name) this.#nameMap.set(child.name, child);
    this.setDirty(true);
    return this;
  }

  unshift(child: any) {
    if (child.parent) child.parent.remove(child);
    child.parent = this;
    this.children.unshift(child);
    this.#removeFromNameMap(child);
    this.setDirty(true);
    return this;
  }

  remove(child: any) {
    const index = this.children.indexOf(child);
    if (index !== -1) {
      const node = this.children[index];
      this.children.splice(index, 1);
      this.#removeFromNameMap(node);
      this.setDirty(true);
    }
    return this;
  }

  removeChildren() {
    this.children.forEach(child => (child.parent = null));
    this.children = [];
    this.#nameMap.clear();
    this.setDirty(true);
    return this;
  }

  is(name: string) {
    return this.name === name;
  }

  equals(target: any) {
    return this.uid === target.uid;
  }

  find(name: string, deep: boolean = false) {
    let node = this.#nameMap.get(name);
    if (node) return node;
    if (deep) {
      const queue: Graphics[] = [...this.children];
      while (queue.length > 0) {
        const current = queue.shift();
        node = current!.#nameMap.get(name);
        if (node) return node;
        queue.push(...current!.children);
      }
    }
    return null;
  }

  query(className: string, deep: boolean = false) {
    const result: any[] = [];
    const queue: any[] = [...this.children];

    while (queue.length > 0) {
      const node = queue.shift();
      if (node.hasClassName(className)) result.push(node);
      if (deep) queue.push(...node.children);
    }

    return result;
  }

  has(name: string, deep: boolean = false) {
    return this.find(name, deep) != null;
  }

  root() {
    return this.parent ? this.parent.root() : this;
  }

  path() {
    return this.parent ? this.parent.path().concat(this) : [this];
  }

  source(target: any) {
    return this.path().includes(target);
  }

  traverse(fn: GF) {
    fn(this);
    for (let i = 0; i < this.children.length; i++) {
      this.children[i].traverse(fn);
    }
  }

  setZ(z: number) {
    this.z = z;
    return this;
  }

  getZIndex() {
    return this.ez;
  }

  setMatrix(matrix: Mat2d, needUpdate: boolean = true) {
    this.matrix = mat2d.fromValues(...matrix);
    this.needUpdate = needUpdate;
    return this;
  }

  setWorldMatrix(matrix: Mat2d, needUpdate: boolean = true) {
    this.worldMatrix = mat2d.fromValues(...matrix);
    this.worldMatrixNeedUpdate = needUpdate;
    return this;
  }

  translate(tx: number, ty: number) {
    this.#translate = vec2.fromValues(tx, ty);
    if (this.transform) {
      this.transform.V.tx = tx;
      this.transform.V.ty = ty;
    }
    if (this.autoNeedUpdate) this.needUpdate = true;
    return this;
  }

  translateValue() {
    return this.#translate;
  }

  translateX(tx: number) {
    this.#translate[0] += tx;
    if (this.transform) this.transform.V.tx = this.#translate[0];
    if (this.autoNeedUpdate) this.needUpdate = true;
    return this;
  }

  translateY(ty: number) {
    this.#translate[1] += ty;
    if (this.transform) this.transform.V.ty = this.#translate[1];
    if (this.autoNeedUpdate) this.needUpdate = true;
    return this;
  }

  translateXY(tx: number, ty: number) {
    this.#translate[0] += tx;
    this.#translate[1] += ty;
    if (this.transform) {
      this.transform.V.tx = this.#translate[0];
      this.transform.V.ty = this.#translate[1];
    }
    if (this.autoNeedUpdate) this.needUpdate = true;
    return this;
  }

  rotateValue() {
    return this.#rotate;
  }

  rotate(radian: number) {
    this.#rotate = radian;
    if (this.transform) this.transform.V.rotate = radian;
    if (this.autoNeedUpdate) this.needUpdate = true;
    return this;
  }

  rotateZ(radian: number) {
    this.#rotate += radian;
    if (this.transform) this.transform.V.rotate = this.#rotate;
    if (this.autoNeedUpdate) this.needUpdate = true;
    return this;
  }

  scale(sx: number, sy: number) {
    this.#scale = vec2.fromValues(sx, sy);
    if (this.transform) {
      this.transform.V.sx = sx;
      this.transform.V.sy = sy;
    }
    if (this.autoNeedUpdate) this.needUpdate = true;
    return this;
  }

  scaleValue() {
    return this.#scale;
  }

  scaleX(sx: number) {
    this.#scale[0] *= sx;
    if (this.transform) this.transform.V.sx = this.#scale[0];
    if (this.autoNeedUpdate) this.needUpdate = true;
    return this;
  }

  scaleY(sy: number) {
    this.#scale[1] *= sy;
    if (this.transform) this.transform.V.sy = this.#scale[1];
    if (this.autoNeedUpdate) this.needUpdate = true;
    return this;
  }

  scaleXY(sx: number, sy: number) {
    this.#scale[0] *= sx;
    this.#scale[1] *= sy;
    if (this.transform) {
      this.transform.V.sx = this.#scale[0];
      this.transform.V.sy = this.#scale[1];
    }
    if (this.autoNeedUpdate) this.needUpdate = true;
    return this;
  }

  useTransform() {
    if (this.transform) return this;
    const [tx, ty] = this.#translate;
    const [sx, sy] = this.#scale;
    const rotate = this.#rotate;
    this.transform = new GraphicsTransform({tx, ty, sx, sy, rotate});
    return this;
  }

  renderable() {
    return this.visible && this.display;
  }

  sign(): boolean {
    if (!this.display) return false;
    if (this.dirty || this.needUpdate || this.worldMatrixNeedUpdate) return true;
    for (let i = 0; i < this.children.length; i++) if (this.children[i].sign()) return true;
    return false;
  }

  #updateMat2d() {
    if (!this.needUpdate) return;
    mat2d.identity(this.matrix);
    mat2d.translate(this.matrix, this.matrix, this.#translate);
    mat2d.rotate(this.matrix, this.matrix, this.#rotate);
    mat2d.scale(this.matrix, this.matrix, this.#scale);
    this.needUpdate = false;
    this.worldMatrixNeedUpdate = true;
  }

  #updateWorldMatrix() {
    if (!this.worldMatrixNeedUpdate) return;
    if (this.parent) mat2d.multiply(this.worldMatrix, this.parent.worldMatrix, this.matrix);
    else mat2d.copy(this.worldMatrix, this.matrix);
    this.worldMatrixNeedUpdate = false;
  }

  #updateEZ() {
    this.ez = this.parent ? this.parent.ez + this.z : this.z;
  }

  tick(time: number) {
    if (!this.display) return;
    if (this.transform) {
      this.transform.interpolate(time);
      if (this.transform.status === 'running' || this.transform.status === 'last') {
        const {tx, ty, sx, sy, rotate} = this.transform.values;
        if (!isNil(tx) && !isNil(ty)) this.translate(tx, ty);
        if (!isNil(rotate)) this.rotate(rotate);
        if (!isNil(sx) && !isNil(sy)) this.scale(sx, sy);
      }
    }

    for (let i = 0; i < this.children.length; i++) {
      this.children[i].tick(time);
    }
  }

  update() {
    if (!this.display) return;

    const needUpdateWorldMatrix = this.needUpdate || this.worldMatrixNeedUpdate;

    this.#updateMat2d();
    this.#updateWorldMatrix();

    this.#updateEZ();

    for (let i = 0; i < this.children.length; i++) {
      const child = this.children[i];
      child.worldMatrixNeedUpdate = needUpdateWorldMatrix;
      child.update();
    }
  }

  clear() {
    this.data = {};
    this.removeChildren();
  }

  dispose() {
    this.clear();
    this.parent = null;
  }
}
