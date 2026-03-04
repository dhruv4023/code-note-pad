import { useState, useEffect } from "react";
import { parseGitHubPermalink, fetchCodeFromPermalink, type GitHubPermalink } from "@/lib/github";
import { ExternalLink, Copy, Check, FileCode, ChevronDown, ChevronRight } from "lucide-react";

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
      <a href={url} target="_blank" rel="noopener noreferrer" className="text-primary underline break-all text-xs">
        {url}
      </a>
    );
  }

  return (
    <div className="rounded-md border border-code-border bg-code-bg overflow-hidden text-xs">
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-1.5 border-b border-code-border bg-muted/30">
        <div className="flex items-center gap-2 min-w-0">
          <FileCode className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
          <a
            href={permalink.fileUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-[11px] font-mono text-primary hover:underline truncate"
          >
            {permalink.filePath}
          </a>
          <span className="text-[10px] text-muted-foreground shrink-0 font-mono">
            L{permalink.startLine}{permalink.endLine !== permalink.startLine && `-${permalink.endLine}`}
          </span>
        </div>
        <div className="flex items-center gap-0.5 shrink-0">
          <button
            onClick={() => setExpanded(!expanded)}
            className="p-1 rounded hover:bg-muted text-muted-foreground transition-colors"
          >
            {expanded ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
          </button>
          <button
            onClick={copyCode}
            className="p-1 rounded hover:bg-muted text-muted-foreground transition-colors"
            title="Copy code"
          >
            {copied ? <Check className="w-3 h-3 text-success" /> : <Copy className="w-3 h-3" />}
          </button>
          <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="p-1 rounded hover:bg-muted text-muted-foreground transition-colors"
            title="View on GitHub"
          >
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>
      </div>

      {/* Code body */}
      {expanded && (
        <div className="overflow-x-auto scrollbar-thin">
          {loading ? (
            <div className="p-3 text-muted-foreground animate-pulse">Loading code...</div>
          ) : (
            <table className="w-full font-mono leading-5">
              <tbody>
                {lines.map((line, i) => (
                  <tr key={i} className="hover:bg-code-highlight transition-colors">
                    <td className="select-none text-right pr-3 pl-3 py-0 text-code-line-number w-[1%] whitespace-nowrap text-[11px]">
                      {permalink.startLine + i}
                    </td>
                    <td className="pr-3 py-0 whitespace-pre text-[11px]">{line}</td>
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
