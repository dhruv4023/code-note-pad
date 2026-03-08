import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { forgotPassword } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { BookOpen, ArrowRight, Loader2, Eye, EyeOff, KeyRound, Mail, User } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

type View = "login" | "signup" | "forgot";

export default function LoginPage() {
  const { login, signup } = useAuth();
  const navigate = useNavigate();
  const [view, setView] = useState<View>("login");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [email, setEmail] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login(username, password);
      toast.success("Welcome back!");
      navigate("/");
    } catch (err: any) {
      toast.error(err.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await signup(username, email);
      toast.success("Account created! Check your email for password.");
      setView("login");
    } catch (err: any) {
      toast.error(err.message || "Signup failed");
    } finally {
      setLoading(false);
    }
  };

  const handleForgot = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await forgotPassword(username);
      toast.success("Password reset email sent. Check your inbox.");
      setView("login");
    } catch (err: any) {
      toast.error(err.message || "Failed to send reset email");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-sm space-y-6 animate-fade-in">
        {/* Logo */}
        <div className="text-center space-y-2">
          <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto shadow-sm">
            <BookOpen className="w-7 h-7 text-primary" />
          </div>
          <div>
            <h1 className="text-xl font-semibold tracking-tight">CodePad</h1>
            <p className="text-xs text-muted-foreground mt-1">
              {view === "login" && "Sign in to your notebook"}
              {view === "signup" && "Create your account"}
              {view === "forgot" && "Reset your password"}
            </p>
          </div>
        </div>

        {/* Form */}
        <div className="cell rounded-xl p-6 shadow-sm">
          {view === "login" && (
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="h-10 pl-10 text-sm rounded-lg"
                  required
                  autoFocus
                />
              </div>
              <div className="relative">
                <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="h-10 pl-10 pr-10 text-sm rounded-lg"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={() => setView("forgot")}
                  className="text-xs text-primary hover:underline"
                >
                  Forgot password?
                </button>
              </div>
              <Button type="submit" className="w-full h-10 rounded-lg text-sm font-medium" disabled={loading}>
                {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                {loading ? "Signing in..." : "Sign In"}
                {!loading && <ArrowRight className="w-4 h-4 ml-2" />}
              </Button>
            </form>
          )}

          {view === "signup" && (
            <form onSubmit={handleSignup} className="space-y-4">
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="h-10 pl-10 text-sm rounded-lg"
                  required
                  autoFocus
                />
              </div>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="h-10 pl-10 text-sm rounded-lg"
                  required
                />
              </div>
              <Button type="submit" className="w-full h-10 rounded-lg text-sm font-medium" disabled={loading}>
                {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                {loading ? "Creating..." : "Create Account"}
                {!loading && <ArrowRight className="w-4 h-4 ml-2" />}
              </Button>
            </form>
          )}

          {view === "forgot" && (
            <form onSubmit={handleForgot} className="space-y-4">
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="h-10 pl-10 text-sm rounded-lg"
                  required
                  autoFocus
                />
              </div>
              <Button type="submit" className="w-full h-10 rounded-lg text-sm font-medium" disabled={loading}>
                {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                {loading ? "Sending..." : "Send Reset Link"}
              </Button>
            </form>
          )}
        </div>

        <p className="text-center text-xs text-muted-foreground">
          {view === "login" && (
            <>
              Don't have an account?{" "}
              <button onClick={() => setView("signup")} className="text-primary font-medium hover:underline">
                Sign up
              </button>
            </>
          )}
          {view === "signup" && (
            <>
              Already have an account?{" "}
              <button onClick={() => setView("login")} className="text-primary font-medium hover:underline">
                Sign in
              </button>
            </>
          )}
          {view === "forgot" && (
            <>
              Remember your password?{" "}
              <button onClick={() => setView("login")} className="text-primary font-medium hover:underline">
                Sign in
              </button>
            </>
          )}
        </p>
      </div>
    </div>
  );
}
