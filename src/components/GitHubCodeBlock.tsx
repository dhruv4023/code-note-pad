import { useState, useEffect } from "react";
import { parseGitHubPermalink, fetchCodeFromPermalink, type GitHubPermalink } from "@/lib/github";
import { ExternalLink, Copy, Check, FileCode } from "lucide-react";

interface GitHubCodeBlockProps {
  url: string;
}

export function GitHubCodeBlock({ url }: GitHubCodeBlockProps) {
  const [permalink, setPermalink] = useState<GitHubPermalink | null>(null);
  const [lines, setLines] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [expanded, setExpanded] = useState(true);

  useEffect(() => {
    const parsed = parseGitHubPermalink(url);
    setPermalink(parsed);
    if (parsed) {
      setLoading(true);
      fetchCodeFromPermalink(parsed).then((code) => {
        setLines(code);
        setLoading(false);
      });
    } else {
      setLoading(false);
    }
  }, [url]);

  const copyCode = async () => {
    await navigator.clipboard.writeText(lines.join("\n"));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!permalink) {
    return (
      <a href={url} target="_blank" rel="noopener noreferrer" className="text-primary underline break-all">
        {url}
      </a>
    );
  }

  return (
    <div className="rounded-lg border border-code-border bg-code-bg overflow-hidden animate-fade-in">
      {/* Header - GitHub style */}
      <div className="flex items-center justify-between px-3 py-2 border-b border-code-border bg-secondary/50">
        <div className="flex items-center gap-2 min-w-0">
          <FileCode className="w-4 h-4 text-muted-foreground shrink-0" />
          <a
            href={permalink.fileUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs font-mono text-primary hover:underline truncate"
          >
            {permalink.owner}/{permalink.repo}/{permalink.filePath}
          </a>
          <span className="text-xs text-muted-foreground shrink-0">
            L{permalink.startLine}
            {permalink.endLine !== permalink.startLine && `-L${permalink.endLine}`}
          </span>
        </div>
        <div className="flex items-center gap-1 shrink-0">
          <button
            onClick={() => setExpanded(!expanded)}
            className="p-1 rounded hover:bg-muted text-muted-foreground text-xs"
          >
            {expanded ? "Collapse" : "Expand"}
          </button>
          <button
            onClick={copyCode}
            className="p-1 rounded hover:bg-muted text-muted-foreground"
            title="Copy code"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-success" /> : <Copy className="w-3.5 h-3.5" />}
          </button>
          <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="p-1 rounded hover:bg-muted text-muted-foreground"
            title="View on GitHub"
          >
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
      </div>

      {/* Code body */}
      {expanded && (
        <div className="overflow-x-auto scrollbar-thin">
          {loading ? (
            <div className="p-4 text-sm text-muted-foreground animate-pulse">Loading code...</div>
          ) : (
            <table className="w-full text-xs font-mono leading-relaxed">
              <tbody>
                {lines.map((line, i) => (
                  <tr key={i} className="hover:bg-code-highlight transition-colors">
                    <td className="select-none text-right pr-3 pl-3 py-0 text-code-line-number w-[1%] whitespace-nowrap">
                      {permalink.startLine + i}
                    </td>
                    <td className="pr-4 py-0 whitespace-pre">{line}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}
    </div>
  );
}
