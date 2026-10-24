// ============================================================
// Tipos compartilhados entre server, client (cardápio) e dashboard
// ============================================================

export type CategoriaChave = 'drinks' | 'bebidas' | 'petiscos' | 'pratos' | 'sobremesas';

export type StatusPedido = 'novo' | 'preparando' | 'pronto' | 'entregue' | 'finalizado';

export type StatusMesaDerivado = 'livre' | 'aguardando' | 'andamento' | 'pronto' | 'ocupada';

export type Papel = 'admin' | 'cozinha' | 'recepcao';

export type MetodoIdentificacaoMesa = 'qr' | 'manual' | 'both';

export const NEXT_STATUS: Record<Exclude<StatusPedido, 'finalizado'>, StatusPedido> = {
  novo: 'preparando',
  preparando: 'pronto',
  pronto: 'entregue',
  entregue: 'finalizado'
};

export const NEXT_STATUS_LABEL: Record<Exclude<StatusPedido, 'finalizado'>, string> = {
  novo: 'Iniciar preparo',
  preparando: 'Marcar como pronto',
  pronto: 'Marcar como entregue',
  entregue: 'Finalizar pedido'
};

export const STATUS_LABEL: Record<StatusPedido, string> = {
  novo: 'Novo',
  preparando: 'Em preparo',
  pronto: 'Pronto',
  entregue: 'Entregue',
  finalizado: 'Finalizado'
};

export const CATEGORIA_META: Record<CategoriaChave, { label: string; icon: string; hex: string }> = {
  drinks: { label: 'Drinks', icon: '🍹', hex: '#4FA9A0' },
  bebidas: { label: 'Bebidas', icon: '🥤', hex: '#5C7CBF' },
  petiscos: { label: 'Petiscos', icon: '🍟', hex: '#C1502E' },
  pratos: { label: 'Pratos', icon: '🍽️', hex: '#7A3B24' },
  sobremesas: { label: 'Sobremesas', icon: '🍰', hex: '#C46A82' }
};

// ---------------- Permissões por papel ----------------
export interface Permissoes {
  manageUsers: boolean;
  manageSettings: boolean;
  manageTables: boolean;
  manageMenu: boolean;
  changePrices: boolean;
  toggleAvailability: boolean;
  manualOrder: boolean;
  closeMesa: boolean;
  viewReports: boolean;
}

export const ROLE_PERMISSIONS: Record<Papel, Permissoes> = {
  admin: {
    manageUsers: true, manageSettings: true, manageTables: true, manageMenu: true,
    changePrices: true, toggleAvailability: true, manualOrder: true, closeMesa: true, viewReports: true
  },
  cozinha: {
    manageUsers: false, manageSettings: false, manageTables: false, manageMenu: false,
    changePrices: false, toggleAvailability: false, manualOrder: false, closeMesa: false, viewReports: false
  },
  recepcao: {
    manageUsers: false, manageSettings: false, manageTables: false, manageMenu: false,
    changePrices: false, toggleAvailability: false, manualOrder: true, closeMesa: true, viewReports: false
  }
};

// ---------------- Entidades ----------------
export interface Usuario {
  id: string;
  nome: string;
  usuario: string;
  papel: Papel;
  ativo: boolean;
}

export interface Mesa {
  id: number;
  rotulo: string;
  clienteAtual: string | null;
  statusManual: 'aguardando' | null;
}

export interface MesaComStatus extends Mesa {
  status: StatusMesaDerivado;
  pedidoAtualId: number | null;
}

export interface SecaoCardapio {
  id: number;
  titulo: string;
  categoriaChave: CategoriaChave;
  icone: string | null;
  corHex: string | null;
  ordem: number;
}

export interface Produto {
  id: string;
  secaoId: number;
  nome: string;
  descricao: string | null;
  preco: number;
  tempoPreparo: string | null;
  disponivel: boolean;
  destaque: boolean;
}

export interface ItemPedido {
  id: string;
  produtoId: string;
  nomeProduto: string;
  precoUnit: number;
  categoriaChave: CategoriaChave;
  quantidade: number;
}

export interface TimelineEntry {
  status: string;
  criadoEm: string; // ISO
}

export interface Pedido {
  id: number;
  mesaId: number;
  clienteNome: string;
  observacao: string | null;
  status: StatusPedido;
  total: number;
  criadoEm: string; // ISO
  atualizadoEm: string; // ISO
  itens: ItemPedido[];
  timeline: TimelineEntry[];
}

export interface Configuracoes {
  restaurantName: string;
  address: string;
  phone: string;
  hours: string;
  tableIdMethod: MetodoIdentificacaoMesa;
  soundEnabled: boolean;
  restaurantOpen: boolean;
}

// ---------------- Payloads de requisição ----------------
export interface CriarPedidoItemInput {
  produtoId: string;
  quantidade: number;
}

export interface CriarPedidoInput {
  mesaId: number;
  clienteNome: string;
  observacao?: string;
  itens: CriarPedidoItemInput[];
}

export interface LoginInput {
  usuario: string;
  senha: string;
}

export interface LoginResponse {
  token: string;
  usuario: Usuario;
}

// ---------------- Eventos WebSocket ----------------
export type WsEvent =
  | { type: 'pedido:novo'; payload: Pedido }
  | { type: 'pedido:status'; payload: { pedidoId: number; status: StatusPedido; timeline: TimelineEntry[] } }
  | { type: 'mesa:atualizada'; payload: MesaComStatus }
  | { type: 'produto:disponibilidade'; payload: { produtoId: string; disponivel: boolean } }
  | { type: 'configuracao:atualizada'; payload: Configuracoes };

export function deriveMesaStatus(pedidosAtivos: Pick<Pedido, 'status'>[], statusManual: 'aguardando' | null): StatusMesaDerivado {
  if (pedidosAtivos.length === 0) return statusManual ?? 'livre';
  if (pedidosAtivos.some(p => p.status === 'pronto')) return 'pronto';
  if (pedidosAtivos.some(p => p.status === 'novo' || p.status === 'preparando')) return 'andamento';
  return 'ocupada';
}

export function orderTotal(itens: Pick<ItemPedido, 'precoUnit' | 'quantidade'>[]): number {
  return itens.reduce((sum, it) => sum + it.precoUnit * it.quantidade, 0);
}
