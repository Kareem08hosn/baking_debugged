/** @type {import('next').NextConfig} */
const nextConfig = {
  // /pantry was merged into /find
  async redirects() {
    return [{ source: "/pantry", destination: "/find", permanent: true }];
  },
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
