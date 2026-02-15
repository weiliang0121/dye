# rendx-history-plugin

基于场景快照的撤销/重做（Undo/Redo）插件。通过 `push()` 保存当前场景状态，`undo()` / `redo()` 在快照间切换。

## 安装

```typescript
import {historyPlugin} from 'rendx-history-plugin';

const app = new App({width: 800, height: 600});
app.mount(container);

const history = historyPlugin({maxSteps: 100});
app.use(history);
```

## 配置

```typescript
interface HistoryPluginOptions {
  /** 最大历史步数（默认 50），超出 FIFO 淘汰 */
  maxSteps?: number;
}
```

## API

| 方法/属性   | 类型               | 说明                     |
| ----------- | ------------------ | ------------------------ |
| `push()`    | method             | 保存当前场景快照到撤销栈 |
| `undo()`    | method → `boolean` | 撤销，返回是否成功       |
| `redo()`    | method → `boolean` | 重做，返回是否成功       |
| `canUndo`   | getter → `boolean` | 是否可撤销               |
| `canRedo`   | getter → `boolean` | 是否可重做               |
| `undoCount` | getter → `number`  | 撤销栈长度               |
| `redoCount` | getter → `number`  | 重做栈长度               |
| `reset()`   | method             | 清空所有历史记录         |
| `dispose()` | method             | 重置并清除引用           |

## 使用示例

```typescript
// 用户操作前保存快照
history.push();
// ... 用户执行操作

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
```

## 注意事项

- `push()` 应在用户操作**之前**调用，保存操作前的状态作为撤销点
- 基于 `app.toJSON()` / `app.restoreFromJSON()` 的整体场景快照
- 大场景时内存占用较高（非增量记录）
- `push()` 后清空重做栈（新操作分支覆盖旧历史）
