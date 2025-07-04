/** @type {import('next').NextConfig} */
const nextConfig = {
  // PWA Configuration
  async headers() {
    return [
      {
        source: '/sw.js',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=0, must-revalidate',
          },
          {
            key: 'Service-Worker-Allowed',
            value: '/',
          },
        ],
      },
      {
        source: '/manifest.json',
        headers: [
          {
            key: 'Content-Type',
            value: 'application/manifest+json',
          },
        ],
      },
    ];
  },
  
  // Enable static export for better PWA compatibility
  trailingSlash: true,
  
  // Optimize for mobile devices
  compress: true,
  
  // Removed experimental features that were causing build issues
  
  // Image optimization for PWA
  images: {
    unoptimized: true,
  },
}

module.exports = nextConfig