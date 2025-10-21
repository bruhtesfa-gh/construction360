"use client";

import { useSelector } from "@xstate/react";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
// import { quoteActor } from "../../../../../../core/xstate/create-quote-machine";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import { Bed, Bath, Maximize } from "lucide-react";
import { Actor, StateMachine } from "xstate";
import { Typegen } from "@/core/xstate/state-machines/create-quote-machine";
import { AddQuoteEvents } from "@/core/xstate";

// Mock data for homes, assuming this will come from context later
// const homeConcepts = [
//   {
//     id: "1",
//     name: "Spacious Family Home",
//     price: 75000,
//     sqft: 2700,
//     beds: 4,
//     baths: 3,
//     image: "/real-estate-1.jpg", // Replace with actual image paths
//   },
//   {
//     id: "2",
//     name: "Modern Suburban House",
//     price: 85000,
//     sqft: 3700,
//     beds: 4,
//     baths: 3,
//     image: "/real-estate-2.jpg",
//   },
//   {
//     id: "3",
//     name: "Cozy Garden Cottage",
//     price: 65000,
//     sqft: 2000,
//     beds: 4,
//     baths: 3,
//     image: "/real-estate-3.jpg",
//   },
// ];

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

export const SelectHome = ({ quoteActor }: ISelectHomeProps) => {
  const state = useSelector(quoteActor, (snapshot) => snapshot);
  const { selectedHomeId, homeData } = state.context;

  const handleSelectHome = (homeId: string) => {
    quoteActor.send({ type: AddQuoteEvents.SELECT_HOME, homeId });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Select Home</h1>
          <p className="text-muted-foreground">
            Please select a floor plan concept below.
          </p>
        </div>
        {/* Add search and filter controls here if needed */}
      </div>

      <h2 className="text-lg font-semibold">{homeData.length} Home Concepts</h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
        {homeData.map((home) => (
          <Card
            key={home.HomeID}
            className={`overflow-hidden cursor-pointer transition-all ${
              selectedHomeId === home.HomeID
                ? "border-primary ring-2 ring-primary"
                : "border-border"
            }`}
            onClick={() => handleSelectHome(home.HomeID)}
          >
            <div className="relative h-48 w-full">
              <img
                src={
                  home.floor_plan_images[0] ||
                  "https://images.pexels.com/photos/106399/pexels-photo-106399.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1"
                }
                alt={home.Description}
                className="object-cover w-full h-full"
              />
            </div>
            <CardContent className="p-4 space-y-2">
              <CardTitle className="text-lg truncate">
                {home.Description}
              </CardTitle>
              <p className="text-xl font-bold text-primary">
                ${Number(home.LotPrice).toLocaleString()}
              </p>
              <div className="flex items-center justify-between text-sm text-muted-foreground pt-2">
                <div className="flex items-center gap-2">
                  <Maximize className="w-4 h-4 text-primary" />
                  <span>{Math.floor(Number(home.TotalSize))} sqft</span>
                </div>
                <div className="flex items-center gap-2">
                  <Bed className="w-4 h-4 text-primary" />
                  <span>{home.NumofBeds}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Bath className="w-4 h-4 text-primary" />
                  <span>{home.NumofBaths}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};
