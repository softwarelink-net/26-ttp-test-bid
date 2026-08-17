-- Drop tables if exist
DROP TABLE IF EXISTS audit_logs;
DROP TABLE IF EXISTS fault_injection_events;
DROP TABLE IF EXISTS test_execution_records;
DROP TABLE IF EXISTS test_cases;
DROP TABLE IF EXISTS ttp_cluster_configs;
DROP TABLE IF EXISTS system_configs;
DROP TABLE IF EXISTS users;

-- 1. Users Table
CREATE TABLE users (
    id TEXT PRIMARY KEY,
    username TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    full_name TEXT NOT NULL,
    role TEXT NOT NULL CHECK (role IN ('admin', 'engineer', 'viewer')),
    department TEXT DEFAULT 'Avionics System Lab',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 2. System Configurations & Feature Flags
CREATE TABLE system_configs (
    config_key TEXT PRIMARY KEY,
    config_value TEXT NOT NULL,
    category TEXT DEFAULT 'general',
    description TEXT,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 3. TTP Cluster & MEDL Specifications
CREATE TABLE ttp_cluster_configs (
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

-- 4. Test Cases Definition (Based on Tender 9 Items)
CREATE TABLE test_cases (
    id TEXT PRIMARY KEY,
    category_code TEXT NOT NULL,
    category_name TEXT NOT NULL,
    title TEXT NOT NULL,
    target_device TEXT NOT NULL,
    standard_ref TEXT NOT NULL,
    pass_criteria TEXT NOT NULL,
    status TEXT DEFAULT 'ready' CHECK (status IN ('ready', 'running', 'passed', 'failed', 'blocked'))
);

-- 5. Test Execution Records
CREATE TABLE test_execution_records (
    id TEXT PRIMARY KEY,
    test_case_id TEXT NOT NULL,
    executed_by TEXT NOT NULL,
    duration_ms INTEGER NOT NULL,
    result TEXT NOT NULL CHECK (result IN ('passed', 'failed', 'error')),
    measured_sync_jitter_ns REAL,
    measured_latency_us REAL,
    log_summary TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (test_case_id) REFERENCES test_cases(id),
    FOREIGN KEY (executed_by) REFERENCES users(id)
);

-- 6. Fault Injection Logs
CREATE TABLE fault_injection_events (
    id TEXT PRIMARY KEY,
    fault_type TEXT NOT NULL,
    channel TEXT NOT NULL,
    target_slot INTEGER NOT NULL,
    injection_duration_ms INTEGER NOT NULL,
    gcu_response_state TEXT NOT NULL,
    bpcu_response_state TEXT NOT NULL,
    triggered_by TEXT NOT NULL,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (triggered_by) REFERENCES users(id)
);

-- 7. Audit Logs
CREATE TABLE audit_logs (
    id TEXT PRIMARY KEY,
    user_id TEXT,
    action TEXT NOT NULL,
    resource TEXT NOT NULL,
    payload TEXT,
    ip_address TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- ==========================================
-- SEED DATA (Minimal Valid Set)
-- ==========================================
INSERT INTO users (id, username, password_hash, full_name, role, department) VALUES
('u_admin', 'admin', '8c6976e5b5410415bde908bd4dee15dfb167a9c873fc4bb8a81f6f2ab448a918', '系统管理员', 'admin', '总体架构部'),
('u_eng', 'engineer', 'f0e219760773d1f1f91d84813083e9b0b467645f778a8bc8f7c9e0d1645e7f9e', '测试专家李工', 'engineer', '机载电源验证部'),
('u_view', 'viewer', 'viewer123hash', '审核专家评审组', 'viewer', '招投标评估中心');

INSERT INTO system_configs (config_key, config_value, category, description) VALUES
('FEATURE_HARDWARE_INJECTION', 'true', 'feature_flags', '启用纳秒级FPGA故障注入接口'),
('FEATURE_DUAL_CHANNEL_MONITOR', 'true', 'feature_flags', '启用A/B双冗余通道实时波形采样'),
('TTP_SYNC_TOLERANCE_NS', '250', 'avionics_params', '机载TTP最大允许同步抖动阈值(ns)'),
('PROJECT_TENDER_ID', '0730-2611010439/01', 'tender_metadata', '项目招标编号');

INSERT INTO ttp_cluster_configs (id, cluster_name, bus_speed_mbps, tdma_round_us, slot_count, active_channels, sync_master_node) VALUES
('ttp_clus_01', 'GCU-BPCU-FlightPower-Cluster', 5.0, 10000, 16, 'A+B', 'GCU_PRI_NODE');

INSERT INTO test_cases (id, category_code, category_name, title, target_device, standard_ref, pass_criteria) VALUES
('TC-01', 'APP_COMM', '应用层通信', 'GCU模式控制与指令收发周期符合性验证', 'GCU', 'AS6802 / ICD-Rev4', '指令周期间隔<=10ms，零丢包'),
('TC-02', 'SCHED_CFG', '调度表配置', 'MEDL调度表与ICD多节点时序解析测试', 'GCU+BPCU', 'DO-254 / ICD-Rev4', '16个Slot完全对齐无冲突'),
('TC-03', 'TIME_SYNC', '时间同步', 'TTP双网冷启动及纳秒级时钟同步收敛测试', 'GCU+BPCU', 'SAE AS6802 Sec 5.2', '同步建立时间<120ms，抖动<200ns'),
('TC-04', 'COLD_START', '节点启动', '主控总线冷启动与仲裁服务恢复测试', 'GCU', 'SAE AS6802 Sec 6.1', '总线冷启动时间<=50ms'),
('TC-05', 'REDUNDANCY', '数据通信', '双余度通道A/B无缝热切换与端到端时延测试', 'GCU+BPCU', 'TTP-Spec-C2', '端到端时延<1.2ms，切换丢失帧=0'),
('TC-06', 'PHY_SIGNAL', '物理层传输', 'TDMA调度机制与差分电平信号完整性测试', 'GCU+BPCU', 'EIA-485 / AS6802', '差分电平2.0V~3.3V，眼图无遮挡'),
('TC-07', 'FAULT_INJ', '稳定性注入', '指定Slot CRC校验错误与短路故障注入容错测试', 'BPCU', 'DO-160G / AS6802', 'BPCU在1个TDMA周期内完成隔离并报警'),
('TC-08', 'DATA_SNIFF', '数据监控', '多速率数据帧捕获及全量历史存储解析测试', 'GCU+BPCU', 'TTP-Analyzer-V2', '100%帧存储与无损解析'),
('TC-09', 'INTR_TIMING', '中断时序', 'TTP Driver/TD-COM驱动层中断潜伏与CPU开销实测', 'GCU', 'DO-178C DAL-A', '中断服务例程(ISR)耗时<45us');
