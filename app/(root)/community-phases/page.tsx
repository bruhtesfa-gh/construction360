"use client";

import { useState } from "react";
import { api } from "../../providers";
import { DataGrid } from "../../../components/grid";
import { Button } from "../../../components/ui/button";
import { Plus, Pencil, Trash2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "../../../components/ui/dialog";
import { Input } from "../../../components/ui/input";
import { Label } from "../../../components/ui/label";
import { Textarea } from "../../../components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../../components/ui/select";
import { useSession } from "next-auth/react";

interface User {
  user_id: string;
  first_name: string;
  last_name: string;
  email: string;
  full_name: string;
}

interface Community {
  community_id: string;
  community_name: string;
}

interface CommunityPhaseFormData {
  community_phase_id?: string;
  community_id: string;
  community_phase_code: string;
  description: string;
  sage_intacct_entity?: string;
  accounting_system?: string;
  accounting_login?: string;
  accounting_password?: string;
  sales_manager_id?: string;
  estimator_id?: string;
  site_superintendent_id?: string;
  warranty_rep_id?: string;
  warranty_job?: string;
  marketing_comments?: string;
  hoa_id?: string;
  lot_map_image_id?: string;
}

const initialFormData: CommunityPhaseFormData = {
  community_id: "",
  community_phase_code: "",
  description: "",
};

export default function CommunityPhasesPage() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedPhase, setSelectedPhase] = useState<any>(null);
  const [formData, setFormData] =
    useState<CommunityPhaseFormData>(initialFormData);
  const { data: session } = useSession();
  const builderId = session?.user?.builderId || "";

  const { data: phases, refetch } = api.communityPhases.list.useQuery(
    { builderId },
    { enabled: !!builderId }
  );
  const { data: communities } = api.communityPhases.getCommunities.useQuery(
    { builderId },
    { enabled: !!builderId }
  ) as { data: Community[] | undefined };
  const { data: users } = api.communityPhases.getUsers.useQuery(
    { builderId },
    { enabled: !!builderId }
  ) as { data: User[] | undefined };

  const createMutation = api.communityPhases.create.useMutation({
    onSuccess: () => {
      alert("Community phase created successfully");
      setIsDialogOpen(false);
      refetch();
    },
    onError: (error) => {
      alert(`Error creating community phase: ${error.message}`);
    },
  });

  const updateMutation = api.communityPhases.update.useMutation({
    onSuccess: () => {
      alert("Community phase updated successfully");
      setIsDialogOpen(false);
      refetch();
    },
    onError: (error) => {
      alert(`Error updating community phase: ${error.message}`);
    },
  });

  const deleteMutation = api.communityPhases.delete.useMutation({
    onSuccess: () => {
      alert("Community phase deleted successfully");
      refetch();
    },
    onError: (error) => {
      alert(`Error deleting community phase: ${error.message}`);
    },
  });

  const handleAdd = () => {
    setFormData(initialFormData);
    setSelectedPhase(null);
    setIsDialogOpen(true);
  };

  const handleEdit = (phase: any) => {
    setSelectedPhase(phase);
    setFormData({
      community_phase_id: phase.community_phase_id,
      community_id: phase.community_id,
      community_phase_code: phase.community_phase_code,
      description: phase.description,
      sage_intacct_entity: phase.sage_intacct_entity || "",
      accounting_system: phase.accounting_system || "",
      accounting_login: phase.accounting_login || "",
      accounting_password: phase.accounting_password || "",
      sales_manager_id: phase.sales_manager_id || undefined,
      estimator_id: phase.estimator_id || undefined,
      site_superintendent_id: phase.site_superintendent_id || undefined,
      warranty_rep_id: phase.warranty_rep_id || undefined,
      warranty_job: phase.warranty_job || "",
      marketing_comments: phase.marketing_comments || "",
      hoa_id: phase.hoa_id || "",
      lot_map_image_id: phase.lot_map_image_id || "",
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (phase: any) => {
    if (
      confirm(
        `Are you sure you want to delete the community phase "${phase.community_phase_code}"?`
      )
    ) {
      deleteMutation.mutate({ builderId, id: phase.community_phase_id });
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const dataToSubmit = {
      ...formData,
      sage_intacct_entity: formData.sage_intacct_entity || null,
      accounting_system: formData.accounting_system || null,
      accounting_login: formData.accounting_login || null,
      accounting_password: formData.accounting_password || null,
      sales_manager_id: formData.sales_manager_id || null,
      estimator_id: formData.estimator_id || null,
      site_superintendent_id: formData.site_superintendent_id || null,
      warranty_rep_id: formData.warranty_rep_id || null,
      warranty_job: formData.warranty_job || null,
      marketing_comments: formData.marketing_comments || null,
      hoa_id: formData.hoa_id || null,
      lot_map_image_id: formData.lot_map_image_id || null,
    };

    if (selectedPhase) {
      updateMutation.mutate({ builderId, ...dataToSubmit } as any);
    } else {
      const { community_phase_id, ...createData } = dataToSubmit;
      createMutation.mutate({ builderId, ...createData } as any);
    }
  };

  const columns = [
    {
      headerName: "Community",
      field: "community_name",
      flex: 1,
      minWidth: 150,
    },
    {
      headerName: "Phase Code",
      field: "community_phase_code",
      flex: 1,
      minWidth: 120,
    },
    {
      headerName: "Description",
      field: "description",
      flex: 2,
      minWidth: 200,
    },
    {
      headerName: "Sales Manager",
      field: "sales_manager_name",
      flex: 1,
      minWidth: 150,
    },
    {
      headerName: "Estimator",
      field: "estimator_name",
      flex: 1,
      minWidth: 150,
    },
    {
      headerName: "Actions",
      field: "actions",
      width: 120,
      sortable: false,
      filter: false,
      cellRenderer: (params: any) => (
        <div className="flex gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => handleEdit(params.data)}
          >
            <Pencil className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => handleDelete(params.data)}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      ),
    },
  ];

  const excelColumns = [
    { field: "community_name", header: "Community", required: true },
    { field: "community_phase_code", header: "Phase Code", required: true },
    { field: "description", header: "Description", required: true },
    { field: "sales_manager_name", header: "Sales Manager" },
    { field: "estimator_name", header: "Estimator" },
  ];

  return (
    <div className="container mx-auto p-6">
      <div className="mb-6 flex justify-between items-center">
        <h1 className="text-3xl font-bold">Community Phases</h1>
        <Button onClick={handleAdd}>
          <Plus className="mr-2 h-4 w-4" />
          Add Community Phase
        </Button>
      </div>

      <DataGrid
        data={phases || []}
        columnDefs={columns}
        excelColumns={excelColumns}
        loading={!phases}
        gridHeight="calc(100vh - 200px)"
      />

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {selectedPhase ? "Edit" : "Add"} Community Phase
            </DialogTitle>
            <DialogDescription>
              {selectedPhase
                ? "Update the details of the community phase below."
                : "Fill in the details to create a new community phase."}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="community_id">Community *</Label>
                <Select
                  value={formData.community_id}
                  onValueChange={(value) =>
                    setFormData({ ...formData, community_id: value })
                  }
                >
                  <SelectTrigger id="community_id">
                    <SelectValue placeholder="Select a community" />
                  </SelectTrigger>
                  <SelectContent>
                    {communities?.map((community: Community) => (
                      <SelectItem
                        key={community.community_id}
                        value={community.community_id}
                      >
                        {community.community_name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="community_phase_code">Phase Code *</Label>
                <Input
                  id="community_phase_code"
                  value={formData.community_phase_code}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      community_phase_code: e.target.value,
                    })
                  }
                  maxLength={50}
                  required
                />
              </div>
            </div>

            <div>
              <Label htmlFor="description">Description *</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                maxLength={200}
                required
              />
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Accounting Information</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="sage_intacct_entity">
                    Sage Intacct Entity
                  </Label>
                  <Input
                    id="sage_intacct_entity"
                    value={formData.sage_intacct_entity}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        sage_intacct_entity: e.target.value,
                      })
                    }
                  />
                </div>

                <div>
                  <Label htmlFor="accounting_system">Accounting System</Label>
                  <Input
                    id="accounting_system"
                    value={formData.accounting_system}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        accounting_system: e.target.value,
                      })
                    }
                  />
                </div>

                <div>
                  <Label htmlFor="accounting_login">Accounting Login</Label>
                  <Input
                    id="accounting_login"
                    value={formData.accounting_login}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        accounting_login: e.target.value,
                      })
                    }
                  />
                </div>

                <div>
                  <Label htmlFor="accounting_password">
                    Accounting Password
                  </Label>
                  <Input
                    id="accounting_password"
                    type="password"
                    value={formData.accounting_password}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        accounting_password: e.target.value,
                      })
                    }
                  />
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Personnel Assignments</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="sales_manager_id">Sales Manager</Label>
                  <Select
                    value={formData.sales_manager_id || ""}
                    onValueChange={(value) =>
                      setFormData({
                        ...formData,
                        sales_manager_id: value || undefined,
                      })
                    }
                  >
                    <SelectTrigger id="sales_manager_id">
                      <SelectValue placeholder="Select a sales manager" />
                    </SelectTrigger>
                    <SelectContent>
                      {users?.map((user: User) => (
                        <SelectItem key={user.user_id} value={user.user_id}>
                          {user.full_name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="estimator_id">Estimator</Label>
                  <Select
                    value={formData.estimator_id || ""}
                    onValueChange={(value) =>
                      setFormData({
                        ...formData,
                        estimator_id: value || undefined,
                      })
                    }
                  >
                    <SelectTrigger id="estimator_id">
                      <SelectValue placeholder="Select an estimator" />
                    </SelectTrigger>
                    <SelectContent>
                      {users?.map((user: User) => (
                        <SelectItem key={user.user_id} value={user.user_id}>
                          {user.full_name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="site_superintendent_id">
                    Site Superintendent
                  </Label>
                  <Select
                    value={formData.site_superintendent_id || ""}
                    onValueChange={(value) =>
                      setFormData({
                        ...formData,
                        site_superintendent_id: value || undefined,
                      })
                    }
                  >
                    <SelectTrigger id="site_superintendent_id">
                      <SelectValue placeholder="Select a site superintendent" />
                    </SelectTrigger>
                    <SelectContent>
                      {users?.map((user: User) => (
                        <SelectItem key={user.user_id} value={user.user_id}>
                          {user.full_name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="warranty_rep_id">Warranty Rep</Label>
                  <Select
                    value={formData.warranty_rep_id || ""}
                    onValueChange={(value) =>
                      setFormData({
                        ...formData,
                        warranty_rep_id: value || undefined,
                      })
                    }
                  >
                    <SelectTrigger id="warranty_rep_id">
                      <SelectValue placeholder="Select a warranty rep" />
                    </SelectTrigger>
                    <SelectContent>
                      {users?.map((user: User) => (
                        <SelectItem key={user.user_id} value={user.user_id}>
                          {user.full_name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Additional Information</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="warranty_job">Warranty Job</Label>
                  <Input
                    id="warranty_job"
                    value={formData.warranty_job}
                    onChange={(e) =>
                      setFormData({ ...formData, warranty_job: e.target.value })
                    }
                  />
                </div>

                <div>
                  <Label htmlFor="hoa_id">HOA ID</Label>
                  <Input
                    id="hoa_id"
                    value={formData.hoa_id}
                    onChange={(e) =>
                      setFormData({ ...formData, hoa_id: e.target.value })
                    }
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="marketing_comments">Marketing Comments</Label>
                <Textarea
                  id="marketing_comments"
                  value={formData.marketing_comments}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      marketing_comments: e.target.value,
                    })
                  }
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit">
                {selectedPhase ? "Update" : "Create"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
