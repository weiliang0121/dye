import type {Path} from '@dye/path';

import {createCurveStep, createCurveStepAfter, createCurveStepBefore} from './step';
import {createCurveMonotoneX, createCurveMonotoneY} from './monotone';
import {createCurveBumpX, createCurveBumpY} from './bump';
import {createCurveNatural} from './natural';
import {createCurveLinear} from './linear';

export type Curve = (path: Path, points: [number, number][], start?: boolean) => void;

export const curveMap: Record<string, Curve> = {
  linear: createCurveLinear,
  natural: createCurveNatural,
  'bump-x': createCurveBumpX,
  'bump-y': createCurveBumpY,
  'monotone-x': createCurveMonotoneX,
  'monotone-y': createCurveMonotoneY,
  step: createCurveStep,
  'step-before': createCurveStepBefore,
  'step-after': createCurveStepAfter,
};
