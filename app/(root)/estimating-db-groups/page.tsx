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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "../../../components/ui/dialog";
import { Input } from "../../../components/ui/input";
import { Label } from "../../../components/ui/label";
import { Checkbox } from "../../../components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../../components/ui/select";
import { Plus, Edit, Trash2, Package } from "lucide-react";
import { api } from "../../providers";
import type { EstimatingDBGroup } from "../../../types/database";

// Custom cell renderer for actions
const ActionsCellRenderer = ({
  data,
  onEdit,
  onDelete,
}: {
  data: EstimatingDBGroup;
  onEdit: (group: EstimatingDBGroup) => void;
  onDelete: (group: EstimatingDBGroup) => void;
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

export default function EstimatingDBGroupsPage() {
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
  const [editingGroup, setEditingGroup] = useState<EstimatingDBGroup | null>(
    null
  );
  const [formData, setFormData] = useState({
    region_id: "",
    estimating_db_group: "",
    description: "",
    is_parent_group: false,
    parent_code: "",
    parent_description: "",
  });

  // Delete confirmation state
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [groupToDelete, setGroupToDelete] = useState<EstimatingDBGroup | null>(
    null
  );

  // Get tRPC utils for cache invalidation
  const utils = api.useUtils();

  // Fetch groups data
  const { data: groups = [], isLoading } =
    api.estimatingDBGroups.getAll.useQuery(
      { builderId: builderId! },
      { enabled: !!builderId }
    );

  // Fetch regions for selection
  const { data: regions = [] } = api.regions.getAll.useQuery(
    { builderId: builderId! },
    { enabled: !!builderId }
  );

  // Create group mutation
  const createGroupMutation = api.estimatingDBGroups.create.useMutation({
    onSuccess: () => {
      utils.estimatingDBGroups.getAll.invalidate();
      setIsModalOpen(false);
      resetForm();
    },
    onError: (error) => {
      console.error("Failed to create group:", error);
    },
  });

  // Update group mutation
  const updateGroupMutation = api.estimatingDBGroups.update.useMutation({
    onSuccess: () => {
      utils.estimatingDBGroups.getAll.invalidate();
      setIsModalOpen(false);
      setEditingGroup(null);
    },
    onError: (error) => {
      console.error("Failed to update group:", error);
    },
  });

  // Delete group mutation
  const deleteGroupMutation = api.estimatingDBGroups.delete.useMutation({
    onSuccess: () => {
      utils.estimatingDBGroups.getAll.invalidate();
      setDeleteConfirmOpen(false);
      setGroupToDelete(null);
    },
    onError: (error) => {
      console.error("Failed to delete group:", error);
    },
  });

  // Bulk import mutation
  const bulkImportMutation = api.estimatingDBGroups.bulkImport.useMutation({
    onSuccess: () => {
      utils.estimatingDBGroups.getAll.invalidate();
    },
    onError: (error) => {
      console.error("Failed to bulk import groups:", error);
    },
  });

  // Reset form
  const resetForm = useCallback(() => {
    setFormData({
      region_id: "",
      estimating_db_group: "",
      description: "",
      is_parent_group: false,
      parent_code: "",
      parent_description: "",
    });
  }, []);

  // Handle create new group
  const handleCreateGroup = useCallback(() => {
    setEditingGroup(null);
    resetForm();
    setIsModalOpen(true);
  }, [resetForm]);

  // Handle edit group
  const handleEditGroup = useCallback((group: EstimatingDBGroup) => {
    setEditingGroup(group);
    setFormData({
      region_id: group.region_id || "",
      estimating_db_group: group.estimating_db_group || "",
      description: group.description || "",
      is_parent_group: group.is_parent_group || false,
      parent_code: group.parent_code || "",
      parent_description: group.parent_description || "",
    });
    setIsModalOpen(true);
  }, []);

  // Handle delete group
  const handleDeleteGroup = useCallback((group: EstimatingDBGroup) => {
    setGroupToDelete(group);
    setDeleteConfirmOpen(true);
  }, []);

  // Confirm delete group
  const confirmDeleteGroup = useCallback(() => {
    if (!groupToDelete || !builderId) return;

    deleteGroupMutation.mutate({
      builderId: builderId,
      id: groupToDelete.estimating_db_group_id,
    });
  }, [groupToDelete, builderId, deleteGroupMutation]);

  // Handle form submit
  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();

      if (!builderId) {
        console.error("Missing builder ID");
        return;
      }

      if (!formData.region_id) {
        alert("Please select a region");
        return;
      }

      if (!formData.estimating_db_group.trim()) {
        alert("Please enter a group code");
        return;
      }

      if (editingGroup) {
        updateGroupMutation.mutate({
          builderId: builderId,
          id: editingGroup.estimating_db_group_id,
          estimatingDbGroup: formData.estimating_db_group,
          description: formData.description,
          isParentGroup: formData.is_parent_group,
          parentCode: formData.parent_code,
          parentDescription: formData.parent_description,
        });
      } else {
        createGroupMutation.mutate({
          builderId: builderId,
          regionId: formData.region_id,
          estimatingDbGroup: formData.estimating_db_group,
          description: formData.description,
          isParentGroup: formData.is_parent_group,
          parentCode: formData.parent_code,
          parentDescription: formData.parent_description,
        });
      }
    },
    [
      formData,
      editingGroup,
      builderId,
      createGroupMutation,
      updateGroupMutation,
    ]
  );

  // Handle form input changes
  const handleInputChange = useCallback(
    (field: string, value: string | boolean) => {
      setFormData((prev) => ({ ...prev, [field]: value }));
    },
    []
  );

  // Handle parent group selection
  const handleParentGroupChange = useCallback(
    (parentGroupId: string) => {
      if (parentGroupId === "none") {
        // No parent group selected
        setFormData((prev) => ({
          ...prev,
          parent_code: "",
          parent_description: "",
        }));
      } else {
        const selectedGroup = groups.find(
          (g) => g.estimating_db_group_id.toString() === parentGroupId
        );
        if (selectedGroup) {
          setFormData((prev) => ({
            ...prev,
            parent_code: selectedGroup.estimating_db_group || "",
            parent_description: selectedGroup.description || "",
          }));
        }
      }
    },
    [groups]
  );

  // Excel columns configuration for import/export
  const excelColumns: ExcelColumn[] = [
    { field: "estimating_db_group", header: "Group Code *", required: true },
    { field: "description", header: "Description" },
    { field: "is_parent_group", header: "Is Parent Group" },
    { field: "parent_code", header: "Parent Code" },
    { field: "parent_description", header: "Parent Description" },
  ];

  // Handle import from DataGrid
  const handleImport = useCallback(
    async (importData: any[]) => {
      if (!builderId || !session?.user?.defaultRegionId) return;

      const groupsToImport = importData.map((row) => ({
        estimatingDbGroup: row.estimating_db_group,
        description: row.description,
        isParentGroup: !!row.is_parent_group,
        parentCode: row.parent_code,
        parentDescription: row.parent_description,
      }));

      bulkImportMutation.mutate({
        builderId,
        regionId: session.user.defaultRegionId,
        groups: groupsToImport,
      });
    },
    [builderId, session?.user?.defaultRegionId, bulkImportMutation]
  );

  // Sort groups to show hierarchy: parents first, then their children
  const sortedGroups = useMemo(() => {
    if (!groups || groups.length === 0) return [];

    const sorted: any[] = [];
    const processed = new Set();

    // First, add all parent groups
    groups
      .filter((group) => group.is_parent_group)
      .sort((a, b) =>
        a.estimating_db_group.localeCompare(b.estimating_db_group)
      )
      .forEach((parent) => {
        sorted.push({ ...parent, _isParent: true, _level: 0 });
        processed.add(parent.estimating_db_group);

        // Add children of this parent
        groups
          .filter((group) => group.parent_code === parent.estimating_db_group)
          .sort((a, b) =>
            a.estimating_db_group.localeCompare(b.estimating_db_group)
          )
          .forEach((child) => {
            sorted.push({
              ...child,
              _isParent: false,
              _level: 1,
              _parentCode: parent.estimating_db_group,
            });
            processed.add(child.estimating_db_group);
          });
      });

    // Add orphaned groups (no parent or parent not found)
    groups
      .filter((group) => !processed.has(group.estimating_db_group))
      .sort((a, b) =>
        a.estimating_db_group.localeCompare(b.estimating_db_group)
      )
      .forEach((orphan) => {
        sorted.push({ ...orphan, _isParent: false, _level: 0 });
      });

    return sorted;
  }, [groups]);

  // Custom cell renderer for hierarchical display
  const HierarchicalGroupRenderer = ({ data }: { data: any }) => {
    const isParent = data?.is_parent_group;
    const level = data?._level || 0;
    const indentation = level * 20; // 20px per level

    return (
      <div
        className={`flex items-center ${
          isParent ? "font-semibold text-primary" : "text-muted-foreground"
        }`}
        style={{ marginLeft: `${indentation}px` }}
      >
        {isParent && <span className="mr-2 text-blue-600">📁</span>}
        {!isParent && level > 0 && (
          <span className="mr-2 text-gray-500">├─</span>
        )}
        {!isParent && level === 0 && (
          <span className="mr-2 text-orange-500">📄</span>
        )}
        <span className={isParent ? "font-bold" : ""}>
          {data?.estimating_db_group}
        </span>
        {level > 0 && (
          <span className="ml-2 text-xs bg-muted px-2 py-1 rounded">
            child of {data?._parentCode || data?.parent_code}
          </span>
        )}
      </div>
    );
  };

  // Create a child count map for efficient lookup
  const childCountMap = useMemo(() => {
    const countMap = new Map();
    groups.forEach((group) => {
      if (group.parent_code) {
        const currentCount = countMap.get(group.parent_code) || 0;
        countMap.set(group.parent_code, currentCount + 1);
      }
    });
    return countMap;
  }, [groups]);

  // AG Grid column definitions with hierarchy display
  const columnDefs: ColDef[] = useMemo(
    () => [
      {
        headerName: "Group Code",
        field: "estimating_db_group",
        sortable: false, // Disable sorting to maintain hierarchy order
        filter: true,
        flex: 1,
        minWidth: 200,
        cellRenderer: HierarchicalGroupRenderer,
      },
      {
        headerName: "Description",
        field: "description",
        sortable: true,
        filter: true,
        flex: 2,
        minWidth: 200,
        cellRenderer: (params: any) => {
          const isParent = params.data?.is_parent_group;
          const description = params.data?.description || "";
          return (
            <span className={isParent ? "font-medium" : ""}>{description}</span>
          );
        },
      },
      {
        headerName: "Type",
        field: "group_type",
        sortable: true,
        filter: true,
        flex: 1,
        minWidth: 120,
        cellRenderer: (params: any) => {
          const isParent = params.data?.is_parent_group;
          const level = params.data?._level || 0;

          if (isParent) {
            const childCount =
              childCountMap.get(params.data?.estimating_db_group) || 0;
            return (
              <div className="flex items-center gap-2">
                <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs font-medium">
                  Parent ({childCount} children)
                </span>
              </div>
            );
          } else if (level > 0) {
            return (
              <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded text-xs">
                Child
              </span>
            );
          } else {
            return (
              <span className="px-2 py-1 bg-orange-100 text-orange-600 rounded text-xs">
                Standalone
              </span>
            );
          }
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
          onEdit: handleEditGroup,
          onDelete: handleDeleteGroup,
        },
      },
    ],
    [handleEditGroup, handleDeleteGroup, childCountMap]
  );

  // Show loading while checking authentication
  if (status === "loading") {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground text-lg">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <Package className="h-8 w-8" />
            Estimating Database Groups
          </h1>
          <p className="text-muted-foreground">
            Manage estimating database groups for organizing items
          </p>
        </div>
        <Button onClick={handleCreateGroup} className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Add New Group
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Database Groups</CardTitle>
        </CardHeader>
        <CardContent>
          <DataGrid
            data={sortedGroups}
            loading={isLoading}
            columnDefs={columnDefs}
            excelColumns={excelColumns}
            onImport={handleImport}
            fileName="estimating-db-groups"
            importTitle="Import Estimating Database Groups"
          />
        </CardContent>
      </Card>

      {/* Group Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>
              {editingGroup ? "Edit Group" : "Create New Group"}
            </DialogTitle>
            <DialogDescription>
              {editingGroup
                ? "Update estimating database group information"
                : "Create a new estimating database group"}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="region_id" className="text-right">
                  Region *
                </Label>
                <Select
                  value={formData.region_id}
                  onValueChange={(value) =>
                    handleInputChange("region_id", value)
                  }
                >
                  <SelectTrigger className="col-span-3">
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

              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="estimating_db_group" className="text-right">
                  Group Code *
                </Label>
                <Input
                  id="estimating_db_group"
                  value={formData.estimating_db_group}
                  onChange={(e) =>
                    handleInputChange("estimating_db_group", e.target.value)
                  }
                  className="col-span-3"
                  placeholder="Group code"
                  required
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
                  placeholder="Group description"
                />
              </div>

              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="is_parent_group" className="text-right">
                  Parent Group
                </Label>
                <div className="col-span-3 flex items-center space-x-2">
                  <Checkbox
                    id="is_parent_group"
                    checked={formData.is_parent_group}
                    onCheckedChange={(checked) =>
                      handleInputChange("is_parent_group", !!checked)
                    }
                  />
                  <Label htmlFor="is_parent_group" className="text-sm">
                    This is a parent group
                  </Label>
                </div>
              </div>

              {!formData.is_parent_group && (
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="parent_code" className="text-right">
                    Parent Group
                  </Label>
                  <Select
                    value={
                      formData.parent_code
                        ? groups
                            .find(
                              (g) =>
                                g.estimating_db_group === formData.parent_code
                            )
                            ?.estimating_db_group_id.toString() || "none"
                        : "none"
                    }
                    onValueChange={handleParentGroupChange}
                  >
                    <SelectTrigger className="col-span-3">
                      <SelectValue placeholder="Select parent group (optional)" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">No parent group</SelectItem>
                      {groups
                        .filter((g) => g.is_parent_group) // Only show parent groups
                        .map((group) => (
                          <SelectItem
                            key={group.estimating_db_group_id}
                            value={group.estimating_db_group_id.toString()}
                          >
                            {group.estimating_db_group} - {group.description}
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {!formData.is_parent_group && (
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="parent_description" className="text-right">
                    Parent Description
                  </Label>
                  <Input
                    id="parent_description"
                    value={formData.parent_description}
                    className="col-span-3 bg-muted"
                    placeholder={
                      formData.parent_code
                        ? "Auto-filled from parent selection"
                        : "Select a parent group to auto-fill"
                    }
                    disabled
                  />
                </div>
              )}
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
                  createGroupMutation.isPending || updateGroupMutation.isPending
                }
              >
                {createGroupMutation.isPending || updateGroupMutation.isPending
                  ? editingGroup
                    ? "Updating..."
                    : "Creating..."
                  : editingGroup
                  ? "Update Group"
                  : "Create Group"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Delete Group</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete group &ldquo;
              {groupToDelete?.estimating_db_group}&rdquo;? This action cannot be
              undone.
            </DialogDescription>
          </DialogHeader>
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
              onClick={confirmDeleteGroup}
              disabled={deleteGroupMutation.isPending}
            >
              {deleteGroupMutation.isPending ? "Deleting..." : "Delete Group"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
