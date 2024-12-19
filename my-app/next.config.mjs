/** @type {import('next').NextConfig} */
const nextConfig = {
    images: {
        remotePatterns: [
          {
            protocol: 'https',
            hostname: 'images.unsplash.com',
            port: '',
            pathname: '/**',
          },
          {
            protocol: 'https',
            hostname: 'media.licdn.com',
            port: '',
            pathname: '/dms/**',
          },
        ],
      },
};

export default nextConfig;
