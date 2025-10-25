"use client";

import { Stepper } from "./components/Stepper";
import { OpportunityList } from "./components/OpportunityList";
import { CommunitySelection } from "./components/CommunitySelection";
import { LotSelection } from "./components/LotSelection";
import { HomeSelection } from "./components/HomeSelection";
import { HomeDetails } from "./components/HomeDetails";
import { StructuralOptions } from "./components/StructuralOptions";
import { InteriorExterior } from "./components/InteriorExterior";
import { DepositDetails } from "./components/DepositDetails";
import { FinancingDetails } from "./components/FinancingDetails";
import { Search, Bell, Globe, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useState } from "react";

const Index = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [showHomeDetails, setShowHomeDetails] = useState(false);

  const renderStepContent = () => {
    if (showHomeDetails && currentStep === 4) {
      return (
        <HomeDetails
          onBack={() => setShowHomeDetails(false)}
          onSelect={() => setCurrentStep(5)}
        />
      );
    }

    switch (currentStep) {
      case 1:
        return <OpportunityList onSelect={() => setCurrentStep(2)} />;
      case 2:
        return (
          <CommunitySelection
            onSelect={() => setCurrentStep(3)}
            onBack={() => setCurrentStep(1)}
          />
        );
      case 3:
        return (
          <LotSelection
            onSelect={() => setCurrentStep(4)}
            onBack={() => setCurrentStep(2)}
          />
        );
      case 4:
        return (
          <HomeSelection
            onSelect={() => setShowHomeDetails(true)}
            onBack={() => setCurrentStep(3)}
          />
        );
      case 5:
        return (
          <StructuralOptions
            onSelect={() => setCurrentStep(6)}
            onBack={() => setCurrentStep(4)}
          />
        );
      case 6:
        return (
          <InteriorExterior
            onSelect={() => setCurrentStep(7)}
            onBack={() => setCurrentStep(5)}
          />
        );
      case 7:
        return (
          <DepositDetails
            onSelect={() => setCurrentStep(8)}
            onBack={() => setCurrentStep(6)}
          />
        );
      case 8:
        return <FinancingDetails onBack={() => setCurrentStep(7)} />;
      default:
        return null;
    }
  };

  return (
    <div className="h-screen flex flex-col bg-background">
      {/* Header */}
      <header className="border-b border-border px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Search className="w-5 h-5 text-muted-foreground cursor-pointer" />
          <div className="text-sm">
            <span className="text-muted-foreground">Current State: </span>
            <span className="font-medium">
              {currentStep === 1 && "OPPORTUNITY_READY"}
              {currentStep === 2 && "COMMUNITY_READY"}
              {currentStep === 3 && "LOT_READY"}
              {currentStep === 4 && !showHomeDetails && "HOME_READY"}
              {currentStep === 4 && showHomeDetails && "HOME_DETAILS_READY"}
              {currentStep === 5 && "STRUCTURAL_OPTIONS_READY"}
              {currentStep === 6 && "INTERIOR_EXTERIOR_READY"}
              {currentStep === 7 && "DEPOSIT_DETAILS_READY"}
              {currentStep === 8 && "FINANCING_DETAILS_READY"}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <Select defaultValue="arizona">
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="arizona">Arizona</SelectItem>
              <SelectItem value="texas">Texas</SelectItem>
              <SelectItem value="michigan">Michigan</SelectItem>
            </SelectContent>
          </Select>
          <Globe className="w-5 h-5 text-muted-foreground cursor-pointer" />
          <Bell className="w-5 h-5 text-muted-foreground cursor-pointer" />
          <div className="relative">
            <div className="absolute -top-1 -right-1 w-4 h-4 bg-destructive rounded-full text-xs text-white flex items-center justify-center">
              2
            </div>
            <Bell className="w-5 h-5 text-muted-foreground cursor-pointer" />
          </div>
          <User className="w-5 h-5 text-muted-foreground cursor-pointer" />
          <Button size="icon" variant="secondary" className="rounded-full">
            <User className="w-5 h-5" />
          </Button>
        </div>
      </header>

      {/* Stepper */}
      <Stepper currentStep={currentStep} />

      {/* Main Content */}
      <main className="flex-1 overflow-hidden">{renderStepContent()}</main>
    </div>
  );
};

export default Index;
