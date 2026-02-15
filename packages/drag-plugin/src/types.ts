import type {Graphics} from 'rendx-engine';
import type {Point} from 'rendx-core';

// ── 约束 ─────────────────────────────────────────────────

/**
 * 拖拽约束配置
 */
export interface DragConstraint {
  /** 锁定轴向：'x' 仅水平、'y' 仅垂直、'both' 自由（默认 'both'） */
  axis?: 'x' | 'y' | 'both';

  /** 网格吸附间距：number 对称，[gx, gy] 非对称 */
  grid?: number | [number, number];

  /** 拖拽边界（场景坐标） */
  bounds?: {minX?: number; minY?: number; maxX?: number; maxY?: number};
}

// ── 位置快照 ──────────────────────────────────────────────

/**
 * 拖拽开始时记录的目标位置快照，用于 cancel 回滚和 drag:end 负载。
 */
export interface DragSnapshot {
  /** 目标节点 */
  target: Graphics;
  /** 起始 translation x */
  x: number;
  /** 起始 translation y */
  y: number;
}

// ── 事件负载 ──────────────────────────────────────────────

/**
 * drag:start 事件负载
 */
export interface DragStartEvent {
  /** 拖拽目标列表 */
  targets: Graphics[];
  /** 起始世界坐标 */
  origin: Point;
}

/**
 * drag:move 事件负载
 */
export interface DragMoveEvent {
  /** 拖拽目标列表 */
  targets: Graphics[];
  /** 本帧增量（场景坐标） */
  delta: Point;
  /** 从起点累计的总增量（场景坐标） */
  totalDelta: Point;
}

/**
 * drag:end 事件负载
 */
export interface DragEndEvent {
  /** 拖拽目标列表 */
  targets: Graphics[];
  /** 累计总增量 */
  totalDelta: Point;
  /** 各目标的起始位置快照（供 history-plugin 消费） */
  startPositions: DragSnapshot[];
  /** 各目标的结束位置快照 */
  endPositions: DragSnapshot[];
}

/**
 * drag:cancel 事件负载
 */
export interface DragCancelEvent {
  /** 拖拽目标列表 */
  targets: Graphics[];
}

// ── 插件配置 ──────────────────────────────────────────────

/**
 * 拖拽插件配置
 */
export interface DragPluginOptions {
  /**
   * 命中委托 — 将叶子命中节点映射为逻辑拖拽目标。
   *
   * 典型场景：graph-plugin 中一个 element 由 Group + 多个子 Node 组成，
   * 用户点击叶子 Node 时需要向上找到整个 Group 作为拖拽目标。
   * 返回 null 表示该命中不可拖拽。
   *
   * 纯 engine 场景下不设置此项，直接拖拽命中的 Node。
   */
  hitDelegate?: (target: Graphics) => Graphics | null;

  /**
   * 过滤器 — 判断节点是否允许被拖拽。
   * 返回 false 则该节点不可拖拽。默认所有节点均可拖拽。
   */
  filter?: (target: Graphics) => boolean;

  /**
   * 是否联动选中节点拖拽（默认 true）。
   *
   * 启用时：如果拖拽的节点属于已选中集合（`selection:selected` state），
   * 则所有选中节点一起移动。
   * 需安装 rendx-selection-plugin 才有效；未安装时此选项无效果。
   */
  enableGroupDrag?: boolean;

  /** 拖拽约束 */
  constraint?: DragConstraint;

  /** 最小拖拽距离（px），防止点击误触（默认 3） */
  threshold?: number;

  /** 拖拽中光标样式（默认 'grabbing'） */
  cursor?: string;

  /**
   * 位置应用策略 — 将拖拽增量应用到目标节点。
   *
   * 默认行为：
   * - 检测 graph-plugin 是否存在
   * - 存在 → 通过 element.update({x, y}) 写入（自动触发依赖 edge 重绘）
   * - 不存在 → 直接 target.translate(newX, newY)
   *
   * 覆盖此函数可实现自定义逻辑（如吸附辅助线、对齐等）。
   *
   * @param target - 拖拽目标节点
   * @param newX - 新的 X 坐标（已包含约束）
   * @param newY - 新的 Y 坐标（已包含约束）
   * @param delta - 本帧增量 [dx, dy]
   */
  applyPosition?: (target: Graphics, newX: number, newY: number, delta: Point) => void;
}
