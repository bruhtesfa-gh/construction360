import { createMachine, assign, createActor, fromPromise, log } from "xstate";
import { AddQuoteEvents, AddQuoteState } from "./states-enum";
import { SubcategoryOptionsType } from "@/types/options";
import db from "../db.json";
import api from "./api";

const RegionID = "8F79F517-2A8D-4DFF-98A9-1057FE9A8F30";

export interface Typegen0 {
  "@@xstate/typegen": true;
  internalEvents: {
    "xstate.init": { type: "xstate.init" };
  };
  invokeSrcNameMap: {};
  missingImplementations: {
    actions: never;
    delays: never;
    guards: never;
    services: never;
  };
  eventsCausingActions: {};
  eventsCausingDelays: {};
  eventsCausingGuards: {};
  eventsCausingServices: {};
  matchesStates: undefined;
  tags: never;
}

const fetchOpportunity = async (query: string) => {
  const response = await api.get(`quote/opportunity/`);
  if (response.status !== 200) {
    throw new Error("Failed to fetch opportunities");
  }
  return response.data.results;
};
const fetchCommunities = async (query: string) => {
  const [communitiesResponse, phasesResponse] = await Promise.all([
    api.get(`builder/community/detail/?RegionID=${RegionID}&search=${query}`),
    api.get("builder/community_phases"),
  ]);

  if (communitiesResponse.status !== 200 || phasesResponse.status !== 200) {
    throw new Error("Failed to fetch community data");
  }

  return {
    communities: communitiesResponse.data,
    communitiesPhases: phasesResponse.data,
  };
};

export const fetchLots = async (input: {
  CommunityID: string;
  CommunityPhaseID: string;
  OpportunityID: string;
}) => {
  const [contractsResponse, lotResponse] = await Promise.all([
    api.post(`quote/contracts/`, {
      CommunityID: input.CommunityID,
      OpportunityID: input.OpportunityID,
      RegionID: RegionID,
    }),
    api.get(
      `quote/lot/inventory/?CommunityID=${input.CommunityID}&CommunityPhaseID=${input.CommunityPhaseID}`
    ),
  ]);

  if (contractsResponse.status >= 300 || lotResponse.status >= 300) {
    throw new Error("Failed to fetch lots or create quote");
  }

  return {
    quote: contractsResponse.data,
    lots: lotResponse.data.results,
  };
};
export const fetchQuote = async () => {
  await new Promise((resolve) => setTimeout(resolve, 500));
  return db["contracts"];
};
export const fetchHomes = async () => {
  return await api.get(`quote/home/`).then((res) => res.data);
};
export const fetchHomeDetails = async (selectedHomeId: string) => {
  return await api.get(`quote/home/${selectedHomeId}`).then((res) => ({
    homeDetail: res.data,
    floorPlanRooms:
      db[
        "assembly/floorplan/room/?AssemblyID=8F79F517-2A8D-4DFF-98A9-1057FE9A8F30"
      ].data,
  }));
};
export const fetchInteriorExteriorOptions = async (
  selectedHome: Typegen["context"]["selectedHome"]
) => {
  await new Promise((resolve) => setTimeout(resolve, 500));
  return db[
    "assembly/options/subcategory/description/?RegionID=8F79F517-2A8D-4DFF-98A9-1057FE9A8F30&OptionCategoryCode=Flooring"
  ];
};

export const fetchDepositDetails = async () => {
  await new Promise((resolve) => setTimeout(resolve, 500));
  return {
    success: true,
    data: {
      deposits: [],
      totalDeposits: 0,
    },
  };
};

export const fetchFinancingDetails = async () => {
  await new Promise((resolve) => setTimeout(resolve, 500));
  return {
    success: true,
    data: {
      financingOptions: [
        { id: "fin-1", name: "Conventional", rate: 6.5 },
        { id: "fin-2", name: "FHA", rate: 5.8 },
      ],
    },
  };
};

export const fetchStructuralOptions = async (
  selectedHome: Typegen["context"]["selectedHomeDetails"]
) => {
  if (!selectedHome) {
    throw new Error("Selected home is required to fetch structural options");
  }
  const [elevationImages, optionCategories, elevationRooms] = await Promise.all(
    [
      api.get(
        `assembly/elevation/gallery/?RegionID=${RegionID}&FloorPlanCode=${selectedHome.FloorPlanCode}&ElevationCode=${selectedHome.ElevationCode}`
      ),
      api.get(`assembly/options/category/?RegionID=${RegionID}`),
      api.get(
        `assembly/floorplan/room/?AssemblyID=${selectedHome.FloorPlanAssemblyID}`
      ),
    ]
  );

  return {
    elevationImages: elevationImages.data,
    optionCategories: optionCategories.data,
    elevationRooms: elevationRooms.data,
  };
};

export const fetchFloorplanRoomSizes = async (AssemblyID: string) => {
  await new Promise((resolve) => setTimeout(resolve, 500));
  return {
    optionCategories:
      db[
        "assembly/options/category/?RegionID=8F79F517-2A8D-4DFF-98A9-1057FE9A8F30"
      ],
    elevationRooms:
      db[
        "assembly/floorplan/room/?AssemblyID=8F79F517-2A8D-4DFF-98A9-1057FE9A8F30"
      ],
  };
};
interface SelectedOptionsType {
  selectedSubcategories: {
    [key: string]: SubcategoryOptionsType;
  } | null;
  useStandardOptions: boolean;
}

const valid = (context: any, event: any) => {
  return event.data !== false;
};
export type Typegen = {
  context: {
    opportunities: typeof db.opportunities.results;
    selectedOpportunity: (typeof db.opportunities.results)[0] | null;
    communities: (typeof db)["community/detail/?RegionID=8F79F517-2A8D-4DFF-98A9-1057FE9A8F30&search="];
    lots: (typeof db)["quote/lot/inventory/?CommunityID=3D19CDA7-49AA-4974-93A4-4CC9986E5B8A&CommunityPhaseID=D77E73F5-62A5-418D-BA54-918BF7445651"]["results"];
    quote: (typeof db)["contracts"] | {};
    selectedCommunity:
      | (typeof db)["community/detail/?RegionID=8F79F517-2A8D-4DFF-98A9-1057FE9A8F30&search="][0]
      | null;
    selectedCommunityPhase: (typeof db)["community_phases"][0] | null;
    selectedCommunityPhases: (typeof db)["community_phases"];
    selectedLot:
      | (typeof db)["quote/lot/inventory/?CommunityID=3D19CDA7-49AA-4974-93A4-4CC9986E5B8A&CommunityPhaseID=D77E73F5-62A5-418D-BA54-918BF7445651"]["results"][0]
      | null;
    homeQuery: string;
    homeData: (typeof db)["quote/home"]["results"];
    selectedHome: (typeof db)["quote/home"]["results"][0] | null;
    homeDetails:
      | (typeof db)["quote/home/86EB5B1E-FCAB-49C3-A8F6-2EA1D12A2A53"]
      | null;
    selectedHomeId: string | null;
    selectedHomeDetails:
      | (typeof db)["quote/home/86EB5B1E-FCAB-49C3-A8F6-2EA1D12A2A53"]
      | null;
    elevationImages:
      | (typeof db)["assembly/elevation/gallery/?RegionID=8F79F517-2A8D-4DFF-98A9-1057FE9A8F30&FloorPlanCode=EC001&ElevationCode=Elev-001"]
      | null;
    optionCategories:
      | (typeof db)["assembly/options/category/?RegionID=8F79F517-2A8D-4DFF-98A9-1057FE9A8F30"]
      | null;
    elevationRooms:
      | (typeof db)["assembly/floorplan/room/?AssemblyID=8F79F517-2A8D-4DFF-98A9-1057FE9A8F30"]
      | null;
    floorPlanRooms: (typeof db)["assembly/floorplan/room/?AssemblyID=8F79F517-2A8D-4DFF-98A9-1057FE9A8F30"]["data"];
    detailValue: any[];
    selectedStructuralOptions: SelectedOptionsType;
    selectedInteriorExteriorOptions: SelectedOptionsType;
  };
};
const createQuoteMachine = createMachine(
  {
    /** @xstate-layout N4IgpgJg5mDOIC5gF8A0IB2B7CdGgGMAnMAQwBcwBFAVy0oFlSCALASwzHxAActY25NlgzcAHogCMAJnQBPKdOTLkQA */
    id: "createQuoteMachine",
    types: {
      context: {} as Typegen["context"],
    },
    context: {
      opportunities: [],
      selectedOpportunity: null,
      communities: [],
      lots: [],
      quote: {},
      selectedCommunity: null,
      selectedCommunityPhase: null,
      selectedLot: null,
      selectedCommunityPhases: [],
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
      selectedStructuralOptions: {} as SelectedOptionsType,
      selectedInteriorExteriorOptions: {} as SelectedOptionsType,
    },
    initial: AddQuoteState.OPPORTUNITY_LOADING,
    states: {
      [AddQuoteState.CHECKING_FOR_PRE_SELECTED_OPPORTUNITY]: {
        invoke: {
          src: "checkForSelectedOpportunity",
          onDone: [
            {
              guard: "valid",
              target: AddQuoteState.COMMUNITY_LOADING,
              actions: assign({
                selectedOpportunity: ({ event }) => event.output.data,
              }),
            },
            {
              target: AddQuoteState.OPPORTUNITY_LOADING,
            },
          ],
          onError: {
            target: AddQuoteState.CHECKING_FOR_PRE_SELECTED_OPPORTUNITY_ERROR,
          },
        },
      },
      [AddQuoteState.OPPORTUNITY_LOADING]: {
        invoke: {
          src: "loadOpportunities",
          onDone: {
            target: AddQuoteState.OPPORTUNITY_READY,
            actions: assign({
              opportunities: ({ event }) => event.output,
            }),
          },
          onError: {
            target: AddQuoteState.OPPORTUNITY_ERROR,
          },
        },
        on: {
          [AddQuoteEvents.OPPORTUNITY_SELECTED]: {
            target: AddQuoteState.COMMUNITY_LOADING,
            guard: ({ context, event }) =>
              !!event.payload &&
              context.opportunities.some(
                (o) => o.OpportunityID === event.payload.OpportunityID
              ),
            actions: assign({
              selectedOpportunity: ({ event }) => event.payload,
            }),
          },
        },
      },

      [AddQuoteState.OPPORTUNITY_READY]: {
        on: {
          [AddQuoteEvents.OPPORTUNITY_SELECTED]: {
            target: AddQuoteState.COMMUNITY_LOADING,
            guard: ({ context, event }) =>
              !!event.payload &&
              context.opportunities.some(
                (o) => o.OpportunityID === event.payload.OpportunityID
              ),
            actions: assign({
              selectedOpportunity: ({ event }) => event.payload,
            }),
          },
        },
      },

      [AddQuoteState.COMMUNITY_LOADING]: {
        invoke: {
          src: "loadCommunities",
          input: ({ context }) => ({
            opportunity: context.selectedOpportunity,
          }),
          onDone: {
            target: AddQuoteState.COMMUNITY_READY,
            actions: assign({
              communities: ({ event }) => event.output.communities,
              selectedCommunityPhases: ({ event }) =>
                event.output.communitiesPhases,
            }),
          },
          onError: {
            target: AddQuoteState.COMMUNITY_ERROR,
          },
        },
      },

      [AddQuoteState.COMMUNITY_READY]: {
        on: {
          [AddQuoteEvents.COMMUNITY_SELECTED]: {
            target: AddQuoteState.LOT_LOADING,
            guard: ({ context, event }) =>
              !!event.payload &&
              !!event.payload.selectedCommunity &&
              context.communities.find(
                (c) =>
                  c.CommunityID === event.payload.selectedCommunity.CommunityID
              ) !== undefined,
            actions: assign({
              selectedCommunity: ({ event }) => event.payload.selectedCommunity,
            }),
          },
          [AddQuoteEvents.COMMUNITY_AND_PHASE_SELECTED]: {
            target: AddQuoteState.LOT_LOADING,
            guard: ({ context, event }) =>
              !!event.payload &&
              !!event.payload.selectedCommunity &&
              !!event.payload.selectedPhaseId &&
              context.communities.find(
                (c) =>
                  c.CommunityID === event.payload.selectedCommunity.CommunityID
              ) !== undefined &&
              context.selectedCommunityPhases.find(
                (p) => p.CommunityPhaseID === event.payload.selectedPhaseId
              ) !== undefined,
            actions: assign({
              selectedCommunity: ({ context, event }) =>
                event.payload.selectedCommunity,
              selectedCommunityPhase: ({ context, event }) =>
                context.selectedCommunityPhases.find(
                  (p) => p.CommunityPhaseID === event.payload.selectedPhaseId
                ) || null,
            }),
          },
          [AddQuoteEvents.OPPORTUNITY_READY]: AddQuoteState.OPPORTUNITY_READY,
        },
      },

      [AddQuoteState.LOT_LOADING]: {
        invoke: {
          src: "loadLotsAndCreateQuote",
          input: ({ context }) => ({
            CommunityID: context.selectedCommunity?.CommunityID,
            CommunityPhaseID: context.selectedCommunityPhase?.CommunityPhaseID,
            OpportunityID: context.selectedOpportunity?.OpportunityID,
          }),
          onDone: {
            target: AddQuoteState.LOT_READY,
            actions: assign({
              lots: ({ event }) => event.output.lots,
              quote: ({ event }) => event.output.quote,
            }),
          },
          onError: {
            target: AddQuoteState.LOT_ERROR,
          },
        },
      },
      [AddQuoteState.CHECKING_FOR_PRE_SELECTED_OPPORTUNITY_ERROR]: {},
      [AddQuoteState.LOT_ERROR]: {},
      [AddQuoteState.COMMUNITY_SELECTED]: {},
      [AddQuoteState.OPPORTUNITY_ERROR]: {},
      [AddQuoteState.COMMUNITY_ERROR]: {},

      [AddQuoteState.LOT_READY]: {
        on: {
          [AddQuoteEvents.LOT_SELECTED]: {
            target: AddQuoteState.HOME_LOADING,
            guard: ({ context, event }) =>
              !!event.payload &&
              !!event.payload.selectedLotId &&
              context.lots.find(
                (l) => l.LotInventoryID === event.payload.selectedLotId
              ) !== undefined,
            actions: assign({
              selectedLot: ({ context, event }) =>
                context.lots.find(
                  (l) => l.LotInventoryID === event.payload.selectedLotId
                ) || null,
            }),
          },
          [AddQuoteEvents.COMMUNITY_READY]: AddQuoteState.COMMUNITY_READY,
          [AddQuoteEvents.OPPORTUNITY_READY]: AddQuoteState.OPPORTUNITY_READY,
        },
      },

      [AddQuoteState.HOME_LOADING]: {
        invoke: {
          src: "loadHomes",
          onDone: {
            target: AddQuoteState.HOME_READY,
            actions: assign({
              homeData: ({ event }) => event.output,
            }),
          },
          onError: {
            target: AddQuoteState.HOME_ERROR,
          },
        },
      },

      [AddQuoteState.HOME_READY]: {
        on: {
          [AddQuoteEvents.COMMUNITY_READY]: AddQuoteState.COMMUNITY_READY,
          [AddQuoteEvents.LOT_READY]: AddQuoteState.LOT_READY,
          [AddQuoteEvents.OPPORTUNITY_READY]: AddQuoteState.OPPORTUNITY_READY,
          [AddQuoteEvents.SELECT_HOME]: {
            target: AddQuoteState.HOME_SELECTED,
            guard: ({ context, event }) =>
              !!event.homeId &&
              context.homeData.find((h) => h.HomeID === event.homeId) !==
                undefined,
            actions: [
              assign({
                selectedHomeId: ({ context, event }) => event.homeId,
              }),
              "cacheAndMoveToNextStep",
            ],
          },
        },
      },

      [AddQuoteState.HOME_SELECTED]: {
        invoke: {
          src: "loadHomeDetails",
          input: ({ context }) => ({
            selectedHomeId: context.selectedHomeId,
          }),
          onDone: {
            target: AddQuoteState.HOME_DETAILS_READY,
            actions: assign({
              selectedHomeDetails: ({ event }) => event.output.homeDetail,
              floorPlanRooms: ({ event }) => event.output.floorPlanRooms,
            }),
          },
          onError: {
            target: AddQuoteState.HOME_DETAILS_ERROR,
          },
        },
      },

      [AddQuoteState.HOME_DETAILS_READY]: {
        on: {
          [AddQuoteEvents.HOME_SELECTED]: {
            target: AddQuoteState.STRUCTURAL_OPTIONS_LOADING,
            actions: "cacheAndMoveToNextStep",
          },
        },
      },

      [AddQuoteState.HOME_DETAILS_ERROR]: {
        on: {
          RETRY: AddQuoteState.HOME_LOADING,
          CANCEL: AddQuoteState.HOME_READY,
        },
      },

      [AddQuoteState.HOME_ERROR]: {
        entry: "handleHomeError",
        on: {
          RETRY: AddQuoteState.HOME_LOADING,
          CANCEL: AddQuoteState.HOME_READY,
        },
      },

      [AddQuoteState.STRUCTURAL_OPTIONS_LOADING]: {
        invoke: {
          src: "loadStructuralOptions",
          input: ({ context }) => ({
            selectedHome: context.selectedHomeDetails,
          }),
          onDone: {
            target: AddQuoteState.STRUCTURAL_OPTIONS_READY,
            actions: assign({
              elevationImages: ({ event }) => event.output.elevationImages,
              optionCategories: ({ event }) => event.output.optionCategories,
              elevationRooms: ({ event }) => event.output.elevationRooms,
            }),
          },
          onError: {
            target: AddQuoteState.OPPORTUNITY_ERROR,
          },
        },
      },
      [AddQuoteState.STRUCTURAL_OPTIONS_READY]: {
        on: {
          [AddQuoteEvents.STRUCTURAL_OPTIONS_SELECTED]: {
            target: AddQuoteState.INTERIOR_EXTERIOR_LOADING,
            actions: [
              assign({
                selectedStructuralOptions: ({ event }) => event?.payload,
              }),
              log(
                ({ context }) =>
                  `selected structural options ${context.selectedStructuralOptions.selectedSubcategories}`
              ),
            ],
          },
          [AddQuoteEvents.HOME_READY]: AddQuoteState.HOME_READY,
          [AddQuoteEvents.COMMUNITY_READY]: AddQuoteState.COMMUNITY_READY,
          [AddQuoteEvents.LOT_READY]: AddQuoteState.LOT_READY,
          [AddQuoteEvents.OPPORTUNITY_READY]: AddQuoteState.OPPORTUNITY_READY,
        },
      },
      [AddQuoteState.INTERIOR_EXTERIOR_LOADING]: {
        invoke: {
          src: "loadInteriorExteriorOptions",
          onDone: {
            target: AddQuoteState.INTERIOR_EXTERIOR_READY,
            actions: assign({
              // Add context assignments for interior/exterior options
            }),
          },
          onError: {
            target: AddQuoteState.INTERIOR_EXTERIOR_ERROR,
          },
        },
      },

      [AddQuoteState.INTERIOR_EXTERIOR_ERROR]: {
        on: {
          RETRY: AddQuoteState.INTERIOR_EXTERIOR_LOADING,
          CANCEL: AddQuoteState.STRUCTURAL_OPTIONS_READY,
        },
      },

      [AddQuoteState.DEPOSIT_DETAILS_LOADING]: {
        invoke: {
          src: "loadDepositDetails",
          onDone: {
            target: AddQuoteState.DEPOSIT_DETAILS_READY,
            actions: assign({
              detailValue: ({ event }) => event.output,
            }),
          },
          onError: {
            target: AddQuoteState.DEPOSIT_DETAILS_ERROR,
          },
        },
        on: {
          [AddQuoteEvents.DEPOSIT_DETAILS_LOADED]: {
            actions: assign({
              detailValue: ({ event }) => event.data,
            }),
          },
        },
      },

      [AddQuoteState.DEPOSIT_DETAILS_ERROR]: {},
      [AddQuoteState.INTERIOR_EXTERIOR_READY]: {
        on: {
          [AddQuoteEvents.INTERIOR_EXTERIOR_SELECTED]: {
            target: AddQuoteState.DEPOSIT_DETAILS_LOADING,
            actions: [
              assign({
                selectedInteriorExteriorOptions: ({ event }) => event?.payload,
              }),
              log(
                ({ context }) =>
                  `selected interior exterior options ${context.selectedInteriorExteriorOptions.selectedSubcategories}`
              ),
            ],
          },
          [AddQuoteEvents.STRUCTURAL_OPTIONS_READY]:
            AddQuoteState.STRUCTURAL_OPTIONS_READY,
          [AddQuoteEvents.HOME_READY]: AddQuoteState.HOME_READY,
          [AddQuoteEvents.COMMUNITY_READY]: AddQuoteState.COMMUNITY_READY,
          [AddQuoteEvents.LOT_READY]: AddQuoteState.LOT_READY,
          [AddQuoteEvents.OPPORTUNITY_READY]: AddQuoteState.OPPORTUNITY_READY,
        },
      },
      [AddQuoteState.DEPOSIT_DETAILS_READY]: {
        on: {
          [AddQuoteEvents.DEPOSIT_DETAILS_NEXT]: {
            target: AddQuoteState.FINANCING_DETAILS_LOADING,
          },
          [AddQuoteEvents.INTERIOR_EXTERIOR_READY]:
            AddQuoteState.INTERIOR_EXTERIOR_READY,
          [AddQuoteEvents.STRUCTURAL_OPTIONS_READY]:
            AddQuoteState.STRUCTURAL_OPTIONS_READY,
          [AddQuoteEvents.HOME_READY]: AddQuoteState.HOME_READY,
          [AddQuoteEvents.COMMUNITY_READY]: AddQuoteState.COMMUNITY_READY,
          [AddQuoteEvents.LOT_READY]: AddQuoteState.LOT_READY,
          [AddQuoteEvents.OPPORTUNITY_READY]: AddQuoteState.OPPORTUNITY_READY,
        },
      },
      [AddQuoteState.FINANCING_DETAILS_LOADING]: {
        invoke: {
          src: "loadFinancingDetails",
          onDone: {
            target: AddQuoteState.FINANCING_DETAILS_READY,
            actions: assign({
              // Add context assignments for financing details
            }),
          },
          onError: {
            target: AddQuoteState.FINANCING_DETAILS_ERROR,
          },
        },
      },

      [AddQuoteState.FINANCING_DETAILS_READY]: {
        // Final state - quote is complete
        type: "final",
      },

      [AddQuoteState.FINANCING_DETAILS_ERROR]: {
        on: {
          RETRY: AddQuoteState.FINANCING_DETAILS_LOADING,
          CANCEL: AddQuoteState.DEPOSIT_DETAILS_READY,
        },
      },
    },
  },
  {
    actors: {
      loadOpportunities: fromPromise(async () => await fetchOpportunity("")),
      loadCommunities: fromPromise(
        async ({
          input,
        }: {
          input: { opportunity: Typegen["context"]["selectedOpportunity"] };
        }) => await fetchCommunities("")
      ),
      loadLotsAndCreateQuote: fromPromise(
        async ({
          input,
        }: {
          input: {
            CommunityID: string;
            CommunityPhaseID: string;
            OpportunityID: string;
          };
        }) => {
          console.log("loadLotsAndCreateQuote input", input);
          const { CommunityID, CommunityPhaseID, OpportunityID } = input;
          console.log(CommunityID, CommunityPhaseID, OpportunityID);
          const { lots, quote } = await fetchLots({
            CommunityID,
            CommunityPhaseID,
            OpportunityID,
          });
          return { lots, quote };
        }
      ),
      loadHomes: fromPromise(async () => (await fetchHomes()).results),
      loadHomeDetails: fromPromise(
        async ({ input }: { input: { selectedHomeId: string } }) =>
          await fetchHomeDetails(input.selectedHomeId)
      ),
      loadStructuralOptions: fromPromise(
        async ({
          input,
        }: {
          input: { selectedHome: Typegen["context"]["selectedHomeDetails"] };
        }) => {
          return await fetchStructuralOptions(input.selectedHome);
        }
      ),
      loadInteriorExteriorOptions: fromPromise(
        async ({
          input,
        }: {
          input: { selectedHome: Typegen["context"]["selectedHome"] };
        }) => await fetchInteriorExteriorOptions(input.selectedHome)
      ),
      loadDepositDetails: fromPromise(async () => await fetchDepositDetails()),
      loadFinancingDetails: fromPromise(
        async () => await fetchFinancingDetails()
      ),
      checkForSelectedOpportunity: fromPromise(
        async () => (await fetchOpportunity(""))[0] || false
      ),
    },
    actions: {},
    guards: {
      valid: ({ event }) => {
        // In v5, the resolved data from an actor is in `event.output`
        return event.output !== false;
      },
    },
  }
);

export { createQuoteMachine };
