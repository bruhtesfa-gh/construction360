import type {
  IServerSideDatasource,
  IServerSideGetRowsParams,
} from "ag-grid-community";

interface ContactsDataSourceOptions {
  endpoint?: string;
}

export class ContactsDataSource implements IServerSideDatasource {
  private readonly endpoint: string;

  constructor(options: ContactsDataSourceOptions = {}) {
    this.endpoint = options.endpoint ?? "/api/contacts";
  }

  async getRows(params: IServerSideGetRowsParams): Promise<void> {
    try {
      const response = await fetch(this.endpoint, {
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error(`Failed to load contacts: ${response.status}`);
      }

      const payload = await response.json();
      const rows = Array.isArray(payload) ? payload : [];
      params.success({
        rowData: rows,
        rowCount: rows.length,
      });
    } catch (error) {
      console.error("Error fetching contacts rows", error);
      params.fail();
    }
  }
}
