---
'rendx-drag-plugin': patch
---

集成 InteractionManager 通道锁

- 注册 `pointer-exclusive` 通道（优先级 10）
- 拖拽开始时获取锁，拖拽结束时释放锁
- 通过 `app.interaction.queryTraits()` 查询元素 draggable 特征
