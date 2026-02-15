---
'rendx-selection-plugin': patch
---

feat(selection-plugin): 新增 `refreshOverlay()` 公开方法

- 新增 `refreshOverlay()` 方法，暴露内部选框 overlay 刷新能力
- 供外部插件（如 drag-plugin）在移动节点后主动调用，确保选中框/悬停框与节点位置同步
- 遵循「谁改谁通知」原则：drag-plugin 作为位置修改方，主动通知 selection-plugin 刷新
