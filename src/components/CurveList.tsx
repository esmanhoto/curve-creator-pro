import { Curve, CURVE_COLORS } from '@/types/curve';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, Trash2, Pencil, Check } from 'lucide-react';
import { useState } from 'react';
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
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState('');

  const startEditing = (curve: Curve) => {
    setEditingId(curve.id);
    setEditingName(curve.name);
  };

  const saveEdit = () => {
    if (editingId && editingName.trim()) {
      onRenameCurve(editingId, editingName.trim());
    }
    setEditingId(null);
  };

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
        {curves.map((curve, index) => (
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
            
            {editingId === curve.id ? (
              <div className="flex-1 flex items-center gap-1">
                <Input
                  value={editingName}
                  onChange={(e) => setEditingName(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && saveEdit()}
                  className="h-6 text-sm bg-background"
                  autoFocus
                  onClick={(e) => e.stopPropagation()}
                />
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6"
                  onClick={(e) => {
                    e.stopPropagation();
                    saveEdit();
                  }}
                >
                  <Check className="h-3 w-3" />
                </Button>
              </div>
            ) : (
              <>
                <span className="flex-1 text-sm font-medium truncate">
                  {curve.name}
                </span>
                <span className="text-xs text-muted-foreground font-mono">
                  {curve.points.length > 0 ? `${curve.points.length} pts` : 'empty'}
                </span>
              </>
            )}

            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6 text-muted-foreground hover:text-foreground"
                onClick={(e) => {
                  e.stopPropagation();
                  startEditing(curve);
                }}
              >
                <Pencil className="h-3 w-3" />
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

      {activeCurveId && (
        <Button
          variant="outline"
          size="sm"
          className="w-full text-muted-foreground"
          onClick={() => onClearCurve(activeCurveId)}
        >
          Clear Selected Curve
        </Button>
      )}
    </div>
  );
}
