import 'dotenv/config';
import { randomUUID } from 'node:crypto';
import { db } from './db/client.js';
import { categorias, secoesCardapio, produtos, mesas, usuarios } from './db/schema.js';
import { hashPassword } from './lib/auth.js';
import { MENU } from './db/menuData.js';
import { CATEGORIA_META, type CategoriaChave } from '@sol-e-lua/shared';

// Mesma lógica de mapeamento seção → categoria de produção usada no protótipo
const SECTION_PRODCAT: Record<string, CategoriaChave> = {
  'Petiscos': 'petiscos', 'Caldos': 'petiscos', 'Porções': 'petiscos',
  'Pratos Principais': 'pratos', 'Tapiocas': 'pratos', 'Sobremesas': 'sobremesas',
  'Cafés': 'bebidas', 'Diversos': 'bebidas',
  'Destilados & Vinhos': 'drinks', 'Cervejas': 'drinks', 'Drinks Clássicos': 'drinks', 'Drinks sem Álcool': 'drinks'
};

async function main() {
  console.log('Seeding banco de dados...');

  // 1. Categorias de produção
  for (const [chave, meta] of Object.entries(CATEGORIA_META)) {
    await db.insert(categorias)
      .values({ chave, rotulo: meta.label, icone: meta.icon, corHex: meta.hex })
      .onDuplicateKeyUpdate({ set: { rotulo: meta.label, icone: meta.icon, corHex: meta.hex } });
  }
  console.log('✓ categorias');

  // 2. Seções do cardápio + produtos
  const allSections = [...MENU.sol, ...MENU.lua];
  let ordem = 0;
  let totalProdutos = 0;
  for (const secao of allSections) {
    const categoriaChave = SECTION_PRODCAT[secao.title] ?? 'petiscos';
    const [inserted] = await db.insert(secoesCardapio).values({
      titulo: secao.title,
      categoriaChave,
      icone: secao.icon ?? null,
      corHex: secao.accent ?? null,
      ordem: ordem++
    });
    const secaoId = inserted.insertId;

    for (const item of secao.items as any[]) {
      await db.insert(produtos).values({
        id: randomUUID(),
        secaoId,
        nome: item.name,
        descricao: item.desc ?? null,
        preco: Number(item.price).toFixed(2),
        tempoPreparo: null,
        disponivel: true,
        destaque: false
      });
      totalProdutos++;
    }
  }
  console.log(`✓ ${allSections.length} seções, ${totalProdutos} produtos`);

  // 3. 20 mesas
  for (let i = 1; i <= 20; i++) {
    await db.insert(mesas).values({ rotulo: `Mesa ${String(i).padStart(2, '0')}` });
  }
  console.log('✓ 20 mesas');

  // 4. Usuário administrador padrão
  const senhaHash = await hashPassword('123');
  await db.insert(usuarios).values({
    id: randomUUID(),
    nome: 'Renata Sousa',
    usuario: 'soleluacafe',
    senhaHash,
    papel: 'admin',
    ativo: true
  });
  console.log('✓ usuário admin (soleluacafe / 123)');

  console.log('\nSeed concluído com sucesso.');
  process.exit(0);
}

main().catch(err => {
  console.error('Erro no seed:', err);
  process.exit(1);
});
