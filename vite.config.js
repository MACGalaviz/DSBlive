import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  base: '/dsblive/', 
  server: {
    open: true,
    strictPort: true,
  },
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
  }
})