"use client";

import { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../../components/ui/card";
import { Badge } from "../../../components/ui/badge";
import { CheckCircle, XCircle, RefreshCw } from "lucide-react";
import { Button } from "../../../components/ui/button";

export default function DeploymentTestPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDeploymentInfo = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/deployment-test");
      if (!response.ok) {
        throw new Error("Failed to fetch deployment info");
      }
      const result = await response.json();
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDeploymentInfo();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Deployment Test Page</h1>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              Deployment Information
              <Button
                onClick={fetchDeploymentInfo}
                variant="outline"
                size="sm"
                disabled={loading}
              >
                <RefreshCw
                  className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`}
                />
                Refresh
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading && (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                <p className="mt-2 text-muted-foreground">
                  Loading deployment info...
                </p>
              </div>
            )}

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="flex items-center gap-2 text-red-800">
                  <XCircle className="h-5 w-5" />
                  <span className="font-medium">Error:</span> {error}
                </div>
              </div>
            )}

            {data && !loading && !error && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Status</p>
                    <Badge className="bg-green-100 text-green-800">
                      <CheckCircle className="h-3 w-3 mr-1" />
                      {data.status}
                    </Badge>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Version</p>
                    <p className="font-mono font-medium">
                      {data.deploymentVersion}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Last Commit</p>
                    <p className="font-mono font-medium">{data.lastCommit}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Timestamp</p>
                    <p className="font-mono text-sm">
                      {new Date(data.timestamp).toLocaleString()}
                    </p>
                  </div>
                </div>

                <div>
                  <p className="text-sm text-muted-foreground mb-2">Message</p>
                  <p className="bg-gray-100 rounded p-3">{data.message}</p>
                </div>

                <div>
                  <p className="text-sm text-muted-foreground mb-2">
                    Recent Fixes
                  </p>
                  <ul className="space-y-1">
                    {data.fixes.map((fix: string, index: number) => (
                      <li key={index} className="flex items-start gap-2">
                        <CheckCircle className="h-4 w-4 text-green-600 mt-0.5" />
                        <span className="text-sm">{fix}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="mt-6">
          <CardHeader>
            <CardTitle>How to Use This Page</CardTitle>
          </CardHeader>
          <CardContent className="prose prose-sm max-w-none">
            <ol className="space-y-2">
              <li>This page shows if Vercel is deploying the latest code</li>
              <li>
                The version should show: <code>2025-01-08-test-1</code>
              </li>
              <li>
                The last commit should show: <code>bdb9ba9</code>
              </li>
              <li>If you see old values, Vercel is not deploying new code</li>
              <li>After each deployment, check this page to verify updates</li>
            </ol>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
