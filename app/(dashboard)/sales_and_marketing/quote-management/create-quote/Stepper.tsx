import React, { useEffect, useState, useCallback } from "react";
// @ts-ignore
import Stepper from "react-stepper-horizontal";
import {
  Lightbulb,
  Users,
  Building2,
  Home,
  Hammer,
  Paintbrush,
  ShieldPlus,
  CreditCard,
} from "lucide-react";
import { createQuoteMachine } from "@/core/xstate/state-machines/create-quote-machine";
import { Actor } from "xstate";
import { useSelector } from "@xstate/react";
// import { useLocation } from "react-router-dom"
// import { useAddQuoteState } from "./AddQuotelayout"
// import { AddQuoteEvents, AddQuoteState } from "src/store/xstate/state-machines/states-enum"
interface IQuoteToolBarProps {
  quoteActor: Actor<typeof createQuoteMachine>;
}
export default function QuoteToolBar({ quoteActor }: IQuoteToolBarProps) {
  const state = useSelector(quoteActor, (snapshot) => snapshot);
  const send = quoteActor.send;
  // const { state, send } = useAddQuoteState()
  const [activeStep, setActiveStep] = useState(0);
  const location = window.location;

  const currentPath = location.pathname;
  const pathList = currentPath.split("/");
  const stepPath = pathList[pathList.length - 1];

  const steps = [
    {
      title: "Opportunity",
      icon: <Lightbulb className="h-4 w-4" />,
      statePrefix: "OPPORTUNITY",
    },
    {
      title: "Community",
      icon: <Users className="h-4 w-4" />,
      statePrefix: "COMMUNITY",
    },
    {
      title: "Select Lot",
      icon: <Building2 className="h-4 w-4" />,
      statePrefix: "LOT",
    },
    {
      title: "Select Home",
      icon: <Home className="h-4 w-4" />,
      statePrefix: "HOME",
    },
    {
      title: "Structural Options",
      icon: <Hammer className="h-4 w-4" />,
      statePrefix: "STRUCTURAL_OPTIONS",
    },
    {
      title: "Interior/Exterior",
      icon: <Paintbrush className="h-4 w-4" />,
      statePrefix: "INTERIOR_EXTERIOR",
    },
    {
      title: "Deposit Details",
      icon: <ShieldPlus className="h-4 w-4" />,
      statePrefix: "DEPOSIT_DETAILS",
    },
    {
      title: "Financing Details",
      icon: <CreditCard className="h-4 w-4" />,
      statePrefix: "FINANCING_DETAILS",
    },
  ];

  const onStepClick = useCallback(
    (step: { statePrefix: string }) => {
      const event = `${step.statePrefix}_READY`;
      send({ type: event });
    },
    [send]
  );

  useEffect(() => {
    steps.forEach((step, index) => {
      if (state.value.toString().startsWith(step.statePrefix)) {
        setActiveStep(index);
      }
    });
  }, [state]);

  return (
    <div className="w-full p-4 space-y-4">
      <div className="text-sm text-muted-foreground">
        Current State:{" "}
        <span className="font-medium text-primary">
          {state.value.toString()}
        </span>
      </div>

      {/* Horizontal icons + labels below */}
      <div className="flex justify-between gap-2 mt-6 text-sm text-muted-foreground w-full  mx-auto">
        {steps.map((s, i) => (
          <div
            key={s.title}
            className={`flex flex-col items-center cursor-pointer transition-all duration-200 w-[100px] text-center ${
              i === activeStep ? "text-primary font-semibold" : "text-gray-500"
            }`}
            onClick={() => onStepClick(s)}
          >
            <div
              className={`flex items-center justify-center w-10 h-10 rounded-full mb-1 ${
                i <= activeStep
                  ? "bg-gradient-to-br from-indigo-500 to-indigo-800 text-white shadow-md"
                  : "bg-gray-300 text-gray-100"
              }`}
            >
              {s.icon}
            </div>
            <span className="truncate text-xs">{s.title}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
