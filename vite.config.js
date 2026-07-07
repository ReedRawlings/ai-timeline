import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  root: '.',
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        layoffs: resolve(__dirname, 'layoffs.html'),
        stocks: resolve(__dirname, 'stocks.html'),
        claims: resolve(__dirname, 'claims.html'),
        claim: resolve(__dirname, 'claim.html'),
      },
    },
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
    },
  },
});
