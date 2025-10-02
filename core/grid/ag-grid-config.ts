// AG Grid configuration for Next.js
'use client';

import { AgGridReact } from 'ag-grid-react';
import { AllCommunityModule, ModuleRegistry } from 'ag-grid-community'; 

// Import only theme styles (v33+ uses Theming API)
import 'ag-grid-community/styles/ag-theme-quartz.css';

import { AllEnterpriseModule } from 'ag-grid-enterprise'; 
// Re-export commonly used types
export type { 
  ColDef, 
  GridApi, 
  GridReadyEvent, 
  SelectionChangedEvent,
  CellEditingStoppedEvent 
} from 'ag-grid-community';

ModuleRegistry.registerModules([ AllEnterpriseModule, AllCommunityModule ]); 

// Additional types for master-detail
export type IsRowMaster = (dataItem: any) => boolean;
export interface IDetailCellRendererParams {
  data: any;
  value: any;
  node: any;
  api: any;
}

export { AgGridReact };