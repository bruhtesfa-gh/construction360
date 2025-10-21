"use client";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Actor } from "xstate";
import {
  createQuoteMachine,
  Typegen,
} from "@/core/xstate/state-machines/create-quote-machine";
import { useSelector } from "@xstate/react";
import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft, Search } from "lucide-react";
import { AddQuoteEvents } from "@/core/xstate";

interface ICommunitiesProps {
  quoteActor: Actor<typeof createQuoteMachine>;
}

// type Community = {
//   CommunityID: string;
//   CommunityCode: string;
//   Description: string;
//   RegionID: string;
//   Email?: string;
//   MobilePhone?: string;
//   Address1?: string;
//   Fax?: string;
//   HomePhone?: string;
//   State?: string;
//   CommunityPhase?: { PhaseID: string; PhaseName: string }[];
//   ImageUrl?: string;
// };

const Communities = ({ quoteActor }: ICommunitiesProps) => {
  const state = useSelector(quoteActor, (snapshot) => snapshot.context);
  const { communities, selectedCommunityPhases } = state;
  const [selectedCommunity, setSelectedCommunity] =
    useState<Typegen["context"]["selectedCommunity"]>(null);
  const [selectedPhase, setSelectedPhase] = useState<string | null>(null);

  useEffect(() => {
    console.log("Selected Phase changed: ", selectedPhase);
  }, [selectedPhase]);

  const handleProceed = () => {
    quoteActor.send({
      type: selectedCommunity ? AddQuoteEvents.COMMUNITY_AND_PHASE_SELECTED : AddQuoteEvents.COMMUNITY_SELECTED,
      payload: {
        selectedCommunity: selectedCommunity,
        selectedPhaseId: selectedPhase,
      },
    });
    if (selectedCommunity) {
    }
  };

  // const handleProceedWithoutPhase = () => {
  //   if (selectedCommunity) {
  //     quoteActor.send({
  //       type: "COMMUNITY_SELECTED",
  //       payload: {
  //         selectedCommunity: selectedCommunity,
  //         selectedPhaseId: null,
  //       },
  //     });
  //   }
  // };

  return (
    <div className="flex flex-col lg:flex-row gap-6">
      {/* Left Column */}
      <div className="lg:w-2/3">
        <Card>
          <CardHeader>
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Search Communities..." className="pl-8" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {(communities as Typegen["context"]["communities"]).map(
                (community) => (
                  <Card
                    key={community.CommunityID}
                    className={`cursor-pointer transition-all ${
                      selectedCommunity?.CommunityID === community.CommunityID
                        ? "border-primary ring-2 ring-primary"
                        : "border-border"
                    }`}
                    onClick={() => setSelectedCommunity(community)}
                  >
                    <CardContent className="p-0">
                      <div className="relative h-40 w-full">
                        <img
                          src={community.LotMapImageID || "/placeholder.svg"}
                          className="rounded-t-lg object-cover w-full h-full"
                        />
                      </div>
                      <div className="p-4">
                        <p className="text-sm font-medium text-muted-foreground">
                          {community.CommunityCode}
                        </p>
                        <h3 className="text-lg font-semibold">
                          {community.Description}
                        </h3>
                        <p className="text-sm text-muted-foreground mt-1">
                          Address: {community.Address1}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          State: {community.State}
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                )
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Right Column */}
      <div className="lg:w-1/3">
        <Card>
          <CardHeader>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => quoteActor.send({ type: "BACK_TO_OPPORTUNITIES" })}
              className="mb-4"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Button>
            <CardTitle>Community Detail</CardTitle>
          </CardHeader>
          <CardContent>
            {selectedCommunity ? (
              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="font-semibold">Email</p>
                    <p className="text-muted-foreground">
                      {selectedCommunity.Email || "N/A"}
                    </p>
                  </div>
                  <div>
                    <p className="font-semibold">Fax</p>
                    <p className="text-muted-foreground">
                      {selectedCommunity.Fax || "N/A"}
                    </p>
                  </div>
                  <div>
                    <p className="font-semibold">Mobile Phone</p>
                    <p className="text-muted-foreground">
                      {selectedCommunity.MobilePhone || "N/A"}
                    </p>
                  </div>
                  <div>
                    <p className="font-semibold">Home Phone</p>
                    <p className="text-muted-foreground">
                      {selectedCommunity.HomePhone || "N/A"}
                    </p>
                  </div>
                  <div>
                    <p className="font-semibold">Address 1</p>
                    <p className="text-muted-foreground">
                      {selectedCommunity.Address1 || "N/A"}
                    </p>
                  </div>
                  <div>
                    <p className="font-semibold">State</p>
                    <p className="text-muted-foreground">
                      {selectedCommunity.State || "N/A"}
                    </p>
                  </div>
                </div>

                <Separator />

                <div>
                  <h4 className="font-semibold mb-2">Community Phase</h4>
                  <Select
                    onValueChange={setSelectedPhase}
                    disabled={!selectedCommunityPhases.length}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select Community Phase" />
                    </SelectTrigger>
                    <SelectContent>
                      {selectedCommunityPhases.map((phase) => (
                        <SelectItem
                          key={phase.CommunityPhaseID}
                          value={phase.CommunityPhaseID}
                        >
                          {phase.CommunityPhaseCode}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Button
                    className="w-full"
                    onClick={handleProceed}
                    disabled={!selectedCommunity || !selectedPhase}
                  >
                    Proceed
                  </Button>
                  <Button
                    variant="link"
                    className="w-full"
                    onClick={handleProceed}
                    disabled={!selectedCommunity}
                  >
                    Proceed without Community Phase
                  </Button>
                </div>
              </div>
            ) : (
              <div className="text-center text-muted-foreground py-12">
                <p>Select a community to see details.</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Communities;
