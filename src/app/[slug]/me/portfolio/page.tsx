"use client";

import { useEffect, useState, use } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import MemberSidebar from "@/components/MemberSidebar";

export default function MemberPortfolioPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const resolvedParams = use(params);
  const pathname = usePathname();
  const [portfolio, setPortfolio] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isClient, setIsClient] = useState(false);

  const handleSignOut = () => {
    localStorage.removeItem("vc_access_token");
    localStorage.removeItem("vc_refresh_token");
    localStorage.removeItem("vc_org_id");
    window.location.href = `/${resolvedParams.slug}`;
  };

  useEffect(() => {
    setIsClient(true);
    const storedToken = localStorage.getItem("vc_access_token");
    setToken(storedToken);
  }, []);

  useEffect(() => {
    if (!token || !isClient) return;
    fetchPortfolio();
  }, [token, isClient]);

  const fetchPortfolio = async () => {
    try {
      setLoading(true);
      const apiBase = process.env.NEXT_PUBLIC_API_BASE as string;

      const response = await fetch(`${apiBase}/api/v1/member/portfolio`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch portfolio");
      }

      const data = await response.json();
      setPortfolio(data.data || data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (!isClient) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 bg-gradient-to-br from-[--color-lemon-50] to-[--color-lemon-100]">
        <p className="text-gray-700">Loading...</p>
      </div>
    );
  }

  if (!token) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 text-center bg-gradient-to-br from-[--color-lemon-50] to-[--color-lemon-100]">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            You are not signed in
          </h1>
          <p className="text-gray-600 mt-2">
            Please sign in to view your portfolio.
          </p>
          <Link
            href={`/${resolvedParams.slug}`}
            className="inline-block mt-4 px-4 py-2 bg-[--color-lemon-600] text-gray-900 rounded-lg"
          >
            Go to login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[--color-lemon-50] to-[--color-lemon-100]">
      <MemberSidebar slug={resolvedParams.slug} />

      {/* Main Content */}
      <div className="ml-64 p-8">
        <header className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">My Portfolio</h1>
          <p className="text-gray-600">
            View your investment portfolio and asset holdings
          </p>
        </header>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg p-4 mb-6">
            {error}
          </div>
        )}

        {loading ? (
          <div className="text-gray-700">Loading portfolio...</div>
        ) : (
          <div className="space-y-6">
            {/* Portfolio Summary */}
            {portfolio && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white rounded-xl shadow p-6">
                  <div className="text-sm text-gray-500">Total Investment</div>
                  <div className="text-3xl font-bold text-gray-900">
                    ₦{portfolio.totalInvestment?.toLocaleString() || "0"}
                  </div>
                </div>
                <div className="bg-white rounded-xl shadow p-6">
                  <div className="text-sm text-gray-500">Total Units</div>
                  <div className="text-3xl font-bold text-gray-900">
                    {portfolio.totalUnits || "0"}
                  </div>
                </div>
                <div className="bg-white rounded-xl shadow p-6">
                  <div className="text-sm text-gray-500">Current Value</div>
                  <div className="text-3xl font-bold text-gray-900">
                    ₦{portfolio.currentValue?.toLocaleString() || "0"}
                  </div>
                </div>
              </div>
            )}

            {/* Asset Holdings */}
            <div className="bg-white rounded-xl shadow">
              <div className="p-6 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">
                  Asset Holdings
                </h3>
              </div>
              <div className="p-6">
                {portfolio?.assets && portfolio.assets.length > 0 ? (
                  <div className="space-y-4">
                    {portfolio.assets.map((asset: any) => (
                      <div
                        key={asset._id}
                        className="flex items-center justify-between p-4 border border-gray-200 rounded-lg"
                      >
                        <div>
                          <h4 className="font-medium text-gray-900">
                            {asset.name}
                          </h4>
                          <p className="text-sm text-gray-500 capitalize">
                            {asset.type}
                          </p>
                        </div>
                        <div className="text-right">
                          <div className="font-medium text-gray-900">
                            {asset.units} units
                          </div>
                          <div className="text-sm text-gray-500">
                            ₦{asset.value?.toLocaleString() || "0"}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-gray-500">
                      No assets in your portfolio yet
                    </p>
                    <Link
                      href={`/${resolvedParams.slug}/me/assets`}
                      className="inline-block mt-4 px-4 py-2 bg-[--color-lemon-600] text-gray-900 rounded-lg hover:bg-[--color-lemon-700] transition-colors"
                    >
                      Browse Available Assets
                    </Link>
                  </div>
                )}
              </div>
            </div>

            {/* Performance Summary */}
            {portfolio && (
              <div className="bg-white rounded-xl shadow p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Performance Summary
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-500">
                      Total Return
                    </label>
                    <p className="text-2xl font-bold text-gray-900">
                      ₦{portfolio.totalReturn?.toLocaleString() || "0"}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-500">
                      Return Percentage
                    </label>
                    <p
                      className={`text-2xl font-bold ${
                        (portfolio.returnPercentage || 0) >= 0
                          ? "text-green-600"
                          : "text-red-600"
                      }`}
                    >
                      {(portfolio.returnPercentage || 0).toFixed(2)}%
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
