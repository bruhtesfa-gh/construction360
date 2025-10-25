import { useState } from "react";
import { Search, ChevronRight } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

interface Opportunity {
  id: string;
  contact: {
    name: string;
    email: string;
    avatar?: string;
  };
  region: string;
  description: string;
  community: string;
  communityCode: string;
  createdDate: string;
  ratingDescription: string;
  contacts: Array<{
    name: string;
    address: string;
    phone: string;
    region: string;
  }>;
}

const mockOpportunities: Opportunity[] = [
  {
    id: "1",
    contact: {
      name: "Ben Jackson",
      email: "ben.jackson@example.com",
    },
    region: "AZ",
    description: "JV Demo New",
    community: "Arbor Creek",
    communityCode: "C0013",
    createdDate: "07/03/2025",
    ratingDescription: "Description For the Referral2 2",
    contacts: [
      { name: "Ben Jackson", address: "123 Main St", phone: "(987)654-3210", region: "NY" },
      { name: "Hanna Mason", address: "123 Main St", phone: "(987)654-3210", region: "NY" },
    ],
  },
  {
    id: "2",
    contact: { name: "Contact 2", email: "contact2@example.com" },
    region: "AZ",
    description: "Opp Test",
    community: "Naples Reserve",
    communityCode: "C0013",
    createdDate: "07/03/2025",
    ratingDescription: "Test opportunity",
    contacts: [],
  },
  {
    id: "3",
    contact: { name: "Contact 3", email: "contact3@example.com" },
    region: "AZ",
    description: "JV Opportunity",
    community: "Honey Court",
    communityCode: "C0012",
    createdDate: "07/03/2025",
    ratingDescription: "New JV venture",
    contacts: [],
  },
];

interface OpportunityListProps {
  onSelect: (opportunity: Opportunity) => void;
}

export const OpportunityList = ({ onSelect }: OpportunityListProps) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(mockOpportunities[0].id);

  const selectedOpportunity = mockOpportunities.find((o) => o.id === selectedId);

  return (
    <div className="flex h-full">
      {/* Main List */}
      <div className="flex-1 p-6">
        <div className="mb-6 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
          <Input
            placeholder="Search Opportunities"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        <div className="space-y-3">
          {mockOpportunities.map((opp) => (
            <Card
              key={opp.id}
              className={`cursor-pointer transition-all hover:shadow-md ${
                selectedId === opp.id ? "ring-2 ring-primary" : ""
              }`}
              onClick={() => setSelectedId(opp.id)}
            >
              <CardContent className="p-4">
                <div className="grid grid-cols-4 gap-4 items-center">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
                      {opp.contact.avatar ? (
                        <img src={opp.contact.avatar} alt={opp.contact.name} className="w-full h-full rounded-full" />
                      ) : (
                        <span className="text-sm font-medium">{opp.contact.name.charAt(0)}</span>
                      )}
                    </div>
                    <div>
                      <div className="font-medium">{opp.contact.name}</div>
                      <div className="text-sm text-muted-foreground">{opp.contact.email}</div>
                    </div>
                  </div>
                  <div className="text-foreground">{opp.region}</div>
                  <div className="text-foreground">{opp.description}</div>
                  <div className="text-foreground">{opp.communityCode}</div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Detail Panel */}
      {selectedOpportunity && (
        <div className="w-96 border-l border-border bg-muted/30 p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-semibold">Basic Detail</h3>
            <Button onClick={() => onSelect(selectedOpportunity)}>
              Select <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          </div>

          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="text-sm font-medium mb-1">Comments</div>
                <div className="text-sm text-muted-foreground">{selectedOpportunity.description}</div>
              </div>
              <div>
                <div className="text-sm font-medium mb-1">Community Code</div>
                <div className="text-sm text-muted-foreground">{selectedOpportunity.communityCode}</div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="text-sm font-medium mb-1">Description</div>
                <div className="text-sm text-muted-foreground">{selectedOpportunity.description}</div>
              </div>
              <div>
                <div className="text-sm font-medium mb-1">Created Date</div>
                <div className="text-sm text-muted-foreground">{selectedOpportunity.createdDate}</div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="text-sm font-medium mb-1">Region</div>
                <div className="text-sm text-muted-foreground">{selectedOpportunity.region}</div>
              </div>
              <div>
                <div className="text-sm font-medium mb-1">Rating Description</div>
                <div className="text-sm text-muted-foreground">{selectedOpportunity.ratingDescription}</div>
              </div>
            </div>

            {selectedOpportunity.contacts.length > 0 && (
              <div>
                <div className="text-sm font-medium mb-3">Contacts</div>
                <div className="space-y-3">
                  {selectedOpportunity.contacts.map((contact, index) => (
                    <div key={index} className="flex items-start justify-between p-3 bg-background rounded-lg">
                      <div className="flex items-start gap-3">
                        <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center">
                          <span className="text-sm font-medium">{contact.name.charAt(0)}</span>
                        </div>
                        <div>
                          <div className="font-medium">{contact.name}</div>
                          <div className="text-sm text-muted-foreground">{contact.address}</div>
                          <div className="text-sm text-muted-foreground">{contact.phone}</div>
                        </div>
                      </div>
                      <div className="text-sm">{contact.region}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
