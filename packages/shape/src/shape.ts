import type {Path} from '@dye/path';

import {createLine, LineOptions, createSegmentLine, SegmentLineOptions} from './line';
import {createArea, AreaOptions, createSegmentArea, SegmentAreaOptions} from './area';
import {createArc, ArcOptions} from './arc';
import {createCircle, CircleOptions} from './circle';
import {createRect, RectOptions} from './rect';
import {createSector, SectorOptions} from './sector';
import {createBoxX, createBoxY, BoxXOptions, BoxYOptions} from './box';

interface ShapeOptionsMap {
  circle: CircleOptions;
  line: LineOptions;
  area: AreaOptions;
  rect: RectOptions;
  segmentLine: SegmentLineOptions;
  segmentArea: SegmentAreaOptions;
  sector: SectorOptions;
  arc: ArcOptions;
  boxX: BoxXOptions;
  boxY: BoxYOptions;
}
type shapeTypes = keyof ShapeOptionsMap;
type ShapeOptions = ShapeOptionsMap[shapeTypes];

export const createShape = (path: Path, type: shapeTypes, options: ShapeOptions) => {
  if (type === 'circle') createCircle(path, options as CircleOptions);
  else if (type === 'line') createLine(path, options as LineOptions);
  else if (type === 'area') createArea(path, options as AreaOptions);
  else if (type === 'rect') createRect(path, options as RectOptions);
  else if (type === 'segmentLine') createSegmentLine(path, options as SegmentLineOptions);
  else if (type === 'segmentArea') createSegmentArea(path, options as SegmentAreaOptions);
  else if (type === 'sector') createSector(path, options as SectorOptions);
  else if (type === 'arc') createArc(path, options as ArcOptions);
  else if (type === 'boxX') createBoxX(path, options as BoxXOptions);
  else if (type === 'boxY') createBoxY(path, options as BoxYOptions);
  else throw new Error(`Unknown shape type: ${type}`);
};
