import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { AppHeader } from "@/components/AppHeader";
import { NoteCard } from "@/components/NoteCard";
import { NoteEditor } from "@/components/NoteEditor";
import { getAllNotes, addNote, updateNote, deleteNote, type CodeNote } from "@/lib/api";
import { Plus, Search, BookOpen, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

export default function Index() {
  const { isAuthenticated } = useAuth();
  const [notes, setNotes] = useState<CodeNote[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [editing, setEditing] = useState<CodeNote | null>(null);
  const [showEditor, setShowEditor] = useState(false);
  const [saving, setSaving] = useState(false);
  const [page, setPage] = useState(1);

  const fetchNotes = useCallback(async () => {
    if (!isAuthenticated) return;
    setLoading(true);
    try {
      const res = await getAllNotes(page, 20);
      setNotes(res.data || []);
    } catch (err: any) {
      toast.error("Failed to load notes");
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, page]);

  useEffect(() => {
    fetchNotes();
  }, [fetchNotes]);

  const handleSave = async (data: { title: string; note: string; permanentLink: string; aiTags: string[] }) => {
    setSaving(true);
    try {
      if (editing) {
        await updateNote(editing.id, data);
        toast.success("Cell updated");
      } else {
        await addNote(data);
        toast.success("Cell added");
      }
      setShowEditor(false);
      setEditing(null);
      fetchNotes();
    } catch (err: any) {
      toast.error(err.message || "Failed to save");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Delete this cell?")) return;
    try {
      await deleteNote(id);
      toast.success("Cell deleted");
      fetchNotes();
    } catch (err: any) {
      toast.error("Failed to delete");
    }
  };

  const handleEdit = (note: CodeNote) => {
    setEditing(note);
    setShowEditor(true);
  };

  const openNewNote = () => {
    setEditing(null);
    setShowEditor(true);
  };

  const filteredNotes = notes.filter(
    (n) =>
      n.title.toLowerCase().includes(search.toLowerCase()) ||
      n.note?.toLowerCase().includes(search.toLowerCase()) ||
      n.aiTags?.some((t) => t.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="min-h-screen bg-background">
      <AppHeader onNewNote={openNewNote} />

      {/* Notebook title bar */}
      <div className="border-b border-border">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center gap-3">
          <div className="flex items-center gap-2 flex-1 min-w-0">
            <BookOpen className="w-4 h-4 text-primary shrink-0" />
            <h2 className="text-sm font-medium truncate">notebook.codePad</h2>
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

      <main className="max-w-4xl mx-auto px-4 py-6 space-y-2">
        {/* Editor as first cell */}
        {showEditor && (
          <div className="mb-2">
            <NoteEditor
              note={editing}
              onSave={handleSave}
              onCancel={() => { setShowEditor(false); setEditing(null); }}
              saving={saving}
            />
          </div>
        )}

        {/* Notes as cells */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span className="text-sm">Loading cells...</span>
            </div>
          </div>
        ) : filteredNotes.length === 0 ? (
          <div className="cell rounded-lg">
            <div className="flex items-center justify-center py-16">
              <div className="text-center space-y-3">
                <div className="w-12 h-12 rounded-lg bg-muted flex items-center justify-center mx-auto">
                  <BookOpen className="w-6 h-6 text-muted-foreground" />
                </div>
                <div>
                  <p className="text-sm font-medium">
                    {notes.length === 0 ? "Empty notebook" : "No matching cells"}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {notes.length === 0 ? "Click '+ Cell' to add your first note" : "Try a different search query"}
                  </p>
                </div>
                {notes.length === 0 && (
                  <Button size="sm" variant="outline" onClick={openNewNote} className="h-7 text-xs rounded">
                    <Plus className="w-3 h-3 mr-1" />
                    Add Cell
                  </Button>
                )}
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-2">
            {filteredNotes.map((note, i) => (
              <NoteCard key={note.id} note={note} index={i} onEdit={handleEdit} onDelete={handleDelete} />
            ))}
          </div>
        )}

        {/* Add cell button between cells */}
        {!showEditor && filteredNotes.length > 0 && (
          <div className="flex justify-center py-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={openNewNote}
              className="h-7 px-3 text-xs text-muted-foreground hover:text-foreground hover:bg-muted rounded-md gap-1"
            >
              <Plus className="w-3 h-3" />
              Add Cell
            </Button>
          </div>
        )}

        {/* Pagination */}
        {notes.length > 0 && (
          <div className="flex items-center justify-center gap-2 pt-4 border-t border-border/50">
            <Button variant="ghost" size="sm" disabled={page <= 1} onClick={() => setPage((p) => p - 1)} className="h-7 text-xs rounded">
              Previous
            </Button>
            <span className="text-xs text-muted-foreground font-mono">Page {page}</span>
            <Button variant="ghost" size="sm" onClick={() => setPage((p) => p + 1)} className="h-7 text-xs rounded">
              Next
            </Button>
          </div>
        )}
      </main>
    </div>
  );
}
