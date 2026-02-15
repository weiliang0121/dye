# rendx-grid-plugin

## 概述

点阵网格背景插件，在渲染画布下方叠加一层独立 Canvas 绘制等间距的圆点网格，常用于编辑器对齐参考。

## 依赖层级

插件层（依赖 `rendx-engine`）

## 文件结构

```
src/
├── main.ts    入口，导出 gridPlugin 工厂 + GridPluginOptions 类型
└── grid.ts    GridPlugin 实现 + gridPlugin 工厂函数
```

## 公开 API

### `gridPlugin(options?): GridPlugin`

工厂函数，创建并返回 `GridPlugin` 实例。

### `GridPluginOptions`

| 选项        | 类型     | 默认值      | 说明                       |
| ----------- | -------- | ----------- | -------------------------- |
| `spacing`   | `number` | `20`        | 点阵间距（px）             |
| `dotRadius` | `number` | `1`         | 点半径（px）               |
| `color`     | `string` | `'#d0d0d0'` | 点颜色                     |
| `zIndex`    | `number` | `-1`        | 层级，默认在所有渲染层下方 |

### GridPlugin（实现 `Plugin`）

| 方法                    | 说明                                             |
| ----------------------- | ------------------------------------------------ |
| `install(app)`          | 创建独立 Canvas 并插入容器，绘制网格             |
| `draw()`                | 清空并重绘点阵网格                               |
| `resize(width, height)` | 调整 Canvas 尺寸并重绘                           |
| `update(options)`       | 更新配置（spacing/dotRadius/color/zIndex）并重绘 |
| `dispose()`             | 移除 Canvas 元素，清理引用                       |

## 实现细节

### Canvas 创建

- 独立 `<canvas>` 元素，非 rendx 渲染管线的一部分
- 支持 `devicePixelRatio`（HiDPI）：物理尺寸 = 逻辑尺寸 × ratio，通过 `ctx.scale(ratio, ratio)` 还原坐标
- `pointerEvents: 'none'`，不拦截用户交互
- 作为容器首个子元素插入（`insertBefore(canvas, firstChild)`），确保在渲染层下方

### 绘制算法

- 双层 for 循环，从 `(spacing, spacing)` 开始，步长 `spacing`
- 每个点绘制一个小圆弧（`arc + fill`）

### 前置条件

- App 必须先 `mount()` 再 `use(gridPlugin())`，否则抛出错误

## 典型用法

```typescript
import {gridPlugin} from 'rendx-grid-plugin';

const app = new App({width: 800, height: 600});
app.mount(container);
app.use(gridPlugin({spacing: 20, color: '#ccc'}));

// 动态更新
const grid = app.getPlugin('grid');
grid.update({spacing: 40, color: '#ddd'});

// 窗口 resize
grid.resize(newWidth, newHeight);
```
