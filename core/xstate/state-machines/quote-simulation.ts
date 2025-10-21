import { createActor } from "xstate";
import { createQuoteMachine } from "./create-quote-machine";

// Create an actor instance
const quoteActor = createActor(createQuoteMachine);

// Subscribe to state changes
quoteActor.subscribe((snapshot) => {
  console.log("Current state:", snapshot.value);
  console.log("Context:", snapshot.context);
  console.log("---");
});

// Start the machine
console.log("Starting quote creation process...");
quoteActor.start();

// Example simulation of state transitions
async function simulateQuoteCreation() {
  // Wait for initial loading
  await new Promise((resolve) => setTimeout(resolve, 600));
  console.log("Opportunities loaded");

  // Select an opportunity
  quoteActor.send({
    type: "OPPORTUNITY_SELECTED",
    payload: { id: "opp-1", name: "Smith Family Opportunity" },
  });

  // Wait for communities to load
  await new Promise((resolve) => setTimeout(resolve, 600));
  console.log("Communities loaded");

  // Select community and phase
  quoteActor.send({
    type: "COMMUNITY_AND_PHASE_SELECTED",
    payload: {
      community: { id: "comm-1", name: "Sunset Valley" },
      phase: { id: "phase-1", name: "Phase 1" },
    },
  });

  // Wait for lots and quote creation
  await new Promise((resolve) => setTimeout(resolve, 1200));
  console.log("Lots loaded and quote created");

  // Select a lot
  quoteActor.send({
    type: "LOT_SELECTED",
  });

  // Wait for homes to load
  await new Promise((resolve) => setTimeout(resolve, 600));
  console.log("Homes loaded");

  // Select a home
  quoteActor.send({
    type: "SELECT_HOME",
    homeId: "home-123",
  });

  // Wait for home details
  await new Promise((resolve) => setTimeout(resolve, 600));
  console.log("Home details loaded");

  // Move to structural options
  quoteActor.send({
    type: "HOME_SELECTED",
  });

  // Wait for structural options
  await new Promise((resolve) => setTimeout(resolve, 600));
  console.log("Structural options loaded");

  // Select structural options
  quoteActor.send({
    type: "STRUCTURAL_OPTIONS_SELECTED",
    payload: {
      selectedSubcategories: { foundation: "standard" },
      useStandardOptions: true,
    },
  });

  // Wait for interior/exterior options
  await new Promise((resolve) => setTimeout(resolve, 600));
  console.log("Interior/Exterior options loaded");

  // Select interior/exterior options
  quoteActor.send({
    type: "INTERIOR_EXTERIOR_SELECTED",
    payload: {
      selectedSubcategories: { interior: "modern", exterior: "brick" },
      useStandardOptions: false,
    },
  });

  // Wait for deposit details
  await new Promise((resolve) => setTimeout(resolve, 600));
  console.log("Deposit details loaded");

  // Move to financing
  quoteActor.send({
    type: "DEPOSIT_DETAILS_NEXT",
  });

  // Wait for financing details
  await new Promise((resolve) => setTimeout(resolve, 600));
  console.log("Financing details loaded");

  console.log("Quote creation process completed!");
}

// Run the simulation
simulateQuoteCreation().catch(console.error);

// Example of different states you might encounter:

export const EXAMPLE_STATES = {
  // Initial loading state
  OPPORTUNITY_LOADING: {
    value: "OPPORTUNITY_LOADING",
    context: {
      opportunities: [],
      selectedOpportunity: {},
      communities: [],
      lots: [],
      quote: {},
      selectedCommunity: {},
      selectedCommunityPhase: {},
      homeQuery: "",
      homeData: [],
      selectedHome: [],
      homeDetails: {},
      selectedHomeId: null,
      selectedHomeDetails: {},
      elevationImages: [],
      optionCategories: [],
      elevationRooms: [],
      floorPlanRooms: [],
      detailValue: [],
      selectedStructuralOptions: {
        selectedSubcategories: null,
        useStandardOptions: false,
      },
      selectedInteriorExteriorOptions: {
        selectedSubcategories: null,
        useStandardOptions: false,
      },
    },
  },

  // After selecting opportunity
  OPPORTUNITY_SELECTED: {
    value: "COMMUNITY_LOADING",
    context: {
      opportunities: [
        {
          id: "opp-1",
          name: "Smith Family",
          buyer: "John Smith",
          stage: "Qualified",
          budget: "$500K",
          expectedClose: "2024-06-01",
          notes: "Looking for 4 bedroom home",
        },
      ],
      selectedOpportunity: { id: "opp-1", name: "Smith Family Opportunity" },
      communities: [],
      lots: [],
      quote: {},
      selectedCommunity: {},
      selectedCommunityPhase: {},
      homeQuery: "",
      homeData: [],
      selectedHome: [],
      homeDetails: {},
      selectedHomeId: null,
      selectedHomeDetails: {},
      elevationImages: [],
      optionCategories: [],
      elevationRooms: [],
      floorPlanRooms: [],
      detailValue: [],
      selectedStructuralOptions: {
        selectedSubcategories: null,
        useStandardOptions: false,
      },
      selectedInteriorExteriorOptions: {
        selectedSubcategories: null,
        useStandardOptions: false,
      },
    },
  },

  // After selecting community and phase
  COMMUNITY_PHASE_SELECTED: {
    value: "LOT_LOADING",
    context: {
      opportunities: [
        {
          id: "opp-1",
          name: "Smith Family",
          buyer: "John Smith",
          stage: "Qualified",
          budget: "$500K",
          expectedClose: "2024-06-01",
          notes: "Looking for 4 bedroom home",
        },
      ],
      selectedOpportunity: { id: "opp-1", name: "Smith Family Opportunity" },
      communities: [
        {
          id: "comm-1",
          name: "Sunset Valley",
          phases: [
            { id: "phase-1", name: "Phase 1" },
            { id: "phase-2", name: "Phase 2" },
          ],
        },
      ],
      lots: [],
      quote: {},
      selectedCommunity: { id: "comm-1", name: "Sunset Valley" },
      selectedCommunityPhase: { id: "phase-1", name: "Phase 1" },
      homeQuery: "",
      homeData: [],
      selectedHome: [],
      homeDetails: {},
      selectedHomeId: null,
      selectedHomeDetails: {},
      elevationImages: [],
      optionCategories: [],
      elevationRooms: [],
      floorPlanRooms: [],
      detailValue: [],
      selectedStructuralOptions: {
        selectedSubcategories: null,
        useStandardOptions: false,
      },
      selectedInteriorExteriorOptions: {
        selectedSubcategories: null,
        useStandardOptions: false,
      },
    },
  },

  // After selecting home and moving to options
  HOME_SELECTED_OPTIONS_READY: {
    value: "STRUCTURAL_OPTIONS_READY",
    context: {
      opportunities: [
        {
          id: "opp-1",
          name: "Smith Family",
          buyer: "John Smith",
          stage: "Qualified",
          budget: "$500K",
          expectedClose: "2024-06-01",
          notes: "Looking for 4 bedroom home",
        },
      ],
      selectedOpportunity: { id: "opp-1", name: "Smith Family Opportunity" },
      communities: [
        {
          id: "comm-1",
          name: "Sunset Valley",
          phases: [
            { id: "phase-1", name: "Phase 1" },
            { id: "phase-2", name: "Phase 2" },
          ],
        },
      ],
      lots: [
        {
          id: "lot-1",
          lotNumber: "A-001",
          block: "Block A",
          status: "Available",
          size: "0.25 acres",
        },
      ],
      quote: {
        id: "quote-1",
        contractName: "Smith Family Quote",
        status: "Draft",
      },
      selectedCommunity: { id: "comm-1", name: "Sunset Valley" },
      selectedCommunityPhase: { id: "phase-1", name: "Phase 1" },
      homeQuery: "",
      homeData: [
        {
          id: "home-1",
          name: "Colonial",
          basePrice: 450000,
          bedrooms: 4,
          bathrooms: 3,
        },
        {
          id: "home-2",
          name: "Ranch",
          basePrice: 380000,
          bedrooms: 3,
          bathrooms: 2,
        },
      ],
      selectedHome: ["home-1"],
      homeDetails: {},
      selectedHomeId: "home-1",
      selectedHomeDetails: {
        id: "home-1",
        name: "Colonial Style Home",
        basePrice: 450000,
        squareFootage: 2800,
      },
      elevationImages: [],
      optionCategories: [
        { id: "foundation", name: "Foundation Options", options: [] },
        { id: "roof", name: "Roof Options", options: [] },
      ],
      elevationRooms: [],
      floorPlanRooms: [
        { id: "living", name: "Living Room", size: "20x15" },
        { id: "kitchen", name: "Kitchen", size: "15x12" },
        { id: "master", name: "Master Bedroom", size: "16x14" },
      ],
      detailValue: [],
      selectedStructuralOptions: {
        selectedSubcategories: null,
        useStandardOptions: false,
      },
      selectedInteriorExteriorOptions: {
        selectedSubcategories: null,
        useStandardOptions: false,
      },
    },
  },

  // Final completed state
  QUOTE_COMPLETED: {
    value: "FINANCING_DETAILS_READY",
    context: {
      opportunities: [
        {
          id: "opp-1",
          name: "Smith Family",
          buyer: "John Smith",
          stage: "Qualified",
          budget: "$500K",
          expectedClose: "2024-06-01",
          notes: "Looking for 4 bedroom home",
        },
      ],
      selectedOpportunity: { id: "opp-1", name: "Smith Family Opportunity" },
      communities: [
        {
          id: "comm-1",
          name: "Sunset Valley",
          phases: [
            { id: "phase-1", name: "Phase 1" },
            { id: "phase-2", name: "Phase 2" },
          ],
        },
      ],
      lots: [
        {
          id: "lot-1",
          lotNumber: "A-001",
          block: "Block A",
          status: "Available",
          size: "0.25 acres",
        },
      ],
      quote: {
        id: "quote-1",
        contractName: "Smith Family Quote",
        status: "Draft",
      },
      selectedCommunity: { id: "comm-1", name: "Sunset Valley" },
      selectedCommunityPhase: { id: "phase-1", name: "Phase 1" },
      homeQuery: "",
      homeData: [
        {
          id: "home-1",
          name: "Colonial",
          basePrice: 450000,
          bedrooms: 4,
          bathrooms: 3,
        },
        {
          id: "home-2",
          name: "Ranch",
          basePrice: 380000,
          bedrooms: 3,
          bathrooms: 2,
        },
      ],
      selectedHome: ["home-1"],
      homeDetails: {},
      selectedHomeId: "home-1",
      selectedHomeDetails: {
        id: "home-1",
        name: "Colonial Style Home",
        basePrice: 450000,
        squareFootage: 2800,
      },
      elevationImages: [],
      optionCategories: [
        { id: "foundation", name: "Foundation Options", options: [] },
        { id: "roof", name: "Roof Options", options: [] },
      ],
      elevationRooms: [],
      floorPlanRooms: [
        { id: "living", name: "Living Room", size: "20x15" },
        { id: "kitchen", name: "Kitchen", size: "15x12" },
        { id: "master", name: "Master Bedroom", size: "16x14" },
      ],
      detailValue: [],
      selectedStructuralOptions: {
        selectedSubcategories: {
          foundation: "crawlspace",
          roof: "architectural",
        },
        useStandardOptions: false,
      },
      selectedInteriorExteriorOptions: {
        selectedSubcategories: { interior: "modern", exterior: "brick" },
        useStandardOptions: false,
      },
    },
  },
};

console.log("\nExample states for reference:");
console.log("Available states:", Object.keys(EXAMPLE_STATES));
