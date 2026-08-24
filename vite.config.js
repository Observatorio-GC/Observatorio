import { defineConfig } from 'vite';
import { visualizer } from 'rollup-plugin-visualizer';

export default defineConfig({
  root: './',
  base: './',
  build: {
    outDir: 'dist',
    minify: 'terser',
    sourcemap: false,
    terserOptions: {
      compress: {
        drop_console: true,
      },
    },
    rollupOptions: {
      output: {
        manualChunks: {
          leaflet: ['leaflet', 'leaflet-markercluster', 'esri-leaflet', 'esri-leaflet-geocoder'],
          utils: ['rbush', 'axios'],
        },
      },
    },
  },
  server: {
    port: 5173,
    open: true,
    cors: true,
  },
  preview: {
    port: 4173,
  },
  plugins: [
    visualizer({
      open: false,
      gzipSize: true,
    }),
  ],
  resolve: {
    alias: {
      '@': '/src',
    },
  },
});
