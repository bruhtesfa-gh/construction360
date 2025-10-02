"use client";

import { useEffect, useCallback, useMemo, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import type { ColDef } from "ag-grid-community";

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
import { Plus, Edit, Trash2, MapPin } from "lucide-react";
import { AddressCellRenderer } from "../../../components/grid/AddressCellRenderer";
import { api } from "../../providers";
import { useTimezone } from "../../../lib/timezone-context";

interface Community {
  community_id: string;
  region_id: string;
  description: string; // This is the actual field name for community name in the database
  community_code: string | null;
  address1: string | null;
  city: string | null;
  state: string | null;
  zip: string | null;
  created_at: Date;
  updated_at: Date;
}

// Custom cell renderer for actions
const ActionsCellRenderer = ({
  data,
  onEdit,
  onDelete,
}: {
  data: Community;
  onEdit: (community: Community) => void;
  onDelete: (community: Community) => void;
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

export default function CommunitiesPage() {
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
  const [editingCommunity, setEditingCommunity] = useState<Community | null>(
    null
  );
  const [formData, setFormData] = useState({
    description: "",
    community_code: "",
    address1: "",
    city: "",
    state: "",
    zip: "",
    region_id: "",
  });

  // Delete confirmation state
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [communityToDelete, setCommunityToDelete] = useState<Community | null>(
    null
  );

  // Get tRPC utils for cache invalidation
  const utils = api.useUtils();

  // Fetch communities data
  const { data: communities = [], isLoading } =
    api.builders.getCommunities.useQuery(
      {
        builderId: builderId!,
      },
      {
        enabled: !!builderId,
      }
    );

  // Fetch homes to check for dependencies
  const { data: homes = [] } = api.homes.getAll.useQuery(
    {
      builderId: builderId!,
      limit: 1000,
    },
    {
      enabled: !!builderId,
    }
  );

  // Fetch regions for dropdown
  const { data: regions = [] } = api.builders.getRegions.useQuery(
    {
      builderId: builderId!,
    },
    {
      enabled: !!builderId,
    }
  );

  // Create community mutation
  const createCommunityMutation = api.builders.createCommunity.useMutation({
    onSuccess: () => {
      utils.builders.getCommunities.invalidate();
      setIsModalOpen(false);
      setFormData({
        description: "",
        community_code: "",
        address1: "",
        city: "",
        state: "",
        zip: "",
        region_id: "",
      });
    },
    onError: (error) => {
      console.error("Failed to create community:", error);
    },
  });

  // Update community mutation
  const updateCommunityMutation = api.builders.updateCommunity.useMutation({
    onSuccess: () => {
      utils.builders.getCommunities.invalidate();
      setIsModalOpen(false);
      setEditingCommunity(null);
    },
    onError: (error) => {
      console.error("Failed to update community:", error);
    },
  });

  // Delete community mutation
  const deleteCommunityMutation = api.builders.deleteCommunity.useMutation({
    onSuccess: () => {
      utils.builders.getCommunities.invalidate();
      utils.homes.getAll.invalidate(); // Also invalidate homes since they may be deleted
      setDeleteConfirmOpen(false);
      setCommunityToDelete(null);
    },
    onError: (error) => {
      console.error("Failed to delete community:", error);
    },
  });

  // Handle create new community
  const handleCreateCommunity = useCallback(() => {
    setEditingCommunity(null);
    setFormData({
      description: "",
      community_code: "",
      address1: "",
      city: "",
      state: "",
      zip: "",
      region_id: regions.length > 0 ? regions[0].region_id : "",
    });
    setIsModalOpen(true);
  }, [regions]);

  // Handle edit community
  const handleEditCommunity = useCallback((community: Community) => {
    setEditingCommunity(community);
    setFormData({
      description: community.description || "",
      community_code: community.community_code || "",
      address1: community.address1 || "",
      city: community.city || "",
      state: community.state || "",
      zip: community.zip || "",
      region_id: community.region_id || "",
    });
    setIsModalOpen(true);
  }, []);

  // Handle delete community
  const handleDeleteCommunity = useCallback((community: Community) => {
    setCommunityToDelete(community);
    setDeleteConfirmOpen(true);
  }, []);

  // Confirm delete community
  const confirmDeleteCommunity = useCallback(() => {
    if (!communityToDelete || !builderId) return;

    deleteCommunityMutation.mutate({
      builderId: builderId,
      communityId: communityToDelete.community_id,
    });
  }, [communityToDelete, builderId, deleteCommunityMutation]);

  // Handle form submit
  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();

      if (!builderId || !session?.user?.id) {
        console.error("Missing required data for API call");
        return;
      }

      if (editingCommunity) {
        // Update existing community
        updateCommunityMutation.mutate({
          builderId: builderId,
          communityId: editingCommunity.community_id,
          description: formData.description || undefined,
          communityCode: formData.community_code || undefined,
          address1: formData.address1 || undefined,
          city: formData.city || undefined,
          state: formData.state || undefined,
          zip: formData.zip || undefined,
        });
      } else {
        // Create new community
        createCommunityMutation.mutate({
          builderId: builderId,
          regionId: formData.region_id,
          description: formData.description,
          communityCode: formData.community_code || undefined,
          address1: formData.address1 || undefined,
          city: formData.city || undefined,
          state: formData.state || undefined,
          zip: formData.zip || undefined,
        });
      }
    },
    [
      formData,
      editingCommunity,
      builderId,
      session?.user?.id,
      createCommunityMutation,
      updateCommunityMutation,
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
        headerName: "Community Name",
        field: "description",
        sortable: true,
        filter: true,
        flex: 2,
        minWidth: 200,
      },
      {
        headerName: "Code",
        field: "community_code",
        sortable: true,
        filter: true,
        flex: 1,
        minWidth: 100,
        valueGetter: (params) => params.data?.community_code || "No code",
      },
      {
        headerName: "Region",
        field: "region_id",
        sortable: true,
        filter: true,
        flex: 1,
        minWidth: 150,
        valueGetter: (params) => {
          const region = regions.find(
            (r) => r.region_id === params.data?.region_id
          );
          return region
            ? `${region.region_code} - ${region.description}`
            : "Unknown";
        },
      },
      {
        headerName: "City",
        field: "city",
        sortable: true,
        filter: true,
        flex: 1,
        minWidth: 120,
        valueGetter: (params) => params.data?.city || "Unknown",
      },
      {
        headerName: "State",
        field: "state",
        sortable: true,
        filter: true,
        flex: 1,
        minWidth: 80,
        valueGetter: (params) => params.data?.state || "Unknown",
      },
      {
        headerName: "ZIP Code",
        field: "zip",
        sortable: true,
        filter: true,
        flex: 1,
        minWidth: 100,
        valueGetter: (params) => params.data?.zip || "Unknown",
      },
      {
        headerName: "Full Address",
        field: "full_address",
        sortable: false,
        filter: true,
        flex: 2,
        minWidth: 250,
        cellRenderer: AddressCellRenderer,
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
          onEdit: handleEditCommunity,
          onDelete: handleDeleteCommunity,
        },
      },
    ],
    [handleEditCommunity, handleDeleteCommunity, formatDate, regions]
  );

  // Excel columns configuration for import/export
  const excelColumns: ExcelColumn[] = [
    { field: "description", header: "Community Name *", required: true },
    { field: "community_code", header: "Code" },
    { field: "address1", header: "Address" },
    { field: "city", header: "City" },
    { field: "state", header: "State" },
    { field: "zip", header: "ZIP Code" },
    { field: "region_code", header: "Region Code" },
  ];

  // Handle import from DataGrid
  const handleImport = useCallback(
    async (importData: any[]) => {
      if (!builderId || !session?.user?.id) return;

      const defaultRegionId = regions[0]?.region_id;

      for (const row of importData) {
        // Find region by code
        let regionId = defaultRegionId;
        if (row.region_code) {
          const regionMatch = regions.find(
            (r) => r.region_code === row.region_code
          );
          if (regionMatch) {
            regionId = regionMatch.region_id;
          }
        }

        await createCommunityMutation.mutateAsync({
          builderId: builderId,
          regionId: regionId || "00000000-0000-0000-0000-000000000001",
          description: row.description,
          communityCode: row.community_code || undefined,
          address1: row.address1 || undefined,
          city: row.city || undefined,
          state: row.state || undefined,
          zip: row.zip || undefined,
        });
      }

      // Refresh data
      utils.builders.getCommunities.invalidate();
    },
    [builderId, session?.user?.id, regions, createCommunityMutation, utils]
  );

  // Show loading while checking authentication
  if (status === "loading") {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground text-lg">
            Loading communities...
          </p>
        </div>
      </div>
    );
  }

  // Show loading while fetching communities data
  if (builderId && isLoading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold">Communities Management</h1>
            <p className="text-muted-foreground">
              Manage development communities and locations
            </p>
          </div>
        </div>
        <Card>
          <CardHeader>
            <CardTitle>Development Communities</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-center h-64">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                <p className="text-muted-foreground">
                  Loading communities data...
                </p>
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
            <MapPin className="h-8 w-8" />
            Communities
          </h1>
          <p className="text-muted-foreground">
            Manage development communities and locations
          </p>
        </div>
        <Button
          onClick={handleCreateCommunity}
          className="flex items-center gap-2"
        >
          <Plus className="h-4 w-4" />
          Add New Community
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Community List</CardTitle>
        </CardHeader>
        <CardContent>
          <DataGrid
            data={communities}
            loading={isLoading}
            columnDefs={columnDefs}
            excelColumns={excelColumns}
            onImport={handleImport}
            fileName="communities"
            importTitle="Import Communities"
          />
        </CardContent>
      </Card>

      {/* Community Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>
              {editingCommunity ? "Edit Community" : "Create New Community"}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="grid gap-4 py-4">
              {!editingCommunity && (
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="region_id" className="text-right">
                    Region *
                  </Label>
                  <Select
                    value={formData.region_id}
                    onValueChange={(value) =>
                      handleInputChange("region_id", value)
                    }
                    required
                  >
                    <SelectTrigger className="col-span-3">
                      <SelectValue placeholder="Select a region" />
                    </SelectTrigger>
                    <SelectContent>
                      {regions.map((region) => (
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
              )}
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="description" className="text-right">
                  Name *
                </Label>
                <Input
                  id="description"
                  value={formData.description}
                  onChange={(e) =>
                    handleInputChange("description", e.target.value)
                  }
                  className="col-span-3"
                  placeholder="Community name"
                  required
                />
              </div>

              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="community_code" className="text-right">
                  Code
                </Label>
                <Input
                  id="community_code"
                  value={formData.community_code}
                  onChange={(e) =>
                    handleInputChange("community_code", e.target.value)
                  }
                  className="col-span-3"
                  placeholder="Community code"
                />
              </div>

              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="address1" className="text-right">
                  Address
                </Label>
                <Input
                  id="address1"
                  value={formData.address1}
                  onChange={(e) =>
                    handleInputChange("address1", e.target.value)
                  }
                  className="col-span-3"
                  placeholder="Street address"
                />
              </div>

              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="city" className="text-right">
                  City
                </Label>
                <Input
                  id="city"
                  value={formData.city}
                  onChange={(e) => handleInputChange("city", e.target.value)}
                  className="col-span-3"
                  placeholder="City name"
                />
              </div>

              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="state" className="text-right">
                  State
                </Label>
                <Input
                  id="state"
                  value={formData.state}
                  onChange={(e) => handleInputChange("state", e.target.value)}
                  className="col-span-3"
                  placeholder="State abbreviation"
                  maxLength={2}
                />
              </div>

              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="zip" className="text-right">
                  ZIP Code
                </Label>
                <Input
                  id="zip"
                  value={formData.zip}
                  onChange={(e) => handleInputChange("zip", e.target.value)}
                  className="col-span-3"
                  placeholder="ZIP code"
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
                  createCommunityMutation.isPending ||
                  updateCommunityMutation.isPending
                }
              >
                {createCommunityMutation.isPending ||
                updateCommunityMutation.isPending
                  ? editingCommunity
                    ? "Updating..."
                    : "Creating..."
                  : editingCommunity
                  ? "Update Community"
                  : "Create Community"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Delete Community</DialogTitle>
          </DialogHeader>
          <div className="py-4 space-y-3">
            <p className="text-muted-foreground">
              Are you sure you want to delete community &ldquo;
              {communityToDelete?.description}&rdquo;?
            </p>
            {(() => {
              const communityHomes = homes.filter(
                (home) => home.community_id === communityToDelete?.community_id
              );
              const homeCount = communityHomes.length;

              if (homeCount > 0) {
                return (
                  <div className="bg-red-50 border border-red-200 rounded-md p-3">
                    <p className="text-red-800 font-medium text-sm">
                      ⚠️ Warning: This will also delete {homeCount}{" "}
                      {homeCount === 1 ? "home" : "homes"} in this community!
                    </p>
                    <p className="text-red-700 text-xs mt-1">
                      All homes, floor plans, and related data in this community
                      will be permanently removed.
                    </p>
                  </div>
                );
              }
              return null;
            })()}
            <p className="text-muted-foreground text-sm">
              This action cannot be undone.
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
              onClick={confirmDeleteCommunity}
              disabled={deleteCommunityMutation.isPending}
            >
              {deleteCommunityMutation.isPending
                ? "Deleting..."
                : "Delete Community & All Homes"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
