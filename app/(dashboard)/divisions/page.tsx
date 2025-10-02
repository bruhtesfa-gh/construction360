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
import { Switch } from "../../../components/ui/switch";
import { Plus, Building2 } from "lucide-react";
import { ActionsCellRenderer } from "../../../components/grid/ActionsCellRenderer";
import { api } from "../../providers";
import { useTimezone } from "../../../lib/timezone-context";
import { DivisionForm } from "../../../components/forms/DivisionForm";

interface Division {
  division_id: string;
  builder_id: string;
  division_code: string;
  division_name: string | null;
  logo: string | null;
  address1: string | null;
  address2: string | null;
  city: string | null;
  state: string | null;
  zip: string | null;
  home_phone: string | null;
  mobile_phone: string | null;
  work_phone: string | null;
  fax: string | null;
  email: string | null;
  date_format: string | null;
  quote_expiry_days: number | null;
  lot_hold_expiry_days: number | null;
  lot_hold_num_of_days: number | null;
  maps_api_key: string | null;
  time_zone_id: string | null;
  business_hours_start: string | null;
  business_hours_end: string | null;
  casl: boolean;
  digital_signature_provider: string | null;
  estimated_close_date_days: number | null;
  is_digital_signature_review_reqd: boolean;
  sort_options_by: string | null;
  external_provider_push_event_url: string | null;
  allow_multiple_quotes_on_lots: boolean;
  sales_manager_id: string | null;
  sage_intacct_entity: string | null;
  sales_tax_rate: number | null;
  accounting_db_id: string | null;
  local_time_zone_name: string | null;
  loan_draw_liability_acct: string | null;
  created_at: Date;
  updated_at: Date;
}

export default function DivisionsPage() {
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
  const [editingDivision, setEditingDivision] = useState<Division | null>(null);

  // Delete confirmation state
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [divisionToDelete, setDivisionToDelete] = useState<Division | null>(
    null
  );

  // Get tRPC utils for cache invalidation
  const utils = api.useUtils();

  // Fetch divisions data
  const { data: divisions = [], isLoading } = api.divisions.getAll.useQuery(
    {
      builderId: builderId!,
      limit: 1000,
    },
    {
      enabled: !!builderId,
    }
  );

  // Fetch users for sales manager dropdown
  const { data: users = [] } = api.users.getAll.useQuery(
    {
      builderId: builderId!,
    },
    {
      enabled: !!builderId,
    }
  );

  // Delete division mutation
  const deleteDivisionMutation = api.divisions.delete.useMutation({
    onSuccess: () => {
      utils.divisions.getAll.invalidate();
      setDeleteConfirmOpen(false);
      setDivisionToDelete(null);
    },
    onError: (error) => {
      console.error("Failed to delete division:", error);
    },
  });

  // Handle create new division
  const handleCreateDivision = useCallback(() => {
    setEditingDivision(null);
    setIsModalOpen(true);
  }, []);

  // Handle edit division
  const handleEditDivision = useCallback((division: Division) => {
    setEditingDivision(division);
    setIsModalOpen(true);
  }, []);

  // Handle delete division
  const handleDeleteDivision = useCallback((division: Division) => {
    setDivisionToDelete(division);
    setDeleteConfirmOpen(true);
  }, []);

  // Confirm delete division
  const confirmDeleteDivision = useCallback(() => {
    if (!divisionToDelete || !builderId) return;

    deleteDivisionMutation.mutate({
      builderId: builderId,
      divisionId: divisionToDelete.division_id,
    });
  }, [divisionToDelete, builderId, deleteDivisionMutation]);

  // Handle form success
  const handleFormSuccess = useCallback(() => {
    setIsModalOpen(false);
    setEditingDivision(null);
    utils.divisions.getAll.invalidate();
  }, [utils]);

  // Excel columns configuration for import/export
  const excelColumns: ExcelColumn[] = [
    { field: "division_code", header: "Division Code *", required: true },
    { field: "division_name", header: "Division Name" },
    { field: "address1", header: "Address 1" },
    { field: "address2", header: "Address 2" },
    { field: "city", header: "City" },
    { field: "state", header: "State" },
    { field: "zip", header: "ZIP" },
    { field: "email", header: "Email" },
    { field: "work_phone", header: "Work Phone" },
    { field: "sales_manager_login_id", header: "Sales Manager Login ID" },
  ];

  // Handle import from DataGrid
  const handleImport = useCallback(
    async (importData: any[]) => {
      if (!builderId) return;

      const createMutation = api.divisions.create.useMutation();

      for (const row of importData) {
        // Find sales manager by login ID if provided
        let salesManagerId = undefined;
        if (row.sales_manager_login_id) {
          const manager = users.find(
            (u) => u.user_login_id === row.sales_manager_login_id
          );
          if (manager) {
            salesManagerId = manager.user_id;
          }
        }

        await createMutation.mutateAsync({
          builderId: builderId,
          divisionCode: row.division_code,
          divisionName: row.division_name || null,
          address1: row.address1 || null,
          address2: row.address2 || null,
          city: row.city || null,
          state: row.state || null,
          zip: row.zip || null,
          email: row.email || null,
          workPhone: row.work_phone || null,
          salesManagerId: salesManagerId || null,
        });
      }

      // Refresh data
      utils.divisions.getAll.invalidate();
    },
    [builderId, users, utils]
  );

  // AG Grid column definitions
  const columnDefs: ColDef[] = useMemo(
    () => [
      {
        headerName: "Division Code",
        field: "division_code",
        sortable: true,
        filter: true,
        flex: 1,
        minWidth: 120,
      },
      {
        headerName: "Division Name",
        field: "division_name",
        sortable: true,
        filter: true,
        flex: 2,
        minWidth: 200,
      },
      {
        headerName: "Location",
        field: "location",
        sortable: true,
        filter: true,
        flex: 2,
        minWidth: 250,
        valueGetter: (params) => {
          if (!params.data) return "";
          const parts = [];
          if (params.data.city) parts.push(params.data.city);
          if (params.data.state) parts.push(params.data.state);
          return parts.join(", ") || "No location";
        },
      },
      {
        headerName: "Email",
        field: "email",
        sortable: true,
        filter: true,
        flex: 2,
        minWidth: 200,
      },
      {
        headerName: "Phone",
        field: "work_phone",
        sortable: true,
        filter: true,
        flex: 1,
        minWidth: 140,
      },
      {
        headerName: "Sales Manager",
        field: "sales_manager_id",
        sortable: true,
        filter: true,
        flex: 2,
        minWidth: 180,
        valueGetter: (params) => {
          if (!params.data?.sales_manager_id) return "No manager assigned";
          const manager = users.find(
            (u) => u.user_id === params.data.sales_manager_id
          );
          return manager
            ? `${manager.first_name} ${manager.last_name}`
            : "Unknown";
        },
      },
      {
        headerName: "Created",
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
          onEdit: handleEditDivision,
          onDelete: handleDeleteDivision,
        },
      },
    ],
    [handleEditDivision, handleDeleteDivision, formatDate, users]
  );

  // Show loading while checking authentication
  if (status === "loading") {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground text-lg">Loading divisions...</p>
        </div>
      </div>
    );
  }

  // Show loading while fetching divisions data
  if (builderId && isLoading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold">Divisions Management</h1>
            <p className="text-muted-foreground">
              Manage divisions for your organization
            </p>
          </div>
        </div>
        <Card>
          <CardHeader>
            <CardTitle>Divisions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-center h-64">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                <p className="text-muted-foreground">
                  Loading divisions data...
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <Building2 className="h-8 w-8" />
            Divisions
          </h1>
          <p className="text-muted-foreground">
            Manage divisions for your organization
          </p>
        </div>
        <Button
          onClick={handleCreateDivision}
          className="flex items-center gap-2"
        >
          <Plus className="h-4 w-4" />
          Add New Division
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Divisions</CardTitle>
        </CardHeader>
        <CardContent>
          <DataGrid
            data={divisions}
            loading={isLoading}
            columnDefs={columnDefs}
            excelColumns={excelColumns}
            onImport={handleImport}
            fileName="divisions"
            importTitle="Import Divisions"
          />
        </CardContent>
      </Card>

      {/* Division Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>
              {editingDivision ? "Edit Division" : "Create New Division"}
            </DialogTitle>
          </DialogHeader>
          <DivisionForm
            builderId={builderId!}
            division={editingDivision}
            users={users}
            onSuccess={handleFormSuccess}
            onCancel={() => setIsModalOpen(false)}
          />
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Delete Division</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p className="text-muted-foreground">
              Are you sure you want to delete division &ldquo;
              {divisionToDelete?.division_code}&rdquo;? This action cannot be
              undone.
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
              onClick={confirmDeleteDivision}
              disabled={deleteDivisionMutation.isPending}
            >
              {deleteDivisionMutation.isPending
                ? "Deleting..."
                : "Delete Division"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
