'use client';

import { usePathname } from 'next/navigation';
import { Navigation } from './Navigation';

interface ConditionalNavigationProps {
  children: React.ReactNode;
}

export function ConditionalNavigation({ children }: ConditionalNavigationProps) {
  const pathname = usePathname();
  
  // Routes that should NOT have navigation
  const noNavigationRoutes = [
    '/signin',
    '/signup', 
    '/forgot-password',
    '/reset-password',
    '/', // Landing page
    '/api',
    '/deployment-test'
  ];

  // Check if current path should have navigation
  const shouldShowNavigation = !noNavigationRoutes.some(route => 
    pathname === route || pathname.startsWith(route + '/')
  );

  if (shouldShowNavigation) {
    return <Navigation>{children}</Navigation>;
  }

  return <>{children}</>;
}