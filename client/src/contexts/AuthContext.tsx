"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import Cookies from "js-cookie";
import { api } from "@/lib/api";

interface User {
  id: string;
  email: string;
  roles: string[];
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (token: string, user: User) => void;
  logout: () => void;
  hasRole: (role: string) => boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = Cookies.get("accessToken");
    if (token) {
      api
        .get("/auth/me")
        .then((res) => setUser(res.data))
        .catch(() => Cookies.remove("accessToken"))
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const login = (
    token: string,
    userData: User | { userId?: string; id?: string; email: string; roles: string[] },
  ) => {
    const normalizedId =
      "id" in userData && userData.id
        ? userData.id
        : "userId" in userData && userData.userId
          ? userData.userId
          : "";
    const normalizedUser: User = {
      id: normalizedId,
      email: userData.email,
      roles: Array.isArray(userData.roles) ? userData.roles : [],
    };
    const isSecureContext =
      process.env.NODE_ENV === "production" &&
      typeof window !== "undefined" &&
      window.location.protocol === "https:";

    Cookies.set("accessToken", token, {
      expires: 7,
      secure: isSecureContext,
      sameSite: "Strict",
    });
    setUser(normalizedUser);
  };

  const logout = () => {
    Cookies.remove("accessToken");
    setUser(null);
  };

  const hasRole = (role: string) => user?.roles.includes(role) ?? false;

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, hasRole }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
