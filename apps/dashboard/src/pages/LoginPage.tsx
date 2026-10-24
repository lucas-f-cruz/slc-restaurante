import { useState } from 'react';
import iconSrc from '../assets/sol-lua-icon.png';
import { useAuth } from '../lib/AuthContext';

export function LoginPage() {
  const { login, loginError } = useAuth();
  const [usuario, setUsuario] = useState('');
  const [senha, setSenha] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try { await login(usuario, senha); } catch { /* erro exibido via loginError */ }
    setLoading(false);
  }

  return (
    <main className="h-screen w-full flex bg-white dark:bg-slate-950">
      {/* Painel de imagem — some em telas pequenas, aparece a partir de tablet/desktop */}
      <div className="hidden lg:flex flex-1 h-full relative items-center justify-center p-16 overflow-hidden bg-[#0F1638]">
        <div
          className="absolute inset-0 opacity-70"
          style={{ background: 'radial-gradient(circle at 30% 20%, #1c2560 0%, #0F1638 55%, #0a0f28 100%)' }}
        />
        <div
          className="absolute -top-24 -right-24 w-[420px] h-[420px] rounded-full blur-3xl opacity-30"
          style={{ background: 'radial-gradient(circle, #D9A85C 0%, transparent 70%)' }}
        />
        <div className="relative z-10 text-center max-w-sm">
          <img src={iconSrc} alt="Sol e Lua" className="w-44 h-44 mx-auto mb-8 invert brightness-150 drop-shadow-[0_0_40px_rgba(217,168,92,.25)]" />
          <h2 className="font-display text-3xl text-[#F4EFE3] mb-3">Sol e Lua Café</h2>
          <p className="text-[#CBD1E8]/70 text-[.92rem] leading-relaxed">
            Sistema de gestão completo — pedidos, cozinha, mesas e cardápio, tudo em tempo real,
            do celular do cliente até a tela da sua equipe.
          </p>
        </div>
      </div>

      {/* Painel do formulário — visual profissional, branco/azul */}
      <section className="flex flex-1 items-center justify-center p-6 bg-white dark:bg-slate-950">
        <form
          onSubmit={handleSubmit}
          className="w-full max-w-sm p-8 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm"
        >
          <img src={iconSrc} alt="Sol e Lua" className="w-12 h-12 mb-5 lg:hidden dark:invert dark:brightness-150" />

          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white mb-1.5">
            Entre com sua conta
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">
            Utilize seu usuário e senha do Sol e Lua Café para entrar
          </p>

          <div className="mb-4">
            <label htmlFor="usuario" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
              Usuário
            </label>
            <input
              id="usuario"
              value={usuario}
              onChange={e => setUsuario(e.target.value)}
              autoComplete="username"
              placeholder="soleluacafe"
              className="w-full px-3 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800
                text-slate-900 dark:text-white text-sm placeholder:text-slate-400
                transition-all focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500"
            />
          </div>

          <div className="mb-5">
            <label htmlFor="senha" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
              Senha
            </label>
            <input
              id="senha"
              type="password"
              value={senha}
              onChange={e => setSenha(e.target.value)}
              autoComplete="current-password"
              placeholder="Sua senha"
              className="w-full px-3 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800
                text-slate-900 dark:text-white text-sm placeholder:text-slate-400
                transition-all focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500"
            />
          </div>

          {loginError && (
            <p className="text-red-600 dark:text-red-400 text-sm font-medium mb-4">{loginError}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 rounded-lg font-semibold text-sm text-white bg-blue-600 hover:bg-blue-700
              disabled:opacity-50 disabled:cursor-not-allowed shadow-sm active:scale-[.98] transition-all"
          >
            {loading ? 'Entrando...' : 'Entrar'}
          </button>

          <p className="text-slate-400 dark:text-slate-500 text-center text-xs mt-5">
            Sistema de gestão Sol e Lua Café
          </p>
        </form>
      </section>
    </main>
  );
}
