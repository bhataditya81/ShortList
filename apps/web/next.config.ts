import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ["@shortlist/catalog", "@shortlist/ranker", "@shortlist/data-store"],
};

export default nextConfig;
