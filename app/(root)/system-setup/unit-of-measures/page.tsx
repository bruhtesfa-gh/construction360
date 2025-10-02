"use client";

import React, { useEffect, useMemo } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import type { ColDef } from "ag-grid-community";
import { api } from "../../../providers";
import { DataGrid, type ExcelColumn } from "../../../../components/grid";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../../../components/ui/card";
import { Ruler } from "lucide-react";

export default function UnitOfMeasuresPage() {
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

  const { data: unitOfMeasures = [], isLoading } =
    api.unitOfMeasures.getAll.useQuery(undefined, {
      enabled: !!session,
    });

  const columnDefs: ColDef[] = useMemo(
    () => [
      {
        field: "unit_of_measure",
        headerName: "Unit",
        width: 150,
        filter: true,
        sortable: true,
      },
      {
        field: "description",
        headerName: "Description",
        flex: 1,
        filter: true,
        sortable: true,
      },
      {
        field: "abbreviation",
        headerName: "Abbreviation",
        width: 150,
        filter: true,
        sortable: true,
      },
      {
        field: "is_active",
        headerName: "Active",
        width: 100,
        filter: true,
        sortable: true,
        valueFormatter: (params) => (params.value ? "Yes" : "No"),
        cellStyle: { textAlign: "center" },
      },
    ],
    []
  );

  const excelColumns: ExcelColumn[] = [
    { field: "unit_of_measure", header: "Unit", required: true },
    { field: "description", header: "Description", required: true },
    { field: "abbreviation", header: "Abbreviation", required: true },
    { field: "is_active", header: "Active", type: "boolean" },
  ];

  // Show loading while checking authentication
  if (status === "loading") {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground text-lg">
            Loading units of measure...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
          <Ruler className="h-8 w-8" />
          Units of Measure
        </h1>
        <p className="text-muted-foreground">
          View standard units of measurement (read-only)
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Unit of Measure List</CardTitle>
        </CardHeader>
        <CardContent>
          <DataGrid
            data={unitOfMeasures}
            loading={isLoading}
            columnDefs={columnDefs}
            excelColumns={excelColumns}
            enableExport={true}
            enableImport={false}
            fileName="unit_of_measures"
            gridHeight="calc(100vh - 300px)"
          />
        </CardContent>
      </Card>
    </div>
  );
}
