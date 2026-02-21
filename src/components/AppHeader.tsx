import { useAuth } from "@/contexts/AuthContext";
import { useTheme } from "@/contexts/ThemeContext";
import { Moon, Sun, LogOut, Braces } from "lucide-react";
import { Button } from "@/components/ui/button";

export function AppHeader() {
  const { isAuthenticated, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();

  return (
    <header className="sticky top-0 z-50 border-b border-border/50 glass">
      <div className="max-w-5xl mx-auto flex items-center justify-between px-4 h-16">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-primary glow-sm flex items-center justify-center">
            <Braces className="w-5 h-5 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-lg font-bold tracking-tight glow-text">CodePad</h1>
            <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground -mt-0.5">Developer Notes</p>
          </div>
        </div>

        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon" onClick={toggleTheme} className="rounded-xl hover:bg-primary/10">
            {theme === "dark" ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </Button>
          {isAuthenticated && (
            <Button variant="ghost" size="icon" onClick={logout} className="rounded-xl text-muted-foreground hover:text-destructive hover:bg-destructive/10">
              <LogOut className="w-4 h-4" />
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}
