import { type CodeNote } from "@/lib/api";
import { GitHubCodeBlock } from "./GitHubCodeBlock";
import { isGitHubPermalink } from "@/lib/github";
import { Pencil, Trash2, Tag } from "lucide-react";
import { Button } from "@/components/ui/button";

interface NoteCardProps {
  note: CodeNote;
  onEdit: (note: CodeNote) => void;
  onDelete: (id: number) => void;
}

export function NoteCard({ note, onEdit, onDelete }: NoteCardProps) {
  return (
    <div className="group rounded-2xl border border-border/50 glass p-5 space-y-3 animate-fade-in hover:glow-sm hover:border-primary/30 transition-all duration-300">
      {/* Title & actions */}
      <div className="flex items-start justify-between gap-3">
        <h3 className="font-semibold text-sm leading-snug">{note.title}</h3>
        <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
          <Button variant="ghost" size="icon" className="h-7 w-7 rounded-lg hover:bg-primary/10 hover:text-primary" onClick={() => onEdit(note)}>
            <Pencil className="w-3.5 h-3.5" />
          </Button>
          <Button variant="ghost" size="icon" className="h-7 w-7 rounded-lg hover:bg-destructive/10 hover:text-destructive" onClick={() => onDelete(note.id)}>
            <Trash2 className="w-3.5 h-3.5" />
          </Button>
        </div>
      </div>

      {/* Note text */}
      {note.note && (
        <p className="text-sm text-muted-foreground leading-relaxed">{note.note}</p>
      )}

      {/* Code block if permalink */}
      {note.permanentLink && isGitHubPermalink(note.permanentLink) && (
        <GitHubCodeBlock url={note.permanentLink} />
      )}

      {/* Non-GitHub link */}
      {note.permanentLink && !isGitHubPermalink(note.permanentLink) && (
        <a
          href={note.permanentLink}
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs text-primary hover:underline break-all"
        >
          {note.permanentLink}
        </a>
      )}

      {/* Tags */}
      {note.aiTags && note.aiTags.length > 0 && (
        <div className="flex items-center gap-1.5 flex-wrap pt-1">
          <Tag className="w-3 h-3 text-muted-foreground" />
          {note.aiTags.map((tag) => (
            <span key={tag} className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-tag-bg text-tag-foreground">
              {tag}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
