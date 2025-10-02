'use client';

import dynamic from 'next/dynamic';

// Dynamic import to ensure DataGrid is only loaded on the client
export const ClientDataGrid = dynamic(
  () => import('./DataGrid').then(mod => mod.DataGrid),
  { 
    ssr: false,
    loading: () => (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading grid...</p>
        </div>
      </div>
    )
  }
);