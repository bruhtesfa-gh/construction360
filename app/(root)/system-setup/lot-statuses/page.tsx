"use client";

import React, { useState, useCallback, useEffect, useMemo } from "react";
import { api } from "../../../providers";
import { DataGrid, type ExcelColumn } from "../../../../components/grid";
import type { ColDef } from "ag-grid-community";
import { LotStatusForm } from "../../../../components/forms/LotStatusForm";
import type { LotStatus } from "../../../../types/database";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Navigation } from "../../../../components/layout/Navigation";
import { ActionsCellRenderer } from "../../../../components/grid/ActionsCellRenderer";
import { Button } from "../../../../components/ui/button";
import { Plus, MapPin } from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../../../components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../../../components/ui/select";

export default function LotStatusesPage() {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedLotStatus, setSelectedLotStatus] = useState<LotStatus | null>(
    null
  );
  const [selectedRows, setSelectedRows] = useState<LotStatus[]>([]);
  void selectedRows; // Currently unused but will be used for bulk operations
  const [selectedDivisionId, setSelectedDivisionId] = useState<
    string | undefined
  >();
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

  const { data: divisions } = api.divisions.getAll.useQuery(
    { builderId: builderId ?? "" },
    { enabled: !!builderId && !!session }
  );

  const {
    data: lotStatuses,
    isLoading,
    refetch,
  } = api.lotStatuses.getAll.useQuery(
    { builderId: builderId ?? "", divisionId: selectedDivisionId },
    { enabled: !!builderId && !!session }
  );

  const deleteLotStatus = api.lotStatuses.delete.useMutation({
    onSuccess: () => {
      refetch();
      setSelectedRows([]);
    },
  });

  const excelColumns: ExcelColumn[] = [
    { field: "lot_status", header: "Lot Status", required: true },
    { field: "lot_status_custom_desc", header: "Description", required: true },
    { field: "color_code", header: "Color Code" },
  ];

  const columnDefs: ColDef<LotStatus>[] = useMemo(
    () => [
      { field: "lot_status", headerName: "Lot Status", flex: 1, filter: true },
      {
        field: "lot_status_custom_desc",
        headerName: "Description",
        flex: 2,
        filter: true,
      },
      {
        field: "color_code",
        headerName: "Color",
        width: 150,
        cellRenderer: (params: any) => {
          if (!params.value) return "";
          return (
            <div className="flex items-center gap-2">
              <div
                className="h-4 w-4 rounded border"
                style={{ backgroundColor: params.value }}
              />
              <span>{params.value}</span>
            </div>
          );
        },
      },
      {
        field: "created_at",
        headerName: "Created Date",
        width: 150,
        valueFormatter: (params) => {
          return params.value
            ? new Date(params.value).toLocaleDateString()
            : "";
        },
      },
      {
        field: "actions" as any,
        headerName: "Actions",
        width: 120,
        cellRenderer: ActionsCellRenderer,
        cellRendererParams: {
          onEdit: (row: LotStatus) => {
            setSelectedLotStatus(row);
            setIsFormOpen(true);
          },
          onDelete: async (row: LotStatus) => {
            if (confirm("Are you sure you want to delete this lot status?")) {
              try {
                await deleteLotStatus.mutateAsync({
                  builderId: builderId ?? "",
                  lotStatusId: row.lot_status_id,
                });
              } catch (error) {
                console.error("Error deleting lot status:", error);
              }
            }
          },
        },
        sortable: false,
        filter: false,
      },
    ],
    [builderId, deleteLotStatus]
  );

  const handleAdd = () => {
    setSelectedLotStatus(null);
    setIsFormOpen(true);
  };

  const handleFormClose = () => {
    setIsFormOpen(false);
    setSelectedLotStatus(null);
    refetch();
  };

  const handleSelectionChanged = useCallback((rows: LotStatus[]) => {
    setSelectedRows(rows);
  }, []);

  // Show loading while checking authentication
  if (status === "loading") {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground text-lg">
            Loading lot statuses...
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
            <MapPin className="h-8 w-8" />
            Lot Statuses
          </h1>
          <p className="text-muted-foreground">
            Manage lot statuses and their display colors
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Lot Status List</span>
              <div className="flex items-center gap-4">
                <Select
                  value={selectedDivisionId}
                  onValueChange={setSelectedDivisionId}
                >
                  <SelectTrigger className="w-[200px]">
                    <SelectValue placeholder="All Divisions" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Divisions</SelectItem>
                    {divisions?.map((division: any) => (
                      <SelectItem
                        key={division.division_id}
                        value={division.division_id}
                      >
                        {division.division_code}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button onClick={handleAdd} className="flex items-center gap-2">
                  <Plus className="h-4 w-4" />
                  Add Lot Status
                </Button>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <DataGrid
              data={lotStatuses || []}
              columnDefs={columnDefs}
              loading={isLoading}
              onSelectionChanged={handleSelectionChanged}
              rowSelection="multiple"
              gridHeight="calc(100vh - 300px)"
              enableExport={true}
              enableImport={false}
              excelColumns={excelColumns}
              fileName="lot_statuses"
            />
          </CardContent>
        </Card>
      </div>

      {isFormOpen && (
        <LotStatusForm
          lotStatus={selectedLotStatus}
          onClose={handleFormClose}
          builderId={builderId}
        />
      )}
    </div>
  );
}
