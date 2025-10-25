import { useState } from "react";
import { Search, Ruler, Bed, Bath, SlidersHorizontal } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

interface HomeConcept {
  id: string;
  name: string;
  price: number;
  sqft: number;
  bedrooms: number;
  bathrooms: number;
  image: string;
}

const mockHomes: HomeConcept[] = [
  {
    id: "1",
    name: "Spacious Family Home",
    price: 75000,
    sqft: 2700,
    bedrooms: 4,
    bathrooms: 3,
    image: "/placeholder.svg",
  },
  {
    id: "2",
    name: "Spacious Family Home",
    price: 85000,
    sqft: 3700,
    bedrooms: 4,
    bathrooms: 3,
    image: "/placeholder.svg",
  },
  {
    id: "3",
    name: "Spacious Family Home",
    price: 65000,
    sqft: 2000,
    bedrooms: 4,
    bathrooms: 3,
    image: "/placeholder.svg",
  },
];

interface HomeSelectionProps {
  onSelect: (home: HomeConcept) => void;
  onBack: () => void;
}

export const HomeSelection = ({ onSelect, onBack }: HomeSelectionProps) => {
  const [searchQuery, setSearchQuery] = useState("");

  return (
    <div className="h-full flex flex-col">
      <div className="p-6 border-b border-border">
        <Button variant="ghost" onClick={onBack} className="mb-4">
          ← Back to SelectLot
        </Button>

        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold mb-1">Select Home</h2>
            <p className="text-muted-foreground">Please select floor plan concept below.</p>
          </div>
          <div className="text-sm text-muted-foreground">3 Home Concepts</div>
        </div>
      </div>

      <div className="flex-1 p-6">
        <div className="flex items-center gap-4 mb-6">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
            <Input
              placeholder="Search Homes"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <Button variant="outline" className="gap-2">
            <SlidersHorizontal className="w-4 h-4" />
            See all tickets
          </Button>
        </div>

        <div className="grid grid-cols-3 gap-6">
          {mockHomes.map((home) => (
            <Card key={home.id} className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer group" onClick={() => onSelect(home)}>
              <CardContent className="p-0">
                <div className="aspect-[4/3] bg-muted overflow-hidden">
                  <img
                    src={home.image}
                    alt={home.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
                <div className="p-5">
                  <h3 className="font-semibold text-lg mb-3">{home.name}</h3>
                  <div className="text-2xl font-bold text-primary mb-4">
                    ${home.price.toLocaleString()}.00
                  </div>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Ruler className="w-4 h-4" />
                      {home.sqft} sqft
                    </div>
                    <div className="flex items-center gap-1">
                      <Bed className="w-4 h-4" />
                      {home.bedrooms}
                    </div>
                    <div className="flex items-center gap-1">
                      <Bath className="w-4 h-4" />
                      {home.bathrooms}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};
