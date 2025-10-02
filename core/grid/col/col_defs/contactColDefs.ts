import type { ColDef } from "ag-grid-community";
import { ContactTypeCellRenderer } from "../../cell_renderers/ContactTypeCellRenderer";
import { ActiveStatusCellRenderer } from "../../cell_renderers/ActiveStatusCellRenderer";
import { ActionsCellRenderer } from "../../cell_renderers/ActionsCellRenderer";
import { displayNameValueGetter, fullAddressValueGetter } from "../value_getters";

export const contactColDefs: ColDef[] = [
  {
    field: "contact_type",
    headerName: "Type",
    width: 120,
    cellRenderer: ContactTypeCellRenderer,
  },
  {
    field: "display_name",
    headerName: "Name",
    width: 200,
    valueGetter: displayNameValueGetter,
  },
  { field: "email", headerName: "Email", width: 200 },
  { field: "phone", headerName: "Phone", width: 150 },
  { field: "mobile_phone", headerName: "Mobile", width: 150 },
  {
    field: "full_address",
    headerName: "Address",
    width: 250,
    valueGetter: fullAddressValueGetter,
  },
  {
    field: "is_active",
    headerName: "Status",
    width: 100,
    cellRenderer: ActiveStatusCellRenderer,
  },
  {
    field: "actions",
    headerName: "Actions",
    width: 120,
    sortable: false,
    filter: false,
    cellRenderer: ActionsCellRenderer,
  },
];
