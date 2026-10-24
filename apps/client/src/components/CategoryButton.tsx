import type { LucideIcon } from 'lucide-react';

export function CategoryButton({
  icon: Icon, label, active, accent, onClick, size = 'md'
}: {
  icon: LucideIcon; label: string; active: boolean; accent: string; onClick: () => void; size?: 'sm' | 'md';
}) {
  const pad = size === 'sm' ? 'px-3.5 py-2 text-[.78rem]' : 'px-4.5 py-2.5 text-[.85rem]';
  const iconSize = size === 'sm' ? 15 : 17;
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-2 ${pad} rounded-2xl border font-bold transition-all duration-200
        ${active
          ? 'text-white shadow-md'
          : 'bg-[var(--card)] text-[var(--text)] border-[var(--line)] hover:border-[color:var(--btn-accent)] hover:-translate-y-0.5 hover:shadow-sm'}`}
      style={active
        ? { background: accent, borderColor: accent }
        : ({ '--btn-accent': accent } as React.CSSProperties)}
    >
      <Icon size={iconSize} strokeWidth={2.25} color={active ? '#fff' : accent} />
      {label}
    </button>
  );
}
