"use client";

"use client";

import { useEffect, useMemo, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useSelector } from "react-redux";
import { selectUser } from "../../../../store/slices/userSlice";
import { AppGridTable } from "../../../../components/organisms/grid/AppGridTable";
import { useGetAllQuery as useCustomersQuery } from "../../../../store/apis/customersApi";
import { Button } from "../../../../components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../../../components/ui/card";
import { Plus, Users, Phone, Mail, Building } from "lucide-react";
import dynamic from "next/dynamic";
import { customerColDefs } from "@/core/grid/col/col_defs/customerColDefs";
import { CustomerDialog } from "@/components/organisms/dialogs/CustomerDialog";
import { ContactCellRenderer } from "@/core/grid/cell_renderers/ContactCellRenderer";

export default function CustomersPage() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const router = useRouter();
  const user = useSelector(selectUser);
  const builderId = useSelector(
    (state: any) => state.user.userProfile?.builderId
  );

  const { data, isLoading, error } = useCustomersQuery({
    builderId: builderId || "",
  });
  const customers = data || [];

  // Stats
  const totalCustomers = customers.length;
  const withEmail = customers.filter((c: any) => c.email).length;
  const withPhone = customers.filter(
    (c: any) => c.cell_phone || c.home_phone
  ).length;
  const activeCustomers = customers.filter((c: any) => c.isActive).length;

  const columnDefs = useMemo(() => customerColDefs, []);

  return (
    <div className="min-h-screen bg-gray-50">
      <main className="p-4 md:p-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
          <h1 className="text-3xl font-bold text-gray-900">Customers</h1>
          <Button
            onClick={() => setIsDialogOpen(true)}
            className="bg-primary text-white hover:bg-primary/90 shadow-lg px-6 py-2"
            aria-label="Add Customer"
          >
            <Plus className="mr-2 h-5 w-5" />
            Add Customer
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Customers
              </CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {isLoading ? "..." : totalCustomers}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Active Customers
              </CardTitle>
              <Building className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {isLoading ? "..." : activeCustomers}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">With Email</CardTitle>
              <Mail className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {isLoading ? "..." : withEmail}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">With Phone</CardTitle>
              <Phone className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {isLoading ? "..." : withPhone}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Error State */}
        {error && (
          <div className="mb-4 p-4 bg-red-100 text-red-700 rounded">
            Error loading customers.
          </div>
        )}

        {/* Loading State */}
        {isLoading && (
          <div className="mb-4 p-4 bg-gray-100 text-gray-700 rounded">
            Loading customers...
          </div>
        )}

        {/* Empty State */}
        {!isLoading && customers.length === 0 && !error && (
          <div className="mb-4 p-4 bg-yellow-100 text-yellow-700 rounded text-center">
            No customers found. Click "Add Customer" to create one.
          </div>
        )}

        {/* Customers Table */}
        {customers.length > 0 && (
          <AppGridTable
            columnDefs={columnDefs}
            data={customers}
            serverSide={false}
            components={{
              ContactCellRenderer,
            }}
            enableExport
            enableImport
            enableColumnToggle
            enableGlobalSearch
            enableFilterRow
            enableEditing={true}
            fileName="customers"
            gridHeight="600px"
          />
        )}

        <CustomerDialog
          open={isDialogOpen}
          onOpenChange={setIsDialogOpen}
          title="Add Customer"
          initialValues={{}}
          onCancel={() => setIsDialogOpen(false)}
          loading={false}
          submitLabel="Save"
          cancelLabel="Cancel"
        />
      </main>
    </div>
  );
}
// Fetch customers data
