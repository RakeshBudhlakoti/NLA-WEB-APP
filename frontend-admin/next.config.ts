import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        source: '/api/v1/:path*',
        destination: 'http://3.137.158.226/api/v1/:path*',
      },
      {
        source: '/uploads/:path*',
        destination: 'http://3.137.158.226/uploads/:path*',
      },
    ];
  },
};

export default nextConfig;
