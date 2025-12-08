import { useEffect, useCallback, useRef } from 'react';
import { useDrawingCanvas } from '@/hooks/useDrawingCanvas';
import { Curve, AxisConfig, Point } from '@/types/curve';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';

// Seeded random for consistent roughness visualization
const seededRandom = (seed: number): number => {
  const x = Math.sin(seed * 9999) * 10000;
  return x - Math.floor(x);
};

const applyRoughnessToPoints = (points: Point[], roughness: number, seed: number): Point[] => {
  if (roughness === 0 || points.length === 0) return points;
  
  // roughness is 0-100, we want 0-10% max variation
  const maxVariation = (roughness / 100) * 0.1; // 0 to 0.1 (10%)
  
  return points.map((point, index) => {
    const randomValue = seededRandom(seed + index) * 2 - 1; // -1 to 1
    const variation = randomValue * maxVariation;
    const newY = Math.max(0, Math.min(1, point.y + variation));
    return { x: point.x, y: newY };
  });
};

interface DrawingCanvasProps {
  curves: Curve[];
  activeCurveId: string | null;
  axisConfig: AxisConfig;
  onUpdateCurve: (id: string, points: Point[]) => void;
  onToggleVisibility: (id: string) => void;
}

const CANVAS_WIDTH = 800;
const CANVAS_HEIGHT = 500;
const PADDING = { top: 40, right: 40, bottom: 60, left: 80 };

export function DrawingCanvas({ 
  curves, 
  activeCurveId, 
  axisConfig, 
  onUpdateCurve,
  onToggleVisibility,
}: DrawingCanvasProps) {
  const {
    canvasRef,
    points,
    isDrawing,
    startDrawing,
    draw,
    stopDrawing,
    clearPoints,
    setPoints,
  } = useDrawingCanvas({
    width: CANVAS_WIDTH,
    height: CANVAS_HEIGHT,
    padding: PADDING,
  });

  const activeCurve = curves.find(c => c.id === activeCurveId);

  // Track previous curve ID to detect switches
  const prevCurveIdRef = useRef<string | null>(null);

  // Load existing points when switching curves - only if the curve has points
  useEffect(() => {
    const isSwitchingCurves = prevCurveIdRef.current !== activeCurveId;
    prevCurveIdRef.current = activeCurveId;
    
    if (isSwitchingCurves) {
      if (activeCurve && activeCurve.points.length > 0) {
        setPoints(activeCurve.points);
      } else {
        clearPoints();
      }
    }
  }, [activeCurveId, activeCurve, setPoints, clearPoints]);

  // Save points when drawing stops - but not during curve switches
  const lastSavedRef = useRef<{ id: string; length: number } | null>(null);
  
  useEffect(() => {
    if (!isDrawing && activeCurveId && points.length > 0) {
      // Only save if this is new drawing, not a curve switch load
      const alreadySaved = lastSavedRef.current?.id === activeCurveId && 
                           lastSavedRef.current?.length === points.length;
      if (!alreadySaved) {
        lastSavedRef.current = { id: activeCurveId, length: points.length };
        onUpdateCurve(activeCurveId, points);
      }
    }
  }, [isDrawing, activeCurveId, points, onUpdateCurve]);

  const drawCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const drawWidth = CANVAS_WIDTH - PADDING.left - PADDING.right;
    const drawHeight = CANVAS_HEIGHT - PADDING.top - PADDING.bottom;

    // Clear canvas
    ctx.fillStyle = 'hsl(220, 15%, 6%)';
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    // Draw grid
    ctx.strokeStyle = 'hsl(220, 15%, 18%)';
    ctx.lineWidth = 1;

    // Vertical grid lines (6 months)
    for (let i = 0; i <= 6; i++) {
      const x = PADDING.left + (i / 6) * drawWidth;
      ctx.beginPath();
      ctx.moveTo(x, PADDING.top);
      ctx.lineTo(x, CANVAS_HEIGHT - PADDING.bottom);
      ctx.stroke();
    }

    // Horizontal grid lines
    const ySteps = 5;
    for (let i = 0; i <= ySteps; i++) {
      const y = PADDING.top + (i / ySteps) * drawHeight;
      ctx.beginPath();
      ctx.moveTo(PADDING.left, y);
      ctx.lineTo(CANVAS_WIDTH - PADDING.right, y);
      ctx.stroke();
    }

    // Draw axes
    ctx.strokeStyle = 'hsl(215, 15%, 55%)';
    ctx.lineWidth = 2;

    // Y axis
    ctx.beginPath();
    ctx.moveTo(PADDING.left, PADDING.top);
    ctx.lineTo(PADDING.left, CANVAS_HEIGHT - PADDING.bottom);
    ctx.stroke();

    // X axis
    ctx.beginPath();
    ctx.moveTo(PADDING.left, CANVAS_HEIGHT - PADDING.bottom);
    ctx.lineTo(CANVAS_WIDTH - PADDING.right, CANVAS_HEIGHT - PADDING.bottom);
    ctx.stroke();

    // Draw labels
    ctx.fillStyle = 'hsl(215, 15%, 55%)';
    ctx.font = '12px "JetBrains Mono", monospace';
    ctx.textAlign = 'right';

    // Y axis labels
    for (let i = 0; i <= ySteps; i++) {
      const y = PADDING.top + (i / ySteps) * drawHeight;
      const value = axisConfig.yMax - (i / ySteps) * (axisConfig.yMax - axisConfig.yMin);
      ctx.fillText(value.toFixed(0), PADDING.left - 10, y + 4);
    }

    // X axis labels (months)
    ctx.textAlign = 'center';
    const months = ['M1', 'M2', 'M3', 'M4', 'M5', 'M6'];
    for (let i = 0; i < 6; i++) {
      const x = PADDING.left + ((i + 0.5) / 6) * drawWidth;
      ctx.fillText(months[i], x, CANVAS_HEIGHT - PADDING.bottom + 25);
    }

    // Draw only visible curves with roughness applied
    curves.forEach(curve => {
      if (!curve.visible || curve.points.length < 2) return;
      
      // Apply roughness to the curve points for visualization
      const displayPoints = applyRoughnessToPoints(curve.points, curve.roughness, curve.id.charCodeAt(0));
      
      ctx.strokeStyle = curve.color;
      ctx.lineWidth = curve.id === activeCurveId ? 3 : 2;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      
      ctx.beginPath();
      displayPoints.forEach((point, index) => {
        const x = PADDING.left + point.x * drawWidth;
        const y = PADDING.top + (1 - point.y) * drawHeight;
        
        if (index === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }
      });
      ctx.stroke();
    });

    // Draw current drawing points (if active curve is visible)
    if (activeCurve && activeCurve.visible && points.length > 0) {
      ctx.strokeStyle = activeCurve.color;
      ctx.lineWidth = 3;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      
      ctx.beginPath();
      points.forEach((point, index) => {
        const x = PADDING.left + point.x * drawWidth;
        const y = PADDING.top + (1 - point.y) * drawHeight;
        
        if (index === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }
      });
      ctx.stroke();
    }

    // Draw instruction if no active curve
    if (!activeCurveId) {
      ctx.fillStyle = 'hsl(215, 15%, 45%)';
      ctx.font = '14px "Inter", sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('Select or add a curve to start drawing', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2);
    }

  }, [canvasRef, curves, points, activeCurveId, activeCurve, axisConfig]);

  useEffect(() => {
    drawCanvas();
  }, [drawCanvas]);

  return (
    <div className="space-y-3">
      {/* Curve visibility toggles */}
      <div className="flex flex-wrap gap-4">
        {curves.map(curve => (
          <div key={curve.id} className="flex items-center gap-2">
            <Checkbox
              id={`visibility-${curve.id}`}
              checked={curve.visible}
              onCheckedChange={() => onToggleVisibility(curve.id)}
            />
            <Label 
              htmlFor={`visibility-${curve.id}`}
              className="text-sm cursor-pointer flex items-center gap-2"
            >
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: curve.color }}
              />
              {curve.name}
            </Label>
          </div>
        ))}
      </div>

      <canvas
        ref={canvasRef}
        width={CANVAS_WIDTH}
        height={CANVAS_HEIGHT}
        className="w-full max-w-[800px] rounded-lg border border-border cursor-crosshair"
        onMouseDown={activeCurveId ? startDrawing : undefined}
        onMouseMove={activeCurveId ? draw : undefined}
        onMouseUp={activeCurveId ? stopDrawing : undefined}
        onMouseLeave={activeCurveId ? stopDrawing : undefined}
      />
    </div>
  );
}
