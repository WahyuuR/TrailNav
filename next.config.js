/** @type {import('next').NextConfig} */

const withPWA = require('next-pwa')({
  dest: 'public',
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === 'development',
  runtimeCaching: [
    {
      urlPattern: /^https:\/\/[abc]\.tile\.openstreetmap\.org\/.*/i,
      handler: 'CacheFirst',
      options: {
        cacheName: 'osm-tiles',
        expiration: {
          maxEntries: 500,
          maxAgeSeconds: 30 * 24 * 60 * 60,
        },
        cacheableResponse: { statuses: [0, 200] },
      },
    },
    {
      urlPattern: /^https:\/\/[abc]\.tile\.opentopomap\.org\/.*/i,
      handler: 'CacheFirst',
      options: {
        cacheName: 'topo-tiles',
        expiration: {
          maxEntries: 300,
          maxAgeSeconds: 30 * 24 * 60 * 60,
        },
        cacheableResponse: { statuses: [0, 200] },
      },
    },
    {
      urlPattern: /^https:\/\/server\.arcgisonline\.com\/.*/i,
      handler: 'CacheFirst',
      options: {
        cacheName: 'satellite-tiles',
        expiration: {
          maxEntries: 300,
          maxAgeSeconds: 30 * 24 * 60 * 60,
        },
        cacheableResponse: { statuses: [0, 200] },
      },
    },
    {
      urlPattern: /^https:\/\/api\.open-elevation\.com\/.*/i,
      handler: 'NetworkFirst',
      options: {
        cacheName: 'elevation-api',
        networkTimeoutSeconds: 5,
        expiration: {
          maxEntries: 200,
          maxAgeSeconds: 7 * 24 * 60 * 60,
        },
        cacheableResponse: { statuses: [0, 200] },
      },
    },
  ],
});

const nextConfig = {
  reactStrictMode: true,
  // Leaflet needs transpiling in some environments
  transpilePackages: ['leaflet', 'react-leaflet'],
};

module.exports = withPWA(nextConfig);
