"use client";

import { useEffect, useState, useCallback } from "react";
import { useSession } from "next-auth/react";
import { useRouter, useParams } from "next/navigation";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../../../components/ui/card";
import { Button } from "../../../../components/ui/button";
import { Badge } from "../../../../components/ui/badge";
import { Input } from "../../../../components/ui/input";
import { Label } from "../../../../components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../../../components/ui/select";
import {
  ArrowLeft,
  Edit,
  Calendar,
  MapPin,
  FileText,
  HardHat,
  Save,
  X,
} from "lucide-react";
import { api } from "../../../providers";
import { useTimezone } from "../../../../lib/timezone-context";

// Utility function to convert stage numbers to readable names
const getStageLabel = (stage: number | null): string => {
  if (stage === null || stage === undefined) return "Not Set";

  switch (stage) {
    case 0:
      return "Planning";
    case 1:
      return "In Progress";
    case 2:
      return "Completed";
    case 3:
      return "On Hold";
    default:
      return "Unknown";
  }
};

const getStageBadgeVariant = (
  stage: number | null
): "default" | "secondary" | "destructive" | "outline" => {
  switch (stage) {
    case 0:
      return "secondary";
    case 1:
      return "default";
    case 2:
      return "outline";
    case 3:
      return "destructive";
    default:
      return "secondary";
  }
};

export default function JobDetailPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const params = useParams();
  const jobId = params?.id as string;
  const { formatDate } = useTimezone();
  const [isEditMode, setIsEditMode] = useState(false);
  const [formData, setFormData] = useState({
    description: "",
    construction_stage: "0",
  });
  const utils = api.useUtils();

  // Redirect to signin if not authenticated
  useEffect(() => {
    if (status === "loading") return;
    if (!session) {
      router.push("/signin");
      return;
    }
  }, [session, status, router]);

  const builderId = session?.user?.builderId;

  // Fetch job details
  const {
    data: job,
    isLoading,
    refetch,
  } = api.jobs.getById.useQuery(
    {
      builderId: builderId!,
      jobId: jobId,
    },
    {
      enabled: !!builderId && !!jobId,
    }
  );

  // Update job mutation
  const updateJobMutation = api.jobs.update.useMutation({
    onSuccess: () => {
      refetch();
      setIsEditMode(false);
      utils.jobs.getAll.invalidate();
    },
  });

  // Handle form input changes
  const handleInputChange = useCallback((field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  }, []);

  // Handle save
  const handleSave = useCallback(async () => {
    if (!job || !session?.user) return;

    const constructionStageMap: Record<string, number> = {
      "0": 0, // Planning
      "1": 1, // In Progress
      "2": 2, // Completed
      "3": 3, // On Hold
    };

    await updateJobMutation.mutateAsync({
      builderId: builderId!,
      jobId: job.job_id,
      description: formData.description || undefined,
      constructionStage: constructionStageMap[formData.construction_stage] || 0,
      modifiedBy: session.user.id,
    });
  }, [job, session, builderId, formData, updateJobMutation]);

  // Show loading while checking authentication
  if (status === "loading" || !builderId) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground text-lg">Loading...</p>
        </div>
      </div>
    );
  }

  // Show loading while fetching job data
  if (isLoading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <Button
            variant="ghost"
            onClick={() => router.push("/jobs")}
            className="gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Jobs
          </Button>
        </div>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading job details...</p>
          </div>
        </div>
      </div>
    );
  }

  // Show error if job not found
  if (!job) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <Button
            variant="ghost"
            onClick={() => router.push("/jobs")}
            className="gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Jobs
          </Button>
        </div>
        <Card>
          <CardContent className="py-8">
            <div className="text-center">
              <HardHat className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-semibold mb-2">Job Not Found</h3>
              <p className="text-muted-foreground">
                The job you&apos;re looking for doesn&apos;t exist or you
                don&apos;t have permission to view it.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            onClick={() => router.push("/jobs")}
            className="gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Jobs
          </Button>
          <div>
            <h1 className="text-3xl font-bold">Job #{job.job_number}</h1>
            <p className="text-muted-foreground">View and manage job details</p>
          </div>
        </div>
        {!isEditMode ? (
          <Button
            onClick={() => {
              setFormData({
                description: job.description || "",
                construction_stage: String(job.construction_stage || 0),
              });
              setIsEditMode(true);
            }}
            className="gap-2"
          >
            <Edit className="h-4 w-4" />
            Edit Job
          </Button>
        ) : (
          <div className="flex gap-2">
            <Button
              onClick={handleSave}
              disabled={updateJobMutation.isPending}
              className="gap-2"
            >
              <Save className="h-4 w-4" />
              Save
            </Button>
            <Button
              variant="outline"
              onClick={() => setIsEditMode(false)}
              disabled={updateJobMutation.isPending}
              className="gap-2"
            >
              <X className="h-4 w-4" />
              Cancel
            </Button>
          </div>
        )}
      </div>

      {/* Job Details */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Basic Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Basic Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm text-muted-foreground">Job Number</p>
              <p className="font-medium">{job.job_number}</p>
            </div>
            <div>
              <Label
                htmlFor="description"
                className="text-sm text-muted-foreground"
              >
                Description
              </Label>
              {isEditMode ? (
                <Input
                  id="description"
                  value={formData.description}
                  onChange={(e) =>
                    handleInputChange("description", e.target.value)
                  }
                  className="mt-1"
                  placeholder="Enter job description"
                />
              ) : (
                <p className="font-medium">
                  {job.description || "No description provided"}
                </p>
              )}
            </div>
            <div>
              <Label
                htmlFor="construction_stage"
                className="text-sm text-muted-foreground"
              >
                Construction Stage
              </Label>
              {isEditMode ? (
                <Select
                  value={formData.construction_stage}
                  onValueChange={(value) =>
                    handleInputChange("construction_stage", value)
                  }
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Select construction stage" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="0">Planning</SelectItem>
                    <SelectItem value="1">In Progress</SelectItem>
                    <SelectItem value="2">Completed</SelectItem>
                    <SelectItem value="3">On Hold</SelectItem>
                  </SelectContent>
                </Select>
              ) : (
                <div className="flex items-center gap-2 mt-1">
                  <Badge variant={getStageBadgeVariant(job.construction_stage)}>
                    {getStageLabel(job.construction_stage)}
                  </Badge>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Location Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5" />
              Location Details
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {job.community_id && (
              <div>
                <p className="text-sm text-muted-foreground">Community</p>
                <p className="font-medium">{job.community_id}</p>
              </div>
            )}
            {!job.community_id && (
              <p className="text-muted-foreground text-sm">
                No location information available
              </p>
            )}
          </CardContent>
        </Card>

        {/* Timestamps */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Timeline
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <p className="text-sm text-muted-foreground">Created Date</p>
                <p className="font-medium">
                  {job.created_at
                    ? formatDate(job.created_at)
                    : "Not available"}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Last Updated</p>
                <p className="font-medium">
                  {job.updated_at
                    ? formatDate(job.updated_at)
                    : "Not available"}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
