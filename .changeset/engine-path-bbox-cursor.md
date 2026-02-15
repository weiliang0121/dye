---
'rendx-engine': minor
---

feat(engine): PathShape 新增 box() 包围盒计算；App 新增光标管理 API

### PathShape.box()

- PathShape 通过 `pathBBox()` 解析 d 字符串计算包围盒
- `from(d)` 现在正确设置 `needUpdate` 标记触发包围盒重算
- `getWorldBBox()` 对 path 类型节点不再返回 null

### App 光标 API

- `app.setCursor(cursor: string)` — 设置容器鼠标光标样式
- `app.resetCursor()` — 重置光标为默认值

新增 path-shape.test.ts 测试（5 个用例）
