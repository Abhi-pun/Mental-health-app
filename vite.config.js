import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import { fileURLToPath } from 'node:url';

const rootDir = fileURLToPath(new URL('.', import.meta.url));

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, rootDir, '');
  let target = (env.VITE_SUPABASE_URL || '').trim().replace(/\/+$/, '');
  if (target && !/^https?:\/\//i.test(target)) {
    target = `https://${target}`;
  }

  return {
    plugins: [react()],
    server: {
      // Browser talks only to localhost; Vite forwards to Supabase (fixes many NetworkError / extension / strict-browser cases).
      proxy: target.startsWith('http')
        ? {
            '/__supabase': {
              target,
              changeOrigin: true,
              secure: true,
              rewrite: (path) => path.replace(/^\/__supabase/, ''),
            },
          }
        : {},
    },
  };
});
