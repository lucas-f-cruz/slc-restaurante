import type { Configuracoes, CriarPedidoInput, MesaComStatus, Pedido } from '@sol-e-lua/shared';

const BASE = '/api/v1';

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    ...options,
    headers: { 'Content-Type': 'application/json', ...(options?.headers ?? {}) }
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({ error: 'Erro desconhecido' }));
    throw new Error(body.error ?? `Erro ${res.status}`);
  }
  return res.json();
}

export interface SecaoComProdutos {
  id: number;
  titulo: string;
  categoriaChave: string;
  icone: string | null;
  corHex: string | null;
  produtos: {
    id: string; nome: string; descricao: string | null; preco: number;
    tempoPreparo: string | null; disponivel: boolean; destaque: boolean;
  }[];
}

export const api = {
  getMenu: () => request<SecaoComProdutos[]>('/menu'),
  getConfiguracoes: () => request<Configuracoes>('/configuracoes'),
  getMesa: (id: number) => request<MesaComStatus>(`/mesas/${id}`),
  criarPedido: (input: CriarPedidoInput) =>
    request<Pedido>('/pedidos', { method: 'POST', body: JSON.stringify(input) })
};
