import React, { useRef, useCallback, useMemo } from "react";
import type { ColDef, GridApi, GridReadyEvent } from "ag-grid-community";
import { IServerSideDatasource } from "ag-grid-enterprise";
import { Button } from "../../atoms/button";
import { Input } from "../../atoms/input";
import { Download, Columns, Filter, Search } from "lucide-react";
import { AgGridReact } from "@/core/grid/ag-grid-config";

export interface AppGridTableProps<T> {
  // Data
  data?: T[];
  loading?: boolean;
  // Columns
  columnDefs: ColDef[];
  // Server-side data source
  serverSide?: boolean;
  serverSideDatasource?: IServerSideDatasource;
  // Custom renderers
  components?: Record<string, React.ComponentType<any>>;
  // Features
  enableExport?: boolean;
  enableImport?: boolean;
  enableColumnToggle?: boolean;
  enableGlobalSearch?: boolean;
  enableFilterRow?: boolean;
  enableEditing?: boolean;
  // Callbacks
  onSelectionChanged?: (selectedRows: T[]) => void;
  onGridReady?: (api: GridApi) => void;
  onCellValueChanged?: (event: any) => void;
  onCellEditingStopped?: (event: any) => void;
  onGlobalSearchChange?: (searchTerm: string) => void;
  // Customization
  gridHeight?: string;
  fileName?: string;
  // Others
  className?: string;
}

export function AppGridTable<T extends Record<string, any>>({
  data,
  loading = false,
  columnDefs,
  serverSide = false,
  serverSideDatasource,
  components,
  enableExport = true,
  enableGlobalSearch = false,
  enableFilterRow = true,
  enableEditing = false,
  onSelectionChanged,
  onGridReady,
  onCellValueChanged,
  onCellEditingStopped,
  gridHeight = "600px",
  fileName = "export",
  className,
}: AppGridTableProps<T>) {
  const gridApiRef = useRef<GridApi | null>(null);
  const [globalSearchTerm, setGlobalSearchTerm] = React.useState("");
  const [showFilterRow, setShowFilterRow] = React.useState(false);
  const [columnVisibility, setColumnVisibility] = React.useState<
    Record<string, boolean>
  >({});

  // Handle selection change
  const handleSelectionChanged = useCallback(
    (event: any) => {
      const selected = event.api.getSelectedRows();
      onSelectionChanged?.(selected);
    },
    [onSelectionChanged]
  );

  // Column visibility
  React.useEffect(() => {
    const visibility: Record<string, boolean> = {};
    columnDefs.forEach((col) => {
      if (typeof col.field === "string") {
        visibility[col.field] = col.hide !== true;
      }
    });
    setColumnVisibility(visibility);
  }, [columnDefs]);

  // Global search
  React.useEffect(() => {
    if (gridApiRef.current) {
      (gridApiRef.current as any).setQuickFilter?.(globalSearchTerm);
    }
  }, [globalSearchTerm]);

  // Filter row
  React.useEffect(() => {
    if (gridApiRef.current) {
      gridApiRef.current.setGridOption(
        "floatingFiltersHeight",
        showFilterRow ? undefined : 0
      );
    }
  }, [showFilterRow]);

  // Default column definition
  const defaultColDef = useMemo(
    () => ({
      sortable: true,
      filter: true,
      resizable: true,
      floatingFilter: showFilterRow,
      suppressHeaderMenuButton: true,
      editable: enableEditing,
    }),
    [showFilterRow, enableEditing]
  );

  // Export/import handlers (stub, can be extended)
  const handleExport = useCallback(() => {
    if (gridApiRef.current) {
      gridApiRef.current.exportDataAsCsv({ fileName: `${fileName}.csv` });
    }
  }, [fileName]);

  // Render
  return (
    <div className={className}>
      {/* Enhanced Toolbar */}
      <div className="flex flex-wrap items-center justify-between px-4 py-3 bg-white dark:bg-card rounded-xl">
        <div className="flex items-center gap-3">
          {enableGlobalSearch && (
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground pointer-events-none" />
              <Input
                type="text"
                placeholder="Search..."
                value={globalSearchTerm}
                onChange={(e) => setGlobalSearchTerm(e.target.value)}
                className="pl-10 w-72 rounded-lg border border-muted focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all duration-150"
              />
            </div>
          )}
        </div>
        <div className="flex items-center gap-3">
          {enableExport && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleExport}
              className="flex items-center gap-2 rounded-lg border border-muted hover:bg-primary/10 transition-colors duration-150 shadow-sm"
            >
              <Download className="h-4 w-4" />
              <span className="font-medium">Export</span>
            </Button>
          )}
        </div>
      </div>
      {/* Grid Container */}
      <div
        className="ag-theme-quartz rounded-xl border bg-card shadow-md"
        style={{ height: gridHeight, width: "100%" }}
      >
        <React.Suspense
          fallback={
            <div className="flex items-center justify-center h-full">
              <div className="animate-spin rounded-full h-10 w-10 border-b-4 border-primary"></div>
            </div>
          }
        >
          <AgGridReact
            rowData={serverSide ? undefined : data}
            serverSideDatasource={serverSide ? serverSideDatasource : undefined}
            columnDefs={columnDefs}
            defaultColDef={defaultColDef}
            components={components}
            gridOptions={{
              rowModelType: serverSide ? "serverSide" : "clientSide",
            }}
            // onGridReady={handleGridReady}
            onSelectionChanged={handleSelectionChanged}
            onCellValueChanged={onCellValueChanged}
            onCellEditingStopped={onCellEditingStopped}
            sideBar={{
              toolPanels: ["columns", "filters"],
              position: "right",
            }}
            animateRows={true}
            pagination={true}
            paginationPageSize={25}
            paginationPageSizeSelector={[10, 25, 50, 100, 200, 500]}
            paginationAutoPageSize={false}
            loading={loading}
            stopEditingWhenCellsLoseFocus={true}
            singleClickEdit={false}
          />
        </React.Suspense>
      </div>
    </div>
  );
}
