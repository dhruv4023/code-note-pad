import { useState } from "react";
import { type CodeNote } from "@/lib/api";
import { GitHubCodeBlock } from "./GitHubCodeBlock";
import { isGitHubPermalink } from "@/lib/github";
import { Pencil, Trash2, Play, MoreHorizontal, ChevronDown, ChevronRight } from "lucide-react";
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
      {/* Cell toolbar - appears on hover */}
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

          {/* Cell content */}
          <div className="flex-1 py-3 pr-4 space-y-2 min-w-0">
            {/* Title as markdown heading */}
            <h3 className="font-semibold text-sm leading-snug">{note.title}</h3>

            {/* Note text as paragraph */}
            {note.note && (
              <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-wrap">{note.note}</p>
            )}

            {/* Code block if permalink */}
            {hasCode && (
              <div className="mt-2">
                <GitHubCodeBlock url={note.permanentLink!} />
              </div>
            )}

            {/* Non-GitHub link */}
            {note.permanentLink && !hasCode && (
              <a
                href={note.permanentLink}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-primary hover:underline break-all inline-block"
              >
                🔗 {note.permanentLink}
              </a>
            )}

            {/* Tags as badges */}
            {note.aiTags && note.aiTags.length > 0 && (
              <div className="flex items-center gap-1 flex-wrap pt-1">
                {note.aiTags.map((tag) => (
                  <span key={tag} className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium bg-tag-bg text-tag-foreground font-mono">
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
