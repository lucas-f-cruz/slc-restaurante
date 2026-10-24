import iconSrc from '../assets/sol-lua-icon.png';

export function LandingPage({ onGoClient }: { onGoClient: () => void }) {
  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <div className="max-w-[420px] w-full text-center p-11 bg-[var(--card)] border border-[var(--line)] rounded-[20px]">
        <img src={iconSrc} alt="Sol e Lua" className="w-[74px] h-[74px] mx-auto mb-4 dark:invert dark:brightness-150" />
        <h1 className="font-display text-2xl text-[var(--ink)] mb-1">Sol e Lua Café</h1>
        <div className="text-sm opacity-60 mb-7">Cardápio digital</div>
        <button
          onClick={onGoClient}
          className="w-full py-3 rounded-[10px] font-bold text-[.9rem] bg-[var(--ink)] text-[var(--card)]"
        >
          🍽️ Ver cardápio
        </button>
      </div>
    </div>
  );
}
