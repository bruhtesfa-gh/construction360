"use client";

import { useEffect, useMemo, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { DataGrid, type ExcelColumn } from "../../../components/grid";
import type { ColDef } from "ag-grid-community";
import { api } from "../../providers";

import { Button } from "../../../components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../../components/ui/card";
import { Plus, FileText, Eye } from "lucide-react";
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

interface POMaster {
  po_master_id: string;
  po_number: string;
  po_date: Date;
  description: string | null;
  supplier_name: string | null;
  region_code: string;
  item_count: number;
  total_amount: number | null;
}

interface POItem {
  po_items_id: string;
  line_number: number;
  description: string | null;
  order_qty: number | null;
  order_uom: string | null;
  unit_cost: number | null;
  pretax_total_cost: number | null;
  est_item_id: number | null;
}

export default function PurchaseOrdersPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [selectedPO, setSelectedPO] = useState<POMaster | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isItemModalOpen, setIsItemModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    region_id: "",
    po_number: "",
    po_date: new Date().toISOString().split("T")[0],
    po_index: "",
    job_number: "",
    description: "",
    builder_supplier_id: "",
  });

  const [itemFormData, setItemFormData] = useState({
    line_number: 1,
    description: "",
    order_qty: 0,
    order_uom: "",
    unit_cost: 0,
    pretax_total_cost: 0,
    est_item_id: null,
  });

  useEffect(() => {
    if (status === "loading") return;
    if (!session) {
      router.push("/signin");
      return;
    }
  }, [session, status, router]);

  const builderId = session?.user?.builderId;
  const userId = session?.user?.id;

  // Data fetching
  const {
    data: poMasters = [],
    isPending: mastersLoading,
    refetch: refetchMasters,
  } = api.purchaseOrders.getAll.useQuery(
    { builderId: builderId! },
    { enabled: !!builderId }
  );

  const {
    data: poDetails,
    isPending: detailsLoading,
    refetch: refetchDetails,
  } = api.purchaseOrders.getById.useQuery(
    { builderId: builderId!, poMasterId: selectedPO?.po_master_id! },
    { enabled: !!builderId && !!selectedPO }
  );

  // Data fetching for dropdowns
  const { data: regions = [] } = api.regions.getAll.useQuery(
    { builderId: builderId! },
    { enabled: !!builderId }
  );

  const { data: suppliers = [] } = api.suppliers.getAll.useQuery(
    { builderId: builderId! },
    { enabled: !!builderId }
  );

  const { data: jobs = [] } = api.jobs.getAll.useQuery(
    { builderId: builderId! },
    { enabled: !!builderId }
  );

  // Filter jobs based on selected region
  const filteredJobs = useMemo(() => {
    if (!formData.region_id || !jobs.length) return [];
    return jobs.filter((job: any) => job.region_id === formData.region_id);
  }, [jobs, formData.region_id]);

  const handleInputChange = (field: string, value: any) => {
    setFormData((prev) => {
      const newData = { ...prev, [field]: value };

      // Clear job_number when region changes
      if (field === "region_id") {
        newData.job_number = "";
      }

      return newData;
    });
  };

  // Mutations
  const createMasterMutation = api.purchaseOrders.createMaster.useMutation({
    onSuccess: () => {
      refetchMasters();
      setIsModalOpen(false);
      setFormData({
        region_id: "",
        po_number: "",
        po_date: new Date().toISOString().split("T")[0],
        po_index: "",
        job_number: "",
        description: "",
        builder_supplier_id: "",
      });
    },
    onError: (error) => {
      console.error("Error creating PO:", error);
      alert("Error creating purchase order: " + error.message);
    },
  });

  const createItemMutation = api.purchaseOrders.createItem.useMutation({
    onSuccess: () => {
      refetchDetails();
      setIsItemModalOpen(false);
      setItemFormData({
        line_number: (poDetails?.items?.length || 0) + 1,
        description: "",
        order_qty: 0,
        order_uom: "",
        unit_cost: 0,
        pretax_total_cost: 0,
        est_item_id: null,
      });
    },
    onError: (error) => {
      console.error("Error creating item:", error);
      alert("Error creating item: " + error.message);
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!builderId || !userId) return;

    try {
      await createMasterMutation.mutateAsync({
        builderId,
        userId,
        region_id: formData.region_id,
        po_number: formData.po_number,
        po_date: new Date(formData.po_date),
        po_index: formData.po_index,
        job_number: formData.job_number,
        description: formData.description,
        builder_supplier_id: formData.builder_supplier_id,
      });
    } catch (error) {
      console.error("Error saving PO master:", error);
    }
  };

  const handleItemInputChange = (field: string, value: any) => {
    setItemFormData((prev) => {
      const newData = { ...prev, [field]: value };
      // Auto-calculate pretax_total_cost
      if (field === "order_qty" || field === "unit_cost") {
        newData.pretax_total_cost =
          (newData.order_qty || 0) * (newData.unit_cost || 0);
      }
      return newData;
    });
  };

  const handleItemSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!builderId || !userId || !selectedPO) return;

    try {
      await createItemMutation.mutateAsync({
        builderId,
        userId,
        po_master_id: selectedPO.po_master_id,
        ...itemFormData,
        est_item_id: itemFormData.est_item_id || undefined,
      });
    } catch (error) {
      console.error("Error saving item:", error);
    }
  };

  // Master grid columns
  const masterColumnDefs = useMemo<ColDef[]>(
    () => [
      {
        headerName: "PO Number",
        field: "po_number",
        width: 150,
        pinned: "left",
      },
      {
        headerName: "Date",
        field: "po_date",
        width: 120,
        valueFormatter: (params) => new Date(params.value).toLocaleDateString(),
      },
      { headerName: "Supplier", field: "supplier_name", width: 200 },
      { headerName: "Description", field: "description", width: 250 },
      { headerName: "Region", field: "region_code", width: 100 },
      {
        headerName: "Items",
        field: "item_count",
        width: 80,
        type: "numericColumn",
      },
      {
        headerName: "Total",
        field: "total_amount",
        width: 120,
        type: "numericColumn",
        valueFormatter: (params) =>
          params.value ? `$${params.value.toLocaleString()}` : "",
      },
      {
        headerName: "Actions",
        field: "actions",
        width: 100,
        cellRenderer: (params: any) => (
          <Button
            variant="outline"
            size="sm"
            onClick={() => setSelectedPO(params.data)}
            className="h-8 w-8 p-0"
            title="View Details"
          >
            <Eye className="h-4 w-4" />
          </Button>
        ),
      },
    ],
    [setSelectedPO]
  );

  // Items grid columns
  const itemColumnDefs = useMemo<ColDef[]>(
    () => [
      {
        headerName: "Line #",
        field: "line_number",
        width: 80,
        type: "numericColumn",
      },
      { headerName: "Item Code", field: "est_item_id", width: 120 },
      { headerName: "Description", field: "description", width: 300 },
      {
        headerName: "Qty",
        field: "order_qty",
        width: 100,
        type: "numericColumn",
      },
      { headerName: "UOM", field: "order_uom", width: 80 },
      {
        headerName: "Unit Cost",
        field: "unit_cost",
        width: 120,
        type: "numericColumn",
        valueFormatter: (params) =>
          params.value ? `$${params.value.toLocaleString()}` : "",
      },
      {
        headerName: "Total Cost",
        field: "pretax_total_cost",
        width: 120,
        type: "numericColumn",
        valueFormatter: (params) =>
          params.value ? `$${params.value.toLocaleString()}` : "",
      },
    ],
    []
  );

  // Excel columns
  const masterExcelColumns = useMemo<ExcelColumn[]>(
    () => [
      { field: "po_number", header: "PO Number", type: "string" },
      { field: "po_date", header: "Date", type: "date" },
      { field: "supplier_name", header: "Supplier", type: "string" },
      { field: "description", header: "Description", type: "string" },
      { field: "total_amount", header: "Total", type: "number" },
    ],
    []
  );

  const itemExcelColumns = useMemo<ExcelColumn[]>(
    () => [
      { field: "line_number", header: "Line Number", type: "number" },
      { field: "est_item_id", header: "Item Code", type: "number" },
      { field: "description", header: "Description", type: "string" },
      { field: "order_qty", header: "Quantity", type: "number" },
      { field: "unit_cost", header: "Unit Cost", type: "number" },
      { field: "pretax_total_cost", header: "Total Cost", type: "number" },
    ],
    []
  );

  if (!session) return null;

  return (
    <div className="container mx-auto py-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <FileText className="h-8 w-8" />
            Purchase Orders
          </h1>
          <p className="text-muted-foreground">
            Master-detail purchase order management with line items
          </p>
        </div>
        <Button onClick={() => setIsModalOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          New Purchase Order
        </Button>
      </div>

      <div className="grid gap-6">
        {/* Master Grid */}
        <Card>
          <CardHeader>
            <CardTitle>Purchase Orders</CardTitle>
          </CardHeader>
          <CardContent>
            <DataGrid
              data={poMasters}
              loading={mastersLoading}
              columnDefs={masterColumnDefs}
              excelColumns={masterExcelColumns}
              tableName="po_master"
              fileName="purchase-orders"
              importTitle="Import Purchase Orders"
              rowSelection="single"
              onSelectionChanged={(rows) =>
                setSelectedPO((rows[0] as POMaster) || null)
              }
            />
          </CardContent>
        </Card>

        {/* Detail Grid - Only show when PO is selected */}
        {selectedPO && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>
                  PO Items - {selectedPO.po_number}
                  <span className="text-muted-foreground text-sm ml-2">
                    ({selectedPO.item_count} items, Total: $
                    {selectedPO.total_amount?.toLocaleString() || "0"})
                  </span>
                </span>
                <Button size="sm" onClick={() => setIsItemModalOpen(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Item
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {detailsLoading ? (
                <div className="text-center py-8">Loading items...</div>
              ) : (
                <DataGrid
                  data={poDetails?.items || []}
                  loading={detailsLoading}
                  columnDefs={itemColumnDefs}
                  excelColumns={itemExcelColumns}
                  tableName="po_items"
                  fileName={`po-items-${selectedPO.po_number}`}
                  importTitle="Import PO Items"
                  gridHeight="400px"
                />
              )}
            </CardContent>
          </Card>
        )}

        {/* Instructions when no PO selected */}
        {!selectedPO && (
          <Card>
            <CardContent className="pt-6">
              <div className="text-center text-muted-foreground py-8">
                <Eye className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>
                  Select a Purchase Order from the grid above to view its line
                  items
                </p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* New Purchase Order Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent
          className="max-w-2xl"
          aria-describedby="po-dialog-description"
        >
          <DialogHeader>
            <DialogTitle>Create New Purchase Order</DialogTitle>
            <p
              id="po-dialog-description"
              className="text-sm text-muted-foreground"
            >
              Fill in the details below to create a new purchase order
            </p>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="region_id">Region *</Label>
                  <Select
                    value={formData.region_id}
                    onValueChange={(value) =>
                      handleInputChange("region_id", value)
                    }
                  >
                    <SelectTrigger>
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

                <div className="space-y-2">
                  <Label htmlFor="po_number">PO Number *</Label>
                  <Input
                    id="po_number"
                    value={formData.po_number}
                    onChange={(e) =>
                      handleInputChange("po_number", e.target.value)
                    }
                    placeholder="Enter PO number..."
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="po_index">PO Index *</Label>
                  <Input
                    id="po_index"
                    value={formData.po_index}
                    onChange={(e) =>
                      handleInputChange("po_index", e.target.value)
                    }
                    placeholder="Enter PO index..."
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="job_number">Job Number</Label>
                  <Select
                    value={formData.job_number}
                    onValueChange={(value) =>
                      handleInputChange("job_number", value)
                    }
                    disabled={!formData.region_id}
                  >
                    <SelectTrigger>
                      <SelectValue
                        placeholder={
                          !formData.region_id
                            ? "Select region first..."
                            : filteredJobs.length === 0
                            ? "No jobs in selected region"
                            : "Select job..."
                        }
                      />
                    </SelectTrigger>
                    <SelectContent>
                      {filteredJobs.map((job: any) => (
                        <SelectItem key={job.job_id} value={job.job_number}>
                          {job.job_number} -{" "}
                          {job.description || "No description"}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground">
                    {formData.region_id &&
                      `${filteredJobs.length} jobs available in selected region`}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="po_date">PO Date</Label>
                  <Input
                    id="po_date"
                    type="date"
                    value={formData.po_date}
                    onChange={(e) =>
                      handleInputChange("po_date", e.target.value)
                    }
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="builder_supplier_id">Supplier</Label>
                  <Select
                    value={formData.builder_supplier_id}
                    onValueChange={(value) =>
                      handleInputChange("builder_supplier_id", value)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select supplier..." />
                    </SelectTrigger>
                    <SelectContent>
                      {suppliers.map((supplier: any) => (
                        <SelectItem
                          key={supplier.supplier_id}
                          value={supplier.supplier_id}
                        >
                          {supplier.supplier_code} - {supplier.supplier_name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
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
                  placeholder="Enter description..."
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
              <Button type="submit" disabled={createMasterMutation.isPending}>
                {createMasterMutation.isPending
                  ? "Creating..."
                  : "Create Purchase Order"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Add Item Modal */}
      <Dialog open={isItemModalOpen} onOpenChange={setIsItemModalOpen}>
        <DialogContent
          className="max-w-2xl"
          aria-describedby="item-dialog-description"
        >
          <DialogHeader>
            <DialogTitle>Add Item to PO {selectedPO?.po_number}</DialogTitle>
            <p
              id="item-dialog-description"
              className="text-sm text-muted-foreground"
            >
              Add a line item to this purchase order
            </p>
          </DialogHeader>
          <form onSubmit={handleItemSubmit}>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="line_number">Line Number *</Label>
                  <Input
                    id="line_number"
                    type="number"
                    value={itemFormData.line_number}
                    onChange={(e) =>
                      handleItemInputChange(
                        "line_number",
                        parseInt(e.target.value) || 1
                      )
                    }
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="est_item_id">Item Code</Label>
                  <Input
                    id="est_item_id"
                    type="number"
                    value={itemFormData.est_item_id || ""}
                    onChange={(e) =>
                      handleItemInputChange(
                        "est_item_id",
                        parseInt(e.target.value) || null
                      )
                    }
                    placeholder="Enter estimating item ID..."
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="item_description">Description</Label>
                <Input
                  id="item_description"
                  value={itemFormData.description}
                  onChange={(e) =>
                    handleItemInputChange("description", e.target.value)
                  }
                  placeholder="Enter item description..."
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="order_qty">Quantity</Label>
                  <Input
                    id="order_qty"
                    type="number"
                    step="0.01"
                    value={itemFormData.order_qty}
                    onChange={(e) =>
                      handleItemInputChange(
                        "order_qty",
                        parseFloat(e.target.value) || 0
                      )
                    }
                    placeholder="Enter quantity..."
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="order_uom">UOM</Label>
                  <Input
                    id="order_uom"
                    value={itemFormData.order_uom}
                    onChange={(e) =>
                      handleItemInputChange("order_uom", e.target.value)
                    }
                    placeholder="Unit of measure..."
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="rate">Rate (Unit Cost)</Label>
                  <Input
                    id="rate"
                    type="number"
                    step="0.01"
                    value={itemFormData.unit_cost}
                    onChange={(e) =>
                      handleItemInputChange(
                        "unit_cost",
                        parseFloat(e.target.value) || 0
                      )
                    }
                    placeholder="Enter rate..."
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-lg font-semibold">
                  Total Cost (Pretax): $
                  {itemFormData.pretax_total_cost.toLocaleString()}
                </Label>
                <p className="text-xs text-muted-foreground">
                  Calculated automatically: Quantity × Unit Cost
                </p>
              </div>
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsItemModalOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={createItemMutation.isPending}>
                {createItemMutation.isPending ? "Adding..." : "Add Item"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
