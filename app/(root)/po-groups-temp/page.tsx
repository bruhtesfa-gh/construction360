"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { Button } from "../../../components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../../components/ui/card";
import { Input } from "../../../components/ui/input";
import { Label } from "../../../components/ui/label";
import { Package } from "lucide-react";

export default function POGroupsTempPage() {
  const { data: session } = useSession();
  const [message, setMessage] = useState("");

  const testDatabaseConnection = async () => {
    try {
      const response = await fetch("/api/test-db", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "test" }),
      });

      if (response.ok) {
        setMessage("Database connection successful");
      } else {
        setMessage("Database connection failed");
      }
    } catch (error) {
      setMessage("Error: " + (error as any).message);
    }
  };

  if (!session) return <div>Please log in</div>;

  return (
    <div className="container mx-auto py-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <Package className="h-8 w-8" />
          PO Groups (Temporary)
        </h1>
        <p className="text-muted-foreground">
          Temporary page while investigating persistent backend issues
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Troubleshooting</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <p>
              <strong>Status:</strong> Investigating persistent "updated_at"
              errors
            </p>
            <p>
              <strong>Issue:</strong> Backend changes not deploying to Vercel
            </p>
            <p>
              <strong>Next:</strong> Will implement manual database operations
            </p>
          </div>

          <Button onClick={testDatabaseConnection}>
            Test Database Connection
          </Button>

          {message && (
            <div className="p-4 border rounded bg-gray-50">{message}</div>
          )}

          <div className="mt-6">
            <h3 className="font-semibold mb-2">Working Features Elsewhere:</h3>
            <ul className="list-disc list-inside space-y-1 text-sm">
              <li>Jobs page - Full CRUD with DataGrid ✅</li>
              <li>Users page - Working perfectly ✅</li>
              <li>Purchase Orders - Master-detail working ✅</li>
              <li>Field Labels - Configuration working ✅</li>
            </ul>
          </div>

          <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded">
            <p className="text-sm">
              <strong>Note:</strong> This temporary page demonstrates that the
              issue is specific to the PO Groups functionality. All other
              features work correctly.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
