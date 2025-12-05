import { Curve, CURVE_COLORS } from '@/types/curve';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, Trash2, RotateCcw } from 'lucide-react';
import { cn } from '@/lib/utils';

interface CurveListProps {
  curves: Curve[];
  activeCurveId: string | null;
  onSelectCurve: (id: string) => void;
  onAddCurve: () => void;
  onDeleteCurve: (id: string) => void;
  onRenameCurve: (id: string, name: string) => void;
  onClearCurve: (id: string) => void;
}

export function CurveList({
  curves,
  activeCurveId,
  onSelectCurve,
  onAddCurve,
  onDeleteCurve,
  onRenameCurve,
  onClearCurve,
}: CurveListProps) {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
          Curves
        </h3>
        <Button
          variant="ghost"
          size="sm"
          onClick={onAddCurve}
          disabled={curves.length >= 5}
          className="h-8 px-2 text-primary hover:text-primary hover:bg-primary/10"
        >
          <Plus className="h-4 w-4 mr-1" />
          Add
        </Button>
      </div>

      <div className="space-y-2">
        {curves.map((curve) => (
          <div
            key={curve.id}
            className={cn(
              "group flex items-center gap-2 p-2 rounded-md border transition-all cursor-pointer",
              activeCurveId === curve.id
                ? "border-primary bg-primary/5"
                : "border-border hover:border-muted-foreground/30 bg-card"
            )}
            onClick={() => onSelectCurve(curve.id)}
          >
            <div
              className="w-3 h-3 rounded-full flex-shrink-0"
              style={{ backgroundColor: curve.color }}
            />
            
            <Input
              value={curve.name}
              onChange={(e) => onRenameCurve(curve.id, e.target.value)}
              className="h-6 text-sm bg-background flex-1"
              onClick={(e) => e.stopPropagation()}
            />

            <span className="text-xs text-muted-foreground font-mono whitespace-nowrap">
              {curve.points.length > 0 ? `${curve.points.length} pts` : 'empty'}
            </span>

            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6 text-muted-foreground hover:text-foreground"
                onClick={(e) => {
                  e.stopPropagation();
                  onClearCurve(curve.id);
                }}
                title="Clear curve"
              >
                <RotateCcw className="h-3 w-3" />
              </Button>
              {curves.length > 1 && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6 text-muted-foreground hover:text-destructive"
                  onClick={(e) => {
                    e.stopPropagation();
                    onDeleteCurve(curve.id);
                  }}
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
