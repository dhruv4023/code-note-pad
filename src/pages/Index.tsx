import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { AppHeader } from "@/components/AppHeader";
import { NoteCard } from "@/components/NoteCard";
import { NoteEditor } from "@/components/NoteEditor";
import { getAllNotes, addNote, updateNote, deleteNote, type CodeNote } from "@/lib/api";
import { Plus, Search, FileCode, Loader2, Sparkles } from "lucide-react";
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
    <div className="min-h-screen bg-background relative">
      {/* Background effects */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] rounded-full bg-primary/3 blur-[120px]" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] rounded-full bg-accent/3 blur-[100px]" />
      </div>

      <AppHeader />

      <main className="max-w-5xl mx-auto px-4 py-8 space-y-6 relative z-10">
        {/* Toolbar */}
        <div className="flex items-center gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search notes, tags..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10 h-11 bg-card/60 border-border/50 rounded-xl glass"
            />
          </div>
          <Button
            onClick={() => { setEditing(null); setShowEditor(true); }}
            className="shrink-0 h-11 rounded-xl glow-sm font-semibold px-5"
          >
            <Plus className="w-4 h-4 mr-1.5" />
            New Note
          </Button>
        </div>

        {/* Editor panel */}
        {showEditor && (
          <div className="rounded-2xl border border-border/50 glass p-6 glow-sm">
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
          <div className="flex items-center justify-center py-24">
            <div className="flex flex-col items-center gap-3">
              <Loader2 className="w-7 h-7 animate-spin text-primary" />
              <span className="text-sm text-muted-foreground">Loading notes...</span>
            </div>
          </div>
        ) : filteredNotes.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 space-y-4 text-muted-foreground">
            <div className="w-20 h-20 rounded-2xl bg-primary/10 flex items-center justify-center">
              <FileCode className="w-10 h-10 text-primary/40" />
            </div>
            <div className="text-center space-y-1">
              <p className="text-base font-medium text-foreground/70">
                {notes.length === 0 ? "No notes yet" : "No matching notes"}
              </p>
              <p className="text-sm flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" />
                {notes.length === 0 ? "Create your first code note!" : "Try a different search."}
              </p>
            </div>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2">
            {filteredNotes.map((note) => (
              <NoteCard key={note.id} note={note} onEdit={handleEdit} onDelete={handleDelete} />
            ))}
          </div>
        )}

        {/* Pagination */}
        {notes.length > 0 && (
          <div className="flex items-center justify-center gap-3 pt-4">
            <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage((p) => p - 1)} className="rounded-xl">
              Previous
            </Button>
            <span className="text-sm text-muted-foreground px-3 font-medium">Page {page}</span>
            <Button variant="outline" size="sm" onClick={() => setPage((p) => p + 1)} className="rounded-xl">
              Next
            </Button>
          </div>
        )}
      </main>
    </div>
  );
}
