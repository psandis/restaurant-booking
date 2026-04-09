import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "export",
  basePath: "/restaurant-booking",
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
