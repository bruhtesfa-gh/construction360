"use client";

import React, { useState, useMemo } from "react";
import { useSession } from "next-auth/react";
import { api } from "../../providers";
import { ClientDataGrid } from "../../../components/grid";
import { Button } from "../../../components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../../components/ui/card";
import { Badge } from "../../../components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../../components/ui/select";
import { Input } from "../../../components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "../../../components/ui/dialog";
import { Textarea } from "../../../components/ui/textarea";
import { Label } from "../../../components/ui/label";
import {
  Plus,
  Filter,
  MessageSquare,
  Clock,
  User,
  AlertTriangle,
  CheckCircle,
} from "lucide-react";
import type { ColDef } from "ag-grid-community";
import type {
  TicketWithRelations,
  TicketFilters,
} from "../../../types/database";
import {
  downloadExcelTemplate,
  exportToExcel,
  parseExcelFile,
  validateImportData,
  mapImportData,
  type ExcelColumn,
} from "../../../lib/excel-utils";

interface TicketRowData extends TicketWithRelations {
  category_name?: string;
  category_color?: string;
  priority_name?: string;
  priority_level?: number;
  priority_color?: string;
  status_name?: string;
  status_type?: string;
  status_color?: string;
  reporter_first_name?: string;
  reporter_last_name?: string;
  assignee_first_name?: string;
  assignee_last_name?: string;
  job_number?: string;
  community_code?: string;
}

const getStatusIcon = (statusType: string) => {
  switch (statusType) {
    case "open":
      return <AlertTriangle className="h-4 w-4" />;
    case "in_progress":
      return <Clock className="h-4 w-4" />;
    case "closed":
      return <CheckCircle className="h-4 w-4" />;
    case "cancelled":
      return <AlertTriangle className="h-4 w-4" />;
    default:
      return <MessageSquare className="h-4 w-4" />;
  }
};

const getPriorityBadgeVariant = (
  priorityLevel: number
): "default" | "destructive" | "outline" | "secondary" => {
  if (priorityLevel >= 5) return "destructive";
  if (priorityLevel >= 4) return "destructive";
  if (priorityLevel >= 3) return "default";
  if (priorityLevel >= 2) return "outline";
  return "secondary";
};

// Excel column configuration for Freshdesk import
const ticketExcelColumns: ExcelColumn[] = [
  { field: "ticket_number", header: "Ticket Number", type: "string" },
  { field: "title", header: "Title", required: true, type: "string" },
  { field: "description", header: "Description", type: "string" },
  { field: "category", header: "Category", type: "string" },
  { field: "priority", header: "Priority", type: "string" },
  { field: "status", header: "Status", type: "string" },
  { field: "reporter_email", header: "Reporter Email", type: "string" },
  { field: "assignee_email", header: "Assignee Email", type: "string" },
  { field: "created_date", header: "Created Date", type: "date" },
  { field: "due_date", header: "Due Date", type: "date" },
  { field: "resolved_date", header: "Resolved Date", type: "date" },
  { field: "estimated_hours", header: "Estimated Hours", type: "number" },
  { field: "resolution_notes", header: "Resolution Notes", type: "string" },
];

export default function TicketsPage() {
  const { data: session } = useSession();
  const [filters, setFilters] = useState<TicketFilters>({});
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newTicket, setNewTicket] = useState({
    title: "",
    description: "",
    categoryId: "",
    priorityId: "",
    assignedTo: "",
  });

  const builderId = session?.user?.builderId || "";
  const userId = session?.user?.id || "";

  // Fetch tickets
  const {
    data: tickets,
    isLoading: ticketsLoading,
    refetch: refetchTickets,
  } = api.tickets.getAll.useQuery(
    {
      builderId,
      filters,
    },
    {
      enabled: !!builderId,
    }
  );

  // Fetch categories, priorities, statuses for filters
  const { data: categories } = api.tickets.getCategories.useQuery(
    { builderId },
    { enabled: !!builderId }
  );
  const { data: priorities } = api.tickets.getPriorities.useQuery(
    { builderId },
    { enabled: !!builderId }
  );
  const { data: statuses } = api.tickets.getStatuses.useQuery(
    { builderId },
    { enabled: !!builderId }
  );

  // Fetch ticket statistics
  const { data: stats } = api.tickets.getStats.useQuery(
    { builderId, userId: session?.user?.id },
    { enabled: !!builderId && !!session?.user?.id }
  );

  // Fetch users for assignment dropdown
  const { data: users } = api.users.getAll.useQuery(
    { builderId },
    { enabled: !!builderId }
  );

  // Create ticket mutation
  const createTicket = api.tickets.create.useMutation({
    onSuccess: () => {
      refetchTickets();
      setShowCreateForm(false);
      setNewTicket({
        title: "",
        description: "",
        categoryId: "",
        priorityId: "",
        assignedTo: "",
      });
      alert("Ticket created successfully!");
    },
    onError: (error) => {
      alert(`Failed to create ticket: ${error.message}`);
    },
  });

  // Handle form submission
  const handleCreateTicket = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTicket.title.trim()) {
      alert("Title is required");
      return;
    }

    createTicket.mutate({
      builderId,
      title: newTicket.title,
      description: newTicket.description || undefined,
      categoryId: newTicket.categoryId || undefined,
      priorityId: newTicket.priorityId || undefined,
      assignedTo:
        newTicket.assignedTo === "unassigned"
          ? undefined
          : newTicket.assignedTo || undefined,
      reportedBy: userId,
    });
  };

  // Column definitions for the data grid
  const columnDefs = useMemo<ColDef<TicketRowData>[]>(
    () => [
      {
        field: "ticket_number",
        headerName: "Ticket #",
        width: 120,
        cellRenderer: (params: any) => {
          const data = params.data as TicketRowData;
          return (
            <div className="flex items-center space-x-2">
              {getStatusIcon(data.status_type || "open")}
              <span className="font-medium">{data.ticket_number}</span>
            </div>
          );
        },
      },
      {
        field: "title",
        headerName: "Title",
        width: 250,
        cellRenderer: (params: any) => {
          const data = params.data as TicketRowData;
          return (
            <div>
              <div className="font-medium">{data.title}</div>
              {data.description && (
                <div className="text-sm text-muted-foreground truncate">
                  {data.description.length > 60
                    ? `${data.description.substring(0, 60)}...`
                    : data.description}
                </div>
              )}
            </div>
          );
        },
      },
      {
        field: "status_name",
        headerName: "Status",
        width: 120,
        cellRenderer: (params: any) => {
          const data = params.data as TicketRowData;
          return (
            <Badge
              variant={
                data.status_type === "open"
                  ? "default"
                  : data.status_type === "in_progress"
                  ? "secondary"
                  : data.status_type === "closed"
                  ? "outline"
                  : "destructive"
              }
              style={{ backgroundColor: data.status_color }}
            >
              {data.status_name}
            </Badge>
          );
        },
      },
      {
        field: "priority_name",
        headerName: "Priority",
        width: 100,
        cellRenderer: (params: any) => {
          const data = params.data as TicketRowData;
          if (!data.priority_name) return null;
          return (
            <Badge
              variant={getPriorityBadgeVariant(data.priority_level || 1)}
              style={{ backgroundColor: data.priority_color }}
            >
              {data.priority_name}
            </Badge>
          );
        },
      },
      {
        field: "category_name",
        headerName: "Category",
        width: 130,
        cellRenderer: (params: any) => {
          const data = params.data as TicketRowData;
          if (!data.category_name) return null;
          return (
            <Badge
              variant="outline"
              style={{ borderColor: data.category_color }}
            >
              {data.category_name}
            </Badge>
          );
        },
      },
      {
        field: "reporter_first_name",
        headerName: "Reporter",
        width: 120,
        valueGetter: (params) => {
          const data = params.data as TicketRowData;
          return `${data.reporter_first_name || ""} ${
            data.reporter_last_name || ""
          }`.trim();
        },
      },
      {
        field: "assignee_first_name",
        headerName: "Assignee",
        width: 120,
        valueGetter: (params) => {
          const data = params.data as TicketRowData;
          if (!data.assignee_first_name) return "Unassigned";
          return `${data.assignee_first_name || ""} ${
            data.assignee_last_name || ""
          }`.trim();
        },
        cellRenderer: (params: any) => {
          const assignee = params.value;
          return assignee === "Unassigned" ? (
            <span className="text-muted-foreground italic">{assignee}</span>
          ) : (
            <span>{assignee}</span>
          );
        },
      },
      {
        field: "reported_date",
        headerName: "Created",
        width: 120,
        valueFormatter: (params) => {
          if (!params.value) return "";
          return new Date(params.value).toLocaleDateString();
        },
      },
      {
        field: "due_date",
        headerName: "Due Date",
        width: 120,
        valueFormatter: (params) => {
          if (!params.value) return "";
          return new Date(params.value).toLocaleDateString();
        },
        cellRenderer: (params: any) => {
          if (!params.value) return "";
          const dueDate = new Date(params.value);
          const isOverdue =
            dueDate < new Date() &&
            params.data.status_type !== "closed" &&
            params.data.status_type !== "cancelled";

          return (
            <span className={isOverdue ? "text-red-600 font-medium" : ""}>
              {dueDate.toLocaleDateString()}
            </span>
          );
        },
      },
    ],
    []
  );

  const rowData = tickets || [];

  // Import mutation for DataGrid
  const bulkCreateTickets = api.tickets.bulkCreate.useMutation({
    onSuccess: (data) => {
      alert(`Successfully imported ${data.imported} tickets!`);
      refetchTickets();
    },
    onError: (error) => {
      alert(`Import failed: ${error.message}`);
    },
  });

  // Handle import from DataGrid
  const handleImport = async (data: any[]) => {
    // Map Freshdesk data to our ticket format
    const mappedTickets = data.map((row: any) => ({
      title: row.Subject || row.Title || row.title || "Imported Ticket",
      description:
        row.Description || row.description || row["Description Text"] || "",
      category: row.Category || row.Type || row.category || "",
      priority: row.Priority || row.priority || "",
      status: row.Status || row.status || "",
      reporterEmail:
        row["Requester Email"] ||
        row["Reporter Email"] ||
        row.reporter_email ||
        row["Requester"] ||
        "",
      assigneeEmail:
        row["Agent Email"] ||
        row["Assignee Email"] ||
        row.assignee_email ||
        row["Agent"] ||
        "",
      createdDate:
        row["Created Date"] || row.created_date
          ? new Date(row["Created Date"] || row.created_date)
          : new Date(),
      dueDate:
        row["Due Date"] || row.due_date
          ? new Date(row["Due Date"] || row.due_date)
          : null,
      resolvedDate:
        row["Resolved Date"] || row.resolved_date
          ? new Date(row["Resolved Date"] || row.resolved_date)
          : null,
      estimatedHours:
        row["Estimated Hours"] || row.estimated_hours
          ? Number(row["Estimated Hours"] || row.estimated_hours)
          : null,
      resolutionNotes:
        row["Resolution Notes"] || row.resolution_notes || row.Resolution || "",
    }));

    return bulkCreateTickets.mutateAsync({
      builderId,
      tickets: mappedTickets,
    });
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Support Tickets</h1>
          <p className="text-muted-foreground">
            Manage and track support tickets
          </p>
        </div>
        <Button onClick={() => setShowCreateForm(true)} className="gap-2">
          <Plus className="h-4 w-4" />
          Create Ticket
        </Button>
      </div>

      {/* Statistics Cards */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <MessageSquare className="h-5 w-5 text-blue-500" />
                <div>
                  <p className="text-sm font-medium">Total</p>
                  <p className="text-2xl font-bold">{stats.total_tickets}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <AlertTriangle className="h-5 w-5 text-orange-500" />
                <div>
                  <p className="text-sm font-medium">Open</p>
                  <p className="text-2xl font-bold">{stats.open_tickets}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Clock className="h-5 w-5 text-yellow-500" />
                <div>
                  <p className="text-sm font-medium">In Progress</p>
                  <p className="text-2xl font-bold">
                    {stats.in_progress_tickets}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <CheckCircle className="h-5 w-5 text-green-500" />
                <div>
                  <p className="text-sm font-medium">Closed</p>
                  <p className="text-2xl font-bold">{stats.closed_tickets}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <AlertTriangle className="h-5 w-5 text-red-500" />
                <div>
                  <p className="text-sm font-medium">Overdue</p>
                  <p className="text-2xl font-bold text-red-600">
                    {stats.overdue_tickets}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <User className="h-5 w-5 text-gray-500" />
                <div>
                  <p className="text-sm font-medium">Unassigned</p>
                  <p className="text-2xl font-bold">
                    {stats.unassigned_tickets}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <AlertTriangle className="h-5 w-5 text-red-800" />
                <div>
                  <p className="text-sm font-medium">Cancelled</p>
                  <p className="text-2xl font-bold">
                    {stats.cancelled_tickets}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Status</label>
              <Select
                value={filters.status_id || ""}
                onValueChange={(value) =>
                  setFilters((prev) => ({
                    ...prev,
                    status_id: value === "all" ? undefined : value,
                  }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="All Statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  {statuses?.map((status) => (
                    <SelectItem key={status.status_id} value={status.status_id}>
                      {status.status_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Category</label>
              <Select
                value={filters.category_id || ""}
                onValueChange={(value) =>
                  setFilters((prev) => ({
                    ...prev,
                    category_id: value === "all" ? undefined : value,
                  }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="All Categories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {categories?.map((category) => (
                    <SelectItem
                      key={category.category_id}
                      value={category.category_id}
                    >
                      {category.category_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Priority</label>
              <Select
                value={filters.priority_id || ""}
                onValueChange={(value) =>
                  setFilters((prev) => ({
                    ...prev,
                    priority_id: value === "all" ? undefined : value,
                  }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="All Priorities" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Priorities</SelectItem>
                  {priorities?.map((priority) => (
                    <SelectItem
                      key={priority.priority_id}
                      value={priority.priority_id}
                    >
                      {priority.priority_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Search</label>
              <Input
                placeholder="Search tickets..."
                value={filters.search || ""}
                onChange={(e) =>
                  setFilters((prev) => ({
                    ...prev,
                    search: e.target.value || undefined,
                  }))
                }
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Data Grid */}
      <Card>
        <CardContent className="p-0">
          <ClientDataGrid
            columnDefs={columnDefs}
            data={rowData}
            excelColumns={ticketExcelColumns}
            tableName="tickets"
            loading={ticketsLoading}
            onImport={handleImport}
            pagination={true}
            paginationPageSize={50}
            suppressRowClickSelection={false}
            onRowDoubleClicked={(event: any) => {
              if (event.data?.ticket_id) {
                // Navigate to ticket detail page
                window.location.href = `/tickets/${event.data.ticket_id}`;
              }
            }}
          />
        </CardContent>
      </Card>

      {/* Create Ticket Dialog */}
      <Dialog open={showCreateForm} onOpenChange={setShowCreateForm}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Create New Ticket</DialogTitle>
          </DialogHeader>

          <form onSubmit={handleCreateTicket} className="space-y-4">
            {/* Title */}
            <div>
              <Label htmlFor="title">Title *</Label>
              <Input
                id="title"
                value={newTicket.title}
                onChange={(e) =>
                  setNewTicket((prev) => ({ ...prev, title: e.target.value }))
                }
                placeholder="Brief description of the issue..."
                required
              />
            </div>

            {/* Description */}
            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={newTicket.description}
                onChange={(e) =>
                  setNewTicket((prev) => ({
                    ...prev,
                    description: e.target.value,
                  }))
                }
                placeholder="Detailed description of the issue..."
                rows={4}
              />
            </div>

            {/* Category */}
            <div>
              <Label htmlFor="category">Category</Label>
              <Select
                value={newTicket.categoryId}
                onValueChange={(value) =>
                  setNewTicket((prev) => ({ ...prev, categoryId: value }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a category" />
                </SelectTrigger>
                <SelectContent>
                  {categories?.map((category) => (
                    <SelectItem
                      key={category.category_id}
                      value={category.category_id}
                    >
                      {category.category_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Priority */}
            <div>
              <Label htmlFor="priority">Priority</Label>
              <Select
                value={newTicket.priorityId}
                onValueChange={(value) =>
                  setNewTicket((prev) => ({ ...prev, priorityId: value }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select priority" />
                </SelectTrigger>
                <SelectContent>
                  {priorities?.map((priority) => (
                    <SelectItem
                      key={priority.priority_id}
                      value={priority.priority_id}
                    >
                      {priority.priority_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Assignee */}
            <div>
              <Label htmlFor="assignee">Assign To</Label>
              <Select
                value={newTicket.assignedTo}
                onValueChange={(value) =>
                  setNewTicket((prev) => ({ ...prev, assignedTo: value }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Leave unassigned or select user" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="unassigned">Unassigned</SelectItem>
                  {users?.map((user) => (
                    <SelectItem key={user.user_id} value={user.user_id}>
                      {user.first_name} {user.last_name} ({user.email_address})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Form Actions */}
            <div className="flex justify-end space-x-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowCreateForm(false)}
                disabled={createTicket.isPending}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={createTicket.isPending || !newTicket.title.trim()}
              >
                {createTicket.isPending ? "Creating..." : "Create Ticket"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
