---
'rendx-graph-plugin': minor
---

新增 Element Traits 系统

- `GraphElementTraits` 接口：`draggable` / `selectable` / `connectable` / `deletable` / `positionDerived`
- `PortResolver`：`connectable` 支持函数形式，返回端口 Graphics 列表
- `createNode` / `createEdge` 支持 `traits` 配置项，声明元素能力
- graph-plugin 安装时自动注册 `TraitProvider`，供其他插件通过 `app.interaction.queryTraits()` 查询
- Node 默认 traits：`{ draggable: true, selectable: true, connectable: true, deletable: true, positionDerived: false }`
- Edge 默认 traits：`{ draggable: false, selectable: true, connectable: false, deletable: true, positionDerived: true }`
