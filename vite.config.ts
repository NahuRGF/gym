import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import { viteSingleFile } from 'vite-plugin-singlefile'

// GitHub Pages sirve este repo desde https://<user>.github.io/gym/, asi que el
// app vive en el subpath /gym/. Se aplica tambien en dev a proposito: mantener
// dev y prod con el mismo base evita bugs que solo aparecen en produccion.
const BASE = '/gym/'

export default defineConfig({
  base: BASE,
  plugins: [react(), tailwindcss(), viteSingleFile()],
  build: {
    target: 'es2022',
    assetsInlineLimit: 100_000_000,
    cssCodeSplit: false,
    reportCompressedSize: false,
  },
})
