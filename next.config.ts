import type { NextConfig } from "next";

// `RUST_COMPILER=1` switches the React Compiler from the Babel loader
// (`babel-plugin-react-compiler`) to Turbopack's native Rust port.
const useRust = process.env.RUST_COMPILER === "1";

const nextConfig: NextConfig = {
  reactCompiler: true,
  experimental: useRust ? { turbopackRustReactCompiler: true } : {},
};

export default nextConfig;
