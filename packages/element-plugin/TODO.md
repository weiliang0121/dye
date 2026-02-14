# element-plugin TODO

## 已知问题

### Graph + History 插件不兼容

**问题**：`history-plugin` 基于 `app.toJSON()` 做场景快照实现撤销/重做。但 `graph` 插件的元素数据（`#elements` Map、类型注册、依赖追踪）存储在插件内部，不在场景图中。因此 `restoreFromJSON()` 只恢复了 Group 节点的几何状态，而 graph 的元素注册表、依赖追踪、cleanup 回调等全部丢失。

**表现**：

- undo 后 `graph.get('xxx')` 返回 undefined
- 场景中的 Group 节点还在（来自 JSON 恢复），但 graph 不知道它们的存在
- 依赖追踪失效，移动 node 不再触发 edge 重绘

**可能的解决方案**：

1. **Graph 自管快照** — graph 插件监听 `history:willSave` 事件，将 `#elements` 序列化为独立快照，undo 时从自己的快照栈恢复。优点：不改 history 插件；缺点：两条独立的快照栈需要保持同步。

2. **统一快照协议** — 在 Plugin 接口中增加 `serialize()` / `deserialize()` hook，history 插件在做快照时调用所有插件的 serialize，恢复时调用 deserialize。优点：通用方案；缺点：需要改 engine 核心的 Plugin 接口。

3. **Command 模式替代快照** — history 插件改为基于 command（操作记录）而非 snapshot，每个操作记录 undo/redo 函数。优点：不依赖序列化；缺点：history 插件需要大改，且 command 注册是应用层的事。
