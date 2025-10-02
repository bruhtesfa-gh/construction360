"use client";

import { useEffect, useCallback, useMemo, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import type { ColDef, CellValueChangedEvent } from "ag-grid-community";

import { DataGrid, type ExcelColumn } from "../../../components/grid";
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
import { api } from "../../providers";
import { useTimezone } from "../../../lib/timezone-context";
import "./floorplans.css";

import type { FloorPlan } from "../../../types/database";

// Custom cell renderer for actions
const ActionsCellRenderer = ({
  data,
  onEdit,
  onDelete,
}: {
  data: FloorPlan;
  onEdit: (floorPlan: FloorPlan) => void;
  onDelete: (floorPlan: FloorPlan) => void;
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

// Custom cell renderer for status
const StatusCellRenderer = ({ value }: { value: boolean }) => {
  return (
    <Badge
      className={
        value ? "bg-red-100 text-red-800" : "bg-green-100 text-green-800"
      }
      variant="secondary"
    >
      {value ? "INACTIVE" : "ACTIVE"}
    </Badge>
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

  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingFloorPlan, setEditingFloorPlan] = useState<FloorPlan | null>(
    null
  );
  const [lastUpdatedField, setLastUpdatedField] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    region_id: "",
    community_id: "",
    community_phase_id: "00000000-0000-0000-0000-000000000001", // Default phase ID
    version_number: "1",
    series: "",
    floor_plan_code: "",
    elevation_code: "",
    elevation_id: "00000000-0000-0000-0000-000000000001", // Default elevation ID
    description: "",
    comments: "",
    floor_plan_orientation: "",
    num_of_beds: "",
    num_of_baths: "",
    num_of_garages: "",
    main_floor_size: "",
    second_level_size: "",
    total_size: "",
    selling_price: "",
    cost: "",
    style: "",
    internal_notes: "",
  });

  // Delete confirmation state
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [floorPlanToDelete, setFloorPlanToDelete] = useState<FloorPlan | null>(
    null
  );

  // Get tRPC utils for cache invalidation
  const utils = api.useUtils();

  // Fetch floor plans
  const { data: floorPlans = [], isLoading } = api.floorplans.getAll.useQuery(
    { builderId: builderId! },
    { enabled: !!builderId }
  );

  // Fetch regions for dropdowns
  const { data: regions = [] } = api.regions.getAll.useQuery(
    { builderId: builderId! },
    { enabled: !!builderId }
  );

  // Fetch communities for dropdowns
  const { data: communities = [] } = api.builders.getCommunities.useQuery(
    { builderId: builderId! },
    { enabled: !!builderId }
  );

  // Create floor plan mutation
  const createFloorPlanMutation = api.floorplans.create.useMutation({
    onSuccess: () => {
      utils.floorplans.getAll.invalidate();
      setIsModalOpen(false);
      resetForm();
    },
    onError: (error) => {
      console.error("Failed to create floor plan:", error);
    },
  });

  // Update floor plan mutation
  const updateFloorPlanMutation = api.floorplans.update.useMutation({
    onSuccess: () => {
      utils.floorplans.getAll.invalidate();
      setIsModalOpen(false);
      resetForm();
      setEditingFloorPlan(null);
    },
    onError: (error) => {
      console.error("Failed to update floor plan:", error);
    },
  });

  // Delete floor plan mutation
  const deleteFloorPlanMutation = api.floorplans.delete.useMutation({
    onSuccess: () => {
      utils.floorplans.getAll.invalidate();
      setDeleteConfirmOpen(false);
      setFloorPlanToDelete(null);
    },
    onError: (error) => {
      console.error("Failed to delete floor plan:", error);
    },
  });

  // Reset form
  const resetForm = useCallback(() => {
    setFormData({
      region_id: regions.length > 0 ? regions[0].region_id : "",
      community_id: communities.length > 0 ? communities[0].community_id : "",
      community_phase_id: "00000000-0000-0000-0000-000000000001",
      version_number: "1",
      series: "",
      floor_plan_code: "",
      elevation_code: "",
      elevation_id: "00000000-0000-0000-0000-000000000001",
      description: "",
      comments: "",
      floor_plan_orientation: "",
      num_of_beds: "",
      num_of_baths: "",
      num_of_garages: "",
      main_floor_size: "",
      second_level_size: "",
      total_size: "",
      selling_price: "",
      cost: "",
      style: "",
      internal_notes: "",
    });
  }, [regions, communities]);

  // Handle create new floor plan
  const handleCreateFloorPlan = useCallback(() => {
    setEditingFloorPlan(null);
    resetForm();
    setIsModalOpen(true);
  }, [resetForm]);

  // Handle edit floor plan
  const handleEditFloorPlan = useCallback((floorPlan: FloorPlan) => {
    setEditingFloorPlan(floorPlan);
    setFormData({
      region_id: floorPlan.region_id,
      community_id: floorPlan.community_id,
      community_phase_id: floorPlan.community_phase_id,
      version_number: floorPlan.version_number.toString(),
      series: floorPlan.series,
      floor_plan_code: floorPlan.floor_plan_code,
      elevation_code: floorPlan.elevation_code,
      elevation_id: floorPlan.elevation_id,
      description: floorPlan.description || "",
      comments: floorPlan.comments || "",
      floor_plan_orientation: floorPlan.floor_plan_orientation || "",
      num_of_beds: floorPlan.num_of_beds?.toString() || "",
      num_of_baths: floorPlan.num_of_baths?.toString() || "",
      num_of_garages: floorPlan.num_of_garages?.toString() || "",
      main_floor_size: floorPlan.main_floor_size?.toString() || "",
      second_level_size: floorPlan.second_level_size?.toString() || "",
      total_size: floorPlan.total_size?.toString() || "",
      selling_price: floorPlan.selling_price?.toString() || "",
      cost: floorPlan.cost?.toString() || "",
      style: floorPlan.style || "",
      internal_notes: floorPlan.internal_notes || "",
    });
    setIsModalOpen(true);
  }, []);

  // Handle delete floor plan
  const handleDeleteFloorPlan = useCallback((floorPlan: FloorPlan) => {
    setFloorPlanToDelete(floorPlan);
    setDeleteConfirmOpen(true);
  }, []);

  // Confirm delete floor plan
  const confirmDeleteFloorPlan = useCallback(() => {
    if (!floorPlanToDelete || !builderId || !session?.user?.id) return;

    deleteFloorPlanMutation.mutate({
      builderId: builderId,
      floorPlanId: floorPlanToDelete.floor_plan_id,
      deletedBy: session.user.id,
    });
  }, [
    floorPlanToDelete,
    builderId,
    session?.user?.id,
    deleteFloorPlanMutation,
  ]);

  // Handle form submit
  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();

      if (!builderId || !session?.user?.id) {
        console.error("Missing required data for API call");
        return;
      }

      if (editingFloorPlan) {
        // Update existing floor plan
        updateFloorPlanMutation.mutate({
          builderId: builderId,
          floorPlanId: editingFloorPlan.floor_plan_id,
          description: formData.description || undefined,
          comments: formData.comments || undefined,
          floorPlanOrientation: formData.floor_plan_orientation || undefined,
          numOfBeds: formData.num_of_beds
            ? parseFloat(formData.num_of_beds)
            : undefined,
          numOfBaths: formData.num_of_baths
            ? parseFloat(formData.num_of_baths)
            : undefined,
          numOfGarages: formData.num_of_garages
            ? parseFloat(formData.num_of_garages)
            : undefined,
          mainFloorSize: formData.main_floor_size
            ? parseFloat(formData.main_floor_size)
            : undefined,
          secondLevelSize: formData.second_level_size
            ? parseFloat(formData.second_level_size)
            : undefined,
          totalSize: formData.total_size
            ? parseFloat(formData.total_size)
            : undefined,
          sellingPrice: formData.selling_price
            ? parseFloat(formData.selling_price)
            : undefined,
          cost: formData.cost ? parseFloat(formData.cost) : undefined,
          style: formData.style || undefined,
          internalNotes: formData.internal_notes || undefined,
          modifiedBy: session.user.id,
        });
      } else {
        // Create new floor plan
        createFloorPlanMutation.mutate({
          builderId: builderId,
          regionId: formData.region_id,
          communityId: formData.community_id,
          communityPhaseId: formData.community_phase_id,
          versionNumber: parseInt(formData.version_number),
          series: formData.series,
          floorPlanCode: formData.floor_plan_code,
          elevationCode: formData.elevation_code,
          elevationId: formData.elevation_id,
          description: formData.description || undefined,
          comments: formData.comments || undefined,
          floorPlanOrientation: formData.floor_plan_orientation || undefined,
          numOfBeds: formData.num_of_beds
            ? parseFloat(formData.num_of_beds)
            : undefined,
          numOfBaths: formData.num_of_baths
            ? parseFloat(formData.num_of_baths)
            : undefined,
          numOfGarages: formData.num_of_garages
            ? parseFloat(formData.num_of_garages)
            : undefined,
          mainFloorSize: formData.main_floor_size
            ? parseFloat(formData.main_floor_size)
            : undefined,
          secondLevelSize: formData.second_level_size
            ? parseFloat(formData.second_level_size)
            : undefined,
          totalSize: formData.total_size
            ? parseFloat(formData.total_size)
            : undefined,
          sellingPrice: formData.selling_price
            ? parseFloat(formData.selling_price)
            : undefined,
          cost: formData.cost ? parseFloat(formData.cost) : undefined,
          style: formData.style || undefined,
          internalNotes: formData.internal_notes || undefined,
          createdBy: session.user.id,
          modifiedBy: session.user.id,
        });
      }
    },
    [
      formData,
      editingFloorPlan,
      builderId,
      session?.user?.id,
      createFloorPlanMutation,
      updateFloorPlanMutation,
    ]
  );

  // Handle form input changes
  const handleInputChange = useCallback((field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  }, []);

  // Handle inline cell editing
  const handleCellValueChanged = useCallback(
    async (event: CellValueChangedEvent) => {
      if (!builderId || !session?.user?.id) return;

      const { data, colDef, newValue, oldValue } = event;

      // Only process if value actually changed
      if (newValue === oldValue) return;

      try {
        // Prepare update data based on the field being edited
        const updateData: any = {
          builderId: builderId,
          floorPlanId: data.floor_plan_id,
          modifiedBy: session.user.id,
        };

        // Map the field to the correct API parameter
        switch (colDef.field) {
          case "description":
            updateData.description = newValue || undefined;
            break;
          case "num_of_beds":
            updateData.numOfBeds = newValue ? parseFloat(newValue) : undefined;
            break;
          case "num_of_baths":
            updateData.numOfBaths = newValue ? parseFloat(newValue) : undefined;
            break;
          case "num_of_garages":
            updateData.numOfGarages = newValue
              ? parseFloat(newValue)
              : undefined;
            break;
          case "total_size":
            updateData.totalSize = newValue ? parseFloat(newValue) : undefined;
            break;
          case "selling_price":
            updateData.sellingPrice = newValue
              ? parseFloat(newValue)
              : undefined;
            break;
          case "style":
            updateData.style = newValue || undefined;
            break;
          default:
            console.warn("Unknown field for editing:", colDef.field);
            return;
        }

        // Update the floor plan
        await updateFloorPlanMutation.mutateAsync(updateData);

        // Show success feedback
        setLastUpdatedField(colDef.field!);
        setTimeout(() => setLastUpdatedField(null), 3000);
      } catch (error) {
        console.error("Failed to update floor plan:", error);
        // Revert the change on error
        event.node.setDataValue(colDef.field!, oldValue);
      }
    },
    [builderId, session?.user?.id, updateFloorPlanMutation]
  );

  // Handle import
  const handleImport = useCallback(
    async (importData: any[]) => {
      if (!builderId || !session?.user?.id) return;

      const defaultRegionId = regions[0]?.region_id;

      for (const row of importData) {
        // Find community by code
        let communityId = communities[0]?.community_id;
        if (row.community_code) {
          const communityMatch = communities.find(
            (c: any) => c.community_code === row.community_code
          );
          if (communityMatch) {
            communityId = communityMatch.community_id;
          }
        }

        await createFloorPlanMutation.mutateAsync({
          builderId: builderId,
          regionId: defaultRegionId || "00000000-0000-0000-0000-000000000001",
          communityId: communityId || "00000000-0000-0000-0000-000000000001",
          communityPhaseId: "00000000-0000-0000-0000-000000000001",
          versionNumber: 1,
          series: row.series,
          floorPlanCode: row.floor_plan_code,
          elevationCode: row.elevation_code,
          elevationId: "00000000-0000-0000-0000-000000000001",
          description: row.description || undefined,
          numOfBeds: row.num_of_beds ? parseFloat(row.num_of_beds) : undefined,
          numOfBaths: row.num_of_baths
            ? parseFloat(row.num_of_baths)
            : undefined,
          numOfGarages: row.num_of_garages
            ? parseFloat(row.num_of_garages)
            : undefined,
          totalSize: row.total_size ? parseFloat(row.total_size) : undefined,
          sellingPrice: row.selling_price
            ? parseFloat(row.selling_price)
            : undefined,
          style: row.style || undefined,
          createdBy: session.user.id,
          modifiedBy: session.user.id,
        });
      }

      // Refresh data
      utils.floorplans.getAll.invalidate();
    },
    [
      builderId,
      session?.user?.id,
      regions,
      communities,
      createFloorPlanMutation,
      utils,
    ]
  );

  // Excel columns configuration
  const excelColumns: ExcelColumn[] = [
    { field: "floor_plan_code", header: "Floor Plan Code *", required: true },
    { field: "elevation_code", header: "Elevation Code *", required: true },
    { field: "series", header: "Series *", required: true },
    { field: "description", header: "Description" },
    { field: "community_code", header: "Community Code" },
    { field: "num_of_beds", header: "Beds", type: "number" },
    { field: "num_of_baths", header: "Baths", type: "number" },
    { field: "num_of_garages", header: "Garages", type: "number" },
    { field: "total_size", header: "Total Size (sq ft)", type: "number" },
    { field: "selling_price", header: "Selling Price", type: "number" },
    { field: "style", header: "Style" },
  ];

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
        headerName: "Elevation",
        field: "elevation_code",
        sortable: true,
        filter: true,
        flex: 1,
        minWidth: 100,
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
        headerName: "Community",
        field: "community_name",
        sortable: true,
        filter: true,
        flex: 2,
        minWidth: 150,
        valueGetter: (params) => params.data?.community_name || "Unknown",
      },
      {
        headerName: "Description",
        field: "description",
        sortable: true,
        filter: true,
        flex: 2,
        minWidth: 200,
        editable: true,
        cellClass: "editable-cell",
        valueGetter: (params) => params.data?.description || "",
      },
      {
        headerName: "Beds",
        field: "num_of_beds",
        sortable: true,
        filter: true,
        flex: 0.5,
        minWidth: 80,
        editable: true,
        cellClass: "editable-cell",
        cellEditor: "agNumberCellEditor",
        cellEditorParams: {
          min: 0,
          max: 10,
          precision: 1,
        },
        valueFormatter: (params) => params.value || "0",
      },
      {
        headerName: "Baths",
        field: "num_of_baths",
        sortable: true,
        filter: true,
        flex: 0.5,
        minWidth: 80,
        editable: true,
        cellClass: "editable-cell",
        cellEditor: "agNumberCellEditor",
        cellEditorParams: {
          min: 0,
          max: 10,
          precision: 1,
        },
        valueFormatter: (params) => params.value || "0",
      },
      {
        headerName: "Garages",
        field: "num_of_garages",
        sortable: true,
        filter: true,
        flex: 0.5,
        minWidth: 80,
        editable: true,
        cellClass: "editable-cell",
        cellEditor: "agNumberCellEditor",
        cellEditorParams: {
          min: 0,
          max: 5,
          precision: 1,
        },
        valueFormatter: (params) => params.value || "0",
      },
      {
        headerName: "Size (sq ft)",
        field: "total_size",
        sortable: true,
        filter: true,
        flex: 1,
        minWidth: 100,
        editable: true,
        cellClass: "editable-cell",
        cellEditor: "agNumberCellEditor",
        cellEditorParams: {
          min: 0,
          max: 50000,
          precision: 0,
        },
        valueFormatter: (params) => {
          if (!params.value) return "";
          return params.value.toLocaleString();
        },
      },
      {
        headerName: "Price",
        field: "selling_price",
        sortable: true,
        filter: true,
        flex: 1,
        minWidth: 120,
        editable: true,
        cellClass: "editable-cell",
        cellEditor: "agNumberCellEditor",
        cellEditorParams: {
          min: 0,
          precision: 0,
        },
        valueFormatter: (params) => {
          if (!params.value) return "";
          return "$" + params.value.toLocaleString();
        },
      },
      {
        headerName: "Style",
        field: "style",
        sortable: true,
        filter: true,
        flex: 1,
        minWidth: 100,
        editable: true,
        cellClass: "editable-cell",
        cellEditor: "agSelectCellEditor",
        cellEditorParams: {
          values: [
            "Traditional",
            "Modern",
            "Contemporary",
            "Ranch",
            "Colonial",
            "Mediterranean",
            "Craftsman",
            "Victorian",
            "Other",
          ],
        },
        valueGetter: (params) => params.data?.style || "",
      },
      {
        headerName: "Status",
        field: "inactive",
        sortable: true,
        filter: true,
        flex: 1,
        minWidth: 100,
        cellRenderer: StatusCellRenderer,
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
          onEdit: handleEditFloorPlan,
          onDelete: handleDeleteFloorPlan,
        },
      },
    ],
    [handleEditFloorPlan, handleDeleteFloorPlan]
  );

  // Show loading while checking authentication
  if (status === "loading") {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!session) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="p-6">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
              <Home className="h-8 w-8" />
              Floor Plans
            </h1>
            <p className="text-muted-foreground">
              Manage floor plans and elevations
            </p>
          </div>
          <Button
            onClick={handleCreateFloorPlan}
            className="flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            Add New Floor Plan
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Floor Plan List</CardTitle>
            <div className="mt-2 space-y-1">
              <p className="text-sm text-muted-foreground">
                Double-click on cells to edit: Description, Beds, Baths,
                Garages, Size, Price, or Style
              </p>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <div className="flex items-center gap-1">
                  <div className="w-4 h-4 border-2 border-dashed border-gray-400 rounded"></div>
                  <span>Editable cells</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-4 h-4 border border-gray-300 rounded"></div>
                  <span>Read-only cells</span>
                </div>
              </div>
              {lastUpdatedField && (
                <div className="mt-2 p-2 bg-green-50 border border-green-200 rounded text-green-700 text-sm">
                  ✓{" "}
                  {lastUpdatedField
                    .replace(/_/g, " ")
                    .replace(/\b\w/g, (l) => l.toUpperCase())}{" "}
                  updated successfully
                </div>
              )}
            </div>
          </CardHeader>
          <CardContent>
            <DataGrid
              data={floorPlans}
              loading={isLoading}
              columnDefs={columnDefs}
              excelColumns={excelColumns}
              onImport={handleImport}
              fileName="floorplans"
              importTitle="Import Floor Plans"
              enableEditing={true}
              onCellValueChanged={handleCellValueChanged}
            />
          </CardContent>
        </Card>

        {/* Create/Edit Modal */}
        <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingFloorPlan ? "Edit Floor Plan" : "Create New Floor Plan"}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="region_id">Region</Label>
                  <Select
                    value={formData.region_id}
                    onValueChange={(value) =>
                      handleInputChange("region_id", value)
                    }
                    disabled={!!editingFloorPlan}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select region" />
                    </SelectTrigger>
                    <SelectContent>
                      {regions.map((region) => (
                        <SelectItem
                          key={region.region_id}
                          value={region.region_id}
                        >
                          {region.region_code} - {region.description || ""}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="community_id">Community</Label>
                  <Select
                    value={formData.community_id}
                    onValueChange={(value) =>
                      handleInputChange("community_id", value)
                    }
                    disabled={!!editingFloorPlan}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select community" />
                    </SelectTrigger>
                    <SelectContent>
                      {communities.map((community: any) => (
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
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="floor_plan_code">Floor Plan Code *</Label>
                  <Input
                    id="floor_plan_code"
                    value={formData.floor_plan_code}
                    onChange={(e) =>
                      handleInputChange("floor_plan_code", e.target.value)
                    }
                    required
                    disabled={!!editingFloorPlan}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="elevation_code">Elevation Code *</Label>
                  <Input
                    id="elevation_code"
                    value={formData.elevation_code}
                    onChange={(e) =>
                      handleInputChange("elevation_code", e.target.value)
                    }
                    required
                    disabled={!!editingFloorPlan}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="series">Series *</Label>
                  <Input
                    id="series"
                    value={formData.series}
                    onChange={(e) =>
                      handleInputChange("series", e.target.value)
                    }
                    required
                    disabled={!!editingFloorPlan}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Input
                  id="description"
                  value={formData.description}
                  onChange={(e) =>
                    handleInputChange("description", e.target.value)
                  }
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="num_of_beds">Bedrooms</Label>
                  <Input
                    id="num_of_beds"
                    type="number"
                    step="0.5"
                    value={formData.num_of_beds}
                    onChange={(e) =>
                      handleInputChange("num_of_beds", e.target.value)
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="num_of_baths">Bathrooms</Label>
                  <Input
                    id="num_of_baths"
                    type="number"
                    step="0.5"
                    value={formData.num_of_baths}
                    onChange={(e) =>
                      handleInputChange("num_of_baths", e.target.value)
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="num_of_garages">Garage Spaces</Label>
                  <Input
                    id="num_of_garages"
                    type="number"
                    step="0.5"
                    value={formData.num_of_garages}
                    onChange={(e) =>
                      handleInputChange("num_of_garages", e.target.value)
                    }
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="total_size">Total Size (sq ft)</Label>
                  <Input
                    id="total_size"
                    type="number"
                    value={formData.total_size}
                    onChange={(e) =>
                      handleInputChange("total_size", e.target.value)
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="selling_price">Selling Price</Label>
                  <Input
                    id="selling_price"
                    type="number"
                    value={formData.selling_price}
                    onChange={(e) =>
                      handleInputChange("selling_price", e.target.value)
                    }
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="style">Style</Label>
                <Input
                  id="style"
                  value={formData.style}
                  onChange={(e) => handleInputChange("style", e.target.value)}
                />
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
                    createFloorPlanMutation.isPending ||
                    updateFloorPlanMutation.isPending
                  }
                >
                  {editingFloorPlan ? "Update" : "Create"} Floor Plan
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation Dialog */}
        <Dialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Delete Floor Plan</DialogTitle>
            </DialogHeader>
            <div className="py-4">
              <p className="text-muted-foreground">
                Are you sure you want to delete floor plan &ldquo;
                {floorPlanToDelete?.floor_plan_code}&rdquo;? This will mark it
                as deleted but keep the record.
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
                onClick={confirmDeleteFloorPlan}
                disabled={deleteFloorPlanMutation.isPending}
              >
                {deleteFloorPlanMutation.isPending
                  ? "Deleting..."
                  : "Delete Floor Plan"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
