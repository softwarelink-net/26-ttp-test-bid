import {
  json,
  parseAuth,
  requireUser,
  encodeToken,
  clientIp,
  DEMO_PASSWORDS,
  ROLE_LABELS,
  DEFAULT_ROUTES,
  newId,
} from '../../lib/helpers.js'
import { can, deny } from '../../lib/rbac.js'
import { writeAudit, findUserByUsername, listUsers, listConfigs, updateConfig, listAudit, seedRefresh } from '../../lib/store.js'

function publicUser(u) {
  if (!u) return null
  const rest = { ...u }
  delete rest.password_hash
  return {
    ...rest,
    role_label: ROLE_LABELS[u.role] || u.role,
    default_route: DEFAULT_ROUTES[u.role] || '/bid-notice',
  }
}

export async function handleAuth(request, env, path, method) {
  if (path === '/api/auth/login' && method === 'POST') {
    const body = await request.json().catch(() => ({}))
    const username = (body.username || '').trim()
    const password = body.password || ''
    const user = await findUserByUsername(env, username)

    if (!user) {
      await writeAudit(env, {
        user_id: 'anonymous',
        action: 'LOGIN',
        resource: username || 'unknown',
        payload: '账号不存在',
        ip_address: clientIp(request),
      })
      return json({ ok: false, error: '账号不存在或已停用' }, 401)
    }

    const expected = DEMO_PASSWORDS[user.username]
    if (!expected || expected !== password) {
      await writeAudit(env, {
        user_id: user.id,
        action: 'LOGIN',
        resource: user.username,
        payload: '口令校验失败',
        ip_address: clientIp(request),
      })
      return json({ ok: false, error: '口令校验失败' }, 401)
    }

    const session = publicUser(user)
    session.client_ip = clientIp(request)
    await writeAudit(env, {
      user_id: user.id,
      action: 'LOGIN',
      resource: user.username,
      payload: '口令登录成功',
      ip_address: session.client_ip,
    })
    return json({ ok: true, token: encodeToken(session), user: session })
  }

  if (path === '/api/auth/me' && method === 'GET') {
    const { user, error } = requireUser(request)
    if (error) return error
    return json({ ok: true, user: { ...user, client_ip: clientIp(request) } })
  }

  if (path === '/api/auth/logout' && method === 'POST') {
    const user = parseAuth(request)
    await writeAudit(env, {
      user_id: user?.id || 'anonymous',
      action: 'LOGOUT',
      resource: user?.username || '',
      payload: '会话注销',
      ip_address: clientIp(request),
    })
    return json({ ok: true })
  }

  if (path === '/api/admin/users' && method === 'GET') {
    const { user, error } = requireUser(request)
    if (error) return error
    if (!can(user.role, 'users.read') && user.role !== 'admin') return json(deny(user.role, 'users'), 403)
    const users = await listUsers(env)
    return json({ ok: true, users: users.map(publicUser) })
  }

  if (path === '/api/admin/configs' && method === 'GET') {
    const { user, error } = requireUser(request)
    if (error) return error
    if (user.role !== 'admin') return json(deny(user.role, 'configs'), 403)
    return json({ ok: true, configs: await listConfigs(env) })
  }

  if (path === '/api/admin/configs' && method === 'PUT') {
    const { user, error } = requireUser(request)
    if (error) return error
    if (user.role !== 'admin') return json(deny(user.role, 'configs.write'), 403)
    const body = await request.json().catch(() => ({}))
    const row = await updateConfig(env, body.config_key || body.key, body.config_value ?? body.value)
    if (!row) return json({ ok: false, error: '配置项不存在' }, 404)
    await writeAudit(env, {
      user_id: user.id,
      action: 'CONFIG_UPDATE',
      resource: row.config_key,
      payload: `${row.config_key}=${row.config_value}`,
      ip_address: clientIp(request),
    })
    return json({ ok: true, config: row })
  }

  if (path === '/api/admin/audit' && method === 'GET') {
    const { user, error } = requireUser(request)
    if (error) return error
    if (user.role !== 'admin') return json(deny(user.role, 'audit'), 403)
    return json({ ok: true, logs: await listAudit(env) })
  }

  if (path === '/api/admin/seed' && method === 'POST') {
    const { user, error } = requireUser(request)
    if (error) return error
    if (user.role !== 'admin') return json(deny(user.role, 'seed'), 403)
    const stats = await seedRefresh()
    await writeAudit(env, {
      id: newId('aud'),
      user_id: user.id,
      action: 'SEED',
      resource: 'd1',
      payload: JSON.stringify(stats),
      ip_address: clientIp(request),
    })
    return json({ ok: true, stats })
  }

  return json({ ok: false, error: `Unknown auth route ${method} ${path}` }, 404)
}
