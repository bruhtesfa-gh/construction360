"use client";

import { useEffect, useCallback, useMemo, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import {
  ClientDataGrid as DataGrid,
  type ExcelColumn,
} from "../../../components/grid";
import type { ColDef } from "ag-grid-community";

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
} from "../../../components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../../components/ui/select";
import { Plus, Home, Filter } from "lucide-react";
import { ActionsCellRenderer } from "../../../components/grid/ActionsCellRenderer";
import { api } from "../../providers";
import { useTimezone } from "../../../lib/timezone-context";
import { ElevationForm } from "../../../components/forms/ElevationForm";

interface Elevation {
  elevation_id: string;
  builder_id: string;
  region_id: string;
  community_id: string;
  community_phase_id: string;
  floor_plan_code: string;
  series: string;
  elevation_code: string;
  assembly_id: string | null;
  floor_plan_assembly_id: string;
  description: string | null;
  comments: string | null;
  num_of_beds: number | null;
  num_of_baths: number | null;
  num_of_garages: number | null;
  main_floor_size: number | null;
  lower_level_size: number | null;
  second_level_size: number | null;
  third_level_size: number | null;
  garage_size: number | null;
  total_size: number | null;
  selling_price: number | null;
  cost: number | null;
  inactive: boolean;
  inactive_date: Date | null;
  is_deleted: boolean;
  deleted_date: Date | null;
  deleted_by: string | null;
  created_by: string;
  modified_by: string;
  created_at: Date;
  updated_at: Date;
  // Additional fields from join
  floor_plan_description?: string;
  community_code?: string;
  region_code?: string;
}

export default function ElevationsPage() {
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
  const userId = session?.user?.id;

  // State for filters
  const [selectedCommunity, setSelectedCommunity] = useState<string>("all");
  const [selectedFloorPlan, setSelectedFloorPlan] = useState<string>("all");

  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingElevation, setEditingElevation] = useState<Elevation | null>(
    null
  );

  // Delete confirmation state
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [elevationToDelete, setElevationToDelete] = useState<Elevation | null>(
    null
  );

  // Get tRPC utils for cache invalidation
  const utils = api.useUtils();

  // Fetch data
  const { data: regions = [] } = api.regions.getAll.useQuery(
    { builderId: builderId! },
    { enabled: !!builderId }
  );

  const { data: communities = [] } = api.builders.getCommunities.useQuery(
    { builderId: builderId! },
    { enabled: !!builderId }
  );

  const { data: floorPlans = [] } = api.elevations.getFloorPlans.useQuery(
    {
      builderId: builderId!,
      communityId: selectedCommunity || undefined,
    },
    { enabled: !!builderId }
  );

  // Fetch elevations data
  const { data: elevations = [], isLoading } = api.elevations.getAll.useQuery(
    {
      builderId: builderId!,
      communityId: selectedCommunity || undefined,
      floorPlanCode: selectedFloorPlan || undefined,
      limit: 1000,
    },
    {
      enabled: !!builderId,
    }
  );

  // Delete elevation mutation
  const deleteElevationMutation = api.elevations.delete.useMutation({
    onSuccess: () => {
      utils.elevations.getAll.invalidate();
      setDeleteConfirmOpen(false);
      setElevationToDelete(null);
    },
    onError: (error) => {
      console.error("Failed to delete elevation:", error);
    },
  });

  // Handle create new elevation
  const handleCreateElevation = useCallback(() => {
    setEditingElevation(null);
    setIsModalOpen(true);
  }, []);

  // Handle edit elevation
  const handleEditElevation = useCallback((elevation: Elevation) => {
    setEditingElevation(elevation);
    setIsModalOpen(true);
  }, []);

  // Handle delete elevation
  const handleDeleteElevation = useCallback((elevation: Elevation) => {
    setElevationToDelete(elevation);
    setDeleteConfirmOpen(true);
  }, []);

  // Confirm delete elevation
  const confirmDeleteElevation = useCallback(() => {
    if (!elevationToDelete || !builderId || !userId) return;

    deleteElevationMutation.mutate({
      builderId: builderId,
      elevationId: elevationToDelete.elevation_id,
      userId: userId,
    });
  }, [elevationToDelete, builderId, userId, deleteElevationMutation]);

  // Handle form success
  const handleFormSuccess = useCallback(() => {
    setIsModalOpen(false);
    setEditingElevation(null);
    utils.elevations.getAll.invalidate();
  }, [utils]);

  // Excel columns configuration for import/export
  const excelColumns: ExcelColumn[] = [
    { field: "region_code", header: "Region Code *", required: true },
    { field: "community_code", header: "Community Code *", required: true },
    { field: "community_phase_code", header: "Phase Code *", required: true },
    { field: "floor_plan_code", header: "Floor Plan Code *", required: true },
    { field: "series", header: "Series *", required: true },
    { field: "elevation_code", header: "Elevation Code *", required: true },
    { field: "description", header: "Description" },
    { field: "num_of_beds", header: "Bedrooms" },
    { field: "num_of_baths", header: "Bathrooms" },
    { field: "num_of_garages", header: "Garage Bays" },
    { field: "total_size", header: "Total Size (sq ft)" },
    { field: "selling_price", header: "Selling Price" },
    { field: "cost", header: "Cost" },
  ];

  // Handle import from DataGrid
  const handleImport = useCallback(
    async (importData: any[]) => {
      if (!builderId || !userId) return;

      const createMutation = api.elevations.create.useMutation();

      for (const row of importData) {
        // Find region, community, phase by codes
        const region = regions.find((r) => r.region_code === row.region_code);
        const community = communities.find(
          (c: any) => c.community_code === row.community_code
        );

        if (!region || !community) {
          console.error(`Missing region or community for row:`, row);
          continue;
        }

        // Skip phase validation for now - would need proper implementation
        const phase = { community_phase_id: "default-phase-id" };

        // Get floor plan assembly (assuming first one for the floor plan)
        const floorPlanAssembly = floorPlans.find(
          (fp: any) => fp.floor_plan_code === row.floor_plan_code
        );

        await createMutation.mutateAsync({
          builderId: builderId,
          userId: userId,
          regionId: region.region_id,
          communityId: community.community_id,
          communityPhaseId: phase.community_phase_id,
          floorPlanCode: row.floor_plan_code,
          series: row.series,
          elevationCode: row.elevation_code,
          floorPlanAssemblyId: floorPlanAssembly?.floor_plan_assembly_id || "",
          description: row.description || null,
          numOfBeds: row.num_of_beds ? Number(row.num_of_beds) : null,
          numOfBaths: row.num_of_baths ? Number(row.num_of_baths) : null,
          numOfGarages: row.num_of_garages ? Number(row.num_of_garages) : null,
          totalSize: row.total_size ? Number(row.total_size) : null,
          sellingPrice: row.selling_price ? Number(row.selling_price) : null,
          cost: row.cost ? Number(row.cost) : null,
        });
      }

      // Refresh data
      utils.elevations.getAll.invalidate();
    },
    [builderId, userId, regions, communities, floorPlans, utils]
  );

  // AG Grid column definitions
  const columnDefs: ColDef[] = useMemo(
    () => [
      {
        headerName: "Floor Plan",
        field: "floor_plan_code",
        sortable: true,
        filter: true,
        flex: 1,
        minWidth: 120,
      },
      {
        headerName: "Elevation Code",
        field: "elevation_code",
        sortable: true,
        filter: true,
        flex: 1,
        minWidth: 120,
      },
      {
        headerName: "Series",
        field: "series",
        sortable: true,
        filter: true,
        flex: 1,
        minWidth: 100,
      },
      {
        headerName: "Description",
        field: "description",
        sortable: true,
        filter: true,
        flex: 2,
        minWidth: 200,
      },
      {
        headerName: "Community",
        field: "community_code",
        sortable: true,
        filter: true,
        flex: 1,
        minWidth: 120,
      },
      {
        headerName: "Beds/Baths/Garage",
        field: "room_config",
        sortable: false,
        filter: false,
        flex: 1,
        minWidth: 140,
        valueGetter: (params) => {
          if (!params.data) return "";
          const beds = params.data.num_of_beds || 0;
          const baths = params.data.num_of_baths || 0;
          const garage = params.data.num_of_garages || 0;
          return `${beds}/${baths}/${garage}`;
        },
      },
      {
        headerName: "Total Size",
        field: "total_size",
        sortable: true,
        filter: "agNumberColumnFilter",
        flex: 1,
        minWidth: 100,
        valueFormatter: (params) => {
          if (!params.value) return "";
          return `${params.value.toLocaleString()} sq ft`;
        },
      },
      {
        headerName: "Selling Price",
        field: "selling_price",
        sortable: true,
        filter: "agNumberColumnFilter",
        flex: 1,
        minWidth: 120,
        valueFormatter: (params) => {
          if (!params.value) return "";
          return new Intl.NumberFormat("en-US", {
            style: "currency",
            currency: "USD",
          }).format(params.value);
        },
      },
      {
        headerName: "Cost",
        field: "cost",
        sortable: true,
        filter: "agNumberColumnFilter",
        flex: 1,
        minWidth: 100,
        valueFormatter: (params) => {
          if (!params.value) return "";
          return new Intl.NumberFormat("en-US", {
            style: "currency",
            currency: "USD",
          }).format(params.value);
        },
      },
      {
        headerName: "Status",
        field: "inactive",
        sortable: true,
        filter: true,
        flex: 1,
        minWidth: 100,
        cellRenderer: (params: any) => {
          return params.value ? (
            <span className="text-red-600">Inactive</span>
          ) : (
            <span className="text-green-600">Active</span>
          );
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
          onEdit: handleEditElevation,
          onDelete: handleDeleteElevation,
        },
      },
    ],
    [handleEditElevation, handleDeleteElevation]
  );

  // Show loading while checking authentication
  if (status === "loading") {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground text-lg">Loading elevations...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="p-6">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
              <Home className="h-8 w-8" />
              Elevations
            </h1>
            <p className="text-muted-foreground">
              Manage floor plan elevations and variations
            </p>
          </div>
          <Button
            onClick={handleCreateElevation}
            className="flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            Add New Elevation
          </Button>
        </div>

        {/* Filters */}
        <Card className="mb-4">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Filter className="h-5 w-5" />
              Filters
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium mb-1 block">
                  Community
                </label>
                <Select
                  value={selectedCommunity}
                  onValueChange={setSelectedCommunity}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="All Communities" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Communities</SelectItem>
                    {communities.map((community: any) => (
                      <SelectItem
                        key={community.community_id}
                        value={community.community_id}
                      >
                        {community.community_code} - {community.description}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">
                  Floor Plan
                </label>
                <Select
                  value={selectedFloorPlan}
                  onValueChange={setSelectedFloorPlan}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="All Floor Plans" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Floor Plans</SelectItem>
                    {floorPlans.map((fp: any) => (
                      <SelectItem
                        key={fp.floor_plan_code}
                        value={fp.floor_plan_code}
                      >
                        {fp.floor_plan_code} -{" "}
                        {fp.description || "No description"}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Elevations</CardTitle>
          </CardHeader>
          <CardContent>
            <DataGrid
              data={elevations}
              loading={isLoading}
              columnDefs={columnDefs}
              excelColumns={excelColumns}
              onImport={handleImport}
              fileName="elevations"
              importTitle="Import Elevations"
            />
          </CardContent>
        </Card>

        {/* Elevation Modal */}
        <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
          <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingElevation ? "Edit Elevation" : "Create New Elevation"}
              </DialogTitle>
            </DialogHeader>
            <ElevationForm
              builderId={builderId!}
              userId={userId!}
              elevation={editingElevation}
              regions={regions}
              communities={communities}
              onSuccess={handleFormSuccess}
              onCancel={() => setIsModalOpen(false)}
            />
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation Dialog */}
        <Dialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Delete Elevation</DialogTitle>
            </DialogHeader>
            <div className="py-4">
              <p className="text-muted-foreground">
                Are you sure you want to delete elevation &ldquo;
                {elevationToDelete?.elevation_code}&rdquo;? This action cannot
                be undone.
              </p>
            </div>
            <div className="flex justify-end gap-2">
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
                onClick={confirmDeleteElevation}
                disabled={deleteElevationMutation.isPending}
              >
                {deleteElevationMutation.isPending
                  ? "Deleting..."
                  : "Delete Elevation"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
