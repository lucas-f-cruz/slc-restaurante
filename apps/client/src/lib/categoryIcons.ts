import { Martini, CupSoda, UtensilsCrossed, ChefHat, IceCreamCone, type LucideIcon } from 'lucide-react';
import type { CategoriaChave } from '@sol-e-lua/shared';

export const CATEGORY_ICON: Record<CategoriaChave, LucideIcon> = {
  drinks: Martini,
  bebidas: CupSoda,
  petiscos: UtensilsCrossed,
  pratos: ChefHat,
  sobremesas: IceCreamCone
};
