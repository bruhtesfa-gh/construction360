import { ChevronLeft, ChevronRight, Ruler, Bed, Bath, Sofa } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface HomeDetailsProps {
  onBack: () => void;
  onSelect: () => void;
}

export const HomeDetails = ({ onBack, onSelect }: HomeDetailsProps) => {
  return (
    <div className="flex h-full">
      {/* Image Gallery */}
      <div className="flex-1 bg-muted/30 p-6">
        <Button variant="ghost" onClick={onBack} className="mb-4">
          ← Back to Home
        </Button>

        <div className="relative h-[calc(100%-4rem)] rounded-lg overflow-hidden bg-background">
          <img
            src="/placeholder.svg"
            alt="Home"
            className="w-full h-full object-cover"
          />

          {/* Gallery Navigation */}
          <div className="absolute top-4 left-4 flex gap-2">
            <Badge variant="secondary">All Photo</Badge>
            <Badge variant="outline">Exterior</Badge>
            <Badge variant="outline">Livingroom</Badge>
          </div>

          <Button
            size="icon"
            variant="secondary"
            className="absolute left-4 top-1/2 -translate-y-1/2 shadow-lg"
          >
            <ChevronLeft className="w-5 h-5" />
          </Button>
          <Button
            size="icon"
            variant="secondary"
            className="absolute right-4 top-1/2 -translate-y-1/2 shadow-lg"
          >
            <ChevronRight className="w-5 h-5" />
          </Button>
        </div>
      </div>

      {/* Details Panel */}
      <div className="w-[480px] border-l border-border p-6 overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold">Spacious Family Home</h2>
          <div className="flex gap-2">
            <Button variant="outline">Compare</Button>
            <Button onClick={onSelect}>Select This Concept</Button>
          </div>
        </div>

        <div className="text-3xl font-bold text-primary mb-6">$250000.00</div>

        <div className="flex items-center gap-6 mb-8 pb-6 border-b border-border">
          <div className="flex items-center gap-2">
            <Ruler className="w-5 h-5 text-primary" />
            <span className="font-medium">2700 sqft</span>
          </div>
          <div className="flex items-center gap-2">
            <Bed className="w-5 h-5 text-primary" />
            <span className="font-medium">4 Bedrooms</span>
          </div>
          <div className="flex items-center gap-2">
            <Bath className="w-5 h-5 text-primary" />
            <span className="font-medium">3 Bathrooms</span>
          </div>
        </div>

        {/* Price Breakdown */}
        <div className="space-y-4 mb-8 pb-8 border-b border-border">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Lot price</span>
            <span className="font-medium">$75000.00</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Floor plan price</span>
            <span className="font-medium">$250000.00</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Lot premium</span>
            <span className="font-medium">$3000.00</span>
          </div>
          <div className="flex justify-between pt-4 border-t border-border">
            <span className="font-semibold">Price so far</span>
            <span className="font-bold text-lg">$328000</span>
          </div>
        </div>

        {/* Features */}
        <div>
          <h3 className="font-semibold text-lg mb-4">Features</h3>
          <div className="space-y-3">
            <div className="flex items-center gap-3 p-3 bg-primary/5 rounded-lg border border-primary/20">
              <Sofa className="w-5 h-5 text-primary" />
              <span>Living Room</span>
            </div>
            <div className="p-3 bg-muted rounded-lg">
              <span>Integrated Smart Home Technology</span>
            </div>
            <div className="p-3 bg-muted rounded-lg">
              <span>Ample Storage Space</span>
            </div>
            <div className="p-3 bg-muted rounded-lg">
              <span>Spacious Master Suite</span>
            </div>
            <div className="p-3 bg-muted rounded-lg">
              <span>Spacious Master Suite</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
