import { useMemo, useRef, useState, type ChangeEvent } from "react";
import {
  AssetRecord,
  getListAssetsQueryKey,
  useDeleteAsset,
  useListAssets,
  useUploadAsset,
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useDmKey } from "@/hooks/use-dm-key";
import { Loader2, Trash2, Upload, Wand2 } from "lucide-react";

interface AssetPickerDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelect: (url: string | null) => void;
  selectedUrl?: string | null;
  title: string;
  description: string;
}

export function AssetPickerDialog({
  open,
  onOpenChange,
  onSelect,
  selectedUrl,
  title,
  description,
}: AssetPickerDialogProps) {
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const { toast } = useToast();
  const { dmKey, hasDmKey, setDmKey } = useDmKey();
  const [dmKeyInput, setDmKeyInput] = useState(dmKey);
  const [selectedAssetId, setSelectedAssetId] = useState<string | null>(null);

  const { data: assets = [], isLoading } = useListAssets({
    query: { enabled: open },
  });

  const invalidateAssets = () =>
    queryClient.invalidateQueries({ queryKey: getListAssetsQueryKey() });

  const { mutate: uploadAsset, isPending: isUploading } = useUploadAsset({
    mutation: {
      onSuccess: () => {
        invalidateAssets();
        toast({ title: "Pixel art uploaded", description: "The shared library has been updated." });
      },
      onError: (error) => {
        toast({
          title: "Upload failed",
          description: error instanceof Error ? error.message : "The file could not be uploaded.",
          variant: "destructive",
        });
      },
    },
  });

  const { mutate: deleteAsset, isPending: isDeleting } = useDeleteAsset({
    mutation: {
      onSuccess: () => {
        invalidateAssets();
        toast({ title: "Pixel art removed", description: "The asset was deleted from the library." });
      },
      onError: (error) => {
        toast({
          title: "Delete failed",
          description: error instanceof Error ? error.message : "The asset could not be deleted.",
          variant: "destructive",
        });
      },
    },
  });

  const selectedAsset = useMemo(
    () => assets.find((asset) => asset.publicUrl === selectedUrl) ?? null,
    [assets, selectedUrl],
  );

  const handleUploadFile = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (!hasDmKey) {
      toast({
        title: "DM key required",
        description: "Enter the DM key before uploading shared pixel art.",
        variant: "destructive",
      });
      return;
    }
    uploadAsset({ file, dmKey });
    event.target.value = "";
  };

  const handleDelete = (assetId: string) => {
    if (!hasDmKey) return;
    deleteAsset({ assetId, dmKey });
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(nextOpen) => {
        if (nextOpen) {
          setDmKeyInput(dmKey);
          setSelectedAssetId(selectedAsset?.id ?? null);
        }
        onOpenChange(nextOpen);
      }}
    >
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Wand2 className="h-5 w-5 text-primary" />
            {title}
          </DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="rounded-xl border border-border bg-secondary/20 p-4">
            <div className="flex flex-col gap-3 md:flex-row md:items-end">
              <div className="flex-1 space-y-2">
                <label className="text-sm font-medium text-foreground">DM key</label>
                <Input
                  type="password"
                  placeholder="Enter DM key to manage the library"
                  value={dmKeyInput}
                  onChange={(event) => setDmKeyInput(event.target.value)}
                />
              </div>
              <div className="flex gap-2">
                <Button type="button" variant="outline" onClick={() => setDmKey(dmKeyInput.trim())}>
                  Save DM Key
                </Button>
                {hasDmKey && (
                  <Button type="button" variant="ghost" onClick={() => { setDmKey(""); setDmKeyInput(""); }}>
                    Clear
                  </Button>
                )}
              </div>
            </div>

            <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
              <Badge variant={hasDmKey ? "secondary" : "outline"}>
                {hasDmKey ? "DM controls enabled" : "Viewer mode"}
              </Badge>
              <span>Supported uploads: PNG, WEBP, GIF up to 2MB.</span>
            </div>

            {hasDmKey && (
              <div className="mt-4 flex items-center gap-3">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/png,image/webp,image/gif"
                  className="hidden"
                  onChange={handleUploadFile}
                />
                <Button type="button" variant="magical" onClick={() => fileInputRef.current?.click()} disabled={isUploading}>
                  {isUploading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Upload className="mr-2 h-4 w-4" />}
                  Upload Pixel Art
                </Button>
              </div>
            )}
          </div>

          <ScrollArea className="max-h-[50vh]">
            {isLoading ? (
              <div className="flex items-center justify-center py-16 text-muted-foreground">
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                Loading library...
              </div>
            ) : assets.length === 0 ? (
              <div className="rounded-xl border border-dashed border-border bg-card/30 p-10 text-center text-muted-foreground">
                No pixel art has been uploaded yet.
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-4">
                {assets.map((asset) => {
                  const isSelected = selectedAssetId === asset.id;
                  return (
                    <div
                      key={asset.id}
                      className={`overflow-hidden rounded-xl border bg-card/60 transition-colors ${
                        isSelected ? "border-primary shadow-lg shadow-primary/10" : "border-border"
                      }`}
                    >
                      <button
                        type="button"
                        className="block w-full text-left"
                        onClick={() => setSelectedAssetId(asset.id)}
                      >
                        <div className="aspect-square bg-secondary/30">
                          <img src={asset.publicUrl} alt={asset.filename} className="h-full w-full object-contain" />
                        </div>
                        <div className="space-y-1 p-3">
                          <div className="truncate text-sm font-medium text-foreground">{asset.filename}</div>
                          <div className="text-xs text-muted-foreground">
                            {new Date(asset.createdAt).toLocaleDateString()}
                          </div>
                        </div>
                      </button>
                      {hasDmKey && (
                        <div className="border-t border-border/60 px-3 py-2">
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="w-full justify-center text-destructive hover:text-destructive"
                            onClick={() => handleDelete(asset.id)}
                            disabled={isDeleting}
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete
                          </Button>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </ScrollArea>

          <div className="flex flex-col gap-3 border-t border-border/60 pt-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="text-sm text-muted-foreground">
              {selectedAsset ? `Selected: ${selectedAsset.filename}` : "Select a shared pixel-art asset."}
            </div>
            <div className="flex gap-2">
              <Button type="button" variant="outline" onClick={() => onSelect(null)}>
                Clear Selection
              </Button>
              <Button
                type="button"
                variant="magical"
                disabled={!selectedAssetId}
                onClick={() => {
                  const asset = assets.find((entry) => entry.id === selectedAssetId);
                  if (!asset) return;
                  onSelect(asset.publicUrl);
                  onOpenChange(false);
                }}
              >
                Use Selected Art
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
