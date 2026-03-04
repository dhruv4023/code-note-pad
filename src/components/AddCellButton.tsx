import { Plus } from "lucide-react";

interface AddCellButtonProps {
  onClick: () => void;
}

export function AddCellButton({ onClick }: AddCellButtonProps) {
  return (
    <div className="group/add flex items-center justify-center py-1 relative">
      {/* Horizontal line */}
      <div className="absolute inset-x-8 h-px bg-border/0 group-hover/add:bg-border transition-colors" />
      <button
        onClick={onClick}
        className="relative z-10 flex items-center gap-1 px-3 py-1 text-[10px] font-medium text-muted-foreground/50 hover:text-primary hover:bg-primary/5 rounded-md transition-all opacity-0 group-hover/add:opacity-100"
      >
        <Plus className="w-3 h-3" />
        Insert Cell
      </button>
    </div>
  );
}
