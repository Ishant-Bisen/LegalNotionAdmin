import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

import { cloudflare } from "@cloudflare/vite-plugin";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const proxyTarget = (env.VITE_DEV_PROXY_TARGET || 'http://localhost:3000').replace(/\/$/, '')

  return {
    plugins: [react(), tailwindcss(), cloudflare()],
    server: {
      host: true,
      proxy: {
        '/api': {
          target: proxyTarget,
          changeOrigin: true,
          secure: proxyTarget.startsWith('https'),
          configure(proxy) {
            proxy.on('proxyRes', (proxyRes) => {
              const raw = proxyRes.headers['set-cookie']
              if (!raw) return
              const list = Array.isArray(raw) ? raw : [raw]
              proxyRes.headers['set-cookie'] = list.map((cookie) =>
                String(cookie)
                  .replace(/;\s*Domain=[^;]*/gi, '')
                  .replace(/;\s*Secure/gi, '')
                  .replace(/;\s*SameSite=None/gi, '; SameSite=Lax'),
              )
            })
          },
        },
      },
    },
  };
})