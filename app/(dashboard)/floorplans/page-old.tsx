"use client";

import { useEffect, useCallback, useMemo, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { AgGridReact, ColDef } from "../../../core/grid/ag-grid-config";
import "ag-grid-community/styles/ag-grid.min.css";
import "ag-grid-community/styles/ag-theme-alpine.css";

import { Navigation } from "../../../components/layout/Navigation";
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
import {
  Plus,
  Edit,
  Trash2,
  Download,
  Upload,
  Home,
  Columns,
  Filter,
  Search,
  FileSpreadsheet,
} from "lucide-react";
import { api } from "../../providers";
import { useTimezone } from "../../../lib/timezone-context";
import {
  downloadExcelTemplate,
  exportToExcel,
  parseExcelFile,
  validateImportData,
  mapImportData,
  type ExcelColumn,
} from "../../../lib/excel-utils";

interface FloorPlan {
  floor_plan_id: string;
  region_id: string;
  community_id: string;
  builder_id: string;
  community_phase_id: string;
  version_number: number;
  series: string;
  floor_plan_assembly_id: string | null;
  description: string | null;
  comments: string | null;
  floor_plan_orientation: string | null;
  num_of_beds: number | null;
  num_of_baths: number | null;
  num_of_garages: number | null;
  main_floor_size: number | null;
  lower_level_size: number | null;
  second_level_size: number | null;
  third_level_size: number | null;
  garage_size: number | null;
  total_size: number | null;
  inactive: boolean;
  inactive_date: Date | null;
  selling_price: number | null;
  cost: number | null;
  style: string | null;
  is_deleted: boolean;
  internal_notes: string | null;
  floor_plan_code: string;
  elevation_code: string;
  elevation_id: string;
  created_at: Date;
  updated_at: Date;
  community_name?: string;
  community_code?: string;
}

// Custom cell renderer for actions
const ActionsCellRenderer = ({
  data,
  onEdit,
  onDelete,
}: {
  data: FloorPlan;
  onEdit: (floorPlan: FloorPlan) => void;
  onDelete: (floorPlan: FloorPlan) => void;
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

export default function FloorPlansPage() {
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
  const [editingFloorPlan, setEditingFloorPlan] = useState<FloorPlan | null>(
    null
  );
  const [formData, setFormData] = useState({
    region_id: "",
    community_id: "",
    community_phase_id: "00000000-0000-0000-0000-000000000001", // Default phase ID
    version_number: "1",
    series: "",
    floor_plan_code: "",
    elevation_code: "",
    elevation_id: "00000000-0000-0000-0000-000000000001", // Default elevation ID
    description: "",
    comments: "",
    floor_plan_orientation: "",
    num_of_beds: "",
    num_of_baths: "",
    num_of_garages: "",
    main_floor_size: "",
    second_level_size: "",
    total_size: "",
    selling_price: "",
    cost: "",
    style: "",
    internal_notes: "",
  });

  // Delete confirmation state
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [floorPlanToDelete, setFloorPlanToDelete] = useState<FloorPlan | null>(
    null
  );

  // Grid API reference
  const [gridApi, setGridApi] = useState<any>(null);

  // Import state
  const [importModalOpen, setImportModalOpen] = useState(false);
  const [importFile, setImportFile] = useState<File | null>(null);
  const [importData, setImportData] = useState<any[]>([]);
  const [importErrors, setImportErrors] = useState<string[]>([]);

  // Filter row visibility state
  const [showFilterRow, setShowFilterRow] = useState(false);

  // Global search state
  const [globalSearchTerm, setGlobalSearchTerm] = useState("");

  // Get tRPC utils for cache invalidation
  const utils = api.useUtils();

  // Fetch floor plans data
  const { data: floorPlans = [], isLoading } = api.floorplans.getAll.useQuery(
    {
      builderId: builderId!,
      limit: 1000,
    },
    {
      enabled: !!builderId,
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
  const { data: regions = [] } = api.regions.getAll.useQuery(
    {
      builderId: builderId!,
    },
    {
      enabled: !!builderId,
    }
  );

  // Create floor plan mutation
  const createFloorPlanMutation = api.floorplans.create.useMutation({
    onSuccess: () => {
      utils.floorplans.getAll.invalidate();
      setIsModalOpen(false);
      resetForm();
    },
    onError: (error) => {
      console.error("Failed to create floor plan:", error);
    },
  });

  // Update floor plan mutation
  const updateFloorPlanMutation = api.floorplans.update.useMutation({
    onSuccess: () => {
      utils.floorplans.getAll.invalidate();
      setIsModalOpen(false);
      setEditingFloorPlan(null);
    },
    onError: (error) => {
      console.error("Failed to update floor plan:", error);
    },
  });

  // Delete floor plan mutation
  const deleteFloorPlanMutation = api.floorplans.delete.useMutation({
    onSuccess: () => {
      utils.floorplans.getAll.invalidate();
      setDeleteConfirmOpen(false);
      setFloorPlanToDelete(null);
    },
    onError: (error) => {
      console.error("Failed to delete floor plan:", error);
    },
  });

  // Reset form
  const resetForm = useCallback(() => {
    setFormData({
      region_id: regions.length > 0 ? regions[0].region_id : "",
      community_id: communities.length > 0 ? communities[0].community_id : "",
      community_phase_id: "00000000-0000-0000-0000-000000000001",
      version_number: "1",
      series: "",
      floor_plan_code: "",
      elevation_code: "",
      elevation_id: "00000000-0000-0000-0000-000000000001",
      description: "",
      comments: "",
      floor_plan_orientation: "",
      num_of_beds: "",
      num_of_baths: "",
      num_of_garages: "",
      main_floor_size: "",
      second_level_size: "",
      total_size: "",
      selling_price: "",
      cost: "",
      style: "",
      internal_notes: "",
    });
  }, [regions, communities]);

  // Handle create new floor plan
  const handleCreateFloorPlan = useCallback(() => {
    setEditingFloorPlan(null);
    resetForm();
    setIsModalOpen(true);
  }, [resetForm]);

  // Handle edit floor plan
  const handleEditFloorPlan = useCallback((floorPlan: FloorPlan) => {
    setEditingFloorPlan(floorPlan);
    setFormData({
      region_id: floorPlan.region_id,
      community_id: floorPlan.community_id,
      community_phase_id: floorPlan.community_phase_id,
      version_number: floorPlan.version_number.toString(),
      series: floorPlan.series,
      floor_plan_code: floorPlan.floor_plan_code,
      elevation_code: floorPlan.elevation_code,
      elevation_id: floorPlan.elevation_id,
      description: floorPlan.description || "",
      comments: floorPlan.comments || "",
      floor_plan_orientation: floorPlan.floor_plan_orientation || "",
      num_of_beds: floorPlan.num_of_beds?.toString() || "",
      num_of_baths: floorPlan.num_of_baths?.toString() || "",
      num_of_garages: floorPlan.num_of_garages?.toString() || "",
      main_floor_size: floorPlan.main_floor_size?.toString() || "",
      second_level_size: floorPlan.second_level_size?.toString() || "",
      total_size: floorPlan.total_size?.toString() || "",
      selling_price: floorPlan.selling_price?.toString() || "",
      cost: floorPlan.cost?.toString() || "",
      style: floorPlan.style || "",
      internal_notes: floorPlan.internal_notes || "",
    });
    setIsModalOpen(true);
  }, []);

  // Handle delete floor plan
  const handleDeleteFloorPlan = useCallback((floorPlan: FloorPlan) => {
    setFloorPlanToDelete(floorPlan);
    setDeleteConfirmOpen(true);
  }, []);

  // Confirm delete floor plan
  const confirmDeleteFloorPlan = useCallback(() => {
    if (!floorPlanToDelete || !builderId || !session?.user?.id) return;

    deleteFloorPlanMutation.mutate({
      builderId: builderId,
      floorPlanId: floorPlanToDelete.floor_plan_id,
      deletedBy: session.user.id,
    });
  }, [
    floorPlanToDelete,
    builderId,
    session?.user?.id,
    deleteFloorPlanMutation,
  ]);

  // Handle form submit
  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();

      if (!builderId || !session?.user?.id) {
        console.error("Missing required data for API call");
        return;
      }

      if (editingFloorPlan) {
        // Update existing floor plan
        updateFloorPlanMutation.mutate({
          builderId: builderId,
          floorPlanId: editingFloorPlan.floor_plan_id,
          description: formData.description || undefined,
          comments: formData.comments || undefined,
          floorPlanOrientation: formData.floor_plan_orientation || undefined,
          numOfBeds: formData.num_of_beds
            ? parseFloat(formData.num_of_beds)
            : undefined,
          numOfBaths: formData.num_of_baths
            ? parseFloat(formData.num_of_baths)
            : undefined,
          numOfGarages: formData.num_of_garages
            ? parseFloat(formData.num_of_garages)
            : undefined,
          mainFloorSize: formData.main_floor_size
            ? parseFloat(formData.main_floor_size)
            : undefined,
          secondLevelSize: formData.second_level_size
            ? parseFloat(formData.second_level_size)
            : undefined,
          totalSize: formData.total_size
            ? parseFloat(formData.total_size)
            : undefined,
          sellingPrice: formData.selling_price
            ? parseFloat(formData.selling_price)
            : undefined,
          cost: formData.cost ? parseFloat(formData.cost) : undefined,
          style: formData.style || undefined,
          internalNotes: formData.internal_notes || undefined,
          modifiedBy: session.user.id,
        });
      } else {
        // Create new floor plan
        createFloorPlanMutation.mutate({
          builderId: builderId,
          regionId: formData.region_id,
          communityId: formData.community_id,
          communityPhaseId: formData.community_phase_id,
          versionNumber: parseInt(formData.version_number),
          series: formData.series,
          floorPlanCode: formData.floor_plan_code,
          elevationCode: formData.elevation_code,
          elevationId: formData.elevation_id,
          description: formData.description || undefined,
          comments: formData.comments || undefined,
          floorPlanOrientation: formData.floor_plan_orientation || undefined,
          numOfBeds: formData.num_of_beds
            ? parseFloat(formData.num_of_beds)
            : undefined,
          numOfBaths: formData.num_of_baths
            ? parseFloat(formData.num_of_baths)
            : undefined,
          numOfGarages: formData.num_of_garages
            ? parseFloat(formData.num_of_garages)
            : undefined,
          mainFloorSize: formData.main_floor_size
            ? parseFloat(formData.main_floor_size)
            : undefined,
          secondLevelSize: formData.second_level_size
            ? parseFloat(formData.second_level_size)
            : undefined,
          totalSize: formData.total_size
            ? parseFloat(formData.total_size)
            : undefined,
          sellingPrice: formData.selling_price
            ? parseFloat(formData.selling_price)
            : undefined,
          cost: formData.cost ? parseFloat(formData.cost) : undefined,
          style: formData.style || undefined,
          internalNotes: formData.internal_notes || undefined,
          createdBy: session.user.id,
          modifiedBy: session.user.id,
        });
      }
    },
    [
      formData,
      editingFloorPlan,
      builderId,
      session?.user?.id,
      createFloorPlanMutation,
      updateFloorPlanMutation,
    ]
  );

  // Handle form input changes
  const handleInputChange = useCallback((field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  }, []);

  // Grid ready handler
  const onGridReady = useCallback((params: any) => {
    setGridApi(params.api);
    // Don't auto-size immediately for better initial load
    // params.api.sizeColumnsToFit();
  }, []);

  // Excel export columns configuration
  const excelColumns: ExcelColumn[] = [
    { field: "floor_plan_code", header: "Floor Plan Code *", required: true },
    { field: "elevation_code", header: "Elevation Code *", required: true },
    { field: "series", header: "Series *", required: true },
    { field: "description", header: "Description" },
    { field: "community_code", header: "Community Code" },
    { field: "num_of_beds", header: "Beds", type: "number" },
    { field: "num_of_baths", header: "Baths", type: "number" },
    { field: "num_of_garages", header: "Garages", type: "number" },
    { field: "total_size", header: "Total Size (sq ft)", type: "number" },
    { field: "selling_price", header: "Selling Price", type: "number" },
    { field: "style", header: "Style" },
  ];

  // Export to Excel
  const handleExportExcel = useCallback(() => {
    const selectedRows = gridApi?.getSelectedRows() || [];
    const dataToExport = selectedRows.length > 0 ? selectedRows : floorPlans;
    exportToExcel(
      dataToExport,
      excelColumns,
      `floorplans_export_${new Date().toISOString().slice(0, 10)}`
    );
  }, [gridApi, floorPlans, excelColumns]);

  // File upload handler
  const handleFileUpload = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;

      setImportFile(file);
      setImportErrors([]);
      setImportData([]);

      try {
        const data = await parseExcelFile(file);
        const validation = validateImportData(data, excelColumns);

        if (!validation.valid) {
          setImportErrors(validation.errors);
          return;
        }

        const mappedData = mapImportData(data, excelColumns);
        setImportData(mappedData);
        setImportModalOpen(true);
      } catch (error) {
        setImportErrors([
          "Failed to read file. Please ensure it is a valid Excel file.",
        ]);
      }

      // Reset file input
      e.target.value = "";
    },
    [excelColumns]
  );

  // Process import data
  const handleProcessImport = useCallback(async () => {
    if (!builderId || !session?.user?.id || importData.length === 0) return;

    try {
      const defaultRegionId = regions[0]?.region_id;

      for (const row of importData) {
        // Find community by code
        let communityId = communities[0]?.community_id;
        if (row.community_code) {
          const communityMatch = communities.find(
            (c: any) => c.community_code === row.community_code
          );
          if (communityMatch) {
            communityId = communityMatch.community_id;
          }
        }

        await createFloorPlanMutation.mutateAsync({
          builderId: builderId,
          regionId: defaultRegionId || "00000000-0000-0000-0000-000000000001",
          communityId: communityId || "00000000-0000-0000-0000-000000000001",
          communityPhaseId: "00000000-0000-0000-0000-000000000001",
          versionNumber: 1,
          series: row.series,
          floorPlanCode: row.floor_plan_code,
          elevationCode: row.elevation_code,
          elevationId: "00000000-0000-0000-0000-000000000001",
          description: row.description || undefined,
          numOfBeds: row.num_of_beds ? parseFloat(row.num_of_beds) : undefined,
          numOfBaths: row.num_of_baths
            ? parseFloat(row.num_of_baths)
            : undefined,
          numOfGarages: row.num_of_garages
            ? parseFloat(row.num_of_garages)
            : undefined,
          totalSize: row.total_size ? parseFloat(row.total_size) : undefined,
          sellingPrice: row.selling_price
            ? parseFloat(row.selling_price)
            : undefined,
          style: row.style || undefined,
          createdBy: session.user.id,
          modifiedBy: session.user.id,
        });
      }

      setImportModalOpen(false);
      setImportFile(null);
      setImportData([]);
      setImportErrors([]);

      // Refresh data
      utils.floorplans.getAll.invalidate();
    } catch (error) {
      console.error("Failed to import data:", error);
      setImportErrors([
        "Failed to import data. Please check the console for details.",
      ]);
    }
  }, [
    builderId,
    session?.user?.id,
    regions,
    communities,
    importData,
    createFloorPlanMutation,
    utils,
  ]);

  // Download Excel template
  const handleDownloadTemplate = useCallback(() => {
    console.log("handleDownloadTemplate called, excelColumns:", excelColumns);
    if (!excelColumns) {
      console.error("excelColumns is undefined in handleDownloadTemplate");
      alert("Excel columns not initialized yet. Please try again.");
      return;
    }
    downloadExcelTemplate(excelColumns, "floorplans_template.xlsx");
  }, [excelColumns]);

  // AG Grid column definitions
  const columnDefs: ColDef[] = useMemo(
    () => [
      {
        headerName: "Floor Plan",
        field: "floor_plan_code",
        sortable: true,
        filter: true,
        flex: 1,
        minWidth: 120,
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
        headerName: "Series",
        field: "series",
        sortable: true,
        filter: true,
        flex: 1,
        minWidth: 100,
      },
      {
        headerName: "Community",
        field: "community_name",
        sortable: true,
        filter: true,
        flex: 2,
        minWidth: 150,
        valueGetter: (params) => params.data?.community_name || "Unknown",
      },
      {
        headerName: "Description",
        field: "description",
        sortable: true,
        filter: true,
        flex: 2,
        minWidth: 200,
        valueGetter: (params) => params.data?.description || "No description",
      },
      {
        headerName: "Beds/Baths",
        field: "beds_baths",
        sortable: false,
        filter: false,
        flex: 1,
        minWidth: 100,
        valueGetter: (params) => {
          const beds = params.data?.num_of_beds || 0;
          const baths = params.data?.num_of_baths || 0;
          return `${beds}/${baths}`;
        },
      },
      {
        headerName: "Size (sq ft)",
        field: "total_size",
        sortable: true,
        filter: true,
        flex: 1,
        minWidth: 100,
        valueFormatter: (params) => {
          if (!params.value) return "";
          return params.value.toLocaleString();
        },
      },
      {
        headerName: "Price",
        field: "selling_price",
        sortable: true,
        filter: true,
        flex: 1,
        minWidth: 120,
        valueFormatter: (params) => {
          if (!params.value) return "";
          return "$" + params.value.toLocaleString();
        },
      },
      {
        headerName: "Status",
        field: "inactive",
        sortable: true,
        filter: true,
        flex: 1,
        minWidth: 100,
        cellRenderer: StatusCellRenderer,
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
          onEdit: handleEditFloorPlan,
          onDelete: handleDeleteFloorPlan,
        },
      },
    ],
    [handleEditFloorPlan, handleDeleteFloorPlan]
  );

  // Default column definitions
  const defaultColDef = useMemo(
    () => ({
      resizable: true,
      sortable: true,
      filter: true,
      floatingFilter: showFilterRow,
      suppressHeaderMenuButton: true,
    }),
    [showFilterRow]
  );

  // Show loading while checking authentication
  if (status === "loading") {
    return (
      <Navigation>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground text-lg">
              Loading floor plans...
            </p>
          </div>
        </div>
      </Navigation>
    );
  }

  // Show loading while fetching floor plans data
  if (builderId && isLoading) {
    return (
      <Navigation>
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold">Floor Plans Management</h1>
              <p className="text-muted-foreground">
                Manage floor plans and elevations
              </p>
            </div>
          </div>
          <Card>
            <CardHeader>
              <CardTitle>Floor Plans</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-center h-64">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                  <p className="text-muted-foreground">
                    Loading floor plans data...
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </Navigation>
    );
  }

  return (
    <Navigation>
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold">Floor Plans Management</h1>
            <p className="text-muted-foreground">
              Manage floor plans and elevations
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              onClick={handleDownloadTemplate}
              className="flex items-center gap-2"
              title="Download Excel template"
            >
              <FileSpreadsheet className="h-4 w-4" />
              Template
            </Button>
            <label htmlFor="excel-upload" className="cursor-pointer">
              <Button
                variant="outline"
                className="flex items-center gap-2"
                asChild
              >
                <span>
                  <Upload className="h-4 w-4" />
                  Import
                </span>
              </Button>
            </label>
            <input
              id="excel-upload"
              type="file"
              accept=".xlsx,.xls"
              onChange={handleFileUpload}
              className="hidden"
            />
            <Button
              variant="outline"
              onClick={handleExportExcel}
              className="flex items-center gap-2"
              disabled={floorPlans.length === 0}
            >
              <Download className="h-4 w-4" />
              Export
            </Button>
            <Button
              onClick={handleCreateFloorPlan}
              className="flex items-center gap-2"
            >
              <Plus className="h-4 w-4" />
              Add New Floor Plan
            </Button>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Floor Plans</span>
              <Badge variant="secondary">
                {floorPlans.length}{" "}
                {floorPlans.length === 1 ? "floor plan" : "floor plans"}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="mb-4 flex items-center gap-2">
              <div className="relative flex-1 max-w-sm">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="Search all fields..."
                  value={globalSearchTerm}
                  onChange={(e) => setGlobalSearchTerm(e.target.value)}
                  className="pl-9 pr-3 h-9 w-full"
                />
              </div>
              <Button
                variant="outline"
                onClick={() => setShowFilterRow(!showFilterRow)}
                className={`flex items-center gap-2 ${
                  showFilterRow ? "bg-primary/10" : ""
                }`}
                title="Toggle filter row"
              >
                <Filter className="h-4 w-4" />
                Filter Row
              </Button>
              <Button
                variant="outline"
                onClick={() => gridApi?.autoSizeAllColumns()}
                className="flex items-center gap-2"
                title="Auto-size all columns"
              >
                <Columns className="h-4 w-4" />
                Auto-size
              </Button>
            </div>
            <div className="ag-theme-alpine h-[600px] w-full">
              <AgGridReact
                rowData={floorPlans}
                columnDefs={columnDefs}
                defaultColDef={defaultColDef}
                onGridReady={onGridReady}
                pagination={true}
                paginationPageSize={50}
                paginationPageSizeSelector={[20, 50, 100]}
                domLayout="normal"
                suppressCellFocus={true}
                rowSelection={{
                  mode: "multiRow",
                  headerCheckbox: true,
                  checkboxes: true,
                }}
                animateRows={false}
                suppressRowHoverHighlight={true}
                suppressColumnVirtualisation={false}
                suppressRowVirtualisation={false}
                rowBuffer={10}
                debounceVerticalScrollbar={true}
                loading={isLoading}
                theme="legacy"
                quickFilterText={globalSearchTerm}
              />
            </div>
          </CardContent>
        </Card>

        {/* Floor Plan Modal */}
        <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
          <DialogContent className="sm:max-w-[625px]">
            <DialogHeader>
              <DialogTitle>
                {editingFloorPlan ? "Edit Floor Plan" : "Create New Floor Plan"}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit}>
              <div className="grid gap-4 py-4 max-h-[60vh] overflow-y-auto">
                {!editingFloorPlan && (
                  <>
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
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="community_id" className="text-right">
                        Community *
                      </Label>
                      <Select
                        value={formData.community_id}
                        onValueChange={(value) =>
                          handleInputChange("community_id", value)
                        }
                        required
                      >
                        <SelectTrigger className="col-span-3">
                          <SelectValue placeholder="Select a community" />
                        </SelectTrigger>
                        <SelectContent>
                          {communities.map((community) => (
                            <SelectItem
                              key={community.community_id}
                              value={community.community_id}
                            >
                              {community.description}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="floor_plan_code" className="text-right">
                        Floor Plan *
                      </Label>
                      <Input
                        id="floor_plan_code"
                        value={formData.floor_plan_code}
                        onChange={(e) =>
                          handleInputChange("floor_plan_code", e.target.value)
                        }
                        className="col-span-3"
                        placeholder="e.g., A101"
                        required
                      />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="elevation_code" className="text-right">
                        Elevation *
                      </Label>
                      <Input
                        id="elevation_code"
                        value={formData.elevation_code}
                        onChange={(e) =>
                          handleInputChange("elevation_code", e.target.value)
                        }
                        className="col-span-3"
                        placeholder="e.g., ELEV-A"
                        required
                      />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="series" className="text-right">
                        Series *
                      </Label>
                      <Input
                        id="series"
                        value={formData.series}
                        onChange={(e) =>
                          handleInputChange("series", e.target.value)
                        }
                        className="col-span-3"
                        placeholder="e.g., Premier"
                        required
                      />
                    </div>
                  </>
                )}

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
                    placeholder="Floor plan description"
                  />
                </div>

                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="style" className="text-right">
                    Style
                  </Label>
                  <Input
                    id="style"
                    value={formData.style}
                    onChange={(e) => handleInputChange("style", e.target.value)}
                    className="col-span-3"
                    placeholder="e.g., Modern, Traditional"
                  />
                </div>

                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="num_of_beds" className="text-right">
                    Bedrooms
                  </Label>
                  <Input
                    id="num_of_beds"
                    type="number"
                    step="0.5"
                    value={formData.num_of_beds}
                    onChange={(e) =>
                      handleInputChange("num_of_beds", e.target.value)
                    }
                    className="col-span-3"
                    placeholder="3"
                  />
                </div>

                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="num_of_baths" className="text-right">
                    Bathrooms
                  </Label>
                  <Input
                    id="num_of_baths"
                    type="number"
                    step="0.5"
                    value={formData.num_of_baths}
                    onChange={(e) =>
                      handleInputChange("num_of_baths", e.target.value)
                    }
                    className="col-span-3"
                    placeholder="2.5"
                  />
                </div>

                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="num_of_garages" className="text-right">
                    Garages
                  </Label>
                  <Input
                    id="num_of_garages"
                    type="number"
                    step="0.5"
                    value={formData.num_of_garages}
                    onChange={(e) =>
                      handleInputChange("num_of_garages", e.target.value)
                    }
                    className="col-span-3"
                    placeholder="2"
                  />
                </div>

                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="main_floor_size" className="text-right">
                    Main Floor (sq ft)
                  </Label>
                  <Input
                    id="main_floor_size"
                    type="number"
                    value={formData.main_floor_size}
                    onChange={(e) =>
                      handleInputChange("main_floor_size", e.target.value)
                    }
                    className="col-span-3"
                    placeholder="1500"
                  />
                </div>

                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="second_level_size" className="text-right">
                    Second Floor (sq ft)
                  </Label>
                  <Input
                    id="second_level_size"
                    type="number"
                    value={formData.second_level_size}
                    onChange={(e) =>
                      handleInputChange("second_level_size", e.target.value)
                    }
                    className="col-span-3"
                    placeholder="800"
                  />
                </div>

                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="total_size" className="text-right">
                    Total Size (sq ft)
                  </Label>
                  <Input
                    id="total_size"
                    type="number"
                    value={formData.total_size}
                    onChange={(e) =>
                      handleInputChange("total_size", e.target.value)
                    }
                    className="col-span-3"
                    placeholder="2300"
                  />
                </div>

                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="selling_price" className="text-right">
                    Selling Price
                  </Label>
                  <Input
                    id="selling_price"
                    type="number"
                    step="0.01"
                    value={formData.selling_price}
                    onChange={(e) =>
                      handleInputChange("selling_price", e.target.value)
                    }
                    className="col-span-3"
                    placeholder="450000"
                  />
                </div>

                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="cost" className="text-right">
                    Cost
                  </Label>
                  <Input
                    id="cost"
                    type="number"
                    step="0.01"
                    value={formData.cost}
                    onChange={(e) => handleInputChange("cost", e.target.value)}
                    className="col-span-3"
                    placeholder="350000"
                  />
                </div>

                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="internal_notes" className="text-right">
                    Internal Notes
                  </Label>
                  <Input
                    id="internal_notes"
                    value={formData.internal_notes}
                    onChange={(e) =>
                      handleInputChange("internal_notes", e.target.value)
                    }
                    className="col-span-3"
                    placeholder="Internal notes..."
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
                    createFloorPlanMutation.isPending ||
                    updateFloorPlanMutation.isPending
                  }
                >
                  {createFloorPlanMutation.isPending ||
                  updateFloorPlanMutation.isPending
                    ? editingFloorPlan
                      ? "Updating..."
                      : "Creating..."
                    : editingFloorPlan
                    ? "Update Floor Plan"
                    : "Create Floor Plan"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation Dialog */}
        <Dialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Delete Floor Plan</DialogTitle>
            </DialogHeader>
            <div className="py-4">
              <p className="text-muted-foreground">
                Are you sure you want to delete floor plan &ldquo;
                {floorPlanToDelete?.floor_plan_code}&rdquo;? This will mark it
                as deleted but keep the record.
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
                onClick={confirmDeleteFloorPlan}
                disabled={deleteFloorPlanMutation.isPending}
              >
                {deleteFloorPlanMutation.isPending
                  ? "Deleting..."
                  : "Delete Floor Plan"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Import Preview Dialog */}
        <Dialog open={importModalOpen} onOpenChange={setImportModalOpen}>
          <DialogContent className="max-w-4xl max-h-[80vh] overflow-hidden flex flex-col">
            <DialogHeader>
              <DialogTitle>Import Floor Plans</DialogTitle>
            </DialogHeader>
            <div className="flex-1 overflow-auto">
              <div className="space-y-4">
                {importFile && (
                  <div className="bg-muted p-3 rounded-lg">
                    <p className="text-sm">
                      <span className="font-medium">File:</span>{" "}
                      {importFile.name}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {importData.length} floor plans ready to import
                    </p>
                  </div>
                )}

                {importErrors.length > 0 && (
                  <div className="bg-red-50 border border-red-200 p-3 rounded-lg">
                    <p className="text-sm font-medium text-red-800 mb-2">
                      Import Errors:
                    </p>
                    <ul className="list-disc list-inside text-sm text-red-700 space-y-1">
                      {importErrors.map((error, index) => (
                        <li key={index}>{error}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {importData.length > 0 && importErrors.length === 0 && (
                  <div className="border rounded-lg overflow-hidden">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">
                            Floor Plan Code
                          </th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">
                            Elevation Code
                          </th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">
                            Series
                          </th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">
                            Description
                          </th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">
                            Total Size
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {importData.slice(0, 10).map((row, index) => (
                          <tr key={index}>
                            <td className="px-4 py-2 text-sm">
                              {row.floor_plan_code}
                            </td>
                            <td className="px-4 py-2 text-sm">
                              {row.elevation_code}
                            </td>
                            <td className="px-4 py-2 text-sm">{row.series}</td>
                            <td className="px-4 py-2 text-sm">
                              {row.description || "-"}
                            </td>
                            <td className="px-4 py-2 text-sm">
                              {row.total_size || "-"}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    {importData.length > 10 && (
                      <div className="bg-gray-50 px-4 py-2 text-sm text-gray-500">
                        And {importData.length - 10} more...
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setImportModalOpen(false)}
              >
                Cancel
              </Button>
              <Button
                onClick={handleProcessImport}
                disabled={
                  importErrors.length > 0 ||
                  importData.length === 0 ||
                  createFloorPlanMutation.isPending
                }
              >
                {createFloorPlanMutation.isPending
                  ? "Importing..."
                  : `Import ${importData.length} Floor Plans`}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </Navigation>
  );
}
