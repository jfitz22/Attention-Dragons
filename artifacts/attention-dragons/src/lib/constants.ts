import { Sword, Shield, Sparkles, ScrollText, FlaskConical, Package, type LucideIcon } from 'lucide-react';
import { InventoryItemCategory, InventoryItemRarity, InventoryItemRechargeOn } from '@workspace/api-client-react';

export const CATEGORY_MAP: Record<InventoryItemCategory, { label: string, icon: LucideIcon }> = {
  [InventoryItemCategory.weapons]: { label: 'Arms & Armaments', icon: Sword },
  [InventoryItemCategory.armor]: { label: 'Vestments', icon: Shield },
  [InventoryItemCategory.magic_items]: { label: 'Curios & Trinkets', icon: Sparkles },
  [InventoryItemCategory.scrolls]: { label: 'Arcane Scrolls', icon: ScrollText },
  [InventoryItemCategory.potions]: { label: 'Alchemical Stores', icon: FlaskConical },
  [InventoryItemCategory.misc]: { label: 'Mundane Goods', icon: Package },
};

export const RARITY_MAP: Record<NonNullable<InventoryItemRarity>, { label: string, colorClass: string }> = {
  [InventoryItemRarity.common]: { label: 'Common', colorClass: 'border-rarity-common text-rarity-common' },
  [InventoryItemRarity.uncommon]: { label: 'Uncommon', colorClass: 'border-rarity-uncommon text-rarity-uncommon' },
  [InventoryItemRarity.rare]: { label: 'Rare', colorClass: 'border-rarity-rare text-rarity-rare' },
  [InventoryItemRarity.very_rare]: { label: 'Very Rare', colorClass: 'border-rarity-very-rare text-rarity-very-rare' },
  [InventoryItemRarity.legendary]: { label: 'Legendary', colorClass: 'border-rarity-legendary text-rarity-legendary' },
};

export const RECHARGE_MAP: Record<NonNullable<InventoryItemRechargeOn>, string> = {
  [InventoryItemRechargeOn.short_rest]: 'Short Rest',
  [InventoryItemRechargeOn.long_rest]: 'Long Rest',
  [InventoryItemRechargeOn.dawn]: 'Dawn',
  [InventoryItemRechargeOn.never]: 'Never',
};
