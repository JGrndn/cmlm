import { LucideIcon } from "lucide-react";

export type NavSubItem = {
  id: string;
  label: string;
  href: string;
  badge?: number | 'new';
};

export type NavItem = {
  id: string;
  label: string;
  icon: LucideIcon;
  href?: string;
  badge?: number | 'new';
  children?: NavSubItem[];
};

export type NavigationContextType = {
  isCollapsed: boolean;
  isMobileOpen: boolean;
  activeItemId: string | null;
  expandedItems: Set<string>;
  toggleCollapse: () => void;
  toggleMobile: () => void;
  closeMobile: () => void;
  toggleExpanded: (id: string) => void;
  setActiveItem: (id: string) => void;
};
