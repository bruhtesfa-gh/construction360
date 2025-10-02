"use client";

import React, { useState } from "react";
import { useSession } from "next-auth/react";
import { useParams } from "next/navigation";
import type { ColDef } from "ag-grid-community";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../../../components/ui/card";
import { Button } from "../../../../components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "../../../../components/ui/dialog";
import { Label } from "../../../../components/ui/label";
import { Input } from "../../../../components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../../../components/ui/select";
import { Checkbox } from "../../../../components/ui/checkbox";
import { Textarea } from "../../../../components/ui/textarea";
import { Badge } from "../../../../components/ui/badge";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "../../../../components/ui/tabs";
// Navigation provided by (root)/layout.tsx
import { DataGrid, type ExcelColumn } from "../../../../components/grid";
import { api } from "../../../providers";
import {
  Loader2,
  Plus,
  Send,
  Award,
  FileText,
  Users,
  Calendar,
  DollarSign,
  ArrowLeft,
} from "lucide-react";
import { format } from "date-fns";
import Link from "next/link";
import type {
  SupplierBidAssignment,
  SupplierBidPricing,
} from "../../../../types/database";

export default function BidDetailPage() {
  const { data: session } = useSession();
  const params = useParams();
  const bidId = params?.bidId as string;
  const builderId = session?.user?.builderId;

  const [isAssignDialogOpen, setIsAssignDialogOpen] = useState(false);
  const [isPricingDialogOpen, setIsPricingDialogOpen] = useState(false);
  const [selectedAssignment, setSelectedAssignment] =
    useState<SupplierBidAssignment | null>(null);
  const [selectedPricingItems, setSelectedPricingItems] = useState<
    SupplierBidPricing[]
  >([]);
  const [activeTab, setActiveTab] = useState("assignments");

  const {
    data: bidDetails,
    isLoading,
    refetch,
    error,
  } = api.supplierBids.getBidWithDetails.useQuery(
    { builderId: builderId!, bidId },
    {
      enabled: !!builderId && !!bidId,
      retry: 1,
    }
  );

  const { data: suppliers = [] } = api.suppliers.getAll.useQuery(
    { builderId: builderId! },
    { enabled: !!builderId }
  );

  const { data: estimatingItems = [] } = api.estimatingDBItems.getAll.useQuery(
    { builderId: builderId! },
    { enabled: !!builderId }
  );

  const [assignFormData, setAssignFormData] = useState({
    supplier_ids: [] as string[],
    assignment_status: "Assigned",
    notes: "",
  });

  const [supplierSearchTerm, setSupplierSearchTerm] = useState("");

  const [pricingFormData, setPricingFormData] = useState({
    estimating_db_item_id: "",
    item_description: "",
    unit_of_measure: "",
    quantity: 0,
    unit_cost: 0,
    markup_percent: 0,
    unit_price: 0,
    notes: "",
  });

  const createAssignmentMutation =
    api.supplierBids.createAssignment.useMutation({
      onSuccess: () => {
        refetch();
        setIsAssignDialogOpen(false);
        setSupplierSearchTerm("");
        setAssignFormData({
          supplier_ids: [],
          assignment_status: "Assigned",
          notes: "",
        });
      },
    });

  const updateAssignmentMutation =
    api.supplierBids.updateAssignment.useMutation({
      onSuccess: () => {
        refetch();
      },
    });

  const awardBidMutation = api.supplierBids.awardBid.useMutation({
    onSuccess: () => {
      refetch();
    },
  });

  const createPricingMutation = api.supplierBids.createPricing.useMutation({
    onSuccess: () => {
      refetch(); // Refetch main bid details
      refetchPricing(); // Refetch pricing data for selected assignment
      setIsPricingDialogOpen(false);
      setPricingFormData({
        estimating_db_item_id: "",
        item_description: "",
        unit_of_measure: "",
        quantity: 0,
        unit_cost: 0,
        markup_percent: 0,
        unit_price: 0,
        notes: "",
      });
    },
  });

  const { data: pricingData, refetch: refetchPricing } =
    api.supplierBids.getPricingByAssignment.useQuery(
      {
        builderId: builderId!,
        assignmentId: selectedAssignment?.supplier_bid_assignment_guid || "",
      },
      {
        enabled:
          !!builderId && !!selectedAssignment?.supplier_bid_assignment_guid,
      }
    );

  const handleAssignSupplier = async () => {
    if (!builderId || assignFormData.supplier_ids.length === 0) return;

    try {
      // Create assignments for all selected suppliers
      for (const supplierId of assignFormData.supplier_ids) {
        await createAssignmentMutation.mutateAsync({
          builder_id: builderId,
          supplier_bid_guid: bidId,
          builder_supplier_id: supplierId,
          assignment_status: assignFormData.assignment_status,
          notes: assignFormData.notes || null,
        });
      }

      // Close dialog and refresh after all assignments are created
      refetch();
      setIsAssignDialogOpen(false);
      setAssignFormData({
        supplier_ids: [],
        assignment_status: "Assigned",
        notes: "",
      });
    } catch (error) {
      console.error("Failed to assign suppliers:", error);
      alert("Failed to assign some suppliers. Please try again.");
    }
  };

  const handleAddPricing = () => {
    if (!builderId || !selectedAssignment) return;

    createPricingMutation.mutate({
      builder_id: builderId,
      supplier_bid_assignment_guid:
        selectedAssignment.supplier_bid_assignment_guid,
      estimating_db_item_id: pricingFormData.estimating_db_item_id || null,
      item_description: pricingFormData.item_description || null,
      unit_of_measure: pricingFormData.unit_of_measure || null,
      quantity: pricingFormData.quantity,
      unit_cost: pricingFormData.unit_cost,
      markup_percent: pricingFormData.markup_percent,
      unit_price: pricingFormData.unit_price,
      notes: pricingFormData.notes || null,
    });
  };

  const handleSendInvite = (assignment: SupplierBidAssignment) => {
    updateAssignmentMutation.mutate({
      supplier_bid_assignment_guid: assignment.supplier_bid_assignment_guid,
      invite_sent_date: new Date().toISOString(),
      assignment_status: "Sent",
    });
  };

  const handleAwardBid = (assignment: SupplierBidAssignment) => {
    awardBidMutation.mutate({
      assignmentId: assignment.supplier_bid_assignment_guid,
    });
  };

  const assignmentColumns: ColDef<SupplierBidAssignment>[] = [
    {
      headerName: "Supplier",
      field: "supplier_name" as any,
      flex: 2,
      minWidth: 200,
    },
    {
      headerName: "Status",
      field: "assignment_status",
      flex: 1,
      minWidth: 120,
      cellRenderer: (params: any) => {
        const status = params.value || "Assigned";
        const colors: Record<string, string> = {
          Assigned: "bg-gray-100 text-gray-800",
          Sent: "bg-blue-100 text-blue-800",
          Responded: "bg-yellow-100 text-yellow-800",
          Awarded: "bg-green-100 text-green-800",
          Declined: "bg-red-100 text-red-800",
        };
        return (
          <Badge className={colors[status] || "bg-gray-100 text-gray-800"}>
            {status}
          </Badge>
        );
      },
    },
    {
      headerName: "Invite Sent",
      field: "invite_sent_date",
      flex: 1,
      minWidth: 120,
      valueFormatter: (params: any) => {
        try {
          return params.value
            ? format(new Date(params.value), "MM/dd/yyyy")
            : "-";
        } catch (error) {
          return params.value || "-";
        }
      },
    },
    {
      headerName: "Response Date",
      field: "response_date",
      flex: 1,
      minWidth: 120,
      valueFormatter: (params: any) => {
        try {
          return params.value
            ? format(new Date(params.value), "MM/dd/yyyy")
            : "-";
        } catch (error) {
          return params.value || "-";
        }
      },
    },
    {
      headerName: "Awarded",
      field: "awarded",
      flex: 1,
      minWidth: 100,
      cellRenderer: (params: any) => {
        return params.value ? (
          <Badge className="bg-green-100 text-green-800">Yes</Badge>
        ) : (
          <Badge className="bg-gray-100 text-gray-800">No</Badge>
        );
      },
    },
    {
      headerName: "Actions",
      field: "actions" as any,
      flex: 2,
      minWidth: 200,
      cellRenderer: (params: any) => {
        const assignment = params.data;
        return (
          <div className="flex gap-2">
            {!assignment.invite_sent_date && (
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={() => handleSendInvite(assignment)}
              >
                <Send className="mr-1 h-3 w-3" />
                Send
              </Button>
            )}
            {!assignment.awarded && assignment.response_date && (
              <Button
                type="button"
                size="sm"
                variant="outline"
                className="text-green-600"
                onClick={() => handleAwardBid(assignment)}
              >
                <Award className="mr-1 h-3 w-3" />
                Award
              </Button>
            )}
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={() => {
                setSelectedAssignment(assignment);
                setActiveTab("pricing");
              }}
            >
              <DollarSign className="mr-1 h-3 w-3" />
              Pricing
            </Button>
          </div>
        );
      },
    },
  ];

  const pricingColumns: ColDef<SupplierBidPricing>[] = [
    {
      headerName: "Supplier",
      field: "supplier_name" as any,
      flex: 1,
      minWidth: 150,
      cellRenderer: (params: any) => {
        return `${params.data.supplier_name || ""} (${
          params.data.supplier_code || ""
        })`;
      },
    },
    {
      headerName: "Item Description",
      field: "item_description",
      flex: 2,
      minWidth: 200,
    },
    {
      headerName: "UOM",
      field: "unit_of_measure",
      flex: 1,
      minWidth: 80,
    },
    {
      headerName: "Quantity",
      field: "quantity",
      flex: 1,
      minWidth: 100,
      valueFormatter: (params: any) => {
        const value = Number(params.value);
        return isNaN(value) ? "0.00" : value.toFixed(2);
      },
    },
    {
      headerName: "Unit Cost",
      field: "unit_cost",
      flex: 1,
      minWidth: 100,
      valueFormatter: (params: any) => {
        const value = Number(params.value);
        return `$${isNaN(value) ? "0.00" : value.toFixed(2)}`;
      },
    },
    {
      headerName: "Total Cost",
      field: "total_cost",
      flex: 1,
      minWidth: 120,
      valueFormatter: (params: any) => {
        const value = Number(params.value);
        return `$${isNaN(value) ? "0.00" : value.toFixed(2)}`;
      },
    },
    {
      headerName: "Markup %",
      field: "markup_percent",
      flex: 1,
      minWidth: 100,
      valueFormatter: (params: any) => {
        const value = Number(params.value);
        return `${isNaN(value) ? "0.00" : value.toFixed(2)}%`;
      },
    },
    {
      headerName: "Unit Price",
      field: "unit_price",
      flex: 1,
      minWidth: 100,
      valueFormatter: (params: any) => {
        const value = Number(params.value);
        return `$${isNaN(value) ? "0.00" : value.toFixed(2)}`;
      },
    },
    {
      headerName: "Total Price",
      field: "total_price",
      flex: 1,
      minWidth: 120,
      valueFormatter: (params: any) => {
        const value = Number(params.value);
        return `$${isNaN(value) ? "0.00" : value.toFixed(2)}`;
      },
    },
    {
      headerName: "Selected",
      field: "is_selected",
      flex: 1,
      minWidth: 100,
      cellRenderer: (params: any) => {
        return params.value ? (
          <Badge className="bg-green-100 text-green-800">Winner</Badge>
        ) : null;
      },
    },
  ];

  const pricingExcelColumns: ExcelColumn[] = [
    { field: "supplier_name", header: "Supplier Name" },
    { field: "supplier_code", header: "Supplier Code" },
    { field: "item_description", header: "Item Description" },
    { field: "unit_of_measure", header: "UOM" },
    { field: "quantity", header: "Quantity" },
    { field: "unit_cost", header: "Unit Cost" },
    { field: "total_cost", header: "Total Cost" },
    { field: "markup_percent", header: "Markup %" },
    { field: "unit_price", header: "Unit Price" },
    { field: "total_price", header: "Total Price" },
    { field: "notes", header: "Notes" },
    { field: "estimating_db_item_id", header: "Estimating Item ID" },
  ];

  const excelColumns: ExcelColumn[] = [
    { field: "supplier_name", header: "Supplier" },
    { field: "assignment_status", header: "Status" },
    { field: "invite_sent_date", header: "Invite Sent" },
    { field: "response_date", header: "Response Date" },
  ];

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto p-6">
        <Card>
          <CardHeader>
            <CardTitle>Error Loading Bid</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-red-600 mb-4">
              Failed to load bid details: {error.message}
            </p>
            <p className="text-sm text-gray-600 mb-4">Bid ID: {bidId}</p>
            <p className="text-sm text-gray-600 mb-4">
              Builder ID: {builderId}
            </p>
            <div className="flex gap-2">
              <Link href="/supplier-bids">
                <Button variant="outline">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back to Bids
                </Button>
              </Link>
              <Button type="button" onClick={() => refetch()}>
                Retry
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!bidDetails) {
    return (
      <div className="container mx-auto p-6">
        <Card>
          <CardHeader>
            <CardTitle>Bid Not Found</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 mb-4">
              The requested bid could not be found.
            </p>
            <p className="text-sm text-gray-600 mb-4">Bid ID: {bidId}</p>
            <Link href="/supplier-bids">
              <Button>
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Bids
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <>
      <div className="container mx-auto p-6">
        <div className="mb-4">
          <Link
            href="/supplier-bids"
            className="flex items-center text-blue-600 hover:underline"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Bids
          </Link>
        </div>

        <Card className="mb-6">
          <CardHeader>
            <div className="flex justify-between items-start">
              <div>
                <CardTitle className="text-2xl">
                  {bidDetails.bid.bid_description || "Untitled Bid"}
                </CardTitle>
                <div className="mt-2 flex gap-4 text-sm text-gray-600">
                  <span>Bid #: {bidDetails.bid.bid_number || "N/A"}</span>
                  <span>Type: {bidDetails.bid.bid_type || "N/A"}</span>
                  <span>Job: {bidDetails.bid.job_number || "N/A"}</span>
                </div>
              </div>
              <Badge className="text-lg px-3 py-1">
                {bidDetails.bid.bid_status || "Draft"}
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            {bidDetails.bid.due_date && (
              <div className="flex items-center gap-2 text-sm">
                <Calendar className="h-4 w-4" />
                <span>
                  Due:{" "}
                  {format(new Date(bidDetails.bid.due_date), "MMMM dd, yyyy")}
                </span>
              </div>
            )}
            {bidDetails.bid.bid_instructions && (
              <div className="mt-4">
                <h3 className="font-semibold mb-2">Instructions:</h3>
                <p className="text-gray-700 whitespace-pre-wrap">
                  {bidDetails.bid.bid_instructions}
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        <Tabs
          value={activeTab}
          onValueChange={setActiveTab}
          className="space-y-4"
        >
          <TabsList>
            <TabsTrigger value="assignments">Supplier Assignments</TabsTrigger>
            <TabsTrigger value="pricing">Pricing Details</TabsTrigger>
            <TabsTrigger value="cost-integration">Cost Integration</TabsTrigger>
            <TabsTrigger value="attachments">Attachments</TabsTrigger>
          </TabsList>

          <TabsContent value="assignments">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Assigned Suppliers</CardTitle>
                <Button
                  type="button"
                  onClick={() => {
                    setSupplierSearchTerm("");
                    setIsAssignDialogOpen(true);
                  }}
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Assign Supplier
                </Button>
              </CardHeader>
              <CardContent>
                <DataGrid
                  data={bidDetails.assignments || []}
                  loading={isLoading}
                  columnDefs={assignmentColumns}
                  excelColumns={excelColumns}
                  enableEditing={false}
                  fileName="bid-assignments"
                />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="pricing">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>
                  {selectedAssignment
                    ? `Pricing for Supplier`
                    : "Select a supplier to view pricing"}
                </CardTitle>
                {selectedAssignment && (
                  <Button
                    type="button"
                    onClick={() => setIsPricingDialogOpen(true)}
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Add Pricing Item
                  </Button>
                )}
              </CardHeader>
              <CardContent>
                {selectedAssignment ? (
                  <DataGrid
                    data={pricingData || []}
                    loading={false}
                    columnDefs={pricingColumns}
                    excelColumns={pricingExcelColumns}
                    enableEditing={false}
                    rowSelection="multiple"
                    onSelectionChanged={(
                      selectedRows: SupplierBidPricing[]
                    ) => {
                      setSelectedPricingItems(selectedRows);
                    }}
                    fileName="bid-pricing"
                  />
                ) : (
                  <p className="text-gray-500 text-center py-8">
                    Click the "Pricing" button on a supplier assignment to view
                    their pricing details.
                  </p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="cost-integration">
            <Card>
              <CardHeader>
                <CardTitle>Cost Integration</CardTitle>
                <p className="text-sm text-gray-600 mt-1">
                  Convert winning bid pricing to supplier cost history for
                  future estimating
                </p>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <p className="text-gray-500 mb-4">
                    Cost integration functionality available.
                  </p>
                  <p className="text-sm text-gray-400">
                    Select pricing winners and convert them to supplier cost
                    history.
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="attachments">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Attachments</CardTitle>
                <Button type="button">
                  <Plus className="mr-2 h-4 w-4" />
                  Add Attachment
                </Button>
              </CardHeader>
              <CardContent>
                {bidDetails.attachments && bidDetails.attachments.length > 0 ? (
                  <div className="space-y-2">
                    {bidDetails.attachments.map((attachment) => (
                      <div
                        key={attachment.supplier_bid_attachment_id}
                        className="flex items-center justify-between p-3 border rounded"
                      >
                        <div className="flex items-center gap-2">
                          <FileText className="h-4 w-4" />
                          <span>{attachment.attachment_name}</span>
                        </div>
                        <span className="text-sm text-gray-500">
                          {attachment.attached_date &&
                            format(
                              new Date(attachment.attached_date),
                              "MM/dd/yyyy"
                            )}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 text-center py-8">
                    No attachments yet.
                  </p>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* All Dialogs */}
      <Dialog open={isAssignDialogOpen} onOpenChange={setIsAssignDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Assign Supplier to Bid</DialogTitle>
            <DialogDescription>
              Select one or more suppliers to invite for this bid
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div>
              <Label>Search Suppliers</Label>
              <Input
                placeholder="Search by name or code..."
                value={supplierSearchTerm}
                onChange={(e) => setSupplierSearchTerm(e.target.value)}
                className="mb-2"
              />
            </div>
            <div>
              <Label>Suppliers</Label>
              <div className="max-h-60 overflow-y-auto border rounded-md p-2">
                {suppliers
                  .filter((supplier) => {
                    const searchLower = supplierSearchTerm.toLowerCase();
                    return (
                      supplier.supplier_name
                        ?.toLowerCase()
                        .includes(searchLower) ||
                      false ||
                      supplier.supplier_code
                        ?.toLowerCase()
                        .includes(searchLower) ||
                      false
                    );
                  })
                  .map((supplier) => (
                    <div
                      key={supplier.supplier_id}
                      className="flex items-center space-x-2 py-2"
                    >
                      <Checkbox
                        id={supplier.supplier_id}
                        checked={assignFormData.supplier_ids.includes(
                          supplier.supplier_id
                        )}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            setAssignFormData({
                              ...assignFormData,
                              supplier_ids: [
                                ...assignFormData.supplier_ids,
                                supplier.supplier_id,
                              ],
                            });
                          } else {
                            setAssignFormData({
                              ...assignFormData,
                              supplier_ids: assignFormData.supplier_ids.filter(
                                (id) => id !== supplier.supplier_id
                              ),
                            });
                          }
                        }}
                      />
                      <Label
                        htmlFor={supplier.supplier_id}
                        className="flex-1 cursor-pointer"
                      >
                        {supplier.supplier_name} ({supplier.supplier_code})
                      </Label>
                    </div>
                  ))}
              </div>
              <p className="text-sm text-gray-600 mt-2">
                {assignFormData.supplier_ids.length} supplier(s) selected
              </p>
            </div>
            <div>
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                value={assignFormData.notes}
                onChange={(e) =>
                  setAssignFormData({
                    ...assignFormData,
                    notes: e.target.value,
                  })
                }
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setIsAssignDialogOpen(false);
                setSupplierSearchTerm("");
              }}
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={handleAssignSupplier}
              disabled={
                createAssignmentMutation.isPending ||
                assignFormData.supplier_ids.length === 0
              }
            >
              {createAssignmentMutation.isPending && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              Assign {assignFormData.supplier_ids.length} Supplier(s)
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isPricingDialogOpen} onOpenChange={setIsPricingDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Add Pricing Item</DialogTitle>
            <DialogDescription>
              Add a pricing item for supplier
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div>
              <Label htmlFor="estimating_item">
                Estimating Item (Optional)
              </Label>
              <Select
                value={pricingFormData.estimating_db_item_id}
                onValueChange={(value) => {
                  const item = estimatingItems.find(
                    (i) => i.estimating_db_item_id === value
                  );
                  setPricingFormData({
                    ...pricingFormData,
                    estimating_db_item_id: value,
                    item_description: item?.item_description || "",
                    unit_of_measure: item?.unit_of_measure || "",
                  });
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select estimating item" />
                </SelectTrigger>
                <SelectContent>
                  {estimatingItems.map((item) => (
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

            <div>
              <Label htmlFor="item_description">Item Description</Label>
              <Input
                id="item_description"
                value={pricingFormData.item_description}
                onChange={(e) =>
                  setPricingFormData({
                    ...pricingFormData,
                    item_description: e.target.value,
                  })
                }
              />
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label htmlFor="unit_of_measure">Unit of Measure</Label>
                <Input
                  id="unit_of_measure"
                  value={pricingFormData.unit_of_measure}
                  onChange={(e) =>
                    setPricingFormData({
                      ...pricingFormData,
                      unit_of_measure: e.target.value,
                    })
                  }
                />
              </div>
              <div>
                <Label htmlFor="quantity">Quantity</Label>
                <Input
                  id="quantity"
                  type="number"
                  value={pricingFormData.quantity}
                  onChange={(e) =>
                    setPricingFormData({
                      ...pricingFormData,
                      quantity: parseFloat(e.target.value) || 0,
                    })
                  }
                />
              </div>
              <div>
                <Label htmlFor="unit_cost">Unit Cost</Label>
                <Input
                  id="unit_cost"
                  type="number"
                  step="0.01"
                  value={pricingFormData.unit_cost}
                  onChange={(e) =>
                    setPricingFormData({
                      ...pricingFormData,
                      unit_cost: parseFloat(e.target.value) || 0,
                    })
                  }
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="markup_percent">Markup %</Label>
                <Input
                  id="markup_percent"
                  type="number"
                  step="0.01"
                  value={pricingFormData.markup_percent}
                  onChange={(e) => {
                    const markup = parseFloat(e.target.value) || 0;
                    const unitPrice =
                      pricingFormData.unit_cost * (1 + markup / 100);
                    setPricingFormData({
                      ...pricingFormData,
                      markup_percent: markup,
                      unit_price: unitPrice,
                    });
                  }}
                />
              </div>
              <div>
                <Label htmlFor="unit_price">Unit Price</Label>
                <Input
                  id="unit_price"
                  type="number"
                  step="0.01"
                  value={pricingFormData.unit_price}
                  onChange={(e) =>
                    setPricingFormData({
                      ...pricingFormData,
                      unit_price: parseFloat(e.target.value) || 0,
                    })
                  }
                />
              </div>
            </div>

            <div>
              <Label htmlFor="pricing_notes">Notes</Label>
              <Textarea
                id="pricing_notes"
                value={pricingFormData.notes}
                onChange={(e) =>
                  setPricingFormData({
                    ...pricingFormData,
                    notes: e.target.value,
                  })
                }
                rows={2}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsPricingDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={handleAddPricing}
              disabled={createPricingMutation.isPending}
            >
              {createPricingMutation.isPending && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              Add Pricing
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
