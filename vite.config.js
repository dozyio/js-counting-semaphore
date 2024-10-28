/** @type {import('vite').UserConfig} */
import { resolve } from 'path'
import { defineConfig } from 'vite'
import dts from 'vite-plugin-dts'

export default defineConfig({
  plugins: [dts({
    insertTypesEntry: true,
    outputDir: 'dist',
    tsConfigFilePath: './tsconfig.json'
  })],
  build: {
    lib: {
      entry: resolve(__dirname, 'src/index.ts'),
      name: 'CountingSemaphore',
      fileName: 'counting-semaphore',
      formats: ['es']
    },
    sourcemap: true,
    emptyOutDir: true,
    minify: true,
  },
  ignorePatterns: ['test/*'],
  server: {
    port: 3000
  }
})
