import { createQuoteMachine } from "@/core/xstate/state-machines/create-quote-machine";
import { Actor } from "xstate";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import { useState } from "react";
import { useSelector } from "@xstate/react";
import { format } from "date-fns";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

// Define props for the OpportunitiesTable component
interface OpportunitiesTableProps {
  quoteActor: Actor<typeof createQuoteMachine>;
}

const OpportunitiesTable = ({ quoteActor }: OpportunitiesTableProps) => {
  const { opportunities } = useSelector(
    quoteActor,
    (snapshot) => snapshot.context
  );
  const [selectedOpportunity, setSelectedOpportunity] = useState(
    opportunities[0] || null
  );

  const handleConfirmSelection = () => {
    if (selectedOpportunity) {
      quoteActor.send({
        type: "OPPORTUNITY_SELECTED",
        payload: selectedOpportunity,
      });
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {/* Left: Opportunities List */}
      <div className="md:col-span-2">
        <Card>
          <CardHeader>
            <Input placeholder="Search Opportunities" />
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>CONTACT</TableHead>
                  <TableHead>REGION</TableHead>
                  <TableHead>DESCRIPTION</TableHead>
                  <TableHead>COMMUNITY</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {opportunities.map((opportunity) => (
                  <TableRow
                    key={opportunity.OpportunityID}
                    onClick={() => setSelectedOpportunity(opportunity)}
                    className={`cursor-pointer ${
                      selectedOpportunity?.OpportunityID ===
                      opportunity.OpportunityID
                        ? "bg-muted"
                        : ""
                    }`}
                  >
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar>
                          <AvatarImage
                            src={opportunity.Contact1ID?.ImageID}
                            alt={opportunity.Contact1ID?.FullName}
                          />
                          <AvatarFallback>
                            {opportunity.Contact1ID?.FullName.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">
                            {opportunity.Contact1ID?.FullName}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {opportunity.Contact1ID?.Email}
                          </p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>{opportunity.RegionCode}</TableCell>
                    <TableCell>{opportunity.Description}</TableCell>
                    <TableCell>{opportunity.CommunityCode}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      {/* Right: Details Pane */}
      <div className="md:col-span-1">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg">Basic Detail</CardTitle>
            <Button
              onClick={handleConfirmSelection}
              disabled={!selectedOpportunity}
            >
              Select
            </Button>
          </CardHeader>
          <CardContent className="space-y-4">
            {selectedOpportunity ? (
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold">Comments</h3>
                  <p className="text-muted-foreground">
                    {selectedOpportunity.Comments || "N/A"}
                  </p>
                </div>
                <div>
                  <h3 className="font-semibold">Description</h3>
                  <p className="text-muted-foreground">
                    {selectedOpportunity.Description || "N/A"}
                  </p>
                </div>
                <div>
                  <h3 className="font-semibold">Region</h3>
                  <p className="text-muted-foreground">
                    {selectedOpportunity.RegionName || "N/A"}
                  </p>
                </div>
                <div>
                  <h3 className="font-semibold">Community Code</h3>
                  <p className="text-muted-foreground">
                    {selectedOpportunity.CommunityCode || "N/A"}
                  </p>
                </div>
                <div>
                  <h3 className="font-semibold">CreatedDate</h3>
                  <p className="text-muted-foreground">
                    {selectedOpportunity.CreatedDate
                      ? format(new Date(selectedOpportunity.CreatedDate), "PPP")
                      : "Invalid Date"}
                  </p>
                </div>
                <div>
                  <h3 className="font-semibold">RatingDescription</h3>
                  <p className="text-muted-foreground">
                    {selectedOpportunity.RatingDescription || "N/A"}
                  </p>
                </div>
                <div>
                  <h3 className="font-semibold">Contacts</h3>
                  <div className="space-y-2 mt-2">
                    {[
                      selectedOpportunity.Contact1ID,
                      selectedOpportunity.Contact2ID,
                      selectedOpportunity.Contact3ID,
                      selectedOpportunity.Contact4ID,
                      selectedOpportunity.Contact5ID,
                    ].map((contact, index) =>
                      contact ? (
                        <div
                          key={index}
                          className="flex items-center justify-between p-2 rounded-md bg-muted"
                        >
                          <div className="flex items-center gap-3">
                            <Avatar className="h-8 w-8">
                              <AvatarImage
                                src={contact.ImageID}
                                alt={contact.FullName}
                              />
                              <AvatarFallback>
                                {contact.FullName.charAt(0)}
                              </AvatarFallback>
                            </Avatar>
                            <span>{contact.FullName}</span>
                          </div>
                          <Button variant="link" size="sm">
                            Details
                          </Button>
                        </div>
                      ) : null
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <p className="text-muted-foreground">
                Select an opportunity to see details.
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default OpportunitiesTable;
