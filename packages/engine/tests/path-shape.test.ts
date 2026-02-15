import {describe, it, expect} from 'vitest';
import {Node} from '../src/scene';

describe('PathShape - box()', () => {
  it('computes bounding box from path d string', () => {
    const node = Node.create('path', {fill: 'red'});
    node.shape.from('M10 20 L110 20 L110 80 L10 80 Z');
    node.update();

    const bb = node.shape.boundingBox;
    expect(bb.x).toBe(10);
    expect(bb.y).toBe(20);
    expect(bb.width).toBe(100);
    expect(bb.height).toBe(60);
  });

  it('getWorldBBox returns non-null for path nodes', () => {
    const node = Node.create('path', {fill: 'blue'});
    node.shape.from('M0 0 L100 0 L100 50 L0 50 Z');
    node.update();

    const wbb = node.getWorldBBox();
    expect(wbb).not.toBeNull();
    expect(wbb!.x).toBe(0);
    expect(wbb!.y).toBe(0);
    expect(wbb!.width).toBe(100);
    expect(wbb!.height).toBe(50);
  });

  it('updates bounding box when path changes', () => {
    const node = Node.create('path', {fill: 'green'});
    node.shape.from('M0 0 L50 50');
    node.update();

    expect(node.shape.boundingBox.x).toBe(0);
    expect(node.shape.boundingBox.width).toBe(50);

    node.shape.from('M10 10 L200 100');
    node.update();

    expect(node.shape.boundingBox.x).toBe(10);
    expect(node.shape.boundingBox.y).toBe(10);
    expect(node.shape.boundingBox.width).toBe(190);
    expect(node.shape.boundingBox.height).toBe(90);
  });

  it('handles cubic bezier paths', () => {
    const node = Node.create('path', {fill: 'red'});
    node.shape.from('M0 0 C50 100 100 100 150 0');
    node.update();

    const bb = node.shape.boundingBox;
    expect(bb.x).toBe(0);
    expect(bb.y).toBe(0);
    expect(bb.width).toBe(150);
    expect(bb.height).toBe(100);
  });

  it('getWorldBBox returns null for empty path', () => {
    const node = Node.create('path', {fill: 'red'});
    node.shape.from('');
    node.update();

    const wbb = node.getWorldBBox();
    expect(wbb).toBeNull();
  });
});
