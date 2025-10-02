'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

type MenuOrientation = 'vertical' | 'horizontal';

interface NavigationContextType {
  menuOrientation: MenuOrientation;
  setMenuOrientation: (orientation: MenuOrientation) => void;
}

const NavigationContext = createContext<NavigationContextType | undefined>(undefined);

export function NavigationProvider({ children }: { children: React.ReactNode }) {
  const [menuOrientation, setMenuOrientationState] = useState<MenuOrientation>('vertical');

  // Load preference from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('menu-orientation');
    if (saved === 'vertical' || saved === 'horizontal') {
      setMenuOrientationState(saved);
    }
  }, []);

  // Save preference to localStorage when it changes
  const setMenuOrientation = (orientation: MenuOrientation) => {
    setMenuOrientationState(orientation);
    localStorage.setItem('menu-orientation', orientation);
  };

  return (
    <NavigationContext.Provider value={{ menuOrientation, setMenuOrientation }}>
      {children}
    </NavigationContext.Provider>
  );
}

export function useNavigation() {
  const context = useContext(NavigationContext);
  if (context === undefined) {
    throw new Error('useNavigation must be used within a NavigationProvider');
  }
  return context;
}