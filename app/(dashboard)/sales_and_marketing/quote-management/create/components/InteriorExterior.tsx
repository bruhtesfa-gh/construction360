import { useState } from "react";
import { ArrowLeft, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

interface InteriorExteriorProps {
  onBack: () => void;
  onSelect: () => void;
}

const rooms = ["Living Room", "Kitchen", "Bedroom", "Bathroom"];

const subcategories = [
  "Structural Options",
  "Siding",
  "Driveway",
  "Fsdafkjkjl",
  "Walkways",
  "Soluta C",
];

const options = [
  { name: "Ceramic", price: 500 },
  { name: "Hardwood", price: 500 },
  { name: "Laminate", price: 500 },
  { name: "Lino", price: 500 },
  { name: "Sinks", price: 500 },
  { name: "Tile", price: 500 },
];

export const InteriorExterior = ({ onBack, onSelect }: InteriorExteriorProps) => {
  const [selectedRoom, setSelectedRoom] = useState("Living Room");
  const [selectedOptions, setSelectedOptions] = useState<string[]>([]);

  const toggleOption = (optionName: string) => {
    setSelectedOptions((prev) =>
      prev.includes(optionName)
        ? prev.filter((o) => o !== optionName)
        : [...prev, optionName]
    );
  };

  const totalCost = selectedOptions.reduce((sum, name) => {
    const option = options.find((o) => o.name === name);
    return sum + (option?.price || 0);
  }, 0);

  return (
    <div className="h-full flex flex-col bg-background">
      <div className="border-b border-border px-6 py-4">
        <Button variant="ghost" onClick={onBack} className="gap-2">
          <ArrowLeft className="w-4 h-4" />
          Back to Structural Options
        </Button>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Left Panel - Room Selection */}
        <div className="w-64 border-r border-border flex flex-col">
          <div className="p-4">
            <h2 className="text-lg font-bold mb-4">Interior & Exterior Options</h2>
            <Tabs defaultValue="room">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="room">By Room</TabsTrigger>
                <TabsTrigger value="category">By Category</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>

          <div className="flex-1 overflow-auto px-4">
            {rooms.map((room) => (
              <button
                key={room}
                onClick={() => setSelectedRoom(room)}
                className={`w-full text-left px-4 py-3 rounded-lg mb-2 transition-colors ${
                  selectedRoom === room
                    ? "bg-primary text-primary-foreground"
                    : "hover:bg-accent"
                }`}
              >
                {room}
              </button>
            ))}
          </div>

          <div className="border-t border-border p-4">
            <div className="text-sm font-bold mb-1">Total ${totalCost.toLocaleString()}</div>
            <button className="text-sm text-primary hover:underline">
              Review your {selectedOptions.length} options
            </button>
          </div>

          <div className="p-4">
            <Button onClick={onSelect} className="w-full">
              Proceed
            </Button>
          </div>
        </div>

        {/* Right Panel - Options */}
        <div className="flex-1 flex flex-col">
          <div className="border-b border-border p-6">
            <h1 className="text-3xl font-bold mb-2">{selectedRoom}</h1>
            <p className="text-muted-foreground">137 sqft - First Floor</p>
          </div>

          <div className="border-b border-border p-4">
            <div className="flex items-center gap-4">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input placeholder="Search Subcategories" className="pl-9" />
              </div>
              <div className="flex gap-2 overflow-x-auto">
                {subcategories.map((cat) => (
                  <Badge key={cat} variant="secondary" className="whitespace-nowrap">
                    {cat}
                  </Badge>
                ))}
              </div>
            </div>
          </div>

          <div className="p-6">
            <p className="text-sm text-muted-foreground mb-6">3 home concepts</p>
            <div className="grid grid-cols-2 gap-6">
              {options.map((option) => {
                const isSelected = selectedOptions.includes(option.name);
                return (
                  <Card
                    key={option.name}
                    className={`overflow-hidden transition-all ${
                      isSelected ? "ring-2 ring-primary" : ""
                    }`}
                  >
                    <div className="aspect-video bg-muted flex items-center justify-center">
                      <img
                        src="/placeholder.svg"
                        alt={option.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="p-4">
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="font-semibold">{option.name}</h3>
                        <span className="text-sm text-muted-foreground">
                          $ {option.price}
                        </span>
                      </div>
                      <Button
                        variant={isSelected ? "default" : "outline"}
                        size="sm"
                        className="w-full"
                        onClick={() => toggleOption(option.name)}
                      >
                        {isSelected ? "Selected" : "Select"}
                      </Button>
                    </div>
                  </Card>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
