# @vis/path

## 0.2.0

### Minor Changes

- [`f1cb892`](https://github.com/weiliang0121/rendx/commit/f1cb892ad9f30e7760b804e886718f15bbdff51f) - feat(path): 新增 `pathBBox(d)` 函数，从 SVG path d 字符串解析轴对齐包围盒 (AABB)
  - 支持所有 SVG 路径命令：M/m, L/l, H/h, V/v, C/c, Q/q, S/s, T/t, A/a, Z/z
  - 贝塞尔曲线使用控制点凸包（保守上界），弧线使用 ±半径
  - 空路径返回 null
  - 新增 bbox.test.ts 测试覆盖（20 个用例）

## 0.1.1

### Patch Changes

- [`c100f35`](https://github.com/weiliang0121/rendx/commit/c100f3508027b5dc8ca97a07276801b34d1a1c62) - 补全单元测试覆盖，新增各包测试文件，覆盖核心 API 和主要功能路径；修复 rendx-dom 缺失 tsconfig.json 导致的 DTS 构建错误

## 0.1.0

### Minor Changes

- [`cc65501`](https://github.com/weiliang0121/rendx/commit/cc6550104e620d584321faaa05e7b92cd30cf00c) - 发布第一个正式版本

## 0.0.1

### Patch Changes

- 03f0d74: 发布准备：
  - 所有包添加 license、description、repository、homepage、keywords 元数据
  - 添加 MIT LICENSE 文件
  - 更新 README.md（完整架构图、快速上手、徽章）
  - 添加 GitHub Actions CI/CD 及 GitHub Pages 部署工作流

## 0.0.3

### Patch Changes

- 1.更新工作流程后的一次工程更新

## 0.0.2

### Patch Changes

- 更新package.json配置项
