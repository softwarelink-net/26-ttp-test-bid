const TOKEN_KEY = 'ttp_bid_token'

async function request(path, options = {}) {
  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {}),
  }
  const token = localStorage.getItem(TOKEN_KEY)
  if (token) headers.Authorization = `Bearer ${token}`

  const res = await fetch(path, { ...options, headers })
  const data = await res.json().catch(() => ({ ok: false, error: 'Invalid JSON' }))
  if (!res.ok) {
    const err = new Error(data.error || `HTTP ${res.status}`)
    err.status = res.status
    err.data = data
    throw err
  }
  return data
}

export const api = {
  tokenKey: TOKEN_KEY,
  login: (payload) => request('/api/auth/login', { method: 'POST', body: JSON.stringify(payload) }),
  me: () => request('/api/auth/me'),
  logout: () => request('/api/auth/logout', { method: 'POST' }),
  tender: () => request('/api/tender/spec'),
  health: () => request('/api/health'),
  ttpStatus: () => request('/api/ttp/status'),
  tests: () => request('/api/tests/list'),
  runTest: (test_case_id) =>
    request('/api/tests/run', { method: 'POST', body: JSON.stringify({ test_case_id }) }),
  importIcd: (payload) => request('/api/tests/icd', { method: 'POST', body: JSON.stringify(payload) }),
  faults: () => request('/api/fault-injection/events'),
  triggerFault: (payload) =>
    request('/api/fault-injection/trigger', { method: 'POST', body: JSON.stringify(payload) }),
  users: () => request('/api/admin/users'),
  configs: () => request('/api/admin/configs'),
  updateConfig: (payload) => request('/api/admin/configs', { method: 'PUT', body: JSON.stringify(payload) }),
  audit: () => request('/api/admin/audit'),
  seed: () => request('/api/admin/seed', { method: 'POST' }),
}
