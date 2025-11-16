import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  // Turbopack SVG handling: treat SVGs as source and run through SVGR loader
  turbopack: {
    rules: {
      "*.svg": {
        loaders: ["@svgr/webpack"],
        as: "*.jsx",
      },
    },
  },

  // Also add a webpack rule so Webpack-based tooling (and some dev flows)
  // will load `.svg` files via SVGR and return a React component when
  // imported from JS/TSX files.
  webpack(config) {
    config.module.rules.push({
      test: /\.svg$/i,
      issuer: /\.[jt]sx?$/,
      use: ["@svgr/webpack"],
    });

    return config;
  },
};

export default nextConfig;