"use client";

import { useEffect, useCallback, useMemo, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { DataGrid, type ExcelColumn } from "../../../components/grid";
import type { ColDef } from "ag-grid-community";

import { Button } from "../../../components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../../components/ui/card";
import { Badge } from "../../../components/ui/badge";
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
import { Plus, Edit, Trash2, Home } from "lucide-react";
import { CommunityAddressCellRenderer } from "../../../components/grid/CommunityAddressCellRenderer";
import { api } from "../../providers";
import { useTimezone } from "../../../lib/timezone-context";

interface Home {
  home_id: string;
  community_id: string;
  floor_plan_code: string | null;
  elevation_code: string | null;
  unit_number: string | null;
  description: string | null;
  sequence: number;
  construction_stage: string | null;
  created_at: Date;
  updated_at: Date;
}

// Custom cell renderer for actions
const ActionsCellRenderer = ({
  data,
  onEdit,
  onDelete,
}: {
  data: Home;
  onEdit: (home: Home) => void;
  onDelete: (home: Home) => void;
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

export default function HomesPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { formatDate } = useTimezone();

  // Redirect to signin if not authenticated
  useEffect(() => {
    if (status === "loading") return;
    if (!session) {
      router.push("/signin");
      return;
    }
  }, [session, status, router]);

  const builderId = session?.user?.builderId;

  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingHome, setEditingHome] = useState<Home | null>(null);
  const [formData, setFormData] = useState({
    floor_plan_code: "",
    elevation_code: "",
    unit_number: "",
    description: "",
    sequence: "1",
    community_id: "",
  });

  // Delete confirmation state
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [homeToDelete, setHomeToDelete] = useState<Home | null>(null);

  // Get tRPC utils for cache invalidation
  const utils = api.useUtils();

  // Fetch homes data
  const { data: homes = [], isLoading } = api.homes.getAll.useQuery(
    {
      builderId: builderId!,
      limit: 1000,
    },
    {
      enabled: !!builderId,
    }
  );

  // Fetch communities for dropdown
  const { data: communities = [] } = api.builders.getCommunities.useQuery(
    {
      builderId: builderId!,
    },
    {
      enabled: !!builderId,
    }
  );

  // Note: Regions could be used for future dropdown functionality but communities contain region_id

  // Create home mutation
  const createHomeMutation = api.homes.create.useMutation({
    onSuccess: () => {
      utils.homes.getAll.invalidate();
      setIsModalOpen(false);
      setEditingHome(null); // Clear editing state
      setFormData({
        floor_plan_code: "",
        elevation_code: "",
        unit_number: "",
        description: "",
        sequence: "1",
        community_id: "",
      });
    },
    onError: (error) => {
      console.error("Failed to create home:", error);
    },
  });

  // Update home mutation
  const updateHomeMutation = api.homes.update.useMutation({
    onSuccess: () => {
      utils.homes.getAll.invalidate();
      setIsModalOpen(false);
      setEditingHome(null);
    },
    onError: (error) => {
      console.error("Failed to update home:", error);
    },
  });

  // Delete home mutation
  const deleteHomeMutation = api.homes.delete.useMutation({
    onSuccess: () => {
      utils.homes.getAll.invalidate();
      setDeleteConfirmOpen(false);
      setHomeToDelete(null);
    },
    onError: (error) => {
      console.error("Failed to delete home:", error);
    },
  });

  // Handle create new home
  const handleCreateHome = useCallback(() => {
    setEditingHome(null);
    setFormData({
      floor_plan_code: "",
      elevation_code: "",
      unit_number: "",
      description: "",
      sequence: "1",
      community_id: "",
    });
    setIsModalOpen(true);
  }, []);

  // Handle edit home
  const handleEditHome = useCallback((home: Home) => {
    setEditingHome(home);
    setFormData({
      floor_plan_code: home.floor_plan_code || "",
      elevation_code: home.elevation_code || "",
      unit_number: home.unit_number || "",
      description: home.description || "",
      sequence: home.sequence.toString(),
      community_id: home.community_id,
    });
    setIsModalOpen(true);
  }, []);

  // Handle delete home
  const handleDeleteHome = useCallback((home: Home) => {
    setHomeToDelete(home);
    setDeleteConfirmOpen(true);
  }, []);

  // Confirm delete home
  const confirmDeleteHome = useCallback(() => {
    if (!homeToDelete || !builderId) return;

    deleteHomeMutation.mutate({
      builderId: builderId,
      homeId: homeToDelete.home_id,
    });
  }, [homeToDelete, builderId, deleteHomeMutation]);

  // Handle form submit
  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();

      if (!builderId || !session?.user?.id) {
        console.error("Missing required data for API call");
        return;
      }

      if (editingHome) {
        // Update existing home with form data
        const updateData = {
          builderId: builderId,
          homeId: editingHome.home_id,
          modifiedBy: session.user.id,
          floorPlanCode:
            formData.floor_plan_code && formData.floor_plan_code.trim()
              ? formData.floor_plan_code
              : undefined,
          elevationCode:
            formData.elevation_code && formData.elevation_code.trim()
              ? formData.elevation_code
              : undefined,
          unitNumber:
            formData.unit_number && formData.unit_number.trim()
              ? formData.unit_number
              : undefined,
          description:
            formData.description && formData.description.trim()
              ? formData.description
              : undefined,
          sequence: formData.sequence
            ? parseInt(formData.sequence) || 1
            : undefined,
        };

        updateHomeMutation.mutate(updateData);
      } else {
        // Validate required fields for creation
        if (!formData.community_id || formData.community_id.trim() === "") {
          alert("Please select a community before creating a home");
          return;
        }

        // Get the selected community to find its region_id
        const selectedCommunity = communities.find(
          (c) => c.community_id === formData.community_id
        );
        if (!selectedCommunity) {
          alert("Selected community not found");
          return;
        }

        // Create new home - ensure no empty strings for optional fields
        const createData = {
          builderId: builderId,
          regionId: selectedCommunity.region_id,
          communityId: formData.community_id,
          sequence: parseInt(formData.sequence) || 1,
          createdBy: session.user.id,
          modifiedBy: session.user.id,
          floorPlanCode:
            formData.floor_plan_code && formData.floor_plan_code.trim()
              ? formData.floor_plan_code
              : undefined,
          elevationCode:
            formData.elevation_code && formData.elevation_code.trim()
              ? formData.elevation_code
              : undefined,
          unitNumber:
            formData.unit_number && formData.unit_number.trim()
              ? formData.unit_number
              : undefined,
          description:
            formData.description && formData.description.trim()
              ? formData.description
              : undefined,
        };

        createHomeMutation.mutate(createData);
      }
    },
    [
      formData,
      editingHome,
      builderId,
      session?.user?.id,
      createHomeMutation,
      updateHomeMutation,
      communities,
    ]
  );

  // Handle form input changes
  const handleInputChange = useCallback((field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  }, []);

  // AG Grid column definitions
  const columnDefs: ColDef[] = useMemo(
    () => [
      {
        headerName: "Community & Address",
        field: "community_id",
        sortable: true,
        filter: true,
        flex: 2,
        minWidth: 250,
        cellRenderer: CommunityAddressCellRenderer,
        cellRendererParams: {
          communities: communities,
        },
      },
      {
        headerName: "Floor Plan",
        field: "floor_plan_code",
        sortable: true,
        filter: true,
        flex: 1,
        minWidth: 120,
        valueGetter: (params) => params.data?.floor_plan_code || "Unknown",
      },
      {
        headerName: "Elevation",
        field: "elevation_code",
        sortable: true,
        filter: true,
        flex: 1,
        minWidth: 120,
        valueGetter: (params) => params.data?.elevation_code || "None",
      },
      {
        headerName: "Unit #",
        field: "unit_number",
        sortable: true,
        filter: true,
        flex: 1,
        minWidth: 100,
        valueGetter: (params) => params.data?.unit_number || "-",
      },
      {
        headerName: "Description",
        field: "description",
        sortable: true,
        filter: true,
        flex: 2,
        minWidth: 200,
        valueGetter: (params) => params.data?.description || "No description",
      },
      {
        headerName: "Sequence",
        field: "sequence",
        sortable: true,
        filter: true,
        flex: 1,
        minWidth: 100,
        type: "numericColumn",
      },
      {
        headerName: "Created",
        field: "created_at",
        sortable: true,
        filter: "agDateColumnFilter",
        flex: 1,
        minWidth: 120,
        valueFormatter: (params) => {
          if (!params.value) return "";
          return formatDate(params.value);
        },
      },
      {
        headerName: "Actions",
        field: "actions",
        sortable: false,
        filter: false,
        width: 100,
        pinned: "right",
        cellRenderer: ActionsCellRenderer,
        cellRendererParams: {
          onEdit: handleEditHome,
          onDelete: handleDeleteHome,
        },
      },
    ],
    [handleEditHome, handleDeleteHome, formatDate, communities]
  );

  // Excel columns configuration for import/export
  const excelColumns: ExcelColumn[] = [
    { field: "community_code", header: "Community Code *", required: true },
    { field: "floor_plan_code", header: "Floor Plan Code" },
    { field: "elevation_code", header: "Elevation Code" },
    { field: "unit_number", header: "Unit Number" },
    { field: "description", header: "Description" },
    { field: "sequence", header: "Sequence", type: "number" },
  ];

  // Handle import from DataGrid
  const handleImport = useCallback(
    async (importData: any[]) => {
      if (!builderId || !session?.user?.id) return;

      for (const row of importData) {
        // Find community by code
        const community = communities.find(
          (c) => c.community_code === row.community_code
        );
        if (!community) continue;

        await createHomeMutation.mutateAsync({
          builderId: builderId,
          regionId: community.region_id,
          communityId: community.community_id,
          floorPlanCode: row.floor_plan_code || undefined,
          elevationCode: row.elevation_code || undefined,
          unitNumber: row.unit_number || undefined,
          description: row.description || undefined,
          sequence: row.sequence || 1,
          createdBy: session.user.id,
          modifiedBy: session.user.id,
        });
      }

      // Refresh data
      utils.homes.getAll.invalidate();
    },
    [builderId, session?.user?.id, communities, createHomeMutation, utils]
  );

  // Show loading while checking authentication
  if (status === "loading") {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground text-lg">Loading homes...</p>
        </div>
      </div>
    );
  }

  // Show loading while fetching homes data
  if (builderId && isLoading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold">Homes Management</h1>
            <p className="text-muted-foreground">
              Manage home inventory and floor plans
            </p>
          </div>
        </div>
        <Card>
          <CardHeader>
            <CardTitle>Home Inventory</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-center h-64">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                <p className="text-muted-foreground">Loading homes data...</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <Home className="h-8 w-8" />
            Homes
          </h1>
          <p className="text-muted-foreground">
            Manage home inventory and floor plans
          </p>
        </div>
        <Button onClick={handleCreateHome} className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Add New Home
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Home Inventory</CardTitle>
        </CardHeader>
        <CardContent>
          <DataGrid
            data={homes}
            loading={isLoading}
            columnDefs={columnDefs}
            excelColumns={excelColumns}
            onImport={handleImport}
            fileName="homes"
            importTitle="Import Homes"
          />
        </CardContent>
      </Card>

      {/* Home Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>
              {editingHome ? "Edit Home" : "Create New Home"}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="grid gap-4 py-4">
              {!editingHome && (
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="community_id" className="text-right">
                    Community
                  </Label>
                  <Select
                    value={formData.community_id}
                    onValueChange={(value) =>
                      handleInputChange("community_id", value)
                    }
                    required
                  >
                    <SelectTrigger className="col-span-3">
                      <SelectValue placeholder="Select a community" />
                    </SelectTrigger>
                    <SelectContent>
                      {communities.map((community) => (
                        <SelectItem
                          key={community.community_id}
                          value={community.community_id}
                        >
                          {community.description}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="floor_plan_code" className="text-right">
                  Floor Plan
                </Label>
                <Input
                  id="floor_plan_code"
                  value={formData.floor_plan_code}
                  onChange={(e) =>
                    handleInputChange("floor_plan_code", e.target.value)
                  }
                  className="col-span-3"
                  placeholder="e.g. FP001"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="elevation_code" className="text-right">
                  Elevation
                </Label>
                <Input
                  id="elevation_code"
                  value={formData.elevation_code}
                  onChange={(e) =>
                    handleInputChange("elevation_code", e.target.value)
                  }
                  className="col-span-3"
                  placeholder="e.g. A, B, C"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="unit_number" className="text-right">
                  Unit Number
                </Label>
                <Input
                  id="unit_number"
                  value={formData.unit_number}
                  onChange={(e) =>
                    handleInputChange("unit_number", e.target.value)
                  }
                  className="col-span-3"
                  placeholder="e.g. 101, 102"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="description" className="text-right">
                  Description
                </Label>
                <Input
                  id="description"
                  value={formData.description}
                  onChange={(e) =>
                    handleInputChange("description", e.target.value)
                  }
                  className="col-span-3"
                  placeholder="Home description"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="sequence" className="text-right">
                  Sequence
                </Label>
                <Input
                  id="sequence"
                  type="number"
                  value={formData.sequence}
                  onChange={(e) =>
                    handleInputChange("sequence", e.target.value)
                  }
                  className="col-span-3"
                  min="1"
                  required
                />
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
                disabled={
                  createHomeMutation.isPending || updateHomeMutation.isPending
                }
              >
                {createHomeMutation.isPending || updateHomeMutation.isPending
                  ? editingHome
                    ? "Updating..."
                    : "Creating..."
                  : editingHome
                  ? "Update Home"
                  : "Create Home"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Delete Home</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p className="text-muted-foreground">
              Are you sure you want to delete this home
              {homeToDelete?.unit_number
                ? ` (Unit ${homeToDelete.unit_number})`
                : ""}
              ? This action cannot be undone.
            </p>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setDeleteConfirmOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="destructive"
              onClick={confirmDeleteHome}
              disabled={deleteHomeMutation.isPending}
            >
              {deleteHomeMutation.isPending ? "Deleting..." : "Delete Home"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
