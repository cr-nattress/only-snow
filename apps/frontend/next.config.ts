import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ["@onlysnow/types", "@onlysnow/api-client"],
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "lh3.googleusercontent.com",
      },
    ],
  },
};

export default nextConfig;
