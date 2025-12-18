import { useState, useCallback } from 'react';
import { DrawingCanvas } from './DrawingCanvas';
import { CurveList } from './CurveList';
import { AxisControls } from './AxisControls';
import { ExportButton } from './ExportButton';
import { DatePicker } from './DatePicker';
import { RoughnessSlider } from './RoughnessSlider';
import { EventLinesManager } from './EventLinesManager';
import { Curve, AxisConfig, Point, EventLine, CURVE_COLORS } from '@/types/curve';

function generateId() {
  return Math.random().toString(36).substring(2, 9);
}

// Default to April 1st of current year
function getDefaultStartDate() {
  const now = new Date();
  return new Date(now.getFullYear(), 3, 1); // April is month 3 (0-indexed)
}

export function CurveDataGenerator() {
  const [curves, setCurves] = useState<Curve[]>([
    { id: generateId(), name: 'Curve 1', points: [], color: CURVE_COLORS[0], visible: true, roughness: 0 }
  ]);
  const [activeCurveId, setActiveCurveId] = useState<string | null>(curves[0].id);
  const [axisConfig, setAxisConfig] = useState<AxisConfig>({ yMin: 0, yMax: 100 });
  const [startDate, setStartDate] = useState<Date>(getDefaultStartDate());
  const [events, setEvents] = useState<EventLine[]>([]);

  const handleAddCurve = useCallback(() => {
    const newCurve: Curve = {
      id: generateId(),
      name: `Curve ${curves.length + 1}`,
      points: [],
      color: CURVE_COLORS[curves.length % CURVE_COLORS.length],
      visible: true,
      roughness: 0,
    };
    // Set all other curves to not visible, only new curve visible
    setCurves(prev => prev.map(c => ({ ...c, visible: false })).concat(newCurve));
    setActiveCurveId(newCurve.id);
  }, [curves.length]);

  const handleDeleteCurve = useCallback((id: string) => {
    setCurves(prev => prev.filter(c => c.id !== id));
    if (activeCurveId === id) {
      setActiveCurveId(curves.find(c => c.id !== id)?.id || null);
    }
  }, [activeCurveId, curves]);

  const handleRenameCurve = useCallback((id: string, name: string) => {
    setCurves(prev => prev.map(c => c.id === id ? { ...c, name } : c));
  }, []);

  const handleUpdateCurve = useCallback((id: string, points: Point[]) => {
    setCurves(prev => prev.map(c => c.id === id ? { ...c, points } : c));
  }, []);

  const handleClearCurve = useCallback((id: string) => {
    setCurves(prev => prev.map(c => c.id === id ? { ...c, points: [] } : c));
  }, []);

  const handleToggleVisibility = useCallback((id: string) => {
    setCurves(prev => prev.map(c => c.id === id ? { ...c, visible: !c.visible } : c));
  }, []);

  const handleRoughnessChange = useCallback((id: string, roughness: number) => {
    setCurves(prev => prev.map(c => c.id === id ? { ...c, roughness } : c));
  }, []);

  const handleColorChange = useCallback((id: string, color: string) => {
    setCurves(prev => prev.map(c => c.id === id ? { ...c, color } : c));
  }, []);

  const handleAddEvent = useCallback((event: EventLine) => {
    setEvents(prev => [...prev, event]);
  }, []);

  const handleRemoveEvent = useCallback((id: string) => {
    setEvents(prev => prev.filter(e => e.id !== id));
  }, []);

  const activeCurve = curves.find(c => c.id === activeCurveId);

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-6xl mx-auto">
        <header className="mb-8">
          <h1 className="text-2xl font-semibold text-foreground">
            Curve Data Generator
          </h1>
          <p className="text-muted-foreground mt-1">
            Draw curves and export to Excel with 6 months of daily data
          </p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-6">
          {/* Canvas Area */}
          <div className="space-y-4">
            <div className="bg-card rounded-xl border border-border p-4">
              <DrawingCanvas
                curves={curves}
                activeCurveId={activeCurveId}
                axisConfig={axisConfig}
                startDate={startDate}
                events={events}
                onUpdateCurve={handleUpdateCurve}
                onToggleVisibility={handleToggleVisibility}
              />
            </div>
            <p className="text-sm text-muted-foreground text-center">
              Click and drag from left to right to draw a curve
            </p>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <div className="bg-card rounded-xl border border-border p-4">
              <CurveList
                curves={curves}
                activeCurveId={activeCurveId}
                onSelectCurve={setActiveCurveId}
                onAddCurve={handleAddCurve}
                onDeleteCurve={handleDeleteCurve}
                onRenameCurve={handleRenameCurve}
                onClearCurve={handleClearCurve}
                onColorChange={handleColorChange}
              />
            </div>

            <div className="bg-card rounded-xl border border-border p-4">
              <RoughnessSlider
                curve={activeCurve}
                onRoughnessChange={handleRoughnessChange}
              />
            </div>

            <div className="bg-card rounded-xl border border-border p-4">
              <AxisControls
                config={axisConfig}
                onChange={setAxisConfig}
              />
            </div>

            <div className="bg-card rounded-xl border border-border p-4">
              <DatePicker
                date={startDate}
                onDateChange={setStartDate}
              />
            </div>

            <div className="bg-card rounded-xl border border-border p-4">
              <EventLinesManager
                events={events}
                startDate={startDate}
                onAddEvent={handleAddEvent}
                onRemoveEvent={handleRemoveEvent}
              />
            </div>

            <ExportButton
              curves={curves}
              axisConfig={axisConfig}
              startDate={startDate}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
