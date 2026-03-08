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
    <div className="group relative rounded-xl border bg-background shadow-sm hover:shadow-md transition-all duration-200 animate-fade-in">

      {/* Header */}
      <div className="flex items-center gap-2 px-4 py-2 border-b bg-muted/40 rounded-t-xl">
        <div className="flex items-center gap-2 text-muted-foreground">
          {hasCode ? (
            <Code className="w-4 h-4" />
          ) : (
            <FileText className="w-4 h-4" />
          )}
          <span className="text-xs font-mono uppercase tracking-wide">
            {cellType}
          </span>
          <span className="text-xs font-mono opacity-60">
            • Cell {index + 1}
          </span>
        </div>

        <div className="flex-1" />

        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 rounded-md hover:bg-muted"
            onClick={() => onEdit(note)}
          >
            <Pencil className="w-4 h-4" />
          </Button>

          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 rounded-md hover:bg-destructive/10 hover:text-destructive"
            onClick={() => onDelete(note.id)}
          >
            <Trash2 className="w-4 h-4" />
          </Button>

          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 rounded-md hover:bg-muted"
            onClick={() => setCollapsed(!collapsed)}
          >
            {collapsed ? (
              <ChevronRight className="w-4 h-4" />
            ) : (
              <ChevronDown className="w-4 h-4" />
            )}
          </Button>
        </div>
      </div>

      {!collapsed && (
        <div className="flex">

          {/* Gutter */}
          <div className="w-16 border-r bg-muted/20 flex items-start justify-end pr-3 pt-6">
            <span className="text-xs font-mono text-muted-foreground">
              [{index + 1}]:
            </span>
          </div>

          {/* Body */}
          <div className="flex-1 px-6 py-6 space-y-6 min-w-0">

            {/* Title */}
            <h3 className="text-lg font-semibold leading-snug">
              {note.title}
            </h3>

            {/* GitHub Permalink */}
            {note.permanentLink && (
              <div className="space-y-2">
                {hasCode ? (
                  <GitHubCodeBlock url={note.permanentLink} />
                ) : (
                  <a
                    href={note.permanentLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-primary hover:underline break-all font-mono"
                  >
                    {note.permanentLink}
                  </a>
                )}
              </div>
            )}

            {/* Tags as Badges */}
            {note.aiTags && note.aiTags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {note.aiTags.map((tag, i) => (
                  <span
                    key={i}
                    className="px-3 py-1 text-xs font-medium rounded-full bg-primary/10 text-primary border border-primary/20 hover:bg-primary/20 transition"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}

            {/* Description */}
            {note.note && (
              <div className="space-y-2">
                <div className="text-xs font-mono text-muted-foreground uppercase tracking-wide">
                  Description
                </div>
                <p className="text-sm leading-relaxed text-foreground/80 whitespace-pre-wrap">
                  {note.note}
                </p>
              </div>
            )}

          </div>
        </div>
      )}
    </div>
  );
}