# rendx-selection-plugin

选框交互插件 — 提供节点选中、悬停高亮、框选（marquee）和光标管理。

## 安装

```typescript
import {App, Node} from 'rendx-engine';
import {selectionPlugin} from 'rendx-selection-plugin';

const app = new App({width: 800, height: 600});
app.mount(container);
app.use(
  selectionPlugin({
    enableHover: true,
    enableMarquee: true,
  }),
);
```

## 配置

```typescript
interface SelectionPluginOptions {
  /** 选中框样式 */
  selectionStyle?: SelectionBoxStyle;
  /** 悬停高亮样式 */
  hoverStyle?: HoverStyle;
  /** 框选矩形样式 */
  marqueeStyle?: MarqueeStyle;
  /** 启用悬停高亮（默认 false） */
  enableHover?: boolean;
  /** 启用多选（Shift/Meta + 点击，默认 true） */
  enableMultiSelect?: boolean;
  /** 启用框选（空白处拖拽选区，默认 false） */
  enableMarquee?: boolean;
  /** 选框层 z-index（默认 10） */
  zIndex?: number;
  /** 命中委托 — 将叶子命中映射为逻辑节点 */
  hitDelegate?: (target: Graphics) => Graphics | null;
  /** 过滤器 — 判断节点是否可被选中 */
  filter?: (target: Graphics) => boolean;
  /** 自定义 overlay 渲染器 */
  renderOverlay?: (target: Graphics, type: 'selection' | 'hover') => Node | null;
}
```

## API

### 实例方法

| 方法               | 说明                     |
| ------------------ | ------------------------ |
| `getSelected()`    | 获取选中列表（只读副本） |
| `getHovering()`    | 获取当前悬停节点         |
| `select(targets)`  | 编程式设置选中列表       |
| `clearSelection()` | 清空所有选中             |

### 事件

通过 `app.bus` 监听：

```typescript
app.bus.on('selection:change', e => {
  console.log('选中:', e.selected);
  console.log('新增:', e.added);
  console.log('移除:', e.removed);
});

app.bus.on('selection:hover-change', e => {
  console.log('悬停:', e.current);
  console.log('上一个:', e.previous);
});
```

### State

| Key                  | 类型               | 说明         |
| -------------------- | ------------------ | ------------ |
| `selection:selected` | `Graphics[]`       | 选中节点列表 |
| `selection:hovering` | `Graphics \| null` | 悬停节点     |

## 光标管理

插件自动管理容器光标样式（通过 `app.setCursor()` / `app.resetCursor()`）：

| 场景           | 光标        |
| -------------- | ----------- |
| 悬停到可选节点 | `pointer`   |
| 离开可选节点   | 重置        |
| 框选拖拽中     | `crosshair` |
| 框选结束       | 重置        |

## 自定义 Overlay

默认行为是绘制虚线矩形（基于 worldBBox），通过 `renderOverlay` 可自定义：

```typescript
app.use(
  selectionPlugin({
    renderOverlay: (target, type) => {
      // 路径类节点用加粗同路径 stroke
      if (target.hasClassName('edge')) {
        const visual = target.children.find(c => c.type === 3);
        const overlay = Node.create('path', {
          stroke: '#1890ff',
          strokeWidth: type === 'selection' ? 6 : 4,
          fill: 'none',
          opacity: 0.4,
        });
        overlay.shape.from(visual.shape.d);
        return overlay;
      }
      return null; // 其他使用默认矩形
    },
  }),
);
```

## 命中委托

适配复合节点（如 graph-plugin 的 element）：

```typescript
app.use(
  selectionPlugin({
    hitDelegate: target => {
      let node = target;
      while (node && node.type !== 4) {
        if (node.hasClassName('selectable')) return node;
        node = node.parent;
      }
      return null;
    },
  }),
);
```

## 工具函数

### getWorldBBox

```typescript
import {getWorldBBox} from 'rendx-selection-plugin';

const bbox = getWorldBBox(node); // Node → worldBBox
const bbox = getWorldBBox(group); // Group → 子节点并集
```

## 样式配置

### SelectionBoxStyle / HoverStyle

| 属性              | 默认值              | 说明           |
| ----------------- | ------------------- | -------------- |
| `stroke`          | `'#1890ff'`         | 边框颜色       |
| `strokeWidth`     | `2` / `1`           | 边框宽度       |
| `strokeDasharray` | `'6, 3'` / `'4, 2'` | 虚线模式       |
| `fill`            | `'transparent'`     | 填充颜色       |
| `padding`         | `2`                 | 到 bbox 的间距 |

### MarqueeStyle

| 属性              | 默认值                    | 说明     |
| ----------------- | ------------------------- | -------- |
| `fill`            | `'rgba(24,144,255,0.08)'` | 填充颜色 |
| `stroke`          | `'#1890ff'`               | 边框颜色 |
| `strokeWidth`     | `1`                       | 边框宽度 |
| `strokeDasharray` | `'4, 2'`                  | 虚线模式 |
