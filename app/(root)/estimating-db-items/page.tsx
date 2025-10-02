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
import { Checkbox } from "../../../components/ui/checkbox";
import { Textarea } from "../../../components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../../components/ui/select";
import { Plus, Edit, Trash2, Package2 } from "lucide-react";
import { api } from "../../providers";
import type { EstimatingDBItem } from "../../../types/database";

// Custom cell renderer for actions
const ActionsCellRenderer = ({
  data,
  onEdit,
  onDelete,
}: {
  data: EstimatingDBItem;
  onEdit: (item: EstimatingDBItem) => void;
  onDelete: (item: EstimatingDBItem) => void;
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

export default function EstimatingDBItemsPage() {
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
  const [editingItem, setEditingItem] = useState<EstimatingDBItem | null>(null);
  const [formData, setFormData] = useState({
    estimating_db_group: "",
    estimating_db_item_code: "",
    item_description: "",
    unit_of_measure: "",
    conversion_factor: "",
    child_item_list_id: "",
    inverse_item_id: "",

    // New fields from original SQL Server schema
    internal_notes: "",
    po_index: "",
    jc_cost_code: "",
    jc_cost_type: "",
    order_uom: "",
    takeoff_uom: "",
    cost_amount: "",
    tax_group: "",
    waste_percent: "",
    manufacturer_part_number: "",
    cost_type: "",
    lump_sum_bid: false,
    location: "",
    option_code: "",
    color: "",
    comments: "",
    inactive: false,
  });

  // Delete confirmation state
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<EstimatingDBItem | null>(
    null
  );

  // Bulk operations state
  const [selectedItems, setSelectedItems] = useState<EstimatingDBItem[]>([]);
  const [bulkEditModalOpen, setBulkEditModalOpen] = useState(false);
  const [bulkEditData, setBulkEditData] = useState<any>({});

  // Get tRPC utils for cache invalidation
  const utils = api.useUtils();

  // Fetch items data
  const { data: items = [], isLoading } = api.estimatingDBItems.getAll.useQuery(
    { builderId: builderId! },
    { enabled: !!builderId }
  );

  // Fetch groups for dropdown
  const { data: groups = [] } = api.estimatingDBGroups.getAll.useQuery(
    { builderId: builderId! },
    { enabled: !!builderId }
  );

  // Fetch unit of measures for dropdown
  const { data: unitOfMeasures = [] } = api.unitOfMeasures.getAll.useQuery();

  // Create item mutation
  const createItemMutation = api.estimatingDBItems.create.useMutation({
    onSuccess: () => {
      utils.estimatingDBItems.getAll.invalidate();
      setIsModalOpen(false);
      resetForm();
    },
    onError: (error) => {
      console.error("Failed to create item:", error);
    },
  });

  // Update item mutation
  const updateItemMutation = api.estimatingDBItems.update.useMutation({
    onSuccess: () => {
      utils.estimatingDBItems.getAll.invalidate();
      setIsModalOpen(false);
      setEditingItem(null);
    },
    onError: (error) => {
      console.error("Failed to update item:", error);
    },
  });

  // Delete item mutation
  const deleteItemMutation = api.estimatingDBItems.delete.useMutation({
    onSuccess: () => {
      utils.estimatingDBItems.getAll.invalidate();
      setDeleteConfirmOpen(false);
      setItemToDelete(null);
    },
    onError: (error) => {
      console.error("Failed to delete item:", error);
    },
  });

  // Bulk import mutation
  const bulkImportMutation = api.estimatingDBItems.bulkImport.useMutation({
    onSuccess: () => {
      utils.estimatingDBItems.getAll.invalidate();
    },
    onError: (error) => {
      console.error("Failed to bulk import items:", error);
    },
  });

  // Bulk operations mutations
  const bulkDeleteMutation = api.estimatingDBItems.bulkDelete.useMutation({
    onSuccess: (result) => {
      utils.estimatingDBItems.getAll.invalidate();
      setSelectedItems([]);
      console.log(
        `Bulk delete completed: ${result.deleted}/${result.total} items deleted`
      );
      if (result.errors.length > 0) {
        console.error("Bulk delete errors:", result.errors);
      }
    },
    onError: (error) => {
      console.error("Failed to bulk delete items:", error);
    },
  });

  const bulkEditMutation = api.estimatingDBItems.bulkEdit.useMutation({
    onSuccess: (result) => {
      utils.estimatingDBItems.getAll.invalidate();
      setBulkEditModalOpen(false);
      setSelectedItems([]);
      setBulkEditData({});
      console.log(
        `Bulk edit completed: ${result.updated}/${result.total} items updated`
      );
      if (result.errors.length > 0) {
        console.error("Bulk edit errors:", result.errors);
      }
    },
    onError: (error) => {
      console.error("Failed to bulk edit items:", error);
    },
  });

  // Reset form
  const resetForm = useCallback(() => {
    setFormData({
      estimating_db_group: "",
      estimating_db_item_code: "",
      item_description: "",
      unit_of_measure: "",
      conversion_factor: "",
      child_item_list_id: "",
      inverse_item_id: "",

      // New fields from original SQL Server schema
      internal_notes: "",
      po_index: "",
      jc_cost_code: "",
      jc_cost_type: "",
      order_uom: "",
      takeoff_uom: "",
      cost_amount: "",
      tax_group: "",
      waste_percent: "",
      manufacturer_part_number: "",
      cost_type: "",
      lump_sum_bid: false,
      location: "",
      option_code: "",
      color: "",
      comments: "",
      inactive: false,
    });
  }, []);

  // Handle create new item
  const handleCreateItem = useCallback(() => {
    setEditingItem(null);
    resetForm();
    setIsModalOpen(true);
  }, [resetForm]);

  // Handle edit item
  const handleEditItem = useCallback((item: EstimatingDBItem) => {
    setEditingItem(item);
    setFormData({
      estimating_db_group: item.estimating_db_group || "",
      estimating_db_item_code: item.estimating_db_item_code || "",
      item_description: item.item_description || "",
      unit_of_measure: item.unit_of_measure || "",
      conversion_factor: item.conversion_factor?.toString() || "",
      child_item_list_id: item.child_item_list_id || "",
      inverse_item_id: item.inverse_item_id || "",

      // New fields from original SQL Server schema
      internal_notes: item.internal_notes || "",
      po_index: item.po_index || "",
      jc_cost_code: item.jc_cost_code || "",
      jc_cost_type: item.jc_cost_type || "",
      order_uom: item.order_uom || "",
      takeoff_uom: item.takeoff_uom || "",
      cost_amount: item.cost_amount?.toString() || "",
      tax_group: item.tax_group || "",
      waste_percent: item.waste_percent?.toString() || "",
      manufacturer_part_number: item.manufacturer_part_number || "",
      cost_type: item.cost_type || "",
      lump_sum_bid: item.lump_sum_bid || false,
      location: item.location || "",
      option_code: item.option_code || "",
      color: item.color || "",
      comments: item.comments || "",
      inactive: item.inactive || false,
    });
    setIsModalOpen(true);
  }, []);

  // Handle delete item
  const handleDeleteItem = useCallback((item: EstimatingDBItem) => {
    setItemToDelete(item);
    setDeleteConfirmOpen(true);
  }, []);

  // Confirm delete item
  const confirmDeleteItem = useCallback(() => {
    if (!itemToDelete || !builderId) return;

    deleteItemMutation.mutate({
      builderId: builderId,
      id: itemToDelete.estimating_db_item_id,
    });
  }, [itemToDelete, builderId, deleteItemMutation]);

  // Handle form submit
  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();

      if (!builderId || !session?.user?.defaultRegionId) {
        console.error("Missing required data for API call");
        return;
      }

      const submitData: any = {
        builderId: builderId,
        regionId: session.user.defaultRegionId,
        estimatingDbGroup: formData.estimating_db_group,
        estimatingDbItemCode: formData.estimating_db_item_code,
      };

      // Only include optional fields if they have values
      if (formData.item_description?.trim()) {
        submitData.itemDescription = formData.item_description.trim();
      }
      if (formData.unit_of_measure?.trim()) {
        submitData.unitOfMeasure = formData.unit_of_measure.trim();
      }
      if (formData.conversion_factor && formData.conversion_factor.trim()) {
        submitData.conversionFactor = parseFloat(formData.conversion_factor);
      }
      if (formData.child_item_list_id?.trim()) {
        submitData.childItemListId = formData.child_item_list_id.trim();
      }
      if (formData.inverse_item_id?.trim()) {
        submitData.inverseItemId = formData.inverse_item_id.trim();
      }

      // Add new fields from original SQL Server schema
      if (formData.internal_notes?.trim()) {
        submitData.internalNotes = formData.internal_notes.trim();
      }
      if (formData.po_index?.trim()) {
        submitData.poIndex = formData.po_index.trim();
      }
      if (formData.jc_cost_code?.trim()) {
        submitData.jcCostCode = formData.jc_cost_code.trim();
      }
      if (formData.jc_cost_type?.trim()) {
        submitData.jcCostType = formData.jc_cost_type.trim();
      }
      if (formData.order_uom?.trim()) {
        submitData.orderUom = formData.order_uom.trim();
      }
      if (formData.takeoff_uom?.trim()) {
        submitData.takeoffUom = formData.takeoff_uom.trim();
      }
      if (formData.cost_amount && formData.cost_amount.trim()) {
        submitData.costAmount = parseFloat(formData.cost_amount);
      }
      if (formData.tax_group?.trim()) {
        submitData.taxGroup = formData.tax_group.trim();
      }
      if (formData.waste_percent && formData.waste_percent.trim()) {
        submitData.wastePercent = parseFloat(formData.waste_percent);
      }
      if (formData.manufacturer_part_number?.trim()) {
        submitData.manufacturerPartNumber =
          formData.manufacturer_part_number.trim();
      }
      if (formData.cost_type?.trim()) {
        submitData.costType = formData.cost_type.trim();
      }
      if (formData.location?.trim()) {
        submitData.location = formData.location.trim();
      }
      if (formData.option_code?.trim()) {
        submitData.optionCode = formData.option_code.trim();
      }
      if (formData.color?.trim()) {
        submitData.color = formData.color.trim();
      }
      if (formData.comments?.trim()) {
        submitData.comments = formData.comments.trim();
      }

      // Boolean fields
      submitData.lumpSumBid = formData.lump_sum_bid;
      submitData.inactive = formData.inactive;

      if (editingItem) {
        updateItemMutation.mutate({
          ...submitData,
          id: editingItem.estimating_db_item_id,
        });
      } else {
        createItemMutation.mutate(submitData);
      }
    },
    [
      formData,
      editingItem,
      builderId,
      session?.user?.defaultRegionId,
      createItemMutation,
      updateItemMutation,
    ]
  );

  // Handle form input changes
  const handleInputChange = useCallback(
    (field: string, value: string | boolean | number) => {
      setFormData((prev) => ({ ...prev, [field]: value }));
    },
    []
  );

  // Excel columns configuration for import/export
  const excelColumns: ExcelColumn[] = [
    { field: "estimating_db_group", header: "Group Code *", required: true },
    { field: "estimating_db_item_code", header: "Item Code *", required: true },
    { field: "item_description", header: "Description" },
    { field: "po_index", header: "PO Index" },
    { field: "jc_cost_code", header: "JC Cost Code" },
    { field: "jc_cost_type", header: "JC Cost Type" },
    { field: "cost_type", header: "Cost Type" },
    { field: "cost_amount", header: "Cost Amount" },
    { field: "unit_of_measure", header: "Unit of Measure" },
    { field: "tax_group", header: "Tax Group" },
    { field: "waste_percent", header: "Waste Percent" },
    { field: "manufacturer_part_number", header: "Manufacturer Part Number" },
    { field: "location", header: "Location" },
    { field: "option_code", header: "Option Code" },
    { field: "color", header: "Color" },
    { field: "conversion_factor", header: "Conversion Factor" },
    { field: "internal_notes", header: "Internal Notes" },
    { field: "comments", header: "Comments" },
    { field: "lump_sum_bid", header: "Lump Sum Bid" },
    { field: "inactive", header: "Inactive" },
  ];

  // Handle import from DataGrid
  const handleImport = useCallback(
    async (importData: any[]) => {
      if (!builderId || !session?.user?.defaultRegionId) return;

      const itemsToImport = importData.map((row) => ({
        estimatingDbGroup: row.estimating_db_group,
        estimatingDbItemCode: row.estimating_db_item_code,
        itemDescription: row.item_description,
        unitOfMeasure: row.unit_of_measure,
        conversionFactor: row.conversion_factor
          ? parseFloat(row.conversion_factor)
          : undefined,
      }));

      bulkImportMutation.mutate({
        builderId,
        regionId: session.user.defaultRegionId,
        items: itemsToImport,
      });
    },
    [builderId, session?.user?.defaultRegionId, bulkImportMutation]
  );

  // Selection change handler
  const handleSelectionChanged = useCallback(
    (selectedRows: EstimatingDBItem[]) => {
      setSelectedItems(selectedRows);
    },
    []
  );

  // Bulk delete handler
  const handleBulkDelete = useCallback(async () => {
    if (!builderId || selectedItems.length === 0) return;

    if (
      confirm(
        `Are you sure you want to delete ${selectedItems.length} selected items?`
      )
    ) {
      try {
        await bulkDeleteMutation.mutateAsync({
          builderId,
          itemIds: selectedItems.map((item) => item.estimating_db_item_id),
        });
      } catch (error) {
        console.error("Error bulk deleting items:", error);
      }
    }
  }, [builderId, selectedItems, bulkDeleteMutation]);

  // Bulk edit handlers
  const handleBulkEdit = useCallback(() => {
    if (selectedItems.length === 0) return;
    setBulkEditModalOpen(true);
  }, [selectedItems]);

  const handleBulkEditInputChange = useCallback((field: string, value: any) => {
    setBulkEditData((prev: any) => ({ ...prev, [field]: value }));
  }, []);

  const handleBulkEditSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      if (!builderId || selectedItems.length === 0) return;

      try {
        const updates = selectedItems.map((item) => ({
          id: item.estimating_db_item_id,
          ...bulkEditData,
        }));

        await bulkEditMutation.mutateAsync({
          builderId,
          updates,
        });
      } catch (error) {
        console.error("Error bulk editing items:", error);
      }
    },
    [builderId, selectedItems, bulkEditData, bulkEditMutation]
  );

  // AG Grid column definitions
  const columnDefs: ColDef[] = useMemo(
    () => [
      {
        headerName: "Group",
        field: "estimating_db_group",
        sortable: true,
        filter: true,
        flex: 1,
        minWidth: 120,
      },
      {
        headerName: "Item Code",
        field: "estimating_db_item_code",
        sortable: true,
        filter: true,
        flex: 1,
        minWidth: 150,
      },
      {
        headerName: "Description",
        field: "item_description",
        sortable: true,
        filter: true,
        flex: 2,
        minWidth: 200,
      },
      {
        headerName: "PO Index",
        field: "po_index",
        sortable: true,
        filter: true,
        flex: 1,
        minWidth: 120,
      },
      {
        headerName: "JC Code",
        field: "jc_cost_code",
        sortable: true,
        filter: true,
        flex: 1,
        minWidth: 100,
      },
      {
        headerName: "Cost Type",
        field: "cost_type",
        sortable: true,
        filter: true,
        flex: 1,
        minWidth: 100,
      },
      {
        headerName: "Cost Amount",
        field: "cost_amount",
        sortable: true,
        filter: true,
        flex: 1,
        minWidth: 120,
        cellRenderer: (params: any) =>
          params.value ? `$${parseFloat(params.value).toFixed(2)}` : "",
      },
      {
        headerName: "UOM",
        field: "unit_of_measure",
        sortable: true,
        filter: true,
        flex: 1,
        minWidth: 100,
      },
      {
        headerName: "Tax Group",
        field: "tax_group",
        sortable: true,
        filter: true,
        flex: 1,
        minWidth: 100,
      },
      {
        headerName: "Waste %",
        field: "waste_percent",
        sortable: true,
        filter: true,
        flex: 1,
        minWidth: 100,
        cellRenderer: (params: any) =>
          params.value ? `${parseFloat(params.value).toFixed(2)}%` : "",
      },
      {
        headerName: "Part Number",
        field: "manufacturer_part_number",
        sortable: true,
        filter: true,
        flex: 1,
        minWidth: 150,
      },
      {
        headerName: "Location",
        field: "location",
        sortable: true,
        filter: true,
        flex: 1,
        minWidth: 120,
      },
      {
        headerName: "Active",
        field: "is_active",
        sortable: true,
        filter: true,
        flex: 1,
        minWidth: 80,
        cellRenderer: (params: any) => (params.value !== false ? "✓" : "✗"),
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
          onEdit: handleEditItem,
          onDelete: handleDeleteItem,
        },
      },
    ],
    [handleEditItem, handleDeleteItem]
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
            <Package2 className="h-8 w-8" />
            Estimating Database Items
          </h1>
          <p className="text-muted-foreground">
            Manage estimating database items for cost calculations
          </p>
        </div>
        <Button onClick={handleCreateItem} className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Add New Item
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Database Items</CardTitle>
        </CardHeader>
        <CardContent>
          {/* Bulk Actions */}
          {selectedItems.length > 0 && (
            <div className="flex items-center gap-2 mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <span className="text-sm font-medium">
                {selectedItems.length} item{selectedItems.length > 1 ? "s" : ""}{" "}
                selected
              </span>
              <div className="flex gap-2 ml-auto">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleBulkEdit}
                  disabled={bulkEditMutation.isPending}
                >
                  <Edit className="h-4 w-4 mr-1" />
                  Bulk Edit
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleBulkDelete}
                  disabled={bulkDeleteMutation.isPending}
                  className="text-red-600 hover:text-red-700"
                >
                  <Trash2 className="h-4 w-4 mr-1" />
                  Bulk Delete
                </Button>
              </div>
            </div>
          )}
          <DataGrid
            data={items}
            loading={isLoading}
            columnDefs={columnDefs}
            excelColumns={excelColumns}
            onImport={handleImport}
            onSelectionChanged={handleSelectionChanged}
            fileName="estimating-db-items"
            importTitle="Import Estimating Database Items"
          />
        </CardContent>
      </Card>

      {/* Item Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-[1200px] max-h-[95vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingItem ? "Edit Item" : "Create New Item"}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="grid gap-6 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="estimating_db_group" className="text-right">
                  Group *
                </Label>
                <Select
                  value={formData.estimating_db_group}
                  onValueChange={(value) =>
                    handleInputChange("estimating_db_group", value)
                  }
                >
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="Select a group" />
                  </SelectTrigger>
                  <SelectContent>
                    {groups
                      .filter((group) => !group.is_parent_group) // Only show non-parent groups
                      .sort((a, b) => {
                        // Sort by parent description first, then by group code
                        const parentCompare = (
                          a.parent_description || ""
                        ).localeCompare(b.parent_description || "");
                        if (parentCompare !== 0) return parentCompare;
                        return a.estimating_db_group.localeCompare(
                          b.estimating_db_group
                        );
                      })
                      .map((group) => (
                        <SelectItem
                          key={group.estimating_db_group}
                          value={group.estimating_db_group}
                        >
                          {group.parent_description ? (
                            <div className="flex flex-col">
                              <span className="text-xs text-muted-foreground">
                                {group.parent_description}
                              </span>
                              <span>
                                {group.estimating_db_group} -{" "}
                                {group.description}
                              </span>
                            </div>
                          ) : (
                            <span>
                              {group.estimating_db_group} - {group.description}
                            </span>
                          )}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="estimating_db_item_code" className="text-right">
                  Item Code *
                </Label>
                <Input
                  id="estimating_db_item_code"
                  value={formData.estimating_db_item_code}
                  onChange={(e) =>
                    handleInputChange("estimating_db_item_code", e.target.value)
                  }
                  className="col-span-3"
                  placeholder="Item code"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4 col-span-4">
                <div>
                  <Label
                    htmlFor="item_description"
                    className="text-sm font-medium"
                  >
                    Description
                  </Label>
                  <Textarea
                    id="item_description"
                    value={formData.item_description}
                    onChange={(e) =>
                      handleInputChange("item_description", e.target.value)
                    }
                    className="mt-1"
                    placeholder="Item description"
                  />
                </div>
                <div>
                  <Label
                    htmlFor="unit_of_measure"
                    className="text-sm font-medium"
                  >
                    Unit of Measure
                  </Label>
                  <Select
                    value={formData.unit_of_measure}
                    onValueChange={(value) =>
                      handleInputChange("unit_of_measure", value)
                    }
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Select unit of measure" />
                    </SelectTrigger>
                    <SelectContent>
                      {unitOfMeasures.map((uom) => (
                        <SelectItem
                          key={uom.unit_of_measure}
                          value={uom.unit_of_measure}
                        >
                          {uom.abbreviation} - {uom.description}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="conversion_factor" className="text-right">
                  Conversion Factor
                </Label>
                <Input
                  id="conversion_factor"
                  type="number"
                  step="0.001"
                  value={formData.conversion_factor}
                  onChange={(e) =>
                    handleInputChange("conversion_factor", e.target.value)
                  }
                  className="col-span-3"
                  placeholder="1.000"
                />
              </div>

              {/* Cost and Pricing Information */}
              <div className="col-span-4 border-t pt-4">
                <h3 className="text-lg font-semibold mb-4">
                  Cost & Pricing Information
                </h3>
              </div>

              <div className="grid grid-cols-2 gap-4 col-span-4">
                <div>
                  <Label htmlFor="cost_amount" className="text-sm font-medium">
                    Cost Amount
                  </Label>
                  <Input
                    id="cost_amount"
                    type="number"
                    step="0.01"
                    value={formData.cost_amount}
                    onChange={(e) =>
                      handleInputChange("cost_amount", e.target.value)
                    }
                    className="mt-1"
                    placeholder="0.00"
                  />
                </div>
                <div>
                  <Label htmlFor="cost_type" className="text-sm font-medium">
                    Cost Type
                  </Label>
                  <Select
                    value={formData.cost_type}
                    onValueChange={(value) =>
                      handleInputChange("cost_type", value)
                    }
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Select cost type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="M">M - Material</SelectItem>
                      <SelectItem value="L">L - Labor</SelectItem>
                      <SelectItem value="E">E - Equipment</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 col-span-4">
                <div>
                  <Label htmlFor="tax_group" className="text-sm font-medium">
                    Tax Group
                  </Label>
                  <Input
                    id="tax_group"
                    value={formData.tax_group}
                    onChange={(e) =>
                      handleInputChange("tax_group", e.target.value)
                    }
                    className="mt-1"
                    placeholder="Tax group"
                  />
                </div>
                <div>
                  <Label
                    htmlFor="waste_percent"
                    className="text-sm font-medium"
                  >
                    Waste Percent
                  </Label>
                  <Input
                    id="waste_percent"
                    type="number"
                    step="0.01"
                    value={formData.waste_percent}
                    onChange={(e) =>
                      handleInputChange("waste_percent", e.target.value)
                    }
                    className="mt-1"
                    placeholder="0.00"
                  />
                </div>
              </div>

              {/* Additional Details */}
              <div className="col-span-4 border-t pt-4">
                <h3 className="text-lg font-semibold mb-4">
                  Additional Details
                </h3>
              </div>

              <div className="grid grid-cols-2 gap-4 col-span-4">
                <div>
                  <Label
                    htmlFor="manufacturer_part_number"
                    className="text-sm font-medium"
                  >
                    Manufacturer Part #
                  </Label>
                  <Input
                    id="manufacturer_part_number"
                    value={formData.manufacturer_part_number}
                    onChange={(e) =>
                      handleInputChange(
                        "manufacturer_part_number",
                        e.target.value
                      )
                    }
                    className="mt-1"
                    placeholder="Part number"
                  />
                </div>
                <div>
                  <Label htmlFor="location" className="text-sm font-medium">
                    Location
                  </Label>
                  <Input
                    id="location"
                    value={formData.location}
                    onChange={(e) =>
                      handleInputChange("location", e.target.value)
                    }
                    className="mt-1"
                    placeholder="Item location"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 col-span-4">
                <div>
                  <Label htmlFor="comments" className="text-sm font-medium">
                    Item Notes
                  </Label>
                  <Textarea
                    id="comments"
                    value={formData.comments}
                    onChange={(e) =>
                      handleInputChange("comments", e.target.value)
                    }
                    className="mt-1"
                    placeholder="Item notes"
                    rows={3}
                  />
                </div>
              </div>

              <div className="col-span-4 border-t pt-4">
                <h3 className="text-lg font-semibold mb-4">Item Settings</h3>
              </div>

              <div className="grid grid-cols-2 gap-4 col-span-4">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="lump_sum_bid"
                    checked={formData.lump_sum_bid}
                    onCheckedChange={(checked) =>
                      handleInputChange("lump_sum_bid", !!checked)
                    }
                  />
                  <Label htmlFor="lump_sum_bid" className="text-sm font-medium">
                    Bid
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="inactive"
                    checked={formData.inactive}
                    onCheckedChange={(checked) =>
                      handleInputChange("inactive", !!checked)
                    }
                  />
                  <Label htmlFor="inactive" className="text-sm font-medium">
                    Inactive
                  </Label>
                </div>
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
                  createItemMutation.isPending || updateItemMutation.isPending
                }
              >
                {createItemMutation.isPending || updateItemMutation.isPending
                  ? editingItem
                    ? "Updating..."
                    : "Creating..."
                  : editingItem
                  ? "Update Item"
                  : "Create Item"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Delete Item</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p className="text-muted-foreground">
              Are you sure you want to delete item &ldquo;
              {itemToDelete?.estimating_db_item_code}&rdquo;? This action cannot
              be undone.
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
              onClick={confirmDeleteItem}
              disabled={deleteItemMutation.isPending}
            >
              {deleteItemMutation.isPending ? "Deleting..." : "Delete Item"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Bulk Edit Modal */}
      <Dialog open={bulkEditModalOpen} onOpenChange={setBulkEditModalOpen}>
        <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              Bulk Edit {selectedItems.length} Item
              {selectedItems.length > 1 ? "s" : ""}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleBulkEditSubmit}>
            <div className="grid gap-4 py-4">
              <p className="text-sm text-muted-foreground">
                Only fields you fill in will be updated across all selected
                items.
              </p>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Cost Amount</Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={bulkEditData.costAmount || ""}
                    onChange={(e) =>
                      handleBulkEditInputChange(
                        "costAmount",
                        e.target.value ? parseFloat(e.target.value) : undefined
                      )
                    }
                    placeholder="Leave empty to keep existing values"
                  />
                </div>
                <div>
                  <Label>Cost Type</Label>
                  <Select
                    value={bulkEditData.costType || ""}
                    onValueChange={(value) =>
                      handleBulkEditInputChange("costType", value || undefined)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Leave empty to keep existing values" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">Keep existing values</SelectItem>
                      <SelectItem value="M">M - Material</SelectItem>
                      <SelectItem value="L">L - Labor</SelectItem>
                      <SelectItem value="E">E - Equipment</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>JC Cost Code</Label>
                  <Input
                    value={bulkEditData.jcCostCode || ""}
                    onChange={(e) =>
                      handleBulkEditInputChange(
                        "jcCostCode",
                        e.target.value || undefined
                      )
                    }
                    placeholder="Leave empty to keep existing values"
                  />
                </div>
                <div>
                  <Label>JC Cost Type</Label>
                  <Select
                    value={bulkEditData.jcCostType || ""}
                    onValueChange={(value) =>
                      handleBulkEditInputChange(
                        "jcCostType",
                        value || undefined
                      )
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Leave empty to keep existing values" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">Keep existing values</SelectItem>
                      <SelectItem value="MAT">MAT - Material</SelectItem>
                      <SelectItem value="LAB">LAB - Labor</SelectItem>
                      <SelectItem value="EQP">EQP - Equipment</SelectItem>
                      <SelectItem value="SUB">SUB - Subcontractor</SelectItem>
                      <SelectItem value="OTH">OTH - Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>PO Index</Label>
                  <Input
                    value={bulkEditData.poIndex || ""}
                    onChange={(e) =>
                      handleBulkEditInputChange(
                        "poIndex",
                        e.target.value || undefined
                      )
                    }
                    placeholder="Leave empty to keep existing values"
                  />
                </div>
                <div>
                  <Label>Tax Group</Label>
                  <Input
                    value={bulkEditData.taxGroup || ""}
                    onChange={(e) =>
                      handleBulkEditInputChange(
                        "taxGroup",
                        e.target.value || undefined
                      )
                    }
                    placeholder="Leave empty to keep existing values"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Waste Percent</Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={bulkEditData.wastePercent || ""}
                    onChange={(e) =>
                      handleBulkEditInputChange(
                        "wastePercent",
                        e.target.value ? parseFloat(e.target.value) : undefined
                      )
                    }
                    placeholder="Leave empty to keep existing values"
                  />
                </div>
                <div>
                  <Label>Location</Label>
                  <Input
                    value={bulkEditData.location || ""}
                    onChange={(e) =>
                      handleBulkEditInputChange(
                        "location",
                        e.target.value || undefined
                      )
                    }
                    placeholder="Leave empty to keep existing values"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Option Code</Label>
                  <Input
                    value={bulkEditData.optionCode || ""}
                    onChange={(e) =>
                      handleBulkEditInputChange(
                        "optionCode",
                        e.target.value || undefined
                      )
                    }
                    placeholder="Leave empty to keep existing values"
                  />
                </div>
                <div>
                  <Label>Color</Label>
                  <Input
                    value={bulkEditData.color || ""}
                    onChange={(e) =>
                      handleBulkEditInputChange(
                        "color",
                        e.target.value || undefined
                      )
                    }
                    placeholder="Leave empty to keep existing values"
                  />
                </div>
              </div>

              <div>
                <Label>Comments</Label>
                <Input
                  value={bulkEditData.comments || ""}
                  onChange={(e) =>
                    handleBulkEditInputChange(
                      "comments",
                      e.target.value || undefined
                    )
                  }
                  placeholder="Leave empty to keep existing values"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="bulk_inactive"
                    checked={bulkEditData.inactive === true}
                    onChange={(e) =>
                      handleBulkEditInputChange(
                        "inactive",
                        e.target.checked ? true : undefined
                      )
                    }
                  />
                  <Label htmlFor="bulk_inactive">Mark as Inactive</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="bulk_lump_sum_bid"
                    checked={bulkEditData.lumpSumBid === true}
                    onChange={(e) =>
                      handleBulkEditInputChange(
                        "lumpSumBid",
                        e.target.checked ? true : undefined
                      )
                    }
                  />
                  <Label htmlFor="bulk_lump_sum_bid">Lump Sum Bid</Label>
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setBulkEditModalOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={bulkEditMutation.isPending}>
                {bulkEditMutation.isPending
                  ? "Updating..."
                  : `Update ${selectedItems.length} Items`}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
