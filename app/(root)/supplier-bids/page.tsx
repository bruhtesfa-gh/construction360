"use client";

import React, { useState } from "react";
import { useSession } from "next-auth/react";
import type { ColDef } from "ag-grid-community";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../../components/ui/card";
import { Button } from "../../../components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "../../../components/ui/dialog";
import { Label } from "../../../components/ui/label";
import { Input } from "../../../components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../../components/ui/select";
import { Textarea } from "../../../components/ui/textarea";
import { Badge } from "../../../components/ui/badge";
// Navigation provided by (root)/layout.tsx
import { DataGrid, type ExcelColumn } from "../../../components/grid";
import { api } from "../../providers";
import {
  Loader2,
  Plus,
  Trash2,
  Edit,
  Eye,
  Send,
  Award,
  FileText,
  Users,
} from "lucide-react";
import type { SupplierBidMaster } from "../../../types/database";
import { format } from "date-fns";
import Link from "next/link";

export default function SupplierBidsPage() {
  const { data: session } = useSession();
  const [selectedBids, setSelectedBids] = useState<SupplierBidMaster[]>([]);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingBid, setEditingBid] = useState<SupplierBidMaster | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  const builderId = session?.user?.builderId;

  const {
    data: bidsData,
    isLoading,
    refetch,
  } = api.supplierBids.getAllBids.useQuery(
    { builderId: builderId!, limit: 100, offset: 0 },
    { enabled: !!builderId }
  );

  const { data: regions = [] } = api.regions.getAll.useQuery(
    { builderId: builderId! },
    { enabled: !!builderId }
  );

  const { data: communities = [] } = api.regions.getAllCommunities.useQuery(
    { builderId: builderId! },
    { enabled: !!builderId }
  );

  const [formData, setFormData] = useState({
    bid_number: "",
    bid_description: "",
    bid_status: "Draft",
    bid_type: "",
    region_id: "",
    community_id: "",
    job_number: "",
    due_date: "",
    bid_instructions: "",
  });

  const createBidMutation = api.supplierBids.createBid.useMutation({
    onSuccess: () => {
      refetch();
      setIsCreateDialogOpen(false);
      resetForm();
    },
  });

  const updateBidMutation = api.supplierBids.updateBid.useMutation({
    onSuccess: () => {
      refetch();
      setIsEditDialogOpen(false);
      setEditingBid(null);
      resetForm();
    },
  });

  const deleteBidMutation = api.supplierBids.deleteBid.useMutation({
    onSuccess: () => {
      refetch();
      setIsDeleteDialogOpen(false);
      setSelectedBids([]);
    },
  });

  const resetForm = () => {
    setFormData({
      bid_number: "",
      bid_description: "",
      bid_status: "Draft",
      bid_type: "",
      region_id: "",
      community_id: "",
      job_number: "",
      due_date: "",
      bid_instructions: "",
    });
  };

  const handleCreateBid = () => {
    if (!builderId) return;

    createBidMutation.mutate({
      builder_id: builderId,
      ...formData,
      region_id: formData.region_id || null,
      community_id: formData.community_id || null,
      due_date: formData.due_date
        ? new Date(formData.due_date).toISOString()
        : null,
    });
  };

  const handleUpdateBid = () => {
    if (!editingBid) return;

    updateBidMutation.mutate({
      supplier_bid_guid: editingBid.supplier_bid_guid,
      ...formData,
      region_id: formData.region_id || null,
      community_id: formData.community_id || null,
      due_date: formData.due_date
        ? new Date(formData.due_date).toISOString()
        : null,
    });
  };

  const handleEditClick = (bid: SupplierBidMaster) => {
    setEditingBid(bid);
    setFormData({
      bid_number: bid.bid_number || "",
      bid_description: bid.bid_description || "",
      bid_status: bid.bid_status || "Draft",
      bid_type: bid.bid_type || "",
      region_id: bid.region_id || "",
      community_id: bid.community_id || "",
      job_number: bid.job_number || "",
      due_date: bid.due_date
        ? format(new Date(bid.due_date), "yyyy-MM-dd")
        : "",
      bid_instructions: bid.bid_instructions || "",
    });
    setIsEditDialogOpen(true);
  };

  const columns: ColDef<SupplierBidMaster>[] = [
    {
      headerName: "Bid Number",
      field: "bid_number",
      flex: 1,
      minWidth: 120,
      cellRenderer: (params: any) => {
        const bid = params.data;
        return (
          <Link
            href={`/supplier-bids/${bid.supplier_bid_guid}`}
            className="text-blue-600 hover:underline"
          >
            {bid.bid_number || "N/A"}
          </Link>
        );
      },
    },
    {
      headerName: "Description",
      field: "bid_description",
      flex: 2,
      minWidth: 200,
    },
    {
      headerName: "Status",
      field: "bid_status",
      flex: 1,
      minWidth: 100,
      cellRenderer: (params: any) => {
        const status = params.value || "Draft";
        const colors: Record<string, string> = {
          Draft: "bg-gray-100 text-gray-800",
          Sent: "bg-blue-100 text-blue-800",
          "In Progress": "bg-yellow-100 text-yellow-800",
          Completed: "bg-green-100 text-green-800",
          Awarded: "bg-purple-100 text-purple-800",
          Cancelled: "bg-red-100 text-red-800",
        };
        return (
          <Badge className={colors[status] || "bg-gray-100 text-gray-800"}>
            {status}
          </Badge>
        );
      },
    },
    {
      headerName: "Type",
      field: "bid_type",
      flex: 1,
      minWidth: 100,
    },
    {
      headerName: "Due Date",
      field: "due_date",
      flex: 1,
      minWidth: 120,
      valueFormatter: (params: any) => {
        return params.value ? format(new Date(params.value), "MM/dd/yyyy") : "";
      },
    },
    {
      headerName: "Job Number",
      field: "job_number",
      flex: 1,
      minWidth: 100,
    },
    {
      headerName: "Actions",
      field: "actions" as any,
      flex: 1,
      minWidth: 150,
      cellRenderer: (params: any) => {
        const bid = params.data;
        return (
          <div className="flex gap-2">
            <Button
              size="sm"
              variant="ghost"
              onClick={() => handleEditClick(bid)}
            >
              <Edit className="h-4 w-4" />
            </Button>
            <Link href={`/supplier-bids/${bid.supplier_bid_guid}`}>
              <Button size="sm" variant="ghost">
                <Eye className="h-4 w-4" />
              </Button>
            </Link>
            <Link href={`/supplier-bids/${bid.supplier_bid_guid}/assignments`}>
              <Button size="sm" variant="ghost">
                <Users className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        );
      },
    },
  ];

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <>
      <div className="container mx-auto p-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Supplier Bids</CardTitle>
            <div className="flex gap-2">
              {selectedBids.length > 0 && (
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => setIsDeleteDialogOpen(true)}
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete Selected ({selectedBids.length})
                </Button>
              )}
              <Button onClick={() => setIsCreateDialogOpen(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Create Bid
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <DataGrid
              columnDefs={columns}
              data={bidsData?.bids || []}
              excelColumns={[]}
              loading={isLoading}
              onSelectionChanged={(selectedRows: SupplierBidMaster[]) => {
                setSelectedBids(selectedRows);
              }}
            />
          </CardContent>
        </Card>

        {/* Create Bid Dialog */}
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Create New Bid</DialogTitle>
              <DialogDescription>
                Create a new supplier bid request
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="bid_number">Bid Number</Label>
                  <Input
                    id="bid_number"
                    value={formData.bid_number}
                    onChange={(e) =>
                      setFormData({ ...formData, bid_number: e.target.value })
                    }
                  />
                </div>
                <div>
                  <Label htmlFor="bid_type">Bid Type</Label>
                  <Select
                    value={formData.bid_type}
                    onValueChange={(value) =>
                      setFormData({ ...formData, bid_type: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Material">Material</SelectItem>
                      <SelectItem value="Labor">Labor</SelectItem>
                      <SelectItem value="Material & Labor">
                        Material & Labor
                      </SelectItem>
                      <SelectItem value="Service">Service</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label htmlFor="bid_description">Description</Label>
                <Input
                  id="bid_description"
                  value={formData.bid_description}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      bid_description: e.target.value,
                    })
                  }
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="bid_status">Status</Label>
                  <Select
                    value={formData.bid_status}
                    onValueChange={(value) =>
                      setFormData({ ...formData, bid_status: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Draft">Draft</SelectItem>
                      <SelectItem value="Sent">Sent</SelectItem>
                      <SelectItem value="In Progress">In Progress</SelectItem>
                      <SelectItem value="Completed">Completed</SelectItem>
                      <SelectItem value="Awarded">Awarded</SelectItem>
                      <SelectItem value="Cancelled">Cancelled</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="due_date">Due Date</Label>
                  <Input
                    id="due_date"
                    type="date"
                    value={formData.due_date}
                    onChange={(e) =>
                      setFormData({ ...formData, due_date: e.target.value })
                    }
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="region_id">Region</Label>
                  <Select
                    value={formData.region_id}
                    onValueChange={(value) =>
                      setFormData({ ...formData, region_id: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select region" />
                    </SelectTrigger>
                    <SelectContent>
                      {regions.map((region) => (
                        <SelectItem
                          key={region.region_id}
                          value={region.region_id}
                        >
                          {region.description || region.region_code}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="community_id">Community</Label>
                  <Select
                    value={formData.community_id}
                    onValueChange={(value) =>
                      setFormData({ ...formData, community_id: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select community" />
                    </SelectTrigger>
                    <SelectContent>
                      {communities
                        .filter(
                          (c: any) =>
                            !formData.region_id ||
                            c.region_id === formData.region_id
                        )
                        .map((community: any) => (
                          <SelectItem
                            key={community.community_id}
                            value={community.community_id}
                          >
                            {community.community_name || community.description}
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label htmlFor="job_number">Job Number</Label>
                <Input
                  id="job_number"
                  value={formData.job_number}
                  onChange={(e) =>
                    setFormData({ ...formData, job_number: e.target.value })
                  }
                />
              </div>

              <div>
                <Label htmlFor="bid_instructions">Bid Instructions</Label>
                <Textarea
                  id="bid_instructions"
                  value={formData.bid_instructions}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      bid_instructions: e.target.value,
                    })
                  }
                  rows={4}
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setIsCreateDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button
                onClick={handleCreateBid}
                disabled={createBidMutation.isPending}
              >
                {createBidMutation.isPending && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                Create Bid
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Edit Bid Dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Edit Bid</DialogTitle>
              <DialogDescription>Update bid information</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="edit_bid_number">Bid Number</Label>
                  <Input
                    id="edit_bid_number"
                    value={formData.bid_number}
                    onChange={(e) =>
                      setFormData({ ...formData, bid_number: e.target.value })
                    }
                  />
                </div>
                <div>
                  <Label htmlFor="edit_bid_type">Bid Type</Label>
                  <Select
                    value={formData.bid_type}
                    onValueChange={(value) =>
                      setFormData({ ...formData, bid_type: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Material">Material</SelectItem>
                      <SelectItem value="Labor">Labor</SelectItem>
                      <SelectItem value="Material & Labor">
                        Material & Labor
                      </SelectItem>
                      <SelectItem value="Service">Service</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label htmlFor="edit_bid_description">Description</Label>
                <Input
                  id="edit_bid_description"
                  value={formData.bid_description}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      bid_description: e.target.value,
                    })
                  }
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="edit_bid_status">Status</Label>
                  <Select
                    value={formData.bid_status}
                    onValueChange={(value) =>
                      setFormData({ ...formData, bid_status: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Draft">Draft</SelectItem>
                      <SelectItem value="Sent">Sent</SelectItem>
                      <SelectItem value="In Progress">In Progress</SelectItem>
                      <SelectItem value="Completed">Completed</SelectItem>
                      <SelectItem value="Awarded">Awarded</SelectItem>
                      <SelectItem value="Cancelled">Cancelled</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="edit_due_date">Due Date</Label>
                  <Input
                    id="edit_due_date"
                    type="date"
                    value={formData.due_date}
                    onChange={(e) =>
                      setFormData({ ...formData, due_date: e.target.value })
                    }
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="edit_region_id">Region</Label>
                  <Select
                    value={formData.region_id}
                    onValueChange={(value) =>
                      setFormData({ ...formData, region_id: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select region" />
                    </SelectTrigger>
                    <SelectContent>
                      {regions.map((region) => (
                        <SelectItem
                          key={region.region_id}
                          value={region.region_id}
                        >
                          {region.description || region.region_code}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="edit_community_id">Community</Label>
                  <Select
                    value={formData.community_id}
                    onValueChange={(value) =>
                      setFormData({ ...formData, community_id: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select community" />
                    </SelectTrigger>
                    <SelectContent>
                      {communities
                        .filter(
                          (c: any) =>
                            !formData.region_id ||
                            c.region_id === formData.region_id
                        )
                        .map((community: any) => (
                          <SelectItem
                            key={community.community_id}
                            value={community.community_id}
                          >
                            {community.community_name || community.description}
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label htmlFor="edit_job_number">Job Number</Label>
                <Input
                  id="edit_job_number"
                  value={formData.job_number}
                  onChange={(e) =>
                    setFormData({ ...formData, job_number: e.target.value })
                  }
                />
              </div>

              <div>
                <Label htmlFor="edit_bid_instructions">Bid Instructions</Label>
                <Textarea
                  id="edit_bid_instructions"
                  value={formData.bid_instructions}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      bid_instructions: e.target.value,
                    })
                  }
                  rows={4}
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setIsEditDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button
                onClick={handleUpdateBid}
                disabled={updateBidMutation.isPending}
              >
                {updateBidMutation.isPending && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                Update Bid
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation Dialog */}
        <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Delete Bids</DialogTitle>
              <DialogDescription>
                Are you sure you want to delete {selectedBids.length} selected
                bid(s)? This action cannot be undone.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setIsDeleteDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={() => {
                  selectedBids.forEach((bid) => {
                    deleteBidMutation.mutate({ bidId: bid.supplier_bid_guid });
                  });
                }}
                disabled={deleteBidMutation.isPending}
              >
                {deleteBidMutation.isPending && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                Delete
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </>
  );
}
