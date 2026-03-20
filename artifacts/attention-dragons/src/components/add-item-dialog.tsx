import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '@/components/ui/sheet';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { CATEGORY_MAP, RARITY_MAP, RECHARGE_MAP } from '@/lib/constants';
import { 
  InventoryItem,
  CreateItemRequest,
  CreateItemRequestCategory, 
  CreateItemRequestRarity, 
  CreateItemRequestRechargeOn,
  CreateItemRequestLocation
} from '@workspace/api-client-react';
import { useCreateItem, useUpdateItem, getListItemsQueryKey, getGetDmOverviewQueryKey } from '@workspace/api-client-react';
import { useQueryClient } from '@tanstack/react-query';
import { Sparkles, Save, ImagePlus, Trash2 } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';
import { AssetPickerDialog } from '@/components/asset-picker-dialog';

const imageReferenceSchema = z.string().refine(
  (value) => value === "" || value.startsWith("/api/assets/") || /^https?:\/\//.test(value),
  "Must be a valid library or external image URL",
);

const formSchema = z.object({
  name: z.string().min(1, "Name is required"),
  category: z.nativeEnum(CreateItemRequestCategory),
  description: z.string().min(1, "Description is required"),
  imageUrl: imageReferenceSchema.optional().or(z.literal("")),
  location: z.nativeEnum(CreateItemRequestLocation).default(CreateItemRequestLocation.carried),
  isConsumable: z.boolean().default(false),
  rarity: z.nativeEnum(CreateItemRequestRarity).optional().nullable(),
  maxCharges: z.coerce.number().min(0).optional().nullable(),
  rechargeOn: z.nativeEnum(CreateItemRequestRechargeOn).optional().nullable(),
  quantity: z.coerce.number().int().min(1).default(1),
  notes: z.string().optional().nullable(),
});

type FormValues = z.infer<typeof formSchema>;

interface AddItemDialogProps {
  characterId: number;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editingItem?: InventoryItem | null;
}

export function AddItemDialog({ characterId, open, onOpenChange, editingItem }: AddItemDialogProps) {
  const queryClient = useQueryClient();
  const isEditing = !!editingItem;
  const isMobile = useIsMobile();
  const [isAssetPickerOpen, setIsAssetPickerOpen] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      category: CreateItemRequestCategory.misc,
      description: "",
      imageUrl: "",
      location: CreateItemRequestLocation.carried,
      isConsumable: false,
      rarity: null,
      maxCharges: null,
      rechargeOn: null,
      quantity: 1,
      notes: null,
    },
  });

  useEffect(() => {
    if (open && editingItem) {
      form.reset({
        name: editingItem.name,
        category: editingItem.category as CreateItemRequestCategory,
        description: editingItem.description,
        imageUrl: editingItem.imageUrl || "",
        location: (editingItem.location as CreateItemRequestLocation) || CreateItemRequestLocation.carried,
        isConsumable: editingItem.isConsumable,
        rarity: (editingItem.rarity as CreateItemRequestRarity) || null,
        maxCharges: editingItem.maxCharges,
        rechargeOn: (editingItem.rechargeOn as CreateItemRequestRechargeOn) || null,
        quantity: editingItem.quantity ?? 1,
        notes: editingItem.notes ?? null,
      });
    } else if (open && !editingItem) {
      form.reset({
        name: "",
        category: CreateItemRequestCategory.misc,
        description: "",
        imageUrl: "",
        location: CreateItemRequestLocation.carried,
        isConsumable: false,
        rarity: null,
        maxCharges: null,
        rechargeOn: null,
        quantity: 1,
        notes: null,
      });
    }
  }, [open, editingItem, form]);

  const { mutate: createItem, isPending: isCreating } = useCreateItem({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getListItemsQueryKey(characterId) });
        queryClient.invalidateQueries({ queryKey: getGetDmOverviewQueryKey() });
        onOpenChange(false);
      }
    }
  });

  const { mutate: updateItem, isPending: isUpdating } = useUpdateItem({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getListItemsQueryKey(characterId) });
        queryClient.invalidateQueries({ queryKey: getGetDmOverviewQueryKey() });
        onOpenChange(false);
      }
    }
  });

  const onSubmit = (data: FormValues) => {
    const isEquipped = data.location === CreateItemRequestLocation.equipped;
    const nextCurrentCharges =
      data.maxCharges == null
        ? null
        : isEditing
          ? Math.min(editingItem.currentCharges ?? data.maxCharges, data.maxCharges)
          : data.maxCharges;

    const createPayload: CreateItemRequest = {
      name: data.name,
      category: data.category,
      description: data.description,
      imageUrl: data.imageUrl || null,
      location: data.location,
      isEquipped,
      isConsumable: data.isConsumable,
      rarity: data.rarity ?? null,
      maxCharges: data.maxCharges ?? null,
      rechargeOn: data.rechargeOn ?? null,
      currentCharges: nextCurrentCharges,
      quantity: data.quantity,
      notes: data.notes ?? null,
    };

    if (isEditing) {
      updateItem({ characterId, itemId: editingItem.id, data: createPayload });
    } else {
      createItem({ characterId, data: createPayload });
    }
  };

  const isPending = isCreating || isUpdating;

  const content = (
    <>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 mt-4">
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Item Name</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g. Ring of Protection" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="category"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Category</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a category" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {Object.entries(CATEGORY_MAP).map(([key, { label }]) => (
                        <SelectItem key={key} value={key}>{label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Description</FormLabel>
                <FormControl>
                  <Textarea 
                    placeholder="Magical properties, damage dice, lore..." 
                    className="min-h-[100px]"
                    {...field} 
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="quantity"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Quantity</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      min={1}
                      placeholder="1"
                      {...field}
                      value={field.value || 1}
                      onChange={e => field.onChange(e.target.value ? parseInt(e.target.value) : 1)}
                    />
                  </FormControl>
                  <FormDescription>How many of this item?</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Notes (Optional)</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="e.g. Attuned, cursed..."
                      {...field}
                      value={field.value || ""}
                      onChange={e => field.onChange(e.target.value || null)}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="rarity"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Rarity (Optional)</FormLabel>
                  <Select 
                    onValueChange={field.onChange} 
                    value={field.value || undefined}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="None" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {Object.entries(RARITY_MAP).map(([key, { label }]) => (
                        <SelectItem key={key} value={key}>{label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="imageUrl"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Item Art (Optional)</FormLabel>
                  <div className="space-y-3 rounded-xl border border-border bg-secondary/20 p-4">
                    <div className="space-y-2">
                      <FormLabel className="text-xs uppercase tracking-wide text-muted-foreground">Manual image URL</FormLabel>
                      <FormControl>
                        <Input placeholder="https://... or /api/assets/..." {...field} value={field.value || ""} />
                      </FormControl>
                    </div>

                    {field.value ? (
                      <div className="flex items-center gap-4">
                        <div className="h-20 w-20 overflow-hidden rounded-lg border border-border bg-background">
                          <img src={field.value} alt="Selected item art" className="h-full w-full object-cover" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-medium text-foreground">Current item art source</p>
                          <p className="truncate text-xs text-muted-foreground">{field.value}</p>
                        </div>
                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground">No item art selected yet.</p>
                    )}

                    <div className="flex flex-wrap gap-2">
                      <Button type="button" variant="outline" onClick={() => setIsAssetPickerOpen(true)}>
                        <ImagePlus className="mr-2 h-4 w-4" />
                        Choose From Library
                      </Button>
                      {field.value && (
                        <Button type="button" variant="ghost" onClick={() => field.onChange("")}>
                          <Trash2 className="mr-2 h-4 w-4" />
                          Clear Art
                        </Button>
                      )}
                    </div>
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 border border-border rounded-lg bg-secondary/30">
            <div className="space-y-4">
              <h4 className="font-display text-primary font-semibold">Magical Charges</h4>
              <FormField
                control={form.control}
                name="maxCharges"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Max Charges</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        placeholder="0" 
                        {...field} 
                        value={field.value || ""} 
                        onChange={e => field.onChange(e.target.value ? parseInt(e.target.value) : null)}
                      />
                    </FormControl>
                    <FormDescription>Leave empty if item has no charges.</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="rechargeOn"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Recharge Condition</FormLabel>
                    <Select 
                      onValueChange={field.onChange} 
                      value={field.value || undefined}
                      disabled={!form.watch("maxCharges")}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select condition" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {Object.entries(RECHARGE_MAP).map(([key, label]) => (
                          <SelectItem key={key} value={key}>{label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="space-y-6">
              <h4 className="font-display text-primary font-semibold">Properties</h4>
              
              <FormField
                control={form.control}
                name="location"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Location</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select location" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="equipped">Equipped</SelectItem>
                        <SelectItem value="carried">In Bag</SelectItem>
                        <SelectItem value="stored">In Storage Vault</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormDescription>Where is this item currently?</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="isConsumable"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border border-border p-3 shadow-sm bg-background">
                    <div className="space-y-0.5">
                      <FormLabel>Consumable</FormLabel>
                      <FormDescription>Is it destroyed on use? (e.g. Potion)</FormDescription>
                    </div>
                    <FormControl>
                      <Switch checked={field.value} onCheckedChange={field.onChange} />
                    </FormControl>
                  </FormItem>
                )}
              />
            </div>
          </div>

          <div className="flex justify-end gap-4 pt-4 pb-8">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="magical" disabled={isPending}>
              <Save className="w-4 h-4 mr-2" />
              {isEditing ? "Update Artifact" : "Conjure Artifact"}
            </Button>
          </div>
        </form>
      </Form>
    </>
  );

  if (isMobile) {
    return (
      <>
        <Sheet open={open} onOpenChange={onOpenChange}>
          <SheetContent side="bottom" className="max-h-[90vh] overflow-y-auto">
            <SheetHeader>
              <SheetTitle className="flex items-center gap-2">
                <Sparkles className="w-6 h-6 text-primary" />
                {isEditing ? "Modify Artifact" : "Conjure New Artifact"}
              </SheetTitle>
              <SheetDescription>
                Scribe the details of this item into your magical inventory.
              </SheetDescription>
            </SheetHeader>
            {content}
          </SheetContent>
        </Sheet>
        <AssetPickerDialog
          open={isAssetPickerOpen}
          onOpenChange={setIsAssetPickerOpen}
          onSelect={(url) => form.setValue("imageUrl", url ?? "", { shouldDirty: true })}
          selectedUrl={form.watch("imageUrl")}
          title="Choose Item Pixel Art"
          description="Select shared pixel art for this item. DM controls are available inside the library."
        />
      </>
    );
  }

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Sparkles className="w-6 h-6 text-primary" />
              {isEditing ? "Modify Artifact" : "Conjure New Artifact"}
            </DialogTitle>
            <DialogDescription>
              Scribe the details of this item into your magical inventory.
            </DialogDescription>
          </DialogHeader>
          {content}
        </DialogContent>
      </Dialog>
      <AssetPickerDialog
        open={isAssetPickerOpen}
        onOpenChange={setIsAssetPickerOpen}
        onSelect={(url) => form.setValue("imageUrl", url ?? "", { shouldDirty: true })}
        selectedUrl={form.watch("imageUrl")}
        title="Choose Item Pixel Art"
        description="Select shared pixel art for this item. DM controls are available inside the library."
      />
    </>
  );
}
