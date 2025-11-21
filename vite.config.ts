/** WARNING: DON'T EDIT THIS FILE */
/** WARNING: DON'T EDIT THIS FILE */
/** WARNING: DON'T EDIT THIS FILE */

import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tsconfigPaths from "vite-tsconfig-paths";

function getPlugins() {
  const plugins = [react(), tsconfigPaths()];
  return plugins;
}

export default defineConfig({
  base: './',
  plugins: getPlugins(),
  build: {
    assetsDir: 'assets',
    rollupOptions: {
      output: {
        // JavaScript 入口文件
        entryFileNames: "assets/[name]-[hash].js",
        // 动态拆分的 JS chunk
        chunkFileNames: "assets/[name]-[hash].js",
        // 静态资源（CSS、图片、字体等）
        assetFileNames: "assets/[name]-[hash].[ext]"
      }
    }
  }
});
