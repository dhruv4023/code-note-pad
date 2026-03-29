import { useState, useEffect, useCallback, useRef } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { AppHeader } from "@/components/AppHeader";
import { NoteCard } from "@/components/NoteCard";
import { NoteEditor } from "@/components/NoteEditor";
import { AddCellButton } from "@/components/AddCellButton";
import { PrImportDialog } from "@/components/PrImportDialog";
import { NotebookSidebar } from "@/components/NotebookSidebar";
import {
  getAllNotebooks,
  addNotebook,
  updateNotebook,
  getNotesByNotebook,
  addNote,
  updateNote,
  deleteNote,
  addPrNotesByPosition,
  type CodeNote,
  type Notebook,
} from "@/lib/api";
import { Search, BookOpen, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export default function Index() {
  const { isAuthenticated } = useAuth();

  // Notebooks
  const [notebooks, setNotebooks] = useState<Notebook[]>([]);
  const [notebooksLoading, setNotebooksLoading] = useState(true);
  const [activeNotebook, setActiveNotebook] = useState<Notebook | null>(null);

  // Notes
  const [notes, setNotes] = useState<CodeNote[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [search, setSearch] = useState("");
  const [editing, setEditing] = useState<CodeNote | null>(null);
  const [editorPosition, setEditorPosition] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [deleteTarget, setDeleteTarget] = useState<number | null>(null);
  const [prImportPosition, setPrImportPosition] = useState<number | null>(null);
  const sentinelRef = useRef<HTMLDivElement>(null);
  const PAGE_SIZE = 20;

  // Fetch notebooks
  const fetchNotebooks = useCallback(async () => {
    if (!isAuthenticated) return;
    setNotebooksLoading(true);
    try {
      const res = await getAllNotebooks();
      const list = res.data || [];
      setNotebooks(list);
      // Auto-select first notebook if none selected
      if (!activeNotebook && list.length > 0) {
        setActiveNotebook(list[0]);
      }
    } catch {
      toast.error("Failed to load notebooks");
    } finally {
      setNotebooksLoading(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    fetchNotebooks();
  }, [fetchNotebooks]);

  // Fetch notes for active notebook
  const fetchNotes = useCallback(
    async (pageNum: number, append = false) => {
      if (!isAuthenticated || !activeNotebook) return;
      if (pageNum === 0) setLoading(true);
      else setLoadingMore(true);
      try {
        const res = await getNotesByNotebook(activeNotebook.id, pageNum, PAGE_SIZE);
        const fetched = res.data || [];
        if (append) setNotes((prev) => [...prev, ...fetched]);
        else setNotes(fetched);
        setHasMore(fetched.length >= PAGE_SIZE);
      } catch {
        toast.error("Failed to load notes");
      } finally {
        setLoading(false);
        setLoadingMore(false);
      }
    },
    [isAuthenticated, activeNotebook]
  );

  useEffect(() => {
    if (activeNotebook) {
      setPage(0);
      setNotes([]);
      fetchNotes(0);
    }
  }, [activeNotebook, fetchNotes]);

  // Infinite scroll
  useEffect(() => {
    if (!sentinelRef.current || !hasMore || loading || loadingMore) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !loadingMore) {
          const nextPage = page + 1;
          setPage(nextPage);
          fetchNotes(nextPage, true);
        }
      },
      { threshold: 0.1 }
    );
    observer.observe(sentinelRef.current);
    return () => observer.disconnect();
  }, [hasMore, loading, loadingMore, page, fetchNotes]);

  // Ctrl+N for new cell
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "n") {
        e.preventDefault();
        if (activeNotebook) openNewAt(0);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [activeNotebook]);

  const getBeforeAfterIds = () => {
    if (editorPosition === null) return { beforeId: null, afterId: null };
    if (editorPosition === 0) return { beforeId: null, afterId: filteredNotes[0]?.id ?? null };
    if (editorPosition >= filteredNotes.length)
      return { beforeId: filteredNotes[filteredNotes.length - 1]?.id ?? null, afterId: null };
    return {
      beforeId: filteredNotes[editorPosition - 1]?.id ?? null,
      afterId: filteredNotes[editorPosition]?.id ?? null,
    };
  };

  const handleSave = async (data: { title: string; description: string; permanentLink: string; aiTags: string[] }) => {
    if (!activeNotebook) return;
    setSaving(true);
    try {
      if (editing) {
        await updateNote(editing.id, data);
        toast.success("Cell updated");
      } else {
        const { beforeId, afterId } = getBeforeAfterIds();
        await addNote({
          entry: { ...data, notebookId: activeNotebook.id },
          afterId,
          beforeId,
        });
        toast.success("Cell added");
      }
      setEditorPosition(null);
      setEditing(null);
      setPage(0);
      fetchNotes(0);
    } catch (err: any) {
      toast.error(err.message || "Failed to save");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = (id: number) => setDeleteTarget(id);

  const confirmDelete = async () => {
    if (deleteTarget === null) return;
    try {
      await deleteNote(deleteTarget);
      toast.success("Cell deleted");
      setPage(0);
      fetchNotes(0);
    } catch {
      toast.error("Failed to delete");
    } finally {
      setDeleteTarget(null);
    }
  };

  const handleEdit = (note: CodeNote) => {
    setEditing(note);
    const idx = filteredNotes.findIndex((n) => n.id === note.id);
    setEditorPosition(idx);
  };

  const openNewAt = (position: number) => {
    setEditing(null);
    setEditorPosition(position);
  };

  const closeEditor = () => {
    setEditorPosition(null);
    setEditing(null);
  };

  const openPrImportAt = (position: number) => {
    setPrImportPosition(position);
  };

  const handlePrImport = async (prLink: string) => {
    if (!activeNotebook) return;
    const pos = prImportPosition ?? 0;
    let afterId: number | null = null;
    let beforeId: number | null = null;
    if (pos === 0) {
      beforeId = null;
      afterId = filteredNotes[0]?.id ?? null;
    } else if (pos >= filteredNotes.length) {
      beforeId = filteredNotes[filteredNotes.length - 1]?.id ?? null;
      afterId = null;
    } else {
      beforeId = filteredNotes[pos - 1]?.id ?? null;
      afterId = filteredNotes[pos]?.id ?? null;
    }
    await addPrNotesByPosition({ prLink, notebookId: activeNotebook.id, afterId, beforeId });
    toast.success("PR notes imported");
    setPrImportPosition(null);
    setPage(0);
    fetchNotes(0);
  };

  const handleAddNotebook = async (name: string, description: string) => {
    await addNotebook({ name, description });
    toast.success("Notebook created");
    fetchNotebooks();
  };

  const handleUpdateNotebook = async (id: number, name: string, description: string) => {
    await updateNotebook(id, { name, description });
    toast.success("Notebook updated");
    fetchNotebooks();
  };

  const handleSelectNotebook = (nb: Notebook) => {
    closeEditor();
    setActiveNotebook(nb);
  };

  const filteredNotes = notes.filter(
    (n) =>
      n.title.toLowerCase().includes(search.toLowerCase()) ||
      n.description?.toLowerCase().includes(search.toLowerCase()) ||
      n.aiTags?.some((t) => t.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <AppHeader onNewNote={activeNotebook ? () => openNewAt(0) : undefined} />

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <NotebookSidebar
          notebooks={notebooks}
          activeId={activeNotebook?.id ?? null}
          loading={notebooksLoading}
          onSelect={handleSelectNotebook}
          onAdd={handleAddNotebook}
          onUpdate={handleUpdateNotebook}
        />

        {/* Main content */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Notebook title bar */}
          {activeNotebook && (
            <div className="border-b border-border shrink-0">
              <div className="max-w-4xl mx-auto px-4 py-3 flex items-center gap-3">
                <div className="flex items-center gap-2 flex-1 min-w-0">
                  <BookOpen className="w-4 h-4 text-primary shrink-0" />
                  <span className="text-sm font-medium truncate">{activeNotebook.name}</span>
                  {activeNotebook.description && (
                    <span className="text-[10px] text-muted-foreground truncate hidden sm:inline">
                      — {activeNotebook.description}
                    </span>
                  )}
                  <span className="text-[10px] text-muted-foreground bg-muted px-1.5 py-0.5 rounded font-mono">
                    {notes.length} cells
                  </span>
                </div>
                <div className="relative w-60">
                  <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
                  <Input
                    placeholder="Search cells..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="pl-8 h-8 text-xs bg-muted/50 border-border rounded-md"
                  />
                </div>
              </div>
            </div>
          )}

          <main className="flex-1 overflow-y-auto scrollbar-thin">
            <div className="max-w-4xl mx-auto px-4 py-4">
              {!activeNotebook ? (
                <div className="flex items-center justify-center py-20">
                  <div className="text-center space-y-3">
                    <div className="w-14 h-14 rounded-2xl bg-muted flex items-center justify-center mx-auto">
                      <BookOpen className="w-7 h-7 text-muted-foreground" />
                    </div>
                    <p className="text-sm font-medium">
                      {notebooksLoading ? "Loading..." : "Select or create a notebook"}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Use the sidebar to pick a notebook and start adding cells.
                    </p>
                  </div>
                </div>
              ) : loading ? (
                <div className="flex items-center justify-center py-20">
                  <div className="flex flex-col items-center gap-3 text-muted-foreground">
                    <Loader2 className="w-6 h-6 animate-spin text-primary" />
                    <span className="text-sm">Loading notebook...</span>
                  </div>
                </div>
              ) : filteredNotes.length === 0 && editorPosition === null ? (
                <div className="cell rounded-lg">
                  <div className="flex items-center justify-center py-16">
                    <div className="text-center space-y-3">
                      <div className="w-14 h-14 rounded-2xl bg-muted flex items-center justify-center mx-auto">
                        <BookOpen className="w-7 h-7 text-muted-foreground" />
                      </div>
                      <p className="text-sm font-medium">Empty notebook</p>
                      <p className="text-xs text-muted-foreground">
                        {search ? "No cells match your search" : "Click '+ Cell' or press Ctrl+N to add your first cell"}
                      </p>
                      {!search && (
                        <Button size="sm" variant="outline" onClick={() => openNewAt(0)} className="h-8 text-xs rounded-lg mt-2">
                          + Add Cell
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-0">
                  <AddCellButton onClick={() => openNewAt(0)} />
                  {editorPosition === 0 && !editing && (
                    <div className="mb-1">
                      <NoteEditor note={null} onSave={handleSave} onCancel={closeEditor} saving={saving} />
                    </div>
                  )}
                  {filteredNotes.map((note, i) => (
                    <div key={note.id}>
                      {editorPosition === i && editing?.id === note.id ? (
                        <div className="mb-1">
                          <NoteEditor note={editing} onSave={handleSave} onCancel={closeEditor} saving={saving} />
                        </div>
                      ) : (
                        <NoteCard note={note} index={i} onEdit={handleEdit} onDelete={handleDelete} />
                      )}
                      <AddCellButton onClick={() => openNewAt(i + 1)} />
                      {editorPosition === i + 1 && !editing && (
                        <div className="mb-1">
                          <NoteEditor note={null} onSave={handleSave} onCancel={closeEditor} saving={saving} />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {activeNotebook && notes.length > 0 && hasMore && !loading && (
                <div ref={sentinelRef} className="flex items-center justify-center py-6">
                  {loadingMore && (
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span className="text-xs">Loading more cells...</span>
                    </div>
                  )}
                </div>
              )}

              {activeNotebook && (
                <div className="border-t border-border mt-6 pt-3 pb-6">
                  <div className="flex items-center justify-between text-[10px] text-muted-foreground font-mono">
                    <span>CodePad Kernel • {activeNotebook.name}</span>
                    <span>{filteredNotes.length} cells loaded{hasMore ? " • scroll for more" : ""}</span>
                  </div>
                </div>
              )}
            </div>
          </main>
        </div>
      </div>

      <AlertDialog open={deleteTarget !== null} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this cell?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. The cell and its contents will be permanently removed.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
