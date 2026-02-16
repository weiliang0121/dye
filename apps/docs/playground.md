# Playground

Playground 是一个独立的交互式编辑器应用，用于在线体验 Rendx 引擎。

**[打开在线 Playground →](https://weiliang0121.github.io/rendx/playground/)**

## Graph Editor

基于 Rendx 全部插件能力构建的图编辑器 Demo，详细介绍和代码解析请参考 [Graph Editor 文档](/guide/graph-editor)。

**[打开 Graph Editor →](https://weiliang0121.github.io/rendx/playground/editor.html)**

## 本地开发

```bash
# 在仓库根目录
pnpm --filter rendx-playground dev
```

启动后访问 `http://localhost:5174`（Playground）或 `http://localhost:5174/editor.html`（Graph Editor）。

## 功能

- **Monaco 编辑器** — 语法高亮、自动补全
- **实时预览** — 在右侧面板查看渲染结果
- **内置示例** — 左侧边栏选择不同 demo
- **控制台** — 底部显示 `console.log` 输出
- **可调分割** — 拖拽中间分割条调整比例
