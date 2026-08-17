-- TTP platform tables (non-destructive on shared Allworld D1)
CREATE TABLE IF NOT EXISTS ttp_users (
    id TEXT PRIMARY KEY,
    username TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    full_name TEXT NOT NULL,
    role TEXT NOT NULL CHECK (role IN ('admin', 'engineer', 'viewer')),
    department TEXT DEFAULT 'Avionics System Lab',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS ttp_system_configs (
    config_key TEXT PRIMARY KEY,
    config_value TEXT NOT NULL,
    category TEXT DEFAULT 'general',
    description TEXT,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS ttp_cluster_configs (
    id TEXT PRIMARY KEY,
    cluster_name TEXT NOT NULL,
    bus_speed_mbps REAL NOT NULL DEFAULT 5.0,
    tdma_round_us INTEGER NOT NULL DEFAULT 10000,
    slot_count INTEGER NOT NULL DEFAULT 16,
    active_channels TEXT NOT NULL DEFAULT 'A+B',
    sync_master_node TEXT NOT NULL DEFAULT 'GCU_PRI',
    medl_xml_schema TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS ttp_test_cases (
    id TEXT PRIMARY KEY,
    category_code TEXT NOT NULL,
    category_name TEXT NOT NULL,
    title TEXT NOT NULL,
    target_device TEXT NOT NULL,
    standard_ref TEXT NOT NULL,
    pass_criteria TEXT NOT NULL,
    status TEXT DEFAULT 'ready' CHECK (status IN ('ready', 'running', 'passed', 'failed', 'blocked'))
);

CREATE TABLE IF NOT EXISTS ttp_test_execution_records (
    id TEXT PRIMARY KEY,
    test_case_id TEXT NOT NULL,
    executed_by TEXT NOT NULL,
    duration_ms INTEGER NOT NULL,
    result TEXT NOT NULL CHECK (result IN ('passed', 'failed', 'error')),
    measured_sync_jitter_ns REAL,
    measured_latency_us REAL,
    log_summary TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS ttp_fault_injection_events (
    id TEXT PRIMARY KEY,
    fault_type TEXT NOT NULL,
    channel TEXT NOT NULL,
    target_slot INTEGER NOT NULL,
    injection_duration_ms INTEGER NOT NULL,
    gcu_response_state TEXT NOT NULL,
    bpcu_response_state TEXT NOT NULL,
    triggered_by TEXT NOT NULL,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS ttp_audit_logs (
    id TEXT PRIMARY KEY,
    user_id TEXT,
    action TEXT NOT NULL,
    resource TEXT NOT NULL,
    payload TEXT,
    ip_address TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
