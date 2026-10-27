import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // Fully static export: no server required, deployable to any static host.
  output: "export",
  images: { unoptimized: true },
};

export default nextConfig;
