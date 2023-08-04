import legacy from '@vitejs/plugin-legacy'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import mkcert from 'vite-plugin-mkcert'
import del from 'rollup-plugin-delete'

// https://vitejs.dev/config/
export default defineConfig({
  server: { https: true },
  plugins: [
    del({ targets: 'dist/*' }),
    react(),
    legacy(),
    mkcert()
  ],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/setupTests.ts',
  }
})
