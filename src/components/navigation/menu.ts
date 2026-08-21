import { NavItem } from "@/components/navigation/navigation.types";
import { BookOpen, LayoutDashboard, Settings } from "lucide-react";

export const navItems: NavItem[] = [
  {
    id: "dashboard",
    label: "Tableau de bord",
    icon: LayoutDashboard,
    href: "/",
  },
  {
    id: "classeurs",
    label: "Mes classeurs",
    icon: BookOpen,
    href: "/classeurs",
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
