import path from "path"
import react from "@vitejs/plugin-react"
import { defineConfig } from "vite"

export default defineConfig({
  plugins: [react()],
  server:{port:5173,host:'0.0.0.0', proxy: {
    '/api': {
      // target: 'http://127.0.0.1:4000',
      target: 'http://localhost:4000',
      changeOrigin: true,
    },
  }},
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    rollupOptions: {
      external: [],
      output: {
        manualChunks: (id) => {
          // Create a separate chunk for react-helmet-async
          if (id.includes('node_modules/react-helmet-async')) {
            return 'react-helmet-async';
          }
        }
      }
    },
    commonjsOptions: {
      include: [/node_modules/],
    }
  },
  optimizeDeps: {
    include: ['react-helmet-async']
  }
})
