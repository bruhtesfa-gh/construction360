import { useState } from "react";
import { ArrowLeft, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";

interface StructuralOptionsProps {
  onBack: () => void;
  onSelect: () => void;
}

const categories = [
  "Structural Options",
  "Siding",
  "Driveway",
  "fsdafkjkjl",
  "Walkways",
  "Soluta qui ipsa qui",
  "Impedit enim exerci",
  "Desc",
  "Descr",
  "DAsd",
  "Descriptiion",
  "fsdajkfsdjk",
];

export const StructuralOptions = ({ onBack, onSelect }: StructuralOptionsProps) => {
  const [activeTab, setActiveTab] = useState<"first" | "second">("first");

  return (
    <div className="h-full flex flex-col bg-background">
      <div className="border-b border-border px-6 py-4">
        <Button variant="ghost" onClick={onBack} className="gap-2">
          <ArrowLeft className="w-4 h-4" />
          Back to Select Home
        </Button>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Left Panel - Floor Plan */}
        <div className="w-1/2 border-r border-border p-8 overflow-auto">
          <div className="mb-6">
            <h2 className="text-2xl font-bold mb-4">Structural Options</h2>
            <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as "first" | "second")}>
              <TabsList className="grid w-full max-w-md grid-cols-2">
                <TabsTrigger value="first">First Floor</TabsTrigger>
                <TabsTrigger value="second">Second Floor</TabsTrigger>
              </TabsList>

              <TabsContent value="first" className="mt-6">
                <div className="bg-muted rounded-lg p-8 flex items-center justify-center min-h-[600px]">
                  <div className="text-center space-y-4">
                    <div className="w-full max-w-2xl h-[500px] bg-background rounded-lg border-2 border-dashed border-border flex items-center justify-center">
                      <p className="text-muted-foreground">First Floor Plan Visualization</p>
                    </div>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="second" className="mt-6">
                <div className="bg-muted rounded-lg p-8 flex items-center justify-center min-h-[600px]">
                  <div className="text-center space-y-4">
                    <div className="w-full max-w-2xl h-[500px] bg-background rounded-lg border-2 border-dashed border-border flex items-center justify-center">
                      <p className="text-muted-foreground">Second Floor Plan Visualization</p>
                    </div>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </div>

        {/* Right Panel - Options */}
        <div className="w-1/2 flex flex-col">
          <div className="p-6">
            <Tabs defaultValue="category">
              <TabsList className="grid w-full grid-cols-2 mb-6">
                <TabsTrigger value="room">By Room</TabsTrigger>
                <TabsTrigger value="category">By Category</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>

          <div className="flex-1 overflow-auto px-6 pb-6">
            <div className="grid grid-cols-3 gap-4">
              {categories.map((category, index) => (
                <Card
                  key={index}
                  className="p-6 hover:border-primary cursor-pointer transition-all"
                >
                  <div className="flex flex-col items-center gap-3">
                    <Menu className="w-8 h-8 text-muted-foreground" />
                    <span className="text-sm font-medium text-center">{category}</span>
                  </div>
                </Card>
              ))}
            </div>
          </div>

          <div className="border-t border-border p-6">
            <Button onClick={onSelect} className="w-full" size="lg">
              Continue with Standard Options
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
