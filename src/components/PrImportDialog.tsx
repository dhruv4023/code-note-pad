import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { GitPullRequest, Loader2, AlertCircle } from "lucide-react";

const GITHUB_PR_REGEX = /^https:\/\/github\.com\/[\w.-]+\/[\w.-]+\/pull\/\d+$/;

interface PrImportDialogProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (prLink: string) => Promise<void>;
}

export function PrImportDialog({ open, onClose, onSubmit }: PrImportDialogProps) {
  const [link, setLink] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const validate = (val: string) => {
    if (!val.trim()) return "PR link is required";
    if (!GITHUB_PR_REGEX.test(val.trim())) return "Enter a valid GitHub PR URL (e.g. https://github.com/owner/repo/pull/123)";
    return "";
  };

  const handleSubmit = async () => {
    const err = validate(link);
    if (err) {
      setError(err);
      return;
    }
    setError("");
    setLoading(true);
    try {
      await onSubmit(link.trim());
      setLink("");
      onClose();
    } catch (e: any) {
      setError(e.message || "Failed to import PR notes");
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !loading) handleSubmit();
  };

  return (
    <Dialog open={open} onOpenChange={(o) => { if (!o) { setLink(""); setError(""); onClose(); } }}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <GitPullRequest className="w-5 h-5 text-primary" />
            Import from GitHub PR
          </DialogTitle>
          <DialogDescription>
            Paste a GitHub Pull Request URL to automatically import code notes from it.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3 py-2">
          <Input
            placeholder="https://github.com/owner/repo/pull/123"
            value={link}
            onChange={(e) => { setLink(e.target.value); if (error) setError(""); }}
            onKeyDown={handleKeyDown}
            autoFocus
            className="font-mono text-sm"
          />
          {error && (
            <div className="flex items-start gap-2 text-destructive text-xs">
              <AlertCircle className="w-3.5 h-3.5 mt-0.5 shrink-0" />
              <span>{error}</span>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={loading} className="text-xs">
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={loading || !link.trim()} className="text-xs gap-1.5">
            {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <GitPullRequest className="w-3.5 h-3.5" />}
            {loading ? "Importing..." : "Import PR"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
