import { useState } from 'react';
import { 
  useListQuests, Quest,
  useCreateQuest, useUpdateQuest, useDeleteQuest,
  getListQuestsQueryKey,
  CreateQuestRequestStatus,
  UpdateQuestRequestStatus
} from '@workspace/api-client-react';
import { useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Badge } from '@/components/ui/badge';
import { Scroll, Plus, Edit2, Trash2, ChevronDown, ChevronUp, Save, X, CheckCircle, AlertTriangle, Swords } from 'lucide-react';
import { cn } from '@/lib/utils';

const STATUS_CONFIG = {
  active: { label: 'Active', icon: Swords, className: 'text-primary border-primary/40 bg-primary/10' },
  completed: { label: 'Completed', icon: CheckCircle, className: 'text-green-400 border-green-400/40 bg-green-400/10' },
  failed: { label: 'Failed', icon: AlertTriangle, className: 'text-red-400 border-red-400/40 bg-red-400/10' },
};

interface QuestLogSectionProps {
  partyId: number;
  isDm?: boolean;
}

interface QuestDialogState {
  open: boolean;
  editing: Quest | null;
}

export function QuestLogSection({ partyId, isDm = false }: QuestLogSectionProps) {
  const queryClient = useQueryClient();
  const { data: quests = [], isLoading } = useListQuests(partyId);
  const [isOpen, setIsOpen] = useState(false);
  const [dialog, setDialog] = useState<QuestDialogState>({ open: false, editing: null });
  const [expandedQuest, setExpandedQuest] = useState<number | null>(null);

  const invalidate = () => queryClient.invalidateQueries({ queryKey: getListQuestsQueryKey(partyId) });

  const { mutate: createQuest, isPending: isCreating } = useCreateQuest({
    mutation: { onSuccess: () => { invalidate(); setDialog({ open: false, editing: null }); } }
  });
  const { mutate: updateQuest, isPending: isUpdating } = useUpdateQuest({
    mutation: { onSuccess: () => { invalidate(); setDialog({ open: false, editing: null }); } }
  });
  const { mutate: deleteQuest } = useDeleteQuest({
    mutation: { onSuccess: invalidate }
  });

  const handleDelete = (questId: number) => {
    if (confirm("Delete this quest?")) {
      deleteQuest({ partyId, questId });
    }
  };

  const openCreate = () => setDialog({ open: true, editing: null });
  const openEdit = (quest: Quest) => setDialog({ open: true, editing: quest });
  const closeDialog = () => setDialog({ open: false, editing: null });

  const activeQuests = quests.filter(q => q.status === 'active');
  const otherQuests = quests.filter(q => q.status !== 'active');

  return (
    <>
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <div className="flex items-center justify-between border-b border-border/50 pb-2">
          <CollapsibleTrigger asChild>
            <button className="flex items-center gap-2 text-2xl font-display font-bold text-foreground hover:text-primary transition-colors">
              <Scroll className="w-6 h-6 text-primary" />
              Quest Log
              <span className="text-sm font-sans font-normal text-muted-foreground ml-1">
                ({activeQuests.length} active)
              </span>
              {isOpen ? <ChevronUp className="w-5 h-5 text-muted-foreground" /> : <ChevronDown className="w-5 h-5 text-muted-foreground" />}
            </button>
          </CollapsibleTrigger>
          {isDm && (
            <Button variant="outline" size="sm" className="border-primary/30 text-primary hover:bg-primary/10" onClick={openCreate}>
              <Plus className="w-4 h-4 mr-1" /> New Quest
            </Button>
          )}
        </div>

        <CollapsibleContent className="mt-4">
          {isLoading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
            </div>
          ) : quests.length === 0 ? (
            <div className="text-center py-12 bg-card/30 rounded-xl border border-dashed border-border">
              <Scroll className="w-12 h-12 text-muted-foreground/40 mx-auto mb-3" />
              <p className="text-muted-foreground font-display">No quests recorded.</p>
              {isDm && <p className="text-sm text-muted-foreground/60 mt-1">Create a quest to begin tracking the party's objectives.</p>}
            </div>
          ) : (
            <div className="space-y-4">
              {activeQuests.length > 0 && (
                <div className="space-y-2">
                  {activeQuests.map(quest => (
                    <QuestCard
                      key={quest.id}
                      quest={quest}
                      isDm={isDm}
                      isExpanded={expandedQuest === quest.id}
                      onToggle={() => setExpandedQuest(expandedQuest === quest.id ? null : quest.id)}
                      onEdit={() => openEdit(quest)}
                      onDelete={() => handleDelete(quest.id)}
                      onStatusChange={(status) => updateQuest({ partyId, questId: quest.id, data: { status } })}
                    />
                  ))}
                </div>
              )}

              {otherQuests.length > 0 && (
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground/60 mb-2 mt-4">Resolved</h4>
                  <div className="space-y-2">
                    {otherQuests.map(quest => (
                      <QuestCard
                        key={quest.id}
                        quest={quest}
                        isDm={isDm}
                        isExpanded={expandedQuest === quest.id}
                        onToggle={() => setExpandedQuest(expandedQuest === quest.id ? null : quest.id)}
                        onEdit={() => openEdit(quest)}
                        onDelete={() => handleDelete(quest.id)}
                        onStatusChange={(status) => updateQuest({ partyId, questId: quest.id, data: { status } })}
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </CollapsibleContent>
      </Collapsible>

      {isDm && (
        <QuestDialog
          open={dialog.open}
          editing={dialog.editing}
          onClose={closeDialog}
          onSave={({ title, description, status }) => {
            if (dialog.editing) {
              updateQuest({ partyId, questId: dialog.editing.id, data: { title, description, status } });
            } else {
              createQuest({ partyId, data: { title, description, status: status as CreateQuestRequestStatus } });
            }
          }}
          isPending={isCreating || isUpdating}
        />
      )}
    </>
  );
}

interface QuestCardProps {
  quest: Quest;
  isDm: boolean;
  isExpanded: boolean;
  onToggle: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onStatusChange: (status: UpdateQuestRequestStatus) => void;
}

function QuestCard({ quest, isDm, isExpanded, onToggle, onEdit, onDelete, onStatusChange }: QuestCardProps) {
  const status = STATUS_CONFIG[quest.status as keyof typeof STATUS_CONFIG] ?? STATUS_CONFIG.active;
  const Icon = status.icon;

  return (
    <div className={cn(
      "bg-card/40 border rounded-lg overflow-hidden transition-colors",
      quest.status === 'active' ? "border-primary/20 hover:border-primary/40" : "border-border hover:border-border/80"
    )}>
      <div className="flex items-center justify-between p-3 sm:p-4">
        <button className="flex-1 flex items-center gap-3 text-left" onClick={onToggle}>
          <Icon className={cn("w-4 h-4 flex-shrink-0", status.className.split(' ')[0])} />
          <span className={cn(
            "font-display font-semibold",
            quest.status === 'active' ? "text-foreground" : "text-muted-foreground"
          )}>
            {quest.title}
          </span>
          <Badge variant="outline" className={cn("text-[10px] uppercase tracking-wide font-bold ml-1 px-1.5 py-0", status.className)}>
            {status.label}
          </Badge>
        </button>

        {isDm && (
          <div className="flex items-center gap-1 ml-2 flex-shrink-0">
            {quest.status === 'active' && (
              <>
                <Button variant="ghost" size="sm" className="h-7 text-xs text-green-400 hover:text-green-300 hover:bg-green-400/10 px-2" onClick={() => onStatusChange(UpdateQuestRequestStatus.completed)}>
                  <CheckCircle className="w-3 h-3 mr-1" /> Done
                </Button>
                <Button variant="ghost" size="sm" className="h-7 text-xs text-red-400 hover:text-red-300 hover:bg-red-400/10 px-2" onClick={() => onStatusChange(UpdateQuestRequestStatus.failed)}>
                  <AlertTriangle className="w-3 h-3 mr-1" /> Fail
                </Button>
              </>
            )}
            {quest.status !== 'active' && (
              <Button variant="ghost" size="sm" className="h-7 text-xs text-primary hover:bg-primary/10 px-2" onClick={() => onStatusChange(UpdateQuestRequestStatus.active)}>
                Reopen
              </Button>
            )}
            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={onEdit}>
              <Edit2 className="w-3 h-3 text-muted-foreground hover:text-primary" />
            </Button>
            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={onDelete}>
              <Trash2 className="w-3 h-3 text-muted-foreground hover:text-destructive" />
            </Button>
          </div>
        )}
      </div>

      {isExpanded && quest.description && (
        <div className="px-4 pb-4 pt-0">
          <div className="text-sm text-muted-foreground whitespace-pre-wrap leading-relaxed border-t border-border/40 pt-3">
            {quest.description}
          </div>
        </div>
      )}
    </div>
  );
}

interface QuestDialogProps {
  open: boolean;
  editing: Quest | null;
  onClose: () => void;
  onSave: (data: { title: string; description: string; status: UpdateQuestRequestStatus }) => void;
  isPending: boolean;
}

function QuestDialog({ open, editing, onClose, onSave, isPending }: QuestDialogProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState<UpdateQuestRequestStatus>(UpdateQuestRequestStatus.active);

  const handleOpenChange = (o: boolean) => {
    if (o) {
      setTitle(editing?.title ?? '');
      setDescription(editing?.description ?? '');
      setStatus((editing?.status as UpdateQuestRequestStatus) ?? UpdateQuestRequestStatus.active);
    } else {
      onClose();
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    onSave({ title: title.trim(), description: description.trim(), status });
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="font-display flex items-center gap-2">
            <Scroll className="w-5 h-5 text-primary" />
            {editing ? "Edit Quest" : "New Quest"}
          </DialogTitle>
          <DialogDescription>
            Record a new objective for the party to pursue.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 mt-2">
          <div className="space-y-1">
            <label className="text-sm font-medium text-foreground">Quest Title</label>
            <Input
              placeholder="e.g. Find the Lost Tomb of Karvesh"
              value={title}
              onChange={e => setTitle(e.target.value)}
              autoFocus
            />
          </div>
          <div className="space-y-1">
            <label className="text-sm font-medium text-foreground">Description</label>
            <Textarea
              placeholder="Details, objectives, known information..."
              className="min-h-[120px] resize-none"
              value={description}
              onChange={e => setDescription(e.target.value)}
            />
          </div>
          <div className="space-y-1">
            <label className="text-sm font-medium text-foreground">Status</label>
            <Select value={status} onValueChange={v => setStatus(v as UpdateQuestRequestStatus)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="failed">Failed</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="outline" onClick={onClose}>
              <X className="w-4 h-4 mr-1" /> Cancel
            </Button>
            <Button type="submit" variant="magical" disabled={isPending || !title.trim()}>
              <Save className="w-4 h-4 mr-1" />
              {editing ? "Update Quest" : "Issue Quest"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
