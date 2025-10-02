"use client";

import { useEffect, useCallback, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { AppGridTable } from "../../../../components/organisms/grid/AppGridTable";
import { ContactsDataSource } from "../../../../core/grid/data_sources/contactsDataSource";
import type { ColDef } from "ag-grid-community";
import { useSelector } from "react-redux";
import { selectUser } from "../../../../store/slices/userSlice";

import { Button } from "../../../../components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../../../components/ui/card";

// import { Switch } from '@/components/ui/switch';
import { Plus, Edit, Trash2, Users, Phone, Mail, Building } from "lucide-react";
import { useGetAllQuery as useContactsQuery } from "../../../../store/apis/contactsApi";
import { contactColDefs } from "../../../../core/grid/col/col_defs/contactColDefs";
import dynamic from "next/dynamic";

const ContactDialog = dynamic(
  () =>
    import("@/components/organisms/dialogs/ContactDialog").then(
      (mod) => mod.ContactDialog
    ),
  {
    ssr: false,
    loading: () => null,
  }
);

import { ContactTypeCellRenderer } from "../../../../core/grid/cell_renderers/ContactTypeCellRenderer";
import { ActiveStatusCellRenderer } from "../../../../core/grid/cell_renderers/ActiveStatusCellRenderer";
import { ActionsCellRenderer } from "../../../../core/grid/cell_renderers/ActionsCellRenderer";

export default function ContactsPage() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [search, setSearch] = useState("");

  const router = useRouter();
  const user = useSelector(selectUser);
  const builderId = useSelector(
    (state: any) => state.user.userProfile?.builderId
  );

  const { data, isLoading, error } = useContactsQuery({
    builderId: builderId || "",
  });
  // Calculate stats dynamically
  const contacts = data || [];
  const totalContacts = contacts.length;
  const activeContacts = contacts.filter((c: any) => c.isActive).length;
  const withEmail = contacts.filter((c: any) => c.email).length;
  const withPhone = contacts.filter((c: any) => c.phone).length;

  const columnDefs = useMemo<ColDef[]>(() => contactColDefs, []);

  return (
    <div className="min-h-screen bg-gray-50">
      <main className="p-4 md:p-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
          <h1 className="text-3xl font-bold text-gray-900">Contacts</h1>
          <Button
            onClick={() => setIsDialogOpen(true)}
            className="bg-primary text-white hover:bg-primary/90 shadow-lg px-6 py-2"
            aria-label="Add Contact"
          >
            <Plus className="mr-2 h-5 w-5" />
            Add Contact
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Contacts
              </CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {isLoading ? "..." : totalContacts}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Active Contacts
              </CardTitle>
              <Building className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {isLoading ? "..." : activeContacts}
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
            Error loading contacts.
          </div>
        )}

        {/* Loading State */}
        {isLoading && (
          <div className="mb-4 p-4 bg-gray-100 text-gray-700 rounded">
            Loading contacts...
          </div>
        )}

        {/* Empty State */}
        {!isLoading && contacts.length === 0 && !error && (
          <div className="mb-4 p-4 bg-yellow-100 text-yellow-700 rounded text-center">
            No contacts found. Click "Add Contact" to create one.
          </div>
        )}

        {/* Contacts Table */}
        {contacts.length > 0 && (
          <AppGridTable
            columnDefs={columnDefs}
            data={contacts}
            serverSide={false}
            components={{
              ContactTypeCellRenderer,
              ActiveStatusCellRenderer,
              ActionsCellRenderer,
            }}
            enableExport
            enableImport
            enableColumnToggle
            enableGlobalSearch
            enableFilterRow
            enableEditing={true}
            fileName="contacts"
            gridHeight="600px"
          />
        )}

        <ContactDialog
          open={isDialogOpen}
          onOpenChange={setIsDialogOpen}
          title="Add Contact"
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
