import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { storage } from "@/lib/storage";
import { login as apiLogin, logout as apiLogout, signup as apiSignup, setOnAuthExpired } from "@/lib/api";
import { toast } from "sonner";

interface AuthContextType {
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (username: string, password: string) => Promise<void>;
  signup: (username: string, email: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    storage.get("authToken").then((token) => {
      setIsAuthenticated(!!token);
      setIsLoading(false);
    });

    // Listen for token expiry from API layer
    setOnAuthExpired(() => {
      setIsAuthenticated(false);
      toast.error("Session expired. Please sign in again.");
    });
  }, []);

  const login = useCallback(async (username: string, password: string) => {
    await apiLogin(username, password);
    setIsAuthenticated(true);
  }, []);

  const signup = useCallback(async (username: string, email: string) => {
    await apiSignup(username, email);
  }, []);

  const logout = useCallback(async () => {
    await apiLogout();
    setIsAuthenticated(false);
    toast.success("Signed out successfully");
  }, []);

  return (
    <AuthContext.Provider value={{ isAuthenticated, isLoading, login, signup, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
