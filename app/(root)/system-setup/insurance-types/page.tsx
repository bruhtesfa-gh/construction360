"use client";

import React, { useState, useCallback, useEffect } from "react";
import { api } from "../../../providers";
import { DataGrid, type ExcelColumn } from "../../../../components/grid";
import type { ColDef } from "ag-grid-community";
import { InsuranceTypeForm } from "../../../../components/forms/InsuranceTypeForm";
import type { InsuranceType } from "../../../../types/database";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { ActionsCellRenderer } from "../../../../components/grid/ActionsCellRenderer";
import { Button } from "../../../../components/ui/button";
import { Plus } from "lucide-react";
import { Navigation } from "../../../../components/layout/Navigation";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../../../components/ui/card";
import { Shield } from "lucide-react";

export default function InsuranceTypesPage() {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedInsuranceType, setSelectedInsuranceType] =
    useState<InsuranceType | null>(null);
  // State is used by the selection handler - tracks selected rows for bulk operations
  const [selectedRows, setSelectedRows] = useState<InsuranceType[]>([]);
  void selectedRows; // Currently unused but will be used for bulk operations
  const { data: session, status } = useSession();
  const router = useRouter();
  const builderId = session?.user?.builderId;

  // Redirect to signin if not authenticated
  useEffect(() => {
    if (status === "loading") return;
    if (!session) {
      router.push("/signin");
      return;
    }
  }, [session, status, router]);

  const {
    data: insuranceTypes,
    isLoading,
    refetch,
  } = api.insuranceTypes.getAll.useQuery(
    { builderId: builderId ?? "" },
    { enabled: !!builderId && !!session }
  );

  const deleteInsuranceType = api.insuranceTypes.delete.useMutation({
    onSuccess: () => {
      refetch();
      setSelectedRows([]);
    },
  });

  const columnDefs: ColDef<InsuranceType>[] = [
    {
      field: "insurance_type",
      headerName: "Insurance Type",
      flex: 1,
      minWidth: 150,
    },
    { field: "description", headerName: "Description", flex: 2, minWidth: 200 },
    {
      field: "is_tracking",
      headerName: "Tracking",
      width: 120,
      valueFormatter: (params) => (params.value ? "Yes" : "No"),
      cellStyle: { textAlign: "center" },
    },
    {
      field: "created_at",
      headerName: "Created Date",
      width: 150,
      valueFormatter: (params) => {
        return params.value ? new Date(params.value).toLocaleDateString() : "";
      },
    },
    {
      field: "actions" as any,
      headerName: "Actions",
      width: 120,
      cellRenderer: ActionsCellRenderer,
      cellRendererParams: {
        onEdit: (row: InsuranceType) => {
          setSelectedInsuranceType(row);
          setIsFormOpen(true);
        },
        onDelete: async (row: InsuranceType) => {
          if (confirm("Are you sure you want to delete this insurance type?")) {
            try {
              await deleteInsuranceType.mutateAsync({
                builderId: builderId ?? "",
                insuranceTypeId: row.insurance_type_id,
              });
            } catch (error) {
              console.error("Error deleting insurance type:", error);
            }
          }
        },
      },
      sortable: false,
      filter: false,
    },
  ];

  const excelColumns: ExcelColumn[] = [
    { field: "insurance_type", header: "Insurance Type", required: true },
    { field: "description", header: "Description", required: true },
    { field: "is_tracking", header: "Tracking", type: "boolean" },
  ];

  const handleAdd = () => {
    setSelectedInsuranceType(null);
    setIsFormOpen(true);
  };

  const createMutation = api.insuranceTypes.create.useMutation();

  const handleImport = useCallback(
    async (data: any[]) => {
      if (!builderId) return;

      for (const row of data) {
        try {
          await createMutation.mutateAsync({
            builderId,
            insuranceType: row.insurance_type,
            description: row.description,
            isTracking: row.is_tracking === true || row.is_tracking === "Yes",
          });
        } catch (error) {
          console.error("Error importing insurance type:", error);
        }
      }

      refetch();
    },
    [builderId, createMutation, refetch]
  );

  const handleFormClose = () => {
    setIsFormOpen(false);
    setSelectedInsuranceType(null);
    refetch();
  };

  const handleSelectionChanged = useCallback((rows: InsuranceType[]) => {
    setSelectedRows(rows);
  }, []);

  // Show loading while checking authentication
  if (status === "loading") {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground text-lg">
            Loading insurance types...
          </p>
        </div>
      </div>
    );
  }

  if (!builderId) {
    return <div className="p-4">Please select a builder</div>;
  }

  return (
    <div>
      <div className="p-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <Shield className="h-8 w-8" />
            Insurance Types
          </h1>
          <p className="text-muted-foreground">
            Manage insurance types for tracking and reporting
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Insurance Type List</span>
              <Button onClick={handleAdd} className="flex items-center gap-2">
                <Plus className="h-4 w-4" />
                Add Insurance Type
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <DataGrid
              data={insuranceTypes || []}
              columnDefs={columnDefs}
              excelColumns={excelColumns}
              loading={isLoading}
              onSelectionChanged={handleSelectionChanged}
              onImport={handleImport}
              fileName="insurance_types"
              importTitle="Import Insurance Types"
              rowSelection="multiple"
              gridHeight="calc(100vh - 300px)"
            />
          </CardContent>
        </Card>
      </div>

      {isFormOpen && (
        <InsuranceTypeForm
          insuranceType={selectedInsuranceType}
          onClose={handleFormClose}
          builderId={builderId}
        />
      )}
    </div>
  );
}
