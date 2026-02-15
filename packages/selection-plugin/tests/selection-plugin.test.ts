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

import {selectionPlugin, SelectionPlugin, getWorldBBox} from '../src/main';
import {App, Node, Group, SimulatedEvent, Graphics} from 'rendx-engine';

// ── 测试工具 ──

function createApp() {
  const container = document.createElement('div');
  const app = new App({width: 600, height: 400});
  app.mount(container);
  return {app, container};
}

function createSimEvent(type: string, target: Graphics, opts?: {offsetX?: number; offsetY?: number; shiftKey?: boolean; metaKey?: boolean}) {
  const native = new PointerEvent(type, {
    shiftKey: opts?.shiftKey ?? false,
    metaKey: opts?.metaKey ?? false,
  });
  const e = new SimulatedEvent(type, target, native);
  e.offsetX = opts?.offsetX ?? 0;
  e.offsetY = opts?.offsetY ?? 0;
  return e;
}

function addRect(app: App, x: number, y: number, w: number, h: number): Node {
  const rect = Node.create('rect', {fill: '#4dabf7', stroke: '#1c7ed6', strokeWidth: 2});
  rect.shape.from(x, y, w, h);
  app.scene.add(rect);
  return rect;
}

function addCircle(app: App, cx: number, cy: number, r: number): Node {
  const circle = Node.create('circle', {fill: '#ff6b6b', stroke: '#c92a2a', strokeWidth: 2});
  circle.shape.from(cx, cy, r);
  app.scene.add(circle);
  return circle;
}
void addCircle; // 保留工具函数备用

// ════════════════════════════════════════════════════════════
//  Tests
// ════════════════════════════════════════════════════════════

describe('SelectionPlugin', () => {
  // ── 工厂 + 构造 ──────────────────────────────────────────

  describe('factory & construction', () => {
    it('selectionPlugin() 创建实例', () => {
      const plugin = selectionPlugin();
      expect(plugin).toBeInstanceOf(SelectionPlugin);
      expect(plugin.name).toBe('selection');
    });

    it('默认 enableHover = false', () => {
      const plugin = selectionPlugin();
      expect(plugin.getHovering()).toBeNull();
    });

    it('默认 enableMarquee = false（不绑定 pointerdown）', () => {
      const {app} = createApp();
      const plugin = selectionPlugin();
      app.use(plugin);
      // 无 pointerdown → window 上无 pointerup 监听（难以直接测试，用行为间接验证）
      expect(plugin.getSelected()).toEqual([]);
    });

    it('声明 selection 层', () => {
      const plugin = selectionPlugin();
      expect(plugin.layers).toEqual([{name: 'selection', zIndex: 10}]);
    });

    it('自定义 zIndex', () => {
      const plugin = selectionPlugin({zIndex: 5});
      expect(plugin.layers).toEqual([{name: 'selection', zIndex: 5}]);
    });

    it('state 声明包含 selected 和 hovering', () => {
      const plugin = selectionPlugin();
      const keys = plugin.state.map(s => s.key);
      expect(keys).toContain('selection:selected');
      expect(keys).toContain('selection:hovering');
    });
  });

  // ── 安装 ────────────────────────────────────────────────

  describe('install', () => {
    it('安装后创建 selection 层', () => {
      const {app} = createApp();
      app.use(selectionPlugin());
      expect(app.getLayer('selection')).toBeDefined();
    });

    it('selection 层 pointerEvents = false', () => {
      const {app} = createApp();
      app.use(selectionPlugin());
      const layer = app.getLayer('selection')!;
      expect(layer.pointerEvents).toBe(false);
    });

    it('selection 层 culling = false', () => {
      const {app} = createApp();
      app.use(selectionPlugin());
      const layer = app.getLayer('selection')!;
      expect(layer.culling).toBe(false);
    });

    it('安装后有 __sel_boxes__ 和 __sel_hover__ 子 group', () => {
      const {app} = createApp();
      app.use(selectionPlugin());
      const layer = app.getLayer('selection')!;
      const boxes = layer.find('__sel_boxes__');
      const hover = layer.find('__sel_hover__');
      expect(boxes).toBeDefined();
      expect(hover).toBeDefined();
    });
  });

  // ── 点击选中 ────────────────────────────────────────────

  describe('click selection', () => {
    it('点击节点 → 选中该节点', () => {
      const {app} = createApp();
      const plugin = selectionPlugin();
      app.use(plugin);
      const rect = addRect(app, 100, 100, 50, 50);
      app.render();

      // 模拟 click
      app.scene.emit('click', createSimEvent('click', rect));

      expect(plugin.getSelected()).toEqual([rect]);
    });

    it('点击空白 → 清空选中', () => {
      const {app} = createApp();
      const plugin = selectionPlugin();
      app.use(plugin);
      const rect = addRect(app, 100, 100, 50, 50);
      app.render();

      // 先选中
      app.scene.emit('click', createSimEvent('click', rect));
      expect(plugin.getSelected()).toHaveLength(1);

      // 点击空白（target = scene）
      app.scene.emit('click', createSimEvent('click', app.scene));
      expect(plugin.getSelected()).toHaveLength(0);
    });

    it('重复点击同一节点不触发变更', () => {
      const {app} = createApp();
      const plugin = selectionPlugin();
      app.use(plugin);
      const rect = addRect(app, 100, 100, 50, 50);
      app.render();

      const changeFn = vi.fn();
      app.bus.on('selection:change', changeFn);

      // 第一次点击
      app.scene.emit('click', createSimEvent('click', rect));
      expect(changeFn).toHaveBeenCalledTimes(1);

      // 第二次点击同一节点（单选模式下不变）
      app.scene.emit('click', createSimEvent('click', rect));
      expect(changeFn).toHaveBeenCalledTimes(1); // 不应再次触发
    });

    it('点击不同节点 → 替换选中', () => {
      const {app} = createApp();
      const plugin = selectionPlugin();
      app.use(plugin);
      const r1 = addRect(app, 100, 100, 50, 50);
      const r2 = addRect(app, 200, 200, 50, 50);
      app.render();

      app.scene.emit('click', createSimEvent('click', r1));
      expect(plugin.getSelected()).toEqual([r1]);

      app.scene.emit('click', createSimEvent('click', r2));
      expect(plugin.getSelected()).toEqual([r2]);
    });
  });

  // ── 多选 ──────────────────────────────────────────────

  describe('multi-select', () => {
    it('Shift+点击 → 加选', () => {
      const {app} = createApp();
      const plugin = selectionPlugin({enableMultiSelect: true});
      app.use(plugin);
      const r1 = addRect(app, 100, 100, 50, 50);
      const r2 = addRect(app, 200, 200, 50, 50);
      app.render();

      app.scene.emit('click', createSimEvent('click', r1));
      app.scene.emit('click', createSimEvent('click', r2, {shiftKey: true}));

      expect(plugin.getSelected()).toEqual([r1, r2]);
    });

    it('Shift+点击已选中节点 → 取消选中', () => {
      const {app} = createApp();
      const plugin = selectionPlugin({enableMultiSelect: true});
      app.use(plugin);
      const r1 = addRect(app, 100, 100, 50, 50);
      const r2 = addRect(app, 200, 200, 50, 50);
      app.render();

      app.scene.emit('click', createSimEvent('click', r1));
      app.scene.emit('click', createSimEvent('click', r2, {shiftKey: true}));
      app.scene.emit('click', createSimEvent('click', r1, {shiftKey: true}));

      expect(plugin.getSelected()).toEqual([r2]);
    });

    it('Meta+点击 等同 Shift+点击', () => {
      const {app} = createApp();
      const plugin = selectionPlugin({enableMultiSelect: true});
      app.use(plugin);
      const r1 = addRect(app, 100, 100, 50, 50);
      const r2 = addRect(app, 200, 200, 50, 50);
      app.render();

      app.scene.emit('click', createSimEvent('click', r1));
      app.scene.emit('click', createSimEvent('click', r2, {metaKey: true}));

      expect(plugin.getSelected()).toEqual([r1, r2]);
    });

    it('enableMultiSelect=false → Shift+点击无效，仍为单选', () => {
      const {app} = createApp();
      const plugin = selectionPlugin({enableMultiSelect: false});
      app.use(plugin);
      const r1 = addRect(app, 100, 100, 50, 50);
      const r2 = addRect(app, 200, 200, 50, 50);
      app.render();

      app.scene.emit('click', createSimEvent('click', r1));
      app.scene.emit('click', createSimEvent('click', r2, {shiftKey: true}));

      expect(plugin.getSelected()).toEqual([r2]); // 替换而非加选
    });
  });

  // ── 事件总线 ────────────────────────────────────────────

  describe('events', () => {
    it('selection:change 事件包含 added / removed / selected', () => {
      const {app} = createApp();
      const plugin = selectionPlugin();
      app.use(plugin);
      const rect = addRect(app, 100, 100, 50, 50);
      app.render();

      const changeFn = vi.fn();
      app.bus.on('selection:change', changeFn);

      app.scene.emit('click', createSimEvent('click', rect));

      expect(changeFn).toHaveBeenCalledWith(
        expect.objectContaining({
          selected: [rect],
          added: [rect],
          removed: [],
        }),
      );
    });

    it('清空选中时 removed 包含之前的节点', () => {
      const {app} = createApp();
      const plugin = selectionPlugin();
      app.use(plugin);
      const rect = addRect(app, 100, 100, 50, 50);
      app.render();

      app.scene.emit('click', createSimEvent('click', rect));

      const changeFn = vi.fn();
      app.bus.on('selection:change', changeFn);

      app.scene.emit('click', createSimEvent('click', app.scene));

      expect(changeFn).toHaveBeenCalledWith(
        expect.objectContaining({
          selected: [],
          added: [],
          removed: [rect],
        }),
      );
    });

    it('selection:hover-change 事件（需开启 enableHover）', () => {
      const {app} = createApp();
      const plugin = selectionPlugin({enableHover: true});
      app.use(plugin);
      const rect = addRect(app, 100, 100, 50, 50);
      app.render();

      const hoverFn = vi.fn();
      app.bus.on('selection:hover-change', hoverFn);

      app.scene.emit('pointermove', createSimEvent('pointermove', rect, {offsetX: 125, offsetY: 125}));

      expect(hoverFn).toHaveBeenCalledWith(
        expect.objectContaining({
          current: rect,
          previous: null,
        }),
      );
    });
  });

  // ── hitDelegate ──────────────────────────────────────────

  describe('hitDelegate', () => {
    it('hitDelegate 将叶子节点映射到祖先 Group', () => {
      const {app} = createApp();

      const group = new Group();
      group.addClassName('selectable');
      const childRect = Node.create('rect', {fill: '#f00'});
      childRect.shape.from(100, 100, 50, 50);
      group.add(childRect);
      app.scene.add(group);
      app.render();

      const plugin = selectionPlugin({
        hitDelegate: (target: Graphics) => {
          let node: Graphics | null = target;
          while (node && node.type !== 4) {
            if (node.hasClassName('selectable')) return node;
            node = node.parent;
          }
          return null;
        },
      });
      app.use(plugin);

      // 点击叶子节点 → 选中的应该是 group
      app.scene.emit('click', createSimEvent('click', childRect));
      expect(plugin.getSelected()).toEqual([group]);
    });

    it('hitDelegate 返回 null → 忽略命中', () => {
      const {app} = createApp();
      const rect = addRect(app, 100, 100, 50, 50);
      app.render();

      const plugin = selectionPlugin({
        hitDelegate: () => null,
      });
      app.use(plugin);

      app.scene.emit('click', createSimEvent('click', rect));
      expect(plugin.getSelected()).toHaveLength(0);
    });
  });

  // ── filter ────────────────────────────────────────────

  describe('filter', () => {
    it('filter 返回 false → 节点不可选中', () => {
      const {app} = createApp();
      const r1 = addRect(app, 100, 100, 50, 50);
      r1.addClassName('no-select');
      const r2 = addRect(app, 200, 200, 50, 50);
      app.render();

      const plugin = selectionPlugin({
        filter: t => !t.hasClassName('no-select'),
      });
      app.use(plugin);

      app.scene.emit('click', createSimEvent('click', r1));
      expect(plugin.getSelected()).toHaveLength(0);

      app.scene.emit('click', createSimEvent('click', r2));
      expect(plugin.getSelected()).toEqual([r2]);
    });
  });

  // ── 编程式 API ─────────────────────────────────────────

  describe('programmatic API', () => {
    it('select() 编程式设置选中', () => {
      const {app} = createApp();
      const plugin = selectionPlugin();
      app.use(plugin);
      const r1 = addRect(app, 100, 100, 50, 50);
      const r2 = addRect(app, 200, 200, 50, 50);
      app.render();

      plugin.select([r1, r2]);
      expect(plugin.getSelected()).toEqual([r1, r2]);
    });

    it('select() 触发 selection:change 事件', () => {
      const {app} = createApp();
      const plugin = selectionPlugin();
      app.use(plugin);
      const rect = addRect(app, 100, 100, 50, 50);
      app.render();

      const changeFn = vi.fn();
      app.bus.on('selection:change', changeFn);

      plugin.select([rect]);
      expect(changeFn).toHaveBeenCalledOnce();
    });

    it('clearSelection() 清空', () => {
      const {app} = createApp();
      const plugin = selectionPlugin();
      app.use(plugin);
      const rect = addRect(app, 100, 100, 50, 50);
      app.render();

      plugin.select([rect]);
      plugin.clearSelection();
      expect(plugin.getSelected()).toHaveLength(0);
    });

    it('clearSelection() 空列表时不触发事件', () => {
      const {app} = createApp();
      const plugin = selectionPlugin();
      app.use(plugin);

      const changeFn = vi.fn();
      app.bus.on('selection:change', changeFn);

      plugin.clearSelection();
      expect(changeFn).not.toHaveBeenCalled();
    });
  });

  // ── Overlay 生成 ──────────────────────────────────────

  describe('overlay generation', () => {
    it('选中后 __sel_boxes__ group 中有子节点', () => {
      const {app} = createApp();
      const plugin = selectionPlugin();
      app.use(plugin);
      const rect = addRect(app, 100, 100, 50, 50);
      app.render();

      plugin.select([rect]);
      const layer = app.getLayer('selection')!;
      const boxes = layer.find('__sel_boxes__')!;
      expect(boxes.children.length).toBe(1);
    });

    it('选中多个节点 → 对应数量的 overlay rect', () => {
      const {app} = createApp();
      const plugin = selectionPlugin();
      app.use(plugin);
      const r1 = addRect(app, 100, 100, 50, 50);
      const r2 = addRect(app, 200, 200, 50, 50);
      app.render();

      plugin.select([r1, r2]);
      const boxes = app.getLayer('selection')!.find('__sel_boxes__')!;
      expect(boxes.children.length).toBe(2);
    });

    it('清空选中后 overlay rect 被移除', () => {
      const {app} = createApp();
      const plugin = selectionPlugin();
      app.use(plugin);
      const rect = addRect(app, 100, 100, 50, 50);
      app.render();

      plugin.select([rect]);
      plugin.clearSelection();
      const boxes = app.getLayer('selection')!.find('__sel_boxes__')!;
      expect(boxes.children.length).toBe(0);
    });

    it('overlay rect 的位置和大小正确（worldBBox + padding）', () => {
      const {app} = createApp();
      const plugin = selectionPlugin({selectionStyle: {padding: 2}});
      app.use(plugin);
      const rect = addRect(app, 100, 100, 50, 50);
      app.render();

      // 需要先调用 update 计算 worldMatrix
      const layer = app.getLayer('default')!;
      layer.update();

      plugin.select([rect]);
      const boxes = app.getLayer('selection')!.find('__sel_boxes__')!;
      const overlayNode = boxes.children[0] as Node;

      // rect shape: x=100, y=100, w=50, h=50
      // worldBBox with identity matrix = (100, 100, 50, 50)
      // padding=2 → overlay at (98, 98, 54, 54)
      const shape = overlayNode.shape;
      expect(shape.x).toBe(98);
      expect(shape.y).toBe(98);
      expect(shape.width).toBe(54);
      expect(shape.height).toBe(54);
    });

    it('overlay rect 不参与命中检测 (pointerEvents=false)', () => {
      const {app} = createApp();
      const plugin = selectionPlugin();
      app.use(plugin);
      const rect = addRect(app, 100, 100, 50, 50);
      app.render();

      plugin.select([rect]);
      const boxes = app.getLayer('selection')!.find('__sel_boxes__')!;
      const overlayNode = boxes.children[0] as Node;

      expect(overlayNode.pointerEvents).toBe(false);
    });

    it('overlay rect 有正确的 strokeDasharray 属性', () => {
      const {app} = createApp();
      const plugin = selectionPlugin({
        selectionStyle: {strokeDasharray: '8, 4'},
      });
      app.use(plugin);
      const rect = addRect(app, 100, 100, 50, 50);
      app.render();

      plugin.select([rect]);
      const boxes = app.getLayer('selection')!.find('__sel_boxes__')!;
      const overlayNode = boxes.children[0] as Node;

      expect(overlayNode.attrs.values.strokeDasharray).toBe('8, 4');
    });

    it('renderOverlay 自定义选中 overlay', () => {
      const {app} = createApp();
      const plugin = selectionPlugin({
        renderOverlay: (target, type) => {
          if (type === 'selection') {
            const overlay = Node.create('rect', {stroke: '#ff0000', strokeWidth: 4, fill: 'none'});
            overlay.shape.from(0, 0, 10, 10);
            return overlay;
          }
          return null;
        },
      });
      app.use(plugin);
      const rect = addRect(app, 100, 100, 50, 50);
      app.render();

      plugin.select([rect]);
      const boxes = app.getLayer('selection')!.find('__sel_boxes__')!;
      expect(boxes.children.length).toBe(1);
      const overlayNode = boxes.children[0] as Node;
      expect(overlayNode.attrs.values.stroke).toBe('#ff0000');
      expect(overlayNode.attrs.values.strokeWidth).toBe(4);
    });

    it('renderOverlay 返回 null 回退到默认矩形', () => {
      const {app} = createApp();
      const plugin = selectionPlugin({
        renderOverlay: () => null,
      });
      app.use(plugin);
      const rect = addRect(app, 100, 100, 50, 50);
      app.render();

      plugin.select([rect]);
      const boxes = app.getLayer('selection')!.find('__sel_boxes__')!;
      expect(boxes.children.length).toBe(1);
      // 默认矩形的 strokeWidth 应为 2
      const overlayNode = boxes.children[0] as Node;
      expect(overlayNode.attrs.values.strokeWidth).toBe(2);
    });

    it('renderOverlay 对 hover 也生效', () => {
      const {app} = createApp();
      const plugin = selectionPlugin({
        enableHover: true,
        renderOverlay: (target, type) => {
          if (type === 'hover') {
            const overlay = Node.create('rect', {stroke: '#00ff00', strokeWidth: 3, fill: 'none'});
            overlay.shape.from(0, 0, 5, 5);
            return overlay;
          }
          return null;
        },
      });
      app.use(plugin);
      const rect = addRect(app, 100, 100, 50, 50);
      app.render();
      app.getLayer('default')!.update();

      app.scene.emit('pointermove', createSimEvent('pointermove', rect, {offsetX: 125, offsetY: 125}));
      const hoverGroup = app.getLayer('selection')!.find('__sel_hover__')!;
      expect(hoverGroup.children.length).toBe(1);
      const overlayNode = hoverGroup.children[0] as Node;
      expect(overlayNode.attrs.values.stroke).toBe('#00ff00');
    });
  });

  // ── Hover ────────────────────────────────────────────

  describe('hover', () => {
    it('enableHover=false 时 pointermove 不产生 hover overlay', () => {
      const {app} = createApp();
      const plugin = selectionPlugin({enableHover: false});
      app.use(plugin);
      const rect = addRect(app, 100, 100, 50, 50);
      app.render();

      app.scene.emit('pointermove', createSimEvent('pointermove', rect));
      expect(plugin.getHovering()).toBeNull();
    });

    it('enableHover=true 时 hover 创建 overlay', () => {
      const {app} = createApp();
      const plugin = selectionPlugin({enableHover: true});
      app.use(plugin);
      const rect = addRect(app, 100, 100, 50, 50);
      app.render();

      // 需要先 update 计算 worldMatrix
      app.getLayer('default')!.update();

      app.scene.emit('pointermove', createSimEvent('pointermove', rect, {offsetX: 125, offsetY: 125}));

      expect(plugin.getHovering()).toBe(rect);
      const hoverGroup = app.getLayer('selection')!.find('__sel_hover__')!;
      expect(hoverGroup.children.length).toBe(1);
    });

    it('hover 同一节点不重复触发', () => {
      const {app} = createApp();
      const plugin = selectionPlugin({enableHover: true});
      app.use(plugin);
      const rect = addRect(app, 100, 100, 50, 50);
      app.render();

      const hoverFn = vi.fn();
      app.bus.on('selection:hover-change', hoverFn);

      app.scene.emit('pointermove', createSimEvent('pointermove', rect, {offsetX: 110, offsetY: 110}));
      app.scene.emit('pointermove', createSimEvent('pointermove', rect, {offsetX: 120, offsetY: 120}));

      expect(hoverFn).toHaveBeenCalledTimes(1); // 只触发一次
    });

    it('已选中的节点不显示 hover overlay', () => {
      const {app} = createApp();
      const plugin = selectionPlugin({enableHover: true});
      app.use(plugin);
      const rect = addRect(app, 100, 100, 50, 50);
      app.render();

      // 先选中
      plugin.select([rect]);
      // 再 hover
      app.scene.emit('pointermove', createSimEvent('pointermove', rect, {offsetX: 125, offsetY: 125}));

      const hoverGroup = app.getLayer('selection')!.find('__sel_hover__')!;
      expect(hoverGroup.children.length).toBe(0); // 不显示 hover
    });

    it('hover 空白区域 → 清除 hover overlay', () => {
      const {app} = createApp();
      const plugin = selectionPlugin({enableHover: true});
      app.use(plugin);
      const rect = addRect(app, 100, 100, 50, 50);
      app.render();
      app.getLayer('default')!.update();

      // hover 节点
      app.scene.emit('pointermove', createSimEvent('pointermove', rect));
      expect(plugin.getHovering()).toBe(rect);

      // hover 空白
      app.scene.emit('pointermove', createSimEvent('pointermove', app.scene));
      expect(plugin.getHovering()).toBeNull();
      const hoverGroup = app.getLayer('selection')!.find('__sel_hover__')!;
      expect(hoverGroup.children.length).toBe(0);
    });
  });

  // ── 默认样式 ──────────────────────────────────────────

  describe('default styles', () => {
    it('选中框默认 2px 虚线', () => {
      const {app} = createApp();
      const plugin = selectionPlugin();
      app.use(plugin);
      const rect = addRect(app, 100, 100, 50, 50);
      app.render();

      plugin.select([rect]);
      const boxes = app.getLayer('selection')!.find('__sel_boxes__')!;
      const overlayNode = boxes.children[0] as Node;

      expect(overlayNode.attrs.values.strokeWidth).toBe(2);
      expect(overlayNode.attrs.values.strokeDasharray).toBe('6, 3');
    });

    it('hover 框默认 1px 虚线', () => {
      const {app} = createApp();
      const plugin = selectionPlugin({enableHover: true});
      app.use(plugin);
      const rect = addRect(app, 100, 100, 50, 50);
      app.render();
      app.getLayer('default')!.update();

      app.scene.emit('pointermove', createSimEvent('pointermove', rect));
      const hoverGroup = app.getLayer('selection')!.find('__sel_hover__')!;
      const overlayNode = hoverGroup.children[0] as Node;

      expect(overlayNode.attrs.values.strokeWidth).toBe(1);
      expect(overlayNode.attrs.values.strokeDasharray).toBe('4, 2');
    });
  });

  // ── State 同步 ──────────────────────────────────────────

  describe('state sync', () => {
    it('选中后 app.getState 包含选中列表', () => {
      const {app} = createApp();
      const plugin = selectionPlugin();
      app.use(plugin);
      const rect = addRect(app, 100, 100, 50, 50);
      app.render();

      plugin.select([rect]);
      const state = app.getState<Graphics[]>('selection:selected');
      expect(state).toBeDefined();
      expect(state).toHaveLength(1);
    });
  });

  // ── Dispose ──────────────────────────────────────────

  describe('dispose', () => {
    it('dispose 清理选中和 overlay', () => {
      const {app} = createApp();
      const plugin = selectionPlugin();
      app.use(plugin);
      const rect = addRect(app, 100, 100, 50, 50);
      app.render();

      plugin.select([rect]);
      plugin.dispose();

      expect(plugin.getSelected()).toHaveLength(0);
      expect(plugin.getHovering()).toBeNull();
    });

    it('dispose 不抛错', () => {
      const {app} = createApp();
      const plugin = selectionPlugin();
      app.use(plugin);

      expect(() => plugin.dispose()).not.toThrow();
    });
  });

  // ── getWorldBBox ────────────────────────────────────────

  describe('getWorldBBox', () => {
    it('Node 节点返回 worldBBox', () => {
      const {app} = createApp();
      const rect = addRect(app, 50, 50, 100, 80);
      app.render();
      app.getLayer('default')!.update();

      const bbox = getWorldBBox(rect);
      expect(bbox).not.toBeNull();
      expect(bbox!.x).toBeCloseTo(50, 0);
      expect(bbox!.y).toBeCloseTo(50, 0);
      expect(bbox!.width).toBeCloseTo(100, 0);
      expect(bbox!.height).toBeCloseTo(80, 0);
    });

    it('Group 节点返回所有子 Node 的并集 worldBBox', () => {
      const {app} = createApp();
      const group = new Group();
      const r1 = Node.create('rect', {fill: '#f00'});
      r1.shape.from(10, 10, 20, 20);
      const r2 = Node.create('rect', {fill: '#0f0'});
      r2.shape.from(50, 50, 30, 30);
      group.add(r1);
      group.add(r2);
      app.scene.add(group);
      app.render();
      app.getLayer('default')!.update();

      const bbox = getWorldBBox(group);
      expect(bbox).not.toBeNull();
      expect(bbox!.x).toBeCloseTo(10, 0);
      expect(bbox!.y).toBeCloseTo(10, 0);
      // Union: min(10,50)=10, min(10,50)=10, max(30,80)=80, max(30,80)=80 → w=70, h=70
      expect(bbox!.width).toBeCloseTo(70, 0);
      expect(bbox!.height).toBeCloseTo(70, 0);
    });

    it('空 Group 返回 null', () => {
      const group = new Group();
      const bbox = getWorldBBox(group);
      expect(bbox).toBeNull();
    });
  });

  // ── 光标样式 ──────────────────────────────────────────────

  describe('cursor styles', () => {
    it('悬停到可选节点时设置 pointer 光标', () => {
      const {app, container} = createApp();
      const plugin = selectionPlugin({enableHover: true});
      app.use(plugin);
      const rect = addRect(app, 50, 50, 100, 80);
      app.render();
      app.getLayer('default')!.update();

      // 移到节点上
      app.scene.emit('pointermove', createSimEvent('pointermove', rect, {offsetX: 80, offsetY: 80}));
      // 容器的 wrapper div
      const wrapperDiv = container.firstElementChild as HTMLDivElement;
      expect(wrapperDiv.style.cursor).toBe('pointer');
    });

    it('离开可选节点时重置光标', () => {
      const {app, container} = createApp();
      const plugin = selectionPlugin({enableHover: true});
      app.use(plugin);
      const rect = addRect(app, 50, 50, 100, 80);
      app.render();
      app.getLayer('default')!.update();

      // 先移到节点上
      app.scene.emit('pointermove', createSimEvent('pointermove', rect, {offsetX: 80, offsetY: 80}));
      const wrapperDiv = container.firstElementChild as HTMLDivElement;
      expect(wrapperDiv.style.cursor).toBe('pointer');

      // 移到空白区域（target = scene）
      app.scene.emit('pointermove', createSimEvent('pointermove', app.scene, {offsetX: 300, offsetY: 300}));
      expect(wrapperDiv.style.cursor).toBe('');
    });

    it('框选拖拽开始时设置 crosshair 光标', () => {
      const {app, container} = createApp();
      const plugin = selectionPlugin({enableMarquee: true});
      app.use(plugin);
      app.render();

      const wrapperDiv = container.firstElementChild as HTMLDivElement;

      // pointerdown 在空白区域
      app.scene.emit('pointerdown', createSimEvent('pointerdown', app.scene, {offsetX: 10, offsetY: 10}));
      // 拖拽超过阈值
      app.scene.emit('pointermove', createSimEvent('pointermove', app.scene, {offsetX: 100, offsetY: 100}));

      expect(wrapperDiv.style.cursor).toBe('crosshair');
    });

    it('框选结束时重置光标', () => {
      const {app, container} = createApp();
      const plugin = selectionPlugin({enableMarquee: true});
      app.use(plugin);
      app.render();

      const wrapperDiv = container.firstElementChild as HTMLDivElement;

      // 开始框选
      app.scene.emit('pointerdown', createSimEvent('pointerdown', app.scene, {offsetX: 10, offsetY: 10}));
      app.scene.emit('pointermove', createSimEvent('pointermove', app.scene, {offsetX: 100, offsetY: 100}));
      expect(wrapperDiv.style.cursor).toBe('crosshair');

      // pointerup 结束框选
      window.dispatchEvent(new PointerEvent('pointerup'));
      expect(wrapperDiv.style.cursor).toBe('');
    });

    it('dispose 时重置光标', () => {
      const {app, container} = createApp();
      const plugin = selectionPlugin({enableHover: true});
      app.use(plugin);
      const rect = addRect(app, 50, 50, 100, 80);
      app.render();
      app.getLayer('default')!.update();

      // 设置 pointer 光标
      app.scene.emit('pointermove', createSimEvent('pointermove', rect, {offsetX: 80, offsetY: 80}));
      const wrapperDiv = container.firstElementChild as HTMLDivElement;
      expect(wrapperDiv.style.cursor).toBe('pointer');

      // dispose
      plugin.dispose();
      expect(wrapperDiv.style.cursor).toBe('');
    });
  });
});
