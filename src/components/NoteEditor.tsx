import { useState, useEffect } from "react";
import { type CodeNote } from "@/lib/api";
import { isGitHubPermalink } from "@/lib/github";
import { GitHubCodeBlock } from "./GitHubCodeBlock";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { X, Plus, Link } from "lucide-react";

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
    <form onSubmit={handleSubmit} className="space-y-4 animate-fade-in">
      <div className="flex items-center justify-between">
        <h2 className="text-base font-bold">{note ? "Edit Note" : "New Note"}</h2>
        <Button type="button" variant="ghost" size="icon" className="h-8 w-8 rounded-xl hover:bg-primary/10" onClick={onCancel}>
          <X className="w-4 h-4" />
        </Button>
      </div>

      <Input
        placeholder="Title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        className="bg-secondary/30 border-border/50 rounded-xl h-11"
        required
      />

      <Textarea
        placeholder="Write your note..."
        value={body}
        onChange={(e) => setBody(e.target.value)}
        rows={4}
        className="bg-secondary/30 border-border/50 rounded-xl resize-none"
      />

      <div className="space-y-2">
        <div className="relative">
          <Link className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="GitHub permanent link (e.g. https://github.com/...#L1-L10)"
            value={permanentLink}
            onChange={(e) => setPermanentLink(e.target.value)}
            className="pl-10 bg-secondary/30 border-border/50 rounded-xl font-mono text-xs"
          />
        </div>

        {showPreview && (
          <div className="pt-1">
            <GitHubCodeBlock url={permanentLink} />
          </div>
        )}
      </div>

      {/* Tags */}
      <div className="space-y-2">
        <div className="flex gap-2">
          <Input
            placeholder="Add tag..."
            value={tagInput}
            onChange={(e) => setTagInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                addTag();
              }
            }}
            className="bg-secondary/30 border-border/50 rounded-xl text-sm"
          />
          <Button type="button" variant="secondary" size="sm" onClick={addTag} className="shrink-0 rounded-xl">
            <Plus className="w-3.5 h-3.5 mr-1" />
            Tag
          </Button>
        </div>
        {tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {tags.map((tag) => (
              <span
                key={tag}
                className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-tag-bg text-tag-foreground"
              >
                {tag}
                <button type="button" onClick={() => removeTag(tag)} className="hover:text-destructive transition-colors">
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))}
          </div>
        )}
      </div>

      <div className="flex gap-2 pt-2">
        <Button type="submit" disabled={saving || !title.trim()} className="flex-1 rounded-xl glow-sm h-11 font-semibold">
          {saving ? "Saving..." : note ? "Update Note" : "Add Note"}
        </Button>
        <Button type="button" variant="outline" onClick={onCancel} className="rounded-xl h-11">
          Cancel
        </Button>
      </div>
    </form>
  );
}
