"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type Props = { orgId: string; slug?: string };

export default function LoginForm({ orgId, slug }: Props) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE}/api/v1/auth/login?org_id=${orgId}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password }),
        }
      );
      const raw = await res.json();
      if (!res.ok) throw new Error(raw?.message || "Login failed");
      const data = raw?.data ?? raw;
      const accessToken = data?.token?.access_token || data?.access_token;
      const refreshToken = data?.token?.refresh_token || data?.refresh_token;
      const redirectToMemberDashboard =
        data?.redirectToMemberDashboard === true;

      if (accessToken) {
        localStorage.setItem("vc_access_token", accessToken);
      }
      if (refreshToken) {
        localStorage.setItem("vc_refresh_token", refreshToken);
      }
      localStorage.setItem("vc_org_id", orgId);
      if (slug) {
        // Backend sets redirectToMemberDashboard based on user role
        // If false, user is admin and should see admin dashboard
        // If true, user is regular member and should see member dashboard
        const target = redirectToMemberDashboard
          ? `/${slug}/me`
          : `/${slug}/dashboard`;
        try {
          router.push(target);
        } catch {
          window.location.assign(target);
        }
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          Email
        </label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[--color-lemon-500] focus:border-[--color-lemon-500] transition-colors"
          placeholder="you@example.com"
          required
        />
      </div>
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          Password
        </label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[--color-lemon-500] focus:border-[--color-lemon-500] transition-colors"
          placeholder="••••••••"
          required
        />
      </div>
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3">
          <p className="text-red-700 text-sm">{error}</p>
        </div>
      )}
      <button
        type="submit"
        disabled={loading}
        className="w-full bg-[--color-lemon-600] hover:bg-[--color-lemon-700] text-gray-900 font-semibold py-3 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? "Signing in..." : "Sign in"}
      </button>
    </form>
  );
}
