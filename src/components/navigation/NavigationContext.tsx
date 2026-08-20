'use client'

import { createContext, useContext } from "react";
import { NavigationContextType } from "@/components/navigation/navigation.types";

export const NavigationContext = createContext<NavigationContextType | null>(null);

export const useNavigation = () => {
  const context = useContext(NavigationContext);
  if (!context) {
    throw new Error('useNavigation must be used within NavigationProvider');
  }
  return context;
};
