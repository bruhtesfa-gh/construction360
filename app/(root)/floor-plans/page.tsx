"use client";

import { useEffect, useMemo, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { DataGrid, type ExcelColumn } from "../../../components/grid";
import type { ColDef } from "ag-grid-community";
import { api } from "../../providers";

import { Button } from "../../../components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../../components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "../../../components/ui/dialog";
import { Input } from "../../../components/ui/input";
import { Label } from "../../../components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../../components/ui/select";
import { Switch } from "../../../components/ui/switch";
import { Plus, Edit, Trash2, Home } from "lucide-react";

interface FloorPlanCommunity {
  floor_plan_community_id: string;
  floor_plan_code: string;
  floor_plan_name: string;
  community_name: string;
  region_code: string;
  square_footage: number | null;
  bedrooms: number | null;
  bathrooms: number | null;
  garage_spaces: number | null;
  selling_price: number | null;
  architectural_style: string | null;
  is_active: boolean;
}

// Custom cell renderer for actions
const ActionsCellRenderer = ({
  data,
  onEdit,
  onDelete,
}: {
  data: FloorPlanCommunity;
  onEdit: (plan: FloorPlanCommunity) => void;
  onDelete: (plan: FloorPlanCommunity) => void;
}) => {
  return (
    <div className="flex items-center gap-2 h-full">
      <Button
        variant="outline"
        size="sm"
        onClick={() => onEdit(data)}
        className="h-8 w-8 p-0"
      >
        <Edit className="h-4 w-4" />
      </Button>
      <Button
        variant="outline"
        size="sm"
        onClick={() => onDelete(data)}
        className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
      >
        <Trash2 className="h-4 w-4" />
      </Button>
    </div>
  );
};

export default function FloorPlansPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  // Redirect to signin if not authenticated
  useEffect(() => {
    if (status === "loading") return;
    if (!session) {
      router.push("/signin");
      return;
    }
  }, [session, status, router]);

  const builderId = session?.user?.builderId;
  const userId = session?.user?.id;

  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingFloorPlan, setEditingFloorPlan] =
    useState<FloorPlanCommunity | null>(null);
  const [selectedMasterPlan, setSelectedMasterPlan] = useState<any>(null);
  const [formData, setFormData] = useState({
    region_id: "",
    floor_plan_master_id: "",
    community_id: "",
    selling_price: "",
    is_active: true,
  });

  // Data fetching
  const {
    data: floorPlanCommunities = [],
    isLoading,
    refetch,
  } = api.floorplans.getAll.useQuery(
    { builderId: builderId! },
    { enabled: !!builderId }
  );

  const {
    data: communities = [],
    isLoading: communitiesLoading,
    error: communitiesError,
  } = api.regions.getAllCommunities.useQuery(
    { builderId: builderId! },
    { enabled: !!builderId }
  );

  // Debug communities loading
  useEffect(() => {
    console.log("Communities loading:", communitiesLoading);
    console.log("Communities error:", communitiesError);
    console.log("Communities data:", communities);
    console.log("Communities count:", communities.length);

    if (formData.region_id) {
      const filteredCommunities = communities.filter(
        (community: any) => community.region_id === formData.region_id
      );
      console.log("Selected region_id:", formData.region_id);
      console.log("Filtered communities for region:", filteredCommunities);
      console.log(
        "Community region_ids:",
        communities.map((c: any) => ({
          id: c.community_id,
          region_id: c.region_id,
        }))
      );
    }
  }, [communities, communitiesLoading, communitiesError, formData.region_id]);

  const { data: regions = [] } = api.regions.getAll.useQuery(
    { builderId: builderId! },
    { enabled: !!builderId }
  );

  const { data: floorPlanMasters = [] } = api.floorPlanMaster.getAll.useQuery(
    { builderId: builderId!, regionId: formData.region_id || undefined },
    { enabled: !!builderId }
  );

  // Mutations
  const createMutation = api.floorplans.createCommunityAssignment.useMutation({
    onSuccess: () => {
      refetch();
      setIsModalOpen(false);
      resetForm();
    },
  });

  // Column definitions
  const columnDefs = useMemo<ColDef[]>(
    () => [
      {
        headerName: "Floor Plan",
        field: "floor_plan_name",
        width: 200,
        pinned: "left",
      },
      {
        headerName: "Code",
        field: "floor_plan_code",
        width: 120,
      },
      {
        headerName: "Community",
        field: "community_name",
        width: 150,
      },
      {
        headerName: "Region",
        field: "region_code",
        width: 100,
      },
      {
        headerName: "Sq Ft",
        field: "square_footage",
        width: 100,
        type: "numericColumn",
        valueFormatter: (params) =>
          params.value ? params.value.toLocaleString() : "",
      },
      {
        headerName: "Beds",
        field: "bedrooms",
        width: 80,
        type: "numericColumn",
      },
      {
        headerName: "Baths",
        field: "bathrooms",
        width: 80,
        type: "numericColumn",
      },
      {
        headerName: "Garage",
        field: "garage_spaces",
        width: 80,
        type: "numericColumn",
      },
      {
        headerName: "Style",
        field: "architectural_style",
        width: 120,
      },
      {
        headerName: "Selling Price",
        field: "selling_price",
        width: 120,
        type: "numericColumn",
        valueFormatter: (params) =>
          params.value ? `$${params.value.toLocaleString()}` : "",
      },
      {
        headerName: "Active",
        field: "is_active",
        width: 80,
        cellRenderer: (params: any) => (params.value ? "Yes" : "No"),
      },
      {
        headerName: "Actions",
        field: "actions",
        width: 120,
        cellRenderer: (params: any) => (
          <ActionsCellRenderer
            data={params.data}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
        ),
      },
    ],
    []
  );

  // Excel columns for export
  const excelColumns = useMemo<ExcelColumn[]>(
    () => [
      { field: "floor_plan_code", header: "Floor Plan Code", type: "string" },
      { field: "floor_plan_name", header: "Floor Plan Name", type: "string" },
      { field: "community_name", header: "Community", type: "string" },
      { field: "region_code", header: "Region", type: "string" },
      { field: "selling_price", header: "Selling Price", type: "number" },
      { field: "is_active", header: "Active", type: "boolean" },
    ],
    []
  );

  const resetForm = () => {
    setFormData({
      region_id: "",
      floor_plan_master_id: "",
      community_id: "",
      selling_price: "",
      is_active: true,
    });
    setSelectedMasterPlan(null);
    setEditingFloorPlan(null);
  };

  const handleInputChange = (field: string, value: any) => {
    setFormData((prev) => {
      const newData = { ...prev, [field]: value };

      // Clear dependent fields when region changes
      if (field === "region_id") {
        newData.floor_plan_master_id = "";
        newData.community_id = "";
        setSelectedMasterPlan(null);
      }

      // Clear community when master plan changes
      if (field === "floor_plan_master_id") {
        newData.community_id = "";

        // Auto-populate specs from selected master plan
        const masterPlan = floorPlanMasters.find(
          (m: any) => m.floor_plan_master_id === value
        );
        setSelectedMasterPlan(masterPlan);

        // Auto-populate selling price from base price if available
        if (masterPlan?.base_price) {
          newData.selling_price = masterPlan.base_price.toString();
        }
      }

      return newData;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!builderId || !userId) return;

    try {
      await createMutation.mutateAsync({
        builderId,
        userId,
        floor_plan_master_id: formData.floor_plan_master_id,
        community_id: formData.community_id,
        selling_price: formData.selling_price
          ? parseFloat(formData.selling_price)
          : null,
        is_active: formData.is_active,
      });
    } catch (error) {
      console.error("Error saving floor plan assignment:", error);
      alert("Error saving assignment: " + (error as any).message);
    }
  };

  const handleEdit = (floorPlan: FloorPlanCommunity) => {
    setEditingFloorPlan(floorPlan);
    setFormData({
      region_id: "", // Will need to get from relationship
      floor_plan_master_id: "", // Will need to get from relationship
      community_id: "", // Will need to get from relationship
      selling_price: floorPlan.selling_price?.toString() || "",
      is_active: floorPlan.is_active,
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (floorPlan: FloorPlanCommunity) => {
    if (!builderId || !userId) return;

    if (
      confirm(
        `Remove "${floorPlan.floor_plan_name}" from ${floorPlan.community_name}?`
      )
    ) {
      try {
        // TODO: Implement delete for new structure
        console.log(
          "Delete floor plan community:",
          floorPlan.floor_plan_community_id
        );
        alert("Delete functionality coming soon!");
      } catch (error) {
        console.error("Error deleting floor plan:", error);
      }
    }
  };

  if (!session) return null;

  return (
    <div className="container mx-auto py-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Home className="h-8 w-8" />
            Floor Plans by Community
          </h1>
          <p className="text-muted-foreground">
            Assign master floor plans to specific communities
          </p>
        </div>
        <Button onClick={() => setIsModalOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Assign Floor Plan to Community
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Floor Plans in Communities</CardTitle>
        </CardHeader>
        <CardContent>
          <DataGrid
            data={floorPlanCommunities}
            loading={isLoading}
            columnDefs={columnDefs}
            excelColumns={excelColumns}
            tableName="floor_plan_community"
            fileName="floor-plans-by-community"
            importTitle="Import Floor Plan Community Assignments"
          />
        </CardContent>
      </Card>

      {/* Assignment Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent
          className="max-w-2xl"
          aria-describedby="floor-plan-assignment-description"
        >
          <DialogHeader>
            <DialogTitle>
              {editingFloorPlan
                ? "Edit Floor Plan Assignment"
                : "Assign Floor Plan to Community"}
            </DialogTitle>
            <p
              id="floor-plan-assignment-description"
              className="text-sm text-muted-foreground"
            >
              Select a master floor plan and assign it to a community with
              specific pricing
            </p>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="grid gap-4 py-4">
              <div>
                <Label htmlFor="region_id">Region *</Label>
                <Select
                  value={formData.region_id}
                  onValueChange={(value) =>
                    handleInputChange("region_id", value)
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select region first..." />
                  </SelectTrigger>
                  <SelectContent>
                    {regions.map((region: any) => (
                      <SelectItem
                        key={region.region_id}
                        value={region.region_id}
                      >
                        {region.region_code} - {region.description}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="floor_plan_master_id">
                  Master Floor Plan *
                </Label>
                <Select
                  value={formData.floor_plan_master_id}
                  onValueChange={(value) =>
                    handleInputChange("floor_plan_master_id", value)
                  }
                  disabled={!formData.region_id}
                >
                  <SelectTrigger>
                    <SelectValue
                      placeholder={
                        !formData.region_id
                          ? "Select region first..."
                          : "Select master floor plan..."
                      }
                    />
                  </SelectTrigger>
                  <SelectContent>
                    {floorPlanMasters.map((master: any) => (
                      <SelectItem
                        key={master.floor_plan_master_id}
                        value={master.floor_plan_master_id}
                      >
                        {master.floor_plan_code} - {master.floor_plan_name} (
                        {master.region_code})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Show master plan specs when selected */}
              {selectedMasterPlan && (
                <Card className="bg-gray-50">
                  <CardContent className="pt-4">
                    <h4 className="font-semibold mb-2">
                      Master Plan Specifications:
                    </h4>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div>
                        <strong>Square Footage:</strong>{" "}
                        {selectedMasterPlan.square_footage?.toLocaleString() ||
                          "Not specified"}
                      </div>
                      <div>
                        <strong>Bedrooms:</strong>{" "}
                        {selectedMasterPlan.bedrooms || "Not specified"}
                      </div>
                      <div>
                        <strong>Bathrooms:</strong>{" "}
                        {selectedMasterPlan.bathrooms || "Not specified"}
                      </div>
                      <div>
                        <strong>Garage:</strong>{" "}
                        {selectedMasterPlan.garage_spaces || "Not specified"}
                      </div>
                      <div>
                        <strong>Floors:</strong>{" "}
                        {selectedMasterPlan.floors || "Not specified"}
                      </div>
                      <div>
                        <strong>Style:</strong>{" "}
                        {selectedMasterPlan.architectural_style ||
                          "Not specified"}
                      </div>
                      <div>
                        <strong>Base Price:</strong>{" "}
                        {selectedMasterPlan.base_price
                          ? `$${selectedMasterPlan.base_price.toLocaleString()}`
                          : "Not specified"}
                      </div>
                      <div>
                        <strong>Region:</strong>{" "}
                        {selectedMasterPlan.region_code}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              <div>
                <Label htmlFor="community_id">Community *</Label>
                <Select
                  value={formData.community_id}
                  onValueChange={(value) =>
                    handleInputChange("community_id", value)
                  }
                  disabled={!formData.region_id}
                >
                  <SelectTrigger>
                    <SelectValue
                      placeholder={
                        !formData.region_id
                          ? "Select region first..."
                          : "Select community..."
                      }
                    />
                  </SelectTrigger>
                  <SelectContent>
                    {communities
                      .filter(
                        (community: any) =>
                          community.region_id === formData.region_id
                      )
                      .map((community: any) => (
                        <SelectItem
                          key={community.community_id}
                          value={community.community_id}
                        >
                          {community.community_name || community.description}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground mt-1">
                  {formData.region_id
                    ? `${
                        communities.filter(
                          (c: any) => c.region_id === formData.region_id
                        ).length
                      } communities in selected region`
                    : `${communities.length} total communities available`}
                </p>
              </div>

              <div>
                <Label htmlFor="selling_price">Selling Price</Label>
                <Input
                  id="selling_price"
                  type="number"
                  step="0.01"
                  value={formData.selling_price}
                  onChange={(e) =>
                    handleInputChange("selling_price", e.target.value)
                  }
                  placeholder="Enter community selling price..."
                />
                {selectedMasterPlan?.base_price && (
                  <p className="text-xs text-muted-foreground mt-1">
                    Master plan base price: $
                    {selectedMasterPlan.base_price.toLocaleString()}
                  </p>
                )}
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  checked={formData.is_active}
                  onCheckedChange={(checked) =>
                    handleInputChange("is_active", checked)
                  }
                />
                <Label>Available in Community</Label>
              </div>
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsModalOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit">Assign to Community</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
