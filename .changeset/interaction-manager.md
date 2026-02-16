---
'rendx-engine': minor
---

新增 InteractionManager 交互管理器

- `app.interaction` 提供结构化的插件协调机制
- 通道锁（Channel Lock）：`pointer-exclusive` 通道，同一时刻仅允许一个插件持有锁
- 优先级抢占：按注册优先级决定锁的获取顺序（connect=15 > drag=10 > selection=5）
- Element Traits 查询：`registerTraitProvider` / `queryTraits` 支持声明式元素能力查询
- 插件注册/注销/锁获取/释放完整生命周期管理
