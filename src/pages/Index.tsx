import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { AppHeader } from "@/components/AppHeader";
import { NoteCard } from "@/components/NoteCard";
import { NoteEditor } from "@/components/NoteEditor";
import { getAllNotes, addNote, updateNote, deleteNote, type CodeNote } from "@/lib/api";
import { Plus, Search, FileCode, Loader2 } from "lucide-react";
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
        toast.success("Note updated");
      } else {
        await addNote(data);
        toast.success("Note added");
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
    if (!confirm("Delete this note?")) return;
    try {
      await deleteNote(id);
      toast.success("Note deleted");
      fetchNotes();
    } catch (err: any) {
      toast.error("Failed to delete");
    }
  };

  const handleEdit = (note: CodeNote) => {
    setEditing(note);
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
      <AppHeader />

      <main className="max-w-5xl mx-auto px-4 py-6 space-y-5">
        {/* Toolbar */}
        <div className="flex items-center gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search notes, tags..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 bg-secondary/50"
            />
          </div>
          <Button onClick={() => { setEditing(null); setShowEditor(true); }} className="shrink-0">
            <Plus className="w-4 h-4 mr-1.5" />
            New Note
          </Button>
        </div>

        {/* Editor panel */}
        {showEditor && (
          <div className="rounded-xl border border-border bg-card p-5">
            <NoteEditor
              note={editing}
              onSave={handleSave}
              onCancel={() => { setShowEditor(false); setEditing(null); }}
              saving={saving}
            />
          </div>
        )}

        {/* Notes list */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
          </div>
        ) : filteredNotes.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 space-y-3 text-muted-foreground">
            <FileCode className="w-12 h-12 opacity-30" />
            <p className="text-sm">
              {notes.length === 0 ? "No notes yet. Create your first one!" : "No matching notes found."}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredNotes.map((note) => (
              <NoteCard key={note.id} note={note} onEdit={handleEdit} onDelete={handleDelete} />
            ))}
          </div>
        )}

        {/* Pagination */}
        {notes.length > 0 && (
          <div className="flex items-center justify-center gap-2 pt-4">
            <Button variant="secondary" size="sm" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>
              Previous
            </Button>
            <span className="text-sm text-muted-foreground px-3">Page {page}</span>
            <Button variant="secondary" size="sm" onClick={() => setPage((p) => p + 1)}>
              Next
            </Button>
          </div>
        )}
      </main>
    </div>
  );
}
