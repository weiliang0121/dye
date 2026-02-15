# 插件指南

Rendx 的插件系统将**应用层逻辑**从渲染引擎中剥离出来。插件不创造新的概念层 — 内部直接使用 `Node.create`、`Group.add`、`app.toJSON` 等引擎原生 API — 只约束代码组织方式。

## 插件接口

```typescript
interface Plugin {
  name: string;
  install(app: App): void;
  resize?(width: number, height: number): void;
  dispose?(): void;
}
```

| 生命周期       | 触发时机          | 说明                       |
| -------------- | ----------------- | -------------------------- |
| `install(app)` | `app.use(plugin)` | 接收 App 引用，完成初始化  |
| `resize(w, h)` | 画布尺寸变化时    | 可选，插件自行处理尺寸变更 |
| `dispose()`    | 插件销毁时        | 可选，清理 DOM、事件、引用 |

::: warning 先 mount 再 use
大多数插件需要访问容器 DOM。确保 `app.mount(container)` 在 `app.use(plugin)` 之前调用。
:::

## 插件分类

Rendx 内置 5 个插件，按职责可分为三类：

| 类型         | 插件                                        | 定位                                            |
| ------------ | ------------------------------------------- | ----------------------------------------------- |
| **数据管理** | Graph Plugin                                | 管理 Node/Edge 元素的创建、更新、销毁和依赖追踪 |
| **交互增强** | Selection Plugin                            | 选中、悬停、框选、命中委托                      |
| **视觉辅助** | Grid Plugin、Minimap Plugin、History Plugin | 网格背景、缩略导航、撤销重做                    |

---

## Graph Plugin（图元素管理）

**包名**：`rendx-graph-plugin`

当你构建图编辑器、流程图、关系图时，需要统一管理节点和边的生命周期。Graph Plugin 提供了完整的 CRUD + 依赖追踪 + 序列化能力。

### 核心概念

#### Node vs Edge

- **Node** — 有位置 `(x, y)` 的实体。框架自动 `group.translate(x, y)`
- **Edge** — 连接两个 Node（`source → target`）。框架自动从 source/target 派生依赖

#### 自动分层

插件在场景中创建两个 Group：

```
Scene
├── __graph_edges__  (Group, 底层)
└── __graph_nodes__  (Group, 顶层)
```

边始终在节点下方渲染，保证节点覆盖边。

#### 依赖追踪

Edge 的 `deps` 从 `source`/`target` 自动派生。当被依赖的 Node 更新时，关联 Edge 的 render 函数会自动重新执行：

```
Node A 更新 → notifyUpdate('A') → Edge(source=A) 重绘
```

#### 位移优化

Node 仅 `x`/`y` 变化时只做 `group.translate()`，不重建子树（跳过 render 函数）。这让拖拽操作性能极好。

### 类型注册与渲染函数

Graph Plugin 采用 **类型注册 + 工厂创建** 模式，将渲染逻辑与数据分离：

```typescript
import {graphPlugin, createNode, createEdge} from 'rendx-graph-plugin';
import {Node} from 'rendx-engine';

// 1. 定义 Node 类型
const myNode = createNode<{id: string; x: number; y: number; label: string}>((ctx, data, graph) => {
  // 直接使用引擎原生 API
  const rect = Node.create('rect', {fill: '#4a90d9', cornerRadius: 4});
  rect.shape.from(0, 0, 120, 40);
  ctx.group.add(rect);

  const text = Node.create('text', {fill: '#fff', fontSize: 14});
  text.shape.from(60, 20, data.label, 'center', 'middle');
  ctx.group.add(text);

  // 注册清理回调（更新/销毁时自动调用）
  ctx.onCleanup(() => {
    ctx.group.removeAll();
  });
});

// 2. 定义 Edge 类型
const myEdge = createEdge<{id: string; source: string; target: string}>((ctx, data, graph) => {
  const src = ctx.source?.data;
  const tgt = ctx.target?.data;
  if (!src || !tgt) return;

  const line = Node.create('line', {stroke: '#999', strokeWidth: 1.5});
  line.shape.from(src.x + 60, src.y + 20, tgt.x + 60, tgt.y + 20);
  ctx.group.add(line);

  ctx.onCleanup(() => ctx.group.removeAll());
});
```

渲染函数的参数：

| 参数    | 类型                          | 说明                                              |
| ------- | ----------------------------- | ------------------------------------------------- |
| `ctx`   | `NodeContext` / `EdgeContext` | 包含 `group`（挂载点）、`onCleanup`（清理回调）等 |
| `data`  | `T`                           | 元素数据（含 `id`、`x`、`y`）                     |
| `graph` | `GraphQuery`                  | 图查询接口，可访问其他元素                        |

Edge 的 `ctx` 额外包含 `source` 和 `target`（Element 实例引用）。

### CRUD 操作

```typescript
const graph = graphPlugin();
app.use(graph);

// 注册类型
graph.register('myNode', myNode);
graph.register('myEdge', myEdge);

// 创建
const n1 = graph.add('myNode', {id: 'n1', x: 100, y: 100, label: 'A'});
const n2 = graph.add('myNode', {id: 'n2', x: 300, y: 200, label: 'B'});
graph.add('myEdge', {id: 'e1', source: 'n1', target: 'n2'});

// 更新（位移优化：仅 x/y 变化时不重建子树）
n1.update({x: 150});

// 查询
graph.get('n1'); // Element | undefined
graph.getEdgesOf('n1'); // 关联的 Edge 列表
graph.getNodes(); // 所有 Node
graph.count; // 元素总数

// 删除
graph.remove('e1');

// 批量操作（合并事件通知）
graph.batch(() => {
  graph.add('myNode', {id: 'n3', x: 500, y: 100, label: 'C'});
  graph.add('myEdge', {id: 'e2', source: 'n1', target: 'n3'});
});
```

### 序列化与恢复

```typescript
// 序列化
const data = graph.serialize();
// → { elements: [{ type: 'myNode', data: { id: 'n1', ... } }, ...] }

// 恢复（需先 register 类型）
graph.deserialize(data);
```

::: tip
类型定义（render 函数）无法序列化。恢复时必须确保 `register()` 先于 `deserialize()` 执行。
:::

### 事件与状态

| 事件名          | 触发时机   |
| --------------- | ---------- |
| `graph:added`   | 元素添加后 |
| `graph:removed` | 元素移除后 |

| State Key        | 类型       | 说明            |
| ---------------- | ---------- | --------------- |
| `graph:elements` | `string[]` | 当前所有元素 ID |

---

## Selection Plugin（选框交互）

**包名**：`rendx-selection-plugin`

为图编辑器提供完整的选择交互 — 点击选中、Shift 多选、框选（marquee）、悬停高亮，以及针对复合节点的命中委托。

### 核心概念

#### 渲染层集成

插件通过引擎的 Layer 机制创建名为 `selection` 的渲染层，overlay 节点（选中框、悬停框、框选矩形）都挂在这一层上：

```
selection Layer (zIndex=10, pointerEvents=false)
├── __sel_boxes__   选中框容器
├── __sel_hover__   悬停框容器
└── marquee         框选矩形
```

`pointerEvents=false` 确保 overlay 不拦截命中检测。

#### 命中委托（hitDelegate）

在 graph-plugin 场景中，用户点击的目标往往是叶子节点（rect、text），但选中逻辑需要作用于整个 Group。`hitDelegate` 将叶子命中映射为逻辑节点：

```typescript
selectionPlugin({
  hitDelegate: target => {
    let node = target;
    while (node && node.type !== 4) {
      if (node.hasClassName('selectable')) return node;
      node = node.parent;
    }
    return null; // 返回 null → 不可选
  },
});
```

#### 自定义 overlay（renderOverlay）

默认使用虚线矩形（基于 worldBBox）作为选中/悬停覆盖层。对于曲线边等非矩形目标，可通过 `renderOverlay` 返回自定义 Node：

```typescript
selectionPlugin({
  renderOverlay: (target, type) => {
    if (target.hasClassName('graph-edge')) {
      const pathNode = target.children.find(c => c.type === 3);
      const overlay = Node.create('path', {
        stroke: type === 'selection' ? '#1890ff' : '#91d5ff',
        strokeWidth: type === 'selection' ? 6 : 4,
        fill: 'none',
        opacity: 0.4,
      });
      overlay.shape.from(pathNode.shape.d);
      return overlay;
    }
    return null; // 其他节点使用默认矩形
  },
});
```

### 光标管理

插件自动管理鼠标光标样式：

| 交互状态     | 光标样式    |
| ------------ | ----------- |
| 悬停可选节点 | `pointer`   |
| 离开可选节点 | 重置为默认  |
| 框选拖拽中   | `crosshair` |
| 框选结束     | 重置为默认  |

### 基本使用

```typescript
import {selectionPlugin} from 'rendx-selection-plugin';

const sel = selectionPlugin({
  enableHover: true,
  enableMarquee: true,
  enableMultiSelect: true,
  selectionStyle: {stroke: '#1890ff', padding: 2},
  hoverStyle: {stroke: '#91d5ff'},
  marqueeStyle: {fill: 'rgba(24,144,255,0.08)'},
});
app.use(sel);
```

### 编程式 API

```typescript
sel.select([node1, node2]); // 设置选中列表
sel.getSelected(); // 获取选中（只读副本）
sel.clearSelection(); // 清空选中
sel.getHovering(); // 获取悬停节点
```

### 事件与状态

| 事件名                   | 负载                     | 触发时机     |
| ------------------------ | ------------------------ | ------------ |
| `selection:change`       | `{ selected, previous }` | 选中集合变更 |
| `selection:hover-change` | `{ current, previous }`  | 悬停目标变更 |

| State Key            | 类型               | 说明     |
| -------------------- | ------------------ | -------- |
| `selection:selected` | `Graphics[]`       | 选中列表 |
| `selection:hovering` | `Graphics \| null` | 悬停节点 |

---

## Grid Plugin（网格背景）

**包名**：`rendx-grid-plugin`

在画布下方叠加一层独立 Canvas 绘制等间距的圆点网格，常用于编辑器对齐参考。

### 实现方式

Grid Plugin **不使用引擎渲染管线**，而是创建独立的 `<canvas>` 元素插入容器最底层：

- `pointerEvents: 'none'` — 不拦截用户交互
- 支持 `devicePixelRatio`（HiDPI 适配）
- 通过 `zIndex: -1` 确保在所有渲染层下方

### 使用

```typescript
import {gridPlugin} from 'rendx-grid-plugin';

app.use(
  gridPlugin({
    spacing: 20, // 点阵间距（px）
    dotRadius: 1, // 点半径
    color: '#d0d0d0', // 点颜色
  }),
);

// 运行时更新
const grid = app.getPlugin('grid');
grid.update({spacing: 40, color: '#ddd'});

// 窗口resize
grid.resize(newWidth, newHeight);
```

---

## History Plugin（撤销重做）

**包名**：`rendx-history-plugin`

基于场景快照的撤销/重做能力。每次调用 `push()` 保存整个场景状态，`undo()`/`redo()` 在快照间切换。

### 快照机制

```
push()  →  app.toJSON() → 压入 undoStack → 清空 redoStack
undo()  →  undoStack 弹出 → 当前状态压入 redoStack → restoreFromJSON() → render()
redo()  →  redoStack 弹出 → 当前状态压入 undoStack → restoreFromJSON() → render()
```

### 调用时机

::: warning push() 要在操作之前调用
`push()` 保存的是调用时刻的场景状态。应在用户操作**之前**调用，这样 `undo()` 才能恢复到操作前的状态。
:::

```typescript
import {historyPlugin} from 'rendx-history-plugin';

const history = historyPlugin({maxSteps: 100});
app.use(history);

// 用户操作前保存
history.push();
// ... 执行操作（添加节点、修改属性等）

// 撤销 / 重做
if (history.canUndo) history.undo();
if (history.canRedo) history.redo();

// 快捷键
document.addEventListener('keydown', e => {
  if (e.metaKey && e.key === 'z') {
    e.shiftKey ? history.redo() : history.undo();
  }
});
```

### 限制

- 基于整体场景 JSON 快照，不支持增量记录。大场景时内存占用较高
- `maxSteps` 超出后 FIFO 淘汰最早记录

---

## Minimap Plugin（小地图）

**包名**：`rendx-minimap-plugin`

在画布角落叠加缩略视图，显示所有节点的简化矩形以及当前视口指示器，帮助用户定位场景全貌。

### 绘制原理

1. 遍历所有 Layer，收集每个 Node 的 `getWorldBBox()`
2. 计算全部节点的包围盒并集（场景总范围）
3. 等比缩放映射到小地图画布
4. 每个节点绘制为半透明填充矩形（颜色取节点 `fill` 属性）
5. 绘制蓝色边框矩形标识当前视口

### 使用

```typescript
import {minimapPlugin} from 'rendx-minimap-plugin';

app.use(
  minimapPlugin({
    width: 200,
    height: 150,
    position: 'bottom-right', // 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right'
    margin: 10,
    viewportColor: 'rgba(24,144,255,0.8)',
    nodeFill: '#999',
  }),
);

// 场景变化后手动刷新
const minimap = app.getPlugin('minimap');
minimap.draw();

// 运行时配置更新
minimap.update({position: 'top-left', margin: 20});
```

---

## 插件组合

在图编辑器场景中，多个插件通常一起使用：

```typescript
import {App, Node} from 'rendx-engine';
import {graphPlugin, createNode, createEdge} from 'rendx-graph-plugin';
import {selectionPlugin} from 'rendx-selection-plugin';
import {gridPlugin} from 'rendx-grid-plugin';
import {historyPlugin} from 'rendx-history-plugin';
import {minimapPlugin} from 'rendx-minimap-plugin';

const app = new App({width: 1200, height: 800});
app.mount(container);

// 基础设施
app.use(gridPlugin({spacing: 20}));

// 图数据管理
const graph = graphPlugin();
app.use(graph);

// 交互
const sel = selectionPlugin({
  enableHover: true,
  enableMarquee: true,
  hitDelegate: target => {
    // 命中委托：从叶子节点向上找 selectable Group
    let node = target;
    while (node && node.type !== 4) {
      if (node.hasClassName('selectable')) return node;
      node = node.parent;
    }
    return null;
  },
});
app.use(sel);

// 撤销重做
const history = historyPlugin({maxSteps: 50});
app.use(history);

// 小地图
app.use(minimapPlugin({position: 'bottom-right'}));

// 注册类型 + 添加元素
graph.register('rect-node', myNode);
graph.register('line-edge', myEdge);

graph.batch(() => {
  graph.add('rect-node', {id: 'n1', x: 100, y: 100, label: 'Start'});
  graph.add('rect-node', {id: 'n2', x: 400, y: 250, label: 'End'});
  graph.add('line-edge', {id: 'e1', source: 'n1', target: 'n2'});
});

app.render();
```

### 插件安装顺序

插件之间没有硬依赖，但建议按以下顺序安装：

1. **Grid Plugin** — 视觉底层，最先安装
2. **Graph Plugin** — 数据管理，早于交互插件
3. **Selection Plugin** — 依赖场景中已有节点进行交互
4. **History Plugin** — 记录操作后的场景状态
5. **Minimap Plugin** — 依赖场景中的节点进行缩略渲染

---

## 自定义插件

实现 `Plugin` 接口即可创建自定义插件：

```typescript
import type {Plugin} from 'rendx-engine';

function myPlugin(): Plugin {
  let app;
  return {
    name: 'my-plugin',
    install(appRef) {
      app = appRef;
      // 初始化逻辑：创建 Layer、添加事件监听等
    },
    resize(width, height) {
      // 处理画布尺寸变化
    },
    dispose() {
      // 清理资源
      app = null;
    },
  };
}
```

插件可以通过 `app` 引用访问引擎的所有能力：

- **场景图** — `app.scene`、`app.getLayer()`
- **渲染** — `app.render()`、`app.requestRender()`
- **事件** — `app.on()`、`app.off()` 监听引擎事件
- **状态** — `app.setState()`、`app.getState()` 存取插件状态
- **DOM** — `app.container` 访问容器
- **光标** — `app.setCursor()`、`app.resetCursor()` 管理光标样式
