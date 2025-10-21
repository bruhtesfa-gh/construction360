"use client";

import React, { useEffect, useMemo, useState } from "react";
import { Actor, createActor } from "xstate";
import {
  createQuoteMachine,
  Typegen,
} from "@/core/xstate/state-machines/create-quote-machine";
import { AddQuoteState } from "@/core/xstate/state-machines/states-enum";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { SelectLot } from "./SelectLot";
import { SelectHome } from "./SelectHome";
import { HomeDetail } from "./HomeDetail";
import { StructuralOption } from "./StructuralOption";
import { Building2, Lightbulb, Users } from "lucide-react";
import QuoteToolBar from "./Stepper";
import OpportunitiesTable from "./OpportunitiesTable";
import Communities from "./Communities";

// Define a more flexible type for the opportunity data from the mock API
type MockOpportunity = {
  OpportunityID: string;
  [key: string]: any;
};

// Define a more flexible type for the community data from the mock API
type MockCommunity = {
  CommunityID: string;
  [key: string]: any;
};

// Define props for the Communities component
interface CommunitiesProps {
  communities: MockCommunity[];
  quoteActor: Actor<typeof createQuoteMachine>;
}

export default function CreateQuotePage() {
  const [currentState, setCurrentState] = useState<string>("");
  const [context, setContext] = useState<Typegen["context"]>({
    opportunities: [],
    selectedOpportunity: null,
    communities: [],
    lots: [],
    quote: {},
    selectedCommunity: null,
    selectedCommunityPhase: null,
    selectedCommunityPhases: [],
    selectedLot: null,
    homeQuery: "",
    homeData: [],
    selectedHome: null,
    homeDetails: null,
    selectedHomeId: null,
    selectedHomeDetails: null,
    elevationImages: null,
    optionCategories: null,
    elevationRooms: null,
    floorPlanRooms: [],
    detailValue: [],
    selectedStructuralOptions: {} as any,
    selectedInteriorExteriorOptions: {} as any,
  });

  // Create an actor instance
  const quoteActor = useMemo(() => createActor(createQuoteMachine), []);

  // Subscribe to state changes
  useEffect(() => {
    const subscription = quoteActor.subscribe((snapshot) => {
      // console.log("Current state:", snapshot.value);
      // console.log("Context:", snapshot.context);
      setCurrentState(snapshot.value as string);
      setContext(snapshot.context);
    });

    // Start the machine
    quoteActor.start();

    // return () => {
    //   subscription.unsubscribe();
    //   quoteActor.stop();
    // };
  }, [quoteActor]);

  // Check if current state is any loading state
  const isLoading = currentState.includes("LOADING");

  // Render loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-lg text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="px-4">
      <QuoteToolBar quoteActor={quoteActor} />
      <div className="mt-4">
        {currentState === AddQuoteState.OPPORTUNITY_READY && (
          <OpportunitiesTable quoteActor={quoteActor} />
        )}
      </div>

      <div className="mt-4">
        {currentState === AddQuoteState.COMMUNITY_READY && (
          <Communities quoteActor={quoteActor} />
        )}
      </div>

      <div className="mt-4">
        {currentState === AddQuoteState.LOT_READY && (
          <SelectLot quoteActor={quoteActor} />
        )}
      </div>
      <div className="mt-4">
        {currentState === AddQuoteState.HOME_READY && (
          <SelectHome quoteActor={quoteActor} />
        )}
      </div>
      <div className="mt-4">
        {currentState === AddQuoteState.HOME_DETAILS_READY && (
          <HomeDetail quoteActor={quoteActor} />
        )}
      </div>
      <div className="mt-4">
        {currentState === AddQuoteState.STRUCTURAL_OPTIONS_READY && (
          <StructuralOption quoteActor={quoteActor} />
        )}
      </div>
    </div>
  );
  // // Default loading state
  // return (
  //   <div className="flex items-center justify-center min-h-screen">
  //     <div className="text-center">
  //       <p className="text-lg text-muted-foreground">
  //         State: {currentState || "Initializing..."}
  //       </p>
  //     </div>
  //   </div>
  // );
}

// import { useState, useEffect, useCallback } from 'react'
// import { useLocation } from 'react-router-dom'
// import { cn } from '@/lib/utils'
// import {
//   Stepper,
//   Step,
//   StepIndicator,
//   StepLabel,
// } from '@/components/ui/stepper'
// import {
//   Lightbulb,
//   Users,
//   Home,
//   Building2,
//   Hammer,
//   Paintbrush,
//   ShieldPlus,
//   CreditCard,
// } from 'lucide-react'
// import { useAddQuoteState } from './AddQuotelayout'
// import { AddQuoteEvents, AddQuoteState } from 'src/store/xstate/state-machines/states-enum'

// const steps = [
//   { label: 'Opportunity', icon: Lightbulb, statePrefix: 'OPPORTUNITY' },
//   { label: 'Community', icon: Users, statePrefix: 'COMMUNITY' },
//   { label: 'Select Lot', icon: Building2, statePrefix: 'LOT' },
//   { label: 'Select Home', icon: Home, statePrefix: 'HOME' },
//   { label: 'Structural Options', icon: Hammer, statePrefix: 'STRUCTURAL_OPTIONS' },
//   { label: 'Interior/Exterior', icon: Paintbrush, statePrefix: 'INTERIOR_EXTERIOR' },
//   { label: 'Deposit Details', icon: ShieldPlus, statePrefix: 'DEPOSIT_DETAILS' },
//   { label: 'Financing Details', icon: CreditCard, statePrefix: 'FINANCING_DETAILS' },
// ]

// export function QuoteToolBar() {
//   const { state, send } = useAddQuoteState()
//   const [activeStep, setActiveStep] = useState(0)
//   const location = useLocation()

//   const onStepClick = useCallback(
//     (step: any) => {
//       const event = `${step.statePrefix}_READY`
//       send({ type: event })
//     },
//     [send]
//   )

//   useEffect(() => {
//     steps.forEach((step, index) => {
//       if (state.value.startsWith(step.statePrefix)) {
//         setActiveStep(index)
//       }
//     })
//   }, [state])

//   return (
//     <div className="w-full space-y-2">
//       <div className="text-sm text-muted-foreground">
//         Current State: <span className="font-medium text-primary">{state.value}</span>
//       </div>

//       <Stepper activeStep={activeStep}>
//         {steps.map((step, index) => (
//           <Step key={step.label}>
//             <StepIndicator
//               className={cn(
//                 'cursor-pointer transition-all duration-200',
//                 activeStep === index && 'bg-primary text-white shadow-md'
//               )}
//               onClick={() => onStepClick(step)}
//             >
//               <step.icon className="h-5 w-5" />
//             </StepIndicator>
//             <StepLabel>{step.label}</StepLabel>
//           </Step>
//         ))}
//       </Stepper>
//     </div>
//   )
// }
