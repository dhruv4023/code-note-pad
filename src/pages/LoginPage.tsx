import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Braces, ArrowRight, Sparkles } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [isSignup, setIsSignup] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [email, setEmail] = useState("");
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
      const { signup } = await import("@/lib/api");
      await signup(username, email);
      toast.success("Account created! Check your email for password.");
      setIsSignup(false);
    } catch (err: any) {
      toast.error(err.message || "Signup failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 -left-32 w-96 h-96 rounded-full bg-primary/5 blur-3xl" />
        <div className="absolute bottom-1/4 -right-32 w-96 h-96 rounded-full bg-accent/5 blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-primary/3 blur-[100px]" />
      </div>

      <div className="w-full max-w-sm space-y-8 animate-fade-in relative z-10">
        {/* Logo */}
        <div className="text-center space-y-3">
          <div className="w-16 h-16 rounded-2xl bg-primary glow flex items-center justify-center mx-auto">
            <Braces className="w-8 h-8 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-3xl font-bold tracking-tight glow-text">CodePad</h1>
            <p className="text-sm text-muted-foreground mt-1 flex items-center justify-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" />
              {isSignup ? "Create your account" : "Sign in to your notes"}
            </p>
          </div>
        </div>

        {/* Form */}
        <div className="rounded-2xl border border-border/50 glass p-6 glow-sm">
          <form onSubmit={isSignup ? handleSignup : handleLogin} className="space-y-4">
            <Input
              placeholder="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="h-12 bg-secondary/50 border-border/50 rounded-xl focus:ring-primary/30"
              required
            />
            {isSignup ? (
              <Input
                placeholder="Email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="h-12 bg-secondary/50 border-border/50 rounded-xl"
                required
              />
            ) : (
              <Input
                placeholder="Password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="h-12 bg-secondary/50 border-border/50 rounded-xl"
                required
              />
            )}
            <Button type="submit" className="w-full h-12 rounded-xl glow-sm font-semibold text-sm" disabled={loading}>
              {loading ? "Please wait..." : isSignup ? "Create Account" : "Sign In"}
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </form>
        </div>

        <p className="text-center text-sm text-muted-foreground">
          {isSignup ? "Already have an account?" : "Don't have an account?"}{" "}
          <button onClick={() => setIsSignup(!isSignup)} className="text-primary font-semibold hover:underline">
            {isSignup ? "Sign in" : "Sign up"}
          </button>
        </p>
      </div>
    </div>
  );
}
