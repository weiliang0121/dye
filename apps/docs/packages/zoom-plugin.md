# rendx-zoom-plugin

画布缩放平移插件 — 为 Rendx 引擎提供滚轮缩放、拖拽平移、触控板 pinch 等视口控制能力。

## 安装

```typescript
import {zoomPlugin} from 'rendx-zoom-plugin';

const app = new App({width: 800, height: 600});
app.mount(container);

const zoom = zoomPlugin({minZoom: 0.2, maxZoom: 4});
app.use(zoom);
```

::: warning 注意
插件必须在 `app.mount()` 之后通过 `app.use()` 安装，因为需要获取 DOM 容器来绑定事件。
:::

## 配置

```typescript
interface ZoomPluginOptions {
  /** 最小缩放比例（默认 0.1） */
  minZoom?: number;
  /** 最大缩放比例（默认 5） */
  maxZoom?: number;
  /** 每次滚轮缩放的步进（默认 0.1） */
  zoomStep?: number;
  /** 是否启用滚轮缩放（默认 true） */
  enableWheelZoom?: boolean;
  /** Ctrl/Meta + 滚轮缩放模式（默认 true）
   *  true: Ctrl/Meta 滚轮/pinch = 缩放，普通滚轮 = 平移
   *  false: 滚轮直接缩放 */
  ctrlZoom?: boolean;
  /** 是否启用空格 + 拖拽平移（默认 true） */
  enableSpacePan?: boolean;
  /** 是否启用鼠标中键拖拽平移（默认 true） */
  enableMiddleButtonPan?: boolean;
  /** 触控板 pinch 缩放灵敏度（默认 0.01） */
  pinchSensitivity?: number;
  /** 缩放变化时的回调 */
  onZoomChange?: (e: ZoomChangeEvent) => void;
}
```

### ZoomChangeEvent

```typescript
interface ZoomChangeEvent {
  /** 当前缩放比例 */
  zoom: number;
  /** 当前平移 [tx, ty] */
  pan: [number, number];
}
```

## API

### `zoomPlugin(options?): ZoomPlugin`

工厂函数，创建插件实例。返回值需传给 `app.use()`。

### 实例方法

#### 缩放操作

| 方法                      | 说明                           |
| ------------------------- | ------------------------------ |
| `getZoom()`               | 获取当前缩放比例               |
| `setZoom(zoom, cx?, cy?)` | 按焦点缩放（默认中心）         |
| `zoomBy(delta, cx?, cy?)` | 相对缩放（正值放大、负值缩小） |
| `zoomIn()`                | 放大一步（`zoomStep`）         |
| `zoomOut()`               | 缩小一步                       |

#### 平移操作

| 方法            | 说明                      |
| --------------- | ------------------------- |
| `getPan()`      | 获取当前平移量 `[tx, ty]` |
| `panBy(dx, dy)` | 相对平移                  |

#### 视口操作

| 方法                | 说明                                            |
| ------------------- | ----------------------------------------------- |
| `reset()`           | 重置缩放和平移到初始状态                        |
| `fitView(padding?)` | 适应视口（居中显示，自动缩放，默认 padding=40） |
| `isPanning()`       | 是否正在平移操作中                              |

## 焦点缩放（Focal Zoom）

`setZoom` 围绕指定中心点缩放，确保该点在缩放前后保持在相同的屏幕位置：

```typescript
// 以画布中心缩放到 200%
zoom.setZoom(2);

// 以鼠标位置 (400, 300) 为中心缩放到 150%
zoom.setZoom(1.5, 400, 300);
```

**数学原理**：

$$
\begin{aligned}
\text{world} &= \frac{\text{screen} - \text{translate}}{\text{oldZoom}} \\
\text{newTranslate} &= \text{screen} - \text{world} \times \text{newZoom}
\end{aligned}
$$

## 交互方式

| 交互          | 行为（`ctrlZoom=true`） | 行为（`ctrlZoom=false`） |
| ------------- | ----------------------- | ------------------------ |
| 滚轮          | 平移                    | 缩放                     |
| Ctrl/⌘ + 滚轮 | 缩放                    | 缩放                     |
| 触控板 pinch  | 缩放                    | 缩放                     |
| 空格 + 拖拽   | 平移                    | 平移                     |
| 鼠标中键拖拽  | 平移                    | 平移                     |

## 事件

插件通过 `app.bus` 发出事件：

```typescript
app.bus.on('zoom:change', (e: ZoomChangeEvent) => {
  console.log(`Zoom: ${e.zoom}, Pan: ${e.pan}`);
});
```

也可以通过 `onZoomChange` 回调配置：

```typescript
const zoom = zoomPlugin({
  onZoomChange: e => {
    statusBar.textContent = `${Math.round(e.zoom * 100)}%`;
  },
});
```

## 与其他插件协同

### 小地图 (minimap-plugin)

缩放/平移后更新小地图：

```typescript
const zoom = zoomPlugin({
  onZoomChange: () => minimap.draw(),
});
```

### 网格 (grid-plugin)

网格自动跟随视口变换，无需额外处理。

### 选框 (selection-plugin)

选框 overlay 在场景坐标系中绘制，缩放/平移后自动跟随。

## 完整示例

```typescript
import {App, Node} from 'rendx-engine';
import {zoomPlugin} from 'rendx-zoom-plugin';
import {gridPlugin} from 'rendx-grid-plugin';

const app = new App({width: 800, height: 600});
app.mount(document.getElementById('container')!);

// 网格
app.use(gridPlugin({spacing: 20}));

// 缩放
const zoom = zoomPlugin({
  minZoom: 0.2,
  maxZoom: 4,
  ctrlZoom: true,
  onZoomChange: e => {
    document.getElementById('zoom')!.textContent = `${Math.round(e.zoom * 100)}%`;
  },
});
app.use(zoom);

// 内容
const rect = Node.create('rect', {fill: '#4dabf7'});
rect.shape.from(100, 100, 200, 150);
app.scene.add(rect);

app.render();

// 工具栏
document.getElementById('btn-in')!.onclick = () => zoom.zoomIn();
document.getElementById('btn-out')!.onclick = () => zoom.zoomOut();
document.getElementById('btn-reset')!.onclick = () => zoom.reset();
document.getElementById('btn-fit')!.onclick = () => zoom.fitView();
```

## 层级

插件层，依赖 `rendx-engine`。

## 输出

| 字段 | 值                                                              |
| ---- | --------------------------------------------------------------- |
| 包名 | `rendx-zoom-plugin`                                             |
| 入口 | `src/main.ts`                                                   |
| 输出 | `dist/main.js` (ESM) / `dist/main.cjs` (CJS) / `dist/main.d.ts` |
