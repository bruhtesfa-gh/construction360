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
import { Textarea } from "../../../components/ui/textarea";
// import { Switch } from '@/components/ui/switch';
import { Plus, Edit, Trash2, Package } from "lucide-react";
import { ActionsCellRenderer } from "../../../components/grid/ActionsCellRenderer";
import { api } from "../../providers";
import { useTimezone } from "../../../lib/timezone-context";

import type { Option as DbOption } from "../../../types/database";

// Use database type directly
type Option = DbOption;

const currencyFormatter = (params: any) => {
  if (params.value == null) return "";
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(params.value);
};

// Custom cell renderer for boolean values
const BooleanCellRenderer = (params: any) => {
  const value = params.value;
  return value ? (
    <Badge className="bg-green-100 text-green-800">Yes</Badge>
  ) : (
    <Badge className="bg-gray-100 text-gray-800">No</Badge>
  );
};

// Custom cell renderer for active status
const ActiveCellRenderer = (params: any) => {
  const value = params.value;
  return (
    <Badge
      className={
        !value ? "bg-blue-100 text-blue-800" : "bg-gray-100 text-gray-800"
      }
    >
      {!value ? "Active" : "Inactive"}
    </Badge>
  );
};

// Excel column definitions
const excelColumns: ExcelColumn[] = [
  { field: "option_code", header: "Option Code *", required: true },
  { field: "series", header: "Series *", required: true },
  { field: "region_code", header: "Region Code *", required: true },
  { field: "community_code", header: "Community Code *", required: true },
  { field: "community_phase_id", header: "Phase ID *", required: true },
  { field: "floor_plan_code", header: "Floor Plan Code *", required: true },
  { field: "elevation_code", header: "Elevation Code *", required: true },
  { field: "category_code", header: "Category Code *", required: true },
  { field: "sub_category_code", header: "Sub-Category Code *", required: true },
  { field: "description", header: "Description *", required: true },
  { field: "unit_of_measure", header: "Unit of Measure" },
  { field: "price", header: "Price", type: "number" },
  { field: "cost", header: "Cost", type: "number" },
  {
    field: "is_included_option",
    header: "Included Option",
    type: "boolean",
    defaultValue: false,
  },
  {
    field: "design_center_use_only",
    header: "Design Center Only",
    type: "boolean",
    defaultValue: false,
  },
  { field: "product_number", header: "Product Number" },
  { field: "product_name", header: "Product Name" },
  { field: "product_brand", header: "Product Brand" },
  { field: "product_manufacturer", header: "Product Manufacturer" },
  { field: "color", header: "Color" },
  { field: "style", header: "Style" },
  { field: "finish", header: "Finish" },
  { field: "location", header: "Location" },
  { field: "comments", header: "Comments" },
  { field: "internal_notes", header: "Internal Notes" },
  { field: "warranty_info", header: "Warranty Info" },
  {
    field: "inactive",
    header: "Inactive",
    type: "boolean",
    defaultValue: false,
  },
];

export default function OptionsPage() {
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
  const [editingOption, setEditingOption] = useState<Option | null>(null);
  const [selectedCommunity, setSelectedCommunity] = useState<string>("");
  const [formData, setFormData] = useState({
    region_id: "",
    community_id: "",
    community_phase_id: "",
    floor_plan_code: "",
    elevation_code: "",
    option_code: "",
    series: "",
    category_code: "",
    sub_category_code: "",
    description: "",
    unit_of_measure: "",
    price: "",
    cost: "",
    comments: "",
    internal_notes: "",
    product_number: "",
    product_name: "",
    product_brand: "",
    product_manufacturer: "",
    is_included_option: false,
    design_center_use_only: false,
    color: "",
    style: "",
    finish: "",
    location: "",
    warranty_info: "",
    inactive: false,
  });

  // Delete confirmation state
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [optionToDelete, setOptionToDelete] = useState<Option | null>(null);

  // Get tRPC utils for cache invalidation
  const utils = api.useUtils();

  // Fetch options data
  const { data: options = [], isLoading } = api.options.getByCommunity.useQuery(
    {
      builderId: builderId!,
      communityId: selectedCommunity,
    },
    {
      enabled: !!builderId && !!selectedCommunity,
    }
  );

  // Fetch communities for dropdown
  const { data: communities = [] } = api.builders.getCommunities.useQuery(
    {
      builderId: builderId!,
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

  // Create option mutation
  const createOptionMutation = api.options.create.useMutation({
    onSuccess: () => {
      utils.options.getByCommunity.invalidate();
      setIsModalOpen(false);
      resetForm();
    },
    onError: (error) => {
      console.error("Failed to create option:", error);
    },
  });

  // Update option mutation
  const updateOptionMutation = api.options.update.useMutation({
    onSuccess: () => {
      utils.options.getByCommunity.invalidate();
      setIsModalOpen(false);
      setEditingOption(null);
    },
    onError: (error) => {
      console.error("Failed to update option:", error);
    },
  });

  // Delete option mutation
  const deleteOptionMutation = api.options.delete.useMutation({
    onSuccess: () => {
      utils.options.getByCommunity.invalidate();
      setDeleteConfirmOpen(false);
      setOptionToDelete(null);
    },
    onError: (error) => {
      console.error("Failed to delete option:", error);
    },
  });

  const resetForm = () => {
    setFormData({
      region_id: "",
      community_id: "",
      community_phase_id: "",
      floor_plan_code: "",
      elevation_code: "",
      option_code: "",
      series: "",
      category_code: "",
      sub_category_code: "",
      description: "",
      unit_of_measure: "",
      price: "",
      cost: "",
      comments: "",
      internal_notes: "",
      product_number: "",
      product_name: "",
      product_brand: "",
      product_manufacturer: "",
      is_included_option: false,
      design_center_use_only: false,
      color: "",
      style: "",
      finish: "",
      location: "",
      warranty_info: "",
      inactive: false,
    });
  };

  // Handle create new option
  const handleCreateOption = useCallback(() => {
    if (!selectedCommunity) {
      alert("Please select a community first");
      return;
    }
    const selectedComm = communities.find(
      (c) => c.community_id === selectedCommunity
    );
    if (selectedComm) {
      setFormData((prev) => ({
        ...prev,
        region_id: selectedComm.region_id,
        community_id: selectedCommunity,
      }));
    }
    setEditingOption(null);
    setIsModalOpen(true);
  }, [selectedCommunity, communities]);

  // Handle edit option
  const handleEditOption = useCallback((option: Option) => {
    setEditingOption(option);
    setFormData({
      region_id: option.region_id || "",
      community_id: option.community_id || "",
      community_phase_id: option.community_phase_id || "",
      floor_plan_code: option.floor_plan_code || "",
      elevation_code: option.elevation_code || "",
      option_code: option.option_code || "",
      series: option.series || "",
      category_code: option.category_code || "",
      sub_category_code: option.sub_category_code || "",
      description: option.description || "",
      unit_of_measure: option.unit_of_measure || "",
      price: option.price?.toString() || "",
      cost: option.cost?.toString() || "",
      comments: option.comments || "",
      internal_notes: option.internal_notes || "",
      product_number: option.product_number || "",
      product_name: option.product_name || "",
      product_brand: option.product_brand || "",
      product_manufacturer: option.product_manufacturer || "",
      is_included_option: option.is_included_option || false,
      design_center_use_only: option.design_center_use_only || false,
      color: option.color || "",
      style: option.style || "",
      finish: option.finish || "",
      location: option.location || "",
      warranty_info: option.warranty_info || "",
      inactive: option.inactive || false,
    });
    setIsModalOpen(true);
  }, []);

  // Handle delete option
  const handleDeleteOption = useCallback((option: Option) => {
    setOptionToDelete(option);
    setDeleteConfirmOpen(true);
  }, []);

  // Confirm delete option
  const confirmDeleteOption = useCallback(() => {
    if (!optionToDelete || !builderId) return;

    deleteOptionMutation.mutate({
      builderId: builderId,
      optionId: optionToDelete.option_id,
    });
  }, [optionToDelete, builderId, deleteOptionMutation]);

  // Handle form submit
  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();

      if (!builderId || !session?.user?.id) {
        console.error("Missing required data for API call");
        return;
      }

      if (editingOption) {
        // Update existing option
        updateOptionMutation.mutate({
          builderId: builderId,
          optionId: editingOption.option_id,
          description: formData.description || undefined,
          unitOfMeasure: formData.unit_of_measure || undefined,
          price: formData.price ? parseFloat(formData.price) : undefined,
          cost: formData.cost ? parseFloat(formData.cost) : undefined,
          comments: formData.comments || undefined,
          internalNotes: formData.internal_notes || undefined,
          productNumber: formData.product_number || undefined,
          productName: formData.product_name || undefined,
          productBrand: formData.product_brand || undefined,
          productManufacturer: formData.product_manufacturer || undefined,
          isIncludedOption: formData.is_included_option,
          designCenterUseOnly: formData.design_center_use_only,
          color: formData.color || undefined,
          style: formData.style || undefined,
          finish: formData.finish || undefined,
          location: formData.location || undefined,
          warrantyInfo: formData.warranty_info || undefined,
          inactive: formData.inactive,
          modifiedBy: session.user.id,
        });
      } else {
        // Create new option
        createOptionMutation.mutate({
          builderId: builderId,
          regionId: formData.region_id,
          communityId: formData.community_id,
          communityPhaseId: formData.community_phase_id || null,
          floorPlanCode: formData.floor_plan_code,
          elevationCode: formData.elevation_code,
          optionCode: formData.option_code,
          series: formData.series,
          categoryCode: formData.category_code,
          subcategoryCode: formData.sub_category_code,
          description: formData.description,
          unitOfMeasure: formData.unit_of_measure || undefined,
          price: formData.price ? parseFloat(formData.price) : undefined,
          cost: formData.cost ? parseFloat(formData.cost) : undefined,
          comments: formData.comments || undefined,
          internalNotes: formData.internal_notes || undefined,
          productNumber: formData.product_number || undefined,
          productName: formData.product_name || undefined,
          productBrand: formData.product_brand || undefined,
          productManufacturer: formData.product_manufacturer || undefined,
          isIncludedOption: formData.is_included_option,
          designCenterUseOnly: formData.design_center_use_only,
          color: formData.color || undefined,
          style: formData.style || undefined,
          finish: formData.finish || undefined,
          location: formData.location || undefined,
          warrantyInfo: formData.warranty_info || undefined,
          createdBy: session.user.id,
          modifiedBy: session.user.id,
        });
      }
    },
    [
      formData,
      editingOption,
      builderId,
      session?.user?.id,
      createOptionMutation,
      updateOptionMutation,
    ]
  );

  // Handle form input changes
  const handleInputChange = useCallback(
    (field: string, value: string | boolean) => {
      setFormData((prev) => ({ ...prev, [field]: value }));
    },
    []
  );

  // Handle import from DataGrid
  const handleImport = useCallback(
    async (importData: any[]) => {
      if (!builderId || !session?.user?.id || !selectedCommunity) return;

      for (const row of importData) {
        // Find region by code
        const region = regions.find((r) => r.region_code === row.region_code);
        if (!region) continue;

        // Find community by code
        const community = communities.find(
          (c) => c.community_code === row.community_code
        );
        if (!community) continue;

        await createOptionMutation.mutateAsync({
          builderId: builderId,
          regionId: region.region_id,
          communityId: community.community_id,
          communityPhaseId: row.community_phase_id || null,
          floorPlanCode: row.floor_plan_code,
          elevationCode: row.elevation_code,
          optionCode: row.option_code,
          series: row.series,
          categoryCode: row.category_code,
          subcategoryCode: row.sub_category_code,
          description: row.description,
          unitOfMeasure: row.unit_of_measure || undefined,
          price: row.price || undefined,
          cost: row.cost || undefined,
          comments: row.comments || undefined,
          internalNotes: row.internal_notes || undefined,
          productNumber: row.product_number || undefined,
          productName: row.product_name || undefined,
          productBrand: row.product_brand || undefined,
          productManufacturer: row.product_manufacturer || undefined,
          isIncludedOption: row.is_included_option || false,
          designCenterUseOnly: row.design_center_use_only || false,
          color: row.color || undefined,
          style: row.style || undefined,
          finish: row.finish || undefined,
          location: row.location || undefined,
          warrantyInfo: row.warranty_info || undefined,
          createdBy: session.user.id,
          modifiedBy: session.user.id,
        });
      }

      // Refresh data
      utils.options.getByCommunity.invalidate();
    },
    [
      builderId,
      session?.user?.id,
      selectedCommunity,
      createOptionMutation,
      utils,
      regions,
      communities,
    ]
  );

  // AG Grid column definitions
  const columnDefs: ColDef[] = useMemo(
    () => [
      {
        headerName: "Option Code",
        field: "option_code",
        sortable: true,
        filter: true,
        flex: 1,
        minWidth: 120,
        pinned: "left",
      },
      {
        headerName: "Description",
        field: "description",
        sortable: true,
        filter: true,
        flex: 2.5,
        minWidth: 250,
      },
      {
        headerName: "Category",
        field: "category_code",
        sortable: true,
        filter: true,
        flex: 1,
        minWidth: 100,
      },
      {
        headerName: "Sub-Category",
        field: "sub_category_code",
        sortable: true,
        filter: true,
        flex: 1,
        minWidth: 120,
      },
      {
        headerName: "Floor Plan",
        field: "floor_plan_code",
        sortable: true,
        filter: true,
        flex: 1,
        minWidth: 100,
      },
      {
        headerName: "Elevation",
        field: "elevation_code",
        sortable: true,
        filter: true,
        flex: 1,
        minWidth: 100,
      },
      {
        headerName: "Price",
        field: "price",
        sortable: true,
        filter: "agNumberColumnFilter",
        flex: 1,
        minWidth: 100,
        valueFormatter: currencyFormatter,
      },
      {
        headerName: "Cost",
        field: "cost",
        sortable: true,
        filter: "agNumberColumnFilter",
        flex: 1,
        minWidth: 100,
        valueFormatter: currencyFormatter,
      },
      {
        headerName: "Unit",
        field: "unit_of_measure",
        sortable: true,
        filter: true,
        flex: 0.8,
        minWidth: 80,
      },
      {
        headerName: "Included",
        field: "is_included_option",
        sortable: true,
        filter: true,
        flex: 0.8,
        minWidth: 90,
        cellRenderer: BooleanCellRenderer,
      },
      {
        headerName: "DC Only",
        field: "design_center_use_only",
        sortable: true,
        filter: true,
        flex: 0.8,
        minWidth: 90,
        cellRenderer: BooleanCellRenderer,
      },
      {
        headerName: "Status",
        field: "inactive",
        sortable: true,
        filter: true,
        flex: 0.8,
        minWidth: 90,
        cellRenderer: ActiveCellRenderer,
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
          onEdit: handleEditOption,
          onDelete: handleDeleteOption,
        },
      },
    ],
    [handleEditOption, handleDeleteOption]
  );

  // Show loading while checking authentication
  if (status === "loading") {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground text-lg">Loading options...</p>
        </div>
      </div>
    );
  }

  // Show loading while fetching data
  if (builderId && selectedCommunity && isLoading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold">Options Catalog</h1>
            <p className="text-muted-foreground">
              Manage home options and upgrades
            </p>
          </div>
        </div>
        <Card>
          <CardHeader>
            <CardTitle>Options</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-center h-64">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                <p className="text-muted-foreground">Loading options data...</p>
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
              <Package className="h-8 w-8" />
              Options
            </h1>
            <p className="text-muted-foreground">
              Manage home options and upgrades
            </p>
          </div>
          <Button
            onClick={handleCreateOption}
            className="flex items-center gap-2"
            disabled={!selectedCommunity}
          >
            <Plus className="h-4 w-4" />
            Add New Option
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Options</span>
              {selectedCommunity && (
                <Badge variant="secondary">
                  {options.length} {options.length === 1 ? "option" : "options"}
                </Badge>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="mb-4 space-y-4">
              <div className="flex items-center gap-4">
                <div className="w-80">
                  <Label htmlFor="community-select">Select Community</Label>
                  <Select
                    value={selectedCommunity}
                    onValueChange={setSelectedCommunity}
                  >
                    <SelectTrigger id="community-select">
                      <SelectValue placeholder="Choose a community to view options" />
                    </SelectTrigger>
                    <SelectContent>
                      {communities.map((community) => (
                        <SelectItem
                          key={community.community_id}
                          value={community.community_id}
                        >
                          {community.community_code} - {community.description}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            {selectedCommunity ? (
              <DataGrid
                data={options}
                loading={isLoading}
                columnDefs={columnDefs}
                excelColumns={excelColumns}
                onImport={handleImport}
                fileName="options"
                importTitle="Import Options"
              />
            ) : (
              <div className="flex items-center justify-center h-64 text-muted-foreground">
                <p>Please select a community to view options</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Option Modal */}
        <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
          <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingOption ? "Edit Option" : "Create New Option"}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit}>
              <div className="grid gap-4 py-4">
                {!editingOption && (
                  <>
                    <div className="grid grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="option_code">Option Code *</Label>
                        <Input
                          id="option_code"
                          value={formData.option_code}
                          onChange={(e) =>
                            handleInputChange("option_code", e.target.value)
                          }
                          placeholder="Option code"
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="series">Series *</Label>
                        <Input
                          id="series"
                          value={formData.series}
                          onChange={(e) =>
                            handleInputChange("series", e.target.value)
                          }
                          placeholder="Series"
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="community_phase_id">
                          Phase ID (Optional)
                        </Label>
                        <Input
                          id="community_phase_id"
                          value={formData.community_phase_id}
                          onChange={(e) =>
                            handleInputChange(
                              "community_phase_id",
                              e.target.value
                            )
                          }
                          placeholder="Leave empty if not using phases"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="floor_plan_code">
                          Floor Plan Code *
                        </Label>
                        <Input
                          id="floor_plan_code"
                          value={formData.floor_plan_code}
                          onChange={(e) =>
                            handleInputChange("floor_plan_code", e.target.value)
                          }
                          placeholder="Floor plan code"
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="elevation_code">Elevation Code *</Label>
                        <Input
                          id="elevation_code"
                          value={formData.elevation_code}
                          onChange={(e) =>
                            handleInputChange("elevation_code", e.target.value)
                          }
                          placeholder="Elevation code"
                          required
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="category_code">Category Code *</Label>
                        <Input
                          id="category_code"
                          value={formData.category_code}
                          onChange={(e) =>
                            handleInputChange("category_code", e.target.value)
                          }
                          placeholder="Category code"
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="sub_category_code">
                          Sub-Category Code *
                        </Label>
                        <Input
                          id="sub_category_code"
                          value={formData.sub_category_code}
                          onChange={(e) =>
                            handleInputChange(
                              "sub_category_code",
                              e.target.value
                            )
                          }
                          placeholder="Sub-category code"
                          required
                        />
                      </div>
                    </div>
                  </>
                )}

                <div className="space-y-2">
                  <Label htmlFor="description">Description *</Label>
                  <Input
                    id="description"
                    value={formData.description}
                    onChange={(e) =>
                      handleInputChange("description", e.target.value)
                    }
                    placeholder="Option description"
                    required
                  />
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="price">Price</Label>
                    <Input
                      id="price"
                      type="number"
                      step="0.01"
                      value={formData.price}
                      onChange={(e) =>
                        handleInputChange("price", e.target.value)
                      }
                      placeholder="0.00"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="cost">Cost</Label>
                    <Input
                      id="cost"
                      type="number"
                      step="0.01"
                      value={formData.cost}
                      onChange={(e) =>
                        handleInputChange("cost", e.target.value)
                      }
                      placeholder="0.00"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="unit_of_measure">Unit of Measure</Label>
                    <Input
                      id="unit_of_measure"
                      value={formData.unit_of_measure}
                      onChange={(e) =>
                        handleInputChange("unit_of_measure", e.target.value)
                      }
                      placeholder="e.g., EA, SF, LF"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="product_number">Product Number</Label>
                    <Input
                      id="product_number"
                      value={formData.product_number}
                      onChange={(e) =>
                        handleInputChange("product_number", e.target.value)
                      }
                      placeholder="Product number"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="product_name">Product Name</Label>
                    <Input
                      id="product_name"
                      value={formData.product_name}
                      onChange={(e) =>
                        handleInputChange("product_name", e.target.value)
                      }
                      placeholder="Product name"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="product_brand">Product Brand</Label>
                    <Input
                      id="product_brand"
                      value={formData.product_brand}
                      onChange={(e) =>
                        handleInputChange("product_brand", e.target.value)
                      }
                      placeholder="Brand"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="product_manufacturer">
                      Product Manufacturer
                    </Label>
                    <Input
                      id="product_manufacturer"
                      value={formData.product_manufacturer}
                      onChange={(e) =>
                        handleInputChange(
                          "product_manufacturer",
                          e.target.value
                        )
                      }
                      placeholder="Manufacturer"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="color">Color</Label>
                    <Input
                      id="color"
                      value={formData.color}
                      onChange={(e) =>
                        handleInputChange("color", e.target.value)
                      }
                      placeholder="Color"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="style">Style</Label>
                    <Input
                      id="style"
                      value={formData.style}
                      onChange={(e) =>
                        handleInputChange("style", e.target.value)
                      }
                      placeholder="Style"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="finish">Finish</Label>
                    <Input
                      id="finish"
                      value={formData.finish}
                      onChange={(e) =>
                        handleInputChange("finish", e.target.value)
                      }
                      placeholder="Finish"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="location">Location</Label>
                  <Input
                    id="location"
                    value={formData.location}
                    onChange={(e) =>
                      handleInputChange("location", e.target.value)
                    }
                    placeholder="Where this option is located"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="comments">Comments</Label>
                  <Textarea
                    id="comments"
                    value={formData.comments}
                    onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                      handleInputChange("comments", e.target.value)
                    }
                    placeholder="Customer-facing comments"
                    rows={2}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="internal_notes">Internal Notes</Label>
                  <Textarea
                    id="internal_notes"
                    value={formData.internal_notes}
                    onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                      handleInputChange("internal_notes", e.target.value)
                    }
                    placeholder="Internal notes (not visible to customers)"
                    rows={2}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="warranty_info">Warranty Information</Label>
                  <Textarea
                    id="warranty_info"
                    value={formData.warranty_info}
                    onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                      handleInputChange("warranty_info", e.target.value)
                    }
                    placeholder="Warranty details"
                    rows={2}
                  />
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="is_included_option"
                      checked={formData.is_included_option}
                      onChange={(e) =>
                        handleInputChange(
                          "is_included_option",
                          e.target.checked
                        )
                      }
                      className="h-4 w-4 rounded border-input"
                    />
                    <Label htmlFor="is_included_option">Included Option</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="design_center_use_only"
                      checked={formData.design_center_use_only}
                      onChange={(e) =>
                        handleInputChange(
                          "design_center_use_only",
                          e.target.checked
                        )
                      }
                      className="h-4 w-4 rounded border-input"
                    />
                    <Label htmlFor="design_center_use_only">
                      Design Center Only
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="inactive"
                      checked={formData.inactive}
                      onChange={(e) =>
                        handleInputChange("inactive", e.target.checked)
                      }
                      className="h-4 w-4 rounded border-input"
                    />
                    <Label htmlFor="inactive">Inactive</Label>
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
                    createOptionMutation.isPending ||
                    updateOptionMutation.isPending
                  }
                >
                  {createOptionMutation.isPending ||
                  updateOptionMutation.isPending
                    ? editingOption
                      ? "Updating..."
                      : "Creating..."
                    : editingOption
                    ? "Update Option"
                    : "Create Option"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation Dialog */}
        <Dialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Delete Option</DialogTitle>
            </DialogHeader>
            <div className="py-4">
              <p className="text-muted-foreground">
                Are you sure you want to delete option &ldquo;
                {optionToDelete?.option_code}&rdquo;?
              </p>
              <p className="text-muted-foreground text-sm mt-2">
                This will mark the option as deleted. It will no longer appear
                in lists.
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
                onClick={confirmDeleteOption}
                disabled={deleteOptionMutation.isPending}
              >
                {deleteOptionMutation.isPending
                  ? "Deleting..."
                  : "Delete Option"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
