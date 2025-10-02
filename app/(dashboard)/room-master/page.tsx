"use client";

import { useEffect, useCallback, useMemo, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { DataGrid, type ExcelColumn } from "../../../components/grid";
import type { ColDef, CellValueChangedEvent } from "ag-grid-community";

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
import { Checkbox } from "../../../components/ui/checkbox";
import { Plus, Edit, Trash2, Home } from "lucide-react";
import { api } from "../../providers";
import { useTimezone } from "../../../lib/timezone-context";

import type { RoomMaster } from "../../../types/database";

// Extend to include joined fields
interface RoomMasterWithRegion extends RoomMaster {
  region_code: string;
  region_name: string;
}

// Custom cell renderer for actions
const ActionsCellRenderer = ({
  data,
  onEdit,
  onDelete,
}: {
  data: RoomMasterWithRegion;
  onEdit: (room: RoomMasterWithRegion) => void;
  onDelete: (room: RoomMasterWithRegion) => void;
}) => {
  return (
    <div className="flex items-center gap-2 h-full">
      <Button
        variant="outline"
        size="sm"
        onClick={() => onEdit(data)}
        className="h-8 w-8 p-0"
        title="Edit room"
      >
        <Edit className="h-4 w-4" />
      </Button>
      <Button
        variant="outline"
        size="sm"
        onClick={() => onDelete(data)}
        className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
        title="Delete room"
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

// Excel column definitions
const excelColumns: ExcelColumn[] = [
  { field: "room_location", header: "Room Location *", required: true },
  { field: "region_code", header: "Region Code *", required: true },
  { field: "floor_level", header: "Floor Level" },
  {
    field: "inactive",
    header: "Inactive",
    type: "boolean",
    defaultValue: "false",
  },
];

export default function RoomMasterPage() {
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
  const [editingRoom, setEditingRoom] = useState<RoomMasterWithRegion | null>(
    null
  );
  const [formData, setFormData] = useState({
    region_id: "",
    room_location: "",
    floor_level: "",
    inactive: false,
  });

  // Delete confirmation state
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [roomToDelete, setRoomToDelete] = useState<RoomMasterWithRegion | null>(
    null
  );

  // Filter state
  const [selectedRegion, setSelectedRegion] = useState<string>("");
  const [includeInactive, setIncludeInactive] = useState(false);

  // Get tRPC utils for cache invalidation
  const utils = api.useUtils();

  // Fetch rooms data
  const { data: rooms = [], isLoading } = api.roomMaster.getAll.useQuery(
    {
      builderId: builderId!,
      regionId: selectedRegion || undefined,
      includeInactive: includeInactive,
    },
    {
      enabled: !!builderId,
    }
  );

  // Fetch regions for dropdown
  const { data: regions = [] } = api.regions.getAll.useQuery(
    {
      builderId: builderId!,
    },
    {
      enabled: !!builderId,
    }
  );

  // Create room mutation
  const createRoomMutation = api.roomMaster.create.useMutation({
    onSuccess: () => {
      utils.roomMaster.getAll.invalidate();
      setIsModalOpen(false);
      resetForm();
    },
    onError: (error) => {
      console.error("Failed to create room:", error);
      alert(error.message);
    },
  });

  // Update room mutation
  const updateRoomMutation = api.roomMaster.update.useMutation({
    onSuccess: () => {
      utils.roomMaster.getAll.invalidate();
      setIsModalOpen(false);
      setEditingRoom(null);
    },
    onError: (error) => {
      console.error("Failed to update room:", error);
      alert(error.message);
    },
  });

  // Delete room mutation
  const deleteRoomMutation = api.roomMaster.delete.useMutation({
    onSuccess: () => {
      utils.roomMaster.getAll.invalidate();
      setDeleteConfirmOpen(false);
      setRoomToDelete(null);
    },
    onError: (error) => {
      console.error("Failed to delete room:", error);
      alert(error.message);
    },
  });

  // Reset form
  const resetForm = useCallback(() => {
    setFormData({
      region_id: "",
      room_location: "",
      floor_level: "",
      inactive: false,
    });
  }, []);

  // Handle create new room
  const handleCreateRoom = useCallback(() => {
    setEditingRoom(null);
    resetForm();
    setIsModalOpen(true);
  }, [resetForm]);

  // Handle edit room
  const handleEditRoom = useCallback((room: RoomMasterWithRegion) => {
    setEditingRoom(room);
    setFormData({
      region_id: room.region_id,
      room_location: room.room_location,
      floor_level: room.floor_level || "",
      inactive: room.inactive,
    });
    setIsModalOpen(true);
  }, []);

  // Handle delete room
  const handleDeleteRoom = useCallback((room: RoomMasterWithRegion) => {
    setRoomToDelete(room);
    setDeleteConfirmOpen(true);
  }, []);

  // Confirm delete room
  const confirmDeleteRoom = useCallback(() => {
    if (!roomToDelete || !builderId) return;

    deleteRoomMutation.mutate({
      builderId: builderId,
      roomMasterId: roomToDelete.room_master_id,
    });
  }, [roomToDelete, builderId, deleteRoomMutation]);

  // Handle form submit
  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();

      if (!builderId || !session?.user?.id) {
        console.error("Missing required data for API call");
        return;
      }

      if (editingRoom) {
        // Update existing room
        updateRoomMutation.mutate({
          builderId: builderId,
          roomMasterId: editingRoom.room_master_id,
          roomLocation: formData.room_location,
          floorLevel: formData.floor_level || null,
          inactive: formData.inactive,
          inactiveBy: formData.inactive ? session.user.id : null,
          modifiedBy: session.user.id,
        });
      } else {
        // Create new room
        createRoomMutation.mutate({
          builderId: builderId,
          regionId: formData.region_id,
          roomLocation: formData.room_location,
          floorLevel: formData.floor_level || null,
          inactive: formData.inactive,
          createdBy: session.user.id,
        });
      }
    },
    [
      formData,
      editingRoom,
      builderId,
      session?.user?.id,
      createRoomMutation,
      updateRoomMutation,
    ]
  );

  // Handle form input changes
  const handleInputChange = useCallback(
    (field: string, value: string | boolean) => {
      setFormData((prev) => ({ ...prev, [field]: value }));
    },
    []
  );

  // Handle inline cell editing
  const handleCellValueChanged = useCallback(
    async (event: CellValueChangedEvent) => {
      if (!builderId || !session?.user?.id) return;

      const room = event.data as RoomMasterWithRegion;
      const field = event.colDef.field;
      const newValue = event.newValue;

      if (field === "room_location" || field === "floor_level") {
        try {
          await updateRoomMutation.mutateAsync({
            builderId: builderId,
            roomMasterId: room.room_master_id,
            [field === "room_location" ? "roomLocation" : "floorLevel"]:
              newValue,
            modifiedBy: session.user.id,
          });
        } catch (error) {
          console.error("Error updating room:", error);
          // Revert the change by refreshing the data
          await utils.roomMaster.getAll.invalidate();
        }
      }
    },
    [builderId, session?.user?.id, updateRoomMutation, utils]
  );

  // Handle import from DataGrid
  const handleImport = useCallback(
    async (importData: any[]) => {
      if (!builderId || !session?.user?.id) return;

      for (const row of importData) {
        // Find region by code
        const region = regions.find((r) => r.region_code === row.region_code);
        if (!region) {
          console.error(`Region not found for code: ${row.region_code}`);
          continue;
        }

        await createRoomMutation.mutateAsync({
          builderId: builderId,
          regionId: region.region_id,
          roomLocation: row.room_location,
          floorLevel: row.floor_level || null,
          inactive: row.inactive === "true" || row.inactive === true,
          createdBy: session.user.id,
        });
      }

      // Refresh data
      utils.roomMaster.getAll.invalidate();
    },
    [builderId, session?.user?.id, regions, createRoomMutation, utils]
  );

  // AG Grid column definitions
  const columnDefs: ColDef[] = useMemo(
    () => [
      {
        headerName: "Room Location",
        field: "room_location",
        sortable: true,
        filter: true,
        flex: 2,
        minWidth: 200,
        editable: true,
      },
      {
        headerName: "Region",
        field: "region_name",
        sortable: true,
        filter: true,
        flex: 1.5,
        minWidth: 150,
        valueGetter: (params) => {
          return `${params.data.region_code} - ${params.data.region_name}`;
        },
      },
      {
        headerName: "Floor Level",
        field: "floor_level",
        sortable: true,
        filter: true,
        flex: 1,
        minWidth: 120,
        editable: true,
      },
      {
        headerName: "Status",
        field: "inactive",
        sortable: true,
        filter: true,
        flex: 0.8,
        minWidth: 100,
        cellRenderer: StatusCellRenderer,
      },
      {
        headerName: "Created Date",
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
          onEdit: handleEditRoom,
          onDelete: handleDeleteRoom,
        },
      },
    ],
    [handleEditRoom, handleDeleteRoom, formatDate]
  );

  // Show loading while checking authentication
  if (status === "loading") {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground text-lg">
            Loading room master...
          </p>
        </div>
      </div>
    );
  }

  // Show loading while fetching room data
  if (builderId && isLoading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold">Room Master</h1>
            <p className="text-muted-foreground">Manage master list of rooms</p>
          </div>
        </div>
        <Card>
          <CardHeader>
            <CardTitle>Rooms</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-center h-64">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                <p className="text-muted-foreground">Loading rooms data...</p>
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
              <Home className="h-8 w-8" />
              Room Master
            </h1>
            <p className="text-muted-foreground">
              Manage master list of rooms for floor plans and elevations
            </p>
          </div>
          <Button
            onClick={handleCreateRoom}
            className="flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            Add New Room
          </Button>
        </div>

        {/* Filters */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="flex-1">
                <Label htmlFor="region-filter">Filter by Region</Label>
                <Select
                  value={selectedRegion || "all"}
                  onValueChange={(value) =>
                    setSelectedRegion(value === "all" ? "" : value)
                  }
                >
                  <SelectTrigger id="region-filter">
                    <SelectValue placeholder="All regions" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All regions</SelectItem>
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
              <div className="flex items-center space-x-2 pt-6">
                <Checkbox
                  id="include-inactive"
                  checked={includeInactive}
                  onCheckedChange={(checked) =>
                    setIncludeInactive(checked as boolean)
                  }
                />
                <Label htmlFor="include-inactive">Include inactive rooms</Label>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Room List</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="text-sm text-muted-foreground">
                Double-click room location or floor level to edit inline.
              </div>
              <DataGrid
                data={rooms}
                loading={isLoading}
                columnDefs={columnDefs}
                excelColumns={excelColumns}
                onImport={handleImport}
                fileName="room-master"
                importTitle="Import Rooms"
                enableEditing={true}
                onCellValueChanged={handleCellValueChanged}
              />
            </div>
          </CardContent>
        </Card>

        {/* Room Modal */}
        <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
          <DialogContent
            className="sm:max-w-[500px]"
            aria-describedby="room-dialog-description"
          >
            <DialogHeader>
              <DialogTitle>
                {editingRoom ? "Edit Room" : "Create New Room"}
              </DialogTitle>
              <p id="room-dialog-description" className="sr-only">
                {editingRoom
                  ? "Edit existing room details"
                  : "Create a new room in the master list"}
              </p>
            </DialogHeader>
            <form onSubmit={handleSubmit}>
              <div className="grid gap-4 py-4">
                {!editingRoom && (
                  <div className="space-y-2">
                    <Label htmlFor="region_id">Region *</Label>
                    <Select
                      value={formData.region_id}
                      onValueChange={(value) =>
                        handleInputChange("region_id", value)
                      }
                      required
                    >
                      <SelectTrigger id="region_id">
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
                <div className="space-y-2">
                  <Label htmlFor="room_location">Room Location *</Label>
                  <Input
                    id="room_location"
                    value={formData.room_location}
                    onChange={(e) =>
                      handleInputChange("room_location", e.target.value)
                    }
                    placeholder="e.g., Master Bedroom, Kitchen"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="floor_level">Floor Level</Label>
                  <Input
                    id="floor_level"
                    value={formData.floor_level}
                    onChange={(e) =>
                      handleInputChange("floor_level", e.target.value)
                    }
                    placeholder="e.g., Main, Upper, Lower"
                  />
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="inactive"
                    checked={formData.inactive}
                    onCheckedChange={(checked) =>
                      handleInputChange("inactive", checked as boolean)
                    }
                  />
                  <Label htmlFor="inactive">Inactive</Label>
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
                    createRoomMutation.isPending || updateRoomMutation.isPending
                  }
                >
                  {createRoomMutation.isPending || updateRoomMutation.isPending
                    ? editingRoom
                      ? "Updating..."
                      : "Creating..."
                    : editingRoom
                    ? "Update Room"
                    : "Create Room"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation Dialog */}
        <Dialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
          <DialogContent
            className="sm:max-w-[425px]"
            aria-describedby="delete-dialog-description"
          >
            <DialogHeader>
              <DialogTitle>Delete Room</DialogTitle>
              <p id="delete-dialog-description" className="sr-only">
                Confirm deletion of room from master list
              </p>
            </DialogHeader>
            <div className="py-4">
              <p className="text-muted-foreground">
                Are you sure you want to delete room &ldquo;
                {roomToDelete?.room_location}&rdquo;?
              </p>
              <p className="text-muted-foreground text-sm mt-2">
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
                onClick={confirmDeleteRoom}
                disabled={deleteRoomMutation.isPending}
              >
                {deleteRoomMutation.isPending ? "Deleting..." : "Delete Room"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
