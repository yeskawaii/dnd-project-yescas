import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { appVersion } from './build/appVersion.js'

export default defineConfig({
  plugins: [react(), tailwindcss(), appVersion()],
})
