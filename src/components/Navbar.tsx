"use client";

import { useState } from "react";
import Link from "next/link";

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <nav className="bg-white shadow-sm border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link href="/" className="flex-shrink-0">
              <span className="text-2xl font-bold text-[--color-lemon-700]">
                ValidCoop
              </span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <Link
              href="#features"
              className="text-gray-700 hover:text-[--color-lemon-700] px-3 py-2 text-sm font-medium"
            >
              Features
            </Link>
            <Link
              href="#about"
              className="text-gray-700 hover:text-[--color-lemon-700] px-3 py-2 text-sm font-medium"
            >
              About
            </Link>
            <Link
              href="#contact"
              className="text-gray-700 hover:text-[--color-lemon-700] px-3 py-2 text-sm font-medium"
            >
              Contact
            </Link>
            <Link
              href="/auth/login"
              className="text-gray-700 hover:text-[--color-lemon-700] px-3 py-2 text-sm font-medium"
            >
              Login
            </Link>
            <Link
              href="/auth/signup"
              className="bg-[--color-lemon-600] text-gray-900 px-4 py-2 rounded-md text-sm font-medium hover:bg-[--color-lemon-700]"
            >
              Get Started
            </Link>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-gray-700 hover:text-[--color-lemon-700] focus:outline-none focus:text-[--color-lemon-700]"
            >
              <svg
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                {isMenuOpen ? (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                ) : (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-white border-t">
              <Link
                href="#features"
                className="text-gray-700 hover:text-[--color-lemon-700] block px-3 py-2 text-base font-medium"
                onClick={() => setIsMenuOpen(false)}
              >
                Features
              </Link>
              <Link
                href="#about"
                className="text-gray-700 hover:text-[--color-lemon-700] block px-3 py-2 text-base font-medium"
                onClick={() => setIsMenuOpen(false)}
              >
                About
              </Link>
              <Link
                href="#contact"
                className="text-gray-700 hover:text-[--color-lemon-700] block px-3 py-2 text-base font-medium"
                onClick={() => setIsMenuOpen(false)}
              >
                Contact
              </Link>
              <Link
                href="/auth/login"
                className="text-gray-700 hover:text-[--color-lemon-700] block px-3 py-2 text-base font-medium"
                onClick={() => setIsMenuOpen(false)}
              >
                Login
              </Link>
              <Link
                href="/auth/signup"
                className="bg-[--color-lemon-600] text-gray-900 block px-3 py-2 rounded-md text-base font-medium hover:bg-[--color-lemon-700]"
                onClick={() => setIsMenuOpen(false)}
              >
                Get Started
              </Link>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
