import autoprefixer from 'autoprefixer';
import { defineConfig } from 'vite';
import { nodePolyfills } from 'vite-plugin-node-polyfills';
import { purgeCss } from 'vite-plugin-tailwind-purgecss';
import { sveltekit } from '@sveltejs/kit/vite';
import tailwind from 'tailwindcss';

export default defineConfig({
    plugins: [
        sveltekit(),
        purgeCss(),
        nodePolyfills({
            include: ['buffer', 'crypto', 'stream', 'util', 'vm'],
            globals: { Buffer: true },
        }),
    ],
    css: { postcss: { plugins: [tailwind, autoprefixer] } },
});
