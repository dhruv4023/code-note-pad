import { useState } from "react";
import { type Notebook } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  BookOpen,
  Plus,
  ChevronLeft,
  ChevronRight,
  Loader2,
  Pencil,
  X,
  Check,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface NotebookSidebarProps {
  notebooks: Notebook[];
  activeId: number | null;
  loading: boolean;
  onSelect: (nb: Notebook) => void;
  onAdd: (name: string, description: string) => Promise<void>;
  onUpdate: (id: number, name: string, description: string) => Promise<void>;
}

export function NotebookSidebar({
  notebooks,
  activeId,
  loading,
  onSelect,
  onAdd,
  onUpdate,
}: NotebookSidebarProps) {
  const [collapsed, setCollapsed] = useState(false);
  const [creating, setCreating] = useState(false);
  const [newName, setNewName] = useState("");
  const [newDesc, setNewDesc] = useState("");
  const [saving, setSaving] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editName, setEditName] = useState("");
  const [editDesc, setEditDesc] = useState("");

  const handleCreate = async () => {
    if (!newName.trim()) return;
    setSaving(true);
    try {
      await onAdd(newName.trim(), newDesc.trim());
      setNewName("");
      setNewDesc("");
      setCreating(false);
    } finally {
      setSaving(false);
    }
  };

  const handleUpdate = async () => {
    if (!editName.trim() || editingId === null) return;
    setSaving(true);
    try {
      await onUpdate(editingId, editName.trim(), editDesc.trim());
      setEditingId(null);
    } finally {
      setSaving(false);
    }
  };

  const startEdit = (nb: Notebook, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingId(nb.id);
    setEditName(nb.name);
    setEditDesc(nb.description || "");
  };

  if (collapsed) {
    return (
      <div className="w-12 border-r border-border bg-sidebar-background flex flex-col items-center py-3 gap-2 shrink-0">
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 rounded-md hover:bg-sidebar-accent"
          onClick={() => setCollapsed(false)}
        >
          <ChevronRight className="w-4 h-4" />
        </Button>
        <div className="w-6 h-px bg-border my-1" />
        {notebooks.map((nb) => (
          <Button
            key={nb.id}
            variant="ghost"
            size="icon"
            className={cn(
              "h-8 w-8 rounded-md text-xs font-bold",
              activeId === nb.id
                ? "bg-primary/10 text-primary"
                : "hover:bg-sidebar-accent text-muted-foreground"
            )}
            onClick={() => onSelect(nb)}
            title={nb.name}
          >
            {nb.name.charAt(0).toUpperCase()}
          </Button>
        ))}
      </div>
    );
  }

  return (
    <div className="w-64 border-r border-border bg-sidebar-background flex flex-col shrink-0">
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-3 border-b border-border">
        <div className="flex items-center gap-2">
          <BookOpen className="w-4 h-4 text-primary" />
          <span className="text-sm font-semibold">Notebooks</span>
        </div>
        <div className="flex items-center gap-0.5">
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 rounded-md hover:bg-sidebar-accent"
            onClick={() => setCreating(true)}
            title="New notebook"
          >
            <Plus className="w-3.5 h-3.5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 rounded-md hover:bg-sidebar-accent"
            onClick={() => setCollapsed(true)}
          >
            <ChevronLeft className="w-3.5 h-3.5" />
          </Button>
        </div>
      </div>

      {/* Create form */}
      {creating && (
        <div className="p-3 border-b border-border space-y-2 animate-fade-in">
          <Input
            placeholder="Notebook name"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            className="h-8 text-xs"
            autoFocus
            onKeyDown={(e) => e.key === "Escape" && setCreating(false)}
          />
          <Textarea
            placeholder="Description (optional)"
            value={newDesc}
            onChange={(e) => setNewDesc(e.target.value)}
            rows={2}
            className="text-xs resize-none min-h-[48px]"
          />
          <div className="flex gap-1.5">
            <Button
              size="sm"
              className="h-7 text-xs flex-1 rounded-md"
              disabled={saving || !newName.trim()}
              onClick={handleCreate}
            >
              {saving ? <Loader2 className="w-3 h-3 animate-spin" /> : "Create"}
            </Button>
            <Button
              size="sm"
              variant="ghost"
              className="h-7 text-xs rounded-md"
              onClick={() => setCreating(false)}
            >
              Cancel
            </Button>
          </div>
        </div>
      )}

      {/* Notebook list */}
      <div className="flex-1 overflow-y-auto scrollbar-thin py-1">
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
          </div>
        ) : notebooks.length === 0 ? (
          <div className="px-3 py-8 text-center">
            <p className="text-xs text-muted-foreground">No notebooks yet</p>
            <Button
              size="sm"
              variant="outline"
              className="h-7 text-xs mt-2 rounded-md"
              onClick={() => setCreating(true)}
            >
              <Plus className="w-3 h-3 mr-1" />
              Create one
            </Button>
          </div>
        ) : (
          notebooks.map((nb) => (
            <div key={nb.id}>
              {editingId === nb.id ? (
                <div className="px-3 py-2 space-y-1.5 bg-muted/50 animate-fade-in">
                  <Input
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    className="h-7 text-xs"
                    autoFocus
                  />
                  <Textarea
                    value={editDesc}
                    onChange={(e) => setEditDesc(e.target.value)}
                    rows={2}
                    className="text-xs resize-none min-h-[40px]"
                  />
                  <div className="flex gap-1">
                    <Button
                      size="icon"
                      className="h-6 w-6 rounded-md"
                      disabled={saving || !editName.trim()}
                      onClick={handleUpdate}
                    >
                      {saving ? (
                        <Loader2 className="w-3 h-3 animate-spin" />
                      ) : (
                        <Check className="w-3 h-3" />
                      )}
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-6 w-6 rounded-md"
                      onClick={() => setEditingId(null)}
                    >
                      <X className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
              ) : (
                <button
                  onClick={() => onSelect(nb)}
                  className={cn(
                    "w-full text-left px-3 py-2.5 flex items-start gap-2 group/item transition-colors",
                    activeId === nb.id
                      ? "bg-primary/10 border-l-2 border-primary"
                      : "hover:bg-sidebar-accent border-l-2 border-transparent"
                  )}
                >
                  <BookOpen
                    className={cn(
                      "w-3.5 h-3.5 mt-0.5 shrink-0",
                      activeId === nb.id ? "text-primary" : "text-muted-foreground"
                    )}
                  />
                  <div className="flex-1 min-w-0">
                    <p
                      className={cn(
                        "text-xs font-medium truncate",
                        activeId === nb.id ? "text-primary" : "text-foreground"
                      )}
                    >
                      {nb.name}
                    </p>
                    {nb.description && (
                      <p className="text-[10px] text-muted-foreground truncate mt-0.5">
                        {nb.description}
                      </p>
                    )}
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 rounded-md opacity-0 group-hover/item:opacity-100 shrink-0"
                    onClick={(e) => startEdit(nb, e)}
                  >
                    <Pencil className="w-3 h-3" />
                  </Button>
                </button>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
