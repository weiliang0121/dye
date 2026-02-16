const {App, Node} = __rendx_engine__;
const {zoomPlugin} = __rendx_zoom_plugin__;

const app = new App({width: 600, height: 400});
app.mount(container);

// ── 安装缩放插件 ──
const zoom = zoomPlugin({
  minZoom: 0.2,
  maxZoom: 5,
  zoomStep: 0.15,
  onZoomChange: e => {
    zoomText.shape.from(`Zoom: ${Math.round(e.zoom * 100)}%  Pan: (${Math.round(e.pan[0])}, ${Math.round(e.pan[1])})`, 10, 20);
    app.render();
  },
});
app.use(zoom);

// ── 创建内容 ──

// 网格参考线
for (let x = 0; x <= 600; x += 50) {
  const line = Node.create('line', {stroke: '#e0e0e0', strokeWidth: 1});
  line.shape.from(x, 0, x, 400);
  app.scene.add(line);
}
for (let y = 0; y <= 400; y += 50) {
  const line = Node.create('line', {stroke: '#e0e0e0', strokeWidth: 1});
  line.shape.from(0, y, 600, y);
  app.scene.add(line);
}

// 形状
const circle = Node.create('circle', {fill: '#ff6b6b', stroke: '#c92a2a', strokeWidth: 2});
circle.shape.from(150, 200, 50);
app.scene.add(circle);

const rect = Node.create('rect', {fill: '#4dabf7', stroke: '#1c7ed6', strokeWidth: 2});
rect.shape.from(280, 130, 120, 100);
app.scene.add(rect);

const rect2 = Node.create('rect', {fill: '#69db7c', stroke: '#2f9e44', strokeWidth: 2});
rect2.shape.from(440, 200, 80, 80);
app.scene.add(rect2);

// 缩放信息文字（固定在左上角）
const zoomText = Node.create('text', {fill: '#666', fontSize: 13, fontFamily: 'monospace'});
zoomText.shape.from('Zoom: 100%  Pan: (0, 0)', 10, 20);
app.scene.add(zoomText);

// ── 按钮容器 ──
const btnStyle = 'padding:4px 12px;margin:2px;cursor:pointer;border:1px solid #ccc;border-radius:4px;background:#fff;font-size:13px;';

const toolbar = document.createElement('div');
toolbar.style.cssText = 'position:absolute;top:30px;right:10px;display:flex;flex-direction:column;gap:4px;z-index:10;';

const btnIn = document.createElement('button');
btnIn.textContent = '放大 (+)';
btnIn.style.cssText = btnStyle;
btnIn.onclick = () => zoom.zoomIn();

const btnOut = document.createElement('button');
btnOut.textContent = '缩小 (-)';
btnOut.style.cssText = btnStyle;
btnOut.onclick = () => zoom.zoomOut();

const btnReset = document.createElement('button');
btnReset.textContent = '重置';
btnReset.style.cssText = btnStyle;
btnReset.onclick = () => zoom.reset();

const btnFit = document.createElement('button');
btnFit.textContent = '适应';
btnFit.style.cssText = btnStyle;
btnFit.onclick = () => zoom.fitView();

toolbar.append(btnIn, btnOut, btnReset, btnFit);
container.style.position = 'relative';
container.appendChild(toolbar);

app.render();

console.log('Zoom Plugin Demo');
console.log('操作方式：');
console.log('  滚轮缩放（Ctrl/⌘ + 滚轮）');
console.log('  滚轮平移（直接滚轮）');
console.log('  空格 + 拖拽平移');
console.log('  鼠标中键拖拽平移');
console.log('  右侧按钮进行缩放/重置');
