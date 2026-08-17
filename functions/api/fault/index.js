import { json, requireUser, newId, nowIso, clientIp } from '../../lib/helpers.js'
import { can, deny } from '../../lib/rbac.js'
import { writeAudit, listFaults, insertFault, listConfigs } from '../../lib/store.js'

const FAULT_BEHAVIOR = {
  CRC_ERROR: {
    gcu: 'FAIL_SILENT_AFFECTED_SLOT',
    bpcu: 'ISOLATE_AND_ALARM',
    wave: 'crc_glitch',
  },
  SLOT_COLLISION: {
    gcu: 'BG_PREEMPT_HOLD',
    bpcu: 'DROP_COLLIDED_FRAME',
    wave: 'collision',
  },
  BUS_SHORT: {
    gcu: 'CHANNEL_OFFLINE',
    bpcu: 'SWITCH_TO_REDUNDANT',
    wave: 'short',
  },
  TERM_MISMATCH: {
    gcu: 'REFLECTION_DEGRADED',
    bpcu: 'EYE_CLOSURE_WARN',
    wave: 'reflection',
  },
}

export async function handleFault(request, env, path, method) {
  if (path === '/api/fault-injection/events' && method === 'GET') {
    const { error } = requireUser(request)
    if (error) return error
    return json({ ok: true, events: await listFaults(env) })
  }

  if (path === '/api/fault-injection/trigger' && method === 'POST') {
    const { user, error } = requireUser(request)
    if (error) return error
    if (!can(user.role, 'fault.trigger')) return json(deny(user.role, 'fault-injection'), 403)

    const configs = await listConfigs(env)
    const hw = configs.find((c) => c.config_key === 'FEATURE_HARDWARE_INJECTION')
    if (hw && hw.config_value !== 'true') {
      return json({ ok: false, error: 'FEATURE_HARDWARE_INJECTION 已关闭' }, 409)
    }

    const body = await request.json().catch(() => ({}))
    const faultType = body.fault_type || 'CRC_ERROR'
    const behavior = FAULT_BEHAVIOR[faultType] || FAULT_BEHAVIOR.CRC_ERROR
    const rec = {
      id: newId('fi'),
      fault_type: faultType,
      channel: body.channel || 'Channel A',
      target_slot: Number(body.target_slot ?? 5),
      injection_duration_ms: Number(body.injection_duration_ms ?? 10),
      gcu_response_state: behavior.gcu,
      bpcu_response_state: behavior.bpcu,
      triggered_by: user.id,
      timestamp: nowIso(),
      wave: behavior.wave,
    }
    await insertFault(env, rec)
    await writeAudit(env, {
      user_id: user.id,
      action: 'FAULT_INJECT',
      resource: `${faultType}@slot${rec.target_slot}`,
      payload: JSON.stringify(rec),
      ip_address: clientIp(request),
    })
    return json({ ok: true, event: rec })
  }

  return json({ ok: false, error: `Unknown fault route ${method} ${path}` }, 404)
}
