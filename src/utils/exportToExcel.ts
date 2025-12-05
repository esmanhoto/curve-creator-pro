import * as XLSX from 'xlsx';
import { Curve, AxisConfig } from '@/types/curve';
import { addMonths, format, eachDayOfInterval, startOfMonth, endOfMonth } from 'date-fns';

function interpolateValue(points: { x: number; y: number }[], x: number): number {
  if (points.length === 0) return 0;
  if (points.length === 1) return points[0].y;

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

export function exportToExcel(curves: Curve[], axisConfig: AxisConfig, startDate: Date) {
  // Generate 6 months of dates
  const endDate = addMonths(startDate, 6);
  const dates = eachDayOfInterval({
    start: startOfMonth(startDate),
    end: endOfMonth(addMonths(startDate, 5))
  });

  const totalDays = dates.length;

  // Create data rows
  const data = dates.map((date, index) => {
    const row: Record<string, string | number> = {
      Date: format(date, 'yyyy-MM-dd')
    };

    const xPosition = index / (totalDays - 1);

    curves.forEach(curve => {
      if (curve.points.length > 0) {
        const normalizedY = interpolateValue(curve.points, xPosition);
        const actualValue = axisConfig.yMin + normalizedY * (axisConfig.yMax - axisConfig.yMin);
        row[curve.name] = Math.round(actualValue * 100) / 100;
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
