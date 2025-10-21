"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import { CheckCircle, ChevronLeft, ChevronRight, Target } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { createActor } from "xstate";
import { createQuoteMachine } from "@/core/xstate/state-machines/create-quote-machine";
import { DataGrid, type ExcelColumn } from "../../../../../components/grid";
import type { ColDef } from "ag-grid-community";

type Community = {
  id: string;
  name: string;
  phases: { id: string; name: string }[];
};

type Opportunity = {
  id: string;
  name: string;
  buyer: string;
  stage: string;
  expectedClose: string;
  communityId: string;
  communityPhaseId: string;
  budget: string;
  notes: string;
};

type Lot = {
  id: string;
  communityId: string;
  communityPhaseId: string;
  lotNumber: string;
  block: string;
  status: "Available" | "Reserved";
  size: string;
  premium: string;
};

type HomePlan = {
  id: string;
  name: string;
  bedrooms: number;
  bathrooms: number;
  area: number;
  basePrice: string;
  communityIds: string[];
};

type StructuralCategory = {
  id: string;
  title: string;
  description: string;
  options: { id: string; label: string; price: string }[];
};

type FinishPackage = {
  id: string;
  label: string;
  description: string;
};

const CONTRACT_TYPES = [
  "New Construction",
  "Spec Home",
  "Custom Build",
] as const;
const STATUSES = ["Draft", "Pending", "Approved"] as const;
const COMMUNITIES: Community[] = [
  {
    id: "sunny-valley",
    name: "Sunny Valley",
    phases: [
      { id: "sunny-valley-ph1", name: "Phase 1" },
      { id: "sunny-valley-ph2", name: "Phase 2" },
    ],
  },
  {
    id: "meadow-ridge",
    name: "Meadow Ridge",
    phases: [
      { id: "meadow-ridge-north", name: "North" },
      { id: "meadow-ridge-south", name: "South" },
    ],
  },
  {
    id: "lakeview",
    name: "Lakeview Estates",
    phases: [
      { id: "lakeview-phase-3", name: "Phase 3" },
      { id: "lakeview-phase-4", name: "Phase 4" },
    ],
  },
];
const OPPORTUNITIES: Opportunity[] = [
  {
    id: "opp-001",
    name: "Smith Family",
    buyer: "Alex and Morgan Smith",
    stage: "Proposal",
    expectedClose: "2025-02-20",
    communityId: "sunny-valley",
    communityPhaseId: "sunny-valley-ph1",
    budget: "$540,000",
    notes: "Prefers quick move-in and upgraded kitchen package.",
  },
  {
    id: "opp-002",
    name: "Johnson Relocation",
    buyer: "Taylor Johnson",
    stage: "Qualification",
    expectedClose: "2025-04-05",
    communityId: "meadow-ridge",
    communityPhaseId: "meadow-ridge-north",
    budget: "$610,000",
    notes: "Corporate relocation with lender pre-approval in hand.",
  },
  {
    id: "opp-003",
    name: "Lakeview Custom",
    buyer: "Priya Patel",
    stage: "Discovery",
    expectedClose: "2025-06-15",
    communityId: "lakeview",
    communityPhaseId: "lakeview-phase-4",
    budget: "$700,000",
    notes: "Interested in premium elevation and lakefront lot.",
  },
];
const LOTS: Lot[] = [
  {
    id: "lot-101",
    communityId: "sunny-valley",
    communityPhaseId: "sunny-valley-ph1",
    lotNumber: "Lot 12",
    block: "Block A",
    status: "Available",
    size: "60ft x 120ft",
    premium: "$18,500",
  },
  {
    id: "lot-102",
    communityId: "sunny-valley",
    communityPhaseId: "sunny-valley-ph2",
    lotNumber: "Lot 26",
    block: "Block C",
    status: "Reserved",
    size: "55ft x 115ft",
    premium: "$12,000",
  },
  {
    id: "lot-201",
    communityId: "meadow-ridge",
    communityPhaseId: "meadow-ridge-north",
    lotNumber: "Lot 4",
    block: "Block B",
    status: "Available",
    size: "50ft x 110ft",
    premium: "$7,500",
  },
  {
    id: "lot-301",
    communityId: "lakeview",
    communityPhaseId: "lakeview-phase-4",
    lotNumber: "Lot 2",
    block: "Block D",
    status: "Available",
    size: "70ft x 130ft",
    premium: "$24,000",
  },
];
const HOME_PLANS: HomePlan[] = [
  {
    id: "plan-auburn",
    name: "Auburn 2400",
    bedrooms: 4,
    bathrooms: 3,
    area: 2450,
    basePrice: "$428,900",
    communityIds: ["sunny-valley", "meadow-ridge"],
  },
  {
    id: "plan-hawthorn",
    name: "Hawthorn 3100",
    bedrooms: 5,
    bathrooms: 3.5,
    area: 3120,
    basePrice: "$486,500",
    communityIds: ["sunny-valley", "lakeview"],
  },
  {
    id: "plan-pinnacle",
    name: "Pinnacle 1800",
    bedrooms: 3,
    bathrooms: 2,
    area: 1875,
    basePrice: "$368,400",
    communityIds: ["meadow-ridge"],
  },
];
const STRUCTURAL_CATEGORIES: StructuralCategory[] = [
  {
    id: "kitchen",
    title: "Kitchen",
    description: "Enhance culinary spaces with premium appliances and layouts.",
    options: [
      {
        id: "struct-chef-kitchen",
        label: "Chef Kitchen Package",
        price: "$4,800",
      },
      {
        id: "struct-extended-island",
        label: "Extended Island",
        price: "$2,100",
      },
    ],
  },
  {
    id: "living",
    title: "Living Areas",
    description: "Open up living spaces and add architectural interest.",
    options: [
      {
        id: "struct-two-story-great",
        label: "Two Story Great Room",
        price: "$6,750",
      },
      { id: "struct-fireplace", label: "Stone Fireplace", price: "$3,900" },
    ],
  },
  {
    id: "outdoor",
    title: "Outdoor Living",
    description: "Create entertaining areas that flow outdoors.",
    options: [
      { id: "struct-covered-patio", label: "Covered Patio", price: "$5,600" },
      { id: "struct-extended-deck", label: "Extended Deck", price: "$4,200" },
    ],
  },
];

const INTERIOR_PACKAGES: FinishPackage[] = [
  {
    id: "interior-modern",
    label: "Modern Luxe",
    description:
      "Matte black fixtures, wide plank flooring, quartz countertops.",
  },
  {
    id: "interior-classic",
    label: "Classic Comfort",
    description: "Warm wood tones, shaker cabinets, brushed nickel hardware.",
  },
  {
    id: "interior-designer",
    label: "Designer Curated",
    description:
      "Bold accents and premium finishes selected by our design team.",
  },
];

const EXTERIOR_PACKAGES: FinishPackage[] = [
  {
    id: "exterior-coastal",
    label: "Coastal",
    description: "Light siding palette with board and batten accents.",
  },
  {
    id: "exterior-farmhouse",
    label: "Modern Farmhouse",
    description:
      "Contrasting trim, metal roof accents, inviting porch columns.",
  },
  {
    id: "exterior-contemporary",
    label: "Contemporary",
    description: "Clean lines with mixed materials and dark window frames.",
  },
];
const STEP_FLOW = [
  {
    id: "selectOpportunity",
    title: "Select Opportunity",
    description:
      "Attach this quote to an existing sales opportunity and set key contract details.",
  },
  {
    id: "communityPhase",
    title: "Select Community",
    description:
      "Choose the community and phase where this home will be built.",
  },
  {
    id: "selectLot",
    title: "Select Lot",
    description: "Reserve the homesite that best matches your buyer's needs.",
  },
  {
    id: "selectHome",
    title: "Select Home",
    description: "Pick the home plan that will anchor this quote.",
  },
  {
    id: "structuralOptions",
    title: "Structural Options",
    description: "Configure structural upgrades to personalize the plan.",
  },
  {
    id: "interiorExterior",
    title: "Interior & Exterior",
    description:
      "Capture design center selections for finishes and elevations.",
  },
  {
    id: "depositDetails",
    title: "Deposit Details",
    description: "Document initial deposits and payment milestones.",
  },
  {
    id: "financingDetails",
    title: "Financing Details",
    description: "Record the buyer's lender information and loan structure.",
  },
  {
    id: "review",
    title: "Review & Create",
    description: "Confirm selections before creating the quote record.",
  },
] as const;

interface QuoteDraft {
  opportunityId: string;
  contractName: string;
  contractType: string;
  status: string;
  communityId: string;
  phaseId: string;
  lotId: string;
  floorPlanId: string;
  basePrice: string;
  notes: string;
  buyerName: string;
  buyerEmail: string;
  buyerPhone: string;
  expectedCloseDate: string;
  structuralSelections: string[];
  interiorSelections: string[];
  exteriorSelections: string[];
  depositEarnestMoney: string;
  depositOption: string;
  depositDueDate: string;
  depositNotes: string;
  financingLender: string;
  financingProgram: string;
  financingInterestRate: string;
  financingDownPayment: string;
  financingNotes: string;
}

const INITIAL_DRAFT: QuoteDraft = {
  opportunityId: "",
  contractName: "",
  contractType: "New Construction",
  status: "Draft",
  communityId: "",
  phaseId: "",
  lotId: "",
  floorPlanId: "",
  basePrice: "",
  notes: "",
  buyerName: "",
  buyerEmail: "",
  buyerPhone: "",
  expectedCloseDate: "",
  structuralSelections: [],
  interiorSelections: [],
  exteriorSelections: [],
  depositEarnestMoney: "",
  depositOption: "",
  depositDueDate: "",
  depositNotes: "",
  financingLender: "",
  financingProgram: "",
  financingInterestRate: "",
  financingDownPayment: "",
  financingNotes: "",
};
export default function AddQuotePage() {
  const router = useRouter();
  const [currentState, setCurrentState] = useState<any>(null);
  const [context, setContext] = useState<any>(null);

  // Create an actor instance
  const quoteActor = useMemo(() => createActor(createQuoteMachine), []);

  // Subscribe to state changes
  useEffect(() => {
    const subscription = quoteActor.subscribe((snapshot) => {
      console.clear();
      console.log("Current state:", snapshot.value);
      console.log("Context:", snapshot.context);
      console.log("---");
      setCurrentState(snapshot.value);
      setContext(snapshot.context);
    });

    // Start the machine
    quoteActor.start();

    return () => {
      subscription.unsubscribe();
      quoteActor.stop();
    };
  }, [quoteActor]);

  const handleSelectOpportunity = (opportunity: any) => {
    quoteActor.send({
      type: "OPPORTUNITY_SELECTED",
      payload: opportunity,
    });
  };

  const handleContinue = () => {
    // For now, just move to community loading
    quoteActor.send({
      type: "COMMUNITY_SELECTED",
      payload: { id: "comm-1", name: "Sunset Valley" },
    });
  };

  const handleBack = () => {
    router.push("/sales_and_marketing/quote-management/manage-quote");
  };

  // Loading state
  if (!currentState) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground text-lg">
            Initializing quote creation...
          </p>
        </div>
      </div>
    );
  }

  // Show loading when opportunities are being loaded
  if (currentState === "OPPORTUNITY_LOADING") {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="p-6">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
                <Target className="h-8 w-8" />
                Create Quote
              </h1>
              <p className="text-muted-foreground">Loading opportunities...</p>
            </div>
            <Button variant="outline" onClick={handleBack}>
              Back to Quotes
            </Button>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Loading Opportunities</CardTitle>
              <CardDescription>
                Please wait while we load available opportunities.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-center h-64">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                  <p className="text-muted-foreground">
                    Loading opportunity data...
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Show opportunities table when ready
  if (currentState === "OPPORTUNITY_READY") {
    const opportunities = context?.opportunities || [];

    // Column definitions for opportunities table
    const columnDefs: ColDef[] = [
      {
        headerName: "Opportunity Name",
        field: "opportunity_name",
        sortable: true,
        filter: true,
        flex: 2,
        minWidth: 200,
      },
      {
        headerName: "Stage",
        field: "stage",
        sortable: true,
        filter: true,
        flex: 1.2,
        minWidth: 120,
      },
      {
        headerName: "Amount",
        field: "amount",
        sortable: true,
        filter: "agNumberColumnFilter",
        flex: 1,
        minWidth: 120,
        valueFormatter: (params) => {
          if (params.value == null) return "";
          return new Intl.NumberFormat("en-US", {
            style: "currency",
            currency: "USD",
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
          }).format(params.value);
        },
      },
      {
        headerName: "Expected Close",
        field: "expected_close_date",
        sortable: true,
        filter: "agDateColumnFilter",
        flex: 1.2,
        minWidth: 120,
        valueFormatter: (params) => {
          if (!params.value) return "";
          return new Date(params.value).toLocaleDateString();
        },
      },
      {
        headerName: "Actions",
        field: "opportunity_id",
        sortable: false,
        filter: false,
        width: 120,
        cellRenderer: (params: any) => (
          <Button
            size="sm"
            onClick={() => handleSelectOpportunity(params.data)}
          >
            Select
          </Button>
        ),
      },
    ];

    // Excel columns for export/import
    const excelColumns: ExcelColumn[] = [
      {
        field: "opportunity_name",
        header: "Opportunity Name",
        required: true,
      },
      {
        field: "stage",
        header: "Stage",
        required: false,
      },
      {
        field: "amount",
        header: "Amount",
        required: false,
        type: "number",
      },
      {
        field: "expected_close_date",
        header: "Expected Close",
        required: false,
        type: "date",
      },
    ];

    return (
      <div className="min-h-screen bg-gray-50">
        <div className="p-6">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
                <Target className="h-8 w-8" />
                Create Quote
              </h1>
              <p className="text-muted-foreground">
                Select an opportunity to create a quote for.
              </p>
            </div>
            <Button variant="outline" onClick={handleBack}>
              Back to Quotes
            </Button>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Select Opportunity</CardTitle>
              <CardDescription>
                Choose an existing opportunity to attach this quote to.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {opportunities.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">
                    No opportunities available.
                  </p>
                </div>
              ) : (
                <DataGrid
                  data={opportunities}
                  loading={false}
                  columnDefs={columnDefs}
                  excelColumns={excelColumns}
                  fileName="opportunities"
                />
              )}
            </CardContent>
          </Card>

          {/* Debug info */}
          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Debug Info</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm">
                <div>
                  <strong>Current State:</strong> {currentState}
                </div>
                <div>
                  <strong>Selected Opportunity:</strong>{" "}
                  {context?.selectedOpportunity
                    ? context.selectedOpportunity.opportunity_name
                    : "None"}
                </div>
                <div>
                  <strong>Opportunities Count:</strong> {opportunities.length}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Show community selection when opportunity is selected
  if (
    currentState === "COMMUNITY_LOADING" ||
    currentState === "COMMUNITY_READY"
  ) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="p-6">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
                <Target className="h-8 w-8" />
                Create Quote
              </h1>
              <p className="text-muted-foreground">
                Community selection - Continuing to next steps...
              </p>
            </div>
            <Button variant="outline" onClick={handleBack}>
              Back to Quotes
            </Button>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Community Selection</CardTitle>
              <CardDescription>
                This step is under development. Continuing to next steps...
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button onClick={handleContinue}>Continue to Next Step</Button>
            </CardContent>
          </Card>

          {/* Debug info */}
          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Debug Info</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm">
                <div>
                  <strong>Current State:</strong> {currentState}
                </div>
                <div>
                  <strong>Selected Opportunity:</strong>{" "}
                  {context?.selectedOpportunity
                    ? context.selectedOpportunity.opportunity_name
                    : "None"}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Default fallback
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="p-6">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
              <Target className="h-8 w-8" />
              Create Quote
            </h1>
            <p className="text-muted-foreground">
              Quote creation in progress...
            </p>
          </div>
          <Button variant="outline" onClick={handleBack}>
            Back to Quotes
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Current State: {currentState}</CardTitle>
          </CardHeader>
          <CardContent>
            <p>This state is not yet implemented in the UI.</p>
            <Button onClick={handleContinue} className="mt-4">
              Continue
            </Button>
          </CardContent>
        </Card>

        {/* Debug info */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Debug Info</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm">
              <div>
                <strong>Current State:</strong> {currentState}
              </div>
              <pre className="text-xs bg-gray-100 p-2 rounded mt-2 overflow-auto max-h-40">
                {JSON.stringify(context, null, 2)}
              </pre>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
