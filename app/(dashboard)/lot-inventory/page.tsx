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
import { Textarea } from "../../../components/ui/textarea";
import { Plus, Edit, Trash2, MapPin } from "lucide-react";
import { api } from "../../providers";
import { useTimezone } from "../../../lib/timezone-context";

import type { InventoryHome as DbInventoryHome } from "../../../types/database";

// Extend to include joined fields and legacy lot inventory fields
interface LotInventory extends DbInventoryHome {
  community_name?: string;
  community_code?: string;
  // Legacy lot inventory fields for backward compatibility
  lot_inventory_id?: string;
  lot?: string;
  section?: string;
  block?: string;
  lot_address?: string;
  lot_city?: string;
  lot_state?: string;
  lot_zip?: string;
  lot_size?: string;
  lot_type?: string;
  lot_status?: string;
  lot_cost?: number;
  lot_premium?: number;
  hoa_fee?: number;
  tax_rate?: number;
  school_district?: string;
  notes?: string;
}

// Excel column definitions
const excelColumns: ExcelColumn[] = [
  { field: "lot", header: "Lot Number *", required: true },
  { field: "community_code", header: "Community Code *", required: true },
  {
    field: "lot_status",
    header: "Status *",
    required: true,
    defaultValue: "Available",
  },
  { field: "section", header: "Section" },
  { field: "block", header: "Block" },
  { field: "lot_address", header: "Address" },
  { field: "lot_city", header: "City" },
  { field: "lot_state", header: "State" },
  { field: "lot_zip", header: "ZIP Code" },
  { field: "lot_size", header: "Size (sqft)", type: "number" },
  { field: "lot_type", header: "Type" },
  { field: "lot_cost", header: "Cost", type: "number" },
  { field: "lot_price", header: "Price", type: "number" },
  { field: "lot_premium", header: "Premium", type: "number" },
  { field: "hoa_fee", header: "HOA Fee", type: "number" },
  { field: "tax_rate", header: "Tax Rate (%)", type: "number" },
  { field: "school_district", header: "School District" },
  { field: "notes", header: "Notes" },
];

const currencyFormatter = (params: any) => {
  if (params.value == null) return "";
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(params.value);
};

const percentFormatter = (params: any) => {
  if (params.value == null) return "";
  return `${params.value.toFixed(2)}%`;
};

const numberFormatter = (params: any) => {
  if (params.value == null) return "";
  return new Intl.NumberFormat("en-US").format(params.value);
};

// Custom cell renderer for status
const StatusCellRenderer = ({ value }: { value: string }) => {
  const statusColors: Record<string, string> = {
    Available: "bg-green-100 text-green-800",
    Reserved: "bg-yellow-100 text-yellow-800",
    Sold: "bg-blue-100 text-blue-800",
    "Under Contract": "bg-purple-100 text-purple-800",
    Model: "bg-gray-100 text-gray-800",
  };

  return (
    <Badge className={statusColors[value] || "bg-gray-100 text-gray-800"}>
      {value}
    </Badge>
  );
};

// Custom cell renderer for actions
const ActionsCellRenderer = ({
  data,
  onEdit,
  onDelete,
}: {
  data: LotInventory;
  onEdit: (lot: LotInventory) => void;
  onDelete: (lot: LotInventory) => void;
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

export default function LotInventoryPage() {
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
  const [editingLot, setEditingLot] = useState<LotInventory | null>(null);
  const [selectedRows, setSelectedRows] = useState<LotInventory[]>([]);
  const [bulkEditOpen, setBulkEditOpen] = useState(false);
  const [bulkDeleteOpen, setBulkDeleteOpen] = useState(false);
  const [bulkEditField, setBulkEditField] = useState("");
  const [bulkEditValue, setBulkEditValue] = useState("");
  const [formData, setFormData] = useState({
    lot_number: "",
    community_id: "",
    section: "",
    block: "",
    lot_address: "",
    lot_city: "",
    lot_state: "",
    lot_zip: "",
    lot_size: "",
    lot_type: "",
    lot_status: "Available",
    lot_cost: "",
    lot_price: "",
    lot_premium: "",
    hoa_fee: "",
    tax_rate: "",
    school_district: "",
    notes: "",
  });

  // Delete confirmation state
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [lotToDelete, setLotToDelete] = useState<LotInventory | null>(null);

  // Get tRPC utils for cache invalidation
  const utils = api.useUtils();

  // Fetch lot inventory data
  const { data: lots = [], isLoading } = api.lotInventory.getAll.useQuery(
    {
      builderId: builderId!,
      limit: 1000,
    },
    {
      enabled: !!builderId,
    }
  );

  // Debug log
  useEffect(() => {
    if (lots) {
      console.log(
        "Lot inventory data:",
        lots.length,
        "records, Loading:",
        isLoading,
        "BuilderId:",
        builderId
      );
    }
  }, [lots, isLoading, builderId]);

  // Fetch communities for dropdown
  const { data: communities = [] } = api.builders.getCommunities.useQuery(
    {
      builderId: builderId!,
    },
    {
      enabled: !!builderId,
    }
  );

  // Fetch regions for creating new lots
  const { data: regions = [] } = api.builders.getRegions.useQuery(
    {
      builderId: builderId!,
    },
    {
      enabled: !!builderId,
    }
  );

  // Create lot mutation
  const createLotMutation = api.lotInventory.create.useMutation({
    onSuccess: () => {
      utils.lotInventory.getAll.invalidate();
      setIsModalOpen(false);
      resetForm();
    },
    onError: (error) => {
      console.error("Failed to create lot:", error);
    },
  });

  // Update lot mutation
  const updateLotMutation = api.lotInventory.update.useMutation({
    onSuccess: () => {
      utils.lotInventory.getAll.invalidate();
      setIsModalOpen(false);
      setEditingLot(null);
    },
    onError: (error) => {
      console.error("Failed to update lot:", error);
    },
  });

  // Delete lot mutation
  const deleteLotMutation = api.lotInventory.delete.useMutation({
    onSuccess: () => {
      utils.lotInventory.getAll.invalidate();
      setDeleteConfirmOpen(false);
      setLotToDelete(null);
    },
    onError: (error) => {
      console.error("Failed to delete lot:", error);
    },
  });

  const resetForm = () => {
    setFormData({
      lot_number: "",
      community_id: "",
      section: "",
      block: "",
      lot_address: "",
      lot_city: "",
      lot_state: "",
      lot_zip: "",
      lot_size: "",
      lot_type: "",
      lot_status: "Available",
      lot_cost: "",
      lot_price: "",
      lot_premium: "",
      hoa_fee: "",
      tax_rate: "",
      school_district: "",
      notes: "",
    });
  };

  // Handle create new lot
  const handleCreateLot = useCallback(() => {
    setEditingLot(null);
    resetForm();
    setIsModalOpen(true);
  }, []);

  // Handle edit lot
  const handleEditLot = useCallback((lot: LotInventory) => {
    setEditingLot(lot);
    setFormData({
      lot_number: lot.lot || "",
      community_id: lot.community_id || "",
      section: lot.section || "",
      block: lot.block || "",
      lot_address: lot.lot_address || "",
      lot_city: lot.lot_city || "",
      lot_state: lot.lot_state || "",
      lot_zip: lot.lot_zip || "",
      lot_size: lot.lot_size?.toString() || "",
      lot_type: lot.lot_type || "",
      lot_status: lot.lot_status || "Available",
      lot_cost: lot.lot_cost?.toString() || "",
      lot_price: lot.lot_price?.toString() || "",
      lot_premium: lot.lot_premium?.toString() || "",
      hoa_fee: lot.hoa_fee?.toString() || "",
      tax_rate: lot.tax_rate?.toString() || "",
      school_district: lot.school_district || "",
      notes: lot.notes || "",
    });
    setIsModalOpen(true);
  }, []);

  // Handle delete lot
  const handleDeleteLot = useCallback((lot: LotInventory) => {
    setLotToDelete(lot);
    setDeleteConfirmOpen(true);
  }, []);

  // Confirm delete lot
  const confirmDeleteLot = useCallback(() => {
    if (!lotToDelete || !builderId) return;

    deleteLotMutation.mutate({
      builderId: builderId,
      lotId: lotToDelete.lot_inventory_id || lotToDelete.inventory_home_id,
    });
  }, [lotToDelete, builderId, deleteLotMutation]);

  // Handle form submit
  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();

      if (!builderId || !session?.user?.id) {
        console.error("Missing required data for API call");
        return;
      }

      const selectedCommunity = communities.find(
        (c) => c.community_id === formData.community_id
      );
      if (!selectedCommunity) {
        console.error("Invalid community selected");
        return;
      }

      if (editingLot) {
        // Update existing lot
        updateLotMutation.mutate({
          builderId: builderId,
          lotId: editingLot.lot_inventory_id || editingLot.inventory_home_id,
          lot: formData.lot_number || undefined,
          section: formData.section || undefined,
          block: formData.block || undefined,
          lotAddress: formData.lot_address || undefined,
          lotCity: formData.lot_city || undefined,
          lotState: formData.lot_state || undefined,
          lotZip: formData.lot_zip || undefined,
          lotSize: formData.lot_size
            ? parseFloat(formData.lot_size)
            : undefined,
          lotType: formData.lot_type || undefined,
          lotStatus: formData.lot_status || undefined,
          lotCost: formData.lot_cost
            ? parseFloat(formData.lot_cost)
            : undefined,
          lotPrice: formData.lot_price
            ? parseFloat(formData.lot_price)
            : undefined,
          lotPremium: formData.lot_premium
            ? parseFloat(formData.lot_premium)
            : undefined,
          hoaFee: formData.hoa_fee ? parseFloat(formData.hoa_fee) : undefined,
          taxRate: formData.tax_rate
            ? parseFloat(formData.tax_rate)
            : undefined,
          schoolDistrict: formData.school_district || undefined,
          notes: formData.notes || undefined,
          modifiedBy: session.user.id,
        });
      } else {
        // Create new lot
        createLotMutation.mutate({
          builderId: builderId,
          regionId: selectedCommunity.region_id,
          communityId: formData.community_id,
          lot: formData.lot_number,
          section: formData.section || undefined,
          block: formData.block || undefined,
          lotAddress: formData.lot_address || undefined,
          lotCity: formData.lot_city || undefined,
          lotState: formData.lot_state || undefined,
          lotZip: formData.lot_zip || undefined,
          lotSize: formData.lot_size
            ? parseFloat(formData.lot_size)
            : undefined,
          lotType: formData.lot_type || undefined,
          lotStatus: formData.lot_status,
          lotCost: formData.lot_cost
            ? parseFloat(formData.lot_cost)
            : undefined,
          lotPrice: formData.lot_price
            ? parseFloat(formData.lot_price)
            : undefined,
          lotPremium: formData.lot_premium
            ? parseFloat(formData.lot_premium)
            : undefined,
          hoaFee: formData.hoa_fee ? parseFloat(formData.hoa_fee) : undefined,
          taxRate: formData.tax_rate
            ? parseFloat(formData.tax_rate)
            : undefined,
          schoolDistrict: formData.school_district || undefined,
          notes: formData.notes || undefined,
          createdBy: session.user.id,
          modifiedBy: session.user.id,
        });
      }
    },
    [
      formData,
      editingLot,
      builderId,
      session?.user?.id,
      communities,
      createLotMutation,
      updateLotMutation,
    ]
  );

  // Handle form input changes
  const handleInputChange = useCallback((field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  }, []);

  // Handle import from DataGrid
  const handleImport = useCallback(
    async (importData: any[]) => {
      if (!builderId || !session?.user?.id) return;

      console.log("Starting import with data:", importData);
      let successCount = 0;
      let errorCount = 0;

      for (const row of importData) {
        // Find community by code
        const community = communities.find(
          (c) => c.community_code === row.community_code
        );
        if (!community) {
          console.warn(`Community not found for code: ${row.community_code}`);
          errorCount++;
          continue;
        }

        try {
          await createLotMutation.mutateAsync({
            builderId: builderId,
            regionId: community.region_id,
            communityId: community.community_id,
            lot: row.lot,
            lotStatus: row.lot_status || "Available",
            section: row.section,
            block: row.block,
            lotAddress: row.lot_address,
            lotCity: row.lot_city,
            lotState: row.lot_state,
            lotZip: row.lot_zip,
            lotSize: row.lot_size,
            lotType: row.lot_type,
            lotCost: row.lot_cost,
            lotPrice: row.lot_price,
            lotPremium: row.lot_premium,
            hoaFee: row.hoa_fee,
            taxRate: row.tax_rate,
            schoolDistrict: row.school_district,
            notes: row.notes,
            createdBy: session.user.id,
            modifiedBy: session.user.id,
          });
          successCount++;
        } catch (error) {
          console.error("Error creating lot:", error);
          errorCount++;
        }
      }

      console.log(
        `Import complete. Success: ${successCount}, Errors: ${errorCount}`
      );

      // Refresh data
      await utils.lotInventory.getAll.invalidate();

      // Force a refetch to ensure data is fresh
      await utils.lotInventory.getAll.refetch();
    },
    [builderId, session?.user?.id, communities, createLotMutation, utils]
  );

  // Handle inline cell editing
  const handleCellValueChanged = useCallback(
    async (event: CellValueChangedEvent) => {
      if (!builderId || !session?.user?.id) return;

      const lot = event.data as LotInventory;
      const field = event.colDef.field;
      const newValue = event.newValue;

      // Map field names to API parameter names
      const fieldMap: Record<string, string> = {
        lot: "lot",
        section: "section",
        block: "block",
        lot_address: "lotAddress",
        lot_city: "lotCity",
        lot_state: "lotState",
        lot_zip: "lotZip",
        lot_size: "lotSize",
        lot_type: "lotType",
        lot_status: "lotStatus",
        lot_cost: "lotCost",
        lot_price: "lotPrice",
        lot_premium: "lotPremium",
        hoa_fee: "hoaFee",
        tax_rate: "taxRate",
        school_district: "schoolDistrict",
        notes: "notes",
      };

      const apiField = fieldMap[field!];
      if (!apiField) return;

      try {
        // Convert numeric values
        let value = newValue;
        if (
          [
            "lot_size",
            "lot_cost",
            "lot_price",
            "lot_premium",
            "hoa_fee",
            "tax_rate",
          ].includes(field!)
        ) {
          value = newValue ? parseFloat(newValue) : undefined;
        }

        await updateLotMutation.mutateAsync({
          builderId: builderId,
          lotId: lot.lot_inventory_id || lot.inventory_home_id,
          [apiField]: value,
          modifiedBy: session.user.id,
        });

        // Show success (AG-Grid will keep the new value)
      } catch (error) {
        console.error("Error updating lot:", error);
        // Revert the change by refreshing the data
        await utils.lotInventory.getAll.invalidate();
      }
    },
    [builderId, session?.user?.id, updateLotMutation, utils]
  );

  // Handle row selection changes
  const handleSelectionChanged = useCallback((selectedRows: any[]) => {
    setSelectedRows(selectedRows as LotInventory[]);
  }, []);

  // Handle bulk edit
  const handleBulkEdit = useCallback(() => {
    if (selectedRows.length === 0) return;
    setBulkEditField("lot_status"); // Default to status field
    setBulkEditValue("");
    setBulkEditOpen(true);
  }, [selectedRows]);

  // Confirm bulk edit
  const confirmBulkEdit = useCallback(async () => {
    if (!builderId || !session?.user?.id || !bulkEditField || !bulkEditValue)
      return;

    const fieldMap: Record<string, string> = {
      lot: "lot",
      lot_status: "lotStatus",
      section: "section",
      block: "block",
      lot_address: "lotAddress",
      lot_city: "lotCity",
      lot_state: "lotState",
      lot_zip: "lotZip",
      lot_size: "lotSize",
      lot_type: "lotType",
      lot_cost: "lotCost",
      lot_price: "lotPrice",
      lot_premium: "lotPremium",
      hoa_fee: "hoaFee",
      tax_rate: "taxRate",
      school_district: "schoolDistrict",
    };

    const apiField = fieldMap[bulkEditField];
    if (!apiField) return;

    try {
      // Convert value for numeric fields
      let value: any = bulkEditValue;
      if (
        [
          "lot_size",
          "lot_cost",
          "lot_price",
          "lot_premium",
          "hoa_fee",
          "tax_rate",
        ].includes(bulkEditField)
      ) {
        value = bulkEditValue ? parseFloat(bulkEditValue) : undefined;
      }

      // Update each selected lot
      for (const lot of selectedRows) {
        await updateLotMutation.mutateAsync({
          builderId: builderId,
          lotId: lot.lot_inventory_id || lot.inventory_home_id,
          [apiField]: value,
          modifiedBy: session.user.id,
        });
      }

      // Refresh data and clear selection
      await utils.lotInventory.getAll.invalidate();
      setSelectedRows([]);
      setBulkEditOpen(false);
      setBulkEditField("");
      setBulkEditValue("");
    } catch (error) {
      console.error("Error in bulk edit:", error);
    }
  }, [
    builderId,
    session?.user?.id,
    bulkEditField,
    bulkEditValue,
    selectedRows,
    updateLotMutation,
    utils,
  ]);

  // Handle bulk delete
  const handleBulkDelete = useCallback(() => {
    if (selectedRows.length === 0) return;
    setBulkDeleteOpen(true);
  }, [selectedRows]);

  // Confirm bulk delete
  const confirmBulkDelete = useCallback(async () => {
    if (!builderId || selectedRows.length === 0) return;

    try {
      // Delete each selected lot
      for (const lot of selectedRows) {
        await deleteLotMutation.mutateAsync({
          builderId: builderId,
          lotId: lot.lot_inventory_id || lot.inventory_home_id,
        });
      }

      // Refresh data and clear selection
      await utils.lotInventory.getAll.invalidate();
      setSelectedRows([]);
      setBulkDeleteOpen(false);
    } catch (error) {
      console.error("Error in bulk delete:", error);
    }
  }, [builderId, selectedRows, deleteLotMutation, utils]);

  // AG Grid column definitions
  const columnDefs: ColDef[] = useMemo(
    () => [
      {
        headerName: "Lot Number",
        field: "lot",
        sortable: true,
        filter: true,
        flex: 1,
        minWidth: 120,
        pinned: "left",
        editable: true,
      },
      {
        headerName: "Community",
        field: "community_name",
        sortable: true,
        filter: true,
        flex: 1.5,
        minWidth: 150,
        editable: false, // Can't edit community directly
      },
      {
        headerName: "Status",
        field: "lot_status",
        sortable: true,
        filter: true,
        flex: 1,
        minWidth: 120,
        cellRenderer: StatusCellRenderer,
        editable: true,
        cellEditor: "agSelectCellEditor",
        cellEditorParams: {
          values: [
            "Available",
            "Reserved",
            "Sold",
            "Under Contract",
            "Model",
            "Spec",
          ],
        },
      },
      {
        headerName: "Address",
        field: "lot_address",
        sortable: true,
        editable: true,
        filter: true,
        flex: 1.5,
        minWidth: 150,
      },
      {
        headerName: "City",
        field: "lot_city",
        sortable: true,
        editable: true,
        filter: true,
        flex: 1,
        minWidth: 100,
      },
      {
        headerName: "State",
        field: "lot_state",
        sortable: true,
        editable: true,
        filter: true,
        width: 80,
        minWidth: 60,
      },
      {
        headerName: "ZIP",
        field: "lot_zip",
        sortable: true,
        editable: true,
        filter: true,
        width: 100,
        minWidth: 80,
      },
      {
        headerName: "Section",
        field: "section",
        sortable: true,
        filter: true,
        flex: 0.8,
        minWidth: 80,
        editable: true,
      },
      {
        headerName: "Block",
        field: "block",
        sortable: true,
        filter: true,
        flex: 0.8,
        minWidth: 80,
        editable: true,
      },
      {
        headerName: "Size (sqft)",
        field: "lot_size",
        sortable: true,
        filter: "agNumberColumnFilter",
        flex: 1,
        minWidth: 100,
        valueFormatter: numberFormatter,
        editable: true,
        cellEditor: "agNumberCellEditor",
      },
      {
        headerName: "Type",
        field: "lot_type",
        sortable: true,
        filter: true,
        flex: 1,
        minWidth: 100,
        editable: true,
      },
      {
        headerName: "Cost",
        field: "lot_cost",
        sortable: true,
        filter: "agNumberColumnFilter",
        flex: 1,
        minWidth: 120,
        valueFormatter: currencyFormatter,
        editable: true,
        cellEditor: "agNumberCellEditor",
      },
      {
        headerName: "Price",
        field: "lot_price",
        sortable: true,
        filter: "agNumberColumnFilter",
        flex: 1,
        minWidth: 120,
        valueFormatter: currencyFormatter,
        editable: true,
        cellEditor: "agNumberCellEditor",
      },
      {
        headerName: "Premium",
        field: "lot_premium",
        sortable: true,
        filter: "agNumberColumnFilter",
        flex: 1,
        minWidth: 120,
        valueFormatter: currencyFormatter,
        editable: true,
        cellEditor: "agNumberCellEditor",
      },
      {
        headerName: "HOA Fee",
        field: "hoa_fee",
        sortable: true,
        filter: "agNumberColumnFilter",
        flex: 1,
        minWidth: 100,
        valueFormatter: currencyFormatter,
        editable: true,
        cellEditor: "agNumberCellEditor",
      },
      {
        headerName: "Tax Rate",
        field: "tax_rate",
        sortable: true,
        filter: "agNumberColumnFilter",
        flex: 1,
        minWidth: 100,
        valueFormatter: percentFormatter,
        editable: true,
        cellEditor: "agNumberCellEditor",
      },
      {
        headerName: "School District",
        field: "school_district",
        sortable: true,
        filter: true,
        flex: 1.5,
        minWidth: 150,
        editable: true,
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
          onEdit: handleEditLot,
          onDelete: handleDeleteLot,
        },
      },
    ],
    [handleEditLot, handleDeleteLot]
  );

  // Show loading while checking authentication
  if (status === "loading") {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground text-lg">
            Loading lot inventory...
          </p>
        </div>
      </div>
    );
  }

  // Show loading while fetching data
  if (builderId && isLoading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold">Lot Inventory</h1>
            <p className="text-muted-foreground">
              Manage your lot inventory and availability
            </p>
          </div>
        </div>
        <Card>
          <CardHeader>
            <CardTitle>Lot Inventory</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-center h-64">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                <p className="text-muted-foreground">
                  Loading lot inventory data...
                </p>
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
              <MapPin className="h-8 w-8" />
              Lot Inventory
            </h1>
            <p className="text-muted-foreground">
              Manage your lot inventory and availability
            </p>
          </div>
          <div className="flex items-center gap-2">
            {selectedRows.length > 0 && (
              <>
                <span className="text-sm text-muted-foreground">
                  {selectedRows.length} selected
                </span>
                <Button
                  onClick={handleBulkEdit}
                  variant="outline"
                  className="flex items-center gap-2"
                >
                  <Edit className="h-4 w-4" />
                  Bulk Edit
                </Button>
                <Button
                  onClick={handleBulkDelete}
                  variant="outline"
                  className="flex items-center gap-2 text-red-600 hover:text-red-700"
                >
                  <Trash2 className="h-4 w-4" />
                  Delete Selected
                </Button>
              </>
            )}
            <Button
              onClick={handleCreateLot}
              className="flex items-center gap-2"
            >
              <Plus className="h-4 w-4" />
              Add New Lot
            </Button>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Lot Inventory</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="text-sm text-muted-foreground">
                Double-click any cell to edit. Use checkboxes to select multiple
                rows for bulk operations. Changes are saved automatically.
              </div>
              <DataGrid
                data={lots}
                loading={isLoading}
                columnDefs={columnDefs}
                excelColumns={excelColumns}
                onImport={handleImport}
                fileName="lot-inventory"
                importTitle="Import Lot Inventory"
                enableEditing={true}
                onCellValueChanged={handleCellValueChanged}
                rowSelection="multiple"
                onSelectionChanged={handleSelectionChanged}
              />
            </div>
          </CardContent>
        </Card>

        {/* Lot Modal */}
        <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>
                {editingLot ? "Edit Lot" : "Create New Lot"}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit}>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="lot_number">Lot Number *</Label>
                    <Input
                      id="lot_number"
                      value={formData.lot_number}
                      onChange={(e) =>
                        handleInputChange("lot_number", e.target.value)
                      }
                      placeholder="Lot number"
                      required
                    />
                  </div>
                  {!editingLot && (
                    <div className="space-y-2">
                      <Label htmlFor="community_id">Community *</Label>
                      <Select
                        value={formData.community_id}
                        onValueChange={(value) =>
                          handleInputChange("community_id", value)
                        }
                        required
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select a community" />
                        </SelectTrigger>
                        <SelectContent>
                          {communities.map((community) => (
                            <SelectItem
                              key={community.community_id}
                              value={community.community_id}
                            >
                              {community.community_code} -{" "}
                              {community.description}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                  {editingLot && (
                    <div className="space-y-2">
                      <Label htmlFor="lot_status">Status *</Label>
                      <Select
                        value={formData.lot_status}
                        onValueChange={(value) =>
                          handleInputChange("lot_status", value)
                        }
                        required
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Available">Available</SelectItem>
                          <SelectItem value="Reserved">Reserved</SelectItem>
                          <SelectItem value="Sold">Sold</SelectItem>
                          <SelectItem value="Under Contract">
                            Under Contract
                          </SelectItem>
                          <SelectItem value="Model">Model</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="section">Section</Label>
                    <Input
                      id="section"
                      value={formData.section}
                      onChange={(e) =>
                        handleInputChange("section", e.target.value)
                      }
                      placeholder="Section"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="block">Block</Label>
                    <Input
                      id="block"
                      value={formData.block}
                      onChange={(e) =>
                        handleInputChange("block", e.target.value)
                      }
                      placeholder="Block"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="lot_address">Address</Label>
                  <Input
                    id="lot_address"
                    value={formData.lot_address}
                    onChange={(e) =>
                      handleInputChange("lot_address", e.target.value)
                    }
                    placeholder="Street address"
                  />
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="lot_city">City</Label>
                    <Input
                      id="lot_city"
                      value={formData.lot_city}
                      onChange={(e) =>
                        handleInputChange("lot_city", e.target.value)
                      }
                      placeholder="City"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lot_state">State</Label>
                    <Input
                      id="lot_state"
                      value={formData.lot_state}
                      onChange={(e) =>
                        handleInputChange("lot_state", e.target.value)
                      }
                      placeholder="State"
                      maxLength={2}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lot_zip">ZIP Code</Label>
                    <Input
                      id="lot_zip"
                      value={formData.lot_zip}
                      onChange={(e) =>
                        handleInputChange("lot_zip", e.target.value)
                      }
                      placeholder="ZIP code"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="lot_size">Size (sqft)</Label>
                    <Input
                      id="lot_size"
                      type="number"
                      value={formData.lot_size}
                      onChange={(e) =>
                        handleInputChange("lot_size", e.target.value)
                      }
                      placeholder="Lot size"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lot_type">Type</Label>
                    <Input
                      id="lot_type"
                      value={formData.lot_type}
                      onChange={(e) =>
                        handleInputChange("lot_type", e.target.value)
                      }
                      placeholder="Lot type"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="lot_cost">Cost</Label>
                    <Input
                      id="lot_cost"
                      type="number"
                      step="0.01"
                      value={formData.lot_cost}
                      onChange={(e) =>
                        handleInputChange("lot_cost", e.target.value)
                      }
                      placeholder="0.00"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lot_price">Price</Label>
                    <Input
                      id="lot_price"
                      type="number"
                      step="0.01"
                      value={formData.lot_price}
                      onChange={(e) =>
                        handleInputChange("lot_price", e.target.value)
                      }
                      placeholder="0.00"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lot_premium">Premium</Label>
                    <Input
                      id="lot_premium"
                      type="number"
                      step="0.01"
                      value={formData.lot_premium}
                      onChange={(e) =>
                        handleInputChange("lot_premium", e.target.value)
                      }
                      placeholder="0.00"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="hoa_fee">HOA Fee</Label>
                    <Input
                      id="hoa_fee"
                      type="number"
                      step="0.01"
                      value={formData.hoa_fee}
                      onChange={(e) =>
                        handleInputChange("hoa_fee", e.target.value)
                      }
                      placeholder="0.00"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="tax_rate">Tax Rate (%)</Label>
                    <Input
                      id="tax_rate"
                      type="number"
                      step="0.01"
                      value={formData.tax_rate}
                      onChange={(e) =>
                        handleInputChange("tax_rate", e.target.value)
                      }
                      placeholder="0.00"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="school_district">School District</Label>
                    <Input
                      id="school_district"
                      value={formData.school_district}
                      onChange={(e) =>
                        handleInputChange("school_district", e.target.value)
                      }
                      placeholder="School district"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="notes">Notes</Label>
                  <Textarea
                    id="notes"
                    value={formData.notes}
                    onChange={(e) => handleInputChange("notes", e.target.value)}
                    placeholder="Additional notes"
                    rows={3}
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
                    createLotMutation.isPending || updateLotMutation.isPending
                  }
                >
                  {createLotMutation.isPending || updateLotMutation.isPending
                    ? editingLot
                      ? "Updating..."
                      : "Creating..."
                    : editingLot
                    ? "Update Lot"
                    : "Create Lot"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation Dialog */}
        <Dialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Delete Lot</DialogTitle>
            </DialogHeader>
            <div className="py-4">
              <p className="text-muted-foreground">
                Are you sure you want to delete lot &ldquo;{lotToDelete?.lot}
                &rdquo;?
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
                onClick={confirmDeleteLot}
                disabled={deleteLotMutation.isPending}
              >
                {deleteLotMutation.isPending ? "Deleting..." : "Delete Lot"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Bulk Edit Dialog */}
        <Dialog open={bulkEditOpen} onOpenChange={setBulkEditOpen}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Bulk Edit {selectedRows.length} Lots</DialogTitle>
            </DialogHeader>
            <div className="py-4 space-y-4">
              <p className="text-sm text-muted-foreground">
                Update the same field across all selected lots. Numeric fields
                will be validated automatically.
              </p>
              <div className="space-y-2">
                <Label htmlFor="bulk-field">Field to Update</Label>
                <Select value={bulkEditField} onValueChange={setBulkEditField}>
                  <SelectTrigger id="bulk-field">
                    <SelectValue placeholder="Select field" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="lot">Lot Number</SelectItem>
                    <SelectItem value="lot_status">Status</SelectItem>
                    <SelectItem value="section">Section</SelectItem>
                    <SelectItem value="block">Block</SelectItem>
                    <SelectItem value="lot_address">Address</SelectItem>
                    <SelectItem value="lot_city">City</SelectItem>
                    <SelectItem value="lot_state">State</SelectItem>
                    <SelectItem value="lot_zip">ZIP Code</SelectItem>
                    <SelectItem value="lot_size">Size (sqft)</SelectItem>
                    <SelectItem value="lot_type">Type</SelectItem>
                    <SelectItem value="lot_cost">Cost</SelectItem>
                    <SelectItem value="lot_price">Price</SelectItem>
                    <SelectItem value="lot_premium">Premium</SelectItem>
                    <SelectItem value="hoa_fee">HOA Fee</SelectItem>
                    <SelectItem value="tax_rate">Tax Rate (%)</SelectItem>
                    <SelectItem value="school_district">
                      School District
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="bulk-value">New Value</Label>
                {bulkEditField === "lot_status" ? (
                  <Select
                    value={bulkEditValue}
                    onValueChange={setBulkEditValue}
                  >
                    <SelectTrigger id="bulk-value">
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Available">Available</SelectItem>
                      <SelectItem value="Reserved">Reserved</SelectItem>
                      <SelectItem value="Sold">Sold</SelectItem>
                      <SelectItem value="Under Contract">
                        Under Contract
                      </SelectItem>
                      <SelectItem value="Model">Model</SelectItem>
                      <SelectItem value="Spec">Spec</SelectItem>
                    </SelectContent>
                  </Select>
                ) : (
                  <Input
                    id="bulk-value"
                    type={
                      [
                        "lot_size",
                        "lot_cost",
                        "lot_price",
                        "lot_premium",
                        "hoa_fee",
                        "tax_rate",
                      ].includes(bulkEditField)
                        ? "number"
                        : "text"
                    }
                    value={bulkEditValue}
                    onChange={(e) => setBulkEditValue(e.target.value)}
                    placeholder={
                      bulkEditField === "lot"
                        ? "Enter lot number"
                        : bulkEditField === "section"
                        ? "Enter section"
                        : bulkEditField === "block"
                        ? "Enter block"
                        : bulkEditField === "lot_address"
                        ? "Enter address"
                        : bulkEditField === "lot_city"
                        ? "Enter city"
                        : bulkEditField === "lot_state"
                        ? "Enter state (e.g., TX)"
                        : bulkEditField === "lot_zip"
                        ? "Enter ZIP code"
                        : bulkEditField === "lot_size"
                        ? "Enter size in sqft"
                        : bulkEditField === "lot_type"
                        ? "Enter lot type"
                        : bulkEditField === "lot_cost"
                        ? "Enter cost (e.g., 50000)"
                        : bulkEditField === "lot_price"
                        ? "Enter price (e.g., 75000)"
                        : bulkEditField === "lot_premium"
                        ? "Enter premium (e.g., 5000)"
                        : bulkEditField === "hoa_fee"
                        ? "Enter HOA fee (e.g., 150)"
                        : bulkEditField === "tax_rate"
                        ? "Enter tax rate (e.g., 2.5)"
                        : bulkEditField === "school_district"
                        ? "Enter school district"
                        : "Enter new value"
                    }
                    step={bulkEditField === "tax_rate" ? "0.01" : undefined}
                  />
                )}
              </div>
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setBulkEditOpen(false)}
              >
                Cancel
              </Button>
              <Button
                type="button"
                onClick={confirmBulkEdit}
                disabled={
                  !bulkEditField ||
                  !bulkEditValue ||
                  updateLotMutation.isPending
                }
              >
                {updateLotMutation.isPending ? "Updating..." : "Update All"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Bulk Delete Confirmation Dialog */}
        <Dialog open={bulkDeleteOpen} onOpenChange={setBulkDeleteOpen}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Delete {selectedRows.length} Lots</DialogTitle>
            </DialogHeader>
            <div className="py-4">
              <p className="text-muted-foreground">
                Are you sure you want to delete {selectedRows.length} selected
                lots?
              </p>
              <p className="text-muted-foreground text-sm mt-2">
                This action cannot be undone.
              </p>
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setBulkDeleteOpen(false)}
              >
                Cancel
              </Button>
              <Button
                type="button"
                variant="destructive"
                onClick={confirmBulkDelete}
                disabled={deleteLotMutation.isPending}
              >
                {deleteLotMutation.isPending
                  ? "Deleting..."
                  : `Delete ${selectedRows.length} Lots`}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
