import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import process from 'process';
import { defineConfig, loadEnv } from 'vite';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');

  return {
    root: '.',

    plugins: [react(), tailwindcss()],

    define: {
      'process.env.GEMINI_API_KEY': JSON.stringify(
        env.VITE_GEMINI_API_KEY
      ),
    },

    resolve: {
      alias: {
        '@': path.resolve(process.cwd(), 'src'),
      },
    },

    build: {
      outDir: 'dist',
      emptyOutDir: true,
    },

    server: {
      port: 5173,

      hmr: process.env.DISABLE_HMR !== 'true',

      proxy: {
        '/api': {
          target: 'http://localhost:3000',
          changeOrigin: true,
          secure: false,
        },
      },
    },
  };
});