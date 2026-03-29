import { Plus, GitPullRequest } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface AddCellButtonProps {
  onClick: () => void;
  onPrImport: () => void;
}

export function AddCellButton({ onClick, onPrImport }: AddCellButtonProps) {
  return (
    <div className="group/add flex items-center justify-center py-1 relative">
      <div className="absolute inset-x-8 h-px bg-border/0 group-hover/add:bg-border transition-colors" />
      <div className="relative z-10 flex items-center gap-1 opacity-0 group-hover/add:opacity-100 transition-all">
        <Tooltip>
          <TooltipTrigger asChild>
            <button
              onClick={onClick}
              className="flex items-center gap-1 px-3 py-1 text-[10px] font-medium text-muted-foreground/50 hover:text-primary hover:bg-primary/5 rounded-md transition-all"
            >
              <Plus className="w-3 h-3" />
              Cell
            </button>
          </TooltipTrigger>
          <TooltipContent side="bottom" className="text-xs">Insert a new cell</TooltipContent>
        </Tooltip>
        <Tooltip>
          <TooltipTrigger asChild>
            <button
              onClick={onPrImport}
              className="flex items-center gap-1 px-3 py-1 text-[10px] font-medium text-muted-foreground/50 hover:text-accent-foreground hover:bg-accent/10 rounded-md transition-all"
            >
              <GitPullRequest className="w-3 h-3" />
              PR
            </button>
          </TooltipTrigger>
          <TooltipContent side="bottom" className="text-xs">Import cells from a GitHub PR</TooltipContent>
        </Tooltip>
      </div>
    </div>
  );
}
