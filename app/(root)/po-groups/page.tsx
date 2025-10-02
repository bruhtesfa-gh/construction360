"use client";

import { useEffect, useMemo, useState, useCallback } from "react";
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
import { Switch } from "../../../components/ui/switch";
import { Plus, Edit, Trash2, Package } from "lucide-react";

interface POGroup {
  po_group_id: number;
  po_group: string;
  description: string | null;
  region_code: string;
  jc_cost_code: string | null;
  jc_cost_type: string | null;
  po_type: string | null;
  requires_payment_approval: boolean;
  use_in_scheduling: boolean;
}

export default function POGroupsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

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
  const [editingPOGroup, setEditingPOGroup] = useState<POGroup | null>(null);
  const [formData, setFormData] = useState({
    region_id: "",
    po_group: "",
    description: "",
    jc_cost_code: "",
    jc_cost_type: "",
    po_type: "",
    requires_payment_approval: false,
    use_in_scheduling: false,
  });

  // Data fetching
  const {
    data: poGroups = [],
    isLoading,
    refetch,
  } = api.poGroupFresh.getAll.useQuery(
    { builderId: builderId! },
    { enabled: !!builderId }
  );

  const { data: regions = [] } = api.regions.getAll.useQuery(
    { builderId: builderId! },
    { enabled: !!builderId }
  );

  // Mutations
  const createMutation = api.poGroupFresh.createDirect.useMutation({
    onSuccess: () => {
      refetch();
      setIsModalOpen(false);
      resetForm();
    },
  });

  const updateMutation = api.poGroupFresh.updateDirect.useMutation({
    onSuccess: () => {
      refetch();
      setIsModalOpen(false);
      resetForm();
    },
  });

  const deleteMutation = api.poGroupFresh.deleteDirect.useMutation({
    onSuccess: () => {
      refetch();
    },
  });

  const bulkImportMutation = api.poGroupFresh.bulkImport.useMutation({
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

  // Action handlers using pattern from Jobs page
  const ActionsCellRenderer = ({
    data,
    onEdit,
    onDelete,
  }: {
    data: POGroup;
    onEdit: (poGroup: POGroup) => void;
    onDelete: (poGroup: POGroup) => void;
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

  // Excel columns
  const excelColumns = useMemo<ExcelColumn[]>(
    () => [
      { field: "po_group", header: "PO Group", type: "string" },
      { field: "description", header: "Description", type: "string" },
      { field: "region_code", header: "Region Code", type: "string" },
      { field: "jc_cost_code", header: "Cost Code", type: "string" },
      { field: "po_type", header: "PO Type", type: "string" },
      {
        field: "requires_payment_approval",
        header: "Payment Approval",
        type: "boolean",
      },
      {
        field: "use_in_scheduling",
        header: "Use in Scheduling",
        type: "boolean",
      },
    ],
    []
  );

  const resetForm = () => {
    setFormData({
      region_id: "",
      po_group: "",
      description: "",
      jc_cost_code: "",
      jc_cost_type: "",
      po_type: "",
      requires_payment_approval: false,
      use_in_scheduling: false,
    });
    setEditingPOGroup(null);
  };

  const handleInputChange = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!builderId || !userId) return;

    // Validate required fields
    if (!formData.region_id || !formData.po_group.trim()) {
      alert("Please fill in all required fields (Region and PO Group)");
      return;
    }

    try {
      const submitData = {
        builderId,
        region_id: formData.region_id,
        po_group: formData.po_group.trim(),
        description: formData.description || null,
        jc_cost_code: formData.jc_cost_code || null,
        jc_cost_type: formData.jc_cost_type || null,
        po_type: formData.po_type || null,
        requires_payment_approval: formData.requires_payment_approval,
        use_in_scheduling: formData.use_in_scheduling,
      };

      if (editingPOGroup) {
        await updateMutation.mutateAsync({
          ...submitData,
          poGroupId: editingPOGroup.po_group_id,
        });
      } else {
        await createMutation.mutateAsync({
          ...submitData,
          userId,
        });
      }
    } catch (error) {
      console.error("Error saving PO group:", error);
      alert("Error saving PO group. Please try again.");
    }
  };

  const handleEdit = useCallback(
    (poGroup: POGroup) => {
      setEditingPOGroup(poGroup);

      // Find the region ID from region_code
      const region = regions.find((r) => r.region_code === poGroup.region_code);

      setFormData({
        region_id: region?.region_id || "",
        po_group: poGroup.po_group,
        description: poGroup.description || "",
        jc_cost_code: poGroup.jc_cost_code || "",
        jc_cost_type: poGroup.jc_cost_type || "",
        po_type: poGroup.po_type || "",
        requires_payment_approval: poGroup.requires_payment_approval,
        use_in_scheduling: poGroup.use_in_scheduling,
      });
      setIsModalOpen(true);
    },
    [regions]
  );

  const handleDelete = useCallback(
    async (poGroup: POGroup) => {
      if (!builderId) return;

      if (confirm(`Delete PO Group "${poGroup.po_group}"?`)) {
        try {
          await deleteMutation.mutateAsync({
            builderId,
            poGroupId: poGroup.po_group_id,
          });
        } catch (error) {
          console.error("Error deleting PO group:", error);
        }
      }
    },
    [builderId, deleteMutation]
  );

  const handleImport = useCallback(
    async (importedData: any[]) => {
      if (!builderId || !userId) {
        console.error("Missing builderId or userId");
        return;
      }

      try {
        await bulkImportMutation.mutateAsync({
          builderId,
          userId,
          poGroups: importedData,
        });
      } catch (error) {
        console.error("Error importing PO groups:", error);
      }
    },
    [builderId, userId, bulkImportMutation]
  );

  // Column definitions - using exact pattern from working Jobs page
  const columnDefs = useMemo<ColDef[]>(
    () => [
      { headerName: "PO Group", field: "po_group", width: 150, pinned: "left" },
      { headerName: "Description", field: "description", width: 250 },
      { headerName: "Region", field: "region_code", width: 100 },
      { headerName: "Cost Code", field: "jc_cost_code", width: 120 },
      { headerName: "Cost Type", field: "jc_cost_type", width: 120 },
      { headerName: "PO Type", field: "po_type", width: 120 },
      {
        headerName: "Payment Approval",
        field: "requires_payment_approval",
        width: 150,
        cellRenderer: (params: any) =>
          params.value ? "Required" : "Not Required",
      },
      {
        headerName: "Use in Scheduling",
        field: "use_in_scheduling",
        width: 140,
        cellRenderer: (params: any) => (params.value ? "Yes" : "No"),
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

  if (!session) return null;

  return (
    <div className="container mx-auto py-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Package className="h-8 w-8" />
            PO Groups
          </h1>
          <p className="text-muted-foreground">Manage purchase order groups</p>
        </div>
        <Button onClick={() => setIsModalOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Add PO Group
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Purchase Order Groups</CardTitle>
        </CardHeader>
        <CardContent>
          <DataGrid
            data={poGroups}
            loading={isLoading}
            columnDefs={columnDefs}
            excelColumns={excelColumns}
            onImport={handleImport}
            tableName="po_group"
            fileName="po-groups"
            importTitle="Import PO Groups"
          />
        </CardContent>
      </Card>

      {/* Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingPOGroup ? "Edit" : "Create"} PO Group
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="grid gap-4 py-4">
              <div>
                <Label>Region *</Label>
                <Select
                  value={formData.region_id}
                  onValueChange={(value) =>
                    handleInputChange("region_id", value)
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select region..." />
                  </SelectTrigger>
                  <SelectContent>
                    {regions.map((region: any) => (
                      <SelectItem
                        key={region.region_id}
                        value={region.region_id}
                      >
                        {region.region_code} - {region.description}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>PO Group *</Label>
                <Input
                  value={formData.po_group}
                  onChange={(e) =>
                    handleInputChange("po_group", e.target.value)
                  }
                  placeholder="Enter PO group code..."
                  required
                />
              </div>

              <div>
                <Label>Description</Label>
                <Input
                  value={formData.description}
                  onChange={(e) =>
                    handleInputChange("description", e.target.value)
                  }
                  placeholder="Enter description..."
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Cost Code</Label>
                  <Input
                    value={formData.jc_cost_code}
                    onChange={(e) =>
                      handleInputChange("jc_cost_code", e.target.value)
                    }
                    placeholder="Enter cost code..."
                  />
                </div>
                <div>
                  <Label>Cost Type</Label>
                  <Input
                    value={formData.jc_cost_type}
                    onChange={(e) =>
                      handleInputChange("jc_cost_type", e.target.value)
                    }
                    placeholder="Enter cost type..."
                  />
                </div>
              </div>

              <div>
                <Label>PO Type</Label>
                <Select
                  value={formData.po_type || ""}
                  onValueChange={(value) => handleInputChange("po_type", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select PO type..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="material">Material</SelectItem>
                    <SelectItem value="labor">Labor</SelectItem>
                    <SelectItem value="subcontract">Subcontract</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <Switch
                    checked={formData.requires_payment_approval}
                    onCheckedChange={(checked) =>
                      handleInputChange("requires_payment_approval", checked)
                    }
                  />
                  <Label>Requires Payment Approval</Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    checked={formData.use_in_scheduling}
                    onCheckedChange={(checked) =>
                      handleInputChange("use_in_scheduling", checked)
                    }
                  />
                  <Label>Use in Scheduling</Label>
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
