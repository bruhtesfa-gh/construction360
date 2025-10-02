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
import { Plus, Edit, Trash2, FileSpreadsheet } from "lucide-react";
import { api } from "../../providers";
import type { EstimatingDBItemsPOIndex } from "../../../types/database";

// Custom cell renderer for actions
const ActionsCellRenderer = ({
  data,
  onEdit,
  onDelete,
}: {
  data: EstimatingDBItemsPOIndex;
  onEdit: (index: EstimatingDBItemsPOIndex) => void;
  onDelete: (index: EstimatingDBItemsPOIndex) => void;
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

export default function EstimatingDBItemsPOIndexPage() {
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
  const [editingIndex, setEditingIndex] =
    useState<EstimatingDBItemsPOIndex | null>(null);
  const [formData, setFormData] = useState({
    po_index: "",
    default_percent: "",
    estimating_db_item_id: "",
  });

  // Delete confirmation state
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [indexToDelete, setIndexToDelete] =
    useState<EstimatingDBItemsPOIndex | null>(null);

  // Get tRPC utils for cache invalidation
  const utils = api.useUtils();

  // Fetch PO index data
  const { data: poIndexes = [], isLoading } =
    api.estimatingDBItemsPOIndex.getAll.useQuery(
      { builderId: builderId! },
      { enabled: !!builderId }
    );

  // Fetch items for dropdown
  const { data: items = [] } = api.estimatingDBItems.getAll.useQuery(
    { builderId: builderId! },
    { enabled: !!builderId }
  );

  // Create PO index mutation
  const createPOIndexMutation = api.estimatingDBItemsPOIndex.create.useMutation(
    {
      onSuccess: () => {
        utils.estimatingDBItemsPOIndex.getAll.invalidate();
        setIsModalOpen(false);
        resetForm();
      },
      onError: (error) => {
        console.error("Failed to create PO index:", error);
      },
    }
  );

  // Update PO index mutation
  const updatePOIndexMutation = api.estimatingDBItemsPOIndex.update.useMutation(
    {
      onSuccess: () => {
        utils.estimatingDBItemsPOIndex.getAll.invalidate();
        setIsModalOpen(false);
        setEditingIndex(null);
      },
      onError: (error) => {
        console.error("Failed to update PO index:", error);
      },
    }
  );

  // Delete PO index mutation
  const deletePOIndexMutation = api.estimatingDBItemsPOIndex.delete.useMutation(
    {
      onSuccess: () => {
        utils.estimatingDBItemsPOIndex.getAll.invalidate();
        setDeleteConfirmOpen(false);
        setIndexToDelete(null);
      },
      onError: (error) => {
        console.error("Failed to delete PO index:", error);
      },
    }
  );

  // Bulk import mutation
  const bulkImportMutation =
    api.estimatingDBItemsPOIndex.bulkImport.useMutation({
      onSuccess: () => {
        utils.estimatingDBItemsPOIndex.getAll.invalidate();
      },
      onError: (error) => {
        console.error("Failed to bulk import PO indexes:", error);
      },
    });

  // Reset form
  const resetForm = useCallback(() => {
    setFormData({
      po_index: "",
      default_percent: "",
      estimating_db_item_id: "",
    });
  }, []);

  // Handle create new PO index
  const handleCreatePOIndex = useCallback(() => {
    setEditingIndex(null);
    resetForm();
    setIsModalOpen(true);
  }, [resetForm]);

  // Handle edit PO index
  const handleEditPOIndex = useCallback((poIndex: EstimatingDBItemsPOIndex) => {
    setEditingIndex(poIndex);
    setFormData({
      po_index: poIndex.po_index || "",
      default_percent: poIndex.default_percent?.toString() || "",
      estimating_db_item_id: poIndex.estimating_db_item_id || "",
    });
    setIsModalOpen(true);
  }, []);

  // Handle delete PO index
  const handleDeletePOIndex = useCallback(
    (poIndex: EstimatingDBItemsPOIndex) => {
      setIndexToDelete(poIndex);
      setDeleteConfirmOpen(true);
    },
    []
  );

  // Confirm delete PO index
  const confirmDeletePOIndex = useCallback(() => {
    if (!indexToDelete || !builderId) return;

    deletePOIndexMutation.mutate({
      builderId: builderId,
      id: indexToDelete.items_po_index_id,
    });
  }, [indexToDelete, builderId, deletePOIndexMutation]);

  // Handle form submit
  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();

      if (!builderId || !session?.user?.defaultRegionId) {
        console.error("Missing required data for API call");
        return;
      }

      const submitData = {
        builderId: builderId,
        regionId: session.user.defaultRegionId,
        poIndex: formData.po_index,
        defaultPercent: formData.default_percent
          ? parseFloat(formData.default_percent)
          : undefined,
        estimatingDbItemId: formData.estimating_db_item_id,
      };

      if (editingIndex) {
        updatePOIndexMutation.mutate({
          ...submitData,
          id: editingIndex.items_po_index_id,
        });
      } else {
        createPOIndexMutation.mutate(submitData);
      }
    },
    [
      formData,
      editingIndex,
      builderId,
      session?.user?.defaultRegionId,
      createPOIndexMutation,
      updatePOIndexMutation,
    ]
  );

  // Handle form input changes
  const handleInputChange = useCallback((field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  }, []);

  // Excel columns configuration for import/export
  const excelColumns: ExcelColumn[] = [
    { field: "po_index", header: "PO Index *", required: true },
    { field: "default_percent", header: "Default Percent" },
    { field: "estimating_db_item_id", header: "Item ID *", required: true },
  ];

  // Handle import from DataGrid
  const handleImport = useCallback(
    async (importData: any[]) => {
      if (!builderId || !session?.user?.defaultRegionId) return;

      const itemsToImport = importData.map((row) => ({
        poIndex: row.po_index,
        defaultPercent: row.default_percent
          ? parseFloat(row.default_percent)
          : undefined,
        estimatingDbItemId: row.estimating_db_item_id,
      }));

      bulkImportMutation.mutate({
        builderId,
        regionId: session.user.defaultRegionId,
        items: itemsToImport,
      });
    },
    [builderId, session?.user?.defaultRegionId, bulkImportMutation]
  );

  // Get item description for display
  const getItemDescription = useCallback(
    (itemId: string) => {
      const item = items.find((i) => i.estimating_db_item_id === itemId);
      return item
        ? `${item.estimating_db_item_code} - ${item.item_description || ""}`
        : itemId;
    },
    [items]
  );

  // AG Grid column definitions
  const columnDefs: ColDef[] = useMemo(
    () => [
      {
        headerName: "PO Index",
        field: "po_index",
        sortable: true,
        filter: true,
        flex: 1,
        minWidth: 150,
      },
      {
        headerName: "Default %",
        field: "default_percent",
        sortable: true,
        filter: true,
        flex: 1,
        minWidth: 120,
        cellRenderer: (params: any) =>
          params.value ? `${parseFloat(params.value).toFixed(4)}%` : "",
      },
      {
        headerName: "Item",
        field: "estimating_db_item_id",
        sortable: true,
        filter: true,
        flex: 2,
        minWidth: 250,
        valueFormatter: (params) => getItemDescription(params.value),
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
          onEdit: handleEditPOIndex,
          onDelete: handleDeletePOIndex,
        },
      },
    ],
    [handleEditPOIndex, handleDeletePOIndex, getItemDescription]
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
            <FileSpreadsheet className="h-8 w-8" />
            Estimating DB Items PO Index
          </h1>
          <p className="text-muted-foreground">
            Manage PO index assignments for estimating database items
          </p>
        </div>
        <Button
          onClick={handleCreatePOIndex}
          className="flex items-center gap-2"
        >
          <Plus className="h-4 w-4" />
          Add New PO Index
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>PO Index Assignments</CardTitle>
        </CardHeader>
        <CardContent>
          <DataGrid
            data={poIndexes}
            loading={isLoading}
            columnDefs={columnDefs}
            excelColumns={excelColumns}
            onImport={handleImport}
            fileName="estimating-db-items-po-index"
            importTitle="Import PO Index Assignments"
          />
        </CardContent>
      </Card>

      {/* PO Index Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>
              {editingIndex ? "Edit PO Index" : "Create New PO Index"}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="po_index" className="text-right">
                  PO Index *
                </Label>
                <Input
                  id="po_index"
                  value={formData.po_index}
                  onChange={(e) =>
                    handleInputChange("po_index", e.target.value)
                  }
                  className="col-span-3"
                  placeholder="PO index code"
                  required
                />
              </div>

              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="default_percent" className="text-right">
                  Default %
                </Label>
                <Input
                  id="default_percent"
                  type="number"
                  step="0.0001"
                  value={formData.default_percent}
                  onChange={(e) =>
                    handleInputChange("default_percent", e.target.value)
                  }
                  className="col-span-3"
                  placeholder="0.0000"
                />
              </div>

              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="estimating_db_item_id" className="text-right">
                  Item *
                </Label>
                <Select
                  value={formData.estimating_db_item_id}
                  onValueChange={(value) =>
                    handleInputChange("estimating_db_item_id", value)
                  }
                >
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="Select an item" />
                  </SelectTrigger>
                  <SelectContent>
                    {items.map((item) => (
                      <SelectItem
                        key={item.estimating_db_item_id}
                        value={item.estimating_db_item_id}
                      >
                        {item.estimating_db_item_code} - {item.item_description}
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
                  createPOIndexMutation.isPending ||
                  updatePOIndexMutation.isPending
                }
              >
                {createPOIndexMutation.isPending ||
                updatePOIndexMutation.isPending
                  ? editingIndex
                    ? "Updating..."
                    : "Creating..."
                  : editingIndex
                  ? "Update PO Index"
                  : "Create PO Index"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Delete PO Index</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p className="text-muted-foreground">
              Are you sure you want to delete PO index &ldquo;
              {indexToDelete?.po_index}&rdquo;? This action cannot be undone.
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
              onClick={confirmDeletePOIndex}
              disabled={deletePOIndexMutation.isPending}
            >
              {deletePOIndexMutation.isPending
                ? "Deleting..."
                : "Delete PO Index"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
