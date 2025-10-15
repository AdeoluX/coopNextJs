"use client";

import { useState } from "react";

export default function TenantSignupForm() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE}/api/v1/auth/sign-up`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name, email, password, confirmPassword }),
        }
      );
      const json = await res.json();
      if (!res.ok) throw new Error(json?.message || "Signup failed");

      const data = json?.data || json; // support either envelope
      const slug = data?.slug;
      if (slug) {
        window.location.href = `/${slug}`;
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          Cooperative Name
        </label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[--color-lemon-500] focus:border-[--color-lemon-500] transition-colors"
          placeholder="Enter your cooperative name"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          Admin Email
        </label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[--color-lemon-500] focus:border-[--color-lemon-500] transition-colors"
          placeholder="admin@yourcoop.org"
          required
        />
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Password
          </label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[--color-lemon-500] focus:border-[--color-lemon-500] transition-colors"
            placeholder="Minimum 7 characters"
            required
            minLength={7}
          />
        </div>
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Confirm Password
          </label>
          <input
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[--color-lemon-500] focus:border-[--color-lemon-500] transition-colors"
            placeholder="Confirm your password"
            required
            minLength={7}
          />
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3">
          <p className="text-red-700 text-sm">{error}</p>
        </div>
      )}

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-[--color-lemon-600] hover:bg-[--color-lemon-700] text-gray-900 font-semibold py-3 px-4 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? "Creating Cooperative..." : "Create Cooperative"}
      </button>

      <p className="text-center text-sm text-gray-500">
        By continuing, you agree to our{" "}
        <a href="#" className="text-[--color-lemon-700] hover:underline">
          Terms
        </a>{" "}
        and{" "}
        <a href="#" className="text-[--color-lemon-700] hover:underline">
          Privacy Policy
        </a>
        .
      </p>
    </form>
  );
}
