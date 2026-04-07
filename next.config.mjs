import withPWAInit from "@ducanh2912/next-pwa";

const withPWA = withPWAInit({
  dest: "public",
  disable: process.env.NODE_ENV === "development",
  register: false,
  cacheOnFrontEndNav: true,
  aggressiveFrontEndNavCaching: true,
  /** Sostituisce le regole default “NetworkFirst” su documenti/RSC con cache-first reale. */
  extendDefaultRuntimeCaching: true,
  workboxOptions: {
    runtimeCaching: [
      {
        urlPattern: ({ request, url: { pathname }, sameOrigin }) =>
          sameOrigin &&
          !pathname.startsWith("/api/") &&
          request.headers.get("RSC") === "1" &&
          request.headers.get("Next-Router-Prefetch") === "1",
        handler: "StaleWhileRevalidate",
        options: {
          cacheName: "pages-rsc-prefetch",
          expiration: {
            maxEntries: 32,
            maxAgeSeconds: 86400,
          },
        },
      },
      {
        urlPattern: ({ request, url: { pathname }, sameOrigin }) =>
          sameOrigin && !pathname.startsWith("/api/") && request.headers.get("RSC") === "1",
        handler: "StaleWhileRevalidate",
        options: {
          cacheName: "pages-rsc",
          expiration: {
            maxEntries: 32,
            maxAgeSeconds: 86400,
          },
        },
      },
      {
        urlPattern: ({ url: { pathname }, sameOrigin }) => sameOrigin && !pathname.startsWith("/api/"),
        handler: "StaleWhileRevalidate",
        options: {
          cacheName: "pages",
          expiration: {
            maxEntries: 32,
            maxAgeSeconds: 86400,
          },
        },
      },
    ],
  },
});

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.pexels.com",
        pathname: "/**",
      },
    ],
  },
  experimental: {
    serverActions: {
      bodySizeLimit: "20mb",
    },
  },
};

export default withPWA(nextConfig);
