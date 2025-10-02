"use client";

import React, {
  useState,
  useCallback,
  useRef,
  useMemo,
  useEffect,
} from "react";
import { useSession } from "next-auth/react";
import type { ColDef, CellValueChangedEvent } from "ag-grid-community";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../../components/ui/card";
import { Button } from "../../../components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "../../../components/ui/dialog";
import { Label } from "../../../components/ui/label";
import { Input } from "../../../components/ui/input";
import { Badge } from "../../../components/ui/badge";
import { DataGrid, type ExcelColumn } from "../../../components/grid";
import { api } from "../../providers";
import {
  Loader2,
  Plus,
  Trash2,
  Phone,
  Mail,
  Users2,
  UserPlus,
  Package2,
  Eye,
  Edit,
} from "lucide-react";
import type { Supplier, SupplierContact } from "../../../types/database";

export default function SuppliersPage() {
  const { data: session, status } = useSession();
  const [selectedSuppliers, setSelectedSuppliers] = useState<Supplier[]>([]);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [isBulkEditDialogOpen, setIsBulkEditDialogOpen] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState<Supplier | null>(null);
  const [viewingSupplier, setViewingSupplier] = useState<Supplier | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [expandedSuppliers, setExpandedSuppliers] = useState<Set<string>>(
    new Set()
  );
  const [isImporting, setIsImporting] = useState(false);

  // Contacts management state
  const [isContactsDialogOpen, setIsContactsDialogOpen] = useState(false);
  const [selectedSupplierForContacts, setSelectedSupplierForContacts] =
    useState<Supplier | null>(null);
  const [isAddContactDialogOpen, setIsAddContactDialogOpen] = useState(false);
  const [isEditContactDialogOpen, setIsEditContactDialogOpen] = useState(false);
  const [editingContact, setEditingContact] = useState<SupplierContact | null>(
    null
  );
  const [contactFormData, setContactFormData] = useState({
    supplier_contact_name: "",
    email: "",
    work_phone: "",
    mobile_phone: "",
    fax: "",
    address1: "",
    address2: "",
    city: "",
    state: "",
    zip: "",
    purchasing_contact: false,
    scheduling_contact: false,
    warranty_contact: false,
    variance_po_contact: false,
    accounts_payable_contact: false,
    is_inactive: false,
  });

  // Form state
  const [formData, setFormData] = useState({
    supplier_code: "",
    supplier_name: "",
    address1: "",
    address2: "",
    city: "",
    state: "",
    zip: "",
    country: "USA",
    currency: "USD",
    accounting_contact: "",
    accounting_email: "",
    work_phone: "",
    mobile_phone: "",
    fax: "",
    tax_id_number: "",
    is_1099: false,
    is_t5018: false,
    discount_rate: "",
    deduction_rate: "",
    supplier_company_email: "",
    is_full_subscriber: false,
    is_inactive: false,
  });

  // Bulk edit form state
  const [bulkEditData, setBulkEditData] = useState({
    supplier_name: "",
    city: "",
    state: "",
    zip: "",
    country: "",
    currency: "",
    accounting_contact: "",
    accounting_email: "",
    work_phone: "",
    discount_rate: "",
    deduction_rate: "",
    is_1099: false,
    is_t5018: false,
    is_inactive: false,
  });

  const builderId = session?.user?.builderId;

  // Fetch suppliers
  const {
    data: suppliers = [],
    isLoading,
    refetch,
  } = api.suppliers.getAll.useQuery(
    { builderId: builderId! },
    { enabled: !!builderId }
  );

  // Fetch all contacts for all suppliers
  const { data: allContacts = {}, isLoading: isLoadingContacts } =
    api.suppliers.getAllContactsForBuilder.useQuery(
      { builderId: builderId! },
      { enabled: !!builderId }
    );

  // Debug: Log contacts data
  useEffect(() => {
    console.log("All contacts:", allContacts);
    console.log("Suppliers count:", suppliers.length);
    console.log("Expanded suppliers:", Array.from(expandedSuppliers));
  }, [allContacts, suppliers, expandedSuppliers]);

  // Mutations
  const createSupplierMutation = api.suppliers.create.useMutation({
    onSuccess: () => {
      refetch();
      setIsAddDialogOpen(false);
      resetForm();
    },
  });

  const updateSupplierMutation = api.suppliers.update.useMutation({
    onSuccess: () => {
      refetch();
      setIsEditDialogOpen(false);
      setEditingSupplier(null);
      resetForm();
    },
  });

  const deleteSupplierMutation = api.suppliers.delete.useMutation({
    onSuccess: () => {
      refetch();
      setIsDeleteDialogOpen(false);
      setSelectedSuppliers([]);
    },
  });

  const bulkCreateMutation = api.suppliers.bulkCreateWithContacts.useMutation({
    onSuccess: () => {
      refetch();
      // Import dialog handling would go here
    },
  });

  // Contacts API hooks
  const { data: contacts = [], refetch: refetchContacts } =
    api.suppliers.getContacts.useQuery(
      {
        builderId: builderId!,
        supplierId: selectedSupplierForContacts?.supplier_id || "",
      },
      { enabled: !!builderId && !!selectedSupplierForContacts }
    );

  const createContactMutation = api.suppliers.createContact.useMutation({
    onSuccess: () => {
      refetchContacts();
      setIsAddContactDialogOpen(false);
      resetContactForm();
    },
  });

  const updateContactMutation = api.suppliers.updateContact.useMutation({
    onSuccess: () => {
      refetchContacts();
      setIsEditContactDialogOpen(false);
      setEditingContact(null);
      resetContactForm();
    },
  });

  const deleteContactMutation = api.suppliers.deleteContact.useMutation({
    onSuccess: () => {
      refetchContacts();
    },
  });

  const resetForm = () => {
    setFormData({
      supplier_code: "",
      supplier_name: "",
      address1: "",
      address2: "",
      city: "",
      state: "",
      zip: "",
      country: "USA",
      currency: "USD",
      accounting_contact: "",
      accounting_email: "",
      work_phone: "",
      mobile_phone: "",
      fax: "",
      tax_id_number: "",
      is_1099: false,
      is_t5018: false,
      discount_rate: "",
      deduction_rate: "",
      supplier_company_email: "",
      is_full_subscriber: false,
      is_inactive: false,
    });
  };

  const resetContactForm = () => {
    setContactFormData({
      supplier_contact_name: "",
      email: "",
      work_phone: "",
      mobile_phone: "",
      fax: "",
      address1: "",
      address2: "",
      city: "",
      state: "",
      zip: "",
      purchasing_contact: false,
      scheduling_contact: false,
      warranty_contact: false,
      variance_po_contact: false,
      accounts_payable_contact: false,
      is_inactive: false,
    });
  };

  // Excel columns configuration
  const excelColumns: ExcelColumn[] = [
    { field: "supplier_code", header: "Supplier Code *", required: true },
    { field: "supplier_name", header: "Supplier Name" },
    { field: "accounting_contact", header: "Contact Name" },
    { field: "accounting_email", header: "Email" },
    { field: "work_phone", header: "Phone" },
    { field: "address1", header: "Address 1" },
    { field: "address2", header: "Address 2" },
    { field: "city", header: "City" },
    { field: "state", header: "State" },
    { field: "zip", header: "ZIP" },
    { field: "country", header: "Country" },
    { field: "tax_id_number", header: "Tax ID" },
    { field: "is_1099", header: "1099 Vendor", type: "boolean" },
    { field: "is_t5018", header: "T5018 Vendor", type: "boolean" },
    { field: "discount_rate", header: "Discount Rate %", type: "number" },
    { field: "deduction_rate", header: "Deduction Rate %", type: "number" },
    { field: "is_inactive", header: "Status", type: "boolean" },
    // Contact 1 fields
    { field: "contact_1_name", header: "Contact 1 Name" },
    { field: "contact_1_email", header: "Contact 1 Email" },
    { field: "contact_1_work_phone", header: "Contact 1 Work Phone" },
    { field: "contact_1_mobile_phone", header: "Contact 1 Mobile Phone" },
    { field: "contact_1_address1", header: "Contact 1 Address 1" },
    { field: "contact_1_city", header: "Contact 1 City" },
    { field: "contact_1_state", header: "Contact 1 State" },
    { field: "contact_1_zip", header: "Contact 1 ZIP" },
    {
      field: "contact_1_purchasing",
      header: "Contact 1 Purchasing",
      type: "boolean",
    },
    {
      field: "contact_1_scheduling",
      header: "Contact 1 Scheduling",
      type: "boolean",
    },
    {
      field: "contact_1_warranty",
      header: "Contact 1 Warranty",
      type: "boolean",
    },
    {
      field: "contact_1_variance_po",
      header: "Contact 1 Variance PO",
      type: "boolean",
    },
    {
      field: "contact_1_accounts_payable",
      header: "Contact 1 AP",
      type: "boolean",
    },
    // Contact 2 fields
    { field: "contact_2_name", header: "Contact 2 Name" },
    { field: "contact_2_email", header: "Contact 2 Email" },
    { field: "contact_2_work_phone", header: "Contact 2 Work Phone" },
    { field: "contact_2_mobile_phone", header: "Contact 2 Mobile Phone" },
    { field: "contact_2_address1", header: "Contact 2 Address 1" },
    { field: "contact_2_city", header: "Contact 2 City" },
    { field: "contact_2_state", header: "Contact 2 State" },
    { field: "contact_2_zip", header: "Contact 2 ZIP" },
    {
      field: "contact_2_purchasing",
      header: "Contact 2 Purchasing",
      type: "boolean",
    },
    {
      field: "contact_2_scheduling",
      header: "Contact 2 Scheduling",
      type: "boolean",
    },
    {
      field: "contact_2_warranty",
      header: "Contact 2 Warranty",
      type: "boolean",
    },
    {
      field: "contact_2_variance_po",
      header: "Contact 2 Variance PO",
      type: "boolean",
    },
    {
      field: "contact_2_accounts_payable",
      header: "Contact 2 AP",
      type: "boolean",
    },
    // Contact 3 fields
    { field: "contact_3_name", header: "Contact 3 Name" },
    { field: "contact_3_email", header: "Contact 3 Email" },
    { field: "contact_3_work_phone", header: "Contact 3 Work Phone" },
    { field: "contact_3_mobile_phone", header: "Contact 3 Mobile Phone" },
    { field: "contact_3_address1", header: "Contact 3 Address 1" },
    { field: "contact_3_city", header: "Contact 3 City" },
    { field: "contact_3_state", header: "Contact 3 State" },
    { field: "contact_3_zip", header: "Contact 3 ZIP" },
    {
      field: "contact_3_purchasing",
      header: "Contact 3 Purchasing",
      type: "boolean",
    },
    {
      field: "contact_3_scheduling",
      header: "Contact 3 Scheduling",
      type: "boolean",
    },
    {
      field: "contact_3_warranty",
      header: "Contact 3 Warranty",
      type: "boolean",
    },
    {
      field: "contact_3_variance_po",
      header: "Contact 3 Variance PO",
      type: "boolean",
    },
    {
      field: "contact_3_accounts_payable",
      header: "Contact 3 AP",
      type: "boolean",
    },
  ];

  // Format contacts count for display
  const getContactsCount = (supplierId: string) => {
    const contacts = allContacts[supplierId] || [];
    return contacts.length;
  };

  // Toggle expanded state for a supplier
  const toggleSupplierExpanded = useCallback((supplierId: string) => {
    setExpandedSuppliers((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(supplierId)) {
        newSet.delete(supplierId);
      } else {
        newSet.add(supplierId);
      }
      return newSet;
    });
  }, []);

  // Create row data with contact sub-rows
  const rowDataWithContacts = useMemo(() => {
    const rows: any[] = [];

    suppliers.forEach((supplier) => {
      // Add supplier row
      rows.push({
        ...supplier,
        isSupplierRow: true,
        isExpanded: expandedSuppliers.has(supplier.supplier_id),
      });

      // If expanded, add contact rows
      if (expandedSuppliers.has(supplier.supplier_id)) {
        const contacts = allContacts[supplier.supplier_id] || [];
        contacts.forEach((contact) => {
          rows.push({
            ...contact,
            isContactRow: true,
            parentSupplierId: supplier.supplier_id,
            supplier_code: "", // Empty for contact rows
            supplier_name: contact.supplier_contact_name || "Unnamed Contact",
          });
        });
      }
    });

    return rows;
  }, [suppliers, allContacts, expandedSuppliers]);

  const handleEditContact = useCallback((contact: SupplierContact) => {
    setEditingContact(contact);
    setContactFormData({
      supplier_contact_name: contact.supplier_contact_name || "",
      email: contact.email || "",
      work_phone: contact.work_phone || "",
      mobile_phone: contact.mobile_phone || "",
      fax: contact.fax || "",
      address1: contact.address1 || "",
      address2: contact.address2 || "",
      city: contact.city || "",
      state: contact.state || "",
      zip: contact.zip || "",
      purchasing_contact: contact.purchasing_contact,
      scheduling_contact: contact.scheduling_contact,
      warranty_contact: contact.warranty_contact,
      variance_po_contact: contact.variance_po_contact,
      accounts_payable_contact: contact.accounts_payable_contact,
      is_inactive: contact.is_inactive,
    });
    setIsEditContactDialogOpen(true);
  }, []);

  // AG Grid column definitions
  const columnDefs: ColDef[] = useMemo(
    () => [
      {
        width: 50,
        pinned: "left",
        cellRenderer: (params: any) => {
          if (params.data.isContactRow) {
            return "";
          }
          const contactsCount =
            allContacts[params.data.supplier_id]?.length || 0;
          if (contactsCount === 0) return "";

          const isExpanded = expandedSuppliers.has(params.data.supplier_id);

          return React.createElement(
            "button",
            {
              className: "p-1 hover:bg-gray-100 rounded",
              onClick: (e: any) => {
                e.stopPropagation();
                console.log(
                  "Expanding supplier:",
                  params.data.supplier_id,
                  "Contacts:",
                  contactsCount
                );
                setExpandedSuppliers((prev) => {
                  const newSet = new Set(prev);
                  if (newSet.has(params.data.supplier_id)) {
                    newSet.delete(params.data.supplier_id);
                  } else {
                    newSet.add(params.data.supplier_id);
                  }
                  console.log("New expanded set:", Array.from(newSet));
                  return newSet;
                });
              },
            },
            isExpanded ? "▼" : "▶"
          );
        },
      },
      {
        field: "supplier_code",
        headerName: "Code",
        width: 120,
        pinned: "left",
        cellRenderer: function CodeRenderer(params: any) {
          if (params.data.isContactRow) {
            return "";
          }
          return params.value;
        },
      },
      {
        field: "supplier_name",
        headerName: "Name",
        width: 200,
        pinned: "left",
        editable: (params: any) => !params.data.isContactRow,
        cellClass: (params: any) => (params.data.isContactRow ? "pl-8" : ""),
        cellRenderer: function NameRenderer(params: any) {
          if (params.data.isContactRow) {
            return React.createElement(
              "div",
              { className: "flex items-center gap-2" },
              React.createElement("span", { className: "text-gray-400" }, "└"),
              React.createElement(
                "span",
                { className: "text-sm" },
                params.value
              )
            );
          }
          return params.value;
        },
      },
      {
        field: "accounting_contact",
        headerName: "Contact",
        width: 150,
        editable: (params: any) => !params.data.isContactRow,
        cellRenderer: function ContactRenderer(params: any) {
          if (params.data.isContactRow) {
            // Show contact types for contact rows
            const types = [];
            if (params.data.purchasing_contact) types.push("Purchasing");
            if (params.data.scheduling_contact) types.push("Scheduling");
            if (params.data.warranty_contact) types.push("Warranty");
            if (params.data.variance_po_contact) types.push("Variance PO");
            if (params.data.accounts_payable_contact) types.push("AP");

            return React.createElement(
              "div",
              { className: "text-sm text-gray-600" },
              types.join(", ")
            );
          }
          return params.value;
        },
      },
      {
        field: "accounting_email",
        headerName: "Email",
        width: 200,
        valueGetter: (params: any) => {
          if (params.data.isContactRow) {
            return params.data.email;
          }
          return params.data.accounting_email;
        },
        cellRenderer: function EmailCellRenderer(params: any) {
          const email = params.data.isContactRow
            ? params.data.email
            : params.data.accounting_email;
          if (!email) return "";
          return React.createElement(
            "a",
            {
              href: `mailto:${email}`,
              className:
                "text-blue-600 hover:text-blue-800 dark:text-yellow-400 dark:hover:text-yellow-300 hover:underline text-sm",
              onClick: (e: any) => e.stopPropagation(),
            },
            email
          );
        },
      },
      {
        field: "work_phone",
        headerName: "Phone",
        width: 140,
        cellRenderer: function PhoneCellRenderer(params: any) {
          if (!params.value) return "";
          return React.createElement(
            "a",
            {
              href: `tel:${params.value}`,
              className:
                "text-blue-600 hover:text-blue-800 dark:text-yellow-400 dark:hover:text-yellow-300 hover:underline text-sm",
              onClick: (e: any) => e.stopPropagation(),
            },
            params.value
          );
        },
      },
      {
        field: "city",
        headerName: "City",
        width: 120,
        editable: (params: any) => !params.data.isContactRow,
        cellClass: "text-sm",
      },
      {
        field: "state",
        headerName: "State",
        width: 80,
        editable: (params: any) => !params.data.isContactRow,
        cellClass: "text-sm",
      },
      {
        headerName: "Contacts",
        width: 100,
        valueGetter: (params: any) => {
          if (params.data.isContactRow) return "";
          return allContacts[params.data.supplier_id]?.length || 0;
        },
        cellRenderer: (params: any) => {
          if (params.data.isContactRow) return "";
          const count = params.value;
          if (count === 0) return "0";
          return React.createElement(
            "span",
            {
              className: "px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded",
            },
            `${count} contact${count !== 1 ? "s" : ""}`
          );
        },
      },
      {
        field: "tax_id_number",
        headerName: "Tax ID",
        width: 120,
        cellRenderer: function TaxIdRenderer(params: any) {
          if (params.data.isContactRow) return "";
          return params.value;
        },
      },
      {
        field: "is_1099",
        headerName: "1099",
        width: 80,
        cellRenderer: function Is1099Renderer(params: any) {
          if (params.data.isContactRow) return "";
          return params.value ? "✓" : "";
        },
        cellClass: "text-center",
      },
      {
        field: "is_t5018",
        headerName: "T5018",
        width: 80,
        cellRenderer: function IsT5018Renderer(params: any) {
          if (params.data.isContactRow) return "";
          return params.value ? "✓" : "";
        },
        cellClass: "text-center",
      },
      {
        field: "discount_rate",
        headerName: "Discount %",
        width: 110,
        valueFormatter: (params: any) => {
          if (params.data.isContactRow) return "";
          return params.value ? `${params.value}%` : "";
        },
      },
      {
        field: "is_inactive",
        headerName: "Status",
        width: 100,
        cellRenderer: function StatusMainRenderer(params: any) {
          return params.value ? "Inactive" : "Active";
        },
      },
      {
        headerName: "Actions",
        width: 220,
        pinned: "right",
        cellRenderer: function ActionsRenderer(params: any) {
          if (params.data.isContactRow) {
            return React.createElement(
              "div",
              { className: "flex gap-1" },
              React.createElement(
                "button",
                {
                  className:
                    "p-1.5 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded",
                  title: "Edit Contact",
                  onClick: (e: any) => {
                    e.stopPropagation();
                    // Find the parent supplier from row data
                    const supplierRow = rowDataWithContacts.find(
                      (row: any) =>
                        row.isSupplierRow &&
                        row.supplier_id === params.data.parentSupplierId
                    );
                    if (supplierRow) {
                      setSelectedSupplierForContacts(supplierRow);
                      handleEditContact(params.data);
                    }
                  },
                },
                React.createElement(Edit, { className: "h-4 w-4" })
              )
            );
          }
          return React.createElement(
            "div",
            { className: "flex gap-1" },
            React.createElement(
              "button",
              {
                className:
                  "p-1.5 text-gray-600 hover:text-gray-800 hover:bg-gray-50 rounded",
                title: "View Supplier",
                onClick: (e: any) => {
                  e.stopPropagation();
                  handleView(params.data);
                },
              },
              React.createElement(Eye, { className: "h-4 w-4" })
            ),
            React.createElement(
              "button",
              {
                className:
                  "p-1.5 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded",
                title: "Edit Supplier",
                onClick: (e: any) => {
                  e.stopPropagation();
                  handleEdit(params.data);
                },
              },
              React.createElement(Edit, { className: "h-4 w-4" })
            ),
            React.createElement(
              "button",
              {
                className:
                  "p-1.5 text-red-600 hover:text-red-800 hover:bg-red-50 rounded",
                title: "Delete Supplier",
                onClick: (e: any) => {
                  e.stopPropagation();
                  setSelectedSuppliers([params.data]);
                  setIsDeleteDialogOpen(true);
                },
              },
              React.createElement(Trash2, { className: "h-4 w-4" })
            ),
            React.createElement(
              "button",
              {
                className:
                  "p-1.5 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded",
                title: "Manage Contacts",
                onClick: (e: any) => {
                  e.stopPropagation();
                  setSelectedSupplierForContacts(params.data);
                  setIsContactsDialogOpen(true);
                },
              },
              React.createElement(Users2, { className: "h-4 w-4" })
            )
          );
        },
      },
    ],
    [
      allContacts,
      expandedSuppliers,
      rowDataWithContacts,
      setSelectedSupplierForContacts,
      setIsContactsDialogOpen,
      handleEditContact,
    ]
  );

  const handleView = (supplier: Supplier) => {
    setViewingSupplier(supplier);
    setIsViewDialogOpen(true);
  };

  const handleEdit = (supplier: Supplier) => {
    setEditingSupplier(supplier);
    setFormData({
      supplier_code: supplier.supplier_code,
      supplier_name: supplier.supplier_name || "",
      address1: supplier.address1 || "",
      address2: supplier.address2 || "",
      city: supplier.city || "",
      state: supplier.state || "",
      zip: supplier.zip || "",
      country: supplier.country || "USA",
      currency: supplier.currency || "USD",
      accounting_contact: supplier.accounting_contact || "",
      accounting_email: supplier.accounting_email || "",
      work_phone: supplier.work_phone || "",
      mobile_phone: supplier.mobile_phone || "",
      fax: supplier.fax || "",
      tax_id_number: supplier.tax_id_number || "",
      is_1099: supplier.is_1099,
      is_t5018: supplier.is_t5018,
      discount_rate: supplier.discount_rate?.toString() || "",
      deduction_rate: supplier.deduction_rate?.toString() || "",
      supplier_company_email: supplier.supplier_company_email || "",
      is_full_subscriber: supplier.is_full_subscriber,
      is_inactive: supplier.is_inactive,
    });
    setIsEditDialogOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!builderId) return;

    const supplierData = {
      builder_id: builderId,
      ...formData,
      discount_rate: formData.discount_rate
        ? parseFloat(formData.discount_rate)
        : null,
      deduction_rate: formData.deduction_rate
        ? parseFloat(formData.deduction_rate)
        : null,
    };

    if (editingSupplier) {
      await updateSupplierMutation.mutateAsync({
        supplier_id: editingSupplier.supplier_id,
        builderId,
        ...supplierData,
      });
    } else {
      await createSupplierMutation.mutateAsync(supplierData);
    }
  };

  const handleDelete = async () => {
    if (selectedSuppliers.length > 0 && builderId) {
      await deleteSupplierMutation.mutateAsync({
        builderId,
        supplierId: selectedSuppliers[0].supplier_id,
      });
    }
  };

  const handleSubmitContact = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!builderId || !selectedSupplierForContacts) return;

    const contactData = {
      builderId,
      ...contactFormData,
    };

    if (editingContact) {
      await updateContactMutation.mutateAsync({
        ...contactData,
        supplier_contact_id: editingContact.supplier_contact_id,
      });
    } else {
      await createContactMutation.mutateAsync({
        ...contactData,
        supplier_id: selectedSupplierForContacts.supplier_id,
      });
    }
  };

  const handleDeleteContact = async (contactId: string) => {
    if (!builderId) return;
    await deleteContactMutation.mutateAsync({
      builderId,
      contactId,
    });
  };

  // Handle inline editing
  const handleCellValueChanged = useCallback(
    async (event: CellValueChangedEvent<Supplier>) => {
      if (!builderId) return;

      const { data, colDef, newValue, oldValue } = event;
      const field = colDef.field;

      // Skip if no change
      if (newValue === oldValue) return;

      try {
        await updateSupplierMutation.mutateAsync({
          supplier_id: data.supplier_id,
          builderId,
          [field as string]: newValue,
        });
      } catch (error) {
        console.error("Error updating supplier field:", error);
        // Revert the change
        if (field) {
          event.node.setDataValue(field, oldValue);
        }
      }
    },
    [builderId, updateSupplierMutation]
  );

  // Handle selection changes
  const handleSelectionChanged = useCallback((selectedRows: Supplier[]) => {
    setSelectedSuppliers(selectedRows);
  }, []);

  // Handle bulk edit
  const handleBulkEdit = () => {
    if (selectedSuppliers.length === 0) {
      alert("Please select suppliers to edit");
      return;
    }
    setIsBulkEditDialogOpen(true);
  };

  const handleBulkEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!builderId || selectedSuppliers.length === 0) return;

    try {
      // Create an object with only non-empty values
      const updates = Object.entries(bulkEditData).reduce(
        (acc, [key, value]) => {
          if (value !== "" && value !== null) {
            acc[key] = value;
          }
          return acc;
        },
        {} as any
      );

      if (Object.keys(updates).length === 0) {
        alert("Please enter values to update");
        return;
      }

      // Update each selected supplier
      for (const supplier of selectedSuppliers) {
        await updateSupplierMutation.mutateAsync({
          supplier_id: supplier.supplier_id,
          builderId,
          ...updates,
        });
      }

      setIsBulkEditDialogOpen(false);
      setBulkEditData({
        supplier_name: "",
        city: "",
        state: "",
        zip: "",
        country: "",
        currency: "",
        accounting_contact: "",
        accounting_email: "",
        work_phone: "",
        discount_rate: "",
        deduction_rate: "",
        is_1099: false,
        is_t5018: false,
        is_inactive: false,
      });
      setSelectedSuppliers([]);
    } catch (error) {
      console.error("Error bulk updating suppliers:", error);
      alert("Error updating suppliers. Please try again.");
    }
  };

  const handleBulkDelete = () => {
    if (selectedSuppliers.length === 0) {
      alert("Please select suppliers to delete");
      return;
    }
    setIsDeleteDialogOpen(true);
  };

  // Handle import from DataGrid
  const handleImport = useCallback(
    async (importData: any[]) => {
      if (!builderId || !session?.user?.id) return;

      setIsImporting(true);
      try {
        console.log("Import data before processing:", importData.slice(0, 2)); // Debug first 2 rows

        const suppliersWithContacts = importData.map((row: any) => {
          const supplier = {
            builder_id: builderId,
            supplier_code: row.supplier_code || "",
            supplier_name: row.supplier_name || null,
            accounting_contact: row.accounting_contact || null,
            accounting_email:
              row.accounting_email &&
              row.accounting_email.trim() !== "" &&
              row.accounting_email !== "N/A"
                ? row.accounting_email.trim()
                : null,
            work_phone: row.work_phone || null,
            address1: row.address1 || null,
            address2: row.address2 || null,
            city: row.city || null,
            state: row.state || null,
            zip: row.zip || null,
            country: row.country || "USA",
            tax_id_number: row.tax_id_number || null,
            is_1099: row.is_1099 === true,
            is_t5018: row.is_t5018 === true,
            discount_rate: row.discount_rate
              ? parseFloat(row.discount_rate)
              : null,
            deduction_rate: row.deduction_rate
              ? parseFloat(row.deduction_rate)
              : null,
            is_inactive: row.is_inactive === true,
            currency: "USD",
            is_full_subscriber: false,
          };

          // Extract contacts from the row data
          const contacts = [];
          for (let i = 1; i <= 3; i++) {
            const contactName = row[`contact_${i}_name`];
            if (contactName && contactName.trim()) {
              contacts.push({
                supplier_contact_name: contactName,
                email:
                  row[`contact_${i}_email`] &&
                  row[`contact_${i}_email`].trim() !== "" &&
                  row[`contact_${i}_email`] !== "N/A"
                    ? row[`contact_${i}_email`].trim()
                    : null,
                work_phone: row[`contact_${i}_work_phone`] || null,
                mobile_phone: row[`contact_${i}_mobile_phone`] || null,
                address1: row[`contact_${i}_address1`] || null,
                address2: null, // Not included in import to keep columns manageable
                city: row[`contact_${i}_city`] || null,
                state: row[`contact_${i}_state`] || null,
                zip: row[`contact_${i}_zip`] || null,
                fax: null, // Not included in import to keep columns manageable
                purchasing_contact: row[`contact_${i}_purchasing`] === true,
                scheduling_contact: row[`contact_${i}_scheduling`] === true,
                warranty_contact: row[`contact_${i}_warranty`] === true,
                variance_po_contact: row[`contact_${i}_variance_po`] === true,
                accounts_payable_contact:
                  row[`contact_${i}_accounts_payable`] === true,
                is_inactive: false,
              });
            }
          }

          return { supplier, contacts };
        });

        console.log(
          "Processed data before API:",
          suppliersWithContacts.slice(0, 2)
        ); // Debug processed data

        await bulkCreateMutation.mutateAsync({
          builderId,
          suppliersWithContacts,
        });

        // Refresh data
        refetch();
      } catch (error) {
        console.error("Import failed:", error);
        alert(
          `Import failed: ${
            error instanceof Error ? error.message : "Unknown error"
          }`
        );
      } finally {
        setIsImporting(false);
      }
    },
    [builderId, session?.user?.id, bulkCreateMutation, refetch]
  );

  if (status === "loading" || isLoading || isLoadingContacts) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="p-6">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
              <Package2 className="h-8 w-8" />
              Suppliers
            </h1>
            <p className="text-muted-foreground">
              Manage your supplier and vendor information
            </p>
          </div>
          <Button
            onClick={() => setIsAddDialogOpen(true)}
            className="flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            Add New Supplier
          </Button>
        </div>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Supplier List</CardTitle>
            {selectedSuppliers.length > 0 && (
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">
                  {selectedSuppliers.length} selected
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleBulkEdit}
                  className="flex items-center gap-2"
                >
                  <Plus className="h-4 w-4" />
                  Bulk Edit
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleBulkDelete}
                  className="flex items-center gap-2 text-red-600 hover:text-red-700"
                >
                  <Trash2 className="h-4 w-4" />
                  Bulk Delete
                </Button>
              </div>
            )}
          </CardHeader>
          <CardContent>
            <DataGrid
              data={rowDataWithContacts}
              loading={isLoading || isImporting}
              columnDefs={columnDefs}
              excelColumns={excelColumns}
              enableEditing={!isImporting}
              rowSelection="multiple"
              onImport={handleImport}
              onSelectionChanged={handleSelectionChanged}
              onCellValueChanged={handleCellValueChanged}
              fileName="suppliers"
              importTitle="Import Suppliers"
            />
          </CardContent>
        </Card>

        {/* Add/Edit Dialog */}
        <Dialog
          open={isAddDialogOpen || isEditDialogOpen}
          onOpenChange={(open) => {
            if (!open) {
              setIsAddDialogOpen(false);
              setIsEditDialogOpen(false);
              setEditingSupplier(null);
              resetForm();
            }
          }}
        >
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingSupplier ? "Edit Supplier" : "Add New Supplier"}
              </DialogTitle>
              <DialogDescription>
                {editingSupplier
                  ? "Update supplier information"
                  : "Enter supplier details"}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit}>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="supplier_code">Supplier Code *</Label>
                    <Input
                      id="supplier_code"
                      value={formData.supplier_code}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          supplier_code: e.target.value,
                        })
                      }
                      required
                      maxLength={50}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="supplier_name">Supplier Name</Label>
                    <Input
                      id="supplier_name"
                      value={formData.supplier_name}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          supplier_name: e.target.value,
                        })
                      }
                      maxLength={100}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="accounting_contact">Contact Name</Label>
                    <Input
                      id="accounting_contact"
                      value={formData.accounting_contact}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          accounting_contact: e.target.value,
                        })
                      }
                      maxLength={50}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="accounting_email">Contact Email</Label>
                    <Input
                      id="accounting_email"
                      type="email"
                      value={formData.accounting_email}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          accounting_email: e.target.value,
                        })
                      }
                      maxLength={200}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="work_phone">Work Phone</Label>
                    <Input
                      id="work_phone"
                      value={formData.work_phone}
                      onChange={(e) =>
                        setFormData({ ...formData, work_phone: e.target.value })
                      }
                      maxLength={50}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="mobile_phone">Mobile Phone</Label>
                    <Input
                      id="mobile_phone"
                      value={formData.mobile_phone}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          mobile_phone: e.target.value,
                        })
                      }
                      maxLength={50}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="fax">Fax</Label>
                    <Input
                      id="fax"
                      value={formData.fax}
                      onChange={(e) =>
                        setFormData({ ...formData, fax: e.target.value })
                      }
                      maxLength={50}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="address1">Address Line 1</Label>
                  <Input
                    id="address1"
                    value={formData.address1}
                    onChange={(e) =>
                      setFormData({ ...formData, address1: e.target.value })
                    }
                    maxLength={50}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="address2">Address Line 2</Label>
                  <Input
                    id="address2"
                    value={formData.address2}
                    onChange={(e) =>
                      setFormData({ ...formData, address2: e.target.value })
                    }
                    maxLength={50}
                  />
                </div>

                <div className="grid grid-cols-4 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="city">City</Label>
                    <Input
                      id="city"
                      value={formData.city}
                      onChange={(e) =>
                        setFormData({ ...formData, city: e.target.value })
                      }
                      maxLength={50}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="state">State</Label>
                    <Input
                      id="state"
                      value={formData.state}
                      onChange={(e) =>
                        setFormData({ ...formData, state: e.target.value })
                      }
                      maxLength={10}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="zip">ZIP Code</Label>
                    <Input
                      id="zip"
                      value={formData.zip}
                      onChange={(e) =>
                        setFormData({ ...formData, zip: e.target.value })
                      }
                      maxLength={50}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="country">Country</Label>
                    <Input
                      id="country"
                      value={formData.country}
                      onChange={(e) =>
                        setFormData({ ...formData, country: e.target.value })
                      }
                      maxLength={50}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="tax_id_number">Tax ID Number</Label>
                    <Input
                      id="tax_id_number"
                      value={formData.tax_id_number}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          tax_id_number: e.target.value,
                        })
                      }
                      maxLength={50}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="supplier_company_email">
                      Company Email
                    </Label>
                    <Input
                      id="supplier_company_email"
                      type="email"
                      value={formData.supplier_company_email}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          supplier_company_email: e.target.value,
                        })
                      }
                      maxLength={200}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="discount_rate">Discount Rate (%)</Label>
                    <Input
                      id="discount_rate"
                      type="number"
                      step="0.0001"
                      min="0"
                      max="99.9999"
                      value={formData.discount_rate}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          discount_rate: e.target.value,
                        })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="deduction_rate">Deduction Rate (%)</Label>
                    <Input
                      id="deduction_rate"
                      type="number"
                      step="0.0001"
                      min="0"
                      max="99.9999"
                      value={formData.deduction_rate}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          deduction_rate: e.target.value,
                        })
                      }
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="is_1099"
                      checked={formData.is_1099}
                      onChange={(e) =>
                        setFormData({ ...formData, is_1099: e.target.checked })
                      }
                      className="rounded border-gray-300"
                    />
                    <Label htmlFor="is_1099">1099 Vendor</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="is_t5018"
                      checked={formData.is_t5018}
                      onChange={(e) =>
                        setFormData({ ...formData, is_t5018: e.target.checked })
                      }
                      className="rounded border-gray-300"
                    />
                    <Label htmlFor="is_t5018">T5018 Vendor (Canada)</Label>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="is_full_subscriber"
                      checked={formData.is_full_subscriber}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          is_full_subscriber: e.target.checked,
                        })
                      }
                      className="rounded border-gray-300"
                    />
                    <Label htmlFor="is_full_subscriber">Full Subscriber</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="is_inactive"
                      checked={formData.is_inactive}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          is_inactive: e.target.checked,
                        })
                      }
                      className="rounded border-gray-300"
                    />
                    <Label htmlFor="is_inactive">Inactive</Label>
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setIsAddDialogOpen(false);
                    setIsEditDialogOpen(false);
                    setEditingSupplier(null);
                    resetForm();
                  }}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={
                    createSupplierMutation.isPending ||
                    updateSupplierMutation.isPending
                  }
                >
                  {createSupplierMutation.isPending ||
                  updateSupplierMutation.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : editingSupplier ? (
                    "Update Supplier"
                  ) : (
                    "Add Supplier"
                  )}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation Dialog */}
        <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Confirm Delete</DialogTitle>
              <DialogDescription>
                Are you sure you want to delete {selectedSuppliers.length}{" "}
                supplier(s)? This will mark them as inactive.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setIsDeleteDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={handleDelete}
                disabled={deleteSupplierMutation.isPending}
              >
                {deleteSupplierMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Deleting...
                  </>
                ) : (
                  "Delete"
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Contacts Dialog */}
        <Dialog
          open={isContactsDialogOpen}
          onOpenChange={(open) => {
            setIsContactsDialogOpen(open);
            if (!open) {
              setSelectedSupplierForContacts(null);
            }
          }}
        >
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
            <DialogHeader>
              <DialogTitle>
                Supplier Contacts -{" "}
                {selectedSupplierForContacts?.supplier_name ||
                  selectedSupplierForContacts?.supplier_code}
              </DialogTitle>
              <DialogDescription>
                Manage contacts for this supplier
              </DialogDescription>
            </DialogHeader>
            <div className="flex-1 overflow-y-auto">
              <div className="mb-4">
                <Button
                  size="sm"
                  onClick={() => setIsAddContactDialogOpen(true)}
                >
                  <UserPlus className="h-4 w-4 mr-2" />
                  Add Contact
                </Button>
              </div>
              <div className="space-y-4">
                {contacts.length === 0 ? (
                  <p className="text-muted-foreground text-center py-8">
                    No contacts found for this supplier.
                  </p>
                ) : (
                  contacts.map((contact) => (
                    <Card key={contact.supplier_contact_id}>
                      <CardContent className="p-4">
                        <div className="flex justify-between items-start">
                          <div className="space-y-2">
                            <div className="flex items-center gap-2">
                              <h4 className="font-semibold">
                                {contact.supplier_contact_name ||
                                  "Unnamed Contact"}
                              </h4>
                              {contact.is_inactive && (
                                <Badge
                                  variant="destructive"
                                  className="text-xs"
                                >
                                  Inactive
                                </Badge>
                              )}
                            </div>
                            <div className="grid grid-cols-2 gap-x-6 gap-y-1 text-sm">
                              {contact.email && (
                                <div className="flex items-center gap-2">
                                  <Mail className="h-3 w-3 text-muted-foreground" />
                                  <a
                                    href={`mailto:${contact.email}`}
                                    className="text-blue-600 hover:underline"
                                  >
                                    {contact.email}
                                  </a>
                                </div>
                              )}
                              {contact.work_phone && (
                                <div className="flex items-center gap-2">
                                  <Phone className="h-3 w-3 text-muted-foreground" />
                                  <a
                                    href={`tel:${contact.work_phone}`}
                                    className="text-blue-600 hover:underline"
                                  >
                                    {contact.work_phone}
                                  </a>
                                </div>
                              )}
                              {contact.mobile_phone && (
                                <div className="flex items-center gap-2">
                                  <Phone className="h-3 w-3 text-muted-foreground" />
                                  <span className="text-muted-foreground">
                                    Mobile:
                                  </span>
                                  <a
                                    href={`tel:${contact.mobile_phone}`}
                                    className="text-blue-600 hover:underline"
                                  >
                                    {contact.mobile_phone}
                                  </a>
                                </div>
                              )}
                              {(contact.city ||
                                contact.state ||
                                contact.zip) && (
                                <div className="col-span-2 text-muted-foreground">
                                  {[
                                    contact.address1,
                                    contact.address2,
                                    `${contact.city}${
                                      contact.state ? ", " + contact.state : ""
                                    }${contact.zip ? " " + contact.zip : ""}`,
                                  ]
                                    .filter(Boolean)
                                    .join(", ")}
                                </div>
                              )}
                            </div>
                            <div className="flex flex-wrap gap-2 mt-2">
                              {contact.purchasing_contact && (
                                <Badge variant="secondary">Purchasing</Badge>
                              )}
                              {contact.scheduling_contact && (
                                <Badge variant="secondary">Scheduling</Badge>
                              )}
                              {contact.warranty_contact && (
                                <Badge variant="secondary">Warranty</Badge>
                              )}
                              {contact.variance_po_contact && (
                                <Badge variant="secondary">Variance PO</Badge>
                              )}
                              {contact.accounts_payable_contact && (
                                <Badge variant="secondary">
                                  Accounts Payable
                                </Badge>
                              )}
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleEditContact(contact)}
                              className="h-8 w-8 p-0"
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() =>
                                handleDeleteContact(contact.supplier_contact_id)
                              }
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Add/Edit Contact Dialog */}
        <Dialog
          open={isAddContactDialogOpen || isEditContactDialogOpen}
          onOpenChange={(open) => {
            if (!open) {
              setIsAddContactDialogOpen(false);
              setIsEditContactDialogOpen(false);
              setEditingContact(null);
              resetContactForm();
            }
          }}
        >
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingContact ? "Edit Contact" : "Add New Contact"}
              </DialogTitle>
              <DialogDescription>
                {editingContact
                  ? "Update contact information"
                  : "Enter contact details"}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmitContact}>
              <div className="grid gap-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="supplier_contact_name">Contact Name</Label>
                  <Input
                    id="supplier_contact_name"
                    value={contactFormData.supplier_contact_name}
                    onChange={(e) =>
                      setContactFormData({
                        ...contactFormData,
                        supplier_contact_name: e.target.value,
                      })
                    }
                    maxLength={100}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="contact_email">Email</Label>
                    <Input
                      id="contact_email"
                      type="email"
                      value={contactFormData.email}
                      onChange={(e) =>
                        setContactFormData({
                          ...contactFormData,
                          email: e.target.value,
                        })
                      }
                      maxLength={200}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="contact_work_phone">Work Phone</Label>
                    <Input
                      id="contact_work_phone"
                      value={contactFormData.work_phone}
                      onChange={(e) =>
                        setContactFormData({
                          ...contactFormData,
                          work_phone: e.target.value,
                        })
                      }
                      maxLength={20}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="contact_mobile_phone">Mobile Phone</Label>
                    <Input
                      id="contact_mobile_phone"
                      value={contactFormData.mobile_phone}
                      onChange={(e) =>
                        setContactFormData({
                          ...contactFormData,
                          mobile_phone: e.target.value,
                        })
                      }
                      maxLength={50}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="contact_fax">Fax</Label>
                    <Input
                      id="contact_fax"
                      value={contactFormData.fax}
                      onChange={(e) =>
                        setContactFormData({
                          ...contactFormData,
                          fax: e.target.value,
                        })
                      }
                      maxLength={50}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="contact_address1">Address Line 1</Label>
                  <Input
                    id="contact_address1"
                    value={contactFormData.address1}
                    onChange={(e) =>
                      setContactFormData({
                        ...contactFormData,
                        address1: e.target.value,
                      })
                    }
                    maxLength={50}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="contact_address2">Address Line 2</Label>
                  <Input
                    id="contact_address2"
                    value={contactFormData.address2}
                    onChange={(e) =>
                      setContactFormData({
                        ...contactFormData,
                        address2: e.target.value,
                      })
                    }
                    maxLength={50}
                  />
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="contact_city">City</Label>
                    <Input
                      id="contact_city"
                      value={contactFormData.city}
                      onChange={(e) =>
                        setContactFormData({
                          ...contactFormData,
                          city: e.target.value,
                        })
                      }
                      maxLength={50}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="contact_state">State</Label>
                    <Input
                      id="contact_state"
                      value={contactFormData.state}
                      onChange={(e) =>
                        setContactFormData({
                          ...contactFormData,
                          state: e.target.value,
                        })
                      }
                      maxLength={10}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="contact_zip">ZIP Code</Label>
                    <Input
                      id="contact_zip"
                      value={contactFormData.zip}
                      onChange={(e) =>
                        setContactFormData({
                          ...contactFormData,
                          zip: e.target.value,
                        })
                      }
                      maxLength={50}
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <Label>Contact Types</Label>
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id="purchasing_contact"
                        checked={contactFormData.purchasing_contact}
                        onChange={(e) =>
                          setContactFormData({
                            ...contactFormData,
                            purchasing_contact: e.target.checked,
                          })
                        }
                        className="rounded border-gray-300"
                      />
                      <Label htmlFor="purchasing_contact">
                        Purchasing Contact
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id="scheduling_contact"
                        checked={contactFormData.scheduling_contact}
                        onChange={(e) =>
                          setContactFormData({
                            ...contactFormData,
                            scheduling_contact: e.target.checked,
                          })
                        }
                        className="rounded border-gray-300"
                      />
                      <Label htmlFor="scheduling_contact">
                        Scheduling Contact
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id="warranty_contact"
                        checked={contactFormData.warranty_contact}
                        onChange={(e) =>
                          setContactFormData({
                            ...contactFormData,
                            warranty_contact: e.target.checked,
                          })
                        }
                        className="rounded border-gray-300"
                      />
                      <Label htmlFor="warranty_contact">Warranty Contact</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id="variance_po_contact"
                        checked={contactFormData.variance_po_contact}
                        onChange={(e) =>
                          setContactFormData({
                            ...contactFormData,
                            variance_po_contact: e.target.checked,
                          })
                        }
                        className="rounded border-gray-300"
                      />
                      <Label htmlFor="variance_po_contact">
                        Variance PO Contact
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id="accounts_payable_contact"
                        checked={contactFormData.accounts_payable_contact}
                        onChange={(e) =>
                          setContactFormData({
                            ...contactFormData,
                            accounts_payable_contact: e.target.checked,
                          })
                        }
                        className="rounded border-gray-300"
                      />
                      <Label htmlFor="accounts_payable_contact">
                        Accounts Payable Contact
                      </Label>
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="contact_is_inactive"
                    checked={contactFormData.is_inactive}
                    onChange={(e) =>
                      setContactFormData({
                        ...contactFormData,
                        is_inactive: e.target.checked,
                      })
                    }
                    className="rounded border-gray-300"
                  />
                  <Label htmlFor="contact_is_inactive">Inactive</Label>
                </div>
              </div>
              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setIsAddContactDialogOpen(false);
                    setIsEditContactDialogOpen(false);
                    setEditingContact(null);
                    resetContactForm();
                  }}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={
                    createContactMutation.isPending ||
                    updateContactMutation.isPending
                  }
                >
                  {createContactMutation.isPending ||
                  updateContactMutation.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : editingContact ? (
                    "Update Contact"
                  ) : (
                    "Add Contact"
                  )}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

        {/* Bulk Edit Dialog */}
        <Dialog
          open={isBulkEditDialogOpen}
          onOpenChange={setIsBulkEditDialogOpen}
        >
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                Bulk Edit Suppliers ({selectedSuppliers.length} selected)
              </DialogTitle>
              <DialogDescription>
                Update fields for all selected suppliers. Leave fields blank to
                keep existing values.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleBulkEditSubmit}>
              <div className="grid gap-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="bulk_supplier_name">Supplier Name</Label>
                  <Input
                    id="bulk_supplier_name"
                    value={bulkEditData.supplier_name}
                    onChange={(e) =>
                      setBulkEditData({
                        ...bulkEditData,
                        supplier_name: e.target.value,
                      })
                    }
                    placeholder="Leave blank to keep existing values"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="bulk_accounting_contact">
                      Contact Name
                    </Label>
                    <Input
                      id="bulk_accounting_contact"
                      value={bulkEditData.accounting_contact}
                      onChange={(e) =>
                        setBulkEditData({
                          ...bulkEditData,
                          accounting_contact: e.target.value,
                        })
                      }
                      placeholder="Leave blank to keep existing"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="bulk_accounting_email">Contact Email</Label>
                    <Input
                      id="bulk_accounting_email"
                      type="email"
                      value={bulkEditData.accounting_email}
                      onChange={(e) =>
                        setBulkEditData({
                          ...bulkEditData,
                          accounting_email: e.target.value,
                        })
                      }
                      placeholder="Leave blank to keep existing"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="bulk_city">City</Label>
                    <Input
                      id="bulk_city"
                      value={bulkEditData.city}
                      onChange={(e) =>
                        setBulkEditData({
                          ...bulkEditData,
                          city: e.target.value,
                        })
                      }
                      placeholder="Leave blank to keep existing"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="bulk_state">State</Label>
                    <Input
                      id="bulk_state"
                      value={bulkEditData.state}
                      onChange={(e) =>
                        setBulkEditData({
                          ...bulkEditData,
                          state: e.target.value,
                        })
                      }
                      placeholder="Leave blank to keep existing"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="bulk_zip">ZIP Code</Label>
                    <Input
                      id="bulk_zip"
                      value={bulkEditData.zip}
                      onChange={(e) =>
                        setBulkEditData({
                          ...bulkEditData,
                          zip: e.target.value,
                        })
                      }
                      placeholder="Leave blank to keep existing"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="bulk_country">Country</Label>
                    <Input
                      id="bulk_country"
                      value={bulkEditData.country}
                      onChange={(e) =>
                        setBulkEditData({
                          ...bulkEditData,
                          country: e.target.value,
                        })
                      }
                      placeholder="Leave blank to keep existing"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="bulk_work_phone">Work Phone</Label>
                    <Input
                      id="bulk_work_phone"
                      value={bulkEditData.work_phone}
                      onChange={(e) =>
                        setBulkEditData({
                          ...bulkEditData,
                          work_phone: e.target.value,
                        })
                      }
                      placeholder="Leave blank to keep existing"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="bulk_discount_rate">
                      Discount Rate (%)
                    </Label>
                    <Input
                      id="bulk_discount_rate"
                      type="number"
                      step="0.0001"
                      min="0"
                      max="99.9999"
                      value={bulkEditData.discount_rate}
                      onChange={(e) =>
                        setBulkEditData({
                          ...bulkEditData,
                          discount_rate: e.target.value,
                        })
                      }
                      placeholder="Leave blank to keep existing"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="bulk_deduction_rate">
                      Deduction Rate (%)
                    </Label>
                    <Input
                      id="bulk_deduction_rate"
                      type="number"
                      step="0.0001"
                      min="0"
                      max="99.9999"
                      value={bulkEditData.deduction_rate}
                      onChange={(e) =>
                        setBulkEditData({
                          ...bulkEditData,
                          deduction_rate: e.target.value,
                        })
                      }
                      placeholder="Leave blank to keep existing"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="bulk_is_1099"
                      checked={bulkEditData.is_1099}
                      onChange={(e) =>
                        setBulkEditData({
                          ...bulkEditData,
                          is_1099: e.target.checked,
                        })
                      }
                      className="rounded border-gray-300"
                    />
                    <Label htmlFor="bulk_is_1099">1099 Vendor</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="bulk_is_t5018"
                      checked={bulkEditData.is_t5018}
                      onChange={(e) =>
                        setBulkEditData({
                          ...bulkEditData,
                          is_t5018: e.target.checked,
                        })
                      }
                      className="rounded border-gray-300"
                    />
                    <Label htmlFor="bulk_is_t5018">T5018 Vendor (Canada)</Label>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="bulk_is_inactive"
                    checked={bulkEditData.is_inactive}
                    onChange={(e) =>
                      setBulkEditData({
                        ...bulkEditData,
                        is_inactive: e.target.checked,
                      })
                    }
                    className="rounded border-gray-300"
                  />
                  <Label htmlFor="bulk_is_inactive">Mark as Inactive</Label>
                </div>
              </div>
              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsBulkEditDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={updateSupplierMutation.isPending}
                >
                  {updateSupplierMutation.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Updating...
                    </>
                  ) : (
                    `Update ${selectedSuppliers.length} Suppliers`
                  )}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

        {/* View Supplier Dialog */}
        <Dialog
          open={isViewDialogOpen}
          onOpenChange={(open) => {
            if (!open) {
              setIsViewDialogOpen(false);
              setViewingSupplier(null);
            }
          }}
        >
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Eye className="h-5 w-5" />
                Supplier Information
              </DialogTitle>
              <DialogDescription>
                View supplier details - {viewingSupplier?.supplier_code}
              </DialogDescription>
            </DialogHeader>
            {viewingSupplier && (
              <div className="grid gap-6 py-4">
                {/* Basic Information */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold border-b pb-2">
                    Basic Information
                  </h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-sm font-medium text-muted-foreground">
                        Supplier Code
                      </Label>
                      <p className="text-sm font-mono bg-muted p-2 rounded">
                        {viewingSupplier.supplier_code}
                      </p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-muted-foreground">
                        Supplier Name
                      </Label>
                      <p className="text-sm bg-muted p-2 rounded">
                        {viewingSupplier.supplier_name || "Not specified"}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Contact Information */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold border-b pb-2">
                    Contact Information
                  </h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-sm font-medium text-muted-foreground">
                        Contact Name
                      </Label>
                      <p className="text-sm bg-muted p-2 rounded">
                        {viewingSupplier.accounting_contact || "Not specified"}
                      </p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-muted-foreground">
                        Contact Email
                      </Label>
                      <p className="text-sm bg-muted p-2 rounded">
                        {viewingSupplier.accounting_email || "Not specified"}
                      </p>
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <Label className="text-sm font-medium text-muted-foreground">
                        Work Phone
                      </Label>
                      <p className="text-sm bg-muted p-2 rounded">
                        {viewingSupplier.work_phone || "Not specified"}
                      </p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-muted-foreground">
                        Mobile Phone
                      </Label>
                      <p className="text-sm bg-muted p-2 rounded">
                        {viewingSupplier.mobile_phone || "Not specified"}
                      </p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-muted-foreground">
                        Fax
                      </Label>
                      <p className="text-sm bg-muted p-2 rounded">
                        {viewingSupplier.fax || "Not specified"}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Address Information */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold border-b pb-2">
                    Address Information
                  </h3>
                  <div className="space-y-2">
                    <div>
                      <Label className="text-sm font-medium text-muted-foreground">
                        Address Line 1
                      </Label>
                      <p className="text-sm bg-muted p-2 rounded">
                        {viewingSupplier.address1 || "Not specified"}
                      </p>
                    </div>
                    {viewingSupplier.address2 && (
                      <div>
                        <Label className="text-sm font-medium text-muted-foreground">
                          Address Line 2
                        </Label>
                        <p className="text-sm bg-muted p-2 rounded">
                          {viewingSupplier.address2}
                        </p>
                      </div>
                    )}
                  </div>
                  <div className="grid grid-cols-4 gap-4">
                    <div>
                      <Label className="text-sm font-medium text-muted-foreground">
                        City
                      </Label>
                      <p className="text-sm bg-muted p-2 rounded">
                        {viewingSupplier.city || "Not specified"}
                      </p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-muted-foreground">
                        State
                      </Label>
                      <p className="text-sm bg-muted p-2 rounded">
                        {viewingSupplier.state || "Not specified"}
                      </p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-muted-foreground">
                        ZIP Code
                      </Label>
                      <p className="text-sm bg-muted p-2 rounded">
                        {viewingSupplier.zip || "Not specified"}
                      </p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-muted-foreground">
                        Country
                      </Label>
                      <p className="text-sm bg-muted p-2 rounded">
                        {viewingSupplier.country || "Not specified"}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Financial Information */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold border-b pb-2">
                    Financial Information
                  </h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-sm font-medium text-muted-foreground">
                        Tax ID Number
                      </Label>
                      <p className="text-sm bg-muted p-2 rounded font-mono">
                        {viewingSupplier.tax_id_number || "Not specified"}
                      </p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-muted-foreground">
                        Company Email
                      </Label>
                      <p className="text-sm bg-muted p-2 rounded">
                        {viewingSupplier.supplier_company_email ||
                          "Not specified"}
                      </p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-sm font-medium text-muted-foreground">
                        Discount Rate
                      </Label>
                      <p className="text-sm bg-muted p-2 rounded">
                        {viewingSupplier.discount_rate
                          ? `${viewingSupplier.discount_rate}%`
                          : "Not set"}
                      </p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-muted-foreground">
                        Deduction Rate
                      </Label>
                      <p className="text-sm bg-muted p-2 rounded">
                        {viewingSupplier.deduction_rate
                          ? `${viewingSupplier.deduction_rate}%`
                          : "Not set"}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Settings & Status */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold border-b pb-2">
                    Settings & Status
                  </h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-3">
                      <div className="flex items-center justify-between p-2 bg-muted rounded">
                        <span className="text-sm">1099 Vendor</span>
                        <Badge
                          variant={
                            viewingSupplier.is_1099 ? "default" : "secondary"
                          }
                        >
                          {viewingSupplier.is_1099 ? "Yes" : "No"}
                        </Badge>
                      </div>
                      <div className="flex items-center justify-between p-2 bg-muted rounded">
                        <span className="text-sm">T5018 Vendor</span>
                        <Badge
                          variant={
                            viewingSupplier.is_t5018 ? "default" : "secondary"
                          }
                        >
                          {viewingSupplier.is_t5018 ? "Yes" : "No"}
                        </Badge>
                      </div>
                    </div>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between p-2 bg-muted rounded">
                        <span className="text-sm">Full Subscriber</span>
                        <Badge
                          variant={
                            viewingSupplier.is_full_subscriber
                              ? "default"
                              : "secondary"
                          }
                        >
                          {viewingSupplier.is_full_subscriber ? "Yes" : "No"}
                        </Badge>
                      </div>
                      <div className="flex items-center justify-between p-2 bg-muted rounded">
                        <span className="text-sm">Status</span>
                        <Badge
                          variant={
                            viewingSupplier.is_inactive
                              ? "destructive"
                              : "default"
                          }
                        >
                          {viewingSupplier.is_inactive ? "Inactive" : "Active"}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Additional Information */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold border-b pb-2">
                    Additional Information
                  </h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-sm font-medium text-muted-foreground">
                        Currency
                      </Label>
                      <p className="text-sm bg-muted p-2 rounded">
                        {viewingSupplier.currency || "USD"}
                      </p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-muted-foreground">
                        Contact Count
                      </Label>
                      <p className="text-sm bg-muted p-2 rounded">
                        {allContacts[viewingSupplier.supplier_id]?.length || 0}{" "}
                        contacts
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setIsViewDialogOpen(false);
                  setViewingSupplier(null);
                }}
              >
                Close
              </Button>
              <Button
                onClick={() => {
                  if (viewingSupplier) {
                    handleEdit(viewingSupplier);
                    setIsViewDialogOpen(false);
                  }
                }}
                className="flex items-center gap-2"
              >
                <Edit className="h-4 w-4" />
                Edit Supplier
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
