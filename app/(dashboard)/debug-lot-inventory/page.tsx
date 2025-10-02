"use client";

import { useSession } from "next-auth/react";
import { api } from "../../providers";
import { useEffect } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../../components/ui/card";

export default function DebugLotInventoryPage() {
  const { data: session } = useSession();
  const builderId = session?.user?.builderId;

  const {
    data: debug,
    error,
    isLoading,
  } = api.lotInventory.debug.useQuery(
    {
      builderId: builderId!,
    },
    {
      enabled: !!builderId,
    }
  );

  useEffect(() => {
    if (error) {
      console.error("Debug query error:", error);
    }
    if (debug) {
      console.log("Debug result:", debug);
    }
  }, [debug, error]);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="p-6">
        <h1 className="text-3xl font-bold mb-6">Debug Lot Inventory</h1>

        <Card>
          <CardHeader>
            <CardTitle>Debug Information</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading && <p>Loading debug info...</p>}

            {error && (
              <div className="text-red-600">
                <p className="font-bold">Error:</p>
                <pre className="text-sm">{JSON.stringify(error, null, 2)}</pre>
              </div>
            )}

            {debug && (
              <div className="space-y-4">
                <div>
                  <p className="font-bold">
                    Success: {debug.success ? "Yes" : "No"}
                  </p>
                </div>

                {debug.error && (
                  <div className="text-red-600">
                    <p className="font-bold">Error Message:</p>
                    <p>{debug.error}</p>
                    {debug.stack && (
                      <pre className="text-xs mt-2 overflow-auto">
                        {debug.stack}
                      </pre>
                    )}
                  </div>
                )}

                {debug.success && (
                  <>
                    <div>
                      <p className="font-bold">Database Connection:</p>
                      <p>{debug.dbConnection ? "Working" : "Failed"}</p>
                    </div>

                    <div>
                      <p className="font-bold">Builder Context:</p>
                      <p>
                        Config Value:{" "}
                        {debug.builderContext?.configValue || "N/A"}
                      </p>
                      <p>
                        Function Result:{" "}
                        {debug.builderContext?.functionResult || "N/A"}
                      </p>
                      <p>
                        Match: {debug.builderContext?.matches ? "Yes" : "No"}
                      </p>
                    </div>

                    <div>
                      <p className="font-bold">Record Counts:</p>
                      <p>
                        Without RLS: {debug.recordCounts?.withoutRLS || "N/A"}
                      </p>
                      <p>With RLS: {debug.recordCounts?.withRLS || "N/A"}</p>
                    </div>
                  </>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        <div className="mt-6">
          <p className="text-sm text-gray-600">
            Builder ID: {builderId || "Not set"}
          </p>
        </div>
      </div>
    </div>
  );
}
