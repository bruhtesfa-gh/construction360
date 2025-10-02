'use client';

import { useEffect, useState } from 'react';
import { ModuleRegistry, AllCommunityModule } from 'ag-grid-community';

// Import theme styles
import 'ag-grid-community/styles/ag-theme-quartz.css';

let isRegistered = false;

export function AGGridProvider({ children }: { children: React.ReactNode }) {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    
    // Register AG Grid modules on client side only, and only once
    if (typeof window !== 'undefined' && !isRegistered) {
      try {
        ModuleRegistry.registerModules([AllCommunityModule]);
        isRegistered = true;
      } catch (error) {
        console.error('Failed to register AG Grid modules:', error);
      }
    }
  }, []);

  // Don't render children until we're on the client to avoid hydration issues
  if (!isClient) {
    return null;
  }

  return <>{children}</>;
}