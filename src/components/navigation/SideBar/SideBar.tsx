'use client'

import { navItems, adminNavItems, SideBarItem, AppVersion, useNavigation } from "@/components/navigation";
import { UserMenu } from "@/components/auth/UserMenu";
import { Menu } from "lucide-react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { UserRole } from "@/lib/domain/enums/user-role.enum";

export function SideBar({ title, platform }: { title: string; platform: string | undefined }) {
  const { isCollapsed, toggleCollapse } = useNavigation();
  const { data: session } = useSession();
  const isAdmin = session?.user?.role === UserRole.ADMIN;

  return (
    <aside
      className={`
        hidden lg:flex flex-col bg-menu text-white h-screen fixed left-0 top-0 shadow-xl
        transition-all duration-300 ease-in-out z-30
        ${isCollapsed ? 'w-20' : 'w-64'}
      `}
    >
      {/* Header */}
      <div className="h-16 flex items-center justify-between px-4 border-b border-menu-hover">
        {!isCollapsed && (
          <Link href="/" className="text-xl font-bold">
            {title} <span className="text-base">{platform}</span>
          </Link>
        )}
        <button
          onClick={toggleCollapse}
          className="p-2 rounded-lg hover:bg-menu-hover transition-colors"
          aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          <Menu className="w-5 h-5" />
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {navItems.map((item) => (
          <SideBarItem key={item.id} item={item} />
        ))}

        {isAdmin && (
          <>
            <div className={`pt-3 pb-1 ${isCollapsed ? 'px-1' : 'px-2'}`}>
              <div className="border-t border-menu-hover/50" />
              {!isCollapsed && (
                <p className="text-[10px] font-semibold uppercase tracking-widest text-blue-300/60 mt-2 px-2">
                  Administration
                </p>
              )}
            </div>
            {adminNavItems.map((item) => (
              <SideBarItem key={item.id} item={item} />
            ))}
          </>
        )}
      </nav>

      {/* User Menu */}
      <div className="border-t border-menu-hover p-3">
        <UserMenu collapsed={isCollapsed} />
      </div>

      {/* Version */}
      <AppVersion collapsed={isCollapsed} />
    </aside>
  );
}
