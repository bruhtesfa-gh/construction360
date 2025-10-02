"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { api } from "../../../providers";
import {
  Card,
  CardContent,
  CardDescription,
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
import { Button } from "../../../../components/ui/button";
import { Input } from "../../../../components/ui/input";
import { Label } from "../../../../components/ui/label";
import { Badge } from "../../../../components/ui/badge";

interface Column {
  column_name: string;
  data_type: string;
  is_nullable: string;
  current_custom_label?: string;
  is_visible_override?: boolean;
}

export default function FieldLabelsPage() {
  const { data: session } = useSession();
  const [selectedTable, setSelectedTable] = useState<string>("");
  const [editingField, setEditingField] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({
    custom_label: "",
    placeholder_text: "",
    help_text: "",
    is_visible: true,
    is_required: undefined as boolean | undefined,
  });

  const builderId = session?.user?.builderId;
  const userId = session?.user?.id;

  // Get available tables
  const { data: tables, isPending: tablesLoading } =
    api.fieldLabels.getTables.useQuery(
      { builderId: builderId! },
      { enabled: !!builderId }
    );

  // Get columns for selected table
  const {
    data: columns,
    isPending: columnsLoading,
    refetch: refetchColumns,
  } = api.fieldLabels.getTableColumns.useQuery(
    { builderId: builderId!, tableName: selectedTable },
    { enabled: !!builderId && !!selectedTable }
  );

  // Get current field labels
  const { data: fieldLabels, refetch: refetchLabels } =
    api.fieldLabels.getByTable.useQuery(
      { builderId: builderId!, tableName: selectedTable },
      { enabled: !!builderId && !!selectedTable }
    );

  // Mutations
  const upsertMutation = api.fieldLabels.upsert.useMutation({
    onSuccess: () => {
      console.log("Field label updated successfully");
      refetchLabels();
      refetchColumns();
      setEditingField(null);
      resetEditForm();
    },
    onError: (error) => {
      console.error("Error updating field label:", error.message);
    },
  });

  const deleteMutation = api.fieldLabels.delete.useMutation({
    onSuccess: () => {
      console.log("Field label reset to default");
      refetchLabels();
      refetchColumns();
    },
  });

  const resetEditForm = () => {
    setEditForm({
      custom_label: "",
      placeholder_text: "",
      help_text: "",
      is_visible: true,
      is_required: undefined,
    });
  };

  const startEditing = (column: Column) => {
    const currentLabel = fieldLabels?.[column.column_name];
    setEditingField(column.column_name);
    setEditForm({
      custom_label: currentLabel?.custom_label || column.column_name || "",
      placeholder_text: currentLabel?.placeholder_text || "",
      help_text: currentLabel?.help_text || "",
      is_visible: currentLabel?.is_visible ?? true,
      is_required: currentLabel?.is_required ?? undefined,
    });
  };

  const handleSave = async () => {
    if (!builderId || !editingField) return;

    const payload: any = {
      builderId,
      table_name: selectedTable,
      column_name: editingField,
      custom_label: editForm.custom_label.trim() || editingField,
      is_visible: editForm.is_visible,
    };

    // Only include optional fields if they have values
    if (editForm.placeholder_text && editForm.placeholder_text.trim()) {
      payload.placeholder_text = editForm.placeholder_text.trim();
    }

    if (editForm.help_text && editForm.help_text.trim()) {
      payload.help_text = editForm.help_text.trim();
    }

    if (editForm.is_required !== undefined) {
      payload.is_required = editForm.is_required;
    }

    // Add userId to payload
    if (userId) {
      payload.userId = userId;
    }

    try {
      await upsertMutation.mutateAsync(payload);
    } catch (error) {
      console.error("Failed to save field label:", error);
    }
  };

  const handleReset = async (columnName: string) => {
    if (!builderId) return;

    try {
      await deleteMutation.mutateAsync({
        builderId,
        tableName: selectedTable,
        columnName,
      });
    } catch (error) {
      console.error("Failed to reset field label:", error);
    }
  };

  if (!builderId) {
    return (
      <div className="container mx-auto py-6">
        <Card>
          <CardContent className="pt-6">
            <p>Please log in to access field label configuration.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Field Label Configuration</h1>
        <p className="text-muted-foreground">
          Customize field labels, visibility, and requirements for your
          organization
        </p>
      </div>

      <div className="grid gap-6">
        {/* Table Selection */}
        <Card>
          <CardHeader>
            <CardTitle>Select Table</CardTitle>
            <CardDescription>
              Choose a table to customize field labels for
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Select
              value={selectedTable}
              onValueChange={setSelectedTable}
              disabled={tablesLoading}
            >
              <SelectTrigger>
                <SelectValue
                  placeholder={
                    tablesLoading ? "Loading tables..." : "Select a table..."
                  }
                />
              </SelectTrigger>
              <SelectContent>
                {tables?.map((table: any) => (
                  <SelectItem key={table.table_name} value={table.table_name}>
                    {table.table_name} ({table.column_count} fields)
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </CardContent>
        </Card>

        {/* Field Configuration Table */}
        {selectedTable && (
          <Card>
            <CardHeader>
              <CardTitle>
                Configure Fields - {selectedTable}
                {fieldLabels && (
                  <Badge variant="secondary" className="ml-2">
                    {Object.keys(fieldLabels).length} customized
                  </Badge>
                )}
              </CardTitle>
              <CardDescription>
                Customize how fields appear to your users
              </CardDescription>
            </CardHeader>
            <CardContent>
              {columnsLoading ? (
                <div className="text-center py-8">Loading fields...</div>
              ) : (
                <div className="space-y-3">
                  {columns
                    ?.filter((column) => column && (column as any).column_name)
                    .map((row) => {
                      const column = row as Column;
                      const isEditing = editingField === column.column_name;
                      const currentLabel = fieldLabels?.[column.column_name];

                      return (
                        <div
                          key={column.column_name}
                          className="border rounded-lg p-4"
                        >
                          <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center space-x-2">
                              <span className="font-medium">
                                {column.column_name}
                              </span>
                              <Badge variant="outline" className="text-xs">
                                {column.data_type}
                              </Badge>
                              {currentLabel && (
                                <Badge variant="secondary" className="text-xs">
                                  Custom
                                </Badge>
                              )}
                            </div>
                            <div className="space-x-2">
                              {!isEditing ? (
                                <>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => startEditing(column)}
                                  >
                                    Edit
                                  </Button>
                                  {currentLabel && (
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() =>
                                        handleReset(column.column_name)
                                      }
                                      disabled={deleteMutation.isPending}
                                    >
                                      Reset
                                    </Button>
                                  )}
                                </>
                              ) : (
                                <>
                                  <Button
                                    size="sm"
                                    onClick={handleSave}
                                    disabled={upsertMutation.isPending}
                                  >
                                    {upsertMutation.isPending
                                      ? "Saving..."
                                      : "Save"}
                                  </Button>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => {
                                      setEditingField(null);
                                      resetEditForm();
                                    }}
                                  >
                                    Cancel
                                  </Button>
                                </>
                              )}
                            </div>
                          </div>

                          {isEditing ? (
                            <div className="grid gap-4">
                              <div className="grid grid-cols-2 gap-4">
                                <div>
                                  <Label>Custom Label</Label>
                                  <Input
                                    value={editForm.custom_label || ""}
                                    onChange={(e) =>
                                      setEditForm((prev) => ({
                                        ...prev,
                                        custom_label: e.target.value,
                                      }))
                                    }
                                    placeholder="Enter custom label..."
                                  />
                                </div>
                                <div>
                                  <Label>Placeholder Text</Label>
                                  <Input
                                    value={editForm.placeholder_text || ""}
                                    onChange={(e) =>
                                      setEditForm((prev) => ({
                                        ...prev,
                                        placeholder_text: e.target.value,
                                      }))
                                    }
                                    placeholder="Enter placeholder text..."
                                  />
                                </div>
                              </div>

                              <div>
                                <Label>Help Text</Label>
                                <Input
                                  value={editForm.help_text || ""}
                                  onChange={(e) =>
                                    setEditForm((prev) => ({
                                      ...prev,
                                      help_text: e.target.value,
                                    }))
                                  }
                                  placeholder="Enter help text..."
                                />
                              </div>

                              <div className="flex items-center space-x-6">
                                <div className="flex items-center space-x-2">
                                  <input
                                    type="checkbox"
                                    checked={editForm.is_visible}
                                    onChange={(e) =>
                                      setEditForm((prev) => ({
                                        ...prev,
                                        is_visible: e.target.checked,
                                      }))
                                    }
                                  />
                                  <Label>Visible</Label>
                                </div>

                                <div className="flex items-center space-x-2">
                                  <select
                                    value={
                                      editForm.is_required === undefined
                                        ? ""
                                        : editForm.is_required.toString()
                                    }
                                    onChange={(e) =>
                                      setEditForm((prev) => ({
                                        ...prev,
                                        is_required:
                                          e.target.value === ""
                                            ? undefined
                                            : e.target.value === "true",
                                      }))
                                    }
                                    className="border rounded px-2 py-1"
                                  >
                                    <option value="">Use Default</option>
                                    <option value="true">Required</option>
                                    <option value="false">Optional</option>
                                  </select>
                                  <Label>Requirement</Label>
                                </div>
                              </div>
                            </div>
                          ) : (
                            <div className="text-sm text-muted-foreground">
                              <div>
                                <strong>Display Label:</strong>{" "}
                                {currentLabel?.custom_label ||
                                  column.column_name ||
                                  "Unknown"}
                              </div>
                              {currentLabel?.placeholder_text &&
                                currentLabel.placeholder_text.trim() && (
                                  <div>
                                    <strong>Placeholder:</strong>{" "}
                                    {currentLabel.placeholder_text}
                                  </div>
                                )}
                              {currentLabel?.help_text &&
                                currentLabel.help_text.trim() && (
                                  <div>
                                    <strong>Help:</strong>{" "}
                                    {currentLabel.help_text}
                                  </div>
                                )}
                              <div>
                                <strong>Visible:</strong>{" "}
                                {currentLabel?.is_visible ?? true
                                  ? "Yes"
                                  : "No"}
                              </div>
                              {currentLabel?.is_required !== undefined &&
                                currentLabel?.is_required !== null && (
                                  <div>
                                    <strong>Required:</strong>{" "}
                                    {currentLabel.is_required ? "Yes" : "No"}
                                  </div>
                                )}
                            </div>
                          )}
                        </div>
                      );
                    })}
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
