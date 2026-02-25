import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
    server: {
        fs: { strict: false },
    },
    test: {
        environment: 'node',
        globals: true,
        include: ['../test/api/**/*.test.ts'],
    },
    resolve: {
        alias: {
            '@': path.resolve(__dirname, './'),
        },
    },
});
