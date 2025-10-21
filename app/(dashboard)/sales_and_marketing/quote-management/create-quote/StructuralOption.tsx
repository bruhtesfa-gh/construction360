"use client";

import { useState } from "react";
import { useSelector } from "@xstate/react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Image from "next/image";
import { ArrowLeft, LayoutGrid } from "lucide-react";
import { Actor, StateMachine } from "xstate";
import { Typegen } from "@/core/xstate/state-machines/create-quote-machine";

interface ISelectHomeProps {
  quoteActor: Actor<
    StateMachine<
      Typegen["context"],
      any,
      any,
      any,
      any,
      any,
      any,
      any,
      any,
      any,
      any,
      any,
      any,
      any
    >
  >;
}

export const StructuralOption = ({ quoteActor }: ISelectHomeProps) => {
  const state = useSelector(quoteActor, (snapshot) => snapshot);
  const { optionCategories, floorPlanRooms, elevationImages } = state.context;
  const [viewMode, setViewMode] = useState<"room" | "category">("category");

  // Mock data for categories until it's properly typed from context
  const categories =
    optionCategories?.data.map((category) => ({
      id: category.OptionCategoryCode,
      name: category.Description,
    })) || [];

  return (
    <div className="container mx-auto p-4">
      <Button
        variant="link"
        className="mb-4"
        onClick={() => quoteActor.send({ type: "BACK" })}
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Select Home
      </Button>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Floor Plan Viewer */}
        <div className="flex flex-col">
          <Tabs defaultValue="first-floor">
            <TabsList>
              <TabsTrigger value="first-floor">First Floor</TabsTrigger>
              <TabsTrigger value="second-floor">Second Floor</TabsTrigger>
            </TabsList>
            <TabsContent value="first-floor">
              <Card className="mt-2">
                <CardContent className="p-2">
                  <div className="relative w-full h-[600px]">
                    <img
                      src={elevationImages?.data[0].records[0]?.ImagePath} // Placeholder image
                      alt="First Floor Plan"
                      className="w-full h-full object-cover"
                    />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            <TabsContent value="second-floor">
              <Card className="mt-2">
                <CardContent className="p-2">
                  <div className="relative w-full h-[600px]">
                    <img
                      src={elevationImages?.data[0].records[1]?.ImagePath} // Placeholder image
                      alt="Second Floor Plan"
                      className="w-full h-full object-cover"
                    />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        {/* Structural Options Selector */}
        <div className="flex flex-col">
          <h2 className="text-2xl font-bold mb-4">Structural Options</h2>
          <div className="flex border border-primary rounded-md p-1 bg-muted mb-4">
            <Button
              variant={viewMode === "room" ? "default" : "ghost"}
              className="flex-1"
              onClick={() => setViewMode("room")}
            >
              By Room
            </Button>
            <Button
              variant={viewMode === "category" ? "default" : "ghost"}
              className="flex-1"
              onClick={() => setViewMode("category")}
            >
              By Category
            </Button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-5 gap-4 overflow-y-auto">
            {(optionCategories?.data || []).map((category, index) => (
              <Card
                key={index}
                className="flex flex-col items-center justify-center p-2 cursor-pointer hover:bg-accent"
              >
                <LayoutGrid className="w-4 h-4 mb-2" />
                <p className="text-center text-sm">{category.Description}</p>
              </Card>
            ))}
          </div>
          <div className="mt-auto pt-4 flex justify-end">
            <Button
              size="lg"
              onClick={() =>
                quoteActor.send({
                  type: "STRUCTURAL_OPTIONS_SELECTED",
                  payload: {
                    selectedSubcategories: [],
                    useStandardOptions: true,
                  },
                })
              }
            >
              Continue with Structural Options
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
