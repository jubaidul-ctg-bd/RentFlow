import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number, currency = 'USD') {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(amount);
}

export function formatDate(date: string | Date) {
  return new Intl.DateTimeFormat('en-US', { dateStyle: 'medium' }).format(new Date(date));
}

/**
 * Safely extracts a human-readable string from any Axios/NestJS error.
 * Handles all shapes the API can return:
 *   1. response.data.message = "plain string"
 *   2. response.data.message = ["validation error 1", "validation error 2"]
 *   3. response.data.message = { message: "nested string", error, statusCode }
 *      (custom exception filter that wraps the NestJS exception body)
 * Always returns a plain string — never an object.
 */
export function parseApiError(err: unknown, fallback = "An error occurred"): string {
  try {
    const raw = (err as { response?: { data?: { message?: unknown } } })
      ?.response?.data?.message;

    // Shape 3: nested object { message: string, error, statusCode }
    if (raw && typeof raw === "object" && !Array.isArray(raw)) {
      const nested = (raw as { message?: unknown }).message;
      if (typeof nested === "string" && nested.trim()) return nested.trim();
      if (Array.isArray(nested)) {
        const joined = (nested as unknown[])
          .filter((s) => typeof s === "string")
          .join(", ");
        return joined || fallback;
      }
    }

    // Shape 2: string[]
    if (Array.isArray(raw)) {
      const joined = (raw as unknown[])
        .filter((s) => typeof s === "string")
        .join(", ");
      return joined || fallback;
    }

    // Shape 1: plain string
    if (typeof raw === "string" && raw.trim()) return raw.trim();

    // Fallback to the JS Error message (e.g. network error)
    const jsMsg = (err as { message?: unknown })?.message;
    if (typeof jsMsg === "string" && jsMsg.trim()) return jsMsg.trim();
  } catch {
    // swallow — just return fallback
  }
  return fallback;
}
