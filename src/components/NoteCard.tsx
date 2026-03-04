import { useState } from "react";
import { type CodeNote } from "@/lib/api";
import { GitHubCodeBlock } from "./GitHubCodeBlock";
import { isGitHubPermalink } from "@/lib/github";
import { Pencil, Trash2, ChevronDown, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

interface NoteCardProps {
  note: CodeNote;
  index: number;
  onEdit: (note: CodeNote) => void;
  onDelete: (id: number) => void;
}

export function NoteCard({ note, index, onEdit, onDelete }: NoteCardProps) {
  const [collapsed, setCollapsed] = useState(false);
  const hasCode = note.permanentLink && isGitHubPermalink(note.permanentLink);

  return (
    <div className="group cell rounded-lg animate-fade-in hover:shadow-sm">
      {/* Cell toolbar */}
      <div className="flex items-center gap-1 px-2 py-1 border-b border-border/50 opacity-0 group-hover:opacity-100 transition-opacity">
        <Button variant="ghost" size="icon" className="h-6 w-6 rounded hover:bg-muted" onClick={() => onEdit(note)}>
          <Pencil className="w-3 h-3" />
        </Button>
        <Button variant="ghost" size="icon" className="h-6 w-6 rounded hover:bg-destructive/10 hover:text-destructive" onClick={() => onDelete(note.id)}>
          <Trash2 className="w-3 h-3" />
        </Button>
        <div className="flex-1" />
        <Button variant="ghost" size="icon" className="h-6 w-6 rounded hover:bg-muted" onClick={() => setCollapsed(!collapsed)}>
          {collapsed ? <ChevronRight className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
        </Button>
      </div>

      {!collapsed && (
        <div className="flex">
          {/* Execution count gutter */}
          <div className="flex-shrink-0 w-14 flex items-start justify-end pr-2 pt-3">
            <span className="execution-count select-none">[{index + 1}]:</span>
          </div>

          {/* Cell content — Jupyter markdown cell style */}
          <div className="flex-1 py-3 pr-4 space-y-4 min-w-0">
            {/* Title */}
            <h3 className="text-base font-semibold leading-snug">{note.title}</h3>

            {/* Section 1: GitHub Permlink */}
            {note.permanentLink && (
              <div className="space-y-1.5">
                <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">### GitHub Permlink</h4>
                {hasCode ? (
                  <GitHubCodeBlock url={note.permanentLink} />
                ) : (
                  <a
                    href={note.permanentLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-primary hover:underline break-all font-mono inline-block"
                  >
                    {note.permanentLink}
                  </a>
                )}
              </div>
            )}

            {/* Section 2: Tags */}
            {note.aiTags && note.aiTags.length > 0 && (
              <div className="space-y-1.5">
                <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">### Tags</h4>
                <p className="text-sm text-foreground/80 font-mono">{note.aiTags.join(", ")}</p>
              </div>
            )}

            {/* Section 3: Description */}
            {note.note && (
              <div className="space-y-1.5">
                <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">### Description</h4>
                <p className="text-sm text-foreground/80 leading-relaxed whitespace-pre-wrap">{note.note}</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
