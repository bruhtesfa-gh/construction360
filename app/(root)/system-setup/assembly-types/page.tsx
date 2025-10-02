"use client";

import React, { useEffect, useMemo } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import type { ColDef } from "ag-grid-community";
import { api } from "../../../providers";
import { ClientDataGrid } from "../../../../components/grid/ClientDataGrid";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../../../components/ui/card";
import { Package } from "lucide-react";
import { useTimezone } from "../../../../lib/timezone-context";

export default function AssemblyTypesPage() {
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

  const { data: assemblyTypes = [], isLoading } =
    api.assemblyTypes.getAll.useQuery(undefined, {
      enabled: !!session,
    });

  const columnDefs: ColDef[] = useMemo(
    () => [
      {
        field: "assembly_type_id",
        headerName: "ID",
        width: 100,
        filter: true,
        sortable: true,
      },
      {
        field: "assembly_type_description",
        headerName: "Description",
        flex: 1,
        filter: true,
        sortable: true,
      },
      {
        field: "created_at",
        headerName: "Created Date",
        width: 150,
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

  // Show loading while checking authentication
  if (status === "loading") {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground text-lg">
            Loading assembly types...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
          <Package className="h-8 w-8" />
          Assembly Types
        </h1>
        <p className="text-muted-foreground">
          View assembly type definitions (read-only)
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Assembly Type List</CardTitle>
        </CardHeader>
        <CardContent>
          <ClientDataGrid
            data={assemblyTypes}
            loading={isLoading}
            columnDefs={columnDefs}
            excelColumns={[]}
            enableExport={false}
            enableImport={false}
          />
        </CardContent>
      </Card>
    </div>
  );
}
