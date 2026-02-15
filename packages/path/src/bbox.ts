/**
 * 从 SVG path `d` 字符串中解析所有坐标点，计算轴对齐包围盒 (AABB)。
 *
 * 支持的命令：M/m、L/l、H/h、V/v、C/c、Q/q、A/a、Z/z
 * 对于贝塞尔曲线，包含控制点在内的保守包围盒（不做精确曲线求解，
 * 控制点保证凸包包含曲线，作为 AABB 的上界已经足够紧凑）。
 *
 * @returns `[minX, minY, maxX, maxY]`，空路径返回 `null`
 */
export function pathBBox(d: string): [number, number, number, number] | null {
  if (!d) return null;

  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;
  let hasPoint = false;

  // 当前点（绝对坐标）
  let cx = 0;
  let cy = 0;
  // 每个子路径的起始点（Z 回到这里）
  let mx = 0;
  let my = 0;

  const mark = (x: number, y: number) => {
    if (x < minX) minX = x;
    if (x > maxX) maxX = x;
    if (y < minY) minY = y;
    if (y > maxY) maxY = y;
    hasPoint = true;
  };

  // ── 词法分析：拆分命令 + 数值 ──
  // 匹配命令字母 或 数值（含负号、小数点、科学计数法）
  const tokens = d.match(/[a-zA-Z]|[-+]?(?:\d+\.?\d*|\.\d+)(?:[eE][-+]?\d+)?/g);
  if (!tokens) return null;

  let i = 0;

  const num = (): number => {
    if (i >= tokens.length) return 0;
    return parseFloat(tokens[i++]);
  };

  /** 测试下一个 token 是否为数值（而非命令字母） */
  const isNum = (): boolean => {
    if (i >= tokens.length) return false;
    const t = tokens[i];
    return t !== '' && !/^[a-zA-Z]$/.test(t);
  };

  while (i < tokens.length) {
    const cmd = tokens[i++];

    switch (cmd) {
      // ── MoveTo ──
      case 'M':
        cx = num();
        cy = num();
        mx = cx;
        my = cy;
        mark(cx, cy);
        // 后续隐含 LineTo（绝对）
        while (isNum()) {
          cx = num();
          cy = num();
          mark(cx, cy);
        }
        break;

      case 'm':
        cx += num();
        cy += num();
        mx = cx;
        my = cy;
        mark(cx, cy);
        while (isNum()) {
          cx += num();
          cy += num();
          mark(cx, cy);
        }
        break;

      // ── LineTo ──
      case 'L':
        while (isNum()) {
          cx = num();
          cy = num();
          mark(cx, cy);
        }
        break;
      case 'l':
        while (isNum()) {
          cx += num();
          cy += num();
          mark(cx, cy);
        }
        break;

      // ── Horizontal LineTo ──
      case 'H':
        while (isNum()) {
          cx = num();
          mark(cx, cy);
        }
        break;
      case 'h':
        while (isNum()) {
          cx += num();
          mark(cx, cy);
        }
        break;

      // ── Vertical LineTo ──
      case 'V':
        while (isNum()) {
          cy = num();
          mark(cx, cy);
        }
        break;
      case 'v':
        while (isNum()) {
          cy += num();
          mark(cx, cy);
        }
        break;

      // ── Cubic Bézier ──
      case 'C':
        while (isNum()) {
          const x1 = num(),
            y1 = num();
          const x2 = num(),
            y2 = num();
          const x = num(),
            y = num();
          mark(x1, y1);
          mark(x2, y2);
          mark(x, y);
          cx = x;
          cy = y;
        }
        break;
      case 'c':
        while (isNum()) {
          const x1 = cx + num(),
            y1 = cy + num();
          const x2 = cx + num(),
            y2 = cy + num();
          const x = cx + num(),
            y = cy + num();
          mark(x1, y1);
          mark(x2, y2);
          mark(x, y);
          cx = x;
          cy = y;
        }
        break;

      // ── Quadratic Bézier ──
      case 'Q':
        while (isNum()) {
          const x1 = num(),
            y1 = num();
          const x = num(),
            y = num();
          mark(x1, y1);
          mark(x, y);
          cx = x;
          cy = y;
        }
        break;
      case 'q':
        while (isNum()) {
          const x1 = cx + num(),
            y1 = cy + num();
          const x = cx + num(),
            y = cy + num();
          mark(x1, y1);
          mark(x, y);
          cx = x;
          cy = y;
        }
        break;

      // ── Smooth Cubic Bézier ──
      case 'S':
        while (isNum()) {
          const x2 = num(),
            y2 = num();
          const x = num(),
            y = num();
          mark(x2, y2);
          mark(x, y);
          cx = x;
          cy = y;
        }
        break;
      case 's':
        while (isNum()) {
          const x2 = cx + num(),
            y2 = cy + num();
          const x = cx + num(),
            y = cy + num();
          mark(x2, y2);
          mark(x, y);
          cx = x;
          cy = y;
        }
        break;

      // ── Smooth Quadratic Bézier ──
      case 'T':
        while (isNum()) {
          cx = num();
          cy = num();
          mark(cx, cy);
        }
        break;
      case 't':
        while (isNum()) {
          cx += num();
          cy += num();
          mark(cx, cy);
        }
        break;

      // ── Arc ──
      case 'A':
        while (isNum()) {
          const rx = num(),
            ry = num();
          num(); // rotation
          num(); // large-arc
          num(); // sweep
          const x = num(),
            y = num();
          // 保守包围盒：当前点 + 终点 ± 半径
          mark(cx - rx, cy - ry);
          mark(cx + rx, cy + ry);
          mark(x - rx, y - ry);
          mark(x + rx, y + ry);
          cx = x;
          cy = y;
        }
        break;
      case 'a':
        while (isNum()) {
          const rx = num(),
            ry = num();
          num(); // rotation
          num(); // large-arc
          num(); // sweep
          const x = cx + num(),
            y = cy + num();
          mark(cx - rx, cy - ry);
          mark(cx + rx, cy + ry);
          mark(x - rx, y - ry);
          mark(x + rx, y + ry);
          cx = x;
          cy = y;
        }
        break;

      // ── ClosePath ──
      case 'Z':
      case 'z':
        cx = mx;
        cy = my;
        break;
    }
  }

  return hasPoint ? [minX, minY, maxX, maxY] : null;
}
