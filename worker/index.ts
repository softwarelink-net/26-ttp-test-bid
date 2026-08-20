/**
 * Cloudflare Worker — 26-ttp-test-bid
 * 独立主机：ASSETS SPA + /api/* + R2 双写备份
 */
import { handleApi } from '../functions/[[path]].js'

export interface Env {
  DB: D1Database
  STORAGE: R2Bucket
  SITES: R2Bucket
  ASSETS: Fetcher
  PROJECT_SLUG: string
  DEPLOYMENT_HOST: string
  ROOT_DOMAIN: string
}

const CORS_HEADERS: HeadersInit = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET,POST,PUT,PATCH,DELETE,OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
}

function json(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      ...CORS_HEADERS,
    },
  })
}

function contentTypeFor(path: string): string {
  const ext = path.split('.').pop()?.toLowerCase() || ''
  const map: Record<string, string> = {
    html: 'text/html; charset=utf-8',
    js: 'application/javascript; charset=utf-8',
    css: 'text/css; charset=utf-8',
    json: 'application/json; charset=utf-8',
    svg: 'image/svg+xml',
    png: 'image/png',
    jpg: 'image/jpeg',
    jpeg: 'image/jpeg',
    webp: 'image/webp',
    ico: 'image/x-icon',
    txt: 'text/plain; charset=utf-8',
    map: 'application/json',
    xml: 'application/xml; charset=utf-8',
    woff: 'font/woff',
    woff2: 'font/woff2',
  }
  return map[ext] || 'application/octet-stream'
}

async function serveProjectStorage(request: Request, env: Env): Promise<Response | null> {
  if (!env.STORAGE) return null
  const url = new URL(request.url)
  let pathname = decodeURIComponent(url.pathname)
  if (pathname.endsWith('/') || pathname === '') pathname = '/index.html'
  const key = pathname.replace(/^\//, '')
  const slug = env.PROJECT_SLUG || '26-ttp-test-bid'
  const keys = [key, `${slug}/${key}`]
  if (!key.includes('.')) keys.push('index.html', `${slug}/index.html`)

  for (const candidate of keys) {
    const obj = await env.STORAGE.get(candidate)
    if (!obj) continue
    const headers = new Headers()
    headers.set('Content-Type', obj.httpMetadata?.contentType || contentTypeFor(candidate))
    if (obj.httpEtag) headers.set('ETag', obj.httpEtag)
    return new Response(obj.body, { headers })
  }
  return null
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url)

    if (url.pathname.startsWith('/api/')) {
      try {
        return await handleApi(request, env)
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Internal error'
        return json({ ok: false, error: message }, 500)
      }
    }

    if (env.ASSETS) {
      return env.ASSETS.fetch(request)
    }

    const fromR2 = await serveProjectStorage(request, env)
    if (fromR2) return fromR2
    return new Response('ASSETS binding not configured', { status: 500 })
  },
}
