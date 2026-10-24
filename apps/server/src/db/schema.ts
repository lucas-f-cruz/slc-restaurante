import {
  mysqlTable, varchar, int, boolean, datetime, decimal, text, mysqlEnum, primaryKey
} from 'drizzle-orm/mysql-core';
import { relations } from 'drizzle-orm';
import { sql } from 'drizzle-orm';

export const usuarios = mysqlTable('usuarios', {
  id: varchar('id', { length: 36 }).primaryKey(),
  nome: varchar('nome', { length: 120 }).notNull(),
  usuario: varchar('usuario', { length: 60 }).notNull().unique(),
  senhaHash: varchar('senha_hash', { length: 255 }).notNull(),
  papel: mysqlEnum('papel', ['admin', 'cozinha', 'recepcao']).notNull(),
  ativo: boolean('ativo').notNull().default(true),
  criadoEm: datetime('criado_em').notNull().default(sql`CURRENT_TIMESTAMP`)
});

export const mesas = mysqlTable('mesas', {
  id: int('id').autoincrement().primaryKey(),
  rotulo: varchar('rotulo', { length: 60 }).notNull(),
  clienteAtual: varchar('cliente_atual', { length: 120 }),
  statusManual: mysqlEnum('status_manual', ['aguardando']),
  criadoEm: datetime('criado_em').notNull().default(sql`CURRENT_TIMESTAMP`)
});

export const categorias = mysqlTable('categorias', {
  chave: varchar('chave', { length: 30 }).primaryKey(),
  rotulo: varchar('rotulo', { length: 60 }).notNull(),
  icone: varchar('icone', { length: 10 }),
  corHex: varchar('cor_hex', { length: 9 })
});

export const secoesCardapio = mysqlTable('secoes_cardapio', {
  id: int('id').autoincrement().primaryKey(),
  titulo: varchar('titulo', { length: 60 }).notNull(),
  categoriaChave: varchar('categoria_chave', { length: 30 }).notNull(),
  icone: varchar('icone', { length: 10 }),
  corHex: varchar('cor_hex', { length: 9 }),
  ordem: int('ordem').notNull().default(0)
});

export const produtos = mysqlTable('produtos', {
  id: varchar('id', { length: 36 }).primaryKey(),
  secaoId: int('secao_id').notNull(),
  nome: varchar('nome', { length: 120 }).notNull(),
  descricao: text('descricao'),
  preco: decimal('preco', { precision: 10, scale: 2 }).notNull(),
  tempoPreparo: varchar('tempo_preparo', { length: 20 }),
  disponivel: boolean('disponivel').notNull().default(true),
  destaque: boolean('destaque').notNull().default(false),
  criadoEm: datetime('criado_em').notNull().default(sql`CURRENT_TIMESTAMP`)
});

export const pedidos = mysqlTable('pedidos', {
  id: int('id').autoincrement().primaryKey(),
  mesaId: int('mesa_id').notNull(),
  clienteNome: varchar('cliente_nome', { length: 120 }).notNull(),
  observacao: text('observacao'),
  status: mysqlEnum('status', ['novo', 'preparando', 'pronto', 'entregue', 'finalizado']).notNull().default('novo'),
  total: decimal('total', { precision: 10, scale: 2 }).notNull(),
  criadoEm: datetime('criado_em').notNull().default(sql`CURRENT_TIMESTAMP`),
  atualizadoEm: datetime('atualizado_em').notNull().default(sql`CURRENT_TIMESTAMP`)
});

export const itensPedido = mysqlTable('itens_pedido', {
  id: varchar('id', { length: 36 }).primaryKey(),
  pedidoId: int('pedido_id').notNull(),
  produtoId: varchar('produto_id', { length: 36 }).notNull(),
  nomeProduto: varchar('nome_produto', { length: 120 }).notNull(),
  precoUnit: decimal('preco_unit', { precision: 10, scale: 2 }).notNull(),
  categoriaChave: varchar('categoria_chave', { length: 30 }).notNull(),
  quantidade: int('quantidade').notNull()
});

export const pedidoTimeline = mysqlTable('pedido_timeline', {
  id: varchar('id', { length: 36 }).primaryKey(),
  pedidoId: int('pedido_id').notNull(),
  status: varchar('status', { length: 30 }).notNull(),
  criadoEm: datetime('criado_em').notNull().default(sql`CURRENT_TIMESTAMP`)
});

export const configuracoes = mysqlTable('configuracoes', {
  chave: varchar('chave', { length: 60 }).primaryKey(),
  valor: text('valor')
});

// ---------------- Relations (usadas pelo Drizzle query builder) ----------------
export const pedidosRelations = relations(pedidos, ({ many, one }) => ({
  itens: many(itensPedido),
  timeline: many(pedidoTimeline),
  mesa: one(mesas, { fields: [pedidos.mesaId], references: [mesas.id] })
}));
export const itensPedidoRelations = relations(itensPedido, ({ one }) => ({
  pedido: one(pedidos, { fields: [itensPedido.pedidoId], references: [pedidos.id] })
}));
export const pedidoTimelineRelations = relations(pedidoTimeline, ({ one }) => ({
  pedido: one(pedidos, { fields: [pedidoTimeline.pedidoId], references: [pedidos.id] })
}));
export const produtosRelations = relations(produtos, ({ one }) => ({
  secao: one(secoesCardapio, { fields: [produtos.secaoId], references: [secoesCardapio.id] })
}));
export const secoesRelations = relations(secoesCardapio, ({ one, many }) => ({
  categoria: one(categorias, { fields: [secoesCardapio.categoriaChave], references: [categorias.chave] }),
  produtos: many(produtos)
}));
