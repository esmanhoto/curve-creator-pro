export interface Point {
  x: number;
  y: number;
}

export interface Curve {
  id: string;
  name: string;
  points: Point[];
  color: string;
}

export interface AxisConfig {
  yMin: number;
  yMax: number;
}

export const CURVE_COLORS = [
  'hsl(175, 70%, 50%)',   // cyan
  'hsl(280, 70%, 60%)',   // purple
  'hsl(35, 90%, 55%)',    // orange
  'hsl(340, 70%, 55%)',   // pink
  'hsl(140, 60%, 50%)',   // green
];
