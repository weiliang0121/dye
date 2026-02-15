# rendx-grid-plugin

点阵网格背景插件，在画布下方叠加独立 Canvas 绘制等间距圆点网格，常用于编辑器对齐参考。

## 安装

```typescript
import {gridPlugin} from 'rendx-grid-plugin';

const app = new App({width: 800, height: 600});
app.mount(container);
app.use(gridPlugin({spacing: 20, color: '#ccc'}));
```

## 配置

```typescript
interface GridPluginOptions {
  /** 点阵间距（px，默认 20） */
  spacing?: number;
  /** 点半径（px，默认 1） */
  dotRadius?: number;
  /** 点颜色（默认 '#d0d0d0'） */
  color?: string;
  /** 层级（默认 -1，在所有渲染层下方） */
  zIndex?: number;
}
```

## API

| 方法              | 说明                   |
| ----------------- | ---------------------- |
| `draw()`          | 清空并重绘网格         |
| `resize(w, h)`    | 调整 Canvas 尺寸并重绘 |
| `update(options)` | 更新配置并重绘         |
| `dispose()`       | 移除 Canvas 元素       |

## 使用示例

```typescript
const grid = app.getPlugin('grid');

// 动态更新
grid.update({spacing: 40, color: '#ddd'});

// 窗口 resize
grid.resize(newWidth, newHeight);
```

## 注意事项

- App 必须先 `mount()` 再 `use(gridPlugin())`
- 独立 Canvas 元素，不参与 rendx 渲染管线
- 支持 HiDPI（devicePixelRatio）
- `pointerEvents: 'none'`，不拦截用户交互
