import type { CategoriaChave } from '@sol-e-lua/shared';
import type { SecaoComProdutos } from '../lib/api';
import { CategoryButton } from './CategoryButton';
import { CATEGORY_ICON } from '../lib/categoryIcons';

export function CategoryTabs({ secoes, activeIndex, onSelect }: {
  secoes: SecaoComProdutos[]; activeIndex: number; onSelect: (i: number) => void;
}) {
  return (
    <nav className="max-w-[900px] mx-auto mt-6 flex flex-wrap justify-center gap-2.5 px-2">
      {secoes.map((s, i) => (
        <CategoryButton
          key={s.id}
          icon={CATEGORY_ICON[s.categoriaChave as CategoriaChave]}
          label={s.titulo}
          active={i === activeIndex}
          accent={s.corHex ?? '#E29A3C'}
          onClick={() => onSelect(i)}
        />
      ))}
    </nav>
  );
}
