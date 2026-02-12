import {TextShape} from './text';
import {CircleShape} from './circle';
import {RectShape} from './rect';
import {LineShape} from './line';
import {PathShape} from './path';
import {CurveShape} from './curve';
import {AreaShape} from './area';
import {PolygonShape} from './polygon';
import {SectorShape} from './sector';
import {ArcShape} from './arc';
import {SymbolShape} from './symbol';
import {RoundShape} from './round';

import {RectBufferShape} from './rect-buffer';

import type {Shape} from '../core';

const shapes: any = {
  text: TextShape,
  circle: CircleShape,
  rect: RectShape,
  line: LineShape,
  path: PathShape,
  curve: CurveShape,
  area: AreaShape,
  polygon: PolygonShape,
  sector: SectorShape,
  arc: ArcShape,
  symbol: SymbolShape,
  round: RoundShape,

  rectBuffer: RectBufferShape,
};

export const createShape = (type: string) => new shapes[type]() as Shape;
