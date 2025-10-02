"use client";

import { useEffect, useCallback, useMemo, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { DataGrid, type ExcelColumn } from "../../../components/grid";
import type { ColDef } from "ag-grid-community";
import { api } from "../../providers";

import { Button } from "../../../components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../../components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "../../../components/ui/dialog";
import { Input } from "../../../components/ui/input";
import { Label } from "../../../components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../../components/ui/select";
import { Plus, Edit, Trash2, DollarSign } from "lucide-react";

interface CostCode {
  cost_code_id: string;
  cost_code: string;
  description: string | null;
  cost_type: string | null;
  accounting_db_id: string | null;
}

// Custom cell renderer for actions
const ActionsCellRenderer = ({
  data,
  onEdit,
  onDelete,
}: {
  data: CostCode;
  onEdit: (costCode: CostCode) => void;
  onDelete: (costCode: CostCode) => void;
}) => {
  return (
    <div className="flex items-center gap-2 h-full">
      <Button
        variant="outline"
        size="sm"
        onClick={() => onEdit(data)}
        className="h-8 w-8 p-0"
      >
        <Edit className="h-4 w-4" />
      </Button>
      <Button
        variant="outline"
        size="sm"
        onClick={() => onDelete(data)}
        className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
      >
        <Trash2 className="h-4 w-4" />
      </Button>
    </div>
  );
};

export default function CostCodesPage() {
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

  const builderId = session?.user?.builderId;
  const userId = session?.user?.id;

  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCostCode, setEditingCostCode] = useState<CostCode | null>(null);
  const [formData, setFormData] = useState({
    cost_code: "",
    description: "",
    cost_type: "",
    accounting_db_id: "",
  });

  // Data fetching
  const {
    data: costCodes = [],
    isLoading,
    refetch,
  } = api.costCodes.getAll.useQuery(
    { builderId: builderId! },
    { enabled: !!builderId }
  );

  const { data: costCodeTypes = [] } =
    api.costCodes.getCostCodeTypes.useQuery();

  // Mutations
  const createMutation = api.costCodes.create.useMutation({
    onSuccess: () => {
      refetch();
      setIsModalOpen(false);
      resetForm();
    },
  });

  const updateMutation = api.costCodes.update.useMutation({
    onSuccess: () => {
      refetch();
      setIsModalOpen(false);
      resetForm();
    },
  });

  const deleteMutation = api.costCodes.delete.useMutation({
    onSuccess: () => {
      refetch();
    },
  });

  const bulkImportMutation = api.costCodes.bulkImport.useMutation({
    onSuccess: (result) => {
      refetch();
      console.log(
        `Import completed: ${result.imported}/${result.total} records imported`
      );
      if (result.errors.length > 0) {
        console.error("Import errors:", result.errors);
      }
    },
  });

  const handleEdit = useCallback((costCode: CostCode) => {
    setEditingCostCode(costCode);
    setFormData({
      cost_code: costCode.cost_code,
      description: costCode.description || "",
      cost_type: costCode.cost_type || "none",
      accounting_db_id: costCode.accounting_db_id || "",
    });
    setIsModalOpen(true);
  }, []);

  const handleDelete = useCallback(
    async (costCode: CostCode) => {
      if (!builderId || !userId) return;

      if (
        confirm(
          `Are you sure you want to delete cost code "${costCode.cost_code}"?`
        )
      ) {
        try {
          await deleteMutation.mutateAsync({
            builderId,
            userId,
            costCodeId: costCode.cost_code_id,
          });
        } catch (error) {
          console.error("Error deleting cost code:", error);
        }
      }
    },
    [builderId, userId, deleteMutation]
  );

  // Column definitions
  const columnDefs = useMemo<ColDef[]>(
    () => [
      {
        headerName: "Cost Code",
        field: "cost_code",
        width: 150,
        pinned: "left",
      },
      {
        headerName: "Description",
        field: "description",
        width: 300,
      },
      {
        headerName: "Cost Type",
        field: "cost_type",
        width: 150,
      },
      {
        headerName: "Actions",
        field: "actions",
        width: 120,
        cellRenderer: (params: any) => (
          <ActionsCellRenderer
            data={params.data}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
        ),
      },
    ],
    [handleEdit, handleDelete]
  );

  // Excel columns for export
  const excelColumns = useMemo<ExcelColumn[]>(
    () => [
      { field: "cost_code", header: "Cost Code", type: "string" },
      { field: "description", header: "Description", type: "string" },
      { field: "cost_type", header: "Cost Type", type: "string" },
    ],
    []
  );

  const resetForm = () => {
    setFormData({
      cost_code: "",
      description: "",
      cost_type: "",
      accounting_db_id: "",
    });
    setEditingCostCode(null);
  };

  const handleInputChange = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!builderId || !userId) return;

    try {
      if (editingCostCode) {
        await updateMutation.mutateAsync({
          builderId,
          userId,
          costCodeId: editingCostCode.cost_code_id,
          cost_code: formData.cost_code,
          description: formData.description || null,
          cost_type:
            formData.cost_type === "none" ? null : formData.cost_type || null,
          accounting_db_id: formData.accounting_db_id || null,
        });
      } else {
        await createMutation.mutateAsync({
          builderId,
          userId,
          cost_code: formData.cost_code,
          description: formData.description || null,
          cost_type:
            formData.cost_type === "none" ? null : formData.cost_type || null,
          accounting_db_id: formData.accounting_db_id || null,
        });
      }
    } catch (error) {
      console.error("Error saving cost code:", error);
    }
  };

  const handleCreateCostCode = () => {
    resetForm();
    setIsModalOpen(true);
  };

  const handleImport = async (importedData: CostCode[]) => {
    if (!builderId || !userId) {
      console.error("Missing builderId or userId");
      return;
    }

    try {
      await bulkImportMutation.mutateAsync({
        builderId,
        userId,
        costCodes: importedData,
      });
    } catch (error) {
      console.error("Error importing cost codes:", error);
    }
  };

  if (!session) {
    return null;
  }

  return (
    <div className="container mx-auto py-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <DollarSign className="h-8 w-8" />
            Cost Codes
          </h1>
          <p className="text-muted-foreground">
            Manage job cost codes and cost types
          </p>
        </div>
        <Button
          onClick={handleCreateCostCode}
          className="flex items-center gap-2"
        >
          <Plus className="h-4 w-4" />
          Add Cost Code
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Cost Codes</CardTitle>
        </CardHeader>
        <CardContent>
          <DataGrid
            data={costCodes}
            loading={isLoading}
            columnDefs={columnDefs}
            excelColumns={excelColumns}
            tableName="cost_codes"
            onImport={handleImport}
            fileName="cost-codes"
            importTitle="Import Cost Codes"
          />
        </CardContent>
      </Card>

      {/* Cost Code Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent
          className="sm:max-w-[425px]"
          aria-describedby="cost-code-dialog-description"
        >
          <DialogHeader>
            <DialogTitle>
              {editingCostCode ? "Edit Cost Code" : "Create New Cost Code"}
            </DialogTitle>
            <p
              id="cost-code-dialog-description"
              className="text-sm text-muted-foreground"
            >
              {editingCostCode
                ? "Edit the cost code details below"
                : "Fill in the details to create a new cost code"}
            </p>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="cost_code" className="text-right">
                  Cost Code *
                </Label>
                <Input
                  id="cost_code"
                  value={formData.cost_code}
                  onChange={(e) =>
                    handleInputChange("cost_code", e.target.value)
                  }
                  className="col-span-3"
                  placeholder="Enter cost code..."
                  required
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="description" className="text-right">
                  Description
                </Label>
                <Input
                  id="description"
                  value={formData.description}
                  onChange={(e) =>
                    handleInputChange("description", e.target.value)
                  }
                  className="col-span-3"
                  placeholder="Enter description..."
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="cost_type" className="text-right">
                  Cost Type
                </Label>
                <div className="col-span-3">
                  <Select
                    value={formData.cost_type || ""}
                    onValueChange={(value) =>
                      handleInputChange("cost_type", value)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select cost type..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">No Cost Type</SelectItem>
                      {costCodeTypes.map((type: any) => (
                        <SelectItem
                          key={type.cost_code_type}
                          value={type.cost_code_type_name}
                        >
                          {type.cost_code_type_name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsModalOpen(false)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={createMutation.isPending || updateMutation.isPending}
              >
                {createMutation.isPending || updateMutation.isPending
                  ? "Saving..."
                  : "Save"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
