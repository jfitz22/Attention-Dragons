import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '@/components/ui/sheet';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useUpdateCharacter, getGetCharacterQueryKey, getListCharactersQueryKey, getGetDmOverviewQueryKey, Character } from '@workspace/api-client-react';
import { useQueryClient } from '@tanstack/react-query';
import { UserCog, Save, ImagePlus, Trash2 } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';
import { AssetPickerDialog } from '@/components/asset-picker-dialog';

const imageReferenceSchema = z.string().refine(
  (value) => value === "" || value.startsWith("/api/assets/") || /^https?:\/\//.test(value),
  "Must be a valid library or external image URL",
);

const formSchema = z.object({
  name: z.string().min(1, "Character name is required"),
  playerName: z.string().min(1, "Player name is required"),
  characterClass: z.string().min(1, "Class is required"),
  race: z.string().min(1, "Race is required"),
  level: z.coerce.number().min(1).max(20),
  avatarUrl: imageReferenceSchema.optional().or(z.literal("")),
});

type FormValues = z.infer<typeof formSchema>;

interface EditCharacterDialogProps {
  character: Character;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function EditCharacterDialog({ character, open, onOpenChange }: EditCharacterDialogProps) {
  const queryClient = useQueryClient();
  const isMobile = useIsMobile();
  const [isAssetPickerOpen, setIsAssetPickerOpen] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      playerName: "",
      characterClass: "",
      race: "",
      level: 1,
      avatarUrl: "",
    },
  });

  useEffect(() => {
    if (open && character) {
      form.reset({
        name: character.name,
        playerName: character.playerName,
        characterClass: character.characterClass,
        race: character.race,
        level: character.level,
        avatarUrl: character.avatarUrl || "",
      });
    }
  }, [open, character, form]);

  const { mutate: updateCharacter, isPending } = useUpdateCharacter({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getGetCharacterQueryKey(character.id) });
        queryClient.invalidateQueries({ queryKey: getListCharactersQueryKey() });
        queryClient.invalidateQueries({ queryKey: getGetDmOverviewQueryKey() });
        onOpenChange(false);
      }
    }
  });

  const onSubmit = (data: FormValues) => {
    updateCharacter({ 
      characterId: character.id, 
      data: {
        ...data,
        avatarUrl: data.avatarUrl || null,
      } 
    });
  };

  const content = (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 pt-4 pb-8">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Character Name</FormLabel>
              <FormControl>
                <Input placeholder="e.g. Vax'ildan" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="playerName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Player Name</FormLabel>
              <FormControl>
                <Input placeholder="e.g. Liam" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="characterClass"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Class</FormLabel>
                <FormControl>
                  <Input placeholder="Rogue" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="race"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Race</FormLabel>
                <FormControl>
                  <Input placeholder="Half-Elf" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <FormField
          control={form.control}
          name="level"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Level</FormLabel>
              <FormControl>
                <Input type="number" min={1} max={20} {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="avatarUrl"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Portrait Art</FormLabel>
              <div className="space-y-3 rounded-xl border border-border bg-secondary/20 p-4">
                {field.value ? (
                  <div className="flex items-center gap-4">
                    <div className="h-20 w-20 overflow-hidden rounded-lg border border-border bg-background">
                      <img src={field.value} alt="Selected portrait" className="h-full w-full object-cover" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-foreground">Shared library portrait selected</p>
                      <p className="truncate text-xs text-muted-foreground">{field.value}</p>
                    </div>
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">No portrait selected yet.</p>
                )}

                <div className="flex flex-wrap gap-2">
                  <Button type="button" variant="outline" onClick={() => setIsAssetPickerOpen(true)}>
                    <ImagePlus className="mr-2 h-4 w-4" />
                    Choose From Library
                  </Button>
                  {field.value && (
                    <Button type="button" variant="ghost" onClick={() => field.onChange("")}>
                      <Trash2 className="mr-2 h-4 w-4" />
                      Clear Portrait
                    </Button>
                  )}
                </div>
              </div>
              <FormControl>
                <input type="hidden" {...field} value={field.value || ""} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="flex justify-end pt-4">
          <Button type="button" variant="outline" className="mr-2" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button type="submit" variant="magical" disabled={isPending}>
            <Save className="w-4 h-4 mr-2" />
            Save Changes
          </Button>
        </div>
      </form>
    </Form>
  );

  if (isMobile) {
    return (
      <>
        <Sheet open={open} onOpenChange={onOpenChange}>
          <SheetContent side="bottom" className="max-h-[90vh] overflow-y-auto">
            <SheetHeader>
              <SheetTitle className="flex items-center gap-2">
                <UserCog className="text-primary" /> Edit Character
              </SheetTitle>
              <SheetDescription>
                Update the details of your adventurer.
              </SheetDescription>
            </SheetHeader>
            {content}
          </SheetContent>
        </Sheet>
        <AssetPickerDialog
          open={isAssetPickerOpen}
          onOpenChange={setIsAssetPickerOpen}
          onSelect={(url) => form.setValue("avatarUrl", url ?? "", { shouldDirty: true })}
          selectedUrl={form.watch("avatarUrl")}
          title="Choose Portrait Pixel Art"
          description="Select shared pixel art for this character portrait. DM controls are available inside the library."
        />
      </>
    );
  }

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <UserCog className="text-primary" /> Edit Character
            </DialogTitle>
            <DialogDescription>
              Update the details of your adventurer.
            </DialogDescription>
          </DialogHeader>
          {content}
        </DialogContent>
      </Dialog>
      <AssetPickerDialog
        open={isAssetPickerOpen}
        onOpenChange={setIsAssetPickerOpen}
        onSelect={(url) => form.setValue("avatarUrl", url ?? "", { shouldDirty: true })}
        selectedUrl={form.watch("avatarUrl")}
        title="Choose Portrait Pixel Art"
        description="Select shared pixel art for this character portrait. DM controls are available inside the library."
      />
    </>
  );
}
