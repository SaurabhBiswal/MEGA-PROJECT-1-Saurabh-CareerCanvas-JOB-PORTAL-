import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite' // Ye line check karo

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(), // Ye line bhi zaroori hai
  ],
})