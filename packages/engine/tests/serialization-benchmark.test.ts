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
import {Node, Group} from '../src/scene';

import type {RendxJSON} from '../src/serialization';

/**
 * 序列化 / 反序列化 性能基准测试
 * 覆盖 App.toJSON() 和 App.restoreFromJSON() 在不同规模下的耗时。
 */

function measure(name: string, fn: () => void, iterations = 1): number {
  const start = performance.now();
  for (let i = 0; i < iterations; i++) fn();
  const elapsed = performance.now() - start;
  console.log(`  [perf] ${name}: ${elapsed.toFixed(2)}ms (${iterations} iters, ${(elapsed / iterations).toFixed(4)}ms/op)`);
  return elapsed;
}

describe('序列化性能基准', () => {
  let container: HTMLDivElement;

  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
    return () => container.remove();
  });

  function createAppWithNodes(count: number): App {
    const app = new App({width: 800, height: 600});
    app.mount(container);
    const layer = app.getLayer('default')!;
    for (let i = 0; i < count; i++) {
      const node = Node.create('rect', {fill: `#${(i % 256).toString(16).padStart(2, '0')}6688`, opacity: 0.9, stroke: '#333'});
      node.shape.from(i * 12, Math.floor(i / 50) * 12, 10, 10);
      node.translate(i * 12, Math.floor(i / 50) * 12);
      node.name = `node-${i}`;
      layer.add(node);
    }
    return app;
  }

  function createAppWithGroups(groupCount: number, nodesPerGroup: number): App {
    const app = new App({width: 800, height: 600});
    app.mount(container);
    const layer = app.getLayer('default')!;
    for (let g = 0; g < groupCount; g++) {
      const group = new Group();
      group.setName(`group-${g}`);
      group.translate(g * 100, 0);
      for (let n = 0; n < nodesPerGroup; n++) {
        const node = Node.create('circle', {fill: '#ff0000', stroke: '#333'});
        node.shape.from(n * 20, n * 20, 5);
        group.add(node);
      }
      layer.add(group);
    }
    return app;
  }

  // ═══════════════════════════════════════════════
  // toJSON 性能
  // ═══════════════════════════════════════════════

  describe('toJSON', () => {
    it('100 节点 toJSON', () => {
      const app = createAppWithNodes(100);
      const elapsed = measure(
        'toJSON (100 nodes)',
        () => {
          app.toJSON();
        },
        100,
      );
      expect(elapsed / 100).toBeLessThan(10);
      app.dispose();
    });

    it('1000 节点 toJSON', () => {
      const app = createAppWithNodes(1000);
      const elapsed = measure(
        'toJSON (1000 nodes)',
        () => {
          app.toJSON();
        },
        10,
      );
      expect(elapsed / 10).toBeLessThan(100);
      app.dispose();
    });

    it('5000 节点 toJSON', () => {
      const app = createAppWithNodes(5000);
      const elapsed = measure(
        'toJSON (5000 nodes)',
        () => {
          app.toJSON();
        },
        3,
      );
      expect(elapsed / 3).toBeLessThan(500);
      app.dispose();
    });

    it('50 组 × 20 节点 toJSON（嵌套结构）', () => {
      const app = createAppWithGroups(50, 20);
      const elapsed = measure(
        'toJSON (50 groups × 20 nodes)',
        () => {
          app.toJSON();
        },
        10,
      );
      expect(elapsed / 10).toBeLessThan(100);
      app.dispose();
    });
  });

  // ═══════════════════════════════════════════════
  // restoreFromJSON 性能
  // ═══════════════════════════════════════════════

  describe('restoreFromJSON', () => {
    it('100 节点 restoreFromJSON', () => {
      const app = createAppWithNodes(100);
      const snapshot = app.toJSON();
      const elapsed = measure(
        'restoreFromJSON (100 nodes)',
        () => {
          app.restoreFromJSON(snapshot);
        },
        50,
      );
      expect(elapsed / 50).toBeLessThan(20);
      app.dispose();
    });

    it('1000 节点 restoreFromJSON', () => {
      const app = createAppWithNodes(1000);
      const snapshot = app.toJSON();
      const elapsed = measure(
        'restoreFromJSON (1000 nodes)',
        () => {
          app.restoreFromJSON(snapshot);
        },
        10,
      );
      expect(elapsed / 10).toBeLessThan(200);
      app.dispose();
    });

    it('5000 节点 restoreFromJSON', () => {
      const app = createAppWithNodes(5000);
      const snapshot = app.toJSON();
      const elapsed = measure(
        'restoreFromJSON (5000 nodes)',
        () => {
          app.restoreFromJSON(snapshot);
        },
        3,
      );
      expect(elapsed / 3).toBeLessThan(1000);
      app.dispose();
    });

    it('50 组 × 20 节点 restoreFromJSON（嵌套结构）', () => {
      const app = createAppWithGroups(50, 20);
      const snapshot = app.toJSON();
      const elapsed = measure(
        'restoreFromJSON (50 groups × 20 nodes)',
        () => {
          app.restoreFromJSON(snapshot);
        },
        10,
      );
      expect(elapsed / 10).toBeLessThan(200);
      app.dispose();
    });
  });

  // ═══════════════════════════════════════════════
  // toJSON → restoreFromJSON 往返
  // ═══════════════════════════════════════════════

  describe('序列化往返（roundtrip）', () => {
    it('1000 节点往返', () => {
      const app = createAppWithNodes(1000);
      const elapsed = measure(
        'roundtrip (1000 nodes)',
        () => {
          const json = app.toJSON();
          app.restoreFromJSON(json);
        },
        10,
      );
      expect(elapsed / 10).toBeLessThan(300);
      app.dispose();
    });

    it('往返后节点数量一致', () => {
      const app = createAppWithNodes(500);
      const snapshot = app.toJSON();
      app.restoreFromJSON(snapshot);
      const restored = app.getLayer('default')!;
      expect(restored.getQueue().length).toBe(500);
      app.dispose();
    });
  });

  // ═══════════════════════════════════════════════
  // JSON 负载大小
  // ═══════════════════════════════════════════════

  describe('JSON 负载大小', () => {
    it('1000 节点 JSON 字符串大小', () => {
      const app = createAppWithNodes(1000);
      const json = app.toJSON();
      const str = JSON.stringify(json);
      const sizeKB = str.length / 1024;
      console.log(`  [size] 1000 nodes JSON: ${sizeKB.toFixed(1)} KB`);
      // 合理范围检查：每个节点不应超过 0.5KB
      expect(sizeKB).toBeLessThan(500);
      app.dispose();
    });

    it('JSON.parse 性能（1000 节点）', () => {
      const app = createAppWithNodes(1000);
      const str = JSON.stringify(app.toJSON());
      const elapsed = measure(
        'JSON.parse (1000 nodes)',
        () => {
          JSON.parse(str) as RendxJSON;
        },
        100,
      );
      expect(elapsed / 100).toBeLessThan(10);
      app.dispose();
    });
  });

  // ═══════════════════════════════════════════════
  // 多层场景序列化
  // ═══════════════════════════════════════════════

  describe('多层场景', () => {
    it('5 层 × 200 节点 toJSON + restoreFromJSON', () => {
      const app = new App({width: 800, height: 600});
      app.mount(container);
      for (let l = 0; l < 5; l++) {
        const layerName = l === 0 ? 'default' : `layer-${l}`;
        const layer = l === 0 ? app.getLayer('default')! : app.addLayer(layerName, l);
        for (let n = 0; n < 200; n++) {
          const node = Node.create('rect', {fill: '#aabb00', opacity: 0.8});
          node.shape.from(n * 10, l * 100, 8, 8);
          layer.add(node);
        }
      }

      const elapsedSerialize = measure(
        'toJSON (5 layers × 200 nodes)',
        () => {
          app.toJSON();
        },
        10,
      );

      const snapshot = app.toJSON();
      const elapsedRestore = measure(
        'restoreFromJSON (5 layers × 200 nodes)',
        () => {
          app.restoreFromJSON(snapshot);
        },
        10,
      );

      expect(elapsedSerialize / 10).toBeLessThan(100);
      expect(elapsedRestore / 10).toBeLessThan(200);
      app.dispose();
    });
  });
});
