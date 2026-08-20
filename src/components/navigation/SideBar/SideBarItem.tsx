'use client'

import { ChevronDown } from "lucide-react";
import { NavItem, NavSubItem, Badge, useNavigation } from "@/components/navigation";
import Link from "next/link";
import { usePathname } from "next/navigation";

export function SideBarItem({ item }: { item: NavItem }) {
  const { isCollapsed, expandedItems, toggleExpanded, setActiveItem, closeMobile } = useNavigation();
  const pathname = usePathname();
  const isActive = pathname === item.href;
  const isExpanded = expandedItems.has(item.id);
  const hasSubItems = item.children && item.children.length > 0;
  const Icon = item.icon;

  const handleClick = (e: React.MouseEvent) => {
    if (hasSubItems) {
      e.preventDefault();
      toggleExpanded(item.id);
      setActiveItem(item.id);
    } else {
      setActiveItem(item.id);
      if (window.innerWidth < 1024) {
        closeMobile();
      }
    }
  };

  const hasActiveSubItem = hasSubItems && item.children!.some(child => pathname === child.href);
  const showAsActive = isActive || hasActiveSubItem;

  const buttonClasses = `
    w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 relative
    ${showAsActive ? 'bg-blue-600 text-white shadow-md' : 'text-gray-300 hover:bg-blue-800/50'}
    ${isCollapsed ? 'justify-center' : ''}
  `;

  const content = (
    <>
      <Icon className={`flex-shrink-0 ${isCollapsed ? 'w-6 h-6' : 'w-5 h-5'}`} />

      {!isCollapsed && (
        <>
          <span className="flex-1 text-left font-medium">{item.label}</span>
          {item.badge && <Badge value={item.badge} />}
          {hasSubItems && (
            <ChevronDown
              className={`w-4 h-4 transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`}
            />
          )}
        </>
      )}

      {isCollapsed && item.badge && <Badge value={item.badge} collapsed />}
    </>
  );

  return (
    <div className="relative group">
      {item.href && !hasSubItems ? (
        <Link
          href={item.href}
          onClick={handleClick}
          className={buttonClasses}
          title={isCollapsed ? item.label : undefined}
        >
          {content}
        </Link>
      ) : (
        <button
          onClick={handleClick}
          className={buttonClasses}
          title={isCollapsed ? item.label : undefined}
        >
          {content}
        </button>
      )}

      {/* Tooltip avec sous-menus en mode collapsed */}
      {isCollapsed && hasSubItems && (
        <div className="absolute left-full top-0 ml-2 w-56 bg-blue-800 rounded-lg shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
          <div className="p-2">
            <div className="px-3 py-2 text-xs font-semibold text-gray-400 uppercase tracking-wider">
              {item.label}
            </div>
            <div className="space-y-1">
              {item.children!.map((child) => {
                const isSubActive = pathname === child.href;
                return (
                  <Link
                    key={child.id}
                    href={child.href}
                    onClick={() => {
                      setActiveItem(child.id);
                      if (window.innerWidth < 1024) closeMobile();
                    }}
                    className={`
                      w-full flex items-center gap-2 px-3 py-2 rounded-md transition-all duration-200 text-sm
                      ${isSubActive ? 'bg-blue-600 text-white font-medium' : 'text-gray-300 hover:text-white hover:bg-blue-700'}
                    `}
                  >
                    <span className="flex-1 text-left">{child.label}</span>
                    {child.badge && <Badge value={child.badge} />}
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Sous-menus en mode normal */}
      {hasSubItems && isExpanded && !isCollapsed && (
        <div className="mt-1 ml-4 space-y-1 border-l-2 border-blue-800/50 pl-4">
          {item.children!.map((child) => (
            <SubItem key={child.id} item={child} />
          ))}
        </div>
      )}
    </div>
  );
}

function SubItem({ item }: { item: NavSubItem }) {
  const { setActiveItem, closeMobile } = useNavigation();
  const pathname = usePathname();
  const isActive = pathname === item.href;

  return (
    <Link
      href={item.href}
      onClick={() => {
        setActiveItem(item.id);
        if (window.innerWidth < 1024) closeMobile();
      }}
      className={`
        w-full flex items-center gap-2 px-3 py-2 rounded-md transition-all duration-200 text-sm
        ${isActive ? 'bg-blue-700 text-white font-medium' : 'text-gray-400 hover:text-white hover:bg-blue-800/30'}
      `}
    >
      <span className="flex-1 text-left">{item.label}</span>
      {item.badge && <Badge value={item.badge} />}
    </Link>
  );
}
