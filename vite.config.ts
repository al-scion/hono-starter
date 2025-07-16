import { cloudflare } from '@cloudflare/vite-plugin';
import tailwindcss from '@tailwindcss/vite';
import { TanStackRouterVite } from '@tanstack/router-vite-plugin';
import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig } from 'vite';
import devtoolsJson from 'vite-plugin-devtools-json';

export default defineConfig({
  plugins: [
    TanStackRouterVite({
      target: 'react',
      autoCodeSplitting: true,
    }),
    react({
      babel: {
        plugins: [['babel-plugin-react-compiler']],
      },
    }),
    cloudflare(),
    tailwindcss(),
    devtoolsJson(),
    
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src/client'),
    },
  },
});
