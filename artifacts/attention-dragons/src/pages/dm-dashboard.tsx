import { useState } from 'react';
import { Link } from 'wouter';
import { useGetDmOverview, CharacterWithItems, InventoryItem, InventoryItemRarity } from '@workspace/api-client-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AddItemDialog } from '@/components/add-item-dialog';
import { EditCharacterDialog } from '@/components/edit-character-dialog';
import { QuestLogSection } from '@/components/quest-log-section';
import { useDefaultParty } from '@/hooks/use-default-party';
import { CATEGORY_MAP, RARITY_MAP, RECHARGE_MAP } from '@/lib/constants';
import { ArrowLeft, Crown, Settings, Edit, Backpack, Shield, Box, ChevronDown, ChevronUp, Package } from 'lucide-react';
import { ThemeSelector } from '@/components/theme-selector';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { cn } from '@/lib/utils';
import { ScrollArea } from '@/components/ui/scroll-area';

export default function DmDashboard() {
  const { data: characters = [], isLoading } = useGetDmOverview();
  const { partyId } = useDefaultParty();

  const [editingCharacter, setEditingCharacter] = useState<CharacterWithItems | null>(null);
  const [editingItem, setEditingItem] = useState<{ characterId: number; item: InventoryItem } | null>(null);
  const [viewingItem, setViewingItem] = useState<InventoryItem | null>(null);

  const [openSections, setOpenSections] = useState<Record<number, boolean>>({});

  const toggleSection = (id: number) => {
    setOpenSections(prev => ({ ...prev, [id]: prev[id] === undefined ? false : !prev[id] }));
  };

  const handleEditItem = (e: React.MouseEvent, characterId: number, item: InventoryItem) => {
    e.stopPropagation();
    setEditingItem({ characterId, item });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center text-primary font-display text-2xl animate-pulse">
        Gathering the Scrolls...
      </div>
    );
  }

  return (
    <div className="min-h-screen text-foreground pb-24 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between gap-4 mb-12">
          <div className="flex items-center gap-4">
            <Link href="/" className="p-2 rounded-full hover:bg-secondary text-muted-foreground hover:text-primary transition-colors">
              <ArrowLeft className="w-6 h-6" />
            </Link>
            <div className="flex items-center gap-3">
              <Crown className="w-8 h-8 text-primary" />
              <h1 className="text-3xl md:text-4xl font-display font-bold text-primary tracking-wide drop-shadow-md">
                Dungeon Master's Overview
              </h1>
            </div>
          </div>
          <ThemeSelector />
        </div>

        {/* Quest Log - DM can manage */}
        <div className="mb-12">
          {partyId !== null && <QuestLogSection partyId={partyId} isDm={true} />}
        </div>

        {/* Characters */}
        <div className="space-y-8">
          {characters.length === 0 ? (
            <div className="text-center py-24 bg-card/50 rounded-2xl border border-border">
              <p className="text-muted-foreground">No characters found in the campaign.</p>
            </div>
          ) : (
            characters.map(char => {
              const isOpen = openSections[char.id] ?? true;
              
              const equipped = char.items.filter(i => i.location === 'equipped' && !i.isConsumed);
              const carried = char.items.filter(i => i.location === 'carried' && !i.isConsumed);
              const stored = char.items.filter(i => i.location === 'stored' && !i.isConsumed);

              return (
                <Collapsible
                  key={char.id}
                  open={isOpen}
                  onOpenChange={() => toggleSection(char.id)}
                  className="bg-card/40 border border-border rounded-xl overflow-hidden shadow-lg"
                >
                  <div className="flex items-center justify-between p-4 sm:p-6 bg-secondary/30 border-b border-border/50">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-primary/50 bg-secondary flex-shrink-0">
                        <img 
                          src={char.avatarUrl || `${import.meta.env.BASE_URL}images/avatar-placeholder.png`} 
                          alt={char.name} 
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h2 className="text-2xl font-display font-bold text-foreground">{char.name}</h2>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-8 w-8 text-muted-foreground hover:text-primary"
                            onClick={(e) => { e.stopPropagation(); setEditingCharacter(char); }}
                          >
                            <Settings className="w-4 h-4" />
                          </Button>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          Lvl {char.level} {char.race} {char.characterClass} <span className="text-primary/70 ml-2 italic">Player: {char.playerName}</span>
                        </p>
                        {char.summary && (
                          <p className="text-xs text-muted-foreground/60 italic mt-0.5">{char.summary}</p>
                        )}
                      </div>
                    </div>
                    <CollapsibleTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        {isOpen ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                      </Button>
                    </CollapsibleTrigger>
                  </div>

                  <CollapsibleContent>
                    <div className="p-4 sm:p-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
                      
                      {/* Equipped */}
                      <div className="space-y-3">
                        <h3 className="text-lg font-display text-primary flex items-center gap-2 border-b border-primary/20 pb-2">
                          <Shield className="w-4 h-4" /> Equipped
                        </h3>
                        <ItemList 
                          items={equipped} 
                          onView={setViewingItem} 
                          onEdit={(e, item) => handleEditItem(e, char.id, item)} 
                        />
                      </div>

                      {/* Carried */}
                      <div className="space-y-3">
                        <h3 className="text-lg font-display text-accent flex items-center gap-2 border-b border-accent/20 pb-2">
                          <Backpack className="w-4 h-4" /> In Bag
                        </h3>
                        <ItemList 
                          items={carried} 
                          onView={setViewingItem} 
                          onEdit={(e, item) => handleEditItem(e, char.id, item)} 
                        />
                      </div>

                      {/* Stored */}
                      <div className="space-y-3">
                        <h3 className="text-lg font-display text-muted-foreground flex items-center gap-2 border-b border-border/50 pb-2">
                          <Box className="w-4 h-4" /> Stored
                        </h3>
                        <ItemList 
                          items={stored} 
                          onView={setViewingItem} 
                          onEdit={(e, item) => handleEditItem(e, char.id, item)} 
                        />
                      </div>

                    </div>
                  </CollapsibleContent>
                </Collapsible>
              );
            })
          )}
        </div>
      </div>

      {/* Editing modals */}
      {editingCharacter && (
        <EditCharacterDialog
          character={editingCharacter}
          open={!!editingCharacter}
          onOpenChange={(open) => !open && setEditingCharacter(null)}
        />
      )}

      {editingItem && (
        <AddItemDialog
          characterId={editingItem.characterId}
          open={!!editingItem}
          onOpenChange={(open) => !open && setEditingItem(null)}
          editingItem={editingItem.item}
        />
      )}

      {/* Viewing item details */}
      <Dialog open={!!viewingItem} onOpenChange={(open) => !open && setViewingItem(null)}>
        <DialogContent className="sm:max-w-[425px]">
          {viewingItem && (
            <>
              <DialogHeader>
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-secondary border border-border">
                    {(() => {
                      const Icon = CATEGORY_MAP[viewingItem.category]?.icon || Package;
                      return <Icon className="w-6 h-6 text-primary" />;
                    })()}
                  </div>
                  <div>
                    <DialogTitle className="text-xl font-display text-foreground">{viewingItem.name}</DialogTitle>
                    <div className="flex items-center gap-2 mt-1 text-xs">
                      <Badge variant="secondary" className="uppercase text-[10px]">
                        {CATEGORY_MAP[viewingItem.category]?.label}
                      </Badge>
                      {viewingItem.rarity && (
                        <span className={cn("font-bold uppercase tracking-wider", RARITY_MAP[viewingItem.rarity as NonNullable<InventoryItemRarity>]?.colorClass)}>
                          {RARITY_MAP[viewingItem.rarity as NonNullable<InventoryItemRarity>]?.label}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </DialogHeader>
              
              <ScrollArea className="max-h-[60vh] mt-4 pr-4">
                <div className="space-y-4">
                  <div className="text-sm text-muted-foreground whitespace-pre-wrap leading-relaxed">
                    {viewingItem.description}
                  </div>

                  {viewingItem.imageUrl && (
                    <div className="rounded-md overflow-hidden border border-border/50">
                      <img src={viewingItem.imageUrl} alt={viewingItem.name} className="w-full h-auto object-cover" />
                    </div>
                  )}

                  {viewingItem.maxCharges && viewingItem.maxCharges > 0 && (
                    <div className="p-3 rounded-lg bg-secondary/50 border border-border/50">
                      <div className="text-xs text-muted-foreground uppercase font-bold mb-2 flex justify-between">
                        <span>Charges ({viewingItem.currentCharges}/{viewingItem.maxCharges})</span>
                        {viewingItem.rechargeOn && (
                          <span className="text-primary">Recharges: {RECHARGE_MAP[viewingItem.rechargeOn]}</span>
                        )}
                      </div>
                      <div className="flex gap-1.5 flex-wrap">
                        {Array.from({ length: viewingItem.maxCharges }).map((_, i) => (
                          <div 
                            key={i} 
                            className={cn(
                              "w-3 h-3 rounded-full border shadow-inner",
                              i < (viewingItem.currentCharges || 0)
                                ? "bg-primary border-primary glow-accent" 
                                : "bg-background border-border"
                            )}
                          />
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground pt-4 border-t border-border/50">
                    <div>Location: <strong className="text-foreground capitalize">{viewingItem.location}</strong></div>
                    <div>Consumable: <strong className="text-foreground">{viewingItem.isConsumable ? 'Yes' : 'No'}</strong></div>
                    {viewingItem.quantity !== undefined && viewingItem.quantity > 1 && (
                      <div>Quantity: <strong className="text-foreground">{viewingItem.quantity}</strong></div>
                    )}
                  </div>

                  {viewingItem.notes && (
                    <div className="text-xs text-muted-foreground/70 italic border-t border-border/50 pt-3 whitespace-pre-wrap">
                      {viewingItem.notes}
                    </div>
                  )}
                </div>
              </ScrollArea>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

// Compact Item List Component
function ItemList({ 
  items, 
  onView, 
  onEdit 
}: { 
  items: InventoryItem[]; 
  onView: (item: InventoryItem) => void; 
  onEdit: (e: React.MouseEvent, item: InventoryItem) => void;
}) {
  if (items.length === 0) {
    return <div className="text-sm text-muted-foreground/50 italic py-2">Empty</div>;
  }

  return (
    <ul className="space-y-2">
      {items.map(item => {
        const rarityInfo = item.rarity ? RARITY_MAP[item.rarity as NonNullable<InventoryItemRarity>] : null;
        const hasCharges = item.maxCharges !== null && item.maxCharges !== undefined && item.maxCharges > 0;
        
        return (
          <li 
            key={item.id}
            className="group flex items-center justify-between p-2 rounded-md bg-background/50 hover:bg-secondary/80 border border-border/50 cursor-pointer transition-colors"
            onClick={() => onView(item)}
          >
            <div className="flex items-center gap-2 overflow-hidden flex-1">
              {/* Rarity Dot */}
              <div 
                className={cn(
                  "w-2 h-2 rounded-full flex-shrink-0 shadow-[0_0_5px_currentColor]",
                  rarityInfo ? rarityInfo.colorClass.replace('text-', 'bg-') : "bg-muted-foreground/30"
                )}
                title={rarityInfo?.label || "Standard"}
              />
              
              <span className="text-sm font-medium truncate text-foreground group-hover:text-primary transition-colors">
                {item.name}
              </span>
              
              {hasCharges && (
                <div className="flex items-center gap-0.5 ml-1 flex-shrink-0">
                  {Array.from({ length: Math.min(item.maxCharges!, 5) }).map((_, i) => (
                    <div 
                      key={i}
                      className={cn(
                        "w-1.5 h-1.5 rounded-full",
                        i < (item.currentCharges || 0) ? "bg-primary" : "bg-muted border border-border"
                      )}
                    />
                  ))}
                  {item.maxCharges! > 5 && <span className="text-[10px] text-muted-foreground ml-0.5">+{item.maxCharges! - 5}</span>}
                </div>
              )}
            </div>
            
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0 ml-2"
              onClick={(e) => onEdit(e, item)}
            >
              <Edit className="w-3 h-3 text-muted-foreground hover:text-primary" />
            </Button>
          </li>
        );
      })}
    </ul>
  );
}
