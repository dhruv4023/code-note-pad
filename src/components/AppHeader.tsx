import { useAuth } from "@/contexts/AuthContext";
import { useTheme } from "@/contexts/ThemeContext";
import { Moon, Sun, LogOut, BookOpen, Plus, Save, Undo2, Redo2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

interface AppHeaderProps {
  onNewNote?: () => void;
}

export function AppHeader({ onNewNote }: AppHeaderProps) {
  const { isAuthenticated, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();

  return (
    <header className="sticky top-0 z-50 notebook-toolbar">
      <div className="flex items-center h-12 px-3 gap-1">
        {/* Logo */}
        <div className="flex items-center gap-2 mr-3">
          <BookOpen className="w-5 h-5 text-primary" />
          <span className="font-semibold text-sm tracking-tight">CodePad</span>
        </div>

        <Separator orientation="vertical" className="h-5" />

        {/* Toolbar actions */}
        <div className="flex items-center gap-0.5 ml-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={onNewNote}
            className="h-7 px-2 text-xs gap-1 hover:bg-muted rounded-md"
          >
            <Plus className="w-3.5 h-3.5" />
            Cell
          </Button>
          <Button variant="ghost" size="icon" className="h-7 w-7 hover:bg-muted rounded-md" title="Undo">
            <Undo2 className="w-3.5 h-3.5 text-muted-foreground" />
          </Button>
          <Button variant="ghost" size="icon" className="h-7 w-7 hover:bg-muted rounded-md" title="Redo">
            <Redo2 className="w-3.5 h-3.5 text-muted-foreground" />
          </Button>
          <Button variant="ghost" size="icon" className="h-7 w-7 hover:bg-muted rounded-md" title="Save">
            <Save className="w-3.5 h-3.5 text-muted-foreground" />
          </Button>
        </div>

        {/* Spacer */}
        <div className="flex-1" />

        {/* Right actions */}
        <div className="flex items-center gap-0.5">
          <Button variant="ghost" size="icon" onClick={toggleTheme} className="h-7 w-7 hover:bg-muted rounded-md">
            {theme === "dark" ? <Sun className="w-3.5 h-3.5" /> : <Moon className="w-3.5 h-3.5" />}
          </Button>
          {isAuthenticated && (
            <Button
              variant="ghost"
              size="icon"
              onClick={logout}
              className="h-7 w-7 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-md"
            >
              <LogOut className="w-3.5 h-3.5" />
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}
