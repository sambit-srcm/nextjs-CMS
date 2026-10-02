import type { NextConfig } from "next";

import { currentEnvironment, securityHeaders } from "./lib/security-headers";

const nextConfig: NextConfig = {
  // Do not send X-Powered-By.
  poweredByHeader: false,
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.ctfassets.net",
        pathname: "/**",
      },
    ],
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: securityHeaders(currentEnvironment()),
      },
    ];
  },
};

export default nextConfig;
