import { Curve } from '@/types/curve';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';

interface RoughnessSliderProps {
  curve: Curve | undefined;
  onRoughnessChange: (id: string, roughness: number) => void;
}

export function RoughnessSlider({ curve, onRoughnessChange }: RoughnessSliderProps) {
  if (!curve) {
    return (
      <div className="space-y-3">
        <Label className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
          Roughness
        </Label>
        <p className="text-sm text-muted-foreground">Select a curve to adjust roughness</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <Label className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
          Roughness
        </Label>
        <span className="text-xs font-mono text-muted-foreground">
          {curve.roughness}%
        </span>
      </div>
      
      <Slider
        value={[curve.roughness]}
        onValueChange={([value]) => onRoughnessChange(curve.id, value)}
        min={0}
        max={100}
        step={1}
        className="w-full"
      />
      
      <div className="flex justify-between text-xs text-muted-foreground">
        <span>Smooth</span>
        <span>Rough</span>
      </div>
    </div>
  );
}