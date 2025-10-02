import type { ColDef } from "ag-grid-community";
import { ContactCellRenderer } from "../../cell_renderers/ContactCellRenderer";

export const customerColDefs: ColDef[] = [
     {
        headerName: "Contact Info",
        field: "contact",
        sortable: false,
        filter: false,
        flex: 2,
        minWidth: 200,
        cellRenderer: ContactCellRenderer,
      },
  {
    headerName: "Customer Name",
    field: "customer_name",
    sortable: true,
    filter: true,
    flex: 2,
    minWidth: 180,
  },
  {
    headerName: "Location",
    field: "location",
    sortable: true,
    filter: true,
    flex: 1,
    minWidth: 150,
    valueGetter: (params) => {
      const city = params.data?.city;
      const state = params.data?.state;
      if (city && state) return `${city}, ${state}`;
      if (city) return city;
      if (state) return state;
      return "No location";
    },
  },
  {
    headerName: "Created",
    field: "created_at",
    sortable: true,
    filter: "agDateColumnFilter",
    flex: 1,
    minWidth: 120,
    valueFormatter: (params) => {
      if (!params.value) return "";
      return new Date(params.value).toLocaleDateString();
    },
  },
];
