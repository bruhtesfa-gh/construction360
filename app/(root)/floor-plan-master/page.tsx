"use client";

import { useEffect, useCallback, useMemo, useState } from "react";
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

interface FloorPlanMaster {
  floor_plan_master_id: string;
  floor_plan_code: string;
  floor_plan_name: string;
  description: string | null;
  region_code: string;
  region_name: string;
  square_footage: number | null;
  bedrooms: number | null;
  bathrooms: number | null;
  garage_spaces: number | null;
  floors: number | null;
  architectural_style: string | null;
  base_price: number | null;
  is_active: boolean;
  community_count: number;
}

// Custom cell renderer for actions
const ActionsCellRenderer = ({
  data,
  onEdit,
  onDelete,
}: {
  data: FloorPlanMaster;
  onEdit: (plan: FloorPlanMaster) => void;
  onDelete: (plan: FloorPlanMaster) => void;
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

export default function FloorPlanMasterPage() {
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
    useState<FloorPlanMaster | null>(null);
  const [formData, setFormData] = useState({
    region_id: "",
    floor_plan_code: "",
    floor_plan_name: "",
    description: "",
    square_footage: "",
    bedrooms: "",
    bathrooms: "",
    garage_spaces: "",
    floors: "1",
    architectural_style: "",
    base_price: "",
    is_active: true,
  });

  // Data fetching
  const {
    data: floorPlanMasters = [],
    isLoading,
    refetch,
  } = api.floorPlanMaster.getAll.useQuery(
    { builderId: builderId! },
    { enabled: !!builderId }
  );

  const { data: regions = [] } = api.regions.getAll.useQuery(
    { builderId: builderId! },
    { enabled: !!builderId }
  );

  // Mutations
  const createMutation = api.floorPlanMaster.create.useMutation({
    onSuccess: () => {
      refetch();
      setIsModalOpen(false);
      resetForm();
    },
  });

  const updateMutation = api.floorPlanMaster.update.useMutation({
    onSuccess: () => {
      refetch();
      setIsModalOpen(false);
      resetForm();
    },
  });

  const deleteMutation = api.floorPlanMaster.delete.useMutation({
    onSuccess: () => {
      refetch();
    },
  });

  // Column definitions
  const columnDefs = useMemo<ColDef[]>(
    () => [
      {
        headerName: "Floor Plan Code",
        field: "floor_plan_code",
        width: 150,
        pinned: "left",
      },
      {
        headerName: "Name",
        field: "floor_plan_name",
        width: 200,
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
        headerName: "Floors",
        field: "floors",
        width: 80,
        type: "numericColumn",
      },
      {
        headerName: "Style",
        field: "architectural_style",
        width: 120,
      },
      {
        headerName: "Base Price",
        field: "base_price",
        width: 120,
        type: "numericColumn",
        valueFormatter: (params) =>
          params.value ? `$${params.value.toLocaleString()}` : "",
      },
      {
        headerName: "Communities",
        field: "community_count",
        width: 100,
        type: "numericColumn",
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
      { field: "floor_plan_name", header: "Name", type: "string" },
      { field: "region_code", header: "Region", type: "string" },
      { field: "square_footage", header: "Square Footage", type: "number" },
      { field: "bedrooms", header: "Bedrooms", type: "number" },
      { field: "bathrooms", header: "Bathrooms", type: "number" },
      { field: "garage_spaces", header: "Garage Spaces", type: "number" },
      { field: "architectural_style", header: "Style", type: "string" },
      { field: "base_price", header: "Base Price", type: "number" },
      { field: "is_active", header: "Active", type: "boolean" },
    ],
    []
  );

  const resetForm = () => {
    setFormData({
      region_id: "",
      floor_plan_code: "",
      floor_plan_name: "",
      description: "",
      square_footage: "",
      bedrooms: "",
      bathrooms: "",
      garage_spaces: "",
      floors: "1",
      architectural_style: "",
      base_price: "",
      is_active: true,
    });
    setEditingFloorPlan(null);
  };

  const handleInputChange = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!builderId || !userId) return;

    try {
      const submitData = {
        builderId,
        userId,
        region_id: formData.region_id,
        floor_plan_code: formData.floor_plan_code,
        floor_plan_name: formData.floor_plan_name,
        description: formData.description || null,
        square_footage: formData.square_footage
          ? parseInt(formData.square_footage)
          : null,
        bedrooms: formData.bedrooms ? parseInt(formData.bedrooms) : null,
        bathrooms: formData.bathrooms ? parseFloat(formData.bathrooms) : null,
        garage_spaces: formData.garage_spaces
          ? parseInt(formData.garage_spaces)
          : null,
        floors: formData.floors ? parseInt(formData.floors) : null,
        architectural_style: formData.architectural_style || null,
        base_price: formData.base_price
          ? parseFloat(formData.base_price)
          : null,
        is_active: formData.is_active,
      };

      if (editingFloorPlan) {
        await updateMutation.mutateAsync({
          ...submitData,
          floorPlanMasterId: editingFloorPlan.floor_plan_master_id,
        });
      } else {
        await createMutation.mutateAsync(submitData);
      }
    } catch (error) {
      console.error("Error saving floor plan master:", error);
    }
  };

  const handleEdit = (floorPlan: FloorPlanMaster) => {
    setEditingFloorPlan(floorPlan);

    // Find region_id from region_code
    const region = regions.find(
      (r: any) => r.region_code === floorPlan.region_code
    );

    setFormData({
      region_id: region?.region_id || "",
      floor_plan_code: floorPlan.floor_plan_code,
      floor_plan_name: floorPlan.floor_plan_name,
      description: floorPlan.description || "",
      square_footage: floorPlan.square_footage?.toString() || "",
      bedrooms: floorPlan.bedrooms?.toString() || "",
      bathrooms: floorPlan.bathrooms?.toString() || "",
      garage_spaces: floorPlan.garage_spaces?.toString() || "",
      floors: floorPlan.floors?.toString() || "1",
      architectural_style: floorPlan.architectural_style || "",
      base_price: floorPlan.base_price?.toString() || "",
      is_active: floorPlan.is_active,
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (floorPlan: FloorPlanMaster) => {
    if (!builderId || !userId) return;

    if (floorPlan.community_count > 0) {
      alert(
        `Cannot delete "${floorPlan.floor_plan_name}". It is used by ${floorPlan.community_count} community implementations.`
      );
      return;
    }

    if (
      confirm(
        `Are you sure you want to delete floor plan master "${floorPlan.floor_plan_name}"?`
      )
    ) {
      try {
        await deleteMutation.mutateAsync({
          builderId,
          userId,
          floorPlanMasterId: floorPlan.floor_plan_master_id,
        });
      } catch (error) {
        console.error("Error deleting floor plan master:", error);
      }
    }
  };

  const handleImport = async (importedData: any[]) => {
    if (!builderId || !userId) return;

    console.log("Importing floor plan masters:", importedData);

    try {
      for (const item of importedData) {
        // Find region_id from region_code
        const region = regions.find(
          (r: any) =>
            r.region_code.toLowerCase() ===
            (item.region_code || "").toLowerCase()
        );
        if (!region) {
          throw new Error(`Region code "${item.region_code}" not found`);
        }

        await createMutation.mutateAsync({
          builderId,
          userId,
          region_id: region.region_id,
          floor_plan_code: item.floor_plan_code,
          floor_plan_name: item.floor_plan_name || item.floor_plan_code,
          description: item.description || null,
          square_footage: item.square_footage
            ? parseInt(item.square_footage)
            : null,
          bedrooms: item.bedrooms ? parseInt(item.bedrooms) : null,
          bathrooms: item.bathrooms ? parseFloat(item.bathrooms) : null,
          garage_spaces: item.garage_spaces
            ? parseInt(item.garage_spaces)
            : null,
          floors: item.floors ? parseInt(item.floors) : null,
          architectural_style: item.architectural_style || null,
          base_price: item.base_price ? parseFloat(item.base_price) : null,
          is_active: item.is_active === true || item.is_active === "true",
        });
      }

      console.log(
        `Successfully imported ${importedData.length} floor plan masters`
      );
      alert(`Successfully imported ${importedData.length} floor plan masters`);
      refetch(); // Refresh the grid
    } catch (error) {
      console.error("Error importing floor plan masters:", error);
      alert("Error importing data: " + (error as any).message);
    }
  };

  if (!session) {
    return null;
  }

  return (
    <div className="container mx-auto py-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Home className="h-8 w-8" />
            Floor Plan Masters
          </h1>
          <p className="text-muted-foreground">
            Manage master floor plan designs by region
          </p>
        </div>
        <Button onClick={() => setIsModalOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Add Floor Plan Master
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Master Floor Plans</CardTitle>
        </CardHeader>
        <CardContent>
          <DataGrid
            data={floorPlanMasters}
            loading={isLoading}
            columnDefs={columnDefs}
            excelColumns={excelColumns}
            tableName="floor_plan_master"
            onImport={handleImport}
            fileName="floor-plan-masters"
            importTitle="Import Floor Plan Masters"
          />
        </CardContent>
      </Card>

      {/* Floor Plan Master Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent
          className="max-w-2xl"
          aria-describedby="floor-plan-dialog-description"
        >
          <DialogHeader>
            <DialogTitle>
              {editingFloorPlan
                ? "Edit Floor Plan Master"
                : "Create New Floor Plan Master"}
            </DialogTitle>
            <p
              id="floor-plan-dialog-description"
              className="text-sm text-muted-foreground"
            >
              {editingFloorPlan
                ? "Edit the master floor plan details below"
                : "Create a new master floor plan design"}
            </p>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="region_id">Region *</Label>
                  <Select
                    value={formData.region_id}
                    onValueChange={(value) =>
                      handleInputChange("region_id", value)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select region..." />
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
                  <Label htmlFor="floor_plan_code">Floor Plan Code *</Label>
                  <Input
                    id="floor_plan_code"
                    value={formData.floor_plan_code}
                    onChange={(e) =>
                      handleInputChange("floor_plan_code", e.target.value)
                    }
                    placeholder="Enter floor plan code..."
                    required
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="floor_plan_name">Floor Plan Name *</Label>
                <Input
                  id="floor_plan_name"
                  value={formData.floor_plan_name}
                  onChange={(e) =>
                    handleInputChange("floor_plan_name", e.target.value)
                  }
                  placeholder="Enter floor plan name..."
                  required
                />
              </div>

              <div>
                <Label htmlFor="description">Description</Label>
                <Input
                  id="description"
                  value={formData.description}
                  onChange={(e) =>
                    handleInputChange("description", e.target.value)
                  }
                  placeholder="Enter description..."
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="square_footage">Square Footage</Label>
                  <Input
                    id="square_footage"
                    type="number"
                    value={formData.square_footage}
                    onChange={(e) =>
                      handleInputChange("square_footage", e.target.value)
                    }
                    placeholder="Enter sq ft..."
                  />
                </div>

                <div>
                  <Label htmlFor="bedrooms">Bedrooms</Label>
                  <Input
                    id="bedrooms"
                    type="number"
                    value={formData.bedrooms}
                    onChange={(e) =>
                      handleInputChange("bedrooms", e.target.value)
                    }
                    placeholder="Enter bedrooms..."
                  />
                </div>

                <div>
                  <Label htmlFor="bathrooms">Bathrooms</Label>
                  <Input
                    id="bathrooms"
                    type="number"
                    step="0.5"
                    value={formData.bathrooms}
                    onChange={(e) =>
                      handleInputChange("bathrooms", e.target.value)
                    }
                    placeholder="Enter bathrooms..."
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="garage_spaces">Garage Spaces</Label>
                  <Input
                    id="garage_spaces"
                    type="number"
                    value={formData.garage_spaces}
                    onChange={(e) =>
                      handleInputChange("garage_spaces", e.target.value)
                    }
                    placeholder="Enter garage spaces..."
                  />
                </div>

                <div>
                  <Label htmlFor="floors">Floors</Label>
                  <Select
                    value={formData.floors}
                    onValueChange={(value) =>
                      handleInputChange("floors", value)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select floors..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">1 Story</SelectItem>
                      <SelectItem value="2">2 Story</SelectItem>
                      <SelectItem value="3">3 Story</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="base_price">Base Price</Label>
                  <Input
                    id="base_price"
                    type="number"
                    step="0.01"
                    value={formData.base_price}
                    onChange={(e) =>
                      handleInputChange("base_price", e.target.value)
                    }
                    placeholder="Enter base price..."
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="architectural_style">Architectural Style</Label>
                <Select
                  value={formData.architectural_style || ""}
                  onValueChange={(value) =>
                    handleInputChange("architectural_style", value)
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select style..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ranch">Ranch</SelectItem>
                    <SelectItem value="colonial">Colonial</SelectItem>
                    <SelectItem value="craftsman">Craftsman</SelectItem>
                    <SelectItem value="contemporary">Contemporary</SelectItem>
                    <SelectItem value="traditional">Traditional</SelectItem>
                    <SelectItem value="mediterranean">Mediterranean</SelectItem>
                    <SelectItem value="victorian">Victorian</SelectItem>
                    <SelectItem value="cape_cod">Cape Cod</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  checked={formData.is_active}
                  onCheckedChange={(checked) =>
                    handleInputChange("is_active", checked)
                  }
                />
                <Label>Active</Label>
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
              <Button
                type="submit"
                disabled={createMutation.isPending || updateMutation.isPending}
              >
                {createMutation.isPending || updateMutation.isPending
                  ? "Saving..."
                  : "Save"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
