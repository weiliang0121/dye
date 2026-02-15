---
'rendx-path': minor
---

feat(path): 新增 `pathBBox(d)` 函数，从 SVG path d 字符串解析轴对齐包围盒 (AABB)

- 支持所有 SVG 路径命令：M/m, L/l, H/h, V/v, C/c, Q/q, S/s, T/t, A/a, Z/z
- 贝塞尔曲线使用控制点凸包（保守上界），弧线使用 ±半径
- 空路径返回 null
- 新增 bbox.test.ts 测试覆盖（20 个用例）
