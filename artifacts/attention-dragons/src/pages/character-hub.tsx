import { useState } from 'react';
import { useParams, Link } from 'wouter';
import { useGetCharacter, useListItems, useTriggerRest, getListItemsQueryKey } from '@workspace/api-client-react';
import { InventoryItem, RestRequestRestType } from '@workspace/api-client-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ItemCard } from '@/components/item-card';
import { AddItemDialog } from '@/components/add-item-dialog';
import { EditCharacterDialog } from '@/components/edit-character-dialog';
import { ThemeSelector } from '@/components/theme-selector';
import { JournalSection } from '@/components/journal-section';
import { QuestLogSection } from '@/components/quest-log-section';
import { useDefaultParty } from '@/hooks/use-default-party';
import { CATEGORY_MAP } from '@/lib/constants';
import { ArrowLeft, Moon, Search, Sun, Plus, PackageOpen, Settings, Backpack, Shield, Box, ChevronDown, ChevronUp } from 'lucide-react';
import { useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { Badge } from '@/components/ui/badge';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

export default function CharacterHub() {
  const { characterId } = useParams<{ characterId: string }>();
  const id = parseInt(characterId, 10);
  const queryClient = useQueryClient();

  const [search, setSearch] = useState("");
  const [isAddItemOpen, setIsAddItemOpen] = useState(false);
  const [isEditCharacterOpen, setIsEditCharacterOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<InventoryItem | null>(null);
  const [showConsumed, setShowConsumed] = useState(false);
  const [openVaultCategories, setOpenVaultCategories] = useState<Record<string, boolean>>({});

  const { data: character, isLoading: charLoading } = useGetCharacter(id);
  const { data: items = [], isLoading: itemsLoading } = useListItems(id);
  const { partyId } = useDefaultParty();

  const { mutate: triggerRest, isPending: isResting } = useTriggerRest({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getListItemsQueryKey(id) });
      }
    }
  });

  const handleRest = (restType: RestRequestRestType) => {
    triggerRest({ characterId: id, data: { restType } });
  };

  const handleEdit = (item: InventoryItem) => {
    setEditingItem(item);
    setIsAddItemOpen(true);
  };

  const handleCloseDialog = (open: boolean) => {
    setIsAddItemOpen(open);
    if (!open) setTimeout(() => setEditingItem(null), 200);
  };

  const toggleVaultCategory = (category: string) => {
    setOpenVaultCategories(prev => ({
      ...prev,
      [category]: prev[category] === undefined ? false : !prev[category]
    }));
  };

  const filteredItems = items.filter(item => {
    if (!showConsumed && item.isConsumed) return false;
    if (showConsumed && !item.isConsumed) return false;
    if (search && !item.name.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const equippedItems = filteredItems.filter(i => i.location === 'equipped');
  const carriedItems = filteredItems.filter(i => i.location === 'carried');
  const storedItems = filteredItems.filter(i => i.location === 'stored');

  const groupedStoredItems = storedItems.reduce((acc, item) => {
    const cat = item.category;
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(item);
    return acc;
  }, {} as Record<string, InventoryItem[]>);

  if (charLoading) return (
    <div className="min-h-screen flex items-center justify-center text-primary font-display text-2xl animate-pulse">
      Consulting the Archives...
    </div>
  );
  if (!character) return (
    <div className="min-h-screen flex items-center justify-center text-destructive font-display text-2xl">
      Character not found in the vault.
    </div>
  );

  return (
    <div className="min-h-screen text-foreground pb-24 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* Navigation & Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">
          <div className="flex items-center gap-4">
            <Link href="/" className="p-2 rounded-full hover:bg-secondary text-muted-foreground hover:text-primary transition-colors">
              <ArrowLeft className="w-6 h-6" />
            </Link>
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-primary/50 bg-secondary shadow-[0_0_15px_rgba(255,215,0,0.2)]">
                <img
                  src={character.avatarUrl || `${import.meta.env.BASE_URL}images/avatar-placeholder.png`}
                  alt={character.name}
                  className="w-full h-full object-cover"
                  onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-3xl sm:text-4xl font-display font-bold text-primary tracking-wide drop-shadow-md">{character.name}</h1>
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-primary" onClick={() => setIsEditCharacterOpen(true)}>
                    <Settings className="h-4 w-4" />
                  </Button>
                </div>
                <p className="text-muted-foreground font-sans mt-1">Level {character.level} {character.race} {character.characterClass}</p>
                {character.summary && (
                  <p className="text-muted-foreground/70 font-sans text-sm mt-0.5 italic">{character.summary}</p>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 w-full md:w-auto">
            <div className="flex gap-2 flex-1 md:flex-none">
              <Button
                variant="outline"
                className="flex-1 md:flex-none border-primary/30 text-primary hover:bg-primary/10"
                onClick={() => handleRest(RestRequestRestType.short_rest)}
                disabled={isResting}
              >
                <Sun className="w-4 h-4 mr-2" /> Short Rest
              </Button>
              <Button
                variant="outline"
                className="flex-1 md:flex-none border-accent/50 text-accent hover:bg-accent/10"
                onClick={() => handleRest(RestRequestRestType.long_rest)}
                disabled={isResting}
              >
                <Moon className="w-4 h-4 mr-2" /> Long Rest
              </Button>
            </div>
            <ThemeSelector />
          </div>
        </div>

        {/* Controls Toolbar */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-8 bg-card/50 p-4 rounded-xl border border-border backdrop-blur-sm">
          <div className="relative w-full lg:w-96">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search artifacts..."
              className="pl-9 bg-background border-border/50 focus-visible:ring-primary"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <div className="flex items-center justify-between w-full lg:w-auto gap-4">
            <Button
              variant="ghost"
              onClick={() => setShowConsumed(!showConsumed)}
              className={showConsumed ? "text-primary bg-primary/10" : "text-muted-foreground"}
            >
              <PackageOpen className="w-4 h-4 mr-2" />
              {showConsumed ? "Viewing Consumed" : "View Consumed"}
            </Button>
            <Button variant="magical" onClick={() => setIsAddItemOpen(true)}>
              <Plus className="w-4 h-4 mr-2" /> Add Item
            </Button>
          </div>
        </div>

        {itemsLoading ? (
          <div className="flex justify-center py-24">
            <div className="animate-spin w-12 h-12 border-4 border-primary border-t-transparent rounded-full" />
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="text-center py-24 bg-card/30 rounded-2xl border border-dashed border-border">
            <PackageOpen className="w-16 h-16 text-muted-foreground/50 mx-auto mb-4" />
            <h3 className="text-2xl font-display text-muted-foreground mb-2">No items found</h3>
            <p className="text-sm text-muted-foreground/70 max-w-md mx-auto">
              {search ? "Your search yielded no artifacts matching that description." : "Your inventory is bare. Visit a merchant or loot a dungeon to acquire items."}
            </p>
          </div>
        ) : (
          <div className="space-y-16">

            {/* SECTION A: ON YOUR PERSON */}
            <div className="space-y-8">
              <h2 className="text-2xl font-display font-bold border-b border-border/50 pb-2 text-foreground flex items-center gap-2">
                <Backpack className="text-primary w-6 h-6" /> On Your Person
              </h2>

              <div className="space-y-6">
                <h3 className="text-xl font-display text-primary flex items-center gap-2">
                  <Shield className="w-5 h-5" /> Equipped
                </h3>
                {equippedItems.length > 0 ? (
                  <motion.div layout className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <AnimatePresence mode="popLayout">
                      {equippedItems.map(item => (
                        <ItemCard key={item.id} item={item} onEdit={handleEdit} />
                      ))}
                    </AnimatePresence>
                  </motion.div>
                ) : (
                  <p className="text-muted-foreground text-sm italic">Nothing is currently equipped.</p>
                )}
              </div>

              <div className="space-y-6">
                <h3 className="text-xl font-display text-accent flex items-center gap-2">
                  <Backpack className="w-5 h-5" /> In Bag
                </h3>
                {carriedItems.length > 0 ? (
                  <motion.div layout className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <AnimatePresence mode="popLayout">
                      {carriedItems.map(item => (
                        <ItemCard key={item.id} item={item} onEdit={handleEdit} />
                      ))}
                    </AnimatePresence>
                  </motion.div>
                ) : (
                  <p className="text-muted-foreground text-sm italic">Your bag is empty.</p>
                )}
              </div>
            </div>

            {/* SECTION B: THE VAULT */}
            {storedItems.length > 0 && (
              <div className="space-y-6">
                <h2 className="text-2xl font-display font-bold border-b border-border/50 pb-2 text-muted-foreground flex items-center gap-2">
                  <Box className="w-6 h-6" /> The Vault (Storage)
                </h2>

                <div className="space-y-4">
                  {Object.entries(groupedStoredItems).map(([category, catItems]) => {
                    const catInfo = CATEGORY_MAP[category as keyof typeof CATEGORY_MAP];
                    const Icon = catInfo?.icon || Box;
                    const isOpen = openVaultCategories[category] ?? true;

                    return (
                      <Collapsible
                        key={category}
                        open={isOpen}
                        onOpenChange={() => toggleVaultCategory(category)}
                        className="bg-card/30 border border-border rounded-lg overflow-hidden"
                      >
                        <CollapsibleTrigger className="flex items-center justify-between w-full p-4 hover:bg-secondary/50 transition-colors">
                          <div className="flex items-center gap-3">
                            <Icon className="w-5 h-5 text-muted-foreground" />
                            <span className="font-display font-bold text-lg">{catInfo?.label || category}</span>
                            <Badge variant="secondary">{catItems.length}</Badge>
                          </div>
                          {isOpen ? <ChevronUp className="w-5 h-5 text-muted-foreground" /> : <ChevronDown className="w-5 h-5 text-muted-foreground" />}
                        </CollapsibleTrigger>
                        <CollapsibleContent>
                          <div className="p-4 pt-0 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            <AnimatePresence mode="popLayout">
                              {catItems.map(item => (
                                <ItemCard key={item.id} item={item} onEdit={handleEdit} />
                              ))}
                            </AnimatePresence>
                          </div>
                        </CollapsibleContent>
                      </Collapsible>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}

        {/* SECTION C: CHRONICLE (Journal) */}
        <div className="mt-16">
          <JournalSection characterId={id} />
        </div>

        {/* SECTION D: QUEST LOG (read-only for players) */}
        <div className="mt-12">
          {partyId !== null && <QuestLogSection partyId={partyId} isDm={false} />}
        </div>

      </div>

      <AddItemDialog
        characterId={id}
        open={isAddItemOpen}
        onOpenChange={handleCloseDialog}
        editingItem={editingItem}
      />

      {character && (
        <EditCharacterDialog
          character={character}
          open={isEditCharacterOpen}
          onOpenChange={setIsEditCharacterOpen}
        />
      )}
    </div>
  );
}
