"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { api } from "../../../../lib/trpc";
import { Button } from "../../../../components/ui/button";
import { Input } from "../../../../components/ui/input";
import { Label } from "../../../../components/ui/label";
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
import { Textarea } from "../../../../components/ui/textarea";
import { Switch } from "../../../../components/ui/switch";
import { Badge } from "../../../../components/ui/badge";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "../../../../components/ui/tabs";
// import { useToast } from '@/components/ui/use-toast';

export default function FieldLabelsPage() {
  const { data: session } = useSession();
  // const { toast } = useToast();
  const [selectedTable, setSelectedTable] = useState<string>("");
  const [editingField, setEditingField] = useState<string | null>(null);

  const builderId = session?.user?.builderId;

  // Get available tables
  const { data: tables, isPending: tablesLoading } =
    api.fieldLabels.getTables.useQuery(
      { builderId: builderId! },
      { enabled: !!builderId }
    );

  // Get columns for selected table
  const { data: columns, isPending: columnsLoading } =
    api.fieldLabels.getTableColumns.useQuery(
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
      setEditingField(null);
    },
    onError: (error) => {
      console.error("Error updating field label:", error.message);
    },
  });

  const deleteMutation = api.fieldLabels.delete.useMutation({
    onSuccess: () => {
      console.log("Field label reset to default");
      refetchLabels();
    },
  });

  const handleSaveFieldLabel = async (
    columnName: string,
    formData: FormData
  ) => {
    if (!builderId) return;

    const customLabel = formData.get("custom_label") as string;
    const placeholderText = formData.get("placeholder_text") as string;
    const helpText = formData.get("help_text") as string;
    const isVisible = formData.get("is_visible") === "on";
    const isRequired =
      formData.get("is_required") === "on"
        ? true
        : formData.get("is_required") === "off"
        ? false
        : undefined;

    await upsertMutation.mutateAsync({
      builderId,
      table_name: selectedTable,
      column_name: columnName,
      custom_label: customLabel || columnName,
      placeholder_text: placeholderText || undefined,
      help_text: helpText || undefined,
      is_visible: isVisible,
      is_required: isRequired,
    });
  };

  const handleResetFieldLabel = async (columnName: string) => {
    if (!builderId) return;
    await deleteMutation.mutateAsync({
      builderId,
      tableName: selectedTable,
      columnName,
    });
  };

  if (!builderId) {
    return <div>Please log in to access field label configuration.</div>;
  }

  return (
    <div className="container mx-auto py-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Field Label Configuration</h1>
        <p className="text-muted-foreground">
          Customize field labels and visibility for your organization's
          terminology
        </p>
      </div>

      <Tabs defaultValue="configure" className="space-y-6">
        <TabsList>
          <TabsTrigger value="configure">Configure Labels</TabsTrigger>
          <TabsTrigger value="preview">Preview Changes</TabsTrigger>
        </TabsList>

        <TabsContent value="configure">
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
                <Select value={selectedTable} onValueChange={setSelectedTable}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select a table..." />
                  </SelectTrigger>
                  <SelectContent>
                    {tables?.map((table: any) => (
                      <SelectItem
                        key={table.table_name}
                        value={table.table_name}
                      >
                        {table.table_name} ({table.column_count} fields)
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </CardContent>
            </Card>

            {/* Field Configuration */}
            {selectedTable && (
              <Card>
                <CardHeader>
                  <CardTitle>Field Configuration - {selectedTable}</CardTitle>
                  <CardDescription>
                    Customize labels, placeholders, and visibility for each
                    field
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {columnsLoading ? (
                    <div>Loading fields...</div>
                  ) : (
                    <div className="space-y-4">
                      {columns?.map((column: any) => {
                        const isEditing = editingField === column.column_name;
                        const currentLabel = fieldLabels?.[column.column_name];

                        return (
                          <div
                            key={column.column_name}
                            className="border rounded-lg p-4"
                          >
                            <div className="flex items-center justify-between mb-2">
                              <div className="flex items-center space-x-2">
                                <Badge variant="outline">
                                  {column.data_type}
                                </Badge>
                                <span className="font-medium">
                                  {column.column_name}
                                </span>
                                {currentLabel && (
                                  <Badge variant="secondary">Customized</Badge>
                                )}
                              </div>
                              <div className="space-x-2">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() =>
                                    setEditingField(
                                      isEditing ? null : column.column_name
                                    )
                                  }
                                >
                                  {isEditing ? "Cancel" : "Edit"}
                                </Button>
                                {currentLabel && (
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() =>
                                      handleResetFieldLabel(column.column_name)
                                    }
                                    disabled={deleteMutation.isPending}
                                  >
                                    Reset
                                  </Button>
                                )}
                              </div>
                            </div>

                            {isEditing ? (
                              <form
                                action={(formData) =>
                                  handleSaveFieldLabel(
                                    column.column_name,
                                    formData
                                  )
                                }
                              >
                                <div className="grid gap-4">
                                  <div className="grid grid-cols-2 gap-4">
                                    <div>
                                      <Label htmlFor="custom_label">
                                        Custom Label
                                      </Label>
                                      <Input
                                        id="custom_label"
                                        name="custom_label"
                                        defaultValue={
                                          currentLabel?.custom_label ||
                                          column.column_name
                                        }
                                        placeholder="Enter custom label..."
                                      />
                                    </div>
                                    <div>
                                      <Label htmlFor="placeholder_text">
                                        Placeholder Text
                                      </Label>
                                      <Input
                                        id="placeholder_text"
                                        name="placeholder_text"
                                        defaultValue={
                                          currentLabel?.placeholder_text || ""
                                        }
                                        placeholder="Enter placeholder..."
                                      />
                                    </div>
                                  </div>

                                  <div>
                                    <Label htmlFor="help_text">Help Text</Label>
                                    <Textarea
                                      id="help_text"
                                      name="help_text"
                                      defaultValue={
                                        currentLabel?.help_text || ""
                                      }
                                      placeholder="Enter help text..."
                                      rows={2}
                                    />
                                  </div>

                                  <div className="flex items-center space-x-6">
                                    <div className="flex items-center space-x-2">
                                      <Switch
                                        id="is_visible"
                                        name="is_visible"
                                        defaultChecked={
                                          currentLabel?.is_visible ?? true
                                        }
                                      />
                                      <Label htmlFor="is_visible">
                                        Visible
                                      </Label>
                                    </div>

                                    <div className="flex items-center space-x-2">
                                      <select
                                        name="is_required"
                                        className="border rounded px-2 py-1"
                                      >
                                        <option value="">Use Default</option>
                                        <option
                                          value="on"
                                          selected={
                                            currentLabel?.is_required === true
                                          }
                                        >
                                          Required
                                        </option>
                                        <option
                                          value="off"
                                          selected={
                                            currentLabel?.is_required === false
                                          }
                                        >
                                          Optional
                                        </option>
                                      </select>
                                      <Label>Requirement</Label>
                                    </div>
                                  </div>

                                  <div className="flex space-x-2">
                                    <Button
                                      type="submit"
                                      disabled={upsertMutation.isPending}
                                    >
                                      {upsertMutation.isPending
                                        ? "Saving..."
                                        : "Save"}
                                    </Button>
                                    <Button
                                      type="button"
                                      variant="outline"
                                      onClick={() => setEditingField(null)}
                                    >
                                      Cancel
                                    </Button>
                                  </div>
                                </div>
                              </form>
                            ) : (
                              <div className="text-sm text-muted-foreground">
                                <div>
                                  <strong>Display Label:</strong>{" "}
                                  {currentLabel?.custom_label ||
                                    column.column_name}
                                </div>
                                {currentLabel?.placeholder_text && (
                                  <div>
                                    <strong>Placeholder:</strong>{" "}
                                    {currentLabel.placeholder_text}
                                  </div>
                                )}
                                {currentLabel?.help_text && (
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
                                {currentLabel?.is_required !== undefined && (
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
        </TabsContent>

        <TabsContent value="preview">
          <Card>
            <CardHeader>
              <CardTitle>Preview Field Labels</CardTitle>
              <CardDescription>
                See how your custom field labels will appear in forms
              </CardDescription>
            </CardHeader>
            <CardContent>
              {selectedTable && columns ? (
                <div className="space-y-3">
                  <h3 className="font-semibold">
                    {selectedTable} Form Preview
                  </h3>
                  {columns
                    .filter(
                      (col: any) =>
                        fieldLabels?.[col.column_name]?.is_visible !== false
                    )
                    .map((column: any) => {
                      const currentLabel = fieldLabels?.[column.column_name];
                      return (
                        <div key={column.column_name} className="space-y-1">
                          <Label>
                            {currentLabel?.custom_label || column.column_name}
                            {currentLabel?.is_required && (
                              <span className="text-red-500"> *</span>
                            )}
                          </Label>
                          <Input
                            placeholder={
                              currentLabel?.placeholder_text ||
                              `Enter ${
                                currentLabel?.custom_label || column.column_name
                              }...`
                            }
                            disabled
                          />
                          {currentLabel?.help_text && (
                            <p className="text-xs text-muted-foreground">
                              {currentLabel.help_text}
                            </p>
                          )}
                        </div>
                      );
                    })}
                </div>
              ) : (
                <div className="text-muted-foreground">
                  Select a table to preview field labels
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
