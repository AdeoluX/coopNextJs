"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

interface MemberSidebarProps {
  slug: string;
}

export default function MemberSidebar({ slug }: MemberSidebarProps) {
  const pathname = usePathname();

  const handleSignOut = () => {
    localStorage.removeItem("vc_access_token");
    localStorage.removeItem("vc_refresh_token");
    localStorage.removeItem("vc_org_id");
    window.location.href = `/${slug}`;
  };

  return (
    <div className="fixed left-0 top-0 h-screen w-64 bg-white shadow-lg z-10 flex flex-col">
      {/* Header */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center">
          <div className="w-8 h-8 bg-[--color-lemon-600] rounded-lg flex items-center justify-center mr-3">
            <span className="text-white font-bold text-sm">VC</span>
          </div>
          <div>
            <h2 className="text-lg font-semibold text-gray-900">ValidCoop</h2>
            <p className="text-xs text-gray-500">Member Portal</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="mt-6 flex-1">
        <div className="px-4 space-y-2">
          <Link
            href={`/${slug}/me`}
            className={
              pathname === `/${slug}/me`
                ? "flex items-center px-4 py-3 text-sm font-semibold text-[--color-lemon-900] bg-[--color-lemon-200] border-l-4 border-[--color-lemon-600] rounded-lg"
                : "flex items-center px-4 py-3 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
            }
          >
            <svg
              className="w-5 h-5 mr-3"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8 5a2 2 0 012-2h4a2 2 0 012 2v2H8V5z"
              />
            </svg>
            Dashboard
          </Link>
          <Link
            href={`/${slug}/me/transactions`}
            className={
              pathname?.startsWith(`/${slug}/me/transactions`)
                ? "flex items-center px-4 py-3 text-sm font-semibold text-[--color-lemon-900] bg-[--color-lemon-200] border-l-4 border-[--color-lemon-600] rounded-lg"
                : "flex items-center px-4 py-3 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
            }
          >
            <svg
              className="w-5 h-5 mr-3"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"
              />
            </svg>
            Transactions
          </Link>
          <Link
            href={`/${slug}/me/portfolio`}
            className={
              pathname?.startsWith(`/${slug}/me/portfolio`)
                ? "flex items-center px-4 py-3 text-sm font-semibold text-[--color-lemon-900] bg-[--color-lemon-200] border-l-4 border-[--color-lemon-600] rounded-lg"
                : "flex items-center px-4 py-3 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
            }
          >
            <svg
              className="w-5 h-5 mr-3"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
              />
            </svg>
            Portfolio
          </Link>
          <Link
            href={`/${slug}/me/assets`}
            className={
              pathname?.startsWith(`/${slug}/me/assets`)
                ? "flex items-center px-4 py-3 text-sm font-semibold text-[--color-lemon-900] bg-[--color-lemon-200] border-l-4 border-[--color-lemon-600] rounded-lg"
                : "flex items-center px-4 py-3 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
            }
          >
            <svg
              className="w-5 h-5 mr-3"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
              />
            </svg>
            Available Assets
          </Link>
          <Link
            href={`/${slug}/me/stats`}
            className={
              pathname?.startsWith(`/${slug}/me/stats`)
                ? "flex items-center px-4 py-3 text-sm font-semibold text-[--color-lemon-900] bg-[--color-lemon-200] border-l-4 border-[--color-lemon-600] rounded-lg"
                : "flex items-center px-4 py-3 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
            }
          >
            <svg
              className="w-5 h-5 mr-3"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
              />
            </svg>
            Statistics
          </Link>
          <Link
            href={`/${slug}/me/bank`}
            className={
              pathname?.startsWith(`/${slug}/me/bank`)
                ? "flex items-center px-4 py-3 text-sm font-semibold text-[--color-lemon-900] bg-[--color-lemon-200] border-l-4 border-[--color-lemon-600] rounded-lg"
                : "flex items-center px-4 py-3 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
            }
          >
            <svg
              className="w-5 h-5 mr-3"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
              />
            </svg>
            Bank Management
          </Link>
        </div>
      </nav>

      {/* Sign Out Button */}
      <div className="p-4 border-t border-gray-200">
        <button
          onClick={handleSignOut}
          className="flex items-center w-full px-4 py-3 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <svg
            className="w-5 h-5 mr-3"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
            />
          </svg>
          Sign Out
        </button>
      </div>
    </div>
  );
}
