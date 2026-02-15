import {describe, it, expect, vi, beforeEach} from 'vitest';

// Mock rendx-canvas 和 rendx-svg 避免 OffscreenCanvas 依赖
vi.mock('rendx-canvas', () => ({
  CanvasRenderer: class {
    el = document.createElement('canvas');
    resize() {}
    dispose() {}
    clear() {}
    save() {}
    restore() {}
    setTransform() {}
    setAttributes() {}
    gradient() {}
    clipPath() {}
    rect() {}
    circle() {}
    line() {}
    text() {}
    path() {}
    image() {}
  },
}));
vi.mock('rendx-svg', () => ({
  SvgRenderer: class {
    el = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    resize() {}
    dispose() {}
    clear() {}
    save() {}
    restore() {}
    setTransform() {}
    setAttributes() {}
  },
}));

import {App} from '../src/app';
import {Node} from '../src/scene';

import type {Plugin} from '../src/plugin';
import type {RendxJSON} from '../src/serialization';

/**
 * History 插件性能基准测试
 * 覆盖 push/undo/redo 在不同场景规模和栈深度下的性能。
 */

function measure(name: string, fn: () => void, iterations = 1): number {
  const start = performance.now();
  for (let i = 0; i < iterations; i++) fn();
  const elapsed = performance.now() - start;
  console.log(`  [perf] ${name}: ${elapsed.toFixed(2)}ms (${iterations} iters, ${(elapsed / iterations).toFixed(4)}ms/op)`);
  return elapsed;
}

// ── Inline History Plugin ──

interface HistoryPluginOptions {
  maxSteps?: number;
}

class HistoryPlugin implements Plugin {
  name = 'history';
  #app: App | null = null;
  #undoStack: RendxJSON[] = [];
  #redoStack: RendxJSON[] = [];
  #options: Required<HistoryPluginOptions>;

  constructor(options: HistoryPluginOptions = {}) {
    this.#options = {maxSteps: 200, ...options};
  }

  install(app: App) {
    this.#app = app;
  }

  push() {
    const app = this.#app;
    if (!app) return;
    this.#undoStack.push(app.toJSON());
    this.#redoStack = [];
    if (this.#undoStack.length > this.#options.maxSteps) {
      this.#undoStack.shift();
    }
  }

  undo(): boolean {
    const app = this.#app;
    if (!app || this.#undoStack.length === 0) return false;
    this.#redoStack.push(app.toJSON());
    const snapshot = this.#undoStack.pop()!;
    app.restoreFromJSON(snapshot);
    return true;
  }

  redo(): boolean {
    const app = this.#app;
    if (!app || this.#redoStack.length === 0) return false;
    this.#undoStack.push(app.toJSON());
    const snapshot = this.#redoStack.pop()!;
    app.restoreFromJSON(snapshot);
    return true;
  }

  get undoCount() {
    return this.#undoStack.length;
  }
  get redoCount() {
    return this.#redoStack.length;
  }

  reset() {
    this.#undoStack = [];
    this.#redoStack = [];
  }

  dispose() {
    this.reset();
    this.#app = null;
  }
}

// ═══════════════════════════════════════════════
// Tests
// ═══════════════════════════════════════════════

describe('History 插件性能基准', () => {
  let container: HTMLDivElement;

  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
    return () => container.remove();
  });

  function createApp(nodeCount: number, maxSteps = 200) {
    const app = new App({width: 800, height: 600});
    app.mount(container);
    const history = new HistoryPlugin({maxSteps});
    app.use(history);
    const layer = app.getLayer('default')!;
    for (let i = 0; i < nodeCount; i++) {
      const node = Node.create('rect', {fill: '#ff6600', opacity: 0.9});
      node.shape.from(i * 12, Math.floor(i / 50) * 12, 10, 10);
      node.translate(i * 12, Math.floor(i / 50) * 12);
      node.name = `n-${i}`;
      layer.add(node);
    }
    return {app, history, layer};
  }

  // ═══════════════════════════════════════════════
  // push 性能
  // ═══════════════════════════════════════════════

  describe('push（快照采集）', () => {
    it('100 节点场景 push', () => {
      const {app, history} = createApp(100);
      const elapsed = measure(
        'push (100 nodes)',
        () => {
          history.push();
        },
        50,
      );
      expect(elapsed / 50).toBeLessThan(20);
      app.dispose();
    });

    it('500 节点场景 push', () => {
      const {app, history} = createApp(500);
      const elapsed = measure(
        'push (500 nodes)',
        () => {
          history.push();
        },
        20,
      );
      expect(elapsed / 20).toBeLessThan(50);
      app.dispose();
    });

    it('1000 节点场景 push', () => {
      const {app, history} = createApp(1000);
      const elapsed = measure(
        'push (1000 nodes)',
        () => {
          history.push();
        },
        10,
      );
      expect(elapsed / 10).toBeLessThan(100);
      app.dispose();
    });

    it('连续 100 次 push（含 maxSteps 淘汰）', () => {
      const {app, history} = createApp(200, 50);
      const elapsed = measure('100 × push (200 nodes, maxSteps=50)', () => {
        for (let i = 0; i < 100; i++) {
          history.push();
        }
      });
      expect(elapsed).toBeLessThan(5000);
      expect(history.undoCount).toBe(50);
      app.dispose();
    });
  });

  // ═══════════════════════════════════════════════
  // undo 性能
  // ═══════════════════════════════════════════════

  describe('undo（恢复）', () => {
    it('100 节点 undo', () => {
      const {app, history, layer} = createApp(100);
      history.push(); // 保存基线
      layer.add(Node.create('circle', {fill: '#blue'}));
      history.push();

      const elapsed = measure(
        'undo (100 nodes)',
        () => {
          history.undo();
          // 重新 push 以便下次迭代
          history.push();
        },
        20,
      );
      expect(elapsed / 20).toBeLessThan(30);
      app.dispose();
    });

    it('500 节点 undo', () => {
      const {app, history, layer} = createApp(500);
      history.push();
      layer.add(Node.create('circle', {fill: '#blue'}));
      history.push();

      const elapsed = measure(
        'undo (500 nodes)',
        () => {
          history.undo();
          history.push();
        },
        10,
      );
      expect(elapsed / 10).toBeLessThan(100);
      app.dispose();
    });

    it('1000 节点 undo', () => {
      const {app, history, layer} = createApp(1000);
      history.push();
      layer.add(Node.create('circle', {fill: '#blue'}));
      history.push();

      const elapsed = measure(
        'undo (1000 nodes)',
        () => {
          history.undo();
          history.push();
        },
        5,
      );
      expect(elapsed / 5).toBeLessThan(300);
      app.dispose();
    });

    it('连续 20 步 undo', () => {
      const {app, history, layer} = createApp(200);
      // 积累 20 步历史
      for (let i = 0; i < 20; i++) {
        history.push();
        const n = Node.create('rect', {fill: `#${i.toString(16).padStart(2, '0')}aa00`});
        n.shape.from(i * 15, 0, 10, 10);
        layer.add(n);
      }

      const elapsed = measure('20 × undo (200+ nodes)', () => {
        for (let i = 0; i < 20; i++) {
          history.undo();
        }
      });
      expect(elapsed).toBeLessThan(5000);
      app.dispose();
    });
  });

  // ═══════════════════════════════════════════════
  // redo 性能
  // ═══════════════════════════════════════════════

  describe('redo（重做）', () => {
    it('500 节点 redo', () => {
      const {app, history, layer} = createApp(500);
      history.push();
      layer.add(Node.create('circle', {fill: '#00ff00'}));
      history.undo();

      const elapsed = measure(
        'redo (500 nodes)',
        () => {
          history.redo();
          history.undo(); // 重置回去以便下次迭代
        },
        10,
      );
      expect(elapsed / 10).toBeLessThan(200);
      app.dispose();
    });

    it('连续 20 步 undo 后 20 步 redo', () => {
      const {app, history, layer} = createApp(200);
      for (let i = 0; i < 20; i++) {
        history.push();
        const n = Node.create('rect', {fill: '#aabb00'});
        n.shape.from(i * 15, 0, 10, 10);
        layer.add(n);
      }

      // undo 20 步
      for (let i = 0; i < 20; i++) {
        history.undo();
      }

      // redo 20 步
      const elapsed = measure('20 × redo (200+ nodes)', () => {
        for (let i = 0; i < 20; i++) {
          history.redo();
        }
      });
      expect(elapsed).toBeLessThan(5000);
      app.dispose();
    });
  });

  // ═══════════════════════════════════════════════
  // 内存 / 栈深度
  // ═══════════════════════════════════════════════

  describe('栈深度影响', () => {
    it('深栈（100 步）对 push 速度无显著退化', () => {
      const {app, history} = createApp(200, 200);

      // 先积累 100 步
      for (let i = 0; i < 100; i++) {
        history.push();
      }

      // 在深栈上继续 push
      const elapsed = measure(
        'push at depth=100 (200 nodes)',
        () => {
          history.push();
        },
        20,
      );
      expect(elapsed / 20).toBeLessThan(20);
      app.dispose();
    });

    it('maxSteps 限制有效控制栈大小', () => {
      const {app, history} = createApp(100, 30);
      for (let i = 0; i < 100; i++) {
        history.push();
      }
      expect(history.undoCount).toBe(30);
      app.dispose();
    });
  });
});
