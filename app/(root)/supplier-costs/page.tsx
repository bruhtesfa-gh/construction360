"use client";

import React, {
  useState,
  useCallback,
  useRef,
  useMemo,
  useEffect,
} from "react";
import { useSession } from "next-auth/react";
import type { ColDef } from "ag-grid-community";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../../components/ui/card";
import { Button } from "../../../components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "../../../components/ui/dialog";
import { Label } from "../../../components/ui/label";
import { Input } from "../../../components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../../components/ui/select";
import { Textarea } from "../../../components/ui/textarea";
import { Badge } from "../../../components/ui/badge";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "../../../components/ui/tabs";
// Navigation provided by (root)/layout.tsx
import { DataGrid, type ExcelColumn } from "../../../components/grid";
import { api } from "../../providers";
import {
  Loader2,
  Plus,
  TrendingUp,
  History,
  BarChart3,
  DollarSign,
  Calendar,
  Package,
} from "lucide-react";
import { format } from "date-fns";
import type { SupplierCost } from "../../../types/database";

export default function SupplierCostsPage() {
  const { data: session } = useSession();
  const [selectedCosts, setSelectedCosts] = useState<SupplierCost[]>([]);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isTrendsDialogOpen, setIsTrendsDialogOpen] = useState(false);
  const [selectedItemForTrends, setSelectedItemForTrends] =
    useState<string>("");
  const [selectedSupplierForTrends, setSelectedSupplierForTrends] =
    useState<string>("");

  const builderId = session?.user?.builderId;

  const {
    data: costsData,
    isLoading,
    refetch,
  } = api.supplierCosts.getAll.useQuery(
    { builderId: builderId!, limit: 100, offset: 0 },
    { enabled: !!builderId }
  );

  const { data: suppliers = [] } = api.suppliers.getAll.useQuery(
    { builderId: builderId! },
    { enabled: !!builderId }
  );

  const { data: estimatingItems = [] } = api.estimatingDBItems.getAll.useQuery(
    { builderId: builderId! },
    { enabled: !!builderId }
  );

  const { data: regions = [] } = api.regions.getAll.useQuery(
    { builderId: builderId! },
    { enabled: !!builderId }
  );

  const { data: communities = [] } = api.regions.getAllCommunities.useQuery(
    { builderId: builderId! },
    { enabled: !!builderId }
  );

  const [formData, setFormData] = useState({
    builder_supplier_id: "",
    region_id: "",
    community_id: "",
    estimating_db_item_id: "",
    unit_of_measure: "",
    base_cost: 0,
    overhead_percent: 0,
    profit_percent: 0,
    total_cost: 0,
    item_type: "",
    effective_date: new Date().toISOString().split("T")[0],
    notes: "",
  });

  const createCostMutation = api.supplierCosts.create.useMutation({
    onSuccess: () => {
      refetch();
      setIsCreateDialogOpen(false);
      resetForm();
    },
  });

  const { data: trendsData } = api.supplierCosts.getCostTrends.useQuery(
    {
      builderId: builderId!,
      estimatingItemId: selectedItemForTrends,
      supplierId: selectedSupplierForTrends || undefined,
      months: 12,
    },
    { enabled: !!builderId && !!selectedItemForTrends }
  );

  const resetForm = () => {
    setFormData({
      builder_supplier_id: "",
      region_id: "",
      community_id: "",
      estimating_db_item_id: "",
      unit_of_measure: "",
      base_cost: 0,
      overhead_percent: 0,
      profit_percent: 0,
      total_cost: 0,
      item_type: "",
      effective_date: new Date().toISOString().split("T")[0],
      notes: "",
    });
  };

  const handleCreateCost = () => {
    if (!builderId) return;

    createCostMutation.mutate({
      builder_id: builderId,
      ...formData,
      effective_date: new Date(formData.effective_date).toISOString(),
    });
  };

  const calculateTotalCost = (
    baseCost: number,
    overheadPercent: number,
    profitPercent: number
  ) => {
    const overhead = (baseCost * overheadPercent) / 100;
    const profit = ((baseCost + overhead) * profitPercent) / 100;
    return baseCost + overhead + profit;
  };

  const columns: ColDef<SupplierCost>[] = [
    {
      headerName: "Supplier",
      field: "supplier_name" as any,
      flex: 1,
      minWidth: 150,
    },
    {
      headerName: "Item Description",
      field: "item_description" as any,
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
      headerName: "Base Cost",
      field: "base_cost",
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
      minWidth: 100,
      valueFormatter: (params: any) => {
        const value = Number(params.value);
        return `$${isNaN(value) ? "0.00" : value.toFixed(2)}`;
      },
    },
    {
      headerName: "Type",
      field: "item_type",
      flex: 1,
      minWidth: 100,
      cellRenderer: (params: any) => {
        const type = params.value;
        const colors: Record<string, string> = {
          "Bid Winner": "bg-green-100 text-green-800",
          "Manual Entry": "bg-blue-100 text-blue-800",
          Historical: "bg-gray-100 text-gray-800",
        };
        return type ? (
          <Badge className={colors[type] || "bg-gray-100 text-gray-800"}>
            {type}
          </Badge>
        ) : null;
      },
    },
    {
      headerName: "Effective Date",
      field: "effective_date",
      flex: 1,
      minWidth: 120,
      valueFormatter: (params: any) => {
        return params.value ? format(new Date(params.value), "MM/dd/yyyy") : "";
      },
    },
    {
      headerName: "Actions",
      field: "actions" as any,
      flex: 1,
      minWidth: 120,
      cellRenderer: (params: any) => {
        const cost = params.data;
        return (
          <div className="flex gap-1">
            <Button
              size="sm"
              variant="ghost"
              onClick={() => {
                setSelectedItemForTrends(cost.estimating_db_item_id || "");
                setSelectedSupplierForTrends(cost.builder_supplier_id);
                setIsTrendsDialogOpen(true);
              }}
            >
              <TrendingUp className="h-3 w-3" />
            </Button>
          </div>
        );
      },
    },
  ];

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <>
      <div className="container mx-auto p-6">
        <div className="space-y-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="h-5 w-5" />
                Supplier Cost History
              </CardTitle>
              <div className="flex gap-2">
                <Button onClick={() => setIsTrendsDialogOpen(true)}>
                  <TrendingUp className="mr-2 h-4 w-4" />
                  View Trends
                </Button>
                <Button onClick={() => setIsCreateDialogOpen(true)}>
                  <Plus className="mr-2 h-4 w-4" />
                  Add Cost Entry
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="mb-4 grid grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">
                    {costsData?.total || 0}
                  </div>
                  <div className="text-sm text-gray-600">Total Entries</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">
                    {costsData?.costs.filter(
                      (c) => c.item_type === "Bid Winner"
                    ).length || 0}
                  </div>
                  <div className="text-sm text-gray-600">From Bids</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600">
                    {new Set(costsData?.costs.map((c) => c.builder_supplier_id))
                      .size || 0}
                  </div>
                  <div className="text-sm text-gray-600">Suppliers</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-orange-600">
                    {new Set(
                      costsData?.costs.map((c) => c.estimating_db_item_id)
                    ).size || 0}
                  </div>
                  <div className="text-sm text-gray-600">Items</div>
                </div>
              </div>

              <DataGrid
                data={costsData?.costs || []}
                loading={isLoading}
                columnDefs={columns as any}
                excelColumns={[]}
                enableEditing={false}
                rowSelection="multiple"
                onSelectionChanged={(selectedRows: SupplierCost[]) => {
                  setSelectedCosts(selectedRows);
                }}
                fileName="supplier-costs"
              />
            </CardContent>
          </Card>
        </div>
      </div>

      {/* All Dialogs - Rendered at the end for proper modal behavior */}
      {/* Create Cost Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Add New Cost Entry</DialogTitle>
            <DialogDescription>
              Create a new supplier cost entry for tracking pricing history
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="supplier">Supplier</Label>
                <Select
                  value={formData.builder_supplier_id}
                  onValueChange={(value) =>
                    setFormData({ ...formData, builder_supplier_id: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select supplier" />
                  </SelectTrigger>
                  <SelectContent>
                    {suppliers.map((supplier) => (
                      <SelectItem
                        key={supplier.supplier_id}
                        value={supplier.supplier_id}
                      >
                        {supplier.supplier_name} ({supplier.supplier_code})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="estimating_item">Estimating Item</Label>
                <Select
                  value={formData.estimating_db_item_id}
                  onValueChange={(value) => {
                    const item = estimatingItems.find(
                      (i) => i.estimating_db_item_id === value
                    );
                    setFormData({
                      ...formData,
                      estimating_db_item_id: value,
                      unit_of_measure: item?.unit_of_measure || "",
                    });
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select item" />
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
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="region">Region</Label>
                <Select
                  value={formData.region_id}
                  onValueChange={(value) =>
                    setFormData({ ...formData, region_id: value })
                  }
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
                        {region.description || region.region_code}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="community">Community</Label>
                <Select
                  value={formData.community_id}
                  onValueChange={(value) =>
                    setFormData({ ...formData, community_id: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select community" />
                  </SelectTrigger>
                  <SelectContent>
                    {communities
                      .filter(
                        (c: any) =>
                          !formData.region_id ||
                          c.region_id === formData.region_id
                      )
                      .map((community: any) => (
                        <SelectItem
                          key={community.community_id}
                          value={community.community_id}
                        >
                          {community.community_name || community.description}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label htmlFor="base_cost">Base Cost</Label>
                <Input
                  id="base_cost"
                  type="number"
                  step="0.01"
                  value={formData.base_cost}
                  onChange={(e) => {
                    const baseCost = parseFloat(e.target.value) || 0;
                    const totalCost = calculateTotalCost(
                      baseCost,
                      formData.overhead_percent,
                      formData.profit_percent
                    );
                    setFormData({
                      ...formData,
                      base_cost: baseCost,
                      total_cost: totalCost,
                    });
                  }}
                />
              </div>
              <div>
                <Label htmlFor="overhead_percent">Overhead %</Label>
                <Input
                  id="overhead_percent"
                  type="number"
                  step="0.01"
                  value={formData.overhead_percent}
                  onChange={(e) => {
                    const overheadPercent = parseFloat(e.target.value) || 0;
                    const totalCost = calculateTotalCost(
                      formData.base_cost,
                      overheadPercent,
                      formData.profit_percent
                    );
                    setFormData({
                      ...formData,
                      overhead_percent: overheadPercent,
                      total_cost: totalCost,
                    });
                  }}
                />
              </div>
              <div>
                <Label htmlFor="profit_percent">Profit %</Label>
                <Input
                  id="profit_percent"
                  type="number"
                  step="0.01"
                  value={formData.profit_percent}
                  onChange={(e) => {
                    const profitPercent = parseFloat(e.target.value) || 0;
                    const totalCost = calculateTotalCost(
                      formData.base_cost,
                      formData.overhead_percent,
                      profitPercent
                    );
                    setFormData({
                      ...formData,
                      profit_percent: profitPercent,
                      total_cost: totalCost,
                    });
                  }}
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label htmlFor="total_cost">Total Cost</Label>
                <Input
                  id="total_cost"
                  type="number"
                  step="0.01"
                  value={formData.total_cost}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      total_cost: parseFloat(e.target.value) || 0,
                    })
                  }
                />
              </div>
              <div>
                <Label htmlFor="effective_date">Effective Date</Label>
                <Input
                  id="effective_date"
                  type="date"
                  value={formData.effective_date}
                  onChange={(e) =>
                    setFormData({ ...formData, effective_date: e.target.value })
                  }
                />
              </div>
              <div>
                <Label htmlFor="item_type">Item Type</Label>
                <Select
                  value={formData.item_type}
                  onValueChange={(value) =>
                    setFormData({ ...formData, item_type: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Manual Entry">Manual Entry</SelectItem>
                    <SelectItem value="Historical">Historical</SelectItem>
                    <SelectItem value="Bid Winner">Bid Winner</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                value={formData.notes}
                onChange={(e) =>
                  setFormData({ ...formData, notes: e.target.value })
                }
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsCreateDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={handleCreateCost}
              disabled={createCostMutation.isPending}
            >
              {createCostMutation.isPending && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              Create Cost Entry
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Trends Dialog */}
      <Dialog open={isTrendsDialogOpen} onOpenChange={setIsTrendsDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Cost Trends</DialogTitle>
            <DialogDescription>
              Historical cost trends for the selected item and supplier
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            {trendsData && (
              <div className="space-y-4">
                <div className="grid grid-cols-4 gap-4 p-4 bg-gray-50 rounded-lg">
                  <div className="text-center">
                    <div className="text-lg font-bold text-blue-600">
                      {trendsData.statistics.count}
                    </div>
                    <div className="text-sm text-gray-600">Data Points</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-bold text-green-600">
                      ${(trendsData.statistics.averageCost || 0).toFixed(2)}
                    </div>
                    <div className="text-sm text-gray-600">Average Cost</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-bold text-red-600">
                      ${(trendsData.statistics.minCost || 0).toFixed(2)}
                    </div>
                    <div className="text-sm text-gray-600">Min Cost</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-bold text-purple-600">
                      ${(trendsData.statistics.maxCost || 0).toFixed(2)}
                    </div>
                    <div className="text-sm text-gray-600">Max Cost</div>
                  </div>
                </div>

                <div className="max-h-96 overflow-y-auto space-y-2">
                  {trendsData.trends.map((trend) => (
                    <div
                      key={trend.supplier_cost_id}
                      className="flex items-center justify-between p-3 bg-white border rounded-lg"
                    >
                      <div className="flex items-center gap-4">
                        <div className="text-sm text-gray-500">
                          {format(
                            new Date(trend.effective_date!),
                            "MM/dd/yyyy"
                          )}
                        </div>
                        <div className="font-medium">{trend.supplier_name}</div>
                        <Badge variant="outline">{trend.item_type}</Badge>
                      </div>
                      <div className="text-lg font-bold">
                        ${(Number(trend.total_cost) || 0).toFixed(2)}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button onClick={() => setIsTrendsDialogOpen(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
