import { NavItem } from "@/components/navigation/navigation.types";
import { FileText, LayoutDashboard, Settings } from "lucide-react";

export const navItems: NavItem[] = [
  {
    id: "dashboard",
    label: "Tableau de bord",
    icon: LayoutDashboard,
    href: "/",
  },
  {
    id: "list-fiches",
    label: "Fiches",
    icon: FileText,
    href: "/fiches",
  },
];

export const adminNavItems: NavItem[] = [
  {
    id: "admin-users",
    label: "Utilisateurs",
    icon: Settings,
    href: "/admin/users",
  },
];
