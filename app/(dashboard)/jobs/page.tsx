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
import { useTimezone } from "../../../lib/timezone-context";
import { Plus, Edit, Trash2, Briefcase } from "lucide-react";
import { CommunityAddressCellRenderer } from "../../../components/grid/CommunityAddressCellRenderer";
import { api } from "../../providers";
import { useFieldLabels } from "../../../hooks/useFieldLabels";

interface Job {
  job_id: string;
  job_number: string;
  description: string | null;
  construction_stage: number;
  community_id: string | null;
  created_at: Date;
  updated_at: Date;
}

// Custom cell renderer for actions
const ActionsCellRenderer = ({
  data,
  onEdit,
  onDelete,
}: {
  data: Job;
  onEdit: (job: Job) => void;
  onDelete: (job: Job) => void;
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

// Custom cell renderer for construction stage
const StageCellRenderer = ({ value }: { value: number | null }) => {
  if (value === null || value === undefined)
    return <span className="text-muted-foreground">-</span>;

  const getStageInfo = (stage: number) => {
    switch (stage) {
      case 0:
        return { label: "PLANNING", color: "bg-blue-100 text-blue-800" };
      case 1:
        return { label: "IN PROGRESS", color: "bg-yellow-100 text-yellow-800" };
      case 2:
        return { label: "COMPLETED", color: "bg-green-100 text-green-800" };
      case 3:
        return { label: "ON HOLD", color: "bg-red-100 text-red-800" };
      default:
        return { label: "UNKNOWN", color: "bg-gray-100 text-gray-800" };
    }
  };

  const stageInfo = getStageInfo(value);

  return (
    <Badge className={stageInfo.color} variant="secondary">
      {stageInfo.label}
    </Badge>
  );
};

export default function JobsPage() {
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

  // Field labels for job form customization
  const { getLabel, getPlaceholder, getHelpText, isVisible, isRequired } =
    useFieldLabels("job");

  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingJob, setEditingJob] = useState<Job | null>(null);
  const [formData, setFormData] = useState({
    job_number: "",
    description: "",
    construction_stage: "planning",
  });

  // Delete confirmation state
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [jobToDelete, setJobToDelete] = useState<Job | null>(null);

  // Get tRPC utils for cache invalidation
  const utils = api.useUtils();

  // Fetch jobs data
  const { data: jobs = [], isLoading } = api.jobs.getAll.useQuery(
    {
      builderId: builderId!,
      limit: 1000,
    },
    {
      enabled: !!builderId,
    }
  );

  // Fetch communities data for addresses
  const { data: communities = [] } = api.builders.getCommunities.useQuery(
    {
      builderId: builderId!,
    },
    {
      enabled: !!builderId,
    }
  );

  // Create job mutation
  const createJobMutation = api.jobs.create.useMutation({
    onSuccess: () => {
      utils.jobs.getAll.invalidate();
      setIsModalOpen(false);
      setFormData({
        job_number: "",
        description: "",
        construction_stage: "planning",
      });
    },
    onError: (error) => {
      console.error("Failed to create job:", error);
    },
  });

  // Update job mutation
  const updateJobMutation = api.jobs.update.useMutation({
    onSuccess: () => {
      utils.jobs.getAll.invalidate();
      setIsModalOpen(false);
      setEditingJob(null);
    },
    onError: (error) => {
      console.error("Failed to update job:", error);
    },
  });

  // Delete job mutation
  const deleteJobMutation = api.jobs.delete.useMutation({
    onSuccess: () => {
      utils.jobs.getAll.invalidate();
      setDeleteConfirmOpen(false);
      setJobToDelete(null);
    },
    onError: (error) => {
      console.error("Failed to delete job:", error);
    },
  });

  // Handle create new job
  const handleCreateJob = useCallback(() => {
    setEditingJob(null);
    setFormData({
      job_number: "",
      description: "",
      construction_stage: "planning",
    });
    setIsModalOpen(true);
  }, []);

  // Handle edit job
  const handleEditJob = useCallback((job: Job) => {
    setEditingJob(job);

    // Convert number stage back to string for form
    const stageMapping: { [key: number]: string } = {
      0: "planning",
      1: "in_progress",
      2: "completed",
      3: "on_hold",
    };

    setFormData({
      job_number: job.job_number,
      description: job.description || "",
      construction_stage:
        stageMapping[job.construction_stage as number] || "planning",
    });
    setIsModalOpen(true);
  }, []);

  // Handle delete job
  const handleDeleteJob = useCallback((job: Job) => {
    setJobToDelete(job);
    setDeleteConfirmOpen(true);
  }, []);

  // Confirm delete job
  const confirmDeleteJob = useCallback(() => {
    if (!jobToDelete || !builderId) return;

    deleteJobMutation.mutate({
      builderId: builderId,
      jobId: jobToDelete.job_id,
    });
  }, [jobToDelete, builderId, deleteJobMutation]);

  // Handle form submit
  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();

      if (!builderId || !session?.user?.id) {
        console.error("Missing required data for API call");
        return;
      }

      if (!session?.user?.defaultRegionId) {
        console.error("User does not have a default region ID");
        return;
      }

      if (editingJob) {
        // Update existing job
        const constructionStageMap: { [key: string]: number } = {
          planning: 0,
          in_progress: 1,
          completed: 2,
          on_hold: 3,
        };

        updateJobMutation.mutate({
          builderId: builderId,
          jobId: editingJob.job_id,
          description: formData.description || undefined,
          constructionStage:
            constructionStageMap[formData.construction_stage] || 0,
          modifiedBy: session.user.id,
        });
      } else {
        // Create new job
        createJobMutation.mutate({
          builderId: builderId,
          regionId: session.user.defaultRegionId,
          jobNumber: formData.job_number,
          description: formData.description || undefined,
          createdBy: session.user.id,
          modifiedBy: session.user.id,
        });
      }
    },
    [
      formData,
      editingJob,
      builderId,
      session?.user?.id,
      session?.user?.defaultRegionId,
      createJobMutation,
      updateJobMutation,
    ]
  );

  // Handle form input changes
  const handleInputChange = useCallback((field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  }, []);

  // AG Grid column definitions
  const columnDefs: ColDef[] = useMemo(
    () => [
      {
        headerName: "Job Number",
        field: "job_number",
        sortable: true,
        filter: true,
        flex: 1,
        minWidth: 120,
      },
      {
        headerName: "Description",
        field: "description",
        sortable: true,
        filter: true,
        flex: 2,
        minWidth: 200,
        valueGetter: (params) => params.data?.description || "No description",
      },
      {
        headerName: "Community & Address",
        field: "community_id",
        sortable: true,
        filter: true,
        flex: 2,
        minWidth: 250,
        cellRenderer: CommunityAddressCellRenderer,
        cellRendererParams: {
          communities: communities,
        },
      },
      {
        headerName: "Construction Stage",
        field: "construction_stage",
        sortable: true,
        filter: true,
        flex: 1,
        minWidth: 150,
        cellRenderer: StageCellRenderer,
      },
      {
        headerName: "Created",
        field: "created_at",
        sortable: true,
        filter: "agDateColumnFilter",
        flex: 1,
        minWidth: 120,
        valueFormatter: (params) => {
          if (!params.value) return "";
          return formatDate(params.value);
        },
      },
      {
        headerName: "Actions",
        field: "actions",
        sortable: false,
        filter: false,
        width: 100,
        pinned: "right",
        cellRenderer: ActionsCellRenderer,
        cellRendererParams: {
          onEdit: handleEditJob,
          onDelete: handleDeleteJob,
        },
      },
    ],
    [handleEditJob, handleDeleteJob, formatDate, communities]
  );

  // Excel columns configuration for import/export
  const excelColumns: ExcelColumn[] = [
    { field: "job_number", header: "Job Number *", required: true },
    { field: "description", header: "Description" },
    {
      field: "construction_stage",
      header: "Construction Stage",
      defaultValue: "PLANNING",
    },
  ];

  // Handle import from DataGrid
  const handleImport = useCallback(
    async (importData: any[]) => {
      if (!builderId || !session?.user?.id || !session?.user?.defaultRegionId)
        return;

      for (const row of importData) {
        // Map stage string to number
        const stageMapping: { [key: string]: number } = {
          PLANNING: 0,
          "IN PROGRESS": 1,
          COMPLETED: 2,
          "ON HOLD": 3,
        };

        const constructionStage =
          stageMapping[row.construction_stage?.toUpperCase()] || 0;

        await createJobMutation.mutateAsync({
          builderId: builderId,
          regionId: session.user.defaultRegionId,
          jobNumber: row.job_number,
          description: row.description || undefined,
          createdBy: session.user.id,
          modifiedBy: session.user.id,
        });
      }

      // Refresh data
      utils.jobs.getAll.invalidate();
    },
    [
      builderId,
      session?.user?.id,
      session?.user?.defaultRegionId,
      createJobMutation,
      utils,
    ]
  );

  // Show loading while checking authentication
  if (status === "loading") {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground text-lg">Loading jobs...</p>
        </div>
      </div>
    );
  }

  // Show loading while fetching jobs data
  if (builderId && isLoading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold">Jobs Management</h1>
            <p className="text-muted-foreground">
              Manage construction jobs and project tracking
            </p>
          </div>
        </div>
        <Card>
          <CardHeader>
            <CardTitle>Construction Jobs</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-center h-64">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                <p className="text-muted-foreground">Loading jobs data...</p>
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
              <Briefcase className="h-8 w-8" />
              Jobs
            </h1>
            <p className="text-muted-foreground">
              Manage construction jobs and project tracking
            </p>
          </div>
          <Button onClick={handleCreateJob} className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Add New Job
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Construction Jobs</CardTitle>
          </CardHeader>
          <CardContent>
            <DataGrid
              data={jobs}
              loading={isLoading}
              columnDefs={columnDefs}
              excelColumns={excelColumns}
              tableName="job"
              onImport={handleImport}
              fileName="jobs"
              importTitle="Import Jobs"
            />
          </CardContent>
        </Card>

        {/* Job Modal */}
        <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>
                {editingJob ? "Edit Job" : "Create New Job"}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit}>
              <div className="grid gap-4 py-4">
                {isVisible("job_number") && (
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="job_number" className="text-right">
                      {getLabel("job_number", "Job Number")}
                      {isRequired("job_number") && (
                        <span className="text-red-500 ml-1">*</span>
                      )}
                    </Label>
                    <div className="col-span-3 space-y-1">
                      <Input
                        id="job_number"
                        value={formData.job_number}
                        onChange={(e) =>
                          handleInputChange("job_number", e.target.value)
                        }
                        placeholder={getPlaceholder(
                          "job_number",
                          "Enter job number..."
                        )}
                        required={isRequired("job_number") ?? true}
                      />
                      {getHelpText("job_number") && (
                        <p className="text-xs text-muted-foreground">
                          {getHelpText("job_number")}
                        </p>
                      )}
                    </div>
                  </div>
                )}
                {isVisible("description") && (
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="description" className="text-right">
                      {getLabel("description", "Description")}
                      {isRequired("description") && (
                        <span className="text-red-500 ml-1">*</span>
                      )}
                    </Label>
                    <div className="col-span-3 space-y-1">
                      <Input
                        id="description"
                        value={formData.description}
                        onChange={(e) =>
                          handleInputChange("description", e.target.value)
                        }
                        placeholder={getPlaceholder(
                          "description",
                          "Enter job description..."
                        )}
                        required={isRequired("description") ?? false}
                      />
                      {getHelpText("description") && (
                        <p className="text-xs text-muted-foreground">
                          {getHelpText("description")}
                        </p>
                      )}
                    </div>
                  </div>
                )}
                {isVisible("construction_stage") && (
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="construction_stage" className="text-right">
                      {getLabel("construction_stage", "Stage")}
                      {isRequired("construction_stage") && (
                        <span className="text-red-500 ml-1">*</span>
                      )}
                    </Label>
                    <div className="col-span-3 space-y-1">
                      <Select
                        value={formData.construction_stage}
                        onValueChange={(value) =>
                          handleInputChange("construction_stage", value)
                        }
                      >
                        <SelectTrigger>
                          <SelectValue
                            placeholder={getPlaceholder(
                              "construction_stage",
                              "Select construction stage"
                            )}
                          />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="planning">Planning</SelectItem>
                          <SelectItem value="in_progress">
                            In Progress
                          </SelectItem>
                          <SelectItem value="completed">Completed</SelectItem>
                          <SelectItem value="on_hold">On Hold</SelectItem>
                        </SelectContent>
                      </Select>
                      {getHelpText("construction_stage") && (
                        <p className="text-xs text-muted-foreground">
                          {getHelpText("construction_stage")}
                        </p>
                      )}
                    </div>
                  </div>
                )}
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
                    createJobMutation.isPending || updateJobMutation.isPending
                  }
                >
                  {createJobMutation.isPending || updateJobMutation.isPending
                    ? editingJob
                      ? "Updating..."
                      : "Creating..."
                    : editingJob
                    ? "Update Job"
                    : "Create Job"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation Dialog */}
        <Dialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Delete Job</DialogTitle>
            </DialogHeader>
            <div className="py-4">
              <p className="text-muted-foreground">
                Are you sure you want to delete job &ldquo;
                {jobToDelete?.job_number}&rdquo;? This action cannot be undone.
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
                onClick={confirmDeleteJob}
                disabled={deleteJobMutation.isPending}
              >
                {deleteJobMutation.isPending ? "Deleting..." : "Delete Job"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
