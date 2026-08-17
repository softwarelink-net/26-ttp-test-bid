import { json, requireUser, newId, nowIso } from '../../lib/helpers.js'
import { can, deny } from '../../lib/rbac.js'
import { writeAudit, listTestCases, listExecutions, insertExecution } from '../../lib/store.js'
import { memory } from '../../lib/seed.js'

function simulateRun(tc) {
  const jitter = 60 + Math.random() * 90
  const latency = 350 + Math.random() * 700
  const duration = 8000 + Math.floor(Math.random() * 25000)
  const pass =
    (tc.id !== 'TC-07' || Math.random() > 0.15) && jitter < 200 && latency < 1200
  return {
    duration_ms: duration,
    result: pass ? 'passed' : 'failed',
    measured_sync_jitter_ns: Number(jitter.toFixed(2)),
    measured_latency_us: Number(latency.toFixed(2)),
    log_summary: pass
      ? `${tc.id} 符合 ${tc.pass_criteria}；jitter=${jitter.toFixed(1)}ns latency=${latency.toFixed(1)}us`
      : `${tc.id} 超限：jitter=${jitter.toFixed(1)}ns latency=${latency.toFixed(1)}us`,
  }
}

export async function handleTests(request, env, path, method) {
  if (path === '/api/tests/list' && method === 'GET') {
    const { user, error } = requireUser(request)
    if (error) return error
    if (!can(user.role, 'tests.read')) return json(deny(user.role, 'tests'), 403)
    const cases = await listTestCases(env)
    const executions = await listExecutions(env)
    return json({ ok: true, cases, executions })
  }

  if (path === '/api/tests/run' && method === 'POST') {
    const { user, error } = requireUser(request)
    if (error) return error
    if (!can(user.role, 'tests.execute')) return json(deny(user.role, 'tests.execute'), 403)
    const body = await request.json().catch(() => ({}))
    const tc = memory.test_cases.find((t) => t.id === body.test_case_id)
    if (!tc) return json({ ok: false, error: '用例不存在' }, 404)
    tc.status = 'running'
    const sim = simulateRun(tc)
    const rec = {
      id: newId('ex'),
      test_case_id: tc.id,
      executed_by: user.id,
      created_at: nowIso(),
      ...sim,
    }
    await insertExecution(env, rec)
    await writeAudit(env, {
      user_id: user.id,
      action: 'TEST_RUN',
      resource: tc.id,
      payload: rec.log_summary,
      ip_address: request.headers.get('CF-Connecting-IP') || '10.18.4.26',
    })
    return json({ ok: true, record: rec, test_case: tc })
  }

  if (path === '/api/tests/icd' && method === 'POST') {
    const { user, error } = requireUser(request)
    if (error) return error
    if (!can(user.role, 'icd.import') && user.role !== 'admin') return json(deny(user.role, 'icd'), 403)
    const body = await request.json().catch(() => ({}))
    await writeAudit(env, {
      user_id: user.id,
      action: 'ICD_IMPORT',
      resource: body.filename || 'icd.xml',
      payload: `messages=${body.message_count || 24}`,
      ip_address: request.headers.get('CF-Connecting-IP') || '10.18.4.26',
    })
    return json({
      ok: true,
      parsed: {
        filename: body.filename || 'GCU_BPCU_ICD_Rev4.xml',
        messages: body.message_count || 24,
        nodes: ['GCU_PRI_NODE', 'BPCU_MAIN', 'BG_01'],
        aligned_slots: 16,
      },
    })
  }

  return json({ ok: false, error: `Unknown tests route ${method} ${path}` }, 404)
}
