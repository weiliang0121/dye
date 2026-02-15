const {App, Node} = __rendx_engine__;
const {selectionPlugin} = __rendx_selection_plugin__;

const app = new App({width: 600, height: 400});
app.mount(container);

// ── 安装选框插件 ──
app.use(
  selectionPlugin({
    enableHover: true,
    enableMarquee: true,
  }),
);

// ── 创建一些图形节点 ──
const colors = [
  {fill: '#ff6b6b', stroke: '#c92a2a'},
  {fill: '#4dabf7', stroke: '#1c7ed6'},
  {fill: '#51cf66', stroke: '#2b8a3e'},
  {fill: '#ffd43b', stroke: '#e67700'},
  {fill: '#cc5de8', stroke: '#862e9c'},
];

// 矩形
const rect1 = Node.create('rect', {...colors[0], strokeWidth: 2});
rect1.shape.from(50, 50, 120, 80);
app.scene.add(rect1);

const rect2 = Node.create('rect', {...colors[1], strokeWidth: 2});
rect2.shape.from(220, 60, 100, 100);
app.scene.add(rect2);

const rect3 = Node.create('rect', {...colors[2], strokeWidth: 2});
rect3.shape.from(370, 40, 150, 90);
app.scene.add(rect3);

// 圆形
const circle1 = Node.create('circle', {...colors[3], strokeWidth: 2});
circle1.shape.from(120, 260, 50);
app.scene.add(circle1);

const circle2 = Node.create('circle', {...colors[4], strokeWidth: 2});
circle2.shape.from(300, 280, 60);
app.scene.add(circle2);

// 小提示文字
const hint = Node.create('text', {fill: '#999', fontSize: 13, fontFamily: 'sans-serif'});
hint.shape.from('点击选中 | Shift+点击多选 | 空白处拖拽框选 | 点击空白清空', 20, 385);
app.scene.add(hint);

app.render();

// ── 监听选中变化 ──
app.bus.on('selection:change', e => {
  console.log(`选中变更: +${e.added.length} -${e.removed.length}, 总计 ${e.selected.length} 个`);
});

app.bus.on('selection:hover-change', e => {
  const name = e.current ? e.current.shapeType || 'node' : 'none';
  console.log(`悬停: ${name}`);
});

console.log('Selection Plugin Demo — 点击/框选图形试试！');
