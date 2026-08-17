import { memory, resetMemory, TEST_CASES } from './seed.js'
import { nowIso, newId } from './helpers.js'

let d1Ready = null

export async function hasD1(env) {
  if (d1Ready !== null) return d1Ready
  try {
    if (!env?.DB) {
      d1Ready = false
      return false
    }
    await env.DB.prepare('SELECT 1').first()
    d1Ready = true
  } catch {
    d1Ready = false
  }
  return d1Ready
}

async function queryAll(env, sql) {
  if (!(await hasD1(env))) return null
  try {
    const { results } = await env.DB.prepare(sql).all()
    return results || null
  } catch {
    return null
  }
}

export async function writeAudit(env, entry) {
  const row = {
    id: entry.id || newId('aud'),
    user_id: entry.user_id || 'anonymous',
    action: entry.action,
    resource: entry.resource || '',
    payload: entry.payload || '',
    ip_address: entry.ip_address || '0.0.0.0',
    created_at: entry.created_at || nowIso(),
  }
  memory.logs.unshift(row)
  if (memory.logs.length > 400) memory.logs.length = 400

  if (await hasD1(env)) {
    const stmts = [
      `INSERT INTO audit_logs (id, user_id, action, resource, payload, ip_address) VALUES (?, ?, ?, ?, ?, ?)`,
      `INSERT INTO ttp_audit_logs (id, user_id, action, resource, payload, ip_address) VALUES (?, ?, ?, ?, ?, ?)`,
    ]
    for (const sql of stmts) {
      try {
        await env.DB.prepare(sql)
          .bind(row.id, row.user_id, row.action, row.resource, row.payload, row.ip_address)
          .run()
        break
      } catch {
        /* try next table name */
      }
    }
  }
  return row
}

export async function findUserByUsername(env, username) {
  if (await hasD1(env)) {
    for (const table of ['users', 'ttp_users']) {
      try {
        const row = await env.DB.prepare(`SELECT * FROM ${table} WHERE username = ?`).bind(username).first()
        if (row) return row
      } catch {
        /* fallback */
      }
    }
  }
  return memory.users.find((u) => u.username === username) || null
}

export async function listUsers(env) {
  const rows = (await queryAll(env, 'SELECT * FROM ttp_users')) || (await queryAll(env, 'SELECT * FROM users'))
  if (rows?.length) return rows
  return memory.users.map((u) => {
    const row = { ...u }
    delete row.password_hash
    return row
  })
}

export async function listConfigs(env) {
  const rows =
    (await queryAll(env, 'SELECT * FROM ttp_system_configs')) ||
    (await queryAll(env, 'SELECT * FROM system_configs'))
  if (rows?.length) return rows
  return memory.configs
}

export async function updateConfig(env, key, value) {
  const row = memory.configs.find((c) => c.config_key === key)
  if (!row) return null
  row.config_value = String(value)
  row.updated_at = nowIso()
  if (await hasD1(env)) {
    for (const table of ['system_configs', 'ttp_system_configs']) {
      try {
        await env.DB.prepare(
          `UPDATE ${table} SET config_value = ?, updated_at = CURRENT_TIMESTAMP WHERE config_key = ?`,
        )
          .bind(row.config_value, key)
          .run()
        break
      } catch {
        /* fallback */
      }
    }
  }
  return row
}

export async function listTestCases(env) {
  const rows = (await queryAll(env, 'SELECT * FROM ttp_test_cases')) || (await queryAll(env, 'SELECT * FROM test_cases'))
  if (rows?.length) return rows
  return memory.test_cases
}

export async function listExecutions(env) {
  const rows =
    (await queryAll(env, 'SELECT * FROM ttp_test_execution_records ORDER BY created_at DESC')) ||
    (await queryAll(env, 'SELECT * FROM test_execution_records ORDER BY created_at DESC'))
  if (rows?.length) return rows
  return memory.executions
}

export async function insertExecution(env, rec) {
  memory.executions.unshift(rec)
  const tc = memory.test_cases.find((t) => t.id === rec.test_case_id)
  if (tc) tc.status = rec.result === 'passed' ? 'passed' : rec.result === 'failed' ? 'failed' : tc.status
  if (await hasD1(env)) {
    for (const table of ['test_execution_records', 'ttp_test_execution_records']) {
      try {
        await env.DB.prepare(
          `INSERT INTO ${table}
           (id, test_case_id, executed_by, duration_ms, result, measured_sync_jitter_ns, measured_latency_us, log_summary)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        )
          .bind(
            rec.id,
            rec.test_case_id,
            rec.executed_by,
            rec.duration_ms,
            rec.result,
            rec.measured_sync_jitter_ns,
            rec.measured_latency_us,
            rec.log_summary,
          )
          .run()
        break
      } catch {
        /* fallback */
      }
    }
  }
  return rec
}

export async function listFaults(env) {
  const rows =
    (await queryAll(env, 'SELECT * FROM ttp_fault_injection_events ORDER BY timestamp DESC')) ||
    (await queryAll(env, 'SELECT * FROM fault_injection_events ORDER BY timestamp DESC'))
  if (rows?.length) return rows
  return memory.faults
}

export async function insertFault(env, rec) {
  memory.faults.unshift(rec)
  if (await hasD1(env)) {
    for (const table of ['fault_injection_events', 'ttp_fault_injection_events']) {
      try {
        await env.DB.prepare(
          `INSERT INTO ${table}
           (id, fault_type, channel, target_slot, injection_duration_ms, gcu_response_state, bpcu_response_state, triggered_by)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        )
          .bind(
            rec.id,
            rec.fault_type,
            rec.channel,
            rec.target_slot,
            rec.injection_duration_ms,
            rec.gcu_response_state,
            rec.bpcu_response_state,
            rec.triggered_by,
          )
          .run()
        break
      } catch {
        /* fallback */
      }
    }
  }
  return rec
}

export async function listAudit(env) {
  const rows =
    (await queryAll(env, 'SELECT * FROM ttp_audit_logs ORDER BY created_at DESC LIMIT 200')) ||
    (await queryAll(env, 'SELECT * FROM audit_logs ORDER BY created_at DESC LIMIT 200'))
  if (rows?.length) return rows
  return memory.logs
}

export async function seedRefresh() {
  resetMemory()
  memory.test_cases = JSON.parse(JSON.stringify(TEST_CASES))
  return { users: memory.users.length, tests: memory.test_cases.length }
}
