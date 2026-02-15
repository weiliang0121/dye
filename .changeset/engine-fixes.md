---
'rendx-engine': patch
---

fix: 修复渲染管线脏标记相关的三个 bug

- Graphics.remove() 未清除 child.parent，导致子节点仍持有旧父引用
- pick() 调用 getQueue() 时会清除子树的渲染脏标记，导致后续渲染帧跳过重绘
- sign() 中 display 检查优先于 dirty 检查，导致 setDisplay(false) 后层级无法感知变更
