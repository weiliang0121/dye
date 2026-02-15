const {App, Node, Group} = __rendx_engine__;

// ── 太阳-地球-月亮 轨道运动 ──
// 演示场景图层级变换（hierarchical transform）的威力：
// 月亮只需要关心自己绕地球的旋转，地球只关心自己绕太阳的旋转，
// 引擎通过 worldMatrix 矩阵链自动计算每个天体在屏幕上的最终位置。
//
// 场景图结构:
//   solarSystem (Group @ 画布中心)
//     ├── 太阳轨道环 (虚线)
//     ├── 太阳光晕 + 太阳
//     ├── 月球轨迹路径 (path)
//     └── earthOrbit (Group, 绕太阳旋转)
//           └── earthArm (Group, 平移到轨道半径)
//                 ├── 地球轨道环 (虚线)
//                 ├── 地球
//                 └── moonOrbit (Group, 绕地球旋转)
//                       └── moonArm (Group, 平移到月球轨道半径)
//                             └── 月球

const W = 800,
  H = 600;
const CX = W / 2,
  CY = H / 2;

// ── 轨道参数 ──
const EARTH_R = 180; // 地球轨道半径
const MOON_R = 52; // 月球轨道半径
const EARTH_PERIOD = 15000; // 地球公转周期 (ms)
const MOON_PERIOD = 1900; // 月球公转周期 (ms)，约 8 倍速
const TRAIL_MAX = 800; // 轨迹最大采样点数

const app = new App({width: W, height: H});
app.mount(container);

// ═══════════════════════════════════════════════
// 场景图构建
// ═══════════════════════════════════════════════

const solarSystem = new Group();
solarSystem.setName('solar-system');
solarSystem.translate(CX, CY);

// ── 深色背景 ──
const bg = Node.create('rect', {fill: '#0d1117'});
bg.shape.from(-CX, -CY, W, H);
bg.z = -100;
solarSystem.add(bg);

// ── 背景星空 ──
for (let i = 0; i < 200; i++) {
  const x = (Math.random() - 0.5) * W;
  const y = (Math.random() - 0.5) * H;
  const r = 0.3 + Math.random() * 1.2;
  const alpha = 0.3 + Math.random() * 0.5;
  const star = Node.create('circle', {fill: `rgba(255,255,255,${alpha})`});
  star.shape.from(x, y, r);
  star.z = -10;
  solarSystem.add(star);
}

// ── 地球轨道环 (虚线) ──
const earthOrbitRing = Node.create('circle', {
  fill: 'none',
  stroke: 'rgba(100, 160, 255, 0.15)',
  strokeWidth: 1,
  strokeDasharray: '6,4',
});
earthOrbitRing.shape.from(0, 0, EARTH_R);
earthOrbitRing.z = -1;
solarSystem.add(earthOrbitRing);

// ── 太阳 ──
const sunGlow2 = Node.create('circle', {fill: 'rgba(255, 200, 50, 0.06)'});
sunGlow2.shape.from(0, 0, 60);
sunGlow2.z = 1;
solarSystem.add(sunGlow2);

const sunGlow = Node.create('circle', {fill: 'rgba(255, 215, 0, 0.12)'});
sunGlow.shape.from(0, 0, 42);
sunGlow.z = 2;
solarSystem.add(sunGlow);

const sun = Node.create('circle', {fill: '#FFD700', stroke: '#FFA500', strokeWidth: 2});
sun.shape.from(0, 0, 28);
sun.z = 3;
solarSystem.add(sun);

// ── 月球轨迹 (path, 在 solarSystem 坐标系下) ──
const trailNode = Node.create('path', {
  fill: 'none',
  stroke: 'rgba(200, 200, 220, 0.35)',
  strokeWidth: 1,
});
trailNode.shape.from('');
trailNode.z = -2;
solarSystem.add(trailNode);

// ── 地球轨道组 (旋转) ──
const earthOrbit = new Group();
earthOrbit.setName('earth-orbit');
solarSystem.add(earthOrbit);

// ── 地球臂 (平移到轨道位置) ──
const earthArm = new Group();
earthArm.setName('earth-arm');
earthArm.translate(EARTH_R, 0);
earthOrbit.add(earthArm);

// 月球轨道环 (绕地球)
const moonOrbitRing = Node.create('circle', {
  fill: 'none',
  stroke: 'rgba(180, 180, 200, 0.2)',
  strokeWidth: 1,
  strokeDasharray: '3,3',
});
moonOrbitRing.shape.from(0, 0, MOON_R);
earthArm.add(moonOrbitRing);

// 地球
const earth = Node.create('circle', {fill: '#4dabf7', stroke: '#1c7ed6', strokeWidth: 2});
earth.shape.from(0, 0, 13);
earth.z = 5;
earthArm.add(earth);

// ── 月球轨道组 (旋转) ──
const moonOrbit = new Group();
moonOrbit.setName('moon-orbit');
earthArm.add(moonOrbit);

// ── 月球臂 (平移到月球轨道位置) ──
const moonArm = new Group();
moonArm.setName('moon-arm');
moonArm.translate(MOON_R, 0);
moonOrbit.add(moonArm);

// 月球
const moon = Node.create('circle', {fill: '#e9ecef', stroke: '#adb5bd', strokeWidth: 1.5});
moon.shape.from(0, 0, 5);
moon.z = 5;
moonArm.add(moon);

// 添加到场景
app.scene.add(solarSystem);

// ═══════════════════════════════════════════════
// 信息面板 (左上角)
// ═══════════════════════════════════════════════

const infoGroup = new Group();
infoGroup.setName('info-panel');
infoGroup.translate(-CX + 16, -CY + 16);
infoGroup.z = 100;

const infoBg = Node.create('round', {fill: 'rgba(0,0,0,0.5)', stroke: 'rgba(255,255,255,0.1)', strokeWidth: 1});
infoBg.shape.from(0, 0, 220, 118);
infoBg.shape.options(6, 6);
infoGroup.add(infoBg);

const titleText = Node.create('text', {fill: '#fff', fontSize: 13, fontWeight: 'bold', fontFamily: 'sans-serif'});
titleText.shape.from('🪐 Solar System — Scene Graph', 12, 22);
infoGroup.add(titleText);

const descLines = ['earthOrbit.rotate(θ)  → 地球公转', 'moonOrbit.rotate(φ)   → 月球公转', 'worldMatrix 自动传播全局位置', '月球轨迹: 通过 worldMatrix 采样'];
descLines.forEach((line, i) => {
  const t = Node.create('text', {fill: 'rgba(255,255,255,0.7)', fontSize: 10, fontFamily: 'monospace'});
  t.shape.from(line, 12, 44 + i * 18);
  infoGroup.add(t);
});

solarSystem.add(infoGroup);

// ═══════════════════════════════════════════════
// 场景图结构可视化 (右下角)
// ═══════════════════════════════════════════════

const treeGroup = new Group();
treeGroup.setName('tree-panel');
treeGroup.translate(CX - 276, CY - 148);
treeGroup.z = 100;

const treeBg = Node.create('round', {fill: 'rgba(0,0,0,0.55)', stroke: 'rgba(255,255,255,0.1)', strokeWidth: 1});
treeBg.shape.from(0, 0, 260, 132);
treeBg.shape.options(6, 6);
treeGroup.add(treeBg);

const treeTitle = Node.create('text', {fill: '#fff', fontSize: 11, fontWeight: 'bold', fontFamily: 'sans-serif'});
treeTitle.shape.from('Scene Graph Tree', 12, 18);
treeGroup.add(treeTitle);

const treeLines = [
  '└─ solarSystem (translate)',
  '    ├─ ☀ Sun',
  '    ├─ earthOrbit (rotate θ)',
  '    │   └─ earthArm (translate R)',
  '    │       ├─ 🌍 Earth',
  '    │       └─ moonOrbit (rotate φ)',
  '    │           └─ moonArm (translate r)',
  '    │               └─ 🌙 Moon',
];
treeLines.forEach((line, i) => {
  const t = Node.create('text', {
    fill: i === 2 ? '#ffd43b' : i === 5 ? '#69db7c' : 'rgba(255,255,255,0.6)',
    fontSize: 9,
    fontFamily: 'monospace',
  });
  t.shape.from(line, 12, 36 + i * 12);
  treeGroup.add(t);
});

solarSystem.add(treeGroup);

// ═══════════════════════════════════════════════
// 动画：使用引擎的 Transform 动画系统
// ═══════════════════════════════════════════════
//
// 引擎渲染循环 (requestRender):
//   #frame(time)
//     → scene.tick(time)        递归调用所有 Graphics.tick()
//       → transform.interpolate(time)  插值动画
//       → this.rotate(angle)           设置旋转 + 标记 needUpdate
//     → layer.sign()            检测脏标记（递归查找 needUpdate）
//     → layer.draw()            update()→计算所有 worldMatrix→renderer.draw()
//     → anyDirty → 继续下一帧
//
// 我们只需:
//   1. useTransform() 配置旋转动画
//   2. requestRender() 启动循环
//   引擎自行管理 rAF、tick 插值、脏检查、矩阵传播、绘制

// 地球公转: 0 → 2π, 线性, 无限循环
earthOrbit.useTransform();
earthOrbit.transform
  .rotate(Math.PI * 2)
  .duration(EARTH_PERIOD)
  .easing('linear')
  .repeat(true);

// 月球公转: 0 → 2π, 线性, 无限循环
moonOrbit.useTransform();
moonOrbit.transform
  .rotate(Math.PI * 2)
  .duration(MOON_PERIOD)
  .easing('linear')
  .repeat(true);

// ── 月球轨迹采样 ──
// 利用 tick() 扩展: 在每帧 tick 阶段读取 moon.worldMatrix
// 此时 worldMatrix 是上一帧 draw() → update() 计算好的值（延迟 1 帧，不可察觉）
const trail = [];
let _fc = 0;
const _origTick = moon.tick.bind(moon);
moon.tick = function (time) {
  // 跳过第一帧（worldMatrix 尚未由 draw 计算过）
  _fc++;
  if (_fc > 1 && _fc % 2 === 0) {
    // worldMatrix = [a, b, c, d, tx, ty], tx/ty = 全局屏幕坐标
    const gx = moon.worldMatrix[4] - CX;
    const gy = moon.worldMatrix[5] - CY;
    trail.push(gx, gy);
    if (trail.length > TRAIL_MAX * 2) trail.splice(0, 2);

    if (trail.length >= 4) {
      let d = `M${trail[0].toFixed(1)},${trail[1].toFixed(1)}`;
      for (let i = 2; i < trail.length; i += 2) {
        d += ` L${trail[i].toFixed(1)},${trail[i + 1].toFixed(1)}`;
      }
      trailNode.shape.from(d);
    }
  }
  _origTick(time);
};

// 初始渲染一帧（让 worldMatrix 有初始值）
app.render();

// 启动动画循环 — 引擎自动管理 rAF
app.requestRender();

console.log('🪐 Solar System demo running');
console.log('场景图层级: solarSystem → earthOrbit(rotate) → earthArm(translate) → moonOrbit(rotate) → moonArm(translate) → Moon');
console.log('动画由 useTransform() + requestRender() 驱动，引擎自行管理帧循环');
console.log('月球轨迹: tick() 中读取 moon.worldMatrix 采样全局坐标');
