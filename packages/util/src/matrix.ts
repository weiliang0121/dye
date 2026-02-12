type Mat2d = [number, number, number, number, number, number] | Float32Array | Float64Array;

export const decomposeFromMat2d = (mat: Mat2d) => {
  const [a, b, c, d, e, f] = mat;
  const translate: [number, number] = [e, f];
  const sx = Math.sqrt(a * a + b * b) * Math.sign(a);
  const sy = Math.sqrt(c * c + d * d) * Math.sign(d);
  const scale: [number, number] = [sx, sy];
  const rotate: number = Math.atan2(b, a);
  return {translate, rotate, scale};
};
