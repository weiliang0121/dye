# rendx-graph-plugin

图元素生命周期管理插件，提供 Node/Edge 两类元素的类型注册、CRUD 操作、自动分层、依赖追踪和图查询能力。

## 安装

```typescript
import {graphPlugin, createNode, createEdge} from 'rendx-graph-plugin';

const app = new App({width: 800, height: 600});
app.mount(container);
app.use(graphPlugin());
```

## 定义元素类型

### createNode

```typescript
const MyNode = createNode<{label: string}>((ctx, data, graph) => {
  const rect = Node.create('rect', {fill: '#4dabf7', stroke: '#1c7ed6'});
  rect.shape.from(0, 0, data.width ?? 100, data.height ?? 40);
  ctx.group.add(rect);

  const text = Node.create('text', {fill: '#333', fontSize: 14});
  text.shape.from(10, 25, data.label);
  ctx.group.add(text);
});
```

### createEdge

```typescript
const MyEdge = createEdge<{}>((ctx, data, graph) => {
  const line = Node.create('line', {stroke: '#aaa', strokeWidth: 2});
  line.shape.from(ctx.source.x, ctx.source.y, ctx.target.x, ctx.target.y);
  ctx.group.add(line);
});
```

## 使用

```typescript
const graph = graphPlugin();
app.use(graph);

// 注册类型
graph.register('myNode', MyNode);
graph.register('myEdge', MyEdge);

// 添加元素
const n1 = graph.add('myNode', {id: 'n1', x: 100, y: 100, label: 'Node 1'});
const n2 = graph.add('myNode', {id: 'n2', x: 300, y: 200, label: 'Node 2'});
const e1 = graph.add('myEdge', {id: 'e1', source: 'n1', target: 'n2'});

// 更新
n1.update({x: 150, label: 'Updated'});

// 删除
graph.remove('n1');
```

## GraphPlugin API

| 方法                        | 说明                         |
| --------------------------- | ---------------------------- |
| `register(name, def)`       | 注册元素类型定义             |
| `add(type, data, options?)` | 创建元素并挂载到场景         |
| `remove(id)`                | 移除元素                     |
| `batch(fn)`                 | 批量操作，合并事件通知       |
| `notifyUpdate(id)`          | 通知元素更新，触发依赖链重绘 |
| `serialize()`               | 序列化所有元素数据           |
| `deserialize(data)`         | 从序列化数据恢复元素         |

## 图查询（GraphQuery）

| 方法                 | 返回值                 | 说明                  |
| -------------------- | ---------------------- | --------------------- |
| `get(id)`            | `Element \| undefined` | 按 ID 获取元素        |
| `has(id)`            | `boolean`              | 检查元素是否存在      |
| `count`              | `number`               | 元素总数              |
| `getIds()`           | `string[]`             | 所有元素 ID           |
| `getAll()`           | `Element[]`            | 所有元素实例          |
| `getNodes()`         | `Element[]`            | 所有 Node             |
| `getEdges()`         | `Element[]`            | 所有 Edge             |
| `getEdgesOf(nodeId)` | `Element[]`            | 指定 Node 的关联 Edge |

## Element 实例

| 属性/方法       | 说明                       |
| --------------- | -------------------------- |
| `id`            | 唯一标识（只读）           |
| `role`          | `'node' \| 'edge'`（只读） |
| `group`         | 场景节点（只读）           |
| `data`          | 当前数据（只读）           |
| `mounted`       | 是否已挂载（只读）         |
| `update(patch)` | 部分更新数据               |
| `dispose()`     | 销毁元素                   |

## 自动分层

- Node → `__graph_nodes__` Group（上层）
- Edge → `__graph_edges__` Group（下层）
- 保证节点始终覆盖在边上方

## 依赖追踪

Edge 的依赖从 `source`/`target` 自动派生，被依赖 Node 更新时自动触发关联 Edge 重绘。

## 事件

| 事件名          | 触发时机   |
| --------------- | ---------- |
| `graph:added`   | 元素添加后 |
| `graph:removed` | 元素移除后 |

## State

| Key              | 类型       | 说明                 |
| ---------------- | ---------- | -------------------- |
| `graph:elements` | `string[]` | 当前所有元素 ID 列表 |
