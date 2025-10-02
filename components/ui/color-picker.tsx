"use client";

import * as React from "react";
import { cn } from "../../lib/utils";
import { hexToHSL, hslToHex } from "../../lib/theme-config";
import { Button } from "./button";
import { Input } from "./input";
import { Label } from "./label";
import { Popover, PopoverContent, PopoverTrigger } from "./popover";

interface ColorPickerProps {
  color: string; // HSL format
  onChange: (color: string) => void;
  label?: string;
  className?: string;
}

export function ColorPicker({
  color,
  onChange,
  label,
  className,
}: ColorPickerProps) {
  const [isOpen, setIsOpen] = React.useState(false);
  const [hexValue, setHexValue] = React.useState(() => {
    try {
      return hslToHex(color);
    } catch {
      return "#000000";
    }
  });

  // Update hex value when color prop changes
  React.useEffect(() => {
    try {
      setHexValue(hslToHex(color));
    } catch {
      setHexValue("#000000");
    }
  }, [color]);

  const handleColorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newHex = e.target.value;
    setHexValue(newHex);
    try {
      const hsl = hexToHSL(newHex);
      onChange(hsl);
    } catch {
      // Invalid color
    }
  };

  const handleHexInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (value.match(/^#?[0-9A-Fa-f]{0,6}$/)) {
      setHexValue(value);
      if (
        value.length === 7 ||
        (value.length === 6 && !value.startsWith("#"))
      ) {
        const hex = value.startsWith("#") ? value : `#${value}`;
        try {
          const hsl = hexToHSL(hex);
          onChange(hsl);
        } catch {
          // Invalid color
        }
      }
    }
  };

  return (
    <div className={cn("space-y-2", className)}>
      {label && <Label>{label}</Label>}
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className="w-full justify-start text-left font-normal"
          >
            <div
              className="h-4 w-4 rounded border mr-2"
              style={{ backgroundColor: hexValue }}
            />
            <span className="flex-1">{hexValue}</span>
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-64">
          <div className="space-y-4">
            <div>
              <Label htmlFor="color-picker">Pick a color</Label>
              <input
                id="color-picker"
                type="color"
                value={hexValue}
                onChange={handleColorChange}
                className="h-24 w-full rounded cursor-pointer"
              />
            </div>
            <div>
              <Label htmlFor="hex-input">Hex value</Label>
              <Input
                id="hex-input"
                value={hexValue}
                onChange={handleHexInputChange}
                placeholder="#000000"
              />
            </div>
            <div className="grid grid-cols-6 gap-2">
              {/* Quick color palette */}
              {[
                "#ef4444",
                "#f97316",
                "#f59e0b",
                "#eab308",
                "#84cc16",
                "#22c55e",
                "#10b981",
                "#14b8a6",
                "#06b6d4",
                "#0ea5e9",
                "#3b82f6",
                "#6366f1",
                "#8b5cf6",
                "#a855f7",
                "#d946ef",
                "#ec4899",
                "#f43f5e",
                "#000000",
                "#374151",
                "#6b7280",
                "#9ca3af",
                "#d1d5db",
                "#e5e7eb",
                "#ffffff",
              ].map((quickColor) => (
                <button
                  key={quickColor}
                  className="h-8 w-8 rounded border border-gray-300 hover:scale-110 transition-transform"
                  style={{ backgroundColor: quickColor }}
                  onClick={() => {
                    setHexValue(quickColor);
                    const hsl = hexToHSL(quickColor);
                    onChange(hsl);
                  }}
                />
              ))}
            </div>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}
