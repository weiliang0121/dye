import type {Graphics} from 'rendx-engine';

// ── 样式接口 ─────────────────────────────────────────────

/**
 * 选中框样式配置
 */
export interface SelectionBoxStyle {
  /** 边框颜色（默认 '#1890ff'） */
  stroke?: string;
  /** 边框宽度（默认 2） */
  strokeWidth?: number;
  /** 虚线模式（默认 '6, 3'），设为 '' 则实线 */
  strokeDasharray?: string;
  /** 填充颜色（默认 'transparent'） */
  fill?: string;
  /** 到节点 bbox 的间距 px（默认 2） */
  padding?: number;
}

/**
 * 悬停高亮样式配置
 */
export interface HoverStyle {
  /** 边框颜色（默认 '#1890ff'） */
  stroke?: string;
  /** 边框宽度（默认 1） */
  strokeWidth?: number;
  /** 虚线模式（默认 '4, 2'），设为 '' 则实线 */
  strokeDasharray?: string;
  /** 填充颜色（默认 'transparent'） */
  fill?: string;
  /** 到节点 bbox 的间距 px（默认 2） */
  padding?: number;
}

/**
 * 框选（marquee）样式配置
 */
export interface MarqueeStyle {
  /** 填充颜色（默认 'rgba(24,144,255,0.08)'） */
  fill?: string;
  /** 边框颜色（默认 '#1890ff'） */
  stroke?: string;
  /** 边框宽度（默认 1） */
  strokeWidth?: number;
  /** 虚线模式（默认 '4, 2'） */
  strokeDasharray?: string;
}

// ── 插件配置 ─────────────────────────────────────────────

/**
 * 选框插件配置
 */
export interface SelectionPluginOptions {
  /** 选中框样式 */
  selectionStyle?: SelectionBoxStyle;

  /** 悬停高亮样式 */
  hoverStyle?: HoverStyle;

  /** 框选（marquee）样式 */
  marqueeStyle?: MarqueeStyle;

  /** 是否启用悬停高亮（默认 false，需手动开启） */
  enableHover?: boolean;

  /** 是否启用多选（Shift / Meta + 点击，默认 true） */
  enableMultiSelect?: boolean;

  /** 是否启用框选（空白处拖拽选区，默认 false，需手动开启） */
  enableMarquee?: boolean;

  /**
   * 选框层 z-index（默认 10，位于 default 层之上、事件层之下）
   */
  zIndex?: number;

  /**
   * 命中委托 — 将实际命中的叶子节点映射回"可选中"的逻辑节点。
   *
   * 典型场景：graph-plugin 中一个 element 由 Group 包含多个子节点组成，
   * 用户仅希望选中整个 element（而非内部某个子节点）。
   * 此函数从 hitTarget 向上遍历树，返回应被选中的祖先节点；返回 null 则忽略本次命中。
   *
   * @example
   * ```ts
   * hitDelegate: (target) => {
   *   let node: Graphics | null = target;
   *   while (node && node.type !== 4) { // 4 = Layer
   *     if (node.hasClassName('selectable')) return node;
   *     node = node.parent;
   *   }
   *   return null;
   * }
   * ```
   */
  hitDelegate?: (target: Graphics) => Graphics | null;

  /**
   * 过滤器 — 判断一个节点是否允许被选中。
   * 返回 false 则该节点不可被选中。默认所有节点均可选中。
   */
  filter?: (target: Graphics) => boolean;

  /**
   * 自定义选中/悬停 overlay 渲染器。
   *
   * 默认行为是为每个选中/悬停目标绘制一个虚线矩形（基于 worldBBox）。
   * 当目标是路径（如曲线边）时，矩形选框往往不合适；
   * 通过此回调可返回自定义 Node（如加粗的同路径 stroke）作为 overlay。
   *
   * @param target - 当前选中/悬停的节点
   * @param type   - 'selection' | 'hover'，区分两种场景
   * @returns 返回 Node 作为 overlay；返回 null/undefined 则回退到默认矩形
   *
   * @example
   * ```ts
   * renderOverlay: (target, type) => {
   *   if (target.hasClassName('graph-edge')) {
   *     // 找到边的路径数据，画一条更粗的同路径 stroke
   *     const pathNode = target.children.find(c => c.type === 3);
   *     const overlay = Node.create('path', {
   *       stroke: '#1890ff',
   *       strokeWidth: type === 'selection' ? 6 : 4,
   *       fill: 'none', opacity: 0.4,
   *     });
   *     overlay.shape.from(pathNode.shape.d);
   *     return overlay;
   *   }
   *   return null; // 其他节点使用默认矩形
   * }
   * ```
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  renderOverlay?: (target: Graphics, type: 'selection' | 'hover') => any | null;
}

// ── 事件负载 ─────────────────────────────────────────────

/**
 * 选中变更事件负载
 */
export interface SelectionChangeEvent {
  /** 当前选中列表 */
  selected: Graphics[];
  /** 本次新增选中的节点 */
  added: Graphics[];
  /** 本次取消选中的节点 */
  removed: Graphics[];
}

/**
 * 悬停变更事件负载
 */
export interface HoverChangeEvent {
  /** 当前悬停节点（null = 离开） */
  current: Graphics | null;
  /** 上一个悬停节点 */
  previous: Graphics | null;
}
