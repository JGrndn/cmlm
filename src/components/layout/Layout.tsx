'use client'

import { MobileSideBar, TopBar, SideBar, useNavigation } from "@/components/navigation";

function LayoutContent({ children, title, platform }: {
  children: React.ReactNode;
  title: string;
  platform: string | undefined;
}) {
  const { isCollapsed } = useNavigation();

  return (
    <>
      <TopBar title={title} platform={platform} />
      <SideBar title={title} platform={platform} />
      <MobileSideBar title={title} />

      <main
        className={`
          transition-all duration-300 ease-in-out
          pt-16 lg:pt-0
          ${isCollapsed ? 'lg:ml-20' : 'lg:ml-64'}
        `}
      >
        <div className="p-3 sm:p-6">
          {children}
        </div>
      </main>
    </>
  );
}

export function Layout({ children, title, platform }: {
  children: React.ReactNode;
  title: string;
  platform: string | undefined;
}) {
  return (
    <div className="min-h-screen" style={{ backgroundColor: 'rgb(245, 246, 248)' }}>
      <LayoutContent title={title} platform={platform}>{children}</LayoutContent>
    </div>
  );
}
