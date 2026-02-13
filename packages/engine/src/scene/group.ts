import {Graphics} from '../core';

/** 分组容器节点（type=2），不可渲染，用于组织场景图层级 */
export class Group extends Graphics {
  type: number = 2;
}
