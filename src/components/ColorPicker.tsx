import { useState } from 'react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CURVE_COLORS } from '@/types/curve';

interface ColorPickerProps {
  color: string;
  onColorChange: (color: string) => void;
}

const EXTRA_COLORS = [
  'hsl(0, 70%, 55%)',     // red
  'hsl(45, 90%, 55%)',    // yellow
  'hsl(200, 70%, 55%)',   // blue
  'hsl(220, 70%, 60%)',   // indigo
  'hsl(100, 60%, 45%)',   // lime
];

const ALL_COLORS = [...CURVE_COLORS, ...EXTRA_COLORS];

export function ColorPicker({ color, onColorChange }: ColorPickerProps) {
  const [open, setOpen] = useState(false);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          className="w-3 h-3 rounded-full flex-shrink-0 border border-border hover:scale-125 transition-transform cursor-pointer"
          style={{ backgroundColor: color }}
          title="Change color"
        />
      </PopoverTrigger>
      <PopoverContent className="w-auto p-2" align="start">
        <div className="grid grid-cols-5 gap-2">
          {ALL_COLORS.map((c) => (
            <button
              key={c}
              className={`w-6 h-6 rounded-full border-2 transition-all hover:scale-110 ${
                c === color ? 'border-foreground' : 'border-transparent'
              }`}
              style={{ backgroundColor: c }}
              onClick={() => {
                onColorChange(c);
                setOpen(false);
              }}
            />
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
}
