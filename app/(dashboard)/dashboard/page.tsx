"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../../../components/ui/card";
import { Button } from "../../../components/ui/button";
import { useGetAllQuery as useJobsQuery } from "../../../store/apis/jobsApi";
import { useGetAllQuery as useHomesQuery } from "../../../store/apis/homesApi";
import { useGetAllQuery as useCustomersQuery } from "../../../store/apis/customersApi";
import { useGetAllQuery as useCommunitiesQuery } from "../../../store/apis/communitiesApi";
import { Building2, Home, Users, HardHat } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

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

export default function Dashboard() {
  const router = useRouter();

  // Use authenticated user's builder ID
  const builderId = "e5e94058-75c6-4514-88a3-531af3afb750";

  // Fetch data using RTK Query
  const { data: jobs, isLoading: jobsLoading } = useJobsQuery({
    builderId,
    limit: 10,
  });
  const { data: homes, isLoading: homesLoading } = useHomesQuery({
    builderId,
    limit: 10,
  });
  const { data: customers, isLoading: customersLoading } = useCustomersQuery({
    builderId,
  });
  const { data: communities, isLoading: communitiesLoading } =
    useCommunitiesQuery({
      builderId,
    });

  // Show loading while checking authentication
  if (status === "loading") {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground text-lg">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  // Show loading while fetching dashboard data
  const isLoadingData =
    jobsLoading || homesLoading || customersLoading || communitiesLoading;
  if (builderId && isLoadingData) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="p-6">
          {/* Stats Overview with loading skeletons */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
            {[...Array(4)].map((_, i) => (
              <Card key={i}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <div className="h-4 w-24 bg-muted animate-pulse rounded"></div>
                  <div className="h-4 w-4 bg-muted animate-pulse rounded"></div>
                </CardHeader>
                <CardContent>
                  <div className="h-8 w-16 bg-muted animate-pulse rounded mb-2"></div>
                  <div className="h-3 w-32 bg-muted animate-pulse rounded"></div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Main Content Grid with loading skeletons */}
          <div className="grid gap-6 md:grid-cols-2">
            {[...Array(2)].map((_, i) => (
              <Card key={i}>
                <CardHeader>
                  <div className="h-6 w-48 bg-muted animate-pulse rounded mb-2"></div>
                  <div className="h-4 w-64 bg-muted animate-pulse rounded"></div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {[...Array(3)].map((_, j) => (
                      <div
                        key={j}
                        className="h-16 bg-muted animate-pulse rounded"
                      />
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Customer Overview skeleton */}
          <Card className="mt-6">
            <CardHeader>
              <div className="h-6 w-40 bg-muted animate-pulse rounded mb-2"></div>
              <div className="h-4 w-56 bg-muted animate-pulse rounded"></div>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="p-4 border rounded-lg">
                    <div className="h-5 w-32 bg-muted animate-pulse rounded mb-2"></div>
                    <div className="h-4 w-40 bg-muted animate-pulse rounded mb-1"></div>
                    <div className="h-4 w-36 bg-muted animate-pulse rounded mb-2"></div>
                    <div className="h-3 w-28 bg-muted animate-pulse rounded"></div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Extract actual data from RTK Query response
  const jobsData = Array.isArray(jobs) ? jobs : [];
  const homesData = Array.isArray(homes) ? homes : [];
  const customersData = Array.isArray(customers) ? customers : [];
  const communitiesData = Array.isArray(communities) ? communities : [];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="p-6">
        {/* Stats Overview */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Jobs</CardTitle>
              <HardHat className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {jobsLoading ? "..." : jobsData?.length || 0}
              </div>
              <p className="text-xs text-muted-foreground">
                Construction projects in progress
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Homes</CardTitle>
              <Home className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {homesLoading ? "..." : homesData?.length || 0}
              </div>
              <p className="text-xs text-muted-foreground">
                Total homes in inventory
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Customers</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {customersLoading ? "..." : customersData?.length || 0}
              </div>
              <p className="text-xs text-muted-foreground">
                Active customer relationships
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Communities</CardTitle>
              <Building2 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {communitiesLoading ? "..." : communitiesData?.length || 0}
              </div>
              <p className="text-xs text-muted-foreground">
                Development communities
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Grid */}
        <div className="grid gap-6 md:grid-cols-2">
          {/* Recent Jobs */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <HardHat className="h-5 w-5" />
                    Recent Construction Jobs
                  </CardTitle>
                  <CardDescription>
                    Latest construction projects and their progress
                  </CardDescription>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => router.push("/jobs")}
                >
                  View All
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {jobsLoading ? (
                <div className="space-y-2">
                  {[...Array(3)].map((_, i) => (
                    <div
                      key={i}
                      className="h-16 bg-muted animate-pulse rounded"
                    />
                  ))}
                </div>
              ) : jobsData && jobsData.length > 0 ? (
                <div className="space-y-4">
                  {jobsData
                    .slice(0, 5)
                    .map((job: import("../../../store/apis/jobsApi").Job) => (
                      <div
                        key={job.job_id}
                        className="flex items-center justify-between p-3 border rounded hover:bg-accent/50 transition-colors"
                      >
                        <div>
                          <p className="font-medium">Job #{job.job_number}</p>
                          <p className="text-sm text-muted-foreground">
                            {job.description || "No description"}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            Stage:{" "}
                            {getStageLabel(job.construction_stage ?? null)}
                          </p>
                        </div>
                        <div className="text-right">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => router.push(`/jobs/${job.job_id}`)}
                          >
                            View Details
                          </Button>
                        </div>
                      </div>
                    ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <HardHat className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No construction jobs found</p>
                  <p className="text-sm">
                    Create your first job to get started
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Recent Homes */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Home className="h-5 w-5" />
                    Home Inventory
                  </CardTitle>
                  <CardDescription>
                    Available homes and floor plans
                  </CardDescription>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => router.push("/homes")}
                >
                  View All
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {homesLoading ? (
                <div className="space-y-2">
                  {[...Array(3)].map((_, i) => (
                    <div
                      key={i}
                      className="h-16 bg-muted animate-pulse rounded"
                    />
                  ))}
                </div>
              ) : homesData && homesData.length > 0 ? (
                <div className="space-y-4">
                  {homesData
                    .slice(0, 5)
                    .map(
                      (home: import("../../../store/apis/homesApi").Home) => (
                        <div
                          key={home.home_id}
                          className="flex items-center justify-between p-3 border rounded hover:bg-accent/50 transition-colors"
                        >
                          <div>
                            <p className="font-medium">
                              {home.floor_plan_code || "Unknown Plan"} -{" "}
                              {home.elevation_code || "No Elevation"}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              {home.description || "No description"}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              Sequence: {home.sequence}
                            </p>
                          </div>
                          <div className="text-right">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() =>
                                router.push(`/homes/${home.home_id}`)
                              }
                            >
                              View Home
                            </Button>
                          </div>
                        </div>
                      )
                    )}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <Home className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No homes found</p>
                  <p className="text-sm">Add homes to your inventory</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Customer Management Preview */}
        <Card className="mt-6">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Customer Overview
                </CardTitle>
                <CardDescription>
                  Recent customer interactions and leads
                </CardDescription>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.push("/customers")}
              >
                View All
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {customersLoading ? (
              <div className="space-y-2">
                {[...Array(2)].map((_, i) => (
                  <div
                    key={i}
                    className="h-16 bg-muted animate-pulse rounded"
                  />
                ))}
              </div>
            ) : customersData && customersData.length > 0 ? (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {customersData
                  .slice(0, 6)
                  .map(
                    (
                      customer: import("../../../store/apis/customersApi").Customer
                    ) => (
                      <div
                        key={customer.customer_id}
                        className="p-4 border rounded-lg cursor-pointer hover:bg-accent transition-colors"
                        onClick={() =>
                          router.push(
                            `/customers?customer=${customer.customer_id}`
                          )
                        }
                      >
                        <h4 className="font-medium">
                          {customer.customer_name}
                        </h4>
                        <p className="text-sm text-muted-foreground">
                          {customer.email || "No email"}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {customer.cell_phone ||
                            customer.home_phone ||
                            "No phone"}
                        </p>
                        <p className="text-xs text-muted-foreground mt-2">
                          {customer.city && customer.state
                            ? `${customer.city}, ${customer.state}`
                            : "No address"}
                        </p>
                      </div>
                    )
                  )}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No customers found</p>
                <p className="text-sm">Start adding customers to track sales</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
