import iconSrc from '../assets/sol-lua-icon.png';
import { useSession } from '../lib/SessionContext';

export function ThemeToggle() {
  const { isDark, toggleTheme } = useSession();
  return (
    <button
      onClick={toggleTheme}
      title="Alternar aparência"
      className="relative w-[42px] h-[42px] rounded-full flex items-center justify-center transition-transform duration-300 hover:scale-110 hover:-rotate-6 active:scale-90"
    >
      <span
        className="absolute -inset-1.5 rounded-full blur-[4px] opacity-40 animate-[glowPulse_2.4s_ease-in-out_infinite]"
        style={{ background: 'radial-gradient(circle, var(--accent) 0%, transparent 72%)' }}
      />
      <img
        src={iconSrc}
        alt="Alternar aparência"
        className="relative z-10 w-full h-full rounded-full transition-[filter] duration-300"
        style={isDark ? { filter: 'invert(1) brightness(1.5)' } : undefined}
      />
    </button>
  );
}
