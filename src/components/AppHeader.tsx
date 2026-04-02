import { useAuth } from "@/contexts/AuthContext";
import { useTheme } from "@/contexts/ThemeContext";
import { Moon, Sun, LogOut, BookOpen, Plus, Sparkles, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

interface AppHeaderProps {
  onNewNote?: () => void;
  onToggleChat?: () => void;
  chatOpen?: boolean;
  onToggleSidebar?: () => void;
}

export function AppHeader({ onNewNote, onToggleChat, chatOpen, onToggleSidebar }: AppHeaderProps) {
  const { isAuthenticated, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();

  return (
    <header className="sticky top-0 z-50 notebook-toolbar">
      <div className="flex items-center h-12 px-3 gap-1">
        {/* Mobile sidebar toggle */}
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7 rounded-md hover:bg-muted md:hidden"
          onClick={onToggleSidebar}
        >
          <Menu className="w-4 h-4" />
        </Button>

        {/* Logo */}
        <div className="flex items-center gap-2 mr-3">
          <BookOpen className="w-5 h-5 text-primary" />
          <span className="font-semibold text-sm tracking-tight hidden sm:inline">CodePad</span>
        </div>

        <Separator orientation="vertical" className="h-5 hidden sm:block" />

        {/* Toolbar actions */}
        <div className="flex items-center gap-0.5 ml-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={onNewNote}
            className="h-7 px-2 text-xs gap-1 hover:bg-muted rounded-md"
          >
            <Plus className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Cell</span>
          </Button>
        </div>

        <div className="flex-1" />

        {/* Right actions */}
        <div className="flex items-center gap-0.5">
          <Button
            variant={chatOpen ? "default" : "ghost"}
            size="icon"
            onClick={onToggleChat}
            className="h-7 w-7 rounded-md"
            title="AI Chat (Ctrl+B)"
          >
            <Sparkles className="w-3.5 h-3.5" />
          </Button>
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
