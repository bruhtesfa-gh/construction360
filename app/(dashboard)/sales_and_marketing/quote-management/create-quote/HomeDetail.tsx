"use client";

import { useState, useEffect } from "react";
import { useSelector } from "@xstate/react";
import {
  Bed,
  ChevronLeft,
  ChevronRight,
  Expand,
  Bath,
  ArrowLeft,
  Maximize,
} from "lucide-react";
import Image from "next/image";
import { Actor } from "xstate";
import { createQuoteMachine } from "@/core/xstate/state-machines/create-quote-machine";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { AddQuoteEvents } from "@/core/xstate";

interface IHomeDetailProps {
  quoteActor: Actor<typeof createQuoteMachine>;
}

export const HomeDetail = ({ quoteActor }: IHomeDetailProps) => {
  const { selectedHomeDetails, floorPlanRooms, detailValue } = useSelector(
    quoteActor,
    (snapshot) => snapshot.context
  );

  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [activeRoom, setActiveRoom] = useState<string | null>(null);

  useEffect(() => {
    if (floorPlanRooms && (floorPlanRooms as any[]).length > 0) {
      setActiveRoom((floorPlanRooms as any[])[0].RoomLocation);
    }
  }, [floorPlanRooms]);

  if (!selectedHomeDetails) {
    return <div>Loading...</div>;
  }

  const {
    Description,
    FloorPlanPrice,
    TotalSize,
    NumofBeds,
    NumofBaths,
    floor_plan_images,
    LotPrice,
    AddlPremium,
  } = selectedHomeDetails;

  const lotPrice = parseFloat(LotPrice) || 0;
  const lotPremium = parseFloat(AddlPremium) || 0;
  const priceSoFar = parseFloat(FloorPlanPrice) + lotPrice + lotPremium;

  const handleNextImage = () => {
    if (activeImageIndex < floor_plan_images.length - 1) {
      setActiveImageIndex(activeImageIndex + 1);
    }
  };

  const handlePrevImage = () => {
    if (activeImageIndex > 0) {
      setActiveImageIndex(activeImageIndex - 1);
    }
  };

  return (
    <div className="container mx-auto p-4">
      <Button variant="link" onClick={() => quoteActor.send({ type: "BACK" })}>
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Home Selection
      </Button>
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 mt-4">
        {/* Image Gallery */}
        <div className="lg:col-span-3">
          <Card className="overflow-hidden">
            <div className="relative w-full h-[500px]">
              <img
                src={
                  selectedHomeDetails.floor_plan_images[0].ImagePath ||
                  "/placeholder.png"
                }
                alt={"Home image"}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="p-4 flex gap-2">
              <Button variant="secondary">All Photos</Button>
              <Button variant="outline">Exterior</Button>
              <Button variant="outline">Livingroom</Button>
            </div>
          </Card>
        </div>

        {/* Details Pane */}
        <div className="lg:col-span-2 space-y-6">
          <div className="space-y-2">
            <h1 className="text-3xl font-bold">{Description}</h1>
            <p className="text-4xl font-bold text-primary">
              ${parseFloat(FloorPlanPrice).toLocaleString()}
            </p>
            <div className="flex items-center gap-6 text-muted-foreground">
              <div className="flex items-center gap-2">
                <Maximize className="w-5 h-5" />
                <span>{TotalSize} sqft</span>
              </div>
              <div className="flex items-center gap-2">
                <Bed className="w-5 h-5" />
                <span>{NumofBeds} Bedrooms</span>
              </div>
              <div className="flex items-center gap-2">
                <Bath className="w-5 h-5" />
                <span>{NumofBaths} Bathrooms</span>
              </div>
            </div>
          </div>

          <div className="flex gap-4">
            <Button variant="outline" className="w-full">
              Compare
            </Button>

            <Button
              className="w-full"
              onClick={() =>
                quoteActor.send({
                  type: AddQuoteEvents.HOME_SELECTED,
                  payload: {
                    homeId: selectedHomeDetails?.HomeID,
                    lotId: selectedHomeDetails?.LotInventoryID,
                  },
                })
              }
            >
              Select This Concept
            </Button>
          </div>

          <Separator />

          <div className="space-y-4 text-lg">
            <div className="flex justify-between">
              <span>Lot price</span>
              <span className="font-medium">${lotPrice.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span>Floor plan price</span>
              <span className="font-medium">
                ${parseFloat(FloorPlanPrice).toFixed(2)}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Lot premium</span>
              <span className="font-medium">${lotPremium.toFixed(2)}</span>
            </div>
            <Separator />
            <div className="flex justify-between font-bold">
              <span>Price so far</span>
              <span>${priceSoFar.toFixed(2)}</span>
            </div>
          </div>

          <Separator />

          <div className="my-4">
            <h3 className="text-lg font-semibold mb-3">Features</h3>
            <div className="space-y-3">
              {floorPlanRooms && floorPlanRooms.length > 0 && (
                <div className="overflow-x-auto pb-2">
                  <div className="flex space-x-2">
                    {floorPlanRooms.map((room) => (
                      <Button
                        key={room.RoomLocation}
                        variant={
                          activeRoom === room.RoomLocation
                            ? "outline"
                            : "default"
                        }
                        className="rounded-full w-full"
                        onClick={() => setActiveRoom(room.RoomLocation)}
                      >
                        <Bed className="mr-2 h-4 w-4" />
                        {room.RoomLocation}
                      </Button>
                    ))}
                  </div>
                </div>
              )}

              <ul className="space-y-2 text-sm text-muted-foreground pt-2">
                {detailValue &&
                  (detailValue as any[]).map((feature: any, index: number) => (
                    <li key={index} className="flex items-center">
                      {feature.value}
                    </li>
                  ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
