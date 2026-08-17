import { nowIso } from './helpers.js'

export const BID_NOTICE = {
  title: '基于GCU、BPCU设备的TTP需求测试验证平台招标公告',
  buyer: '陕西航空电气有限责任公司',
  project_id: '0730-2611010439/01',
  published_at: '2026/08/13 18:01:59',
  deadline: '2026/09/03 17:00:00',
  location: '西安',
  keywords: [
    '陕西航空电气有限责任公司',
    'TTP需求测试',
    'GCU测试',
    'BPCU设备',
    'TTP总线',
    '航空电气招标',
  ],
  summary:
    '陕西航空电气有限责任公司采购基于GCU、BPCU设备的TTP需求测试验证平台一套，用于机载电源系统控制器研制及迭代过程中的TTP总线需求测试、同步时序测试及故障注入验证。',
  technical_points:
    '覆盖GCU/BPCU应用层通信、集群规划与调度表、单双网时间同步与恢复、冷启动测试、双余度通信与抖动分析、TDMA物理层信号测试、多场景硬件级故障注入、总线监控与存储、Driver/TD-COM中断时序与运行开销实测。',
  innovation:
    '高安全航空嵌入式总线确定性测试、FPGA级纳秒时序捕获、动态ICD/MEDL映射解析与纳秒级Slot可控硬件故障注入。',
  protocol: 'SAE AS6802 / TTP Dual-Redundant',
  target_devices: ['GCU', 'BPCU'],
  qualifications: [
    { id: 'q1', label: '具备机载电源控制器或时间触发总线测试系统研制业绩' },
    { id: 'q2', label: '可提供 AS6802 / TTP 集群规划、MEDL 调度表解析与双余度验证能力' },
    { id: 'q3', label: '具备 FPGA 级纳秒时序捕获与可控 Slot 故障注入方案' },
    { id: 'q4', label: '满足航空电气实验室现场联试、培训与售后服务承诺' },
  ],
  timeline: [
    { when: '2026/08/13 18:01:59', what: '招标公告发布' },
    { when: '2026/08/25 17:00:00', what: '澄清截止（演示）' },
    { when: '2026/09/03 17:00:00', what: '投标文件递交截止' },
  ],
}

export const MEDL_SLOTS = [
  { slot: 0, owner: 'GCU', role: 'PRI_CMD', channel: 'A+B', payload: 'MODE_CTRL', bytes: 32 },
  { slot: 1, owner: 'GCU', role: 'PRI_STAT', channel: 'A+B', payload: 'GEN_STATUS', bytes: 64 },
  { slot: 2, owner: 'GCU', role: 'PRI_PROT', channel: 'A+B', payload: 'PROT_TRIP', bytes: 24 },
  { slot: 3, owner: 'GCU', role: 'PRI_SYNC', channel: 'A+B', payload: 'CS_FRAME', bytes: 16 },
  { slot: 4, owner: 'BPCU', role: 'BUS_CMD', channel: 'A+B', payload: 'BUS_TIE', bytes: 32 },
  { slot: 5, owner: 'BPCU', role: 'BUS_STAT', channel: 'A+B', payload: 'LOAD_MAP', bytes: 64 },
  { slot: 6, owner: 'BPCU', role: 'BUS_PROT', channel: 'A+B', payload: 'FAULT_ISO', bytes: 24 },
  { slot: 7, owner: 'BPCU', role: 'BUS_SYNC', channel: 'A+B', payload: 'CS_FRAME', bytes: 16 },
  { slot: 8, owner: 'BG', role: 'GUARDIAN', channel: 'A+B', payload: 'SLOT_GATE', bytes: 8 },
  { slot: 9, owner: 'SPARE', role: 'RESERVE', channel: 'A', payload: '—', bytes: 0 },
  { slot: 10, owner: 'SPARE', role: 'RESERVE', channel: 'B', payload: '—', bytes: 0 },
  { slot: 11, owner: 'GCU', role: 'ICD_EXT', channel: 'A+B', payload: 'EXCITE_REF', bytes: 48 },
  { slot: 12, owner: 'BPCU', role: 'ICD_EXT', channel: 'A+B', payload: 'CONT_FEED', bytes: 48 },
  { slot: 13, owner: 'SPARE', role: 'RESERVE', channel: 'A+B', payload: '—', bytes: 0 },
  { slot: 14, owner: 'SPARE', role: 'RESERVE', channel: 'A+B', payload: '—', bytes: 0 },
  { slot: 15, owner: 'SPARE', role: 'IFG', channel: 'A+B', payload: 'IDLE', bytes: 0 },
]

export const TEST_CASES = [
  {
    id: 'TC-01',
    category_code: 'APP_COMM',
    category_name: '应用层通信',
    title: 'GCU模式控制与指令收发周期符合性验证',
    target_device: 'GCU',
    standard_ref: 'AS6802 / ICD-Rev4',
    pass_criteria: '指令周期间隔<=10ms，零丢包',
    status: 'passed',
  },
  {
    id: 'TC-02',
    category_code: 'SCHED_CFG',
    category_name: '调度表配置',
    title: 'MEDL调度表与ICD多节点时序解析测试',
    target_device: 'GCU+BPCU',
    standard_ref: 'DO-254 / ICD-Rev4',
    pass_criteria: '16个Slot完全对齐无冲突',
    status: 'passed',
  },
  {
    id: 'TC-03',
    category_code: 'TIME_SYNC',
    category_name: '时间同步',
    title: 'TTP双网冷启动及纳秒级时钟同步收敛测试',
    target_device: 'GCU+BPCU',
    standard_ref: 'SAE AS6802 Sec 5.2',
    pass_criteria: '同步建立时间<120ms，抖动<200ns',
    status: 'ready',
  },
  {
    id: 'TC-04',
    category_code: 'COLD_START',
    category_name: '节点启动',
    title: '主控总线冷启动与仲裁服务恢复测试',
    target_device: 'GCU',
    standard_ref: 'SAE AS6802 Sec 6.1',
    pass_criteria: '总线冷启动时间<=50ms',
    status: 'ready',
  },
  {
    id: 'TC-05',
    category_code: 'REDUNDANCY',
    category_name: '数据通信',
    title: '双余度通道A/B无缝热切换与端到端时延测试',
    target_device: 'GCU+BPCU',
    standard_ref: 'TTP-Spec-C2',
    pass_criteria: '端到端时延<1.2ms，切换丢失帧=0',
    status: 'passed',
  },
  {
    id: 'TC-06',
    category_code: 'PHY_SIGNAL',
    category_name: '物理层传输',
    title: 'TDMA调度机制与差分电平信号完整性测试',
    target_device: 'GCU+BPCU',
    standard_ref: 'EIA-485 / AS6802',
    pass_criteria: '差分电平2.0V~3.3V，眼图无遮挡',
    status: 'ready',
  },
  {
    id: 'TC-07',
    category_code: 'FAULT_INJ',
    category_name: '稳定性注入',
    title: '指定Slot CRC校验错误与短路故障注入容错测试',
    target_device: 'BPCU',
    standard_ref: 'DO-160G / AS6802',
    pass_criteria: 'BPCU在1个TDMA周期内完成隔离并报警',
    status: 'ready',
  },
  {
    id: 'TC-08',
    category_code: 'DATA_SNIFF',
    category_name: '数据监控',
    title: '多速率数据帧捕获及全量历史存储解析测试',
    target_device: 'GCU+BPCU',
    standard_ref: 'TTP-Analyzer-V2',
    pass_criteria: '100%帧存储与无损解析',
    status: 'passed',
  },
  {
    id: 'TC-09',
    category_code: 'INTR_TIMING',
    category_name: '中断时序',
    title: 'TTP Driver/TD-COM驱动层中断潜伏与CPU开销实测',
    target_device: 'GCU',
    standard_ref: 'DO-178C DAL-A',
    pass_criteria: '中断服务例程(ISR)耗时<45us',
    status: 'ready',
  },
]

function clone(obj) {
  return JSON.parse(JSON.stringify(obj))
}

function buildMemory() {
  return {
    users: [
      {
        id: 'u_admin',
        username: 'admin',
        password_hash: '8c6976e5b5410415bde908bd4dee15dfb167a9c873fc4bb8a81f6f2ab448a918',
        full_name: '系统管理员',
        role: 'admin',
        department: '总体架构部',
        created_at: '2026-08-13 18:01:59',
      },
      {
        id: 'u_eng',
        username: 'engineer',
        password_hash: 'f0e219760773d1f1f91d84813083e9b0b467645f778a8bc8f7c9e0d1645e7f9e',
        full_name: '测试专家李工',
        role: 'engineer',
        department: '机载电源验证部',
        created_at: '2026-08-13 18:01:59',
      },
      {
        id: 'u_view',
        username: 'viewer',
        password_hash: 'viewer123hash',
        full_name: '审核专家评审组',
        role: 'viewer',
        department: '招投标评估中心',
        created_at: '2026-08-13 18:01:59',
      },
    ],
    configs: [
      {
        config_key: 'FEATURE_HARDWARE_INJECTION',
        config_value: 'true',
        category: 'feature_flags',
        description: '启用纳秒级FPGA故障注入接口',
      },
      {
        config_key: 'FEATURE_DUAL_CHANNEL_MONITOR',
        config_value: 'true',
        category: 'feature_flags',
        description: '启用A/B双冗余通道实时波形采样',
      },
      {
        config_key: 'TTP_SYNC_TOLERANCE_NS',
        config_value: '250',
        category: 'avionics_params',
        description: '机载TTP最大允许同步抖动阈值(ns)',
      },
      {
        config_key: 'PROJECT_TENDER_ID',
        config_value: '0730-2611010439/01',
        category: 'tender_metadata',
        description: '项目招标编号',
      },
    ],
    cluster: {
      id: 'ttp_clus_01',
      cluster_name: 'GCU-BPCU-FlightPower-Cluster',
      bus_speed_mbps: 5.0,
      tdma_round_us: 10000,
      slot_count: 16,
      active_channels: 'A+B',
      sync_master_node: 'GCU_PRI_NODE',
      medl_xml_schema: '<MEDL cluster="GCU-BPCU-FlightPower-Cluster" round_us="10000" slots="16"/>',
    },
    test_cases: clone(TEST_CASES),
    executions: [
      {
        id: 'ex_001',
        test_case_id: 'TC-01',
        executed_by: 'u_eng',
        duration_ms: 18420,
        result: 'passed',
        measured_sync_jitter_ns: 86.4,
        measured_latency_us: 412.1,
        log_summary: 'ICD 指令周期 9.82ms，丢包 0',
        created_at: '2026-08-14 09:12:04',
      },
      {
        id: 'ex_002',
        test_case_id: 'TC-02',
        executed_by: 'u_eng',
        duration_ms: 22110,
        result: 'passed',
        measured_sync_jitter_ns: 74.2,
        measured_latency_us: 388.0,
        log_summary: '16 Slot MEDL 对齐，无冲突窗口',
        created_at: '2026-08-14 10:03:41',
      },
      {
        id: 'ex_003',
        test_case_id: 'TC-05',
        executed_by: 'u_eng',
        duration_ms: 30102,
        result: 'passed',
        measured_sync_jitter_ns: 112.8,
        measured_latency_us: 960.4,
        log_summary: 'A→B 热切换丢失帧 = 0，E2E 0.96ms',
        created_at: '2026-08-15 14:28:19',
      },
      {
        id: 'ex_004',
        test_case_id: 'TC-08',
        executed_by: 'u_eng',
        duration_ms: 45000,
        result: 'passed',
        measured_sync_jitter_ns: 91.0,
        measured_latency_us: 401.6,
        log_summary: 'R2 帧存储 100%，解析无损',
        created_at: '2026-08-16 11:07:55',
      },
    ],
    faults: [
      {
        id: 'fi_001',
        fault_type: 'CRC_ERROR',
        channel: 'Channel A',
        target_slot: 5,
        injection_duration_ms: 10,
        gcu_response_state: 'FAIL_SILENT_CH_A',
        bpcu_response_state: 'ISOLATE_AND_ALARM',
        triggered_by: 'u_eng',
        timestamp: '2026-08-15 16:44:02',
      },
    ],
    logs: [
      {
        id: 'aud_seed',
        user_id: 'u_admin',
        action: 'SEED',
        resource: 'system',
        payload: '演示库初始化',
        ip_address: '10.18.4.26',
        created_at: nowIso(),
      },
    ],
  }
}

export const memory = buildMemory()

export function resetMemory() {
  const next = buildMemory()
  memory.users = next.users
  memory.configs = next.configs
  memory.cluster = next.cluster
  memory.test_cases = next.test_cases
  memory.executions = next.executions
  memory.faults = next.faults
  memory.logs = next.logs
  return memory
}

export function liveClusterStatus() {
  const t = Date.now()
  const roundUs = memory.cluster.tdma_round_us
  const slot = Math.floor((t % roundUs) / (roundUs / memory.cluster.slot_count))
  const jitter = 70 + Math.sin(t / 900) * 28 + (Math.random() - 0.5) * 8
  const chA = 4.82 + Math.sin(t / 1400) * 0.12
  const chB = 4.79 + Math.cos(t / 1600) * 0.11
  return {
    cluster: memory.cluster,
    slots: MEDL_SLOTS,
    current_slot: slot,
    current_round: Math.floor(t / roundUs) % 1_000_000,
    sync_state: jitter < 200 ? 'LOCKED' : 'CONVERGING',
    sync_master: memory.cluster.sync_master_node,
    jitter_ns: Number(jitter.toFixed(2)),
    latency_us: Number((380 + Math.sin(t / 1100) * 40).toFixed(2)),
    channel_a_mbps: Number(chA.toFixed(3)),
    channel_b_mbps: Number(chB.toFixed(3)),
    gcu_state: 'ONLINE',
    bpcu_state: 'ONLINE',
    bg_state: 'ARMED',
    ts: new Date().toISOString(),
  }
}
