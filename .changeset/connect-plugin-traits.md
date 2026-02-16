---
'rendx-connect-plugin': minor
---

集成 InteractionManager 及多项修复

- 集成 InteractionManager 通道锁，连线开始时获取 `pointer-exclusive` 锁，结束时释放
- 通过 `app.interaction.queryTraits()` 查询 connectable 端口，替代旧版 className 硬编码
- 修复 anchor 计算使用局部坐标的 bug，改为世界坐标
- 修复重复边检测逻辑，正确判断 sourceId/targetId 组合
