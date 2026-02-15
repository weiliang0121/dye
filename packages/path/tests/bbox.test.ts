import {describe, it, expect} from 'vitest';
import {pathBBox} from '../src/main';

describe('pathBBox', () => {
  // ── 空输入 ──

  it('returns null for empty string', () => {
    expect(pathBBox('')).toBeNull();
  });

  it('returns null for null-ish input', () => {
    expect(pathBBox(undefined as unknown as string)).toBeNull();
  });

  it('returns null for string with no valid commands', () => {
    expect(pathBBox('   ')).toBeNull();
  });

  // ── MoveTo + LineTo ──

  describe('M/L commands', () => {
    it('single point (M only)', () => {
      expect(pathBBox('M10 20')).toEqual([10, 20, 10, 20]);
    });

    it('M + L line segment', () => {
      expect(pathBBox('M10 20 L100 200')).toEqual([10, 20, 100, 200]);
    });

    it('multiple L points', () => {
      expect(pathBBox('M0 0 L100 0 L100 50 L0 50 Z')).toEqual([0, 0, 100, 50]);
    });

    it('relative m + l', () => {
      expect(pathBBox('m10 20 l90 0 l0 80')).toEqual([10, 20, 100, 100]);
    });

    it('implicit LineTo after M', () => {
      // After first M pair, subsequent pairs are treated as implicit L
      expect(pathBBox('M0 0 50 50 100 0')).toEqual([0, 0, 100, 50]);
    });
  });

  // ── H / V ──

  describe('H/V commands', () => {
    it('absolute H', () => {
      expect(pathBBox('M10 10 H100')).toEqual([10, 10, 100, 10]);
    });

    it('relative h', () => {
      expect(pathBBox('M10 10 h90')).toEqual([10, 10, 100, 10]);
    });

    it('absolute V', () => {
      expect(pathBBox('M10 10 V100')).toEqual([10, 10, 10, 100]);
    });

    it('relative v', () => {
      expect(pathBBox('M10 10 v90')).toEqual([10, 10, 10, 100]);
    });
  });

  // ── Cubic Bézier (C/c) ──

  describe('C/c commands', () => {
    it('absolute C — bbox includes control points (conservative)', () => {
      // Start at (0,0), control1 (50,100), control2 (100,100), end (150,0)
      const result = pathBBox('M0 0 C50 100 100 100 150 0');
      expect(result).not.toBeNull();
      const [minX, minY, maxX, maxY] = result!;
      expect(minX).toBe(0);
      expect(minY).toBe(0);
      expect(maxX).toBe(150);
      expect(maxY).toBe(100); // control points at y=100
    });

    it('relative c', () => {
      const result = pathBBox('M10 10 c40 90 90 90 140 -10');
      expect(result).not.toBeNull();
      const [minX, minY, maxX, maxY] = result!;
      expect(minX).toBe(10);
      expect(minY).toBe(0); // end y = 10 + (-10) = 0
      expect(maxX).toBe(150); // end x = 10 + 140 = 150
      expect(maxY).toBe(100); // ctrl y = 10 + 90 = 100
    });
  });

  // ── Quadratic Bézier (Q/q) ──

  describe('Q/q commands', () => {
    it('absolute Q', () => {
      const result = pathBBox('M0 0 Q50 100 100 0');
      expect(result).not.toBeNull();
      const [minX, minY, maxX, maxY] = result!;
      expect(minX).toBe(0);
      expect(minY).toBe(0);
      expect(maxX).toBe(100);
      expect(maxY).toBe(100);
    });

    it('relative q', () => {
      const result = pathBBox('M10 10 q40 -20 80 0');
      expect(result).not.toBeNull();
      const [minX, minY, maxX, maxY] = result!;
      expect(minX).toBe(10);
      expect(minY).toBe(-10); // ctrl y = 10 + (-20) = -10
      expect(maxX).toBe(90); // end x = 10 + 80 = 90
      expect(maxY).toBe(10);
    });
  });

  // ── Smooth curves (S/s, T/t) ──

  describe('S/s/T/t commands', () => {
    it('absolute S', () => {
      const result = pathBBox('M0 0 S50 100 100 0');
      expect(result).not.toBeNull();
      expect(result![2]).toBe(100); // maxX
      expect(result![3]).toBe(100); // maxY (control at y=100)
    });

    it('absolute T', () => {
      const result = pathBBox('M0 0 T100 50');
      expect(result).not.toBeNull();
      expect(result).toEqual([0, 0, 100, 50]);
    });
  });

  // ── Arc (A/a) ──

  describe('A/a commands', () => {
    it('absolute A — conservative bbox with ±radius', () => {
      // Arc from (0,0) to (100,0) with rx=50, ry=30
      const result = pathBBox('M0 0 A50 30 0 0 1 100 0');
      expect(result).not.toBeNull();
      const [minX, minY, maxX, maxY] = result!;
      // Conservative: cx±rx, cy±ry for both start and end
      expect(minX).toBe(-50); // 0 - 50
      expect(minY).toBe(-30); // 0 - 30
      expect(maxX).toBe(150); // 100 + 50
      expect(maxY).toBe(30); // 0 + 30 (or 100's ry)
    });

    it('relative a', () => {
      const result = pathBBox('M50 50 a25 25 0 1 0 50 0');
      expect(result).not.toBeNull();
      const [minX, minY, maxX, maxY] = result!;
      expect(minX).toBe(25); // 50 - 25
      expect(minY).toBe(25); // 50 - 25
      expect(maxX).toBe(125); // (50+50) + 25
      expect(maxY).toBe(75); // 50 + 25
    });
  });

  // ── Z / z ──

  describe('Z/z command', () => {
    it('Z resets current point to subpath start', () => {
      // After Z, further commands use the M point
      expect(pathBBox('M10 10 L100 100 Z L50 50')).toEqual([10, 10, 100, 100]);
    });
  });

  // ── 复合路径 ──

  describe('complex paths', () => {
    it('rectangle path', () => {
      const d = 'M10 20 L110 20 L110 80 L10 80 Z';
      expect(pathBBox(d)).toEqual([10, 20, 110, 80]);
    });

    it('multiple subpaths', () => {
      const d = 'M0 0 L50 50 M100 100 L150 150';
      expect(pathBBox(d)).toEqual([0, 0, 150, 150]);
    });

    it('negative coordinates', () => {
      const d = 'M-50 -30 L100 200';
      expect(pathBBox(d)).toEqual([-50, -30, 100, 200]);
    });

    it('decimal coordinates', () => {
      const d = 'M0.5 1.5 L99.5 98.5';
      expect(pathBBox(d)).toEqual([0.5, 1.5, 99.5, 98.5]);
    });

    it('scientific notation', () => {
      const d = 'M1e2 2e1 L3e2 4e1';
      expect(pathBBox(d)).toEqual([100, 20, 300, 40]);
    });
  });
});
