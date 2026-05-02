"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { api } from "@/lib/api";
import { parseApiError } from "@/lib/utils";

export default function NewFlatPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    name: "",
    address: "",
    monthlyRent: "",
    description: "",
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post("/flats", {
        ...form,
        monthlyRent: Number(form.monthlyRent),
      });
      toast.success("Flat submitted for approval!");
      router.push("/owner/flats");
    } catch (err: unknown) {
      toast.error(parseApiError(err, "Failed to create flat"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-xl">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">
        Register New Flat
      </h1>
      <div className="card">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Flat Name / Number
            </label>
            <input
              name="name"
              value={form.name}
              onChange={handleChange}
              className="input-field"
              required
              placeholder="e.g. Flat 4A"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Address
            </label>
            <input
              name="address"
              value={form.address}
              onChange={handleChange}
              className="input-field"
              required
              placeholder="Full address"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Monthly Rent (USD)
            </label>
            <input
              type="number"
              name="monthlyRent"
              value={form.monthlyRent}
              onChange={handleChange}
              className="input-field"
              required
              min="0"
              step="0.01"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description (optional)
            </label>
            <textarea
              name="description"
              value={form.description}
              onChange={handleChange}
              className="input-field min-h-[80px]"
              placeholder="Additional details about the flat"
            />
          </div>
          <div className="flex gap-4">
            <button
              type="submit"
              disabled={loading}
              className="btn-primary flex-1"
            >
              {loading ? "Submitting…" : "Submit for Approval"}
            </button>
            <button
              type="button"
              onClick={() => router.back()}
              className="btn-secondary flex-1"
            >
              Cancel
            </button>
          </div>
        </form>
        <p className="mt-4 text-xs text-gray-500">
          Your flat will be reviewed by the platform admin before going live.
          You&apos;ll receive an email notification.
        </p>
      </div>
    </div>
  );
}
