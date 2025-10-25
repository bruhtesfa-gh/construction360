import { Button } from "@/components/ui/button";
import { ZoomIn, ZoomOut, Maximize2 } from "lucide-react";

interface LotSelectionProps {
  onSelect: () => void;
  onBack: () => void;
}

export const LotSelection = ({ onSelect, onBack }: LotSelectionProps) => {
  return (
    <div className="h-full flex flex-col">
      <div className="p-6 border-b border-border">
        <Button variant="ghost" onClick={onBack}>
          ← Back to SelectLot
        </Button>
      </div>

      <div className="flex-1 relative bg-muted/30 p-6">
        <div className="w-full h-full rounded-lg border-2 border-border bg-background overflow-hidden flex items-center justify-center">
          <div className="text-center text-muted-foreground">
            <div className="w-full max-w-3xl aspect-[4/3] bg-muted rounded-lg flex items-center justify-center">
              <div className="text-center p-8">
                <Maximize2 className="w-16 h-16 mx-auto mb-4 opacity-50" />
                <p className="text-lg mb-2">Interactive Lot Map</p>
                <p className="text-sm">
                  Interactive map view would display here showing available lots in the community
                </p>
                <Button onClick={onSelect} className="mt-6">
                  Select Lot & Continue
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Map Controls */}
        <div className="absolute bottom-10 left-10 flex flex-col gap-2">
          <Button size="icon" variant="secondary" className="shadow-lg">
            <ZoomIn className="w-4 h-4" />
          </Button>
          <Button size="icon" variant="secondary" className="shadow-lg">
            <ZoomOut className="w-4 h-4" />
          </Button>
          <Button size="icon" variant="secondary" className="shadow-lg">
            <Maximize2 className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};
