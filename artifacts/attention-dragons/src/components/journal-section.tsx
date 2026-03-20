import { useState } from 'react';
import { useListJournalEntries, useCreateJournalEntry, useUpdateJournalEntry, useDeleteJournalEntry, JournalEntry, getListJournalEntriesQueryKey } from '@workspace/api-client-react';
import { useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { BookOpen, Plus, Edit2, Trash2, ChevronDown, ChevronUp, Save, X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface JournalSectionProps {
  characterId: number;
}

interface EntryDialogState {
  open: boolean;
  editing: JournalEntry | null;
}

export function JournalSection({ characterId }: JournalSectionProps) {
  const queryClient = useQueryClient();
  const { data: entries = [], isLoading } = useListJournalEntries(characterId);

  const [isOpen, setIsOpen] = useState(false);
  const [dialog, setDialog] = useState<EntryDialogState>({ open: false, editing: null });
  const [expandedEntry, setExpandedEntry] = useState<number | null>(null);

  const invalidate = () => queryClient.invalidateQueries({ queryKey: getListJournalEntriesQueryKey(characterId) });

  const { mutate: createEntry, isPending: isCreating } = useCreateJournalEntry({
    mutation: { onSuccess: () => { invalidate(); setDialog({ open: false, editing: null }); } }
  });
  const { mutate: updateEntry, isPending: isUpdating } = useUpdateJournalEntry({
    mutation: { onSuccess: () => { invalidate(); setDialog({ open: false, editing: null }); } }
  });
  const { mutate: deleteEntry } = useDeleteJournalEntry({
    mutation: { onSuccess: invalidate }
  });

  const openCreate = () => setDialog({ open: true, editing: null });
  const openEdit = (entry: JournalEntry) => setDialog({ open: true, editing: entry });
  const closeDialog = () => setDialog({ open: false, editing: null });

  const handleDelete = (entryId: number) => {
    if (confirm("Delete this journal entry?")) {
      deleteEntry({ characterId, entryId });
    }
  };

  return (
    <>
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <div className="flex items-center justify-between border-b border-border/50 pb-2">
          <CollapsibleTrigger asChild>
            <button className="flex items-center gap-2 text-2xl font-display font-bold text-foreground hover:text-primary transition-colors">
              <BookOpen className="w-6 h-6 text-primary" />
              Chronicle
              <span className="text-sm font-sans font-normal text-muted-foreground ml-1">({entries.length})</span>
              {isOpen ? <ChevronUp className="w-5 h-5 text-muted-foreground" /> : <ChevronDown className="w-5 h-5 text-muted-foreground" />}
            </button>
          </CollapsibleTrigger>
          <Button variant="outline" size="sm" className="border-primary/30 text-primary hover:bg-primary/10" onClick={openCreate}>
            <Plus className="w-4 h-4 mr-1" /> New Entry
          </Button>
        </div>

        <CollapsibleContent className="mt-4">
          {isLoading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
            </div>
          ) : entries.length === 0 ? (
            <div className="text-center py-12 bg-card/30 rounded-xl border border-dashed border-border">
              <BookOpen className="w-12 h-12 text-muted-foreground/40 mx-auto mb-3" />
              <p className="text-muted-foreground font-display">No chronicle entries yet.</p>
              <p className="text-sm text-muted-foreground/60 mt-1">Document your adventures and discoveries.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {entries.map(entry => {
                const date = new Date(entry.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
                const isExpanded = expandedEntry === entry.id;

                return (
                  <div
                    key={entry.id}
                    className="bg-card/40 border border-border rounded-lg overflow-hidden hover:border-primary/30 transition-colors"
                  >
                    <div className="flex items-center justify-between p-4">
                      <button
                        className="flex-1 text-left"
                        onClick={() => setExpandedEntry(isExpanded ? null : entry.id)}
                      >
                        <div className="flex items-center gap-3">
                          <div className={cn(
                            "w-2 h-2 rounded-full flex-shrink-0",
                            "bg-primary/60 shadow-[0_0_6px_currentColor]"
                          )} />
                          <span className="font-display font-semibold text-foreground">{entry.title}</span>
                          <span className="text-xs text-muted-foreground/60 ml-auto">{date}</span>
                        </div>
                      </button>
                      <div className="flex items-center gap-1 ml-3">
                        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => openEdit(entry)}>
                          <Edit2 className="w-3.5 h-3.5 text-muted-foreground hover:text-primary" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => handleDelete(entry.id)}>
                          <Trash2 className="w-3.5 h-3.5 text-muted-foreground hover:text-destructive" />
                        </Button>
                      </div>
                    </div>

                    {isExpanded && entry.body && (
                      <div className="px-4 pb-4 pt-0">
                        <div className="text-sm text-muted-foreground whitespace-pre-wrap leading-relaxed border-t border-border/40 pt-3">
                          {entry.body}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </CollapsibleContent>
      </Collapsible>

      <JournalEntryDialog
        open={dialog.open}
        editing={dialog.editing}
        onClose={closeDialog}
        onSave={({ title, body }) => {
          if (dialog.editing) {
            updateEntry({ characterId, entryId: dialog.editing.id, data: { title, body } });
          } else {
            createEntry({ characterId, data: { title, body } });
          }
        }}
        isPending={isCreating || isUpdating}
      />
    </>
  );
}

interface JournalEntryDialogProps {
  open: boolean;
  editing: JournalEntry | null;
  onClose: () => void;
  onSave: (data: { title: string; body: string }) => void;
  isPending: boolean;
}

function JournalEntryDialog({ open, editing, onClose, onSave, isPending }: JournalEntryDialogProps) {
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');

  const handleOpenChange = (o: boolean) => {
    if (o) {
      setTitle(editing?.title ?? '');
      setBody(editing?.body ?? '');
    } else {
      onClose();
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    onSave({ title: title.trim(), body: body.trim() });
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="font-display flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-primary" />
            {editing ? "Edit Chronicle Entry" : "New Chronicle Entry"}
          </DialogTitle>
          <DialogDescription>
            Record your thoughts, discoveries, and deeds for posterity.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 mt-2">
          <div className="space-y-1">
            <label className="text-sm font-medium text-foreground">Title</label>
            <Input
              placeholder="e.g. The Battle of Thornwall"
              value={title}
              onChange={e => setTitle(e.target.value)}
              autoFocus
            />
          </div>
          <div className="space-y-1">
            <label className="text-sm font-medium text-foreground">Entry</label>
            <Textarea
              placeholder="What happened? What was discovered? What was felt..."
              className="min-h-[160px] resize-none"
              value={body}
              onChange={e => setBody(e.target.value)}
            />
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="outline" onClick={onClose}>
              <X className="w-4 h-4 mr-1" /> Cancel
            </Button>
            <Button type="submit" variant="magical" disabled={isPending || !title.trim()}>
              <Save className="w-4 h-4 mr-1" />
              {editing ? "Update Entry" : "Inscribe Entry"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
