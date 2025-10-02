"use client";

import { useEffect, useCallback, useMemo, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { DataGrid, type ExcelColumn } from "../../../components/grid";
import type { ColDef } from "ag-grid-community";

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
import { Plus, Edit, Trash2, Target } from "lucide-react";
import { api } from "../../providers";
import { useTimezone } from "../../../lib/timezone-context";

import type { Opportunity as DbOpportunity } from "../../../types/database";

// Extend to include joined fields
interface Opportunity extends DbOpportunity {
  contact_name?: string;
  community_name?: string;
}

const currencyFormatter = (params: any) => {
  if (params.value == null) return "";
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(params.value);
};

const percentFormatter = (params: any) => {
  if (params.value == null) return "";
  return `${params.value}%`;
};

const dateFormatter = (params: any, formatDate: (date: Date) => string) => {
  if (!params.value) return "";
  return formatDate(new Date(params.value));
};

// Custom cell renderer for stage
const StageCellRenderer = ({ value }: { value: string }) => {
  const stageColors: Record<string, string> = {
    Prospecting: "bg-gray-100 text-gray-800",
    Qualification: "bg-yellow-100 text-yellow-800",
    "Needs Analysis": "bg-orange-100 text-orange-800",
    "Value Proposition": "bg-blue-100 text-blue-800",
    "Negotiation/Review": "bg-purple-100 text-purple-800",
    "Closed Won": "bg-green-100 text-green-800",
    "Closed Lost": "bg-red-100 text-red-800",
  };

  return (
    <Badge className={stageColors[value] || "bg-gray-100 text-gray-800"}>
      {value}
    </Badge>
  );
};

// Custom cell renderer for actions
const ActionsCellRenderer = ({
  data,
  onEdit,
  onDelete,
}: {
  data: Opportunity;
  onEdit: (opportunity: Opportunity) => void;
  onDelete: (opportunity: Opportunity) => void;
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
  { field: "opportunity_name", header: "Opportunity Name *", required: true },
  { field: "contact_email", header: "Contact Email *", required: true },
  { field: "region_code", header: "Region Code *", required: true },
  { field: "community_code", header: "Community Code" },
  { field: "opportunity_type", header: "Type" },
  {
    field: "stage",
    header: "Stage *",
    required: true,
    defaultValue: "Prospecting",
  },
  { field: "probability", header: "Probability (%)", type: "number" },
  { field: "expected_close_date", header: "Expected Close Date", type: "date" },
  { field: "amount", header: "Amount", type: "number" },
  { field: "currency_code", header: "Currency", defaultValue: "USD" },
  { field: "lead_source", header: "Lead Source" },
  { field: "sales_person_id", header: "Sales Person ID" },
  { field: "next_step", header: "Next Step" },
  { field: "description", header: "Description" },
];

export default function OpportunitiesPage() {
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
  const [editingOpportunity, setEditingOpportunity] =
    useState<Opportunity | null>(null);
  const [formData, setFormData] = useState({
    opportunity_name: "",
    contact_id: "",
    region_id: "",
    community_id: "",
    opportunity_type: "",
    stage: "Prospecting",
    probability: "",
    expected_close_date: "",
    amount: "",
    currency_code: "USD",
    lead_source: "",
    sales_person_id: "",
    next_step: "",
    description: "",
  });

  // Delete confirmation state
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [opportunityToDelete, setOpportunityToDelete] =
    useState<Opportunity | null>(null);

  // Get tRPC utils for cache invalidation
  const utils = api.useUtils();

  // Fetch opportunities data
  const { data: opportunities = [], isLoading } =
    api.opportunities.getAll.useQuery(
      {
        builderId: builderId!,
        limit: 1000,
      },
      {
        enabled: !!builderId,
      }
    );

  // Fetch contacts for dropdown
  const { data: contacts = [] } = api.contacts.getAll.useQuery(
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

  // Fetch communities for dropdown
  const { data: communities = [] } = api.builders.getCommunities.useQuery(
    {
      builderId: builderId!,
    },
    {
      enabled: !!builderId,
    }
  );

  // Create opportunity mutation
  const createOpportunityMutation = api.opportunities.create.useMutation({
    onSuccess: () => {
      utils.opportunities.getAll.invalidate();
      setIsModalOpen(false);
      resetForm();
    },
    onError: (error) => {
      console.error("Failed to create opportunity:", error);
    },
  });

  // Update opportunity mutation
  const updateOpportunityMutation = api.opportunities.update.useMutation({
    onSuccess: () => {
      utils.opportunities.getAll.invalidate();
      setIsModalOpen(false);
      setEditingOpportunity(null);
    },
    onError: (error) => {
      console.error("Failed to update opportunity:", error);
    },
  });

  // Delete opportunity mutation
  const deleteOpportunityMutation = api.opportunities.delete.useMutation({
    onSuccess: () => {
      utils.opportunities.getAll.invalidate();
      setDeleteConfirmOpen(false);
      setOpportunityToDelete(null);
    },
    onError: (error) => {
      console.error("Failed to delete opportunity:", error);
    },
  });

  const resetForm = () => {
    setFormData({
      opportunity_name: "",
      contact_id: "",
      region_id: "",
      community_id: "",
      opportunity_type: "",
      stage: "Prospecting",
      probability: "",
      expected_close_date: "",
      amount: "",
      currency_code: "USD",
      lead_source: "",
      sales_person_id: "",
      next_step: "",
      description: "",
    });
  };

  // Handle create new opportunity
  const handleCreateOpportunity = useCallback(() => {
    setEditingOpportunity(null);
    resetForm();
    setIsModalOpen(true);
  }, []);

  // Handle edit opportunity
  const handleEditOpportunity = useCallback((opportunity: Opportunity) => {
    setEditingOpportunity(opportunity);
    setFormData({
      opportunity_name: opportunity.opportunity_name || "",
      contact_id: opportunity.contact_id || "",
      region_id: opportunity.region_id || "",
      community_id: opportunity.community_id || "",
      opportunity_type: opportunity.opportunity_type || "",
      stage: opportunity.stage || "Prospecting",
      probability: opportunity.probability?.toString() || "",
      expected_close_date: opportunity.expected_close_date
        ? new Date(opportunity.expected_close_date).toISOString().split("T")[0]
        : "",
      amount: opportunity.amount?.toString() || "",
      currency_code: opportunity.currency_code || "USD",
      lead_source: opportunity.lead_source || "",
      sales_person_id: opportunity.sales_person_id || "",
      next_step: opportunity.next_step || "",
      description: opportunity.description || "",
    });
    setIsModalOpen(true);
  }, []);

  // Handle delete opportunity
  const handleDeleteOpportunity = useCallback((opportunity: Opportunity) => {
    setOpportunityToDelete(opportunity);
    setDeleteConfirmOpen(true);
  }, []);

  // Confirm delete opportunity
  const confirmDeleteOpportunity = useCallback(() => {
    if (!opportunityToDelete || !builderId) return;

    deleteOpportunityMutation.mutate({
      builderId: builderId,
      opportunityId: opportunityToDelete.opportunity_id,
    });
  }, [opportunityToDelete, builderId, deleteOpportunityMutation]);

  // Handle form submit
  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();

      if (!builderId || !session?.user?.id) {
        console.error("Missing required data for API call");
        return;
      }

      if (editingOpportunity) {
        // Update existing opportunity
        const updateData: any = {
          builderId: builderId,
          opportunityId: editingOpportunity.opportunity_id,
          opportunityName: formData.opportunity_name || undefined,
          opportunityType: formData.opportunity_type || undefined,
          stage: formData.stage || undefined,
          probability: formData.probability
            ? parseFloat(formData.probability)
            : undefined,
          expectedCloseDate: formData.expected_close_date
            ? new Date(formData.expected_close_date)
            : undefined,
          amount: formData.amount ? parseFloat(formData.amount) : undefined,
          currencyCode: formData.currency_code || undefined,
          leadSource: formData.lead_source || undefined,
          salesPersonId: formData.sales_person_id || undefined,
          nextStep: formData.next_step || undefined,
          description: formData.description || undefined,
          modifiedBy: session.user.id,
        };

        // Handle stage changes to update closed/won status
        if (formData.stage === "Closed Won") {
          updateData.isClosed = true;
          updateData.isWon = true;
          updateData.actualCloseDate = new Date();
        } else if (formData.stage === "Closed Lost") {
          updateData.isClosed = true;
          updateData.isWon = false;
          updateData.actualCloseDate = new Date();
        } else {
          updateData.isClosed = false;
          updateData.isWon = false;
        }

        updateOpportunityMutation.mutate(updateData);
      } else {
        // Create new opportunity
        createOpportunityMutation.mutate({
          builderId: builderId,
          regionId: formData.region_id,
          contactId: formData.contact_id,
          opportunityName: formData.opportunity_name,
          communityId: formData.community_id || undefined,
          opportunityType: formData.opportunity_type || undefined,
          stage: formData.stage,
          probability: formData.probability
            ? parseFloat(formData.probability)
            : undefined,
          expectedCloseDate: formData.expected_close_date
            ? new Date(formData.expected_close_date)
            : undefined,
          amount: formData.amount ? parseFloat(formData.amount) : undefined,
          currencyCode: formData.currency_code || undefined,
          leadSource: formData.lead_source || undefined,
          salesPersonId: formData.sales_person_id || undefined,
          nextStep: formData.next_step || undefined,
          description: formData.description || undefined,
          createdBy: session.user.id,
          modifiedBy: session.user.id,
        });
      }
    },
    [
      formData,
      editingOpportunity,
      builderId,
      session?.user?.id,
      createOpportunityMutation,
      updateOpportunityMutation,
    ]
  );

  // Handle form input changes
  const handleInputChange = useCallback((field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  }, []);

  // Handle import from DataGrid
  const handleImport = useCallback(
    async (importData: any[]) => {
      if (!builderId || !session?.user?.id) return;

      for (const row of importData) {
        // Find contact by email
        const contact = contacts.find((c) => c.email === row.contact_email);
        if (!contact) continue;

        // Find region by code
        const region = regions.find((r) => r.region_code === row.region_code);
        if (!region) continue;

        // Find community by code if provided
        let communityId = undefined;
        if (row.community_code) {
          const community = communities.find(
            (c) => c.community_code === row.community_code
          );
          if (community) {
            communityId = community.community_id;
          }
        }

        await createOpportunityMutation.mutateAsync({
          builderId: builderId,
          regionId: region.region_id,
          contactId: contact.contact_id,
          opportunityName: row.opportunity_name,
          communityId: communityId,
          opportunityType: row.opportunity_type || undefined,
          stage: row.stage || "Prospecting",
          probability: row.probability || undefined,
          expectedCloseDate: row.expected_close_date
            ? new Date(row.expected_close_date)
            : undefined,
          amount: row.amount || undefined,
          currencyCode: row.currency_code || "USD",
          leadSource: row.lead_source || undefined,
          salesPersonId: row.sales_person_id || undefined,
          nextStep: row.next_step || undefined,
          description: row.description || undefined,
          createdBy: session.user.id,
          modifiedBy: session.user.id,
        });
      }

      // Refresh data
      utils.opportunities.getAll.invalidate();
    },
    [
      builderId,
      session?.user?.id,
      createOpportunityMutation,
      utils,
      contacts,
      regions,
      communities,
    ]
  );

  // AG Grid column definitions
  const columnDefs = useMemo<ColDef<Opportunity>[]>(
    () => [
      {
        headerName: "Opportunity Name",
        field: "opportunity_name",
        sortable: true,
        filter: true,
        flex: 2,
        minWidth: 200,
        pinned: "left" as const,
      },
      {
        headerName: "Contact",
        field: "contact_name",
        sortable: true,
        filter: true,
        flex: 1.5,
        minWidth: 150,
      },
      {
        headerName: "Stage",
        field: "stage",
        sortable: true,
        filter: true,
        flex: 1.2,
        minWidth: 120,
        cellRenderer: StageCellRenderer,
      },
      {
        headerName: "Amount",
        field: "amount",
        sortable: true,
        filter: "agNumberColumnFilter",
        flex: 1,
        minWidth: 120,
        valueFormatter: currencyFormatter,
      },
      {
        headerName: "Probability",
        field: "probability",
        sortable: true,
        filter: "agNumberColumnFilter",
        flex: 0.8,
        minWidth: 100,
        valueFormatter: percentFormatter,
      },
      {
        headerName: "Expected Close",
        field: "expected_close_date",
        sortable: true,
        filter: "agDateColumnFilter",
        flex: 1.2,
        minWidth: 120,
        valueFormatter: (params) => dateFormatter(params, formatDate),
      },
      {
        headerName: "Community",
        field: "community_name",
        sortable: true,
        filter: true,
        flex: 1.5,
        minWidth: 150,
      },
      {
        headerName: "Lead Source",
        field: "lead_source",
        sortable: true,
        filter: true,
        flex: 1.2,
        minWidth: 120,
      },
      {
        headerName: "Type",
        field: "opportunity_type",
        sortable: true,
        filter: true,
        flex: 1,
        minWidth: 100,
      },
      {
        headerName: "Next Step",
        field: "next_step",
        sortable: true,
        filter: true,
        flex: 1.5,
        minWidth: 150,
      },
      {
        headerName: "Actions",
        field: "opportunity_id" as keyof Opportunity,
        sortable: false,
        filter: false,
        width: 100,
        pinned: "right" as const,
        cellRenderer: ActionsCellRenderer,
        cellRendererParams: {
          onEdit: handleEditOpportunity,
          onDelete: handleDeleteOpportunity,
        },
      },
    ],
    [handleEditOpportunity, handleDeleteOpportunity, formatDate]
  );

  // Show loading while checking authentication
  if (status === "loading") {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground text-lg">
            Loading opportunities...
          </p>
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
            <h1 className="text-3xl font-bold">Opportunities</h1>
            <p className="text-muted-foreground">
              Track and manage your sales opportunities
            </p>
          </div>
        </div>
        <Card>
          <CardHeader>
            <CardTitle>Sales Pipeline</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-center h-64">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                <p className="text-muted-foreground">
                  Loading opportunity data...
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="p-6">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
              <Target className="h-8 w-8" />
              Opportunities
            </h1>
            <p className="text-muted-foreground">
              Track and manage your sales opportunities
            </p>
          </div>
          <Button
            onClick={handleCreateOpportunity}
            className="flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            Add New Opportunity
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Sales Pipeline</CardTitle>
          </CardHeader>
          <CardContent>
            <DataGrid
              data={opportunities}
              loading={isLoading}
              columnDefs={columnDefs}
              excelColumns={excelColumns}
              onImport={handleImport}
              fileName="opportunities"
              importTitle="Import Opportunities"
            />
          </CardContent>
        </Card>

        {/* Opportunity Modal */}
        <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>
                {editingOpportunity
                  ? "Edit Opportunity"
                  : "Create New Opportunity"}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit}>
              <div className="grid gap-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="opportunity_name">Opportunity Name *</Label>
                  <Input
                    id="opportunity_name"
                    value={formData.opportunity_name}
                    onChange={(e) =>
                      handleInputChange("opportunity_name", e.target.value)
                    }
                    placeholder="Opportunity name"
                    required
                  />
                </div>

                {!editingOpportunity && (
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="contact_id">Contact *</Label>
                      <Select
                        value={formData.contact_id}
                        onValueChange={(value) =>
                          handleInputChange("contact_id", value)
                        }
                        required
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select a contact" />
                        </SelectTrigger>
                        <SelectContent>
                          {contacts.map((contact) => (
                            <SelectItem
                              key={contact.contact_id}
                              value={contact.contact_id}
                            >
                              {contact.company_name ||
                                `${contact.first_name || ""} ${
                                  contact.last_name || ""
                                }`.trim() ||
                                "Unnamed Contact"}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
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
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="stage">Stage *</Label>
                    <Select
                      value={formData.stage}
                      onValueChange={(value) =>
                        handleInputChange("stage", value)
                      }
                      required
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select stage" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Prospecting">Prospecting</SelectItem>
                        <SelectItem value="Qualification">
                          Qualification
                        </SelectItem>
                        <SelectItem value="Needs Analysis">
                          Needs Analysis
                        </SelectItem>
                        <SelectItem value="Value Proposition">
                          Value Proposition
                        </SelectItem>
                        <SelectItem value="Negotiation/Review">
                          Negotiation/Review
                        </SelectItem>
                        <SelectItem value="Closed Won">Closed Won</SelectItem>
                        <SelectItem value="Closed Lost">Closed Lost</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="probability">Probability (%)</Label>
                    <Input
                      id="probability"
                      type="number"
                      min="0"
                      max="100"
                      value={formData.probability}
                      onChange={(e) =>
                        handleInputChange("probability", e.target.value)
                      }
                      placeholder="0-100"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="amount">Amount</Label>
                    <Input
                      id="amount"
                      type="number"
                      step="0.01"
                      value={formData.amount}
                      onChange={(e) =>
                        handleInputChange("amount", e.target.value)
                      }
                      placeholder="0.00"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="expected_close_date">
                      Expected Close Date
                    </Label>
                    <Input
                      id="expected_close_date"
                      type="date"
                      value={formData.expected_close_date}
                      onChange={(e) =>
                        handleInputChange("expected_close_date", e.target.value)
                      }
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="community_id">Community</Label>
                    <Select
                      value={formData.community_id}
                      onValueChange={(value) =>
                        handleInputChange("community_id", value)
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select a community" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">None</SelectItem>
                        {communities.map((community) => (
                          <SelectItem
                            key={community.community_id}
                            value={community.community_id}
                          >
                            {community.community_code} - {community.description}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="opportunity_type">Opportunity Type</Label>
                    <Input
                      id="opportunity_type"
                      value={formData.opportunity_type}
                      onChange={(e) =>
                        handleInputChange("opportunity_type", e.target.value)
                      }
                      placeholder="e.g., New Home, Resale"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="lead_source">Lead Source</Label>
                    <Input
                      id="lead_source"
                      value={formData.lead_source}
                      onChange={(e) =>
                        handleInputChange("lead_source", e.target.value)
                      }
                      placeholder="e.g., Website, Referral"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="sales_person_id">Sales Person</Label>
                    <Input
                      id="sales_person_id"
                      value={formData.sales_person_id}
                      onChange={(e) =>
                        handleInputChange("sales_person_id", e.target.value)
                      }
                      placeholder="Sales person ID"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="next_step">Next Step</Label>
                  <Input
                    id="next_step"
                    value={formData.next_step}
                    onChange={(e) =>
                      handleInputChange("next_step", e.target.value)
                    }
                    placeholder="What's the next action?"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) =>
                      handleInputChange("description", e.target.value)
                    }
                    placeholder="Additional details about this opportunity"
                    rows={3}
                  />
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
                    createOpportunityMutation.isPending ||
                    updateOpportunityMutation.isPending
                  }
                >
                  {createOpportunityMutation.isPending ||
                  updateOpportunityMutation.isPending
                    ? editingOpportunity
                      ? "Updating..."
                      : "Creating..."
                    : editingOpportunity
                    ? "Update Opportunity"
                    : "Create Opportunity"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation Dialog */}
        <Dialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Delete Opportunity</DialogTitle>
            </DialogHeader>
            <div className="py-4">
              <p className="text-muted-foreground">
                Are you sure you want to delete opportunity &ldquo;
                {opportunityToDelete?.opportunity_name}&rdquo;?
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
                onClick={confirmDeleteOpportunity}
                disabled={deleteOpportunityMutation.isPending}
              >
                {deleteOpportunityMutation.isPending
                  ? "Deleting..."
                  : "Delete Opportunity"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
