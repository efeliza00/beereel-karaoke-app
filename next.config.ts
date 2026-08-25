/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "i.ytimg.com", // Handles most modern high-res thumbnails
        port: "",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "img.youtube.com", // Handles standard format backups
        port: "",
        pathname: "/**",
      },
    ],
  },
};

module.exports = nextConfig;
