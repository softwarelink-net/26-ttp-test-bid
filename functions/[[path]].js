/**
 * Workers API 网关分发 — functions/[[path]].js
 */
import { json, CORS_HEADERS } from './lib/helpers.js'
import { BID_NOTICE } from './lib/seed.js'
import { handleAuth } from './api/auth/index.js'
import { handleTtp } from './api/ttp/index.js'
import { handleTests } from './api/tests/index.js'
import { handleFault } from './api/fault/index.js'

function deadlineCountdown(deadline) {
  const ts = new Date(String(deadline).replace(' ', 'T') + '+08:00').getTime()
  const remainMs = Math.max(0, ts - Date.now())
  return {
    deadline,
    remainMs,
    remainDays: Math.floor(remainMs / 86400000),
    remainHours: Math.floor((remainMs % 86400000) / 3600000),
    remainMinutes: Math.floor((remainMs % 3600000) / 60000),
    remainSeconds: Math.floor((remainMs % 60000) / 1000),
    isExpired: remainMs <= 0,
  }
}

export async function handleApi(request, env) {
  const url = new URL(request.url)
  const path = url.pathname.replace(/\/+$/, '') || '/'
  const method = request.method.toUpperCase()

  if (method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: CORS_HEADERS })
  }

  if (path === '/api/health' && method === 'GET') {
    let db = 'memory'
    try {
      if (env.DB) {
        await env.DB.prepare('SELECT 1').first()
        db = 'up'
      }
    } catch {
      db = 'degraded'
    }
    return json({
      ok: true,
      service: '26-ttp-test-bid',
      db,
      host: env.DEPLOYMENT_HOST,
      ts: new Date().toISOString(),
    })
  }

  if ((path === '/api/tender/spec' || path === '/api/bid') && method === 'GET') {
    return json({
      ok: true,
      bid: BID_NOTICE,
      countdown: deadlineCountdown(BID_NOTICE.deadline),
    })
  }

  if (path.startsWith('/api/auth') || path.startsWith('/api/admin')) {
    return handleAuth(request, env, path, method)
  }
  if (path.startsWith('/api/ttp')) {
    return handleTtp(request, env, path, method)
  }
  if (path.startsWith('/api/tests')) {
    return handleTests(request, env, path, method)
  }
  if (path.startsWith('/api/fault-injection')) {
    return handleFault(request, env, path, method)
  }

  return json({ ok: false, error: `Unknown API route: ${method} ${path}` }, 404)
}

export default {
  async fetch(request, env) {
    return handleApi(request, env)
  },
}
