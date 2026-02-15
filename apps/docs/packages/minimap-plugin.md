# rendx-minimap-plugin

小地图导航插件，在画布角落叠加缩略视图，显示所有节点的简化矩形及当前视口指示器。

## 安装

```typescript
import {minimapPlugin} from 'rendx-minimap-plugin';

const app = new App({width: 800, height: 600});
app.mount(container);
app.use(minimapPlugin({position: 'bottom-right'}));
```

## 配置

```typescript
interface MinimapPluginOptions {
  /** 小地图宽度（px，默认 150） */
  width?: number;
  /** 小地图高度（px，默认 110） */
  height?: number;
  /** 位置（默认 'bottom-right'） */
  position?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
  /** 距容器边缘间距（px，默认 10） */
  margin?: number;
  /** 背景色（默认 'rgba(255,255,255,0.9)'） */
  background?: string;
  /** 边框色（默认 '#ccc'） */
  borderColor?: string;
  /** 视口指示器边框色（默认 'rgba(24,144,255,0.8)'） */
  viewportColor?: string;
  /** 节点默认填充色（默认 '#999'） */
  nodeFill?: string;
}
```

## API

| 方法              | 说明                      |
| ----------------- | ------------------------- |
| `draw()`          | 重绘小地图                |
| `resize()`        | 重绘（内部调用 `draw()`） |
| `update(options)` | 更新配置并重绘            |
| `dispose()`       | 移除 DOM 元素             |

## 使用示例

```typescript
const minimap = app.getPlugin('minimap');

// 场景变化后刷新
app.render();
minimap.draw();

// 动态更新配置
minimap.update({position: 'top-left', margin: 20});
```

## 绘制原理

1. 遍历所有非事件层的 Layer，收集每个 Node 的 `getWorldBBox()`
2. 计算所有节点包围盒的并集为场景总范围
3. 等比缩放映射到小地图画布
4. 每个节点绘制为半透明填充矩形（颜色取节点 `fill` 属性）
5. 绘制蓝色边框矩形标识当前视口区域

## 注意事项

- App 必须先 `mount()` 再 `use(minimapPlugin())`
- 支持 HiDPI（devicePixelRatio）
- `pointerEvents: 'none'`，不拦截用户交互
- `zIndex: 99998`，仅低于事件层
