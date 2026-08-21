'use client'

import { useNavigation } from "@/components/navigation";
import { Menu, LogOut, ChevronDown, User } from "lucide-react";
import Link from "next/link";
import { signOut, useSession } from "next-auth/react";
import { useState, useRef, useEffect } from "react";
import { UserRole } from "@/lib/domain/enums/user-role.enum";

const ROLE_LABELS: Record<string, string> = {
  [UserRole.ADMIN]: 'Administrateur',
  [UserRole.MANAGER]: 'Gestionnaire',
  [UserRole.CONTRIBUTOR]: 'Contributeur',
  [UserRole.VIEWER]: 'Lecteur',
};

export function TopBar({ title, platform }: { title: string; platform: string | undefined }) {
  const { toggleMobile } = useNavigation();
  const { data: session } = useSession();
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const isAdmin = session?.user?.role === UserRole.ADMIN;
  const roleLabel = ROLE_LABELS[session?.user?.role as string] ?? '';
  const avatarLetter = session?.user?.name?.[0]?.toUpperCase() ?? 'U';

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    if (isOpen) document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  return (
    <header className="lg:hidden fixed top-0 left-0 right-0 h-16 bg-blue-900 text-white flex items-center justify-between px-4 shadow-lg z-30">
      <button
        onClick={toggleMobile}
        className="p-2 rounded-lg hover:bg-blue-800 transition-colors"
        aria-label="Ouvrir le menu"
      >
        <Menu className="w-6 h-6" />
      </button>

      <Link href="/" className="text-xl font-bold">
        {title} <span className="text-base">{platform}</span>
      </Link>

      <div ref={menuRef} className="relative">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-1.5 p-1.5 rounded-lg hover:bg-blue-800 transition-colors"
        >
          <div className="w-8 h-8 rounded-full bg-blue-600 border-2 border-blue-400 flex items-center justify-center text-white text-sm font-semibold">
            {avatarLetter}
          </div>
          <ChevronDown className={`w-3.5 h-3.5 text-blue-200 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
        </button>

        {isOpen && (
          <div className="absolute right-0 top-full mt-2 w-56 bg-white rounded-lg shadow-xl z-50 border border-gray-200 overflow-hidden">
            <div className="px-4 py-3 border-b border-gray-100 bg-gray-50">
              <p className="text-sm font-semibold text-gray-900 truncate">{session?.user?.name}</p>
              <p className="text-xs text-gray-500 truncate">{session?.user?.email}</p>
              {roleLabel && (
                <span className="inline-block mt-1.5 px-2 py-0.5 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">
                  {roleLabel}
                </span>
              )}
            </div>

            <div className="py-1">
              <Link
                href="/profile"
                onClick={() => setIsOpen(false)}
                className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
              >
                <User className="w-4 h-4 text-gray-400" />
                Mon profil
              </Link>

              {isAdmin && (
                <Link
                  href="/admin/users"
                  onClick={() => setIsOpen(false)}
                  className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  <User className="w-4 h-4 text-gray-400" />
                  Gestion utilisateurs
                </Link>
              )}

              <div className="border-t border-gray-100 mt-1 pt-1">
                <button
                  onClick={() => signOut({ callbackUrl: '/signin' })}
                  className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  Déconnexion
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
