export function AppVersion({ collapsed }: { collapsed: boolean }) {
  const version = process.env.NEXT_PUBLIC_APP_VERSION;

  if (!version) return null;

  return (
    <div className="px-4 py-3 text-xs text-blue-200">
      {collapsed ? (
        <span title={`Version ${version}`}>v{version}</span>
      ) : (
        <span>Version {version}</span>
      )}
    </div>
  );
}
