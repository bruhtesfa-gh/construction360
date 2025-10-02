"use client";

import { useEffect, useCallback, useMemo, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import type { ColDef } from "ag-grid-community";

import {
  ClientDataGrid as DataGrid,
  type ExcelColumn,
} from "../../../components/grid";
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
import { Plus, Edit, Trash2, Users, KeyRound } from "lucide-react";
import { api } from "../../providers";
import { useTimezone } from "../../../lib/timezone-context";

interface UserData {
  user_id: string;
  builder_id: string;
  user_login_id: string;
  first_name: string;
  middle_name: string | null;
  last_name: string;
  email_address: string;
  phone: string | null;
  role_id: string;
  default_region_id: string | null;
  inactive: boolean;
  inactive_date: Date | null;
  hire_date: Date | null;
  termination_date: Date | null;
  notes: string | null;
  profile_image: string | null;
  created_at: Date;
  updated_at: Date;
}

// Custom cell renderer for actions
const ActionsCellRenderer = ({
  data,
  onEdit,
  onDelete,
  onResetPassword,
  showPasswordReset,
}: {
  data: UserData;
  onEdit: (user: UserData) => void;
  onDelete: (user: UserData) => void;
  onResetPassword: (user: UserData) => void;
  showPasswordReset?: boolean;
}) => {
  return (
    <div className="flex items-center gap-2 h-full">
      <Button
        variant="outline"
        size="sm"
        onClick={() => onEdit(data)}
        className="h-8 w-8 p-0"
        title="Edit user"
      >
        <Edit className="h-4 w-4" />
      </Button>
      {showPasswordReset && (
        <Button
          variant="outline"
          size="sm"
          onClick={() => onResetPassword(data)}
          className="h-8 w-8 p-0 text-blue-600 hover:text-blue-700"
          title="Reset password"
        >
          <KeyRound className="h-4 w-4" />
        </Button>
      )}
      <Button
        variant="outline"
        size="sm"
        onClick={() => onDelete(data)}
        className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
        title="Delete user"
      >
        <Trash2 className="h-4 w-4" />
      </Button>
    </div>
  );
};

// Custom cell renderer for status
const StatusCellRenderer = ({ value }: { value: boolean }) => {
  return (
    <Badge
      className={
        value ? "bg-red-100 text-red-800" : "bg-green-100 text-green-800"
      }
      variant="secondary"
    >
      {value ? "INACTIVE" : "ACTIVE"}
    </Badge>
  );
};

export default function UsersPage() {
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
  const currentUserId = session?.user?.id;

  // Check if current user is an admin
  const [currentUserData, setCurrentUserData] = useState<UserData | null>(null);
  const [isSystemAdmin, setIsSystemAdmin] = useState(false);

  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<UserData | null>(null);
  const [formData, setFormData] = useState({
    user_login_id: "",
    password: "",
    first_name: "",
    middle_name: "",
    last_name: "",
    email_address: "",
    phone: "",
    role_id: "", // Will be set to default role when roles load
    default_region_id: "",
    inactive: false,
    hire_date: "",
    notes: "",
  });

  // Delete confirmation state
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<UserData | null>(null);

  // Password reset state
  const [resetPasswordOpen, setResetPasswordOpen] = useState(false);
  const [userToReset, setUserToReset] = useState<UserData | null>(null);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // Get tRPC utils for cache invalidation
  const utils = api.useUtils();

  // Fetch users data
  const { data: users = [], isLoading } = api.users.getAll.useQuery(
    {
      builderId: builderId!,
      limit: 1000,
    },
    {
      enabled: !!builderId,
    }
  );

  // Fetch current user data and check if they're an admin
  const { data: currentUserRole } = api.users.getCurrentUserRole.useQuery(
    {
      builderId: builderId!,
      userId: currentUserId!,
    },
    {
      enabled: !!builderId && !!currentUserId,
    }
  );

  useEffect(() => {
    if (users.length > 0 && currentUserId) {
      const userData = users.find((u) => u.user_id === currentUserId);
      if (userData) {
        setCurrentUserData(userData as UserData);
      }
    }
  }, [users, currentUserId]);

  // Fetch regions for dropdown
  const { data: regions = [] } = api.regions.getAll.useQuery(
    {
      builderId: builderId!,
    },
    {
      enabled: !!builderId,
    }
  );

  // Fetch roles for dropdown
  const { data: roles = [] } = api.users.getRoles.useQuery(
    {
      builderId: builderId!,
    },
    {
      enabled: !!builderId,
    }
  );

  useEffect(() => {
    if (currentUserRole) {
      setIsSystemAdmin(currentUserRole.admin_role);
    }
  }, [currentUserRole]);

  // Set default role when roles are loaded
  useEffect(() => {
    if (roles.length > 0 && !formData.role_id && !editingUser) {
      // Find "Basic User" role or use the first role
      const basicUserRole = roles.find((r) => r.description === "Basic User");
      const defaultRoleId = basicUserRole?.role_id || roles[0].role_id;
      setFormData((prev) => ({ ...prev, role_id: defaultRoleId }));
    }
  }, [roles, editingUser]); // Only depend on roles and editingUser, not formData.role_id

  // Create user mutation
  const createUserMutation = api.users.create.useMutation({
    onSuccess: () => {
      utils.users.getAll.invalidate();
      setIsModalOpen(false);
      resetForm();
    },
    onError: (error) => {
      console.error("Failed to create user:", error);
    },
  });

  // Update user mutation
  const updateUserMutation = api.users.update.useMutation({
    onSuccess: () => {
      utils.users.getAll.invalidate();
      setIsModalOpen(false);
      setEditingUser(null);
    },
    onError: (error) => {
      console.error("Failed to update user:", error);
    },
  });

  // Delete user mutation
  const deleteUserMutation = api.users.delete.useMutation({
    onSuccess: () => {
      utils.users.getAll.invalidate();
      setDeleteConfirmOpen(false);
      setUserToDelete(null);
    },
    onError: (error) => {
      console.error("Failed to delete user:", error);
    },
  });

  // Admin reset password mutation
  const resetPasswordMutation = api.users.adminResetPassword.useMutation({
    onSuccess: () => {
      utils.users.getAll.invalidate();
      setResetPasswordOpen(false);
      setUserToReset(null);
      setNewPassword("");
      setConfirmPassword("");
    },
    onError: (error) => {
      console.error("Failed to reset password:", error);
    },
  });

  // Reset form
  const resetForm = useCallback(() => {
    const basicUserRole = roles.find((r) => r.description === "Basic User");
    const defaultRoleId = basicUserRole?.role_id || roles[0]?.role_id || "";

    setFormData({
      user_login_id: "",
      password: "",
      first_name: "",
      middle_name: "",
      last_name: "",
      email_address: "",
      phone: "",
      role_id: defaultRoleId,
      default_region_id: "",
      inactive: false,
      hire_date: "",
      notes: "",
    });
  }, [roles]);

  // Handle create new user
  const handleCreateUser = useCallback(() => {
    setEditingUser(null);
    resetForm();
    setIsModalOpen(true);
  }, [resetForm]);

  // Handle edit user
  const handleEditUser = useCallback((user: UserData) => {
    setEditingUser(user);
    setFormData({
      user_login_id: user.user_login_id,
      password: "", // Don't populate password on edit
      first_name: user.first_name,
      middle_name: user.middle_name || "",
      last_name: user.last_name,
      email_address: user.email_address,
      phone: user.phone || "",
      role_id: user.role_id,
      default_region_id: user.default_region_id || "no-region",
      inactive: user.inactive,
      hire_date: user.hire_date
        ? new Date(user.hire_date).toISOString().split("T")[0]
        : "",
      notes: user.notes || "",
    });
    setIsModalOpen(true);
  }, []);

  // Handle delete user
  const handleDeleteUser = useCallback((user: UserData) => {
    setUserToDelete(user);
    setDeleteConfirmOpen(true);
  }, []);

  // Handle reset password
  const handleResetPassword = useCallback((user: UserData) => {
    setUserToReset(user);
    setNewPassword("");
    setConfirmPassword("");
    setResetPasswordOpen(true);
  }, []);

  // Confirm delete user
  const confirmDeleteUser = useCallback(() => {
    if (!userToDelete || !builderId) return;

    deleteUserMutation.mutate({
      builderId: builderId,
      userId: userToDelete.user_id,
    });
  }, [userToDelete, builderId, deleteUserMutation]);

  // Confirm reset password
  const confirmResetPassword = useCallback(() => {
    if (!userToReset || !builderId || !session?.user?.id) return;

    if (newPassword !== confirmPassword) {
      alert("Passwords do not match");
      return;
    }

    if (newPassword.length < 8) {
      alert("Password must be at least 8 characters");
      return;
    }

    resetPasswordMutation.mutate({
      builderId: builderId,
      userId: userToReset.user_id,
      newPassword: newPassword,
      adminUserId: session.user.id,
    });
  }, [
    userToReset,
    builderId,
    session?.user?.id,
    newPassword,
    confirmPassword,
    resetPasswordMutation,
  ]);

  // Handle form submit
  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();

      if (!builderId) {
        console.error("Missing required data for API call");
        return;
      }

      if (editingUser) {
        // Update existing user
        const updateData: any = {
          builderId: builderId,
          userId: editingUser.user_id,
          userLoginId: formData.user_login_id,
          firstName: formData.first_name,
          middleName: formData.middle_name || null,
          lastName: formData.last_name,
          emailAddress: formData.email_address,
          phone: formData.phone || null,
          roleId: formData.role_id,
          defaultRegionId:
            formData.default_region_id === "no-region"
              ? null
              : formData.default_region_id || null,
          inactive: formData.inactive,
          hireDate: formData.hire_date || null,
          notes: formData.notes || null,
        };

        // Only include password if it was changed
        if (formData.password) {
          updateData.password = formData.password;
        }

        updateUserMutation.mutate(updateData);
      } else {
        // Create new user
        createUserMutation.mutate({
          builderId: builderId,
          userLoginId: formData.user_login_id,
          password: formData.password,
          firstName: formData.first_name,
          middleName: formData.middle_name || undefined,
          lastName: formData.last_name,
          emailAddress: formData.email_address,
          phone: formData.phone || undefined,
          roleId: formData.role_id,
          defaultRegionId:
            formData.default_region_id === "no-region"
              ? undefined
              : formData.default_region_id || undefined,
          inactive: formData.inactive,
          hireDate: formData.hire_date || undefined,
          notes: formData.notes || undefined,
        });
      }
    },
    [formData, editingUser, builderId, createUserMutation, updateUserMutation]
  );

  // Handle form input changes
  const handleInputChange = useCallback(
    (field: string, value: string | boolean) => {
      setFormData((prev) => ({ ...prev, [field]: value }));
    },
    []
  );

  // Excel columns configuration for import/export
  const excelColumns: ExcelColumn[] = [
    { field: "user_login_id", header: "Login ID *", required: true },
    { field: "first_name", header: "First Name *", required: true },
    { field: "middle_name", header: "Middle Name" },
    { field: "last_name", header: "Last Name *", required: true },
    { field: "email_address", header: "Email *", required: true },
    { field: "phone", header: "Phone" },
    { field: "region_code", header: "Default Region Code" },
    { field: "role_name", header: "Role" },
    { field: "hire_date", header: "Hire Date" },
    { field: "notes", header: "Notes" },
  ];

  // Handle import from DataGrid
  const handleImport = useCallback(
    async (importData: any[]) => {
      if (!builderId || !session?.user?.id) return;

      const defaultRoleId = "00000000-0000-0000-0000-000000000001"; // Default role
      const defaultRegionId = regions[0]?.region_id;

      for (const row of importData) {
        // Find region by code if provided
        let regionId = defaultRegionId;
        if (row.region_code) {
          const regionMatch = regions.find(
            (r) => r.region_code === row.region_code
          );
          if (regionMatch) {
            regionId = regionMatch.region_id;
          }
        }

        await createUserMutation.mutateAsync({
          builderId: builderId,
          userLoginId: row.user_login_id,
          password: "TempPassword123!", // Default password for imported users
          firstName: row.first_name,
          middleName: row.middle_name || undefined,
          lastName: row.last_name,
          emailAddress: row.email_address,
          phone: row.phone || undefined,
          roleId: defaultRoleId,
          defaultRegionId: regionId,
          inactive: false,
          hireDate: row.hire_date || undefined,
          notes: row.notes || undefined,
        });
      }

      // Refresh data
      utils.users.getAll.invalidate();
    },
    [builderId, session?.user?.id, regions, createUserMutation, utils]
  );

  // AG Grid column definitions
  const columnDefs: ColDef[] = useMemo(() => {
    const rolesData = roles || [];
    const regionsData = regions || [];

    return [
      {
        headerName: "Login ID",
        field: "user_login_id",
        sortable: true,
        filter: true,
        flex: 1,
        minWidth: 120,
      },
      {
        headerName: "Name",
        field: "full_name",
        sortable: true,
        filter: true,
        flex: 2,
        minWidth: 200,
        valueGetter: (params) => {
          const user = params.data;
          return `${user.first_name} ${
            user.middle_name ? user.middle_name + " " : ""
          }${user.last_name}`;
        },
      },
      {
        headerName: "Email",
        field: "email_address",
        sortable: true,
        filter: true,
        flex: 2,
        minWidth: 200,
      },
      {
        headerName: "Phone",
        field: "phone",
        sortable: true,
        filter: true,
        flex: 1,
        minWidth: 120,
        valueGetter: (params) => params.data?.phone || "No phone",
      },
      {
        headerName: "Role",
        field: "role_id",
        sortable: true,
        filter: true,
        flex: 1,
        minWidth: 150,
        valueGetter: (params) => {
          if (!params.data?.role_id) return "No role";
          const role = rolesData.find((r) => r.role_id === params.data.role_id);
          return role ? role.description : "Unknown";
        },
        cellRenderer: (params: any) => {
          if (!params.data?.role_id) return "No role";
          const role = rolesData.find((r) => r.role_id === params.data.role_id);
          if (!role) return "Unknown";

          return (
            <div className="flex items-center gap-2">
              {role.description}
              {role.admin_role && (
                <Badge
                  className="bg-purple-100 text-purple-800 text-xs"
                  variant="secondary"
                >
                  Admin
                </Badge>
              )}
            </div>
          );
        },
      },
      {
        headerName: "Default Region",
        field: "default_region_id",
        sortable: true,
        filter: true,
        flex: 1,
        minWidth: 150,
        valueGetter: (params) => {
          if (!params.data?.default_region_id) return "No region";
          const region = regionsData.find(
            (r) => r.region_id === params.data.default_region_id
          );
          return region ? region.region_code : "Unknown";
        },
      },
      {
        headerName: "Status",
        field: "inactive",
        sortable: true,
        filter: true,
        flex: 1,
        minWidth: 100,
        cellRenderer: StatusCellRenderer,
      },
      {
        headerName: "Hire Date",
        field: "hire_date",
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
        width: 150,
        pinned: "right",
        cellRenderer: ActionsCellRenderer,
        cellRendererParams: {
          onEdit: handleEditUser,
          onDelete: handleDeleteUser,
          onResetPassword: handleResetPassword,
          showPasswordReset: isSystemAdmin,
        },
      },
    ];
  }, [
    handleEditUser,
    handleDeleteUser,
    handleResetPassword,
    formatDate,
    regions,
    roles,
    isSystemAdmin,
  ]);

  // Show loading while checking authentication
  if (status === "loading") {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground text-lg">Loading users...</p>
        </div>
      </div>
    );
  }

  // Show loading while fetching users data or roles
  if (builderId && (isLoading || roles.length === 0)) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold">Users Management</h1>
            <p className="text-muted-foreground">
              Manage user accounts and permissions
            </p>
          </div>
        </div>
        <Card>
          <CardHeader>
            <CardTitle>Users</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-center h-64">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                <p className="text-muted-foreground">Loading users data...</p>
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
              <Users className="h-8 w-8" />
              Users
            </h1>
            <p className="text-muted-foreground">
              Manage user accounts and permissions
            </p>
          </div>
          <Button
            onClick={handleCreateUser}
            className="flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            Add New User
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>User List</CardTitle>
          </CardHeader>
          <CardContent>
            <DataGrid
              data={users}
              loading={isLoading}
              columnDefs={columnDefs}
              excelColumns={excelColumns}
              onImport={handleImport}
              fileName="users"
              importTitle="Import Users"
            />
          </CardContent>
        </Card>

        {/* User Modal */}
        <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
          <DialogContent
            className="sm:max-w-[525px]"
            aria-describedby="user-dialog-description"
          >
            <DialogHeader>
              <DialogTitle>
                {editingUser ? "Edit User" : "Create New User"}
              </DialogTitle>
              <p id="user-dialog-description" className="sr-only">
                {editingUser
                  ? "Edit existing user details"
                  : "Create a new user account"}
              </p>
            </DialogHeader>
            <form onSubmit={handleSubmit}>
              <div className="grid gap-4 py-4 max-h-[60vh] overflow-y-auto">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="user_login_id" className="text-right">
                    Login ID *
                  </Label>
                  <Input
                    id="user_login_id"
                    value={formData.user_login_id}
                    onChange={(e) =>
                      handleInputChange("user_login_id", e.target.value)
                    }
                    className="col-span-3"
                    placeholder="username"
                    required
                  />
                </div>
                {!editingUser && (
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="password" className="text-right">
                      Password *
                    </Label>
                    <Input
                      id="password"
                      type="password"
                      value={formData.password}
                      onChange={(e) =>
                        handleInputChange("password", e.target.value)
                      }
                      className="col-span-3"
                      placeholder="********"
                      required={!editingUser}
                    />
                  </div>
                )}
                {editingUser && (
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="password" className="text-right">
                      New Password
                    </Label>
                    <Input
                      id="password"
                      type="password"
                      value={formData.password}
                      onChange={(e) =>
                        handleInputChange("password", e.target.value)
                      }
                      className="col-span-3"
                      placeholder="Leave blank to keep current"
                    />
                  </div>
                )}
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="first_name" className="text-right">
                    First Name *
                  </Label>
                  <Input
                    id="first_name"
                    value={formData.first_name}
                    onChange={(e) =>
                      handleInputChange("first_name", e.target.value)
                    }
                    className="col-span-3"
                    placeholder="John"
                    required
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="middle_name" className="text-right">
                    Middle Name
                  </Label>
                  <Input
                    id="middle_name"
                    value={formData.middle_name}
                    onChange={(e) =>
                      handleInputChange("middle_name", e.target.value)
                    }
                    className="col-span-3"
                    placeholder="A"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="last_name" className="text-right">
                    Last Name *
                  </Label>
                  <Input
                    id="last_name"
                    value={formData.last_name}
                    onChange={(e) =>
                      handleInputChange("last_name", e.target.value)
                    }
                    className="col-span-3"
                    placeholder="Doe"
                    required
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="email_address" className="text-right">
                    Email *
                  </Label>
                  <Input
                    id="email_address"
                    type="email"
                    value={formData.email_address}
                    onChange={(e) =>
                      handleInputChange("email_address", e.target.value)
                    }
                    className="col-span-3"
                    placeholder="john.doe@example.com"
                    required
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="phone" className="text-right">
                    Phone
                  </Label>
                  <Input
                    id="phone"
                    value={formData.phone}
                    onChange={(e) => handleInputChange("phone", e.target.value)}
                    className="col-span-3"
                    placeholder="+1 (555) 123-4567"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="default_region_id" className="text-right">
                    Default Region
                  </Label>
                  <Select
                    value={formData.default_region_id}
                    onValueChange={(value) =>
                      handleInputChange("default_region_id", value)
                    }
                  >
                    <SelectTrigger className="col-span-3">
                      <SelectValue placeholder="Select a region" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="no-region">
                        No default region
                      </SelectItem>
                      {regions.map((region) => (
                        <SelectItem
                          key={region.region_id}
                          value={region.region_id}
                        >
                          {region.region_code} - {region.description}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="role_id" className="text-right">
                    Role *
                  </Label>
                  <Select
                    value={formData.role_id || ""}
                    onValueChange={(value) =>
                      handleInputChange("role_id", value)
                    }
                  >
                    <SelectTrigger className="col-span-3">
                      <SelectValue placeholder="Select a role" />
                    </SelectTrigger>
                    <SelectContent>
                      {roles.length > 0 ? (
                        roles.map((role) => (
                          <SelectItem key={role.role_id} value={role.role_id}>
                            {role.description}
                            {role.admin_role && " (Admin)"}
                          </SelectItem>
                        ))
                      ) : (
                        <SelectItem value="" disabled>
                          Loading roles...
                        </SelectItem>
                      )}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="hire_date" className="text-right">
                    Hire Date
                  </Label>
                  <Input
                    id="hire_date"
                    type="date"
                    value={formData.hire_date}
                    onChange={(e) =>
                      handleInputChange("hire_date", e.target.value)
                    }
                    className="col-span-3"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="inactive" className="text-right">
                    Status
                  </Label>
                  <Select
                    value={formData.inactive ? "inactive" : "active"}
                    onValueChange={(value) =>
                      handleInputChange("inactive", value === "inactive")
                    }
                  >
                    <SelectTrigger className="col-span-3">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="inactive">Inactive</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="notes" className="text-right">
                    Notes
                  </Label>
                  <Input
                    id="notes"
                    value={formData.notes}
                    onChange={(e) => handleInputChange("notes", e.target.value)}
                    className="col-span-3"
                    placeholder="Additional notes..."
                  />
                </div>
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
                    createUserMutation.isPending || updateUserMutation.isPending
                  }
                >
                  {createUserMutation.isPending || updateUserMutation.isPending
                    ? editingUser
                      ? "Updating..."
                      : "Creating..."
                    : editingUser
                    ? "Update User"
                    : "Create User"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation Dialog */}
        <Dialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
          <DialogContent
            className="sm:max-w-[425px]"
            aria-describedby="delete-dialog-description"
          >
            <DialogHeader>
              <DialogTitle>Delete User</DialogTitle>
              <p id="delete-dialog-description" className="sr-only">
                Confirm deletion of user account
              </p>
            </DialogHeader>
            <div className="py-4">
              <p className="text-muted-foreground">
                Are you sure you want to delete user &ldquo;
                {userToDelete?.user_login_id}&rdquo;? This will mark the user as
                inactive.
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
                onClick={confirmDeleteUser}
                disabled={deleteUserMutation.isPending}
              >
                {deleteUserMutation.isPending ? "Deleting..." : "Delete User"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Password Reset Dialog */}
        <Dialog open={resetPasswordOpen} onOpenChange={setResetPasswordOpen}>
          <DialogContent
            className="sm:max-w-[425px]"
            aria-describedby="reset-dialog-description"
          >
            <DialogHeader>
              <DialogTitle>Reset Password</DialogTitle>
              <p id="reset-dialog-description" className="sr-only">
                Reset password for user account
              </p>
            </DialogHeader>
            <div className="space-y-4">
              <div className="text-sm text-muted-foreground">
                Resetting password for user:{" "}
                <strong>{userToReset?.user_login_id}</strong>
              </div>
              <div className="space-y-2">
                <Label htmlFor="new-password">New Password</Label>
                <Input
                  id="new-password"
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Enter new password"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirm-password">Confirm Password</Label>
                <Input
                  id="confirm-password"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirm new password"
                />
              </div>
              <div className="text-xs text-muted-foreground">
                Password must be at least 8 characters long
              </div>
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setResetPasswordOpen(false)}
              >
                Cancel
              </Button>
              <Button
                type="button"
                onClick={confirmResetPassword}
                disabled={
                  resetPasswordMutation.isPending ||
                  !newPassword ||
                  !confirmPassword
                }
              >
                {resetPasswordMutation.isPending
                  ? "Resetting..."
                  : "Reset Password"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
