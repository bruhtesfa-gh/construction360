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
import { Plus, Map } from "lucide-react";
import { ActionsCellRenderer } from "../../../components/grid/ActionsCellRenderer";
import { api } from "../../providers";
import { useTimezone } from "../../../lib/timezone-context";

interface Region {
  region_id: string;
  builder_id: string;
  division_id: string | null;
  region_code: string;
  description: string;
  manager_id: string | null;
  created_at: Date;
  updated_at: Date;
}

export default function RegionsPage() {
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
  const [editingRegion, setEditingRegion] = useState<Region | null>(null);
  const [formData, setFormData] = useState({
    region_code: "",
    description: "",
    manager_id: "",
    division_id: "",
  });

  // Delete confirmation state
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [regionToDelete, setRegionToDelete] = useState<Region | null>(null);

  // Get tRPC utils for cache invalidation
  const utils = api.useUtils();

  // Fetch regions data
  const { data: regions = [], isLoading } = api.regions.getAll.useQuery(
    {
      builderId: builderId!,
      limit: 1000,
    },
    {
      enabled: !!builderId,
    }
  );

  // Fetch users for manager dropdown
  const { data: users = [] } = api.users.getAll.useQuery(
    {
      builderId: builderId!,
    },
    {
      enabled: !!builderId,
    }
  );

  // Fetch divisions for division dropdown
  const { data: divisions = [] } = api.divisions.getAll.useQuery(
    {
      builderId: builderId!,
    },
    {
      enabled: !!builderId,
    }
  );

  // Create region mutation
  const createRegionMutation = api.regions.create.useMutation({
    onSuccess: () => {
      utils.regions.getAll.invalidate();
      setIsModalOpen(false);
      setFormData({
        region_code: "",
        description: "",
        manager_id: "",
        division_id: "",
      });
    },
    onError: (error) => {
      console.error("Failed to create region:", error);
    },
  });

  // Update region mutation
  const updateRegionMutation = api.regions.update.useMutation({
    onSuccess: () => {
      utils.regions.getAll.invalidate();
      setIsModalOpen(false);
      setEditingRegion(null);
    },
    onError: (error) => {
      console.error("Failed to update region:", error);
    },
  });

  // Delete region mutation
  const deleteRegionMutation = api.regions.delete.useMutation({
    onSuccess: () => {
      utils.regions.getAll.invalidate();
      setDeleteConfirmOpen(false);
      setRegionToDelete(null);
    },
    onError: (error) => {
      console.error("Failed to delete region:", error);
    },
  });

  // Handle create new region
  const handleCreateRegion = useCallback(() => {
    setEditingRegion(null);
    setFormData({
      region_code: "",
      description: "",
      manager_id: "",
      division_id: "",
    });
    setIsModalOpen(true);
  }, []);

  // Handle edit region
  const handleEditRegion = useCallback((region: Region) => {
    setEditingRegion(region);
    setFormData({
      region_code: region.region_code,
      description: region.description || "",
      manager_id: region.manager_id || "",
      division_id: region.division_id || "",
    });
    setIsModalOpen(true);
  }, []);

  // Handle delete region
  const handleDeleteRegion = useCallback((region: Region) => {
    setRegionToDelete(region);
    setDeleteConfirmOpen(true);
  }, []);

  // Confirm delete region
  const confirmDeleteRegion = useCallback(() => {
    if (!regionToDelete || !builderId) return;

    deleteRegionMutation.mutate({
      builderId: builderId,
      regionId: regionToDelete.region_id,
    });
  }, [regionToDelete, builderId, deleteRegionMutation]);

  // Handle form submit
  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();

      if (!builderId) {
        console.error("Missing required data for API call");
        return;
      }

      if (editingRegion) {
        // Update existing region
        updateRegionMutation.mutate({
          builderId: builderId,
          regionId: editingRegion.region_id,
          regionCode: formData.region_code,
          description: formData.description,
          managerId: formData.manager_id || null,
          divisionId: formData.division_id || null,
        });
      } else {
        // Create new region
        createRegionMutation.mutate({
          builderId: builderId,
          regionCode: formData.region_code,
          description: formData.description,
          managerId: formData.manager_id || undefined,
          divisionId: formData.division_id || undefined,
        });
      }
    },
    [
      formData,
      editingRegion,
      builderId,
      createRegionMutation,
      updateRegionMutation,
    ]
  );

  // Handle form input changes
  const handleInputChange = useCallback((field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  }, []);

  // Excel columns configuration for import/export
  const excelColumns: ExcelColumn[] = [
    { field: "region_code", header: "Region Code *", required: true },
    { field: "description", header: "Description *", required: true },
    { field: "division_code", header: "Division Code" },
    { field: "manager_login_id", header: "Manager Login ID" },
  ];

  // Handle import from DataGrid
  const handleImport = useCallback(
    async (importData: any[]) => {
      if (!builderId) return;

      for (const row of importData) {
        // Find manager by login ID if provided
        let managerId = undefined;
        if (row.manager_login_id) {
          const manager = users.find(
            (u) => u.user_login_id === row.manager_login_id
          );
          if (manager) {
            managerId = manager.user_id;
          }
        }

        // Find division by code if provided
        let divisionId = undefined;
        if (row.division_code) {
          const division = divisions.find(
            (d) => d.division_code === row.division_code
          );
          if (division) {
            divisionId = division.division_id;
          }
        }

        await createRegionMutation.mutateAsync({
          builderId: builderId,
          regionCode: row.region_code,
          description: row.description,
          managerId: managerId,
          divisionId: divisionId,
        });
      }

      // Refresh data
      utils.regions.getAll.invalidate();
    },
    [builderId, users, divisions, createRegionMutation, utils]
  );

  // AG Grid column definitions
  const columnDefs: ColDef[] = useMemo(
    () => [
      {
        headerName: "Region Code",
        field: "region_code",
        sortable: true,
        filter: true,
        flex: 1,
        minWidth: 120,
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
        headerName: "Division",
        field: "division_id",
        sortable: true,
        filter: true,
        flex: 1,
        minWidth: 150,
        valueGetter: (params) => {
          if (!params.data?.division_id) return "No division assigned";
          const division = divisions.find(
            (d) => d.division_id === params.data.division_id
          );
          return division
            ? `${division.division_code} - ${division.division_name || ""}`
            : "Unknown";
        },
      },
      {
        headerName: "Manager",
        field: "manager_id",
        sortable: true,
        filter: true,
        flex: 2,
        minWidth: 200,
        valueGetter: (params) => {
          if (!params.data?.manager_id) return "No manager assigned";
          const manager = users.find(
            (u) => u.user_id === params.data.manager_id
          );
          return manager
            ? `${manager.first_name} ${manager.last_name}`
            : "Unknown";
        },
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
          onEdit: handleEditRegion,
          onDelete: handleDeleteRegion,
        },
      },
    ],
    [handleEditRegion, handleDeleteRegion, formatDate, users, divisions]
  );

  // Show loading while checking authentication
  if (status === "loading") {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground text-lg">Loading regions...</p>
        </div>
      </div>
    );
  }

  // Show loading while fetching regions data
  if (builderId && isLoading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold">Regions Management</h1>
            <p className="text-muted-foreground">
              Manage geographic regions for your construction projects
            </p>
          </div>
        </div>
        <Card>
          <CardHeader>
            <CardTitle>Regions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-center h-64">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                <p className="text-muted-foreground">Loading regions data...</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="p-6">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
              <Map className="h-8 w-8" />
              Regions
            </h1>
            <p className="text-muted-foreground">
              Manage geographic regions for your construction projects
            </p>
          </div>
          <Button
            onClick={handleCreateRegion}
            className="flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            Add New Region
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Regions</CardTitle>
          </CardHeader>
          <CardContent>
            <DataGrid
              data={regions}
              loading={isLoading}
              columnDefs={columnDefs}
              excelColumns={excelColumns}
              onImport={handleImport}
              fileName="regions"
              importTitle="Import Regions"
            />
          </CardContent>
        </Card>

        {/* Region Modal */}
        <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>
                {editingRegion ? "Edit Region" : "Create New Region"}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit}>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="region_code" className="text-right">
                    Code *
                  </Label>
                  <Input
                    id="region_code"
                    value={formData.region_code}
                    onChange={(e) =>
                      handleInputChange("region_code", e.target.value)
                    }
                    className="col-span-3"
                    placeholder="e.g., WEST, EAST"
                    required
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="description" className="text-right">
                    Description *
                  </Label>
                  <Input
                    id="description"
                    value={formData.description}
                    onChange={(e) =>
                      handleInputChange("description", e.target.value)
                    }
                    className="col-span-3"
                    placeholder="Region description"
                    required
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="division_id" className="text-right">
                    Division
                  </Label>
                  <Select
                    value={formData.division_id || "no-division"}
                    onValueChange={(value) =>
                      handleInputChange(
                        "division_id",
                        value === "no-division" ? "" : value
                      )
                    }
                  >
                    <SelectTrigger className="col-span-3">
                      <SelectValue placeholder="Select a division" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="no-division">No division</SelectItem>
                      {divisions.map((division) => (
                        <SelectItem
                          key={division.division_id}
                          value={division.division_id}
                        >
                          {division.division_code} -{" "}
                          {division.division_name || ""}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="manager_id" className="text-right">
                    Manager
                  </Label>
                  <Select
                    value={formData.manager_id || "no-manager"}
                    onValueChange={(value) =>
                      handleInputChange(
                        "manager_id",
                        value === "no-manager" ? "" : value
                      )
                    }
                  >
                    <SelectTrigger className="col-span-3">
                      <SelectValue placeholder="Select a manager" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="no-manager">No manager</SelectItem>
                      {users.map((user) => (
                        <SelectItem key={user.user_id} value={user.user_id}>
                          {user.first_name} {user.last_name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
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
                    createRegionMutation.isPending ||
                    updateRegionMutation.isPending
                  }
                >
                  {createRegionMutation.isPending ||
                  updateRegionMutation.isPending
                    ? editingRegion
                      ? "Updating..."
                      : "Creating..."
                    : editingRegion
                    ? "Update Region"
                    : "Create Region"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation Dialog */}
        <Dialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Delete Region</DialogTitle>
            </DialogHeader>
            <div className="py-4">
              <p className="text-muted-foreground">
                Are you sure you want to delete region &ldquo;
                {regionToDelete?.region_code}&rdquo;? This action cannot be
                undone.
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
                onClick={confirmDeleteRegion}
                disabled={deleteRegionMutation.isPending}
              >
                {deleteRegionMutation.isPending
                  ? "Deleting..."
                  : "Delete Region"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
