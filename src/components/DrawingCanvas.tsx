import { useEffect, useCallback } from 'react';
import { useDrawingCanvas } from '@/hooks/useDrawingCanvas';
import { Curve, AxisConfig, Point } from '@/types/curve';

interface DrawingCanvasProps {
  curves: Curve[];
  activeCurveId: string | null;
  axisConfig: AxisConfig;
  onUpdateCurve: (id: string, points: Point[]) => void;
}

const CANVAS_WIDTH = 800;
const CANVAS_HEIGHT = 500;
const PADDING = { top: 40, right: 40, bottom: 60, left: 80 };

export function DrawingCanvas({ 
  curves, 
  activeCurveId, 
  axisConfig, 
  onUpdateCurve 
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

  // Load existing points when switching curves
  useEffect(() => {
    if (activeCurve) {
      setPoints(activeCurve.points);
    } else {
      clearPoints();
    }
  }, [activeCurveId, setPoints, clearPoints]);

  // Save points when drawing stops
  useEffect(() => {
    if (!isDrawing && activeCurveId && points.length > 0) {
      onUpdateCurve(activeCurveId, points);
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

    // Draw all curves
    curves.forEach(curve => {
      if (curve.points.length < 2) return;
      
      ctx.strokeStyle = curve.color;
      ctx.lineWidth = curve.id === activeCurveId ? 3 : 2;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      
      ctx.beginPath();
      curve.points.forEach((point, index) => {
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

    // Draw current drawing points (if active curve)
    if (activeCurve && points.length > 0) {
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
  );
}
