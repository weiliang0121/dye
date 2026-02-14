---
"@dye/engine": patch
---

修复多个引擎 bug：
- RoundShape 的 ry 参数现在可选，默认与 rx 相同（符合 SVG 规范）
- 图片加载完成后自动触发重新渲染（imageLoader.onChange）
- 修复 repeat 动画在重复周期后停止的问题
- Attributes.useTransform() 改为实际创建 AttributeTransform 实例
