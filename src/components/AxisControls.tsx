import { AxisConfig } from '@/types/curve';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface AxisControlsProps {
  config: AxisConfig;
  onChange: (config: AxisConfig) => void;
}

export function AxisControls({ config, onChange }: AxisControlsProps) {
  return (
    <div className="space-y-4">
      <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
        Y-Axis Range
      </h3>
      
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label htmlFor="yMin" className="text-xs text-muted-foreground">
            Minimum
          </Label>
          <Input
            id="yMin"
            type="number"
            value={config.yMin}
            onChange={(e) => onChange({ ...config, yMin: parseFloat(e.target.value) || 0 })}
            className="h-9 font-mono text-sm bg-card"
          />
        </div>
        
        <div className="space-y-1.5">
          <Label htmlFor="yMax" className="text-xs text-muted-foreground">
            Maximum
          </Label>
          <Input
            id="yMax"
            type="number"
            value={config.yMax}
            onChange={(e) => onChange({ ...config, yMax: parseFloat(e.target.value) || 100 })}
            className="h-9 font-mono text-sm bg-card"
          />
        </div>
      </div>
    </div>
  );
}
