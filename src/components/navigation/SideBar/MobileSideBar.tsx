'use client'

import { useNavigation, navItems, SideBarItem } from "@/components/navigation";
import { X } from "lucide-react";

export function MobileSideBar({ title }: { title: string }) {
  const { isMobileOpen, closeMobile } = useNavigation();

  if (!isMobileOpen) return null;

  return (
    <>
      <div
        className="fixed inset-0 bg-black/50 z-40 lg:hidden animate-fade-in"
        onClick={closeMobile}
      />

      <aside className="fixed left-0 top-0 h-full w-64 bg-menu text-white z-50 lg:hidden shadow-2xl animate-slide-in">
        <div className="h-16 flex items-center justify-between px-4 border-b border-menu-hover">
          <span className="text-xl font-bold">{title}</span>
          <button
            onClick={closeMobile}
            className="p-2 rounded-lg hover:bg-menu-hover transition-colors"
            aria-label="Fermer le menu"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <nav className="overflow-y-auto h-[calc(100vh-4rem)] px-3 py-4 space-y-1">
          {navItems.map((item) => (
            <SideBarItem key={item.id} item={item} />
          ))}
        </nav>
      </aside>
    </>
  );
}
