// @ts-check
import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';
import react from '@astrojs/react';

// https://astro.build/config
export default defineConfig({
  integrations: [react()],
  vite: {
    plugins: [tailwindcss()],
    ssr: {
      noExternal: ['three', '@react-three/fiber', '@react-three/drei', '@react-three/postprocessing']
    },
    build: {
      chunkSizeWarningLimit: 1200,
    }
  }
});