import { useState } from "react";
import { Search, ChevronRight, MapPin } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

interface Community {
  id: string;
  name: string;
  code: string;
  address: string;
  state: string;
  mapImage: string;
  email: string;
  mobilePhone: string;
  homePhone: string;
  fax: string;
}

const mockCommunities: Community[] = [
  {
    id: "1",
    name: "Arbor Creek",
    code: "C0013",
    address: "260Morris Street",
    state: "Texas",
    mapImage: "/placeholder.svg",
    email: "community2@test.com",
    mobilePhone: "210-288-3393",
    homePhone: "830-370-0837",
    fax: "",
  },
  {
    id: "2",
    name: "Naples Reserve",
    code: "C0012",
    address: "1626 Echo Lane",
    state: "Michigan",
    mapImage: "/placeholder.svg",
    email: "community@test.com",
    mobilePhone: "210-288-3393",
    homePhone: "830-370-0837",
    fax: "",
  },
];

interface CommunitySelectionProps {
  onSelect: (community: Community) => void;
  onBack: () => void;
}

export const CommunitySelection = ({ onSelect, onBack }: CommunitySelectionProps) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(mockCommunities[0].id);

  const selectedCommunity = mockCommunities.find((c) => c.id === selectedId);

  return (
    <div className="flex h-full">
      {/* Main List */}
      <div className="flex-1 p-6">
        <Button variant="ghost" onClick={onBack} className="mb-4">
          ← Back
        </Button>

        <div className="mb-6 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
          <Input
            placeholder="Search Communities"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          {mockCommunities.map((community) => (
            <Card
              key={community.id}
              className={`cursor-pointer transition-all hover:shadow-md ${
                selectedId === community.id ? "ring-2 ring-primary" : ""
              }`}
              onClick={() => setSelectedId(community.id)}
            >
              <CardContent className="p-0">
                <div className="aspect-video bg-muted rounded-t-lg overflow-hidden">
                  <img src={community.mapImage} alt={community.name} className="w-full h-full object-cover" />
                </div>
                <div className="p-4">
                  <div className="text-sm text-primary font-medium mb-1">{community.code}</div>
                  <div className="text-lg font-semibold mb-2">{community.name}</div>
                  <div className="text-sm text-muted-foreground flex items-center gap-1">
                    <MapPin className="w-3 h-3" />
                    Address: {community.address}
                  </div>
                  <div className="text-sm text-muted-foreground">State: {community.state}</div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Detail Panel */}
      {selectedCommunity && (
        <div className="w-96 border-l border-border bg-muted/30 p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-semibold">Community Detail</h3>
            <Button onClick={() => onSelect(selectedCommunity)}>
              Proceed <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          </div>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="text-sm font-medium mb-1">Email</div>
                <div className="text-sm text-muted-foreground">{selectedCommunity.email}</div>
              </div>
              <div>
                <div className="text-sm font-medium mb-1">Fax</div>
                <div className="text-sm text-muted-foreground">{selectedCommunity.fax || "N/A"}</div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="text-sm font-medium mb-1">Mobile Phone</div>
                <div className="text-sm text-muted-foreground">{selectedCommunity.mobilePhone}</div>
              </div>
              <div>
                <div className="text-sm font-medium mb-1">Home Phone</div>
                <div className="text-sm text-muted-foreground">{selectedCommunity.homePhone}</div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="text-sm font-medium mb-1">Address 1</div>
                <div className="text-sm text-muted-foreground">{selectedCommunity.address}</div>
              </div>
              <div>
                <div className="text-sm font-medium mb-1">State</div>
                <div className="text-sm text-muted-foreground">{selectedCommunity.state}</div>
              </div>
            </div>

            <div className="pt-4 border-t border-border">
              <div className="text-sm font-medium mb-3">Community Phase</div>
              <select className="w-full p-2 border border-border rounded-md bg-background">
                <option>Select Community Phase</option>
                <option>Phase 1</option>
                <option>Phase 2</option>
                <option>Phase 3</option>
              </select>
              <Button variant="link" className="mt-2 p-0 text-primary">
                Proceed without Community Phase
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
