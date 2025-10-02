"use client";

import { useEffect } from "react";
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
import {
  ArrowLeft,
  Edit,
  Calendar,
  Home,
  Building2,
  FileText,
  Hash,
} from "lucide-react";
import { api } from "../../../providers";
import { useTimezone } from "../../../../lib/timezone-context";

export default function HomeDetailPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const params = useParams();
  const homeId = params?.id as string;
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

  // Fetch home details
  const { data: home, isLoading } = api.homes.getById.useQuery(
    {
      builderId: builderId!,
      homeId: homeId,
    },
    {
      enabled: !!builderId && !!homeId,
    }
  );

  // TODO: Add communities API router to fetch community names

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

  // Show loading while fetching home data
  if (isLoading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <Button
            variant="ghost"
            onClick={() => router.push("/homes")}
            className="gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Homes
          </Button>
        </div>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading home details...</p>
          </div>
        </div>
      </div>
    );
  }

  // Show error if home not found
  if (!home) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <Button
            variant="ghost"
            onClick={() => router.push("/homes")}
            className="gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Homes
          </Button>
        </div>
        <Card>
          <CardContent className="py-8">
            <div className="text-center">
              <Home className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-semibold mb-2">Home Not Found</h3>
              <p className="text-muted-foreground">
                The home you&apos;re looking for doesn&apos;t exist or you
                don&apos;t have permission to view it.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Find community name
  // const community = communities?.find(c => c.community_id === home.community_id);
  const community = null; // TODO: Fetch from communities API

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            onClick={() => router.push("/homes")}
            className="gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Homes
          </Button>
          <div>
            <h1 className="text-3xl font-bold">
              {home.floor_plan_code || "Unknown Plan"} -{" "}
              {home.elevation_code || "No Elevation"}
            </h1>
            <p className="text-muted-foreground">
              {home.description || "Home inventory details"}
            </p>
          </div>
        </div>
        <Button
          onClick={() => router.push(`/homes?edit=${home.home_id}`)}
          className="gap-2"
        >
          <Edit className="h-4 w-4" />
          Edit Home
        </Button>
      </div>

      {/* Home Details */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Floor Plan Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5" />
              Floor Plan Details
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm text-muted-foreground">Floor Plan Code</p>
              <p className="font-medium">
                {home.floor_plan_code || "Not specified"}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Elevation Code</p>
              <p className="font-medium">
                {home.elevation_code || "Not specified"}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Unit Number</p>
              <p className="font-medium">
                {home.unit_number || "Not assigned"}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Additional Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Additional Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm text-muted-foreground">Description</p>
              <p className="font-medium">
                {home.description || "No description provided"}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Sequence</p>
              <div className="flex items-center gap-2 mt-1">
                <Badge variant="secondary">
                  <Hash className="h-3 w-3 mr-1" />
                  {home.sequence}
                </Badge>
              </div>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Community</p>
              <p className="font-medium">
                {home.community_id || "Not assigned"}
              </p>
            </div>
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
                  {home.created_at
                    ? formatDate(home.created_at)
                    : "Not available"}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Last Updated</p>
                <p className="font-medium">
                  {home.updated_at
                    ? formatDate(home.updated_at)
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
