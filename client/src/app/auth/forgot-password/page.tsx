"use client";

import { useState } from "react";
import Link from "next/link";
import { Building2, Mail } from "lucide-react";
import toast from "react-hot-toast";
import { api } from "@/lib/api";
import { parseApiError } from "@/lib/utils";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post("/auth/forgot-password", { email });
      toast.success("If that email exists, a reset link was sent.");
      setEmail("");
    } catch (err: unknown) {
      toast.error(parseApiError(err, "Unable to process request"));
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
          <h1 className="text-2xl font-bold text-gray-900 mt-4">Forgot password</h1>
          <p className="text-sm text-gray-500 mt-1">
            Enter your email and we will send a reset link.
          </p>
        </div>

        <div className="card">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="input-field pl-10"
                  placeholder="you@example.com"
                  required
                  autoComplete="email"
                />
              </div>
            </div>
            <button type="submit" disabled={loading} className="btn-primary w-full py-3">
              {loading ? "Sending link..." : "Send reset link"}
            </button>
          </form>
          <p className="mt-6 text-center text-sm text-gray-600">
            Back to{" "}
            <Link href="/auth/login" className="text-primary-600 font-medium hover:underline">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
