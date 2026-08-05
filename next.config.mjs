/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites() {
    const apiUrl =
      process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000/api";
    // Remove /api from destination if apiUrl already contains it
    const cleanApiUrl = apiUrl.replace(/\/api$/, "");

    return [
      {
        source: "/api/:path*",
        destination: `${cleanApiUrl}/api/:path*`,
      },
      {
        source: "/public/uploads/:path*",
        destination: `${cleanApiUrl}/public/uploads/:path*`,
      },
      {
        source: "/uploads/:path*",
        destination: `${cleanApiUrl}/uploads/:path*`,
      },
    ];
  },
};

export default nextConfig;
