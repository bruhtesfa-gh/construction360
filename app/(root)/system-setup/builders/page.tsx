"use client";

import React, { useEffect, useState, useCallback, useMemo } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import type { ColDef } from "ag-grid-community";
import { api } from "../../../providers";
import { ClientDataGrid } from "../../../../components/grid/ClientDataGrid";
import { Button } from "../../../../components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../../../components/ui/card";
import { Building2, Edit } from "lucide-react";
import { BuilderForm } from "../../../../components/forms/BuilderForm";
import type { Builder } from "../../../../types/database";
import { useTimezone } from "../../../../lib/timezone-context";

export default function BuildersPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { formatDate } = useTimezone();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedBuilder, setSelectedBuilder] = useState<Builder | null>(null);

  // Redirect to signin if not authenticated
  useEffect(() => {
    if (status === "loading") return;
    if (!session) {
      router.push("/signin");
      return;
    }
  }, [session, status, router]);

  const builderId = session?.user?.builderId;
  const currentUserId = session?.user?.id;

  // Check if current user is a system admin
  const { data: userRole } = api.users.getCurrentUserRole.useQuery(
    {
      builderId: builderId!,
      userId: currentUserId!,
    },
    {
      enabled: !!builderId && !!currentUserId,
    }
  );

  const isSystemAdmin = userRole?.admin_role || false;

  // Get all builders for system admins, or just current builder for regular users
  const { data: allBuilders = [], isLoading: allBuildersLoading } =
    api.builders.getAll.useQuery(undefined, {
      enabled: !!session && isSystemAdmin,
    });

  const { data: currentBuilder, isLoading: currentBuilderLoading } =
    api.builders.getById.useQuery(
      { builderId: builderId! },
      {
        enabled: !!builderId && !isSystemAdmin,
      }
    );

  // Use appropriate data based on user role
  const builders = isSystemAdmin
    ? allBuilders
    : currentBuilder
    ? [currentBuilder]
    : [];
  const isLoading = isSystemAdmin ? allBuildersLoading : currentBuilderLoading;

  const handleEdit = useCallback((builder: Builder) => {
    setSelectedBuilder(builder);
    setIsFormOpen(true);
  }, []);

  const columnDefs: ColDef[] = useMemo(
    () => [
      {
        field: "builder_name",
        headerName: "Builder Name",
        flex: 2,
        filter: true,
        sortable: true,
      },
      {
        field: "city",
        headerName: "City",
        flex: 1,
        filter: true,
        sortable: true,
      },
      {
        field: "state",
        headerName: "State",
        width: 100,
        filter: true,
        sortable: true,
      },
      {
        field: "currency",
        headerName: "Currency",
        width: 100,
        filter: true,
        sortable: true,
      },
      {
        field: "local_time_zone_name",
        headerName: "Time Zone",
        flex: 1,
        filter: true,
        sortable: true,
      },
      {
        field: "created_date",
        headerName: "Created Date",
        width: 150,
        filter: "agDateColumnFilter",
        sortable: true,
        valueFormatter: (params) => {
          if (!params.value) return "";
          return formatDate(params.value);
        },
      },
      {
        headerName: "Actions",
        field: "actions",
        width: 100,
        sortable: false,
        filter: false,
        cellRenderer: (params: any) => {
          return (
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleEdit(params.data)}
              className="h-8 w-8 p-0"
            >
              <Edit className="h-4 w-4" />
            </Button>
          );
        },
      },
    ],
    [formatDate, handleEdit]
  );

  const utils = api.useUtils();

  const handleFormClose = useCallback(() => {
    setIsFormOpen(false);
    setSelectedBuilder(null);
    if (isSystemAdmin) {
      utils.builders.getAll.invalidate();
    } else {
      utils.builders.getById.invalidate();
    }
  }, [isSystemAdmin, utils]);

  // Show loading while checking authentication
  if (status === "loading") {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground text-lg">Loading builders...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <Building2 className="h-8 w-8" />
            {isSystemAdmin ? "All Builders" : "Builder Settings"}
          </h1>
          <p className="text-muted-foreground">
            {isSystemAdmin
              ? "Manage all builder organizations"
              : "Manage your builder organization settings"}
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>
            {isSystemAdmin
              ? "Builder Organizations"
              : "Your Builder Organization"}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ClientDataGrid
            data={builders}
            loading={isLoading}
            columnDefs={columnDefs}
            excelColumns={[]}
            enableExport={false}
            enableImport={false}
          />
        </CardContent>
      </Card>

      {isFormOpen && (
        <BuilderForm builder={selectedBuilder} onClose={handleFormClose} />
      )}
    </div>
  );
}
