# rendx-history-plugin

## 概述

基于场景快照的撤销/重做（Undo/Redo）插件。每次调用 `push()` 保存当前场景状态，`undo()` / `redo()` 在快照间切换。

## 依赖层级

插件层（依赖 `rendx-engine`）

## 文件结构

```
src/
├── main.ts       入口，导出 historyPlugin 工厂 + HistoryPluginOptions 类型
└── history.ts    HistoryPlugin 实现 + historyPlugin 工厂函数
```

## 公开 API

### `historyPlugin(options?): HistoryPlugin`

工厂函数，创建并返回 `HistoryPlugin` 实例。

### `HistoryPluginOptions`

| 选项       | 类型     | 默认值 | 说明                         |
| ---------- | -------- | ------ | ---------------------------- |
| `maxSteps` | `number` | `50`   | 最大历史步数，超出 FIFO 淘汰 |

### HistoryPlugin（实现 `Plugin`）

| 方法/属性      | 类型               | 说明                                               |
| -------------- | ------------------ | -------------------------------------------------- |
| `install(app)` | method             | 插件安装，保存 App 引用                            |
| `push()`       | method             | 保存当前场景快照到撤销栈，清空重做栈               |
| `undo()`       | method → `boolean` | 撤销：弹出撤销栈顶，当前状态压入重做栈，恢复并渲染 |
| `redo()`       | method → `boolean` | 重做：弹出重做栈顶，当前状态压入撤销栈，恢复并渲染 |
| `canUndo`      | getter → `boolean` | 是否可撤销                                         |
| `canRedo`      | getter → `boolean` | 是否可重做                                         |
| `undoCount`    | getter → `number`  | 撤销栈长度                                         |
| `redoCount`    | getter → `number`  | 重做栈长度                                         |
| `reset()`      | method             | 清空所有历史记录（撤销栈 + 重做栈）                |
| `dispose()`    | method             | 重置并清除 App 引用                                |

## 实现细节

### 快照机制

- 使用 `app.toJSON()` 获取 `RendxJSON` 格式的场景序列化数据
- 使用 `app.restoreFromJSON(snapshot)` 恢复场景状态
- 恢复后自动调用 `app.render()` 重新渲染

### 栈管理

- `#undoStack: RendxJSON[]` — 撤销栈
- `#redoStack: RendxJSON[]` — 重做栈
- `push()` 时清空重做栈（新操作分支覆盖旧的重做历史）
- 超出 `maxSteps` 时 `shift()` 丢弃最早的记录（FIFO）

### 调用时机

- `push()` 应在用户操作**完成后**调用（如拖拽结束、属性修改完毕）
- 不自动监听场景变化，由应用层主动触发

## 已知限制

- 基于整体场景快照，不支持增量记录，大场景时内存占用较高

## 调用时机

- `push()` 应在用户操作**之前**调用，保存操作前的状态作为撤销点
- 不要在操作之后调用 `push()`，否则 undo 会恢复到操作后的状态（即无变化）
- 不需要在初始化时调用 `push()`，第一次操作前的 `push()` 自然保存初始状态

## 典型用法

```typescript
import {historyPlugin} from 'rendx-history-plugin';

const app = new App({width: 800, height: 600});
app.mount(container);

const history = historyPlugin({maxSteps: 100});
app.use(history);

// 用户操作前保存快照
history.push();
// ... 用户执行操作（添加节点、修改属性等）

// 撤销 / 重做
history.undo();
history.redo();

// 快捷键绑定
document.addEventListener('keydown', e => {
  if (e.metaKey && e.key === 'z') {
    e.shiftKey ? history.redo() : history.undo();
  }
});

// 查询状态
console.log(history.canUndo, history.undoCount);
console.log(history.canRedo, history.redoCount);
```
