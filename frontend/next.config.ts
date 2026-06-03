import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        // 1. طلبات الـ API الخاصة بالواتساب تذهب إلى Node.js (المنفذ 3001)
        source: '/api/whatsapp/:path*',
        destination: 'http://2.24.14.60:3001/api/whatsapp/:path*', 
      },
      {
        // 2. باقي طلبات الـ API العامة تذهب إلى Python (المنفذ 8000)
        source: '/api/:path*',
        destination: 'http://2.24.14.60:8000/api/:path*', 
      },
      {
        // 3. تمرير طلبات محرك الواتساب (Socket.io)
        source: '/socket.io/:path*',
        destination: 'http://2.24.14.60:3001/socket.io/:path*', 
      },
    ];
  },
};

export default nextConfig;