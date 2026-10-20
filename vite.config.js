import { existsSync } from 'node:fs'
import { resolve } from 'node:path'
import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// The server side variables api/ reads. Locally they come from .env.local
// (Logan's own file, never committed). They reach only these handlers on
// the dev server: Vite puts nothing but VITE_ variables in the browser
// bundle, and none of these is one.
const SERVER_ENV = ['SUPABASE_URL', 'SUPABASE_SERVICE_ROLE_KEY', 'SUPABASE_SECRET_KEY', 'CONSOLE_EMAIL']

// `npm run dev` also serves api/, through the same handlers Vercel runs,
// so sign in and tracking work locally. Dev server only (apply: 'serve'):
// a production build never contains this. Only real route files match:
// api/<name>.js and api/console/<name>.js, never api/_lib.
function localApi() {
  return {
    name: 'local-api',
    apply: 'serve',
    configureServer(server) {
      const env = loadEnv(server.config.mode, process.cwd(), '')
      for (const key of SERVER_ENV) if (env[key] && !process.env[key]) process.env[key] = env[key]

      server.middlewares.use(async (req, res, next) => {
        const url = new URL(req.url, `http://${req.headers.host}`)
        const route = url.pathname.match(/^\/api\/((?:console\/)?[a-z]+)$/)
        if (!route) return next()
        const file = resolve(process.cwd(), `api/${route[1]}.js`)
        if (!existsSync(file)) {
          res.statusCode = 404
          return res.end()
        }
        try {
          const handler = (await server.ssrLoadModule(file))[req.method]
          if (!handler) {
            res.statusCode = 405
            return res.end()
          }
          const headers = new Headers()
          for (const [k, v] of Object.entries(req.headers)) {
            if (v != null && !['connection', 'transfer-encoding'].includes(k)) headers.set(k, [].concat(v).join(', '))
          }
          const chunks = []
          for await (const chunk of req) chunks.push(chunk)
          const body = req.method === 'GET' || req.method === 'HEAD' ? undefined : Buffer.concat(chunks)
          const response = await handler(new Request(url, { method: req.method, headers, body }))
          res.statusCode = response.status
          response.headers.forEach((value, key) => res.setHeader(key, value))
          res.end(Buffer.from(await response.arrayBuffer()))
        } catch (err) {
          server.config.logger.error(`local api: ${route[1]} failed: ${err.message}`)
          res.statusCode = 500
          res.end()
        }
      })
    },
  }
}

export default defineConfig({
  plugins: [react(), tailwindcss(), localApi()],
})
