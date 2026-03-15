import { useState, useEffect, useRef } from "react";
import { type CodeNote } from "@/lib/api";
import { isGitHubPermalink } from "@/lib/github";
import { GitHubCodeBlock } from "./GitHubCodeBlock";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { X, Plus, Link, Play, Loader2 } from "lucide-react";

interface NoteEditorProps {
  note?: CodeNote | null;
  onSave: (data: { title: string; description: string; permanentLink: string; aiTags: string[] }) => void;
  onCancel: () => void;
  saving?: boolean;
}

export function NoteEditor({ note, onSave, onCancel, saving }: NoteEditorProps) {
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [permanentLink, setPermanentLink] = useState("");
  const [tagInput, setTagInput] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const titleRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (note) {
      setTitle(note.title);
      setBody(note.description || "");
      setPermanentLink(note.permanentLink || "");
      setTags(note.aiTags || []);
    }
  }, [note]);

  useEffect(() => {
    setTimeout(() => titleRef.current?.focus(), 100);
  }, []);

  const addTag = () => {
    const t = tagInput.trim();
    if (t && !tags.includes(t)) {
      setTags([...tags, t]);
      setTagInput("");
    }
  };

  const removeTag = (tag: string) => setTags(tags.filter((t) => t !== tag));

  const handleSubmit = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!title.trim()) return;
    onSave({ title: title.trim(), description: body.trim(), permanentLink: permanentLink.trim(), aiTags: tags });
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if ((e.ctrlKey || e.metaKey) && e.key === "Enter") { e.preventDefault(); handleSubmit(); }
    if (e.key === "Escape") { e.preventDefault(); onCancel(); }
  };

  const showPreview = permanentLink && isGitHubPermalink(permanentLink);

  return (
    <form onSubmit={handleSubmit} onKeyDown={handleKeyDown} className="animate-fade-in">
      <div className="cell rounded-lg cell-active overflow-hidden">
        <div className="flex items-center justify-between px-3 py-2 cell-toolbar border-b border-border/50">
          <div className="flex items-center gap-2">
            <Play className="w-3.5 h-3.5 text-primary" />
            <span className="text-xs font-medium text-muted-foreground">
              {note ? "Edit Cell" : "New Cell"}
            </span>
            <span className="text-[10px] text-muted-foreground/50 hidden sm:inline">
              Ctrl+Enter to save • Esc to cancel
            </span>
          </div>
          <Button type="button" variant="ghost" size="icon" className="h-6 w-6 rounded hover:bg-muted" onClick={onCancel}>
            <X className="w-3.5 h-3.5" />
          </Button>
        </div>

        <div className="flex">
          <div className="flex-shrink-0 w-14 flex items-start justify-end pr-2 pt-3">
            <span className="execution-count select-none">[*]:</span>
          </div>

          <div className="flex-1 py-3 pr-4 space-y-4">
            <Input
              ref={titleRef}
              placeholder="# Title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="border-0 bg-transparent px-0 h-8 text-base font-semibold placeholder:text-muted-foreground/50 focus-visible:ring-0 focus-visible:ring-offset-0 rounded-none border-b border-border/30 focus-visible:border-primary"
              required
            />

            <div className="space-y-1.5">
              <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">### GitHub Permlink</h4>
              <div className="flex items-center gap-2 rounded-md bg-muted/50 px-2.5 py-1.5">
                <Link className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                <input
                  placeholder="https://github.com/owner/repo/blob/sha/file#L1-L10"
                  value={permanentLink}
                  onChange={(e) => setPermanentLink(e.target.value)}
                  className="flex-1 bg-transparent text-xs font-mono outline-none placeholder:text-muted-foreground/40"
                />
              </div>
              {showPreview && (
                <div className="pt-1">
                  <GitHubCodeBlock url={permanentLink} />
                </div>
              )}
            </div>

            <div className="space-y-1.5">
              <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">### Tags</h4>
              <div className="flex gap-2 items-center">
                <input
                  placeholder="Add tag and press Enter..."
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") { e.preventDefault(); e.stopPropagation(); addTag(); }
                  }}
                  className="flex-1 bg-transparent text-xs font-mono outline-none placeholder:text-muted-foreground/40 border-b border-border/30 py-1 focus:border-primary transition-colors"
                />
                <Button type="button" variant="ghost" size="sm" onClick={addTag} className="h-6 px-2 text-xs rounded hover:bg-muted">
                  <Plus className="w-3 h-3 mr-1" />
                  Tag
                </Button>
              </div>
              {tags.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mt-1">
                  {tags.map((tag) => (
                    <span
                      key={tag}
                      className="inline-flex items-center gap-1 px-2.5 py-0.5 text-xs font-medium rounded-full bg-primary/10 text-primary border border-primary/20 cursor-pointer hover:bg-destructive/10 hover:text-destructive hover:border-destructive/20 transition-colors"
                      onClick={() => removeTag(tag)}
                      title="Click to remove"
                    >
                      {tag}
                      <X className="w-3 h-3" />
                    </span>
                  ))}
                </div>
              )}
            </div>

            <div className="space-y-1.5">
              <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">### Description</h4>
              <Textarea
                placeholder="Write a concise description here (3-6 lines)..."
                value={body}
                onChange={(e) => setBody(e.target.value)}
                rows={4}
                className="border-0 bg-transparent px-0 text-sm placeholder:text-muted-foreground/50 focus-visible:ring-0 focus-visible:ring-offset-0 rounded-none resize-none min-h-[80px]"
              />
            </div>

            <div className="flex gap-2 pt-1 border-t border-border/30">
              <Button type="submit" disabled={saving || !title.trim()} size="sm" className="h-8 px-4 text-xs rounded-lg font-medium gap-1.5">
                {saving ? (<><Loader2 className="w-3 h-3 animate-spin" />Running...</>) : (<><Play className="w-3 h-3" />{note ? "Update Cell" : "Run Cell"}</>)}
              </Button>
              <Button type="button" variant="ghost" size="sm" onClick={onCancel} className="h-8 px-3 text-xs rounded-lg">
                Cancel
              </Button>
            </div>
          </div>
        </div>
      </div>
    </form>
  );
}
