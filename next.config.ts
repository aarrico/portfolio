import type { NextConfig } from "next";
import createMDX from "@next/mdx";

const nextConfig: NextConfig = {
  cacheComponents: true,
  pageExtensions: ["ts", "tsx", "md", "mdx"],
  turbopack: {
    root: __dirname,
  },
};

const withMDX = createMDX({
  extension: /\.mdx?$/,
});

export default withMDX(nextConfig);
