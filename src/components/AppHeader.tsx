import { useAuth } from "@/contexts/AuthContext";
import { useTheme } from "@/contexts/ThemeContext";
import { Moon, Sun, LogOut, Code2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export function AppHeader() {
  const { isAuthenticated, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-card/80 backdrop-blur-sm">
      <div className="max-w-5xl mx-auto flex items-center justify-between px-4 h-14">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
            <Code2 className="w-4.5 h-4.5 text-primary-foreground" />
          </div>
          <h1 className="text-lg font-semibold tracking-tight">CodePad</h1>
        </div>

        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon" onClick={toggleTheme} className="rounded-lg">
            {theme === "dark" ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </Button>
          {isAuthenticated && (
            <Button variant="ghost" size="icon" onClick={logout} className="rounded-lg text-muted-foreground">
              <LogOut className="w-4 h-4" />
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}
