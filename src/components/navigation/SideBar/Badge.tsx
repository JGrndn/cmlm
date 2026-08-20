export function Badge({ value, collapsed }: { value: number | 'new'; collapsed?: boolean }) {
  if (collapsed) {
    return (
      <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
    );
  }

  if (value === 'new') {
    return (
      <span className="px-1.5 py-0.5 text-[10px] font-semibold bg-red-500 text-white rounded uppercase">
        New
      </span>
    );
  }

  return (
    <span className="px-1.5 py-0.5 text-[11px] font-semibold bg-red-500 text-white rounded-full min-w-[20px] text-center">
      {value}
    </span>
  );
}
