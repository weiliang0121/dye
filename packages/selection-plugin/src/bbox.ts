import {BoundingBox} from 'rendx-bounding';

import type {Graphics, Node} from 'rendx-engine';

/**
 * 计算任意节点（Node 或 Group）的世界坐标包围盒。
 * - Node：直接调用 getWorldBBox()
 * - Group：递归收集所有子 Node 的 worldBBox，取并集
 */
export function getWorldBBox(target: Graphics): BoundingBox | null {
  // type=3 → Node，有 getWorldBBox()
  if (target.type === 3) {
    return (target as Node).getWorldBBox();
  }

  // Group / Scene / Layer → 遍历子树收集所有 Node 的 worldBBox
  let result: BoundingBox | null = null;
  target.traverse((child: Graphics) => {
    if (child.type === 3) {
      const bb = (child as Node).getWorldBBox();
      if (bb && !bb.empty) {
        result = result ? result.union(bb) : bb.copy();
      }
    }
  });
  return result;
}
