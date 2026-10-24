import { randomUUID } from 'node:crypto';
import { eq, inArray } from 'drizzle-orm';
import { db } from '../db/client.js';
import { pedidos, itensPedido, pedidoTimeline, produtos } from '../db/schema.js';
import { NEXT_STATUS, STATUS_LABEL, orderTotal, type CriarPedidoInput, type Pedido, type StatusPedido } from '@sol-e-lua/shared';

export async function buildPedidoDTO(pedidoId: number): Promise<Pedido | null> {
  const [pedido] = await db.select().from(pedidos).where(eq(pedidos.id, pedidoId));
  if (!pedido) return null;
  const itens = await db.select().from(itensPedido).where(eq(itensPedido.pedidoId, pedidoId));
  const timeline = await db.select().from(pedidoTimeline).where(eq(pedidoTimeline.pedidoId, pedidoId));

  return {
    id: pedido.id,
    mesaId: pedido.mesaId,
    clienteNome: pedido.clienteNome,
    observacao: pedido.observacao,
    status: pedido.status,
    total: Number(pedido.total),
    criadoEm: pedido.criadoEm.toISOString(),
    atualizadoEm: pedido.atualizadoEm.toISOString(),
    itens: itens.map(it => ({
      id: it.id,
      produtoId: it.produtoId,
      nomeProduto: it.nomeProduto,
      precoUnit: Number(it.precoUnit),
      categoriaChave: it.categoriaChave as Pedido['itens'][number]['categoriaChave'],
      quantidade: it.quantidade
    })),
    timeline: timeline
      .sort((a, b) => a.criadoEm.getTime() - b.criadoEm.getTime())
      .map(t => ({ status: t.status, criadoEm: t.criadoEm.toISOString() }))
  };
}

export async function listPedidos(filtro?: { status?: StatusPedido }) {
  const rows = filtro?.status
    ? await db.select().from(pedidos).where(eq(pedidos.status, filtro.status))
    : await db.select().from(pedidos);
  return Promise.all(rows.map(r => buildPedidoDTO(r.id)));
}

/**
 * Cria um pedido. Preços SEMPRE recalculados a partir do banco (nunca confiar no valor
 * enviado pelo cliente) — evita que alguém manipule a requisição e pague menos.
 */
export async function criarPedido(input: CriarPedidoInput): Promise<Pedido> {
  if (input.itens.length === 0) throw new Error('Pedido precisa ter ao menos um item');

  const produtoIds = input.itens.map(i => i.produtoId);
  const produtosDb = await db.select().from(produtos).where(inArray(produtos.id, produtoIds));
  const produtoMap = new Map(produtosDb.map(p => [p.id, p]));

  const itensResolvidos = input.itens.map(i => {
    const p = produtoMap.get(i.produtoId);
    if (!p) throw new Error(`Produto ${i.produtoId} não encontrado`);
    if (!p.disponivel) throw new Error(`"${p.nome}" está indisponível no momento`);
    return {
      produtoId: p.id,
      nomeProduto: p.nome,
      precoUnit: Number(p.preco),
      categoriaChave: p.secaoId, // corrigido abaixo via join de seção -> categoria
      quantidade: i.quantidade
    };
  });

  // resolve categoria de produção de cada item via seção do produto
  const { secoesCardapio } = await import('../db/schema.js');
  const secaoIds = [...new Set(produtosDb.map(p => p.secaoId))];
  const secoesDb = await db.select().from(secoesCardapio).where(inArray(secoesCardapio.id, secaoIds));
  const secaoMap = new Map(secoesDb.map(s => [s.id, s.categoriaChave]));

  const itensFinal = itensResolvidos.map((it, idx) => ({
    ...it,
    categoriaChave: secaoMap.get(produtosDb[idx]!.secaoId) ?? 'petiscos'
  }));

  const total = orderTotal(itensFinal);

  const [inserted] = await db.insert(pedidos).values({
    mesaId: input.mesaId,
    clienteNome: input.clienteNome,
    observacao: input.observacao ?? null,
    status: 'novo',
    total: total.toFixed(2)
  });
  const pedidoId = inserted.insertId;

  await db.insert(itensPedido).values(
    itensFinal.map(it => ({
      id: randomUUID(),
      pedidoId,
      produtoId: it.produtoId,
      nomeProduto: it.nomeProduto,
      precoUnit: it.precoUnit.toFixed(2),
      categoriaChave: it.categoriaChave,
      quantidade: it.quantidade
    }))
  );

  await db.insert(pedidoTimeline).values({
    id: randomUUID(),
    pedidoId,
    status: STATUS_LABEL.novo
  });

  const dto = await buildPedidoDTO(pedidoId);
  if (!dto) throw new Error('Falha ao montar pedido recém-criado');
  return dto;
}

export async function avancarStatus(pedidoId: number): Promise<Pedido> {
  const [pedido] = await db.select().from(pedidos).where(eq(pedidos.id, pedidoId));
  if (!pedido) throw new Error('Pedido não encontrado');
  if (pedido.status === 'finalizado') throw new Error('Pedido já está finalizado');

  const proximo = NEXT_STATUS[pedido.status as Exclude<StatusPedido, 'finalizado'>];
  await db.update(pedidos).set({ status: proximo }).where(eq(pedidos.id, pedidoId));
  await db.insert(pedidoTimeline).values({
    id: randomUUID(),
    pedidoId,
    status: STATUS_LABEL[proximo]
  });

  const dto = await buildPedidoDTO(pedidoId);
  if (!dto) throw new Error('Falha ao montar pedido atualizado');
  return dto;
}

export async function finalizarPedidosDaMesa(mesaId: number): Promise<void> {
  const ativos = await db.select().from(pedidos).where(eq(pedidos.mesaId, mesaId));
  for (const p of ativos) {
    if (p.status !== 'finalizado') {
      await db.update(pedidos).set({ status: 'finalizado' }).where(eq(pedidos.id, p.id));
      await db.insert(pedidoTimeline).values({ id: randomUUID(), pedidoId: p.id, status: STATUS_LABEL.finalizado });
    }
  }
}
