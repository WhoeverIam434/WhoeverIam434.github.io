import type { NextConfig } from "next";

/**
 * GitHub Pages notes
 * ──────────────────
 * A user site (repo `name.github.io`) is served from the domain root, so the
 * base path is empty. A project site (any other repo name) is served from
 * `https://name.github.io/<repo>/`, so every asset URL needs that prefix.
 *
 * The deploy workflow sets NEXT_PUBLIC_BASE_PATH automatically; when building
 * by hand for a project site, set it before `npm run build`:
 *
 *   PowerShell:  $env:NEXT_PUBLIC_BASE_PATH="/my-repo"; npm run build
 *   bash:        NEXT_PUBLIC_BASE_PATH=/my-repo npm run build
 *
 * Leave it unset for local development.
 */
const basePath = (process.env.NEXT_PUBLIC_BASE_PATH ?? "").trim();

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // Fully static export: no server required, deployable to any static host.
  output: "export",
  images: { unoptimized: true },
  // Emit `foo/index.html` instead of `foo.html`, which is what GitHub Pages
  // serves most predictably.
  trailingSlash: true,
  ...(basePath ? { basePath } : {}),
};

export default nextConfig;
