import type {
  Configuracoes, MesaComStatus, Pedido, StatusPedido, Usuario
} from '@sol-e-lua/shared';

const BASE = '/api/v1';

export interface ProdutoAdmin {
  id: string; secaoId: number; nome: string; descricao: string | null;
  preco: number; tempoPreparo: string | null; disponivel: boolean; destaque: boolean;
}

function authHeaders(token: string | null): Record<string, string> {
  return token ? { Authorization: `Bearer ${token}` } : {};
}

async function request<T>(path: string, token: string | null, options?: RequestInit): Promise<T> {
  const headers: Record<string, string> = { 'Content-Type': 'application/json', ...authHeaders(token), ...(options?.headers as Record<string, string> | undefined) };
  const res = await fetch(`${BASE}${path}`, { ...options, headers });
  if (!res.ok) {
    const body = await res.json().catch(() => ({ error: 'Erro desconhecido' }));
    throw new Error(body.error ?? `Erro ${res.status}`);
  }
  return res.json();
}

export function createApi(token: string | null) {
  return {
    getMesas: () => request<MesaComStatus[]>('/mesas', token),
    createMesa: (rotulo: string) => request<MesaComStatus>('/mesas', token, { method: 'POST', body: JSON.stringify({ rotulo }) }),
    updateMesa: (id: number, rotulo: string) => request<MesaComStatus>(`/mesas/${id}`, token, { method: 'PATCH', body: JSON.stringify({ rotulo }) }),
    deleteMesa: (id: number) => request<{ ok: true }>(`/mesas/${id}`, token, { method: 'DELETE' }),
    fecharMesa: (id: number) => request<MesaComStatus>(`/mesas/${id}/fechar`, token, { method: 'POST' }),
    liberarMesa: (id: number) => request<MesaComStatus>(`/mesas/${id}/liberar`, token, { method: 'POST' }),

    getPedidos: (status?: StatusPedido) => request<Pedido[]>(`/pedidos${status ? `?status=${status}` : ''}`, token),
    getPedido: (id: number) => request<Pedido>(`/pedidos/${id}`, token),
    avancarStatus: (id: number) => request<Pedido>(`/pedidos/${id}/status`, token, { method: 'PATCH' }),

    getProdutosAdmin: () => request<ProdutoAdmin[]>('/produtos', token),
    updateProduto: (id: string, data: Partial<Pick<ProdutoAdmin, 'nome' | 'descricao' | 'preco' | 'disponivel'>>) =>
      request<{ ok: true }>(`/produtos/${id}`, token, { method: 'PATCH', body: JSON.stringify(data) }),
    toggleDisponibilidade: (id: string, disponivel: boolean) =>
      request<{ ok: true }>(`/produtos/${id}/disponibilidade`, token, { method: 'PATCH', body: JSON.stringify({ disponivel }) }),

    getUsuarios: () => request<Usuario[]>('/usuarios', token),
    createUsuario: (data: { nome: string; usuario: string; senha: string; papel: string }) =>
      request<Usuario>('/usuarios', token, { method: 'POST', body: JSON.stringify(data) }),
    updateUsuario: (id: string, data: Partial<{ nome: string; usuario: string; papel: string; senha: string }>) =>
      request<Usuario>(`/usuarios/${id}`, token, { method: 'PATCH', body: JSON.stringify(data) }),
    toggleUsuarioAtivo: (id: string, ativo: boolean) =>
      request<{ ok: true }>(`/usuarios/${id}/ativo`, token, { method: 'PATCH', body: JSON.stringify({ ativo }) }),
    deleteUsuario: (id: string) => request<{ ok: true }>(`/usuarios/${id}`, token, { method: 'DELETE' }),

    getConfiguracoes: () => request<Configuracoes>('/configuracoes', token),
    updateConfiguracoes: (data: Partial<Configuracoes>) =>
      request<Configuracoes>('/configuracoes', token, { method: 'PATCH', body: JSON.stringify(data) }),

    getResumo: () => request<{ total: number; pendentes: number; preparo: number; ocupadas: number; totalMesas: number; faturamento: number }>('/relatorios/resumo', token),
    getPedidosPorHora: () => request<Record<number, number>>('/relatorios/pedidos-por-hora', token),
    getProdutosMaisVendidos: () => request<{ nome: string; quantidade: number }[]>('/relatorios/produtos-mais-vendidos', token),
    getMesasMaisUsadas: () => request<{ mesaId: number; quantidade: number }[]>('/relatorios/mesas-mais-usadas', token)
  };
}
