import {describe, it, expect, vi, beforeEach} from 'vitest';

// ── Mock canvas 2d context (happy-dom doesn't support Canvas2D) ──
const mockCtx = {
  save: vi.fn(),
  restore: vi.fn(),
  scale: vi.fn(),
  translate: vi.fn(),
  rotate: vi.fn(),
  transform: vi.fn(),
  setTransform: vi.fn(),
  clearRect: vi.fn(),
  beginPath: vi.fn(),
  closePath: vi.fn(),
  moveTo: vi.fn(),
  lineTo: vi.fn(),
  rect: vi.fn(),
  fillRect: vi.fn(),
  strokeRect: vi.fn(),
  arc: vi.fn(),
  fill: vi.fn(),
  stroke: vi.fn(),
  clip: vi.fn(),
  fillText: vi.fn(),
  strokeText: vi.fn(),
  measureText: vi.fn(() => ({width: 0})),
  createLinearGradient: vi.fn(() => ({addColorStop: vi.fn()})),
  createRadialGradient: vi.fn(() => ({addColorStop: vi.fn()})),
  drawImage: vi.fn(),
  canvas: document.createElement('canvas'),
  globalAlpha: 1,
  fillStyle: '',
  strokeStyle: '',
  lineWidth: 1,
  lineCap: 'butt',
  lineJoin: 'miter',
  miterLimit: 10,
  lineDashOffset: 0,
  font: '',
  textAlign: 'start',
  textBaseline: 'alphabetic',
  globalCompositeOperation: 'source-over',
  shadowColor: '',
  shadowBlur: 0,
  shadowOffsetX: 0,
  shadowOffsetY: 0,
  setLineDash: vi.fn(),
  getLineDash: vi.fn(() => []),
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
(globalThis as any).Path2D = class Path2D {
  constructor() {}
};

const origGetContext = HTMLCanvasElement.prototype.getContext;
beforeEach(() => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  HTMLCanvasElement.prototype.getContext = vi.fn(() => mockCtx) as any;
  return () => {
    HTMLCanvasElement.prototype.getContext = origGetContext;
  };
});

import {dragPlugin, DragPlugin, applyConstraint, constrainDelta, snapToGrid, clampToBounds} from '../src/main';
import {App, Node, Group, SimulatedEvent, Graphics} from 'rendx-engine';

import type {DragStartEvent, DragMoveEvent, DragEndEvent} from '../src/main';

// ── 测试工具 ──

function createApp() {
  const container = document.createElement('div');
  const app = new App({width: 600, height: 400});
  app.mount(container);
  return {app, container};
}

function createSimEvent(type: string, target: Graphics, opts?: {worldX?: number; worldY?: number; offsetX?: number; offsetY?: number}) {
  const native = new PointerEvent(type);
  const event = new SimulatedEvent(type, target, native);
  event.worldX = opts?.worldX ?? 0;
  event.worldY = opts?.worldY ?? 0;
  event.offsetX = opts?.offsetX ?? event.worldX;
  event.offsetY = opts?.offsetY ?? event.worldY;
  return event;
}

// ════════════════════════════════════════════════════════════
//  Constraint 工具函数测试
// ════════════════════════════════════════════════════════════

describe('constraint utilities', () => {
  describe('constrainDelta', () => {
    it('should return original delta when no constraint', () => {
      expect(constrainDelta(10, 20, undefined)).toEqual([10, 20]);
    });

    it('should lock y axis when axis=x', () => {
      expect(constrainDelta(10, 20, {axis: 'x'})).toEqual([10, 0]);
    });

    it('should lock x axis when axis=y', () => {
      expect(constrainDelta(10, 20, {axis: 'y'})).toEqual([0, 20]);
    });

    it('should allow both axes when axis=both', () => {
      expect(constrainDelta(10, 20, {axis: 'both'})).toEqual([10, 20]);
    });
  });

  describe('snapToGrid', () => {
    it('should return original position when no grid', () => {
      expect(snapToGrid(13, 17, undefined)).toEqual([13, 17]);
    });

    it('should snap to uniform grid', () => {
      expect(snapToGrid(13, 17, {grid: 10})).toEqual([10, 20]);
    });

    it('should snap to asymmetric grid', () => {
      expect(snapToGrid(13, 17, {grid: [5, 10]})).toEqual([15, 20]);
    });
  });

  describe('clampToBounds', () => {
    it('should return original position when no bounds', () => {
      expect(clampToBounds(-10, 500, undefined)).toEqual([-10, 500]);
    });

    it('should clamp to min bounds', () => {
      expect(clampToBounds(-10, -20, {bounds: {minX: 0, minY: 0}})).toEqual([0, 0]);
    });

    it('should clamp to max bounds', () => {
      expect(clampToBounds(900, 500, {bounds: {maxX: 800, maxY: 400}})).toEqual([800, 400]);
    });
  });

  describe('applyConstraint (composite)', () => {
    it('should apply axis + grid + bounds in order', () => {
      const [x, y] = applyConstraint(
        100, // startX
        100, // startY
        55, // totalDx
        30, // totalDy
        {
          axis: 'x', // lock Y → dy=0
          grid: 20, // snap → round(155/20)*20 = 160
          bounds: {maxX: 150}, // clamp → 150
        },
      );
      expect(x).toBe(150);
      expect(y).toBe(100); // locked to start Y, grid(100/20)=100, no clamp needed
    });
  });
});

// ════════════════════════════════════════════════════════════
//  DragPlugin 基础测试
// ════════════════════════════════════════════════════════════

describe('DragPlugin', () => {
  it('should create with factory function', () => {
    const plugin = dragPlugin();
    expect(plugin).toBeInstanceOf(DragPlugin);
    expect(plugin.name).toBe('drag');
  });

  it('should install and register state', () => {
    const {app} = createApp();
    const plugin = dragPlugin();
    app.use(plugin);

    expect(app.getState('drag:dragging')).toBe(false);
    expect(app.getState('drag:targets')).toEqual([]);
  });

  it('should not duplicate install', () => {
    const {app} = createApp();
    const p1 = dragPlugin();
    const p2 = dragPlugin();
    app.use(p1);
    // second install should be ignored (same name)
    app.use(p2);
    expect(app.getPlugin('drag')).toBe(p1);
  });

  it('should report isDragging false initially', () => {
    const {app} = createApp();
    const plugin = dragPlugin();
    app.use(plugin);
    expect(plugin.isDragging()).toBe(false);
    expect(plugin.getTargets()).toEqual([]);
  });
});

// ════════════════════════════════════════════════════════════
//  拖拽流程测试（纯 engine 场景）
// ════════════════════════════════════════════════════════════

describe('drag flow — pure engine', () => {
  let app: App;
  let plugin: DragPlugin;
  let node: Node;

  beforeEach(() => {
    const res = createApp();
    app = res.app;

    node = Node.create('rect', {fill: '#f00'});
    node.shape.from(100, 100, 50, 50);
    node.translate(100, 100);
    app.scene.add(node);

    plugin = dragPlugin();
    app.use(plugin);
  });

  it('should not start drag if move below threshold', () => {
    const startSpy = vi.fn();
    app.bus.on('drag:start', startSpy);

    // pointerdown
    const down = createSimEvent('pointerdown', node, {worldX: 120, worldY: 120});
    app.scene.emit('pointerdown', down);

    // small move (< 3px)
    const move = createSimEvent('pointermove', node, {worldX: 121, worldY: 121});
    app.scene.emit('pointermove', move);

    expect(startSpy).not.toHaveBeenCalled();
    expect(plugin.isDragging()).toBe(false);
  });

  it('should start drag when move exceeds threshold', () => {
    const startSpy = vi.fn();
    app.bus.on('drag:start', startSpy);

    const down = createSimEvent('pointerdown', node, {worldX: 120, worldY: 120});
    app.scene.emit('pointerdown', down);

    const move = createSimEvent('pointermove', node, {worldX: 130, worldY: 130});
    app.scene.emit('pointermove', move);

    expect(startSpy).toHaveBeenCalled();
    expect(plugin.isDragging()).toBe(true);

    const payload = startSpy.mock.calls[0][0] as DragStartEvent;
    expect(payload.targets).toHaveLength(1);
    expect(payload.origin).toEqual([120, 120]);
  });

  it('should move node during drag (translate)', () => {
    const down = createSimEvent('pointerdown', node, {worldX: 120, worldY: 120});
    app.scene.emit('pointerdown', down);

    // exceed threshold
    const move1 = createSimEvent('pointermove', node, {worldX: 130, worldY: 130});
    app.scene.emit('pointermove', move1);

    // drag to new position
    const move2 = createSimEvent('pointermove', node, {worldX: 150, worldY: 160});
    app.scene.emit('pointermove', move2);

    // node should have moved by totalDelta (30, 40) from initial (100, 100)
    expect(node.translation[0]).toBe(130);
    expect(node.translation[1]).toBe(140);
  });

  it('should emit drag:move events', () => {
    const moveSpy = vi.fn();
    app.bus.on('drag:move', moveSpy);

    const down = createSimEvent('pointerdown', node, {worldX: 100, worldY: 100});
    app.scene.emit('pointerdown', down);

    const move1 = createSimEvent('pointermove', node, {worldX: 110, worldY: 110});
    app.scene.emit('pointermove', move1);

    const move2 = createSimEvent('pointermove', node, {worldX: 120, worldY: 130});
    app.scene.emit('pointermove', move2);

    // First call is from the threshold-crossing move, second from move2
    expect(moveSpy).toHaveBeenCalledTimes(2);

    const lastPayload = moveSpy.mock.calls[1][0] as DragMoveEvent;
    expect(lastPayload.totalDelta).toEqual([20, 30]);
  });

  it('should emit drag:end on pointerup', () => {
    const endSpy = vi.fn();
    app.bus.on('drag:end', endSpy);

    const down = createSimEvent('pointerdown', node, {worldX: 100, worldY: 100});
    app.scene.emit('pointerdown', down);

    const move = createSimEvent('pointermove', node, {worldX: 120, worldY: 130});
    app.scene.emit('pointermove', move);

    // pointerup on window
    window.dispatchEvent(new PointerEvent('pointerup'));

    expect(endSpy).toHaveBeenCalled();
    expect(plugin.isDragging()).toBe(false);

    const payload = endSpy.mock.calls[0][0] as DragEndEvent;
    expect(payload.startPositions).toHaveLength(1);
    expect(payload.endPositions).toHaveLength(1);
    expect(payload.startPositions[0].x).toBe(100);
    expect(payload.startPositions[0].y).toBe(100);
  });

  it('should cancel drag and rollback on Escape', () => {
    const cancelSpy = vi.fn();
    app.bus.on('drag:cancel', cancelSpy);

    const down = createSimEvent('pointerdown', node, {worldX: 100, worldY: 100});
    app.scene.emit('pointerdown', down);

    const move = createSimEvent('pointermove', node, {worldX: 150, worldY: 150});
    app.scene.emit('pointermove', move);

    expect(plugin.isDragging()).toBe(true);

    // Escape
    window.dispatchEvent(new KeyboardEvent('keydown', {key: 'Escape'}));

    expect(cancelSpy).toHaveBeenCalled();
    expect(plugin.isDragging()).toBe(false);

    // Position should be rolled back
    expect(node.translation[0]).toBe(100);
    expect(node.translation[1]).toBe(100);
  });

  it('should cancel programmatically via cancel()', () => {
    const cancelSpy = vi.fn();
    app.bus.on('drag:cancel', cancelSpy);

    const down = createSimEvent('pointerdown', node, {worldX: 100, worldY: 100});
    app.scene.emit('pointerdown', down);

    const move = createSimEvent('pointermove', node, {worldX: 150, worldY: 150});
    app.scene.emit('pointermove', move);

    plugin.cancel();

    expect(cancelSpy).toHaveBeenCalled();
    expect(node.translation[0]).toBe(100);
    expect(node.translation[1]).toBe(100);
  });

  it('should not drag scene itself', () => {
    const startSpy = vi.fn();
    app.bus.on('drag:start', startSpy);

    const down = createSimEvent('pointerdown', app.scene, {worldX: 10, worldY: 10});
    app.scene.emit('pointerdown', down);

    const move = createSimEvent('pointermove', app.scene, {worldX: 50, worldY: 50});
    app.scene.emit('pointermove', move);

    expect(startSpy).not.toHaveBeenCalled();
  });

  it('should reset state on pointerup without exceeding threshold', () => {
    const down = createSimEvent('pointerdown', node, {worldX: 100, worldY: 100});
    app.scene.emit('pointerdown', down);

    // pointerup without moving enough
    window.dispatchEvent(new PointerEvent('pointerup'));

    expect(plugin.isDragging()).toBe(false);
  });
});

// ════════════════════════════════════════════════════════════
//  hitDelegate + filter
// ════════════════════════════════════════════════════════════

describe('hitDelegate and filter', () => {
  it('should use hitDelegate to resolve drag target', () => {
    const {app} = createApp();
    const group = new Group();
    group.setName('my-group');
    const child = Node.create('rect', {fill: '#f00'});
    child.shape.from(0, 0, 50, 50);
    group.add(child);
    group.translate(100, 100);
    app.scene.add(group);

    const plugin = dragPlugin({
      hitDelegate: target => {
        // Map child → parent group
        if (target.parent && target.parent.type === 2) return target.parent;
        return target;
      },
    });
    app.use(plugin);

    const startSpy = vi.fn();
    app.bus.on('drag:start', startSpy);

    // pointerdown on child
    const down = createSimEvent('pointerdown', child, {worldX: 110, worldY: 110});
    app.scene.emit('pointerdown', down);

    const move = createSimEvent('pointermove', child, {worldX: 130, worldY: 130});
    app.scene.emit('pointermove', move);

    expect(startSpy).toHaveBeenCalled();
    const payload = startSpy.mock.calls[0][0] as DragStartEvent;
    // Drag target should be the group, not the child
    expect(payload.targets[0]).toBe(group);
  });

  it('should reject drag when filter returns false', () => {
    const {app} = createApp();
    const node = Node.create('rect', {fill: '#f00'});
    node.shape.from(0, 0, 50, 50);
    node.translate(100, 100);
    node.setClassName('no-drag');
    app.scene.add(node);

    const plugin = dragPlugin({
      filter: target => !target.hasClassName('no-drag'),
    });
    app.use(plugin);

    const startSpy = vi.fn();
    app.bus.on('drag:start', startSpy);

    const down = createSimEvent('pointerdown', node, {worldX: 110, worldY: 110});
    app.scene.emit('pointerdown', down);

    const move = createSimEvent('pointermove', node, {worldX: 130, worldY: 130});
    app.scene.emit('pointermove', move);

    expect(startSpy).not.toHaveBeenCalled();
  });

  it('should reject drag when hitDelegate returns null', () => {
    const {app} = createApp();
    const node = Node.create('rect', {fill: '#f00'});
    node.shape.from(0, 0, 50, 50);
    node.translate(100, 100);
    app.scene.add(node);

    const plugin = dragPlugin({
      hitDelegate: () => null, // reject all
    });
    app.use(plugin);

    const startSpy = vi.fn();
    app.bus.on('drag:start', startSpy);

    const down = createSimEvent('pointerdown', node, {worldX: 110, worldY: 110});
    app.scene.emit('pointerdown', down);

    const move = createSimEvent('pointermove', node, {worldX: 130, worldY: 130});
    app.scene.emit('pointermove', move);

    expect(startSpy).not.toHaveBeenCalled();
  });
});

// ════════════════════════════════════════════════════════════
//  约束测试
// ════════════════════════════════════════════════════════════

describe('drag with constraints', () => {
  it('should lock axis=x (only horizontal)', () => {
    const {app} = createApp();
    const node = Node.create('rect', {fill: '#f00'});
    node.shape.from(0, 0, 50, 50);
    node.translate(100, 100);
    app.scene.add(node);

    const plugin = dragPlugin({constraint: {axis: 'x'}});
    app.use(plugin);

    const down = createSimEvent('pointerdown', node, {worldX: 100, worldY: 100});
    app.scene.emit('pointerdown', down);

    const move = createSimEvent('pointermove', node, {worldX: 150, worldY: 180});
    app.scene.emit('pointermove', move);

    // X should move, Y should stay
    expect(node.translation[0]).toBe(150);
    expect(node.translation[1]).toBe(100);
  });

  it('should lock axis=y (only vertical)', () => {
    const {app} = createApp();
    const node = Node.create('rect', {fill: '#f00'});
    node.shape.from(0, 0, 50, 50);
    node.translate(100, 100);
    app.scene.add(node);

    const plugin = dragPlugin({constraint: {axis: 'y'}});
    app.use(plugin);

    const down = createSimEvent('pointerdown', node, {worldX: 100, worldY: 100});
    app.scene.emit('pointerdown', down);

    const move = createSimEvent('pointermove', node, {worldX: 150, worldY: 180});
    app.scene.emit('pointermove', move);

    expect(node.translation[0]).toBe(100);
    expect(node.translation[1]).toBe(180);
  });

  it('should snap to grid', () => {
    const {app} = createApp();
    const node = Node.create('rect', {fill: '#f00'});
    node.shape.from(0, 0, 50, 50);
    node.translate(100, 100);
    app.scene.add(node);

    const plugin = dragPlugin({constraint: {grid: 20}});
    app.use(plugin);

    const down = createSimEvent('pointerdown', node, {worldX: 100, worldY: 100});
    app.scene.emit('pointerdown', down);

    const move = createSimEvent('pointermove', node, {worldX: 113, worldY: 127});
    app.scene.emit('pointermove', move);

    // 100 + 13 = 113, snap to 120; 100 + 27 = 127, snap to 120
    expect(node.translation[0]).toBe(120);
    expect(node.translation[1]).toBe(120);
  });

  it('should clamp to bounds', () => {
    const {app} = createApp();
    const node = Node.create('rect', {fill: '#f00'});
    node.shape.from(0, 0, 50, 50);
    node.translate(100, 100);
    app.scene.add(node);

    const plugin = dragPlugin({constraint: {bounds: {minX: 50, maxX: 200, minY: 50, maxY: 200}}});
    app.use(plugin);

    const down = createSimEvent('pointerdown', node, {worldX: 100, worldY: 100});
    app.scene.emit('pointerdown', down);

    // Try to drag beyond maxX/maxY
    const move = createSimEvent('pointermove', node, {worldX: 400, worldY: 400});
    app.scene.emit('pointermove', move);

    expect(node.translation[0]).toBe(200);
    expect(node.translation[1]).toBe(200);
  });
});

// ════════════════════════════════════════════════════════════
//  applyPosition 自定义
// ════════════════════════════════════════════════════════════

describe('custom applyPosition', () => {
  it('should use custom applyPosition callback', () => {
    const {app} = createApp();
    const node = Node.create('rect', {fill: '#f00'});
    node.shape.from(0, 0, 50, 50);
    node.translate(100, 100);
    app.scene.add(node);

    const applyFn = vi.fn();
    const plugin = dragPlugin({applyPosition: applyFn});
    app.use(plugin);

    const down = createSimEvent('pointerdown', node, {worldX: 100, worldY: 100});
    app.scene.emit('pointerdown', down);

    const move = createSimEvent('pointermove', node, {worldX: 120, worldY: 130});
    app.scene.emit('pointermove', move);

    expect(applyFn).toHaveBeenCalledWith(node, 120, 130, expect.any(Array));
  });
});

// ════════════════════════════════════════════════════════════
//  dispose
// ════════════════════════════════════════════════════════════

describe('dispose', () => {
  it('should clean up on dispose', () => {
    const {app} = createApp();
    const plugin = dragPlugin();
    app.use(plugin);

    // Start a drag
    const node = Node.create('rect', {fill: '#f00'});
    node.shape.from(0, 0, 50, 50);
    node.translate(100, 100);
    app.scene.add(node);

    const down = createSimEvent('pointerdown', node, {worldX: 100, worldY: 100});
    app.scene.emit('pointerdown', down);
    const move = createSimEvent('pointermove', node, {worldX: 120, worldY: 120});
    app.scene.emit('pointermove', move);

    expect(plugin.isDragging()).toBe(true);

    plugin.dispose();

    expect(plugin.isDragging()).toBe(false);
  });
});
