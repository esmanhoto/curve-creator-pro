import { useState, useCallback, useRef } from 'react';
import { Point } from '@/types/curve';

interface UseDrawingCanvasProps {
  width: number;
  height: number;
  padding: { top: number; right: number; bottom: number; left: number };
}

export function useDrawingCanvas({ width, height, padding }: UseDrawingCanvasProps) {
  const [isDrawing, setIsDrawing] = useState(false);
  const [points, setPoints] = useState<Point[]>([]);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const getCanvasPoint = useCallback((e: React.MouseEvent<HTMLCanvasElement>): Point | null => {
    const canvas = canvasRef.current;
    if (!canvas) return null;

    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    
    const x = (e.clientX - rect.left) * scaleX;
    const y = (e.clientY - rect.top) * scaleY;

    // Check if within drawing area
    if (x < padding.left || x > width - padding.right ||
        y < padding.top || y > height - padding.bottom) {
      return null;
    }

    // Normalize to 0-1 range
    const normalizedX = (x - padding.left) / (width - padding.left - padding.right);
    const normalizedY = 1 - (y - padding.top) / (height - padding.top - padding.bottom);

    return { x: normalizedX, y: normalizedY };
  }, [width, height, padding]);

  const startDrawing = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    const point = getCanvasPoint(e);
    if (point) {
      setIsDrawing(true);
      setPoints([point]);
    }
  }, [getCanvasPoint]);

  const draw = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    
    const point = getCanvasPoint(e);
    if (point) {
      setPoints(prev => {
        // Only add point if x is increasing (left to right drawing)
        const lastPoint = prev[prev.length - 1];
        if (!lastPoint || point.x > lastPoint.x) {
          return [...prev, point];
        }
        return prev;
      });
    }
  }, [isDrawing, getCanvasPoint]);

  const stopDrawing = useCallback(() => {
    setIsDrawing(false);
  }, []);

  const clearPoints = useCallback(() => {
    setPoints([]);
  }, []);

  return {
    canvasRef,
    points,
    isDrawing,
    startDrawing,
    draw,
    stopDrawing,
    clearPoints,
    setPoints,
  };
}
