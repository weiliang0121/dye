---
'rendx-selection-plugin': patch
---

集成 InteractionManager 通道锁

- 注册 `pointer-exclusive` 通道（优先级 5）
- 在 click/hover/marquee 事件入口检查通道锁状态，被其他插件锁定时跳过处理
- 保留 state 软感知作为向后兼容 fallback
