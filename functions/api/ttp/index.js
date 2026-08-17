import { json, requireUser } from '../../lib/helpers.js'
import { can, deny } from '../../lib/rbac.js'
import { liveClusterStatus } from '../../lib/seed.js'
import { listConfigs } from '../../lib/store.js'

export async function handleTtp(request, env, path, method) {
  if (path === '/api/ttp/status' && method === 'GET') {
    const { user, error } = requireUser(request)
    if (error) return error
    if (!can(user.role, 'ttp.read') && user.role !== 'viewer' && user.role !== 'admin') {
      return json(deny(user.role, 'ttp.status'), 403)
    }
    const status = liveClusterStatus()
    const configs = await listConfigs(env)
    const dual = configs.find((c) => c.config_key === 'FEATURE_DUAL_CHANNEL_MONITOR')
    if (dual && dual.config_value !== 'true') {
      status.channel_b_mbps = 0
      status.cluster = { ...status.cluster, active_channels: 'A' }
    }
    return json({ ok: true, ...status })
  }

  return json({ ok: false, error: `Unknown ttp route ${method} ${path}` }, 404)
}
