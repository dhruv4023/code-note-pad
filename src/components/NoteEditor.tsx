import { useState, useEffect } from "react";
import { type CodeNote } from "@/lib/api";
import { isGitHubPermalink } from "@/lib/github";
import { GitHubCodeBlock } from "./GitHubCodeBlock";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { X, Plus, Link, Play } from "lucide-react";

interface NoteEditorProps {
  note?: CodeNote | null;
  onSave: (data: { title: string; note: string; permanentLink: string; aiTags: string[] }) => void;
  onCancel: () => void;
  saving?: boolean;
}

export function NoteEditor({ note, onSave, onCancel, saving }: NoteEditorProps) {
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [permanentLink, setPermanentLink] = useState("");
  const [tagInput, setTagInput] = useState("");
  const [tags, setTags] = useState<string[]>([]);

  useEffect(() => {
    if (note) {
      setTitle(note.title);
      setBody(note.note);
      setPermanentLink(note.permanentLink || "");
      setTags(note.aiTags || []);
    }
  }, [note]);

  const addTag = () => {
    const t = tagInput.trim();
    if (t && !tags.includes(t)) {
      setTags([...tags, t]);
      setTagInput("");
    }
  };

  const removeTag = (tag: string) => setTags(tags.filter((t) => t !== tag));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    onSave({ title: title.trim(), note: body.trim(), permanentLink: permanentLink.trim(), aiTags: tags });
  };

  const showPreview = permanentLink && isGitHubPermalink(permanentLink);

  return (
    <form onSubmit={handleSubmit} className="animate-fade-in">
      <div className="cell rounded-lg cell-active overflow-hidden">
        {/* Cell header */}
        <div className="flex items-center justify-between px-3 py-2 cell-toolbar border-b border-border/50">
          <div className="flex items-center gap-2">
            <Play className="w-3.5 h-3.5 text-primary" />
            <span className="text-xs font-medium text-muted-foreground">
              {note ? "Edit Cell" : "New Cell"}
            </span>
          </div>
          <Button type="button" variant="ghost" size="icon" className="h-6 w-6 rounded hover:bg-muted" onClick={onCancel}>
            <X className="w-3.5 h-3.5" />
          </Button>
        </div>

        <div className="flex">
          {/* Gutter */}
          <div className="flex-shrink-0 w-14 flex items-start justify-end pr-2 pt-3">
            <span className="execution-count select-none">[*]:</span>
          </div>

          {/* Editor content — mirrors the 3-section output */}
          <div className="flex-1 py-3 pr-4 space-y-4">
            {/* Title */}
            <Input
              placeholder="# Title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="border-0 bg-transparent px-0 h-8 text-base font-semibold placeholder:text-muted-foreground/50 focus-visible:ring-0 focus-visible:ring-offset-0 rounded-none border-b border-border/30 focus-visible:border-primary"
              required
            />

            {/* Section 1: GitHub Permlink */}
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

            {/* Section 2: Tags */}
            <div className="space-y-1.5">
              <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">### Tags</h4>
              <div className="flex gap-2 items-center">
                <input
                  placeholder="Add tag and press Enter..."
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      addTag();
                    }
                  }}
                  className="flex-1 bg-transparent text-xs font-mono outline-none placeholder:text-muted-foreground/40 border-b border-border/30 py-1 focus:border-primary transition-colors"
                />
                <Button type="button" variant="ghost" size="sm" onClick={addTag} className="h-6 px-2 text-xs rounded hover:bg-muted">
                  <Plus className="w-3 h-3 mr-1" />
                  Tag
                </Button>
              </div>
              {tags.length > 0 && (
                <p className="text-sm text-foreground/80 font-mono">
                  {tags.map((tag, i) => (
                    <span key={tag}>
                      <span
                        className="cursor-pointer hover:text-destructive transition-colors"
                        onClick={() => removeTag(tag)}
                        title="Click to remove"
                      >
                        {tag}
                      </span>
                      {i < tags.length - 1 && ", "}
                    </span>
                  ))}
                </p>
              )}
            </div>

            {/* Section 3: Description */}
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

            {/* Actions */}
            <div className="flex gap-2 pt-1 border-t border-border/30">
              <Button
                type="submit"
                disabled={saving || !title.trim()}
                size="sm"
                className="h-7 px-4 text-xs rounded font-medium"
              >
                {saving ? "Running..." : note ? "Update" : "Run Cell"}
              </Button>
              <Button type="button" variant="ghost" size="sm" onClick={onCancel} className="h-7 px-3 text-xs rounded">
                Cancel
              </Button>
            </div>
          </div>
        </div>
      </div>
    </form>
  );
}
