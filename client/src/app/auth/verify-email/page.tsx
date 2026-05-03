"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Building2, CheckCircle2, XCircle, Loader2 } from "lucide-react";
import { api } from "@/lib/api";
import { parseApiError } from "@/lib/utils";

type Status = "loading" | "success" | "error";

export default function VerifyEmailPage() {
  const [status, setStatus] = useState<Status>("loading");
  const [message, setMessage] = useState("");

  useEffect(() => {
    const token =
      typeof window !== "undefined"
        ? new URLSearchParams(window.location.search).get("token")
        : null;

    if (!token) {
      setStatus("error");
      setMessage(
        "No verification token found. Please use the link from your email.",
      );
      return;
    }

    api
      .get(`/auth/verify-email?token=${encodeURIComponent(token)}`)
      .then(({ data }) => {
        setMessage(
          data?.message ?? "Your email has been verified successfully.",
        );
        setStatus("success");
      })
      .catch((err: unknown) => {
        setMessage(
          parseApiError(
            err,
            "The verification link is invalid or has expired.",
          ),
        );
        setStatus("error");
      });
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 to-white px-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2">
            <span className="w-9 h-9 rounded-2xl brand-logo-icon inline-flex items-center justify-center">
              <Building2 className="w-5 h-5 text-white" />
            </span>
            <span className="text-2xl font-bold brand-logo-text">RentFlow</span>
          </Link>
        </div>

        <div className="card text-center">
          {status === "loading" && (
            <>
              <Loader2 className="w-12 h-12 text-primary-600 animate-spin mx-auto mb-4" />
              <h1 className="text-xl font-semibold text-gray-900 mb-2">
                Verifying your email…
              </h1>
              <p className="text-sm text-gray-500">Please wait a moment.</p>
            </>
          )}

          {status === "success" && (
            <>
              <CheckCircle2 className="w-12 h-12 text-green-500 mx-auto mb-4" />
              <h1 className="text-xl font-semibold text-gray-900 mb-2">
                Email verified!
              </h1>
              <p className="text-sm text-gray-600 mb-6">{message}</p>
              <Link
                href="/auth/login"
                className="btn-primary inline-block px-8 py-2.5"
              >
                Sign In
              </Link>
            </>
          )}

          {status === "error" && (
            <>
              <XCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
              <h1 className="text-xl font-semibold text-gray-900 mb-2">
                Verification failed
              </h1>
              <p className="text-sm text-gray-600 mb-6">{message}</p>
              <div className="flex flex-col gap-3">
                <Link
                  href="/auth/login"
                  className="btn-primary inline-block px-8 py-2.5"
                >
                  Go to Login
                </Link>
                <Link
                  href="/auth/register"
                  className="text-sm text-primary-600 hover:underline"
                >
                  Register again
                </Link>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
