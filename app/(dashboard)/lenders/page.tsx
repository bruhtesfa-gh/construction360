"use client";

import { useEffect, useCallback, useMemo, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import type { ColDef } from "ag-grid-community";

import { DataGrid, type ExcelColumn } from "../../../components/grid";
import { Button } from "../../../components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../../components/ui/card";
import { Badge } from "../../../components/ui/badge";
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
import { Textarea } from "../../../components/ui/textarea";
import { Plus, Edit, Trash2, Building2 } from "lucide-react";
import { api } from "../../providers";
import { useTimezone } from "../../../lib/timezone-context";

// Import Lender type from database
import type { Lender as DbLender } from "../../../types/database";

// Use the database Lender type directly
type Lender = DbLender;

// Custom cell renderer for preferred status
const PreferredCellRenderer = ({ value }: { value: boolean }) => {
  return value ? (
    <Badge className="bg-green-100 text-green-800">Preferred</Badge>
  ) : null;
};

// Custom cell renderer for active status
const ActiveCellRenderer = ({ value }: { value: boolean }) => {
  return (
    <Badge
      className={
        value ? "bg-blue-100 text-blue-800" : "bg-gray-100 text-gray-800"
      }
    >
      {value ? "Active" : "Inactive"}
    </Badge>
  );
};

// Custom cell renderer for actions
const ActionsCellRenderer = ({
  data,
  onEdit,
  onDelete,
}: {
  data: Lender;
  onEdit: (lender: Lender) => void;
  onDelete: (lender: Lender) => void;
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

// Excel column definitions
const excelColumns: ExcelColumn[] = [
  { field: "lender_code", header: "Lender Code *", required: true },
  { field: "lender_name", header: "Lender Name *", required: true },
  { field: "region_code", header: "Region Code *", required: true },
  { field: "contact_name", header: "Contact Name" },
  { field: "contact_phone", header: "Phone" },
  { field: "contact_email", header: "Email" },
  { field: "contact_fax", header: "Fax" },
  { field: "address1", header: "Address Line 1" },
  { field: "address2", header: "Address Line 2" },
  { field: "city", header: "City" },
  { field: "state", header: "State" },
  { field: "zip", header: "ZIP Code" },
  { field: "country", header: "Country", defaultValue: "USA" },
  { field: "website", header: "Website" },
  { field: "notes", header: "Notes" },
  {
    field: "is_preferred",
    header: "Preferred Lender",
    type: "boolean",
    defaultValue: false,
  },
  { field: "is_active", header: "Active", type: "boolean", defaultValue: true },
];

export default function LendersPage() {
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

  const builderId = session?.user?.builderId;

  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingLender, setEditingLender] = useState<Lender | null>(null);
  const [formData, setFormData] = useState({
    lender_code: "",
    lender_name: "",
    region_id: "",
    contact_name: "",
    contact_phone: "",
    contact_email: "",
    contact_fax: "",
    address1: "",
    address2: "",
    city: "",
    state: "",
    zip: "",
    country: "USA",
    website: "",
    notes: "",
    is_preferred: false,
    is_active: true,
  });

  // Delete confirmation state
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [lenderToDelete, setLenderToDelete] = useState<Lender | null>(null);

  // Get tRPC utils for cache invalidation
  const utils = api.useUtils();

  // Fetch lenders data
  const { data: lenders = [], isLoading } = api.lenders.getAll.useQuery(
    {
      builderId: builderId!,
      limit: 1000,
    },
    {
      enabled: !!builderId,
    }
  );

  // Fetch regions for dropdown
  const { data: regions = [] } = api.builders.getRegions.useQuery(
    {
      builderId: builderId!,
    },
    {
      enabled: !!builderId,
    }
  );

  // Create lender mutation
  const createLenderMutation = api.lenders.create.useMutation({
    onSuccess: () => {
      utils.lenders.getAll.invalidate();
      setIsModalOpen(false);
      resetForm();
    },
    onError: (error) => {
      console.error("Failed to create lender:", error);
    },
  });

  // Update lender mutation
  const updateLenderMutation = api.lenders.update.useMutation({
    onSuccess: () => {
      utils.lenders.getAll.invalidate();
      setIsModalOpen(false);
      setEditingLender(null);
    },
    onError: (error) => {
      console.error("Failed to update lender:", error);
    },
  });

  // Delete lender mutation
  const deleteLenderMutation = api.lenders.delete.useMutation({
    onSuccess: () => {
      utils.lenders.getAll.invalidate();
      setDeleteConfirmOpen(false);
      setLenderToDelete(null);
    },
    onError: (error) => {
      console.error("Failed to delete lender:", error);
    },
  });

  const resetForm = () => {
    setFormData({
      lender_code: "",
      lender_name: "",
      region_id: "",
      contact_name: "",
      contact_phone: "",
      contact_email: "",
      contact_fax: "",
      address1: "",
      address2: "",
      city: "",
      state: "",
      zip: "",
      country: "USA",
      website: "",
      notes: "",
      is_preferred: false,
      is_active: true,
    });
  };

  // Handle create new lender
  const handleCreateLender = useCallback(() => {
    setEditingLender(null);
    resetForm();
    setIsModalOpen(true);
  }, []);

  // Handle edit lender
  const handleEditLender = useCallback((lender: Lender) => {
    setEditingLender(lender);
    setFormData({
      lender_code: lender.lender_code || "",
      lender_name: lender.lender_name || "",
      region_id: lender.region_id || "",
      contact_name: lender.contact_name || "",
      contact_phone: lender.contact_phone || "",
      contact_email: lender.contact_email || "",
      contact_fax: lender.contact_fax || "",
      address1: lender.address1 || "",
      address2: lender.address2 || "",
      city: lender.city || "",
      state: lender.state || "",
      zip: lender.zip || "",
      country: lender.country || "USA",
      website: lender.website || "",
      notes: lender.notes || "",
      is_preferred: lender.is_preferred || false,
      is_active: lender.is_active !== false,
    });
    setIsModalOpen(true);
  }, []);

  // Handle delete lender
  const handleDeleteLender = useCallback((lender: Lender) => {
    setLenderToDelete(lender);
    setDeleteConfirmOpen(true);
  }, []);

  // Confirm delete lender
  const confirmDeleteLender = useCallback(() => {
    if (!lenderToDelete || !builderId) return;

    deleteLenderMutation.mutate({
      builderId: builderId,
      lenderId: lenderToDelete.lender_id,
    });
  }, [lenderToDelete, builderId, deleteLenderMutation]);

  // Handle form submit
  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();

      if (!builderId || !session?.user?.id) {
        console.error("Missing required data for API call");
        return;
      }

      if (editingLender) {
        // Update existing lender
        updateLenderMutation.mutate({
          builderId: builderId,
          lenderId: editingLender.lender_id,
          lenderCode: formData.lender_code || undefined,
          lenderName: formData.lender_name || undefined,
          contactName: formData.contact_name || undefined,
          contactPhone: formData.contact_phone || undefined,
          contactEmail: formData.contact_email || undefined,
          contactFax: formData.contact_fax || undefined,
          address1: formData.address1 || undefined,
          address2: formData.address2 || undefined,
          city: formData.city || undefined,
          state: formData.state || undefined,
          zip: formData.zip || undefined,
          country: formData.country || undefined,
          website: formData.website || undefined,
          notes: formData.notes || undefined,
          isPreferred: formData.is_preferred,
          isActive: formData.is_active,
          modifiedBy: session.user.id,
        });
      } else {
        // Create new lender
        createLenderMutation.mutate({
          builderId: builderId,
          regionId: formData.region_id,
          lenderCode: formData.lender_code,
          lenderName: formData.lender_name,
          contactName: formData.contact_name || undefined,
          contactPhone: formData.contact_phone || undefined,
          contactEmail: formData.contact_email || undefined,
          contactFax: formData.contact_fax || undefined,
          address1: formData.address1 || undefined,
          address2: formData.address2 || undefined,
          city: formData.city || undefined,
          state: formData.state || undefined,
          zip: formData.zip || undefined,
          country: formData.country || undefined,
          website: formData.website || undefined,
          notes: formData.notes || undefined,
          isPreferred: formData.is_preferred,
          isActive: formData.is_active,
          createdBy: session.user.id,
          modifiedBy: session.user.id,
        });
      }
    },
    [
      formData,
      editingLender,
      builderId,
      session?.user?.id,
      createLenderMutation,
      updateLenderMutation,
    ]
  );

  // Handle form input changes
  const handleInputChange = useCallback(
    (field: string, value: string | boolean) => {
      setFormData((prev) => ({ ...prev, [field]: value }));
    },
    []
  );

  // Handle import from DataGrid
  const handleImport = useCallback(
    async (importData: any[]) => {
      if (!builderId || !session?.user?.id) return;

      const defaultRegionId = regions[0]?.region_id;

      for (const row of importData) {
        // Find region by code
        let regionId = defaultRegionId;
        if (row.region_code) {
          const regionMatch = regions.find(
            (r) => r.region_code === row.region_code
          );
          if (regionMatch) {
            regionId = regionMatch.region_id;
          }
        }

        await createLenderMutation.mutateAsync({
          builderId: builderId,
          regionId: regionId || "00000000-0000-0000-0000-000000000001",
          lenderCode: row.lender_code,
          lenderName: row.lender_name,
          contactName: row.contact_name || undefined,
          contactPhone: row.contact_phone || undefined,
          contactEmail: row.contact_email || undefined,
          contactFax: row.contact_fax || undefined,
          address1: row.address1 || undefined,
          address2: row.address2 || undefined,
          city: row.city || undefined,
          state: row.state || undefined,
          zip: row.zip || undefined,
          country: row.country || "USA",
          website: row.website || undefined,
          notes: row.notes || undefined,
          isPreferred: row.is_preferred || false,
          isActive: row.is_active !== false,
          createdBy: session.user.id,
          modifiedBy: session.user.id,
        });
      }

      // Refresh data
      utils.lenders.getAll.invalidate();
    },
    [builderId, session?.user?.id, regions, createLenderMutation, utils]
  );

  // AG Grid column definitions
  const columnDefs = useMemo<ColDef<Lender>[]>(
    () => [
      {
        headerName: "Lender Code",
        field: "lender_code",
        sortable: true,
        filter: true,
        flex: 1,
        minWidth: 120,
        pinned: "left" as const,
      },
      {
        headerName: "Lender Name",
        field: "lender_name",
        sortable: true,
        filter: true,
        flex: 2,
        minWidth: 200,
      },
      {
        headerName: "Contact Name",
        field: "contact_name",
        sortable: true,
        filter: true,
        flex: 1.5,
        minWidth: 150,
      },
      {
        headerName: "Phone",
        field: "contact_phone",
        sortable: true,
        filter: true,
        flex: 1.2,
        minWidth: 120,
      },
      {
        headerName: "Email",
        field: "contact_email",
        sortable: true,
        filter: true,
        flex: 1.8,
        minWidth: 180,
      },
      {
        headerName: "City",
        field: "city",
        sortable: true,
        filter: true,
        flex: 1,
        minWidth: 100,
      },
      {
        headerName: "State",
        field: "state",
        sortable: true,
        filter: true,
        flex: 0.8,
        minWidth: 80,
      },
      {
        headerName: "Preferred",
        field: "is_preferred",
        sortable: true,
        filter: true,
        flex: 1,
        minWidth: 100,
        cellRenderer: PreferredCellRenderer,
      },
      {
        headerName: "Status",
        field: "is_active",
        sortable: true,
        filter: true,
        flex: 1,
        minWidth: 100,
        cellRenderer: ActiveCellRenderer,
      },
      {
        headerName: "Actions",
        field: "lender_id" as keyof Lender,
        sortable: false,
        filter: false,
        width: 100,
        pinned: "right" as const,
        cellRenderer: ActionsCellRenderer,
        cellRendererParams: {
          onEdit: handleEditLender,
          onDelete: handleDeleteLender,
        },
      },
    ],
    [handleEditLender, handleDeleteLender]
  );

  // Show loading while checking authentication
  if (status === "loading") {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground text-lg">Loading lenders...</p>
        </div>
      </div>
    );
  }

  // Show loading while fetching data
  if (builderId && isLoading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold">Lenders</h1>
            <p className="text-muted-foreground">
              Manage your approved lenders and their information
            </p>
          </div>
        </div>
        <Card>
          <CardHeader>
            <CardTitle>Lenders Directory</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-center h-64">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                <p className="text-muted-foreground">Loading lender data...</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <Building2 className="h-8 w-8" />
            Lenders
          </h1>
          <p className="text-muted-foreground">
            Manage your approved lenders and their information
          </p>
        </div>
        <Button
          onClick={handleCreateLender}
          className="flex items-center gap-2"
        >
          <Plus className="h-4 w-4" />
          Add New Lender
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Lender List</CardTitle>
        </CardHeader>
        <CardContent>
          <DataGrid
            data={lenders}
            loading={isLoading}
            columnDefs={columnDefs}
            excelColumns={excelColumns}
            onImport={handleImport}
            fileName="lenders"
            importTitle="Import Lenders"
          />
        </CardContent>
      </Card>

      {/* Lender Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>
              {editingLender ? "Edit Lender" : "Create New Lender"}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="lender_code">Lender Code *</Label>
                  <Input
                    id="lender_code"
                    value={formData.lender_code}
                    onChange={(e) =>
                      handleInputChange("lender_code", e.target.value)
                    }
                    placeholder="Lender code"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lender_name">Lender Name *</Label>
                  <Input
                    id="lender_name"
                    value={formData.lender_name}
                    onChange={(e) =>
                      handleInputChange("lender_name", e.target.value)
                    }
                    placeholder="Lender name"
                    required
                  />
                </div>
              </div>

              {!editingLender && (
                <div className="space-y-2">
                  <Label htmlFor="region_id">Region *</Label>
                  <Select
                    value={formData.region_id}
                    onValueChange={(value) =>
                      handleInputChange("region_id", value)
                    }
                    required
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a region" />
                    </SelectTrigger>
                    <SelectContent>
                      {regions.map((region) => (
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
              )}

              <div className="space-y-2">
                <Label htmlFor="contact_name">Contact Name</Label>
                <Input
                  id="contact_name"
                  value={formData.contact_name}
                  onChange={(e) =>
                    handleInputChange("contact_name", e.target.value)
                  }
                  placeholder="Contact name"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="contact_phone">Phone</Label>
                  <Input
                    id="contact_phone"
                    value={formData.contact_phone}
                    onChange={(e) =>
                      handleInputChange("contact_phone", e.target.value)
                    }
                    placeholder="Phone number"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="contact_fax">Fax</Label>
                  <Input
                    id="contact_fax"
                    value={formData.contact_fax}
                    onChange={(e) =>
                      handleInputChange("contact_fax", e.target.value)
                    }
                    placeholder="Fax number"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="contact_email">Email</Label>
                <Input
                  id="contact_email"
                  type="email"
                  value={formData.contact_email}
                  onChange={(e) =>
                    handleInputChange("contact_email", e.target.value)
                  }
                  placeholder="Email address"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="website">Website</Label>
                <Input
                  id="website"
                  type="url"
                  value={formData.website}
                  onChange={(e) => handleInputChange("website", e.target.value)}
                  placeholder="https://example.com"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="address1">Address Line 1</Label>
                <Input
                  id="address1"
                  value={formData.address1}
                  onChange={(e) =>
                    handleInputChange("address1", e.target.value)
                  }
                  placeholder="Street address"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="address2">Address Line 2</Label>
                <Input
                  id="address2"
                  value={formData.address2}
                  onChange={(e) =>
                    handleInputChange("address2", e.target.value)
                  }
                  placeholder="Suite, unit, building, etc."
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="city">City</Label>
                  <Input
                    id="city"
                    value={formData.city}
                    onChange={(e) => handleInputChange("city", e.target.value)}
                    placeholder="City"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="state">State</Label>
                  <Input
                    id="state"
                    value={formData.state}
                    onChange={(e) => handleInputChange("state", e.target.value)}
                    placeholder="State"
                    maxLength={2}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="zip">ZIP Code</Label>
                  <Input
                    id="zip"
                    value={formData.zip}
                    onChange={(e) => handleInputChange("zip", e.target.value)}
                    placeholder="ZIP code"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="country">Country</Label>
                <Input
                  id="country"
                  value={formData.country}
                  onChange={(e) => handleInputChange("country", e.target.value)}
                  placeholder="Country"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes">Notes</Label>
                <Textarea
                  id="notes"
                  value={formData.notes}
                  onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                    handleInputChange("notes", e.target.value)
                  }
                  placeholder="Additional notes"
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="is_preferred"
                    checked={formData.is_preferred}
                    onChange={(e) =>
                      handleInputChange("is_preferred", e.target.checked)
                    }
                    className="h-4 w-4 rounded border-input"
                  />
                  <Label htmlFor="is_preferred">Preferred Lender</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="is_active"
                    checked={formData.is_active}
                    onChange={(e) =>
                      handleInputChange("is_active", e.target.checked)
                    }
                    className="h-4 w-4 rounded border-input"
                  />
                  <Label htmlFor="is_active">Active</Label>
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
                disabled={
                  createLenderMutation.isPending ||
                  updateLenderMutation.isPending
                }
              >
                {createLenderMutation.isPending ||
                updateLenderMutation.isPending
                  ? editingLender
                    ? "Updating..."
                    : "Creating..."
                  : editingLender
                  ? "Update Lender"
                  : "Create Lender"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Delete Lender</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p className="text-muted-foreground">
              Are you sure you want to delete lender &ldquo;
              {lenderToDelete?.lender_name}&rdquo;?
            </p>
            <p className="text-muted-foreground text-sm mt-2">
              This action cannot be undone.
            </p>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setDeleteConfirmOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="destructive"
              onClick={confirmDeleteLender}
              disabled={deleteLenderMutation.isPending}
            >
              {deleteLenderMutation.isPending ? "Deleting..." : "Delete Lender"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
