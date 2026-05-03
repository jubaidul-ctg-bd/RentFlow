"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Building2, KeyRound } from "lucide-react";
import toast from "react-hot-toast";
import { api } from "@/lib/api";
import { parseApiError } from "@/lib/utils";

export default function ResetPasswordPage() {
  const router = useRouter();
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (newPassword.length < 8) {
      toast.error("Password must be at least 8 characters");
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    const token =
      typeof window !== "undefined"
        ? new URLSearchParams(window.location.search).get("token") ?? ""
        : "";

    if (!token) {
      toast.error("Reset token is missing or invalid");
      return;
    }

    setLoading(true);
    try {
      await api.post("/auth/reset-password", { token, newPassword });
      toast.success("Password reset successful. Please sign in.");
      router.push("/auth/login");
    } catch (err: unknown) {
      toast.error(parseApiError(err, "Password reset failed"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 to-white px-4 py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2">
            <span className="w-9 h-9 rounded-2xl brand-logo-icon inline-flex items-center justify-center">
              <Building2 className="w-5 h-5 text-white" />
            </span>
            <span className="text-2xl font-bold brand-logo-text">RentFlow</span>
          </Link>
          <h1 className="text-2xl font-bold text-gray-900 mt-4">Reset password</h1>
          <p className="text-sm text-gray-500 mt-1">Choose a new secure password.</p>
        </div>

        <div className="card">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">New Password</label>
              <div className="relative">
                <KeyRound className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="input-field pl-10"
                  placeholder="Minimum 8 characters"
                  required
                  minLength={8}
                  autoComplete="new-password"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Confirm Password
              </label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="input-field"
                placeholder="Retype new password"
                required
                minLength={8}
                autoComplete="new-password"
              />
            </div>
            <button type="submit" disabled={loading} className="btn-primary w-full py-3">
              {loading ? "Updating..." : "Update password"}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-gray-600">
            Remembered your password?{" "}
            <Link href="/auth/login" className="text-primary-600 font-medium hover:underline">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
