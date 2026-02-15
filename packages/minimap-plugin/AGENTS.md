# rendx-minimap-plugin

## 概述

小地图导航插件，在画布角落叠加一个缩略视图，显示所有节点的简化矩形及当前视口指示器，帮助用户定位场景全貌。

## 依赖层级

插件层（依赖 `rendx-engine`）

## 文件结构

```
src/
├── main.ts       入口，导出 minimapPlugin 工厂 + MinimapPluginOptions 类型
└── minimap.ts    MinimapPlugin 实现 + minimapPlugin 工厂函数
```

## 公开 API

### `minimapPlugin(options?): MinimapPlugin`

工厂函数，创建并返回 `MinimapPlugin` 实例。

### `MinimapPluginOptions`

| 选项            | 类型                                                           | 默认值                    | 说明                       |
| --------------- | -------------------------------------------------------------- | ------------------------- | -------------------------- |
| `width`         | `number`                                                       | `150`                     | 小地图宽度（px）           |
| `height`        | `number`                                                       | `110`                     | 小地图高度（px）           |
| `position`      | `'top-left' \| 'top-right' \| 'bottom-left' \| 'bottom-right'` | `'bottom-right'`          | 小地图在容器中的位置       |
| `margin`        | `number`                                                       | `10`                      | 距容器边缘的间距（px）     |
| `background`    | `string`                                                       | `'rgba(255,255,255,0.9)'` | 背景色                     |
| `borderColor`   | `string`                                                       | `'#ccc'`                  | 边框色                     |
| `viewportColor` | `string`                                                       | `'rgba(24,144,255,0.8)'`  | 视口指示器边框色           |
| `nodeFill`      | `string`                                                       | `'#999'`                  | 节点无 fill 时的默认填充色 |

### MinimapPlugin（实现 `Plugin`）

| 方法              | 说明                                                            |
| ----------------- | --------------------------------------------------------------- |
| `install(app)`    | 创建 wrapper + canvas，添加到容器，绘制小地图                   |
| `draw()`          | 重绘小地图（收集节点包围盒 → 缩放 → 绘制简化矩形 + 视口指示器） |
| `resize()`        | 重绘（无需额外参数，内部直接调用 `draw()`）                     |
| `update(options)` | 更新配置（尺寸/位置/颜色等）并重绘                              |
| `dispose()`       | 移除 DOM 元素，清理引用                                         |

## 实现细节

### DOM 结构

```
<div> (wrapper — 定位容器)
  └── <canvas> (绘制区域)
```

- wrapper：`position: absolute`，通过 `position` 配置项定位四个角
- `zIndex: 99998`（仅低于事件层），`pointerEvents: 'none'` 不拦截交互
- 支持 `devicePixelRatio`（HiDPI）

### 绘制流程（`draw()`）

1. **收集节点**：遍历所有非事件层的 Layer，获取队列中每个 Node 的 `getWorldBBox()` 世界包围盒
2. **计算场景总范围**：取所有节点包围盒的并集，并扩展以包含画布原点 `(0, 0)` 和画布尺寸
3. **缩放映射**：计算等比缩放系数 `scale = min(drawW/sceneW, drawH/sceneH)`，留 4px 内边距
4. **绘制节点**：每个节点绘制为半透明（`globalAlpha: 0.6`）的填充矩形，颜色取节点 `fill` 属性或 `nodeFill` 默认值
5. **绘制视口**：在小地图上绘制蓝色边框矩形标识当前画布可见区域

### 坐标变换

- `tx(x) = offsetX + (x - sceneMinX) * scale` — 场景坐标 → 小地图坐标
- `ty(y) = offsetY + (y - sceneMinY) * scale`

### 前置条件

- App 必须先 `mount()` 再 `use(minimapPlugin())`，否则抛出错误

### 配置热更新（`update()`）

- 支持运行时修改所有选项
- 尺寸变化时自动调整 canvas 物理/逻辑尺寸
- 位置变化时重新定位 wrapper（先清除所有方向再设置新方向）

## 典型用法

```typescript
import {minimapPlugin} from 'rendx-minimap-plugin';

const app = new App({width: 800, height: 600});
app.mount(container);
app.use(minimapPlugin({position: 'bottom-right', width: 200, height: 150}));

// 场景变化后刷新小地图
app.render();
const minimap = app.getPlugin('minimap');
minimap.draw();

// 动态更新配置
minimap.update({position: 'top-left', margin: 20});
```
