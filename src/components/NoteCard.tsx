import { useState } from "react";
import { type CodeNote } from "@/lib/api";
import { GitHubCodeBlock } from "./GitHubCodeBlock";
import { isGitHubPermalink } from "@/lib/github";
import { Pencil, Trash2, ChevronDown, ChevronRight, Code, FileText } from "lucide-react";
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
  const cellType = hasCode ? "Code" : "Markdown";

  return (
    <div className="group cell rounded-lg animate-fade-in">
      {/* Cell header bar */}
      <div className="flex items-center gap-2 px-3 py-1.5 border-b border-border/50 cell-toolbar">
        <div className="flex items-center gap-1.5 text-muted-foreground">
          {hasCode ? <Code className="w-3 h-3" /> : <FileText className="w-3 h-3" />}
          <span className="text-[10px] font-mono uppercase">{cellType}</span>
          <span className="text-[10px] font-mono text-muted-foreground/60">• Cell {index + 1}</span>
        </div>
        <div className="flex-1" />
        <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
          <Button variant="ghost" size="icon" className="h-5 w-5 rounded hover:bg-muted" onClick={() => onEdit(note)}>
            <Pencil className="w-2.5 h-2.5" />
          </Button>
          <Button variant="ghost" size="icon" className="h-5 w-5 rounded hover:bg-destructive/10 hover:text-destructive" onClick={() => onDelete(note.id)}>
            <Trash2 className="w-2.5 h-2.5" />
          </Button>
          <Button variant="ghost" size="icon" className="h-5 w-5 rounded hover:bg-muted" onClick={() => setCollapsed(!collapsed)}>
            {collapsed ? <ChevronRight className="w-2.5 h-2.5" /> : <ChevronDown className="w-2.5 h-2.5" />}
          </Button>
        </div>
      </div>

      {!collapsed && (
        <div className="flex">
          {/* Gutter */}
          <div className="flex-shrink-0 w-16 flex items-start justify-end pr-3 pt-4 border-r border-border/30">
            <span className="execution-count select-none">[{index + 1}]:</span>
          </div>

          {/* Cell body */}
          <div className="flex-1 py-4 px-5 space-y-5 min-w-0">
            {/* Title */}
            <h3 className="text-base font-semibold leading-snug border-b border-border/30 pb-2">{note.title}</h3>

            {/* ### GitHub Permlink */}
            {note.permanentLink && (
              <div className="space-y-2">
                <div className="text-[11px] font-semibold text-muted-foreground font-mono">### GitHub Permlink</div>
                {hasCode ? (
                  <GitHubCodeBlock url={note.permanentLink} />
                ) : (
                  <a href={note.permanentLink} target="_blank" rel="noopener noreferrer"
                    className="text-xs text-primary hover:underline break-all font-mono block pl-1">
                    {note.permanentLink}
                  </a>
                )}
              </div>
            )}

            {/* ### Tags */}
            {note.aiTags && note.aiTags.length > 0 && (
              <div className="space-y-1.5">
                <div className="text-[11px] font-semibold text-muted-foreground font-mono">### Tags</div>
                <p className="text-sm text-foreground/80 font-mono pl-1">{note.aiTags.join(", ")}</p>
              </div>
            )}

            {/* ### Description */}
            {note.note && (
              <div className="space-y-1.5">
                <div className="text-[11px] font-semibold text-muted-foreground font-mono">### Description</div>
                <p className="text-sm text-foreground/80 leading-relaxed whitespace-pre-wrap pl-1">{note.note}</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
