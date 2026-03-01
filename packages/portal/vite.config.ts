import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { resolve } from 'path'

export default defineConfig(({ command }) => ({
  plugins: [vue()],
  base: command === 'build'
    ? (process.env.VITE_BASE_PATH || './')
    : '/',
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
    },
  },
}))
