'use client'

import { useEffect, useState } from "react";
import { NavigationContext } from "@/components/navigation/NavigationContext";

export function NavigationProvider({ children }: { children: React.ReactNode }) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [activeItemId, setActiveItemId] = useState<string | null>(null);
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setIsMobileOpen(false);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const toggleCollapse = () => setIsCollapsed(!isCollapsed);
  const toggleMobile = () => setIsMobileOpen(!isMobileOpen);
  const closeMobile = () => setIsMobileOpen(false);

  const toggleExpanded = (id: string) => {
    setExpandedItems(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  return (
    <NavigationContext.Provider
      value={{
        isCollapsed,
        isMobileOpen,
        activeItemId,
        expandedItems,
        toggleCollapse,
        toggleMobile,
        closeMobile,
        toggleExpanded,
        setActiveItem: setActiveItemId,
      }}
    >
      {children}
    </NavigationContext.Provider>
  );
}
