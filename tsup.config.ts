import type { Plugin as EsbuildPlugin } from "esbuild";
import { defineConfig } from "tsup";

const preserveRuntimeImportsPlugin: EsbuildPlugin = {
   name: "preserve-runtime-imports",
   setup(build) {
      build.onResolve({ filter: /^virtual:supadeck\// }, (args) => ({
         external: true,
         path: args.path,
      }));

      build.onResolve({ filter: /\.css$/ }, (args) => ({
         external: true,
         path: args.path,
      }));
   },
};

const sharedExternal = ["react", "react-dom", "playwright", "node:*"];

const nodeExternal = [
   ...sharedExternal,
   "vite",
   "@mdx-js/rollup",
   "@tailwindcss/vite",
   "@vitejs/plugin-react",
   "tailwindcss",
];

const requireBanner =
   'import { createRequire } from "node:module"; const require = createRequire(import.meta.url);';

export default defineConfig([
   {
      clean: true,
      dts: false,
      entry: {
         "cli/index": "src/cli/index.ts",
         "runtime/vite-config": "src/runtime/vite-config.ts",
      },
      external: nodeExternal,
      esbuildPlugins: [preserveRuntimeImportsPlugin],
      format: ["esm"],
      outDir: "dist",
      platform: "node",
      metafile: true,
      skipNodeModulesBundle: false,
      sourcemap: false,
      splitting: false,
      target: "es2023",
      banner: {
         js: requireBanner,
      },
   },
   {
      clean: false,
      dts: false,
      entry: {
         index: "src/index.ts",
         "runtime/main": "src/runtime/main.tsx",
         "runtime/themes/default/index": "src/runtime/themes/default/index.tsx",
         "runtime/themes/sunset/index": "src/runtime/themes/sunset/index.tsx",
      },
      external: sharedExternal,
      esbuildPlugins: [preserveRuntimeImportsPlugin],
      format: ["esm"],
      outDir: "dist",
      platform: "browser",
      skipNodeModulesBundle: false,
      sourcemap: false,
      splitting: false,
      target: "es2023",
   },
]);
