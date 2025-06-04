import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { cloudflare } from "@cloudflare/vite-plugin";
import tailwindcss from "@tailwindcss/vite"
import { TanStackRouterVite } from '@tanstack/router-vite-plugin'
import path from "path";

export default defineConfig({
  plugins: [
    TanStackRouterVite({
      target: 'react',
      autoCodeSplitting: true,
      routesDirectory: './src/client/routes',
      generatedRouteTree: './src/client/routeTree.gen.ts',
      routeFileIgnorePrefix: '-',
      quoteStyle: 'single',
    }),
    react({
      babel: {
        plugins: [["babel-plugin-react-compiler", "ReactCompilerConfig"]],
      },
    }),
    cloudflare(), 
    tailwindcss(),
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src/client"),
    },
  },
});
