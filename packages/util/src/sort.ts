export const swap = (arr: number[], i: number, j: number): void => {
  [arr[i], arr[j]] = [arr[j], arr[i]];
};

// 霍尔分区法(Hoare Partition Scheme)
// 特点：通常比洛穆托分区执行更少的交换，但不能确定基准元素的最终位置
export const HPS = (arr: number[], l: number, r: number): number => {
  const x = arr[l];
  let i = l - 1;
  let j = r + 1;
  while (i < j) {
    do i++;
    while (arr[i] < x);
    do j--;
    while (arr[j] > x);
    if (i < j) swap(arr, i, j);
  }
  return j;
};

// 洛穆托分区法(Lomuto Partition Scheme)
// 特点：实现简单，能确定基准元素的最终位置
export const LPS = (arr: number[], l: number, r: number): number => {
  const pivot = arr[r];
  let i = l - 1;
  for (let j = l; j < r; ++j) if (arr[j] < pivot) swap(arr, ++i, j);
  swap(arr, i + 1, r);
  return i + 1;
};

// 基于洛穆托分区的快速排序
export const quickSort = (arr: number[]): number[] => {
  const sort = (l: number, r: number) => {
    if (l >= r) return;
    const p = LPS(arr, l, r);
    sort(l, p - 1);
    sort(p + 1, r);
  };
  if (arr.length > 1) sort(0, arr.length - 1);
  return arr;
};

// 基于霍尔分区的快速排序
export const quickSortHoare = (arr: number[]): number[] => {
  const sort = (l: number, r: number) => {
    if (l >= r) return;
    const p = HPS(arr, l, r);
    // 注意：霍尔分区需要对[l, p]和[p+1, r]进行递归
    sort(l, p);
    sort(p + 1, r);
  };
  if (arr.length > 1) sort(0, arr.length - 1);
  return arr;
};

// 基于洛穆托分区的快速选择
export const quickSelect = (arr: number[], k: number): number => {
  const select = (l: number, r: number): number => {
    if (l === r) return arr[l];
    const p = LPS(arr, l, r);
    if (k === p) return arr[p];
    if (k < p) return select(l, p - 1);
    return select(p + 1, r);
  };
  return select(0, arr.length - 1);
};

// 基于霍尔分区的快速选择
export const quickSelectHoare = (arr: number[], k: number): number => {
  const select = (l: number, r: number): number => {
    if (l === r) return arr[l];
    const p = HPS(arr, l, r);

    // 霍尔分区中，p位置可能不是基准元素
    // 但p右侧的元素都大于等于基准，p及左侧的元素都小于等于基准
    if (k <= p) return select(l, p);
    else return select(p + 1, r);
  };
  return select(0, arr.length - 1);
};

// 使用随机基准点的洛穆托分区法
export const randomizedLPS = (arr: number[], l: number, r: number): number => {
  // 随机选择一个基准，并与末尾元素交换
  const randomPivotIndex = l + Math.floor(Math.random() * (r - l + 1));
  swap(arr, randomPivotIndex, r);

  // 执行标准洛穆托分区
  return LPS(arr, l, r);
};

// 使用随机基准点的霍尔分区法
export const randomizedHPS = (arr: number[], l: number, r: number): number => {
  // 随机选择一个基准，并与首位元素交换
  const randomPivotIndex = l + Math.floor(Math.random() * (r - l + 1));
  swap(arr, randomPivotIndex, l);

  // 执行标准霍尔分区
  return HPS(arr, l, r);
};
