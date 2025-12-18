import * as XLSX from 'xlsx';
import { Curve, AxisConfig } from '@/types/curve';
import { addMonths, format, eachDayOfInterval, endOfDay } from 'date-fns';

function interpolateValue(points: { x: number; y: number }[], x: number): number | null {
  if (points.length === 0) return null;
  if (points.length === 1) {
    // Only return value if x is very close to the single point
    return Math.abs(x - points[0].x) < 0.01 ? points[0].y : null;
  }

  // Check if x is within the drawn range
  const minX = points[0].x;
  const maxX = points[points.length - 1].x;
  
  if (x < minX || x > maxX) {
    return null; // Outside drawn range = empty
  }

  // Find surrounding points
  let left = points[0];
  let right = points[points.length - 1];

  for (let i = 0; i < points.length - 1; i++) {
    if (points[i].x <= x && points[i + 1].x >= x) {
      left = points[i];
      right = points[i + 1];
      break;
    }
  }

  // Linear interpolation
  if (right.x === left.x) return left.y;
  const t = (x - left.x) / (right.x - left.x);
  return left.y + t * (right.y - left.y);
}

// Seeded random for consistent roughness across exports
function seededRandom(seed: number): number {
  const x = Math.sin(seed * 9999) * 10000;
  return x - Math.floor(x);
}

function applyRoughness(value: number, roughness: number, seed: number, yRange: number): number {
  if (roughness === 0) return value;
  
  // Roughness creates random variation: 0-100 slider maps to 0-10% of y-range
  const maxVariation = (roughness / 100) * 0.1 * yRange; // Max 10% of range at full roughness
  const variation = (seededRandom(seed) - 0.5) * 2 * maxVariation;
  
  return value + variation;
}

export function exportToExcel(curves: Curve[], axisConfig: AxisConfig, startDate: Date) {
  // Generate 6 months of dates starting from startDate
  const endDate = addMonths(startDate, 6);
  endDate.setDate(endDate.getDate() - 1); // End on the last day of the 6th month
  
  const dates = eachDayOfInterval({
    start: startDate,
    end: endOfDay(endDate)
  });

  const totalDays = dates.length;

  const yRange = axisConfig.yMax - axisConfig.yMin;

  // Create data rows
  const data = dates.map((date, index) => {
    const row: Record<string, string | number> = {
      Date: format(date, 'yyyy-MM-dd')
    };

    const xPosition = index / (totalDays - 1);

    curves.forEach((curve, curveIndex) => {
      if (curve.points.length > 0) {
        const normalizedY = interpolateValue(curve.points, xPosition);
        
        if (normalizedY !== null) {
          let actualValue = axisConfig.yMin + normalizedY * (axisConfig.yMax - axisConfig.yMin);
          
          // Apply roughness with a seed based on date index and curve index
          const seed = index * 1000 + curveIndex;
          actualValue = applyRoughness(actualValue, curve.roughness, seed, yRange);
          
          row[curve.name] = Math.round(actualValue * 100) / 100;
        }
        // If normalizedY is null, don't add anything (empty cell)
      }
    });

    return row;
  });

  // Create worksheet
  const ws = XLSX.utils.json_to_sheet(data);

  // Create workbook
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Data');

  // Generate filename with timestamp
  const filename = `curve_data_${format(new Date(), 'yyyyMMdd_HHmmss')}.xlsx`;

  // Save file
  XLSX.writeFile(wb, filename);
}
