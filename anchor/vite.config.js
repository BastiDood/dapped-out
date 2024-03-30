/// <reference types="vitest" />
import { defineConfig } from 'vite';
export default defineConfig({ test: { bail: 1, slowTestThreshold: 600 } });
