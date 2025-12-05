import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';
import { Curve, AxisConfig } from '@/types/curve';
import { exportToExcel } from '@/utils/exportToExcel';
import { toast } from 'sonner';

interface ExportButtonProps {
  curves: Curve[];
  axisConfig: AxisConfig;
  endDate: Date;
}

export function ExportButton({ curves, axisConfig, endDate }: ExportButtonProps) {
  const handleExport = () => {
    const curvesWithData = curves.filter(c => c.points.length > 0);
    
    if (curvesWithData.length === 0) {
      toast.error('No curves to export', {
        description: 'Draw at least one curve before exporting.',
      });
      return;
    }

    try {
      exportToExcel(curvesWithData, axisConfig, endDate);
      toast.success('Export successful', {
        description: `Exported ${curvesWithData.length} curve(s) to Excel.`,
      });
    } catch (error) {
      toast.error('Export failed', {
        description: 'An error occurred while exporting the data.',
      });
    }
  };

  return (
    <Button
      onClick={handleExport}
      className="w-full glow-primary"
      size="lg"
    >
      <Download className="h-4 w-4 mr-2" />
      Export to Excel
    </Button>
  );
}
