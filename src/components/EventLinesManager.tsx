import { useState } from 'react';
import { format } from 'date-fns';
import { Calendar as CalendarIcon, Plus, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import { EventLine } from '@/types/curve';

interface EventLinesManagerProps {
  events: EventLine[];
  startDate: Date;
  onAddEvent: (event: EventLine) => void;
  onRemoveEvent: (id: string) => void;
}

function generateId() {
  return Math.random().toString(36).substring(2, 9);
}

export function EventLinesManager({ events, startDate, onAddEvent, onRemoveEvent }: EventLinesManagerProps) {
  const [newDate, setNewDate] = useState<Date | undefined>(undefined);
  const [newLabel, setNewLabel] = useState('');

  // Calculate valid date range (6 months from start)
  const endDate = new Date(startDate);
  endDate.setMonth(endDate.getMonth() + 6);

  const handleAdd = () => {
    if (newDate) {
      onAddEvent({
        id: generateId(),
        date: newDate,
        label: newLabel || format(newDate, 'dd MMM'),
      });
      setNewDate(undefined);
      setNewLabel('');
    }
  };

  return (
    <div className="space-y-3">
      <Label className="text-xs text-muted-foreground">Event Lines</Label>
      
      {/* Add new event */}
      <div className="flex gap-2">
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              className={cn(
                "flex-1 justify-start text-left font-mono text-xs bg-card",
                !newDate && "text-muted-foreground"
              )}
            >
              <CalendarIcon className="mr-2 h-3 w-3" />
              {newDate ? format(newDate, "dd MMM") : "Date"}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="single"
              selected={newDate}
              onSelect={setNewDate}
              disabled={(date) => date < startDate || date > endDate}
              initialFocus
              className="pointer-events-auto"
            />
          </PopoverContent>
        </Popover>
        <Input
          placeholder="Label"
          value={newLabel}
          onChange={(e) => setNewLabel(e.target.value)}
          className="flex-1 h-8 text-xs"
        />
        <Button size="sm" onClick={handleAdd} disabled={!newDate} className="h-8">
          <Plus className="h-3 w-3" />
        </Button>
      </div>

      {/* List of events */}
      {events.length > 0 && (
        <div className="space-y-1">
          {events.map((event) => (
            <div
              key={event.id}
              className="flex items-center justify-between bg-muted/50 rounded px-2 py-1"
            >
              <span className="text-xs font-mono text-destructive">
                {format(event.date, 'dd MMM')} - {event.label}
              </span>
              <Button
                variant="ghost"
                size="sm"
                className="h-6 w-6 p-0"
                onClick={() => onRemoveEvent(event.id)}
              >
                <Trash2 className="h-3 w-3" />
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
