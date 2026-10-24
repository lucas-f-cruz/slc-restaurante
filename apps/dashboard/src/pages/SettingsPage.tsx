import { useEffect, useState } from 'react';
import { CircleDot } from 'lucide-react';
import type { Configuracoes, Papel, Usuario } from '@sol-e-lua/shared';
import { useAuth } from '../lib/AuthContext';
import { createApi } from '../lib/api';
import { useTheme } from '../lib/ThemeContext';
import { useToast } from '../lib/ToastContext';
import { initials } from '../lib/format';
import { Modal, Field } from './TablesPage';

const ROLE_LABEL: Record<Papel, string> = { admin: 'Administrador', cozinha: 'Cozinha', recepcao: 'Recepção' };
const TABS = [['restaurante', 'Restaurante'], ['pedidos', 'Pedidos'], ['mesas', 'Mesas'], ['cardapio', 'Cardápio'], ['usuarios', 'Usuários'], ['aparencia', 'Aparência']] as const;

export function SettingsPage({ onGoto }: { onGoto: (view: 'tables' | 'qrcodes' | 'menu') => void }) {
  const { token, usuario } = useAuth();
  const api = createApi(token);
  const [tab, setTab] = useState<typeof TABS[number][0]>('restaurante');
  const [config, setConfig] = useState<Configuracoes | null>(null);

  useEffect(() => { api.getConfiguracoes().then(setConfig); }, [token]);

  if (!config) return null;

  return (
    <div>
      <div className="mb-5">
        <h2 className="font-display text-2xl text-[var(--ink)]">Configurações</h2>
        <p className="text-[.82rem] opacity-60 mt-1">Preferências do sistema e do restaurante</p>
      </div>
      <div className="flex flex-wrap gap-2 mb-5">
        {TABS.map(([k, l]) => (
          <button key={k} onClick={() => setTab(k)} className={`px-3.5 py-1.5 rounded-full border text-[.76rem] font-bold
            ${tab === k ? 'bg-[var(--ink)] text-[var(--card)] border-[var(--ink)] dark:bg-[var(--accent)] dark:text-[#161F4C]' : 'border-[var(--line)] bg-[var(--card)]'}`}>
            {l}
          </button>
        ))}
      </div>

      {tab === 'restaurante' && <RestauranteTab config={config} api={api} onSaved={setConfig} />}
      {tab === 'pedidos' && <PedidosTab config={config} api={api} onSaved={setConfig} />}
      {tab === 'mesas' && <ShortcutTab text="Gerencie a lista de mesas diretamente na tela de Mesas." buttonLabel="🍽️ Ir para Mesas" onClick={() => onGoto('tables')} />}
      {tab === 'cardapio' && <ShortcutTab text="Categorias, produtos, preços e disponibilidade ficam na tela de Cardápio." buttonLabel="📖 Ir para Cardápio" onClick={() => onGoto('menu')} />}
      {tab === 'usuarios' && <UsuariosTab api={api} currentUserId={usuario?.id} />}
      {tab === 'aparencia' && <AparenciaTab />}
    </div>
  );
}

function Card({ children }: { children: React.ReactNode }) {
  return <div className="bg-[var(--card)] border border-[var(--line)] rounded-[20px] p-5 mb-4">{children}</div>;
}
function Row({ label, desc, children }: { label: string; desc: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-4 py-3 border-b border-[var(--line)] last:border-0">
      <div><div className="font-bold text-[.86rem]">{label}</div><div className="text-[.74rem] opacity-60 mt-0.5">{desc}</div></div>
      {children}
    </div>
  );
}
function Switch({ on, onClick }: { on: boolean; onClick: () => void }) {
  return (
    <div onClick={onClick} className="w-8.5 h-[19px] rounded-full relative cursor-pointer flex-shrink-0" style={{ background: on ? 'var(--st-pronto)' : 'var(--line)' }}>
      <div className="absolute top-0.5 w-[15px] h-[15px] rounded-full bg-white transition-transform" style={{ transform: on ? 'translateX(15px)' : 'translateX(2px)' }} />
    </div>
  );
}

function RestauranteTab({ config, api, onSaved }: { config: Configuracoes; api: ReturnType<typeof createApi>; onSaved: (c: Configuracoes) => void }) {
  const [form, setForm] = useState(config);
  const showToast = useToast();

  async function toggleOpen() {
    const nextOpen = !form.restaurantOpen;
    const c = await api.updateConfiguracoes({ restaurantOpen: nextOpen });
    setForm(c);
    onSaved(c);
    showToast(
      nextOpen ? 'Restaurante aberto. Novos pedidos estão liberados.' : 'Restaurante fechado. Novos pedidos estão bloqueados.',
      nextOpen ? 'success' : 'danger'
    );
  }

  return (
    <>
      <div
        className="rounded-[20px] p-5 mb-4 flex items-center justify-between gap-4 border-2 transition-colors"
        style={{
          background: form.restaurantOpen ? 'color-mix(in srgb, var(--st-pronto) 10%, var(--card))' : 'color-mix(in srgb, var(--st-recusado) 10%, var(--card))',
          borderColor: form.restaurantOpen ? 'var(--st-pronto)' : 'var(--st-recusado)'
        }}
      >
        <div className="flex items-center gap-3">
          <CircleDot size={22} strokeWidth={2.5} color={form.restaurantOpen ? 'var(--st-pronto)' : 'var(--st-recusado)'} />
          <div>
            <div className="font-display font-bold text-lg" style={{ color: form.restaurantOpen ? 'var(--st-pronto)' : 'var(--st-recusado)' }}>
              {form.restaurantOpen ? 'Restaurante aberto' : 'Restaurante fechado'}
            </div>
            <div className="text-[.76rem] opacity-70">
              {form.restaurantOpen ? 'O cardápio do cliente aceita novos pedidos.' : 'O cardápio do cliente está travado para novos pedidos.'}
            </div>
          </div>
        </div>
        <button
          onClick={toggleOpen}
          className="px-5 py-2.5 rounded-2xl font-extrabold text-[.82rem] text-white shadow-md transition-transform hover:scale-[1.03] active:scale-95"
          style={{ background: form.restaurantOpen ? 'var(--st-recusado)' : 'var(--st-pronto)' }}
        >
          {form.restaurantOpen ? 'Fechar restaurante' : 'Abrir restaurante'}
        </button>
      </div>
      <Card>
        <Field label="Nome do restaurante" value={form.restaurantName} onChange={v => setForm({ ...form, restaurantName: v })} placeholder="" />
        <div className="grid grid-cols-2 gap-3">
          <Field label="Telefone" value={form.phone} onChange={v => setForm({ ...form, phone: v })} placeholder="" />
          <Field label="Horário de funcionamento" value={form.hours} onChange={v => setForm({ ...form, hours: v })} placeholder="" />
        </div>
        <Field label="Endereço" value={form.address} onChange={v => setForm({ ...form, address: v })} placeholder="" />
        <button onClick={async () => { onSaved(await api.updateConfiguracoes(form)); showToast('Dados do restaurante salvos.'); }} className="px-4 py-2 rounded-[10px] font-bold text-[.82rem] bg-[var(--ink)] text-[var(--card)] hover:opacity-90 transition-opacity">Salvar</button>
      </Card>
    </>
  );
}

function PedidosTab({ config, api, onSaved }: { config: Configuracoes; api: ReturnType<typeof createApi>; onSaved: (c: Configuracoes) => void }) {
  const opts: [Configuracoes['tableIdMethod'], string, string][] = [
    ['qr', 'Somente QR Code', 'O cliente obrigatoriamente utiliza o QR Code da mesa.'],
    ['manual', 'Somente número da mesa', 'O cliente informa manualmente o número da mesa e o nome.'],
    ['both', 'QR Code + número da mesa', 'O cliente pode escolher qualquer uma das duas formas.']
  ];
  return (
    <>
      <Card>
        <h3 className="text-[.9rem] font-bold mb-1">Identificação da mesa</h3>
        <p className="text-[.74rem] opacity-60 mb-3">Define como o cliente se identifica ao abrir o cardápio</p>
        {opts.map(([k, l, d]) => (
          <div key={k} onClick={async () => onSaved(await api.updateConfiguracoes({ tableIdMethod: k }))} className="flex items-center gap-2.5 py-2.5 border-b border-[var(--line)] last:border-0 cursor-pointer">
            <div className="w-4.5 h-4.5 rounded-full border-2 relative flex-shrink-0" style={{ borderColor: config.tableIdMethod === k ? 'var(--accent)' : 'var(--line)' }}>
              {config.tableIdMethod === k && <div className="absolute inset-[3px] rounded-full bg-[var(--accent)]" />}
            </div>
            <div><div className="font-bold text-[.84rem]">{l}</div><div className="text-[.72rem] opacity-60">{d}</div></div>
          </div>
        ))}
      </Card>
      <Card>
        <Row label="Som de notificação" desc="Toca um alerta sonoro a cada novo pedido">
          <Switch on={config.soundEnabled} onClick={async () => onSaved(await api.updateConfiguracoes({ soundEnabled: !config.soundEnabled }))} />
        </Row>
      </Card>
    </>
  );
}

function ShortcutTab({ text, buttonLabel, onClick }: { text: string; buttonLabel: string; onClick: () => void }) {
  return (
    <Card>
      <p className="text-[.82rem] opacity-70 mb-4">{text}</p>
      <button onClick={onClick} className="px-4 py-2 rounded-[10px] border border-[var(--line)] font-bold text-[.82rem]">{buttonLabel}</button>
    </Card>
  );
}

function AparenciaTab() {
  const { isDark, toggleTheme } = useTheme();
  return (
    <Card>
      <Row label="Aparência" desc="Modo claro ou escuro do painel">
        <button onClick={toggleTheme} className="px-3 py-1.5 rounded-[10px] border border-[var(--line)] text-[.8rem] font-bold">{isDark ? '🌙 Escuro' : '☀️ Claro'}</button>
      </Row>
    </Card>
  );
}

function UsuariosTab({ api, currentUserId }: { api: ReturnType<typeof createApi>; currentUserId?: string }) {
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [adding, setAdding] = useState(false);
  const [editing, setEditing] = useState<Usuario | null>(null);
  const [form, setForm] = useState({ nome: '', usuario: '', senha: '', senha2: '', papel: 'recepcao' as Papel });
  const [error, setError] = useState<string | null>(null);

  async function load() { setUsuarios(await api.getUsuarios()); }
  useEffect(() => { load(); }, []);

  async function handleCreate() {
    setError(null);
    if (!form.nome || !form.usuario || !form.senha) return setError('Preencha nome, usuário e senha.');
    if (form.senha !== form.senha2) return setError('As senhas não coincidem.');
    try {
      await api.createUsuario({ nome: form.nome, usuario: form.usuario, senha: form.senha, papel: form.papel });
      setAdding(false); setForm({ nome: '', usuario: '', senha: '', senha2: '', papel: 'recepcao' });
      await load();
    } catch (err) { setError((err as Error).message); }
  }
  async function handleEdit() {
    if (!editing) return;
    setError(null);
    if (form.senha && form.senha !== form.senha2) return setError('As senhas não coincidem.');
    try {
      await api.updateUsuario(editing.id, { nome: form.nome, usuario: form.usuario, papel: form.papel, senha: form.senha || undefined });
      setEditing(null);
      await load();
    } catch (err) { setError((err as Error).message); }
  }
  async function handleToggle(u: Usuario) { try { await api.toggleUsuarioAtivo(u.id, !u.ativo); await load(); } catch (err) { setError((err as Error).message); } }
  async function handleDelete(u: Usuario) { try { await api.deleteUsuario(u.id); await load(); } catch (err) { setError((err as Error).message); } }

  return (
    <Card>
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-[.95rem] font-bold">Usuários do sistema</h3>
        <button onClick={() => { setForm({ nome: '', usuario: '', senha: '', senha2: '', papel: 'recepcao' }); setAdding(true); }}
          className="px-3 py-1.5 rounded-[10px] font-bold text-[.78rem] bg-[var(--ink)] text-[var(--card)]">+ Adicionar usuário</button>
      </div>
      {usuarios.map(u => (
        <div key={u.id} className="flex items-center gap-3 py-3 border-b border-[var(--line)] last:border-0">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[var(--accent)] to-[#C46A82] text-white flex items-center justify-center font-extrabold text-[.7rem] flex-shrink-0">{initials(u.nome)}</div>
          <div className="flex-1 min-w-0">
            <div className="font-bold text-[.86rem]">{u.nome} {!u.ativo && <span className="opacity-50 font-semibold">(desativado)</span>}</div>
            <div className="text-[.72rem] opacity-60">@{u.usuario} · <span className="tracking-widest opacity-50">••••••••</span></div>
          </div>
          <span className="text-[.65rem] font-extrabold uppercase px-2 py-0.5 rounded-full bg-[var(--bg-2)]">{ROLE_LABEL[u.papel]}</span>
          <button onClick={() => { setForm({ nome: u.nome, usuario: u.usuario, senha: '', senha2: '', papel: u.papel }); setEditing(u); }} className="px-2.5 py-1 rounded-[8px] border border-[var(--line)] text-[.72rem] font-bold">Editar</button>
          <button onClick={() => handleToggle(u)} className="px-2.5 py-1 rounded-[8px] border border-[var(--line)] text-[.72rem] font-bold">{u.ativo ? 'Desativar' : 'Ativar'}</button>
          <button onClick={() => handleDelete(u)} disabled={u.id === currentUserId} className="px-2.5 py-1 rounded-[8px] text-[.72rem] font-bold bg-[var(--st-recusado)] text-white disabled:opacity-30">Excluir</button>
        </div>
      ))}

      {(adding || editing) && (
        <Modal onClose={() => { setAdding(false); setEditing(null); setError(null); }}>
          <h2 className="font-display text-xl text-[var(--ink)] mb-4">{editing ? 'Editar usuário' : 'Adicionar usuário'}</h2>
          <Field label="Nome" value={form.nome} onChange={v => setForm({ ...form, nome: v })} placeholder="" />
          <div className="grid grid-cols-2 gap-3">
            <Field label="Usuário" value={form.usuario} onChange={v => setForm({ ...form, usuario: v })} placeholder="" />
            <div className="mb-3">
              <label className="block text-[.72rem] font-bold opacity-65 mb-1.5 uppercase tracking-wide">Função</label>
              <select value={form.papel} onChange={e => setForm({ ...form, papel: e.target.value as Papel })} className="w-full px-3 py-2.5 rounded-[9px] border border-[var(--line)] bg-[var(--bg-2)] text-[.85rem]">
                {Object.entries(ROLE_LABEL).map(([k, l]) => <option key={k} value={k}>{l}</option>)}
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Field label={editing ? 'Nova senha (opcional)' : 'Senha'} value={form.senha} onChange={v => setForm({ ...form, senha: v })} placeholder="" />
            <Field label="Confirmar senha" value={form.senha2} onChange={v => setForm({ ...form, senha2: v })} placeholder="" />
          </div>
          {error && <p className="text-[var(--st-recusado,#C1502E)] text-sm font-bold">{error}</p>}
          <div className="flex gap-2.5 mt-3">
            <button onClick={() => { setAdding(false); setEditing(null); }} className="px-4 py-2 rounded-[10px] border border-[var(--line)] font-bold text-[.82rem]">Cancelar</button>
            <button onClick={editing ? handleEdit : handleCreate} className="px-4 py-2 rounded-[10px] font-bold text-[.82rem] bg-[var(--ink)] text-[var(--card)]">Salvar</button>
          </div>
        </Modal>
      )}
    </Card>
  );
}
