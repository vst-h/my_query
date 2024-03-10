/// <reference types="vitest" />
import { defineConfig } from 'vite'

export default defineConfig({
  test: {
    typecheck: {
      enabled: true,
      // exclude: ["**/node_modules/**"],
    },
  },
})