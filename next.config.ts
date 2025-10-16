import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  env: {
    NEXT_PUBLIC_API_BASE:
      process.env.NEXT_PUBLIC_API_BASE ||
      "https://coopsaasbe.onrender.com" ||
      "http://localhost:3004",
  },
};

export default nextConfig;
