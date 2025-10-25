import { Check, Lightbulb, Users, Image, Home, Building2, Palette, CreditCard, FileText } from "lucide-react";
import { cn } from "@/lib/utils";

const steps = [
  { id: 1, name: "Opportunity", icon: Lightbulb },
  { id: 2, name: "Community", icon: Users },
  { id: 3, name: "Select Lot", icon: Image },
  { id: 4, name: "Select Home", icon: Home },
  { id: 5, name: "Structural Options", icon: Building2 },
  { id: 6, name: "Interior/Exterior", icon: Palette },
  { id: 7, name: "Deposit Details", icon: CreditCard },
  { id: 8, name: "Financing Details", icon: FileText },
];

interface StepperProps {
  currentStep: number;
}

export const Stepper = ({ currentStep }: StepperProps) => {
  return (
    <div className="w-full bg-background px-6 py-6">
      <div className="max-w-7xl mx-auto border-b border-border pb-6">
        <div className="flex items-center justify-between relative">
          {/* Progress Line */}
          <div className="absolute top-5 left-0 right-0 h-0.5 bg-border -z-10" 
               style={{ 
                 width: `calc(100% - ${100 / steps.length}%)`,
                 marginLeft: `calc(${100 / steps.length / 2}%)`
               }}>
            <div 
              className="h-full bg-primary transition-all duration-500"
              style={{ width: `${((currentStep - 1) / (steps.length - 1)) * 100}%` }}
            />
          </div>

          {steps.map((step, index) => {
            const isComplete = currentStep > step.id;
            const isCurrent = currentStep === step.id;
            const Icon = step.icon;

            return (
              <div key={step.id} className="flex flex-col items-center gap-2 flex-1">
                <div
                  className={cn(
                    "w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300",
                    isComplete && "bg-primary text-primary-foreground shadow-lg",
                    isCurrent && "bg-primary text-primary-foreground shadow-lg scale-110",
                    !isComplete && !isCurrent && "bg-muted text-muted-foreground"
                  )}
                >
                  {isComplete ? (
                    <Check className="w-5 h-5" />
                  ) : (
                    <Icon className="w-5 h-5" />
                  )}
                </div>
                <span
                  className={cn(
                    "text-xs font-medium text-center whitespace-nowrap transition-colors",
                    (isCurrent || isComplete) && "text-foreground",
                    !isCurrent && !isComplete && "text-muted-foreground"
                  )}
                >
                  {step.name}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
