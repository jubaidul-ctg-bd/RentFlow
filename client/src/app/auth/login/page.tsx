"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Building2 } from "lucide-react";
import toast from "react-hot-toast";
import { api } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import { parseApiError } from "@/lib/utils";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [shouldVerify, setShouldVerify] = useState(false);
  const [registeredEmail, setRegisteredEmail] = useState<string | null>(null);
  const [loginError, setLoginError] = useState<string | null>(null);
  const router = useRouter();
  const { login } = useAuth();

  useEffect(() => {
    if (typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    setShouldVerify(params.get("verify") === "1");
    setRegisteredEmail(params.get("email"));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setLoginError(null);
    try {
      const { data } = await api.post("/auth/login", { email, password });
      login(data.accessToken, data.user);
      const redirect =
        typeof window !== "undefined"
          ? (new URLSearchParams(window.location.search).get("redirect") ??
            "/dashboard")
          : "/dashboard";
      router.push(redirect);
      toast.success("Welcome back!");
    } catch (err: unknown) {
      const msg = parseApiError(err, "Login failed");
      setLoginError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 to-white px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2">
            <span className="w-9 h-9 rounded-2xl brand-logo-icon inline-flex items-center justify-center">
              <Building2 className="w-5 h-5 text-white" />
            </span>
            <span className="text-2xl font-bold brand-logo-text">RentFlow</span>
          </Link>
          <h1 className="text-2xl font-bold text-gray-900 mt-4">
            Sign in to your account
          </h1>
        </div>

        <div className="card">
          {shouldVerify && (
            <div className="mb-4 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-900">
              Verify your email{registeredEmail ? ` (${registeredEmail})` : ""}{" "}
              before signing in.
            </div>
          )}
          {loginError && (
            <div
              className={`mb-4 rounded-lg border px-3 py-2 text-sm ${
                loginError.toLowerCase().includes("verify")
                  ? "border-amber-200 bg-amber-50 text-amber-900"
                  : "border-red-200 bg-red-50 text-red-800"
              }`}
            >
              {loginError}
              {loginError.toLowerCase().includes("verify") && (
                <span className="block mt-1 text-xs text-amber-700">
                  Check your inbox for the verification email.
                </span>
              )}
            </div>
          )}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input-field"
                placeholder="you@example.com"
                required
                autoComplete="email"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="input-field"
                placeholder="••••••••"
                required
                autoComplete="current-password"
              />
            </div>
            <div className="flex items-center justify-between text-sm">
              <span />
              <Link
                href="/auth/forgot-password"
                className="text-primary-600 hover:underline"
              >
                Forgot password?
              </Link>
            </div>
            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full py-3"
            >
              {loading ? "Signing in…" : "Sign In"}
            </button>
          </form>
          <p className="mt-6 text-center text-sm text-gray-600">
            Don&apos;t have an account?{" "}
            <Link
              href="/auth/register"
              className="text-primary-600 font-medium hover:underline"
            >
              Create one
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
