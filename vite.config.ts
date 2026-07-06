import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    // Honor an externally assigned port (e.g. tooling that sets PORT); default stays 5173
    port: Number(process.env.PORT) || 5173,
  },
})
