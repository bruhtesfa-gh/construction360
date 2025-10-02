"use client";

import React, { useState, useCallback, useRef, useEffect } from "react";
import dynamic from "next/dynamic";
import type { AgGridReactProps } from "ag-grid-react";
import type {
  ColDef,
  GridApi,
  GridReadyEvent,
  SelectionChangedEvent,
  CellValueChangedEvent,
  CellEditingStoppedEvent,
} from "ag-grid-community";

// Dynamically import AgGridReact to avoid SSR issues
const AgGridReact = dynamic(
  () => import("../../core/grid/ag-grid-config").then((mod) => mod.AgGridReact),
  {
    ssr: false,
    loading: () => (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    ),
  }
) as React.ComponentType<AgGridReactProps<any>>;
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "../ui/dialog";
import {
  Download,
  Upload,
  FileSpreadsheet,
  Columns,
  Filter,
  Search,
} from "lucide-react";
import {
  downloadExcelTemplate,
  exportToExcel,
  parseExcelFile,
  validateImportData,
  mapImportData,
  type ExcelColumn,
} from "../../lib/excel-utils";
import { useFieldLabels } from "../../hooks/useFieldLabels";
import { useUserGridSettings } from "../../hooks/useUserGridSettings";

interface DataGridProps<T> {
  // Data
  data: T[];
  loading?: boolean;

  // Columns
  columnDefs: ColDef[];
  excelColumns: ExcelColumn[];

  // Field Labels
  tableName?: string; // Enable field labeling for this table

  // Features
  enableExport?: boolean;
  enableImport?: boolean;
  enableColumnToggle?: boolean;
  enableGlobalSearch?: boolean;
  enableFilterRow?: boolean;
  enableEditing?: boolean;

  // Callbacks
  onImport?: (data: T[]) => Promise<void>;
  onSelectionChanged?: (selectedRows: T[]) => void;
  onGridReady?: (api: GridApi) => void;
  onCellValueChanged?: (event: CellValueChangedEvent<T>) => void;
  onCellEditingStopped?: (event: CellEditingStoppedEvent<T>) => void;

  // Customization
  gridHeight?: string;
  fileName?: string;
  importTitle?: string;
  rowSelection?:
    | "single"
    | "multiple"
    | {
        mode: "singleRow" | "multiRow";
        headerCheckbox?: boolean;
        checkboxes?: boolean | ((params: any) => boolean);
      };
}

export function DataGrid<T extends Record<string, any>>({
  data,
  loading = false,
  columnDefs,
  excelColumns,
  tableName,
  enableExport = true,
  enableImport = true,
  enableColumnToggle = true,
  enableGlobalSearch = true,
  enableFilterRow = true,
  enableEditing = false,
  onImport,
  onSelectionChanged,
  onGridReady,
  onCellValueChanged,
  onCellEditingStopped,
  gridHeight = "600px",
  fileName = "export",
  importTitle = "Import Data",
  rowSelection = "multiple",
}: DataGridProps<T>) {
  // Grid state
  const [gridApi, setGridApi] = useState<GridApi | null>(null);
  const [showFilterRow, setShowFilterRow] = useState(false);
  const [globalSearchTerm, setGlobalSearchTerm] = useState("");

  // User grid settings
  const { defaultPageSize } = useUserGridSettings();

  // Field labels for column header customization
  const fieldLabelsHook = useFieldLabels(tableName || "");

  // Enhanced column definitions with field labels
  const enhancedColumnDefs = React.useMemo(() => {
    if (!tableName || !fieldLabelsHook.fieldLabels) {
      return columnDefs;
    }

    return columnDefs.map((colDef) => {
      // Only enhance columns that have a field property (data columns)
      if (!colDef.field) return colDef;

      const customLabel = fieldLabelsHook.getLabel(
        colDef.field,
        colDef.headerName || colDef.field
      );
      const isVisible = fieldLabelsHook.isVisible(colDef.field);

      return {
        ...colDef,
        headerName: customLabel,
        hide: !isVisible, // Hide columns that are marked as not visible
      };
    });
  }, [
    columnDefs,
    tableName,
    fieldLabelsHook.fieldLabels,
    fieldLabelsHook.getLabel,
    fieldLabelsHook.isVisible,
  ]);
  const [selectedRows, setSelectedRows] = useState<T[]>([]);

  // Import state
  const [importModalOpen, setImportModalOpen] = useState(false);
  const [importFile, setImportFile] = useState<File | null>(null);
  const [importData, setImportData] = useState<any[]>([]);
  const [importErrors, setImportErrors] = useState<string[]>([]);
  const [isImporting, setIsImporting] = useState(false);

  // Column visibility state
  const [columnVisibility, setColumnVisibility] = useState<
    Record<string, boolean>
  >({});
  const [showColumnSelector, setShowColumnSelector] = useState(false);

  // File input ref
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Initialize column visibility
  useEffect(() => {
    const visibility: Record<string, boolean> = {};
    columnDefs.forEach((col) => {
      if (typeof col.field === "string") {
        visibility[col.field] = col.hide !== true;
      }
    });
    setColumnVisibility(visibility);
  }, [columnDefs]);

  // Handle grid ready
  const handleGridReady = useCallback(
    (params: GridReadyEvent) => {
      try {
        setGridApi(params.api);
        onGridReady?.(params.api);
      } catch (error) {
        console.error("Grid ready error:", error);
      }
    },
    [onGridReady]
  );

  // Handle selection change
  const handleSelectionChanged = useCallback(
    (event: SelectionChangedEvent) => {
      const selected = event.api.getSelectedRows();
      setSelectedRows(selected);
      onSelectionChanged?.(selected);
    },
    [onSelectionChanged]
  );

  // Excel handlers
  const handleDownloadTemplate = useCallback(() => {
    if (
      !excelColumns ||
      !Array.isArray(excelColumns) ||
      excelColumns.length === 0
    ) {
      console.error("Excel columns not properly defined in DataGrid");
      alert(
        "Excel template configuration is missing. Please check the component setup."
      );
      return;
    }
    try {
      downloadExcelTemplate(excelColumns, `${fileName}_template.xlsx`);
    } catch (error) {
      console.error("Failed to download template:", error);
      alert(
        "Failed to download template. Please check the console for details."
      );
    }
  }, [excelColumns, fileName]);

  const handleExportToExcel = useCallback(() => {
    const dataToExport = selectedRows.length > 0 ? selectedRows : data;
    if (dataToExport.length === 0) {
      alert("No data to export");
      return;
    }
    if (
      !excelColumns ||
      !Array.isArray(excelColumns) ||
      excelColumns.length === 0
    ) {
      console.error("Excel columns not properly defined in DataGrid");
      alert(
        "Excel export configuration is missing. Please check the component setup."
      );
      return;
    }
    try {
      exportToExcel(
        dataToExport,
        excelColumns,
        `${fileName}_${new Date().toISOString().slice(0, 10)}.xlsx`
      );
    } catch (error) {
      console.error("Failed to export data:", error);
      alert("Failed to export data. Please check the console for details.");
    }
  }, [selectedRows, data, excelColumns, fileName]);

  const handleFileUpload = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;

      setImportFile(file);
      setImportErrors([]);
      setImportData([]);

      try {
        const parsedData = await parseExcelFile(file);
        const validation = validateImportData(parsedData, excelColumns);

        if (!validation.valid) {
          setImportErrors(validation.errors);
          return;
        }

        const mappedData = mapImportData(parsedData, excelColumns);
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

  const handleProcessImport = useCallback(async () => {
    if (!onImport || importData.length === 0) return;

    setIsImporting(true);
    try {
      await onImport(importData);
      setImportModalOpen(false);
      setImportFile(null);
      setImportData([]);
      setImportErrors([]);
    } catch (error) {
      console.error("Import failed:", error);
      setImportErrors([
        "Failed to import data. Please check the console for details.",
      ]);
    } finally {
      setIsImporting(false);
    }
  }, [importData, onImport]);

  // Column visibility handler
  const handleColumnVisibilityChange = useCallback(
    (field: string, visible: boolean) => {
      setColumnVisibility((prev) => ({ ...prev, [field]: visible }));
      if (gridApi) {
        gridApi.setColumnsVisible([field], visible);
      }
    },
    [gridApi]
  );

  // Apply global search
  useEffect(() => {
    if (gridApi) {
      try {
        gridApi.setGridOption("quickFilterText", globalSearchTerm);
      } catch (error) {
        console.warn("Failed to apply global search:", error);
      }
    }
  }, [gridApi, globalSearchTerm]);

  // Apply filter row visibility
  useEffect(() => {
    if (gridApi) {
      try {
        gridApi.setGridOption(
          "floatingFiltersHeight",
          showFilterRow ? undefined : 0
        );
      } catch (error) {
        console.warn("Failed to toggle filter row:", error);
      }
    }
  }, [gridApi, showFilterRow]);

  // Default column definition
  const defaultColDef = {
    sortable: true,
    filter: true,
    resizable: true,
    floatingFilter: showFilterRow,
    suppressHeaderMenuButton: true,
    editable: enableEditing,
  };

  // Handle cell value changes
  const handleCellValueChanged = useCallback(
    (event: CellValueChangedEvent<T>) => {
      console.log("Cell value changed:", {
        rowIndex: event.rowIndex,
        column: event.column.getId(),
        oldValue: event.oldValue,
        newValue: event.newValue,
        data: event.data,
      });
      onCellValueChanged?.(event);
    },
    [onCellValueChanged]
  );

  // Handle cell editing stopped
  const handleCellEditingStopped = useCallback(
    (event: CellEditingStoppedEvent<T>) => {
      onCellEditingStopped?.(event);
    },
    [onCellEditingStopped]
  );

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        {/* Left side - Search and filters */}
        <div className="flex items-center gap-2">
          {enableGlobalSearch && (
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search all columns..."
                value={globalSearchTerm}
                onChange={(e) => setGlobalSearchTerm(e.target.value)}
                className="pl-9 w-64"
              />
            </div>
          )}
          {enableFilterRow && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowFilterRow(!showFilterRow)}
              className="flex items-center gap-2"
            >
              <Filter className="h-4 w-4" />
              {showFilterRow ? "Hide" : "Show"} Filters
            </Button>
          )}
          {enableColumnToggle && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowColumnSelector(!showColumnSelector)}
              className="flex items-center gap-2"
            >
              <Columns className="h-4 w-4" />
              Columns
            </Button>
          )}
        </div>

        {/* Right side - Excel actions */}
        <div className="flex items-center gap-2">
          {enableImport && (
            <>
              <Button
                variant="outline"
                size="sm"
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
                  size="sm"
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
                ref={fileInputRef}
                id="excel-upload"
                type="file"
                accept=".xlsx,.xls"
                onChange={handleFileUpload}
                className="hidden"
              />
            </>
          )}
          {enableExport && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleExportToExcel}
              disabled={data.length === 0}
              className="flex items-center gap-2"
            >
              <Download className="h-4 w-4" />
              Export {selectedRows.length > 0 && `(${selectedRows.length})`}
            </Button>
          )}
        </div>
      </div>

      {/* Column selector dropdown */}
      {showColumnSelector && (
        <div className="rounded-lg border bg-card p-4">
          <h4 className="mb-3 font-medium">Toggle Columns</h4>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4">
            {columnDefs.map((col) => {
              const field = typeof col.field === "string" ? col.field : "";
              const headerName = col.headerName || field;
              if (!field) return null;

              return (
                <label key={field} className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={columnVisibility[field] !== false}
                    onChange={(e) =>
                      handleColumnVisibilityChange(field, e.target.checked)
                    }
                    className="rounded border-gray-300"
                  />
                  <span className="text-sm">{headerName}</span>
                </label>
              );
            })}
          </div>
        </div>
      )}

      {/* Grid */}
      <div
        className="ag-theme-quartz rounded-md border bg-card"
        style={{ height: gridHeight, width: "100%" }}
      >
        <React.Suspense
          fallback={
            <div className="flex items-center justify-center h-full">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          }
        >
          <AgGridReact
            rowData={data}
            columnDefs={enhancedColumnDefs}
            defaultColDef={defaultColDef}
            rowSelection={
              typeof rowSelection === "string"
                ? {
                    mode: rowSelection === "single" ? "singleRow" : "multiRow",
                    headerCheckbox: rowSelection === "multiple",
                    checkboxes: true,
                  }
                : rowSelection
            }
            onGridReady={handleGridReady}
            onSelectionChanged={handleSelectionChanged}
            onCellValueChanged={handleCellValueChanged}
            onCellEditingStopped={handleCellEditingStopped}
            animateRows={true}
            pagination={true}
            paginationPageSize={defaultPageSize}
            paginationPageSizeSelector={[10, 25, 50, 100, 200, 500]}
            paginationAutoPageSize={false}
            loading={loading}
            stopEditingWhenCellsLoseFocus={true}
            singleClickEdit={false}
          />
        </React.Suspense>
      </div>

      {/* Import Modal */}
      {enableImport && (
        <Dialog open={importModalOpen} onOpenChange={setImportModalOpen}>
          <DialogContent className="max-w-4xl max-h-[80vh] overflow-hidden flex flex-col">
            <DialogHeader>
              <DialogTitle>{importTitle}</DialogTitle>
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
                      {importData.length} rows ready to import
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
                          {excelColumns.slice(0, 5).map((col) => (
                            <th
                              key={col.field}
                              className="px-4 py-2 text-left text-xs font-medium text-gray-500"
                            >
                              {col.header || col.headerName || col.field}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {importData.slice(0, 10).map((row, index) => (
                          <tr key={index}>
                            {excelColumns.slice(0, 5).map((col) => (
                              <td key={col.field} className="px-4 py-2 text-sm">
                                {row[col.field] || "-"}
                              </td>
                            ))}
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
                  isImporting
                }
              >
                {isImporting
                  ? "Importing..."
                  : `Import ${importData.length} Rows`}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
