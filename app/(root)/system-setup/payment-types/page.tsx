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
import { CreditCard } from "lucide-react";
import { useTimezone } from "../../../../lib/timezone-context";

export default function PaymentTypesPage() {
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

  const { data: paymentTypes = [], isLoading } =
    api.paymentTypes.getAll.useQuery(undefined, {
      enabled: !!session,
    });

  const columnDefs: ColDef[] = useMemo(
    () => [
      {
        field: "description",
        headerName: "Description",
        flex: 1,
        filter: true,
        sortable: true,
      },
      {
        field: "created_date",
        headerName: "Created Date",
        width: 200,
        filter: "agDateColumnFilter",
        sortable: true,
        valueFormatter: (params) => {
          if (!params.value) return "";
          return formatDate(params.value);
        },
      },
    ],
    [formatDate]
  );

  const excelColumns: ExcelColumn[] = [
    { field: "description", header: "Description", required: true },
    { field: "created_date", header: "Created Date", type: "date" },
  ];

  // Show loading while checking authentication
  if (status === "loading") {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground text-lg">
            Loading payment types...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
          <CreditCard className="h-8 w-8" />
          Payment Types
        </h1>
        <p className="text-muted-foreground">
          View available payment type options (read-only)
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Payment Type List</CardTitle>
        </CardHeader>
        <CardContent>
          <DataGrid
            data={paymentTypes}
            loading={isLoading}
            columnDefs={columnDefs}
            excelColumns={excelColumns}
            enableExport={true}
            enableImport={false}
            fileName="payment_types"
            gridHeight="calc(100vh - 300px)"
          />
        </CardContent>
      </Card>
    </div>
  );
}
