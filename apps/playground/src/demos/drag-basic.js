const {App, Node} = __rendx_engine__;
const {dragPlugin} = __rendx_drag_plugin__;

const app = new App({width: 600, height: 400});
app.mount(container);

// ── 安装拖拽插件（纯 engine，无其他插件依赖） ──
app.use(
  dragPlugin({
    threshold: 3,
    cursor: 'grabbing',
    constraint: {
      bounds: {minX: 0, minY: 0, maxX: 600, maxY: 400},
    },
  }),
);

// ── 创建可拖拽的图形 ──

const colors = ['#ff6b6b', '#4dabf7', '#51cf66', '#ffd43b', '#cc5de8'];
const shapes = ['circle', 'rect', 'round'];

for (let i = 0; i < 5; i++) {
  const x = 60 + i * 110;
  const y = 160;

  if (i < 2) {
    // 圆形
    const circle = Node.create('circle', {
      fill: colors[i],
      stroke: '#333',
      strokeWidth: 2,
    });
    circle.shape.from(0, 0, 30);
    circle.translate(x, y);
    circle.setName('circle-' + i);
    app.scene.add(circle);
  } else if (i < 4) {
    // 矩形
    const rect = Node.create('rect', {
      fill: colors[i],
      stroke: '#333',
      strokeWidth: 2,
    });
    rect.shape.from(-40, -25, 80, 50);
    rect.translate(x, y);
    rect.setName('rect-' + (i - 2));
    app.scene.add(rect);
  } else {
    // 圆角矩形
    const round = Node.create('round', {
      fill: colors[i],
      stroke: '#333',
      strokeWidth: 2,
    });
    round.shape.from(-35, -30, 70, 60);
    round.shape.options(10, 10);
    round.translate(x, y);
    round.setName('round-0');
    app.scene.add(round);
  }
}

// ── 监听拖拽事件 ──

app.bus.on('drag:start', e => {
  console.log(`🔵 开始拖拽: ${e.targets.map(t => t.name).join(', ')}`);
});

app.bus.on('drag:end', e => {
  const delta = e.totalDelta.map(v => Math.round(v));
  console.log(`🟢 拖拽结束: 移动 (${delta[0]}, ${delta[1]})`);
});

app.bus.on('drag:cancel', e => {
  console.log(`🔴 拖拽取消: ${e.targets.map(t => t.name).join(', ')} — 位置已回滚`);
});

// ── 提示文字 ──

const hint = Node.create('text', {fill: '#666', fontSize: 13, fontFamily: 'sans-serif'});
hint.shape.from('拖拽图形移动 | 按 Escape 取消拖拽并回滚 | 不可超出画布边界', 60, 30);
app.scene.add(hint);

const hint2 = Node.create('text', {fill: '#999', fontSize: 12, fontFamily: 'sans-serif'});
hint2.shape.from('纯 engine 场景 — 无 graph-plugin / selection-plugin', 60, 55);
app.scene.add(hint2);

app.render();
console.log('Drag Plugin Basic — 纯 engine 场景，直接拖拽 Node，带边界约束');
