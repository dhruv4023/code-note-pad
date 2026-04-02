import { useState } from "react";
import { type CodeNote } from "@/lib/api";
import { GitHubCodeBlock } from "./GitHubCodeBlock";
import { isGitHubPermalink } from "@/lib/github";
import { Pencil, Trash2, ChevronDown, ChevronRight, Code, FileText, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface NoteCardProps {
  note: CodeNote;
  index: number;
  onEdit: (note: CodeNote) => void;
  onDelete: (id: number) => void;
}

const SECTION_LABELS: Record<string, string> = {
  description: "Description",
  aiExplanation: "AI Explanation",
  aiSummary: "AI Summary",
  aiImprovements: "AI Improvements",
};

export function NoteCard({ note, index, onEdit, onDelete }: NoteCardProps) {
  const [collapsed, setCollapsed] = useState(false);
  const hasCode = note.permanentLink && isGitHubPermalink(note.permanentLink);
  const cellType = hasCode ? "Code" : "Markdown";

  const formattedDate = note.updatedAt || note.createdAt
    ? new Date(note.updatedAt || note.createdAt!).toLocaleDateString(undefined, {
        month: "short", day: "numeric", hour: "2-digit", minute: "2-digit",
      })
    : null;

  return (
    <div className="group relative rounded-xl border bg-background shadow-sm hover:shadow-md transition-all duration-200 animate-fade-in">
      {/* Header */}
      <div className="flex items-center gap-2 px-4 py-2 border-b bg-muted/40 rounded-t-xl">
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
        >
          {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          {hasCode ? <Code className="w-4 h-4" /> : <FileText className="w-4 h-4" />}
          <span className="text-xs font-mono uppercase tracking-wide">{cellType}</span>
          <span className="text-xs font-mono opacity-60">• Cell {index + 1}</span>
        </button>

        {collapsed && (
          <span className="text-xs text-muted-foreground truncate ml-2 max-w-[200px]">
            — {note.title}
          </span>
        )}

        <div className="flex-1" />

        {formattedDate && (
          <Tooltip>
            <TooltipTrigger asChild>
              <span className="text-[10px] text-muted-foreground/60 flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {formattedDate}
              </span>
            </TooltipTrigger>
            <TooltipContent side="bottom" className="text-xs">Last modified</TooltipContent>
          </Tooltip>
        )}

        <div className="flex items-center gap-1 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="icon" className="h-7 w-7 rounded-md hover:bg-muted" onClick={() => onEdit(note)}>
                <Pencil className="w-4 h-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="bottom" className="text-xs">Edit cell</TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="icon" className="h-7 w-7 rounded-md hover:bg-destructive/10 hover:text-destructive" onClick={() => onDelete(note.id)}>
                <Trash2 className="w-4 h-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="bottom" className="text-xs">Delete cell</TooltipContent>
          </Tooltip>
        </div>
      </div>

      {!collapsed && (
        <div className="flex">
          <div className="w-10 sm:w-16 border-r bg-muted/20 flex items-start justify-end pr-2 sm:pr-3 pt-4 sm:pt-6">
            <span className="text-[10px] sm:text-xs font-mono text-muted-foreground">[{index + 1}]:</span>
          </div>

          <div className="flex-1 px-3 sm:px-6 py-4 sm:py-6 space-y-4 sm:space-y-5 min-w-0">
            <h3 className="text-lg font-semibold leading-snug">{note.title}</h3>

            {note.permanentLink && (
              <div className="space-y-2">
                {hasCode ? (
                  <GitHubCodeBlock url={note.permanentLink} />
                ) : (
                  <a href={note.permanentLink} target="_blank" rel="noopener noreferrer" className="text-sm text-primary hover:underline break-all font-mono">
                    {note.permanentLink}
                  </a>
                )}
              </div>
            )}

            {note.aiTags && note.aiTags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {note.aiTags.map((tag, i) => (
                  <span key={i} className="px-3 py-1 text-xs font-medium rounded-full bg-primary/10 text-primary border border-primary/20 hover:bg-primary/20 transition">
                    {tag}
                  </span>
                ))}
              </div>
            )}

            {Object.keys(SECTION_LABELS).map((key) =>
              note[key] ? (
                <div key={key} className="space-y-2">
                  <div className="text-xs font-mono text-muted-foreground uppercase tracking-wide">
                    {SECTION_LABELS[key]}
                  </div>
                  <p className="text-sm leading-relaxed text-foreground/80 whitespace-pre-wrap">
                    {note[key]}
                  </p>
                </div>
              ) : null
            )}
          </div>
        </div>
      )}
    </div>
  );
}
