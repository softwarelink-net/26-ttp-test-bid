export const PERMISSIONS = {
  admin: ['*'],
  engineer: [
    'dashboard.read',
    'tests.read',
    'tests.execute',
    'fault.trigger',
    'ttp.read',
    'icd.import',
  ],
  viewer: ['bid.read', 'tests.read', 'reports.read'],
}

export function can(role, perm) {
  const list = PERMISSIONS[role] || []
  return list.includes('*') || list.includes(perm)
}

export function deny(role, resource) {
  return {
    ok: false,
    error: `403 Forbidden：角色 ${role} 无权访问 ${resource}`,
  }
}
