const nextConfig = {
  reactStrictMode: false,
  output: "standalone",
  distDir: process.env.NEXT_DIST_DIR || ".next",
};

export default nextConfig;
