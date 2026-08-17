INSERT OR IGNORE INTO ttp_users (id, username, password_hash, full_name, role, department) VALUES
('u_admin', 'admin', '8c6976e5b5410415bde908bd4dee15dfb167a9c873fc4bb8a81f6f2ab448a918', '系统管理员', 'admin', '总体架构部'),
('u_eng', 'engineer', 'f0e219760773d1f1f91d84813083e9b0b467645f778a8bc8f7c9e0d1645e7f9e', '测试专家李工', 'engineer', '机载电源验证部'),
('u_view', 'viewer', 'viewer123hash', '审核专家评审组', 'viewer', '招投标评估中心');

INSERT OR IGNORE INTO ttp_system_configs (config_key, config_value, category, description) VALUES
('FEATURE_HARDWARE_INJECTION', 'true', 'feature_flags', '启用纳秒级FPGA故障注入接口'),
('FEATURE_DUAL_CHANNEL_MONITOR', 'true', 'feature_flags', '启用A/B双冗余通道实时波形采样'),
('TTP_SYNC_TOLERANCE_NS', '250', 'avionics_params', '机载TTP最大允许同步抖动阈值(ns)'),
('PROJECT_TENDER_ID', '0730-2611010439/01', 'tender_metadata', '项目招标编号');

INSERT OR IGNORE INTO ttp_cluster_configs (id, cluster_name, bus_speed_mbps, tdma_round_us, slot_count, active_channels, sync_master_node) VALUES
('ttp_clus_01', 'GCU-BPCU-FlightPower-Cluster', 5.0, 10000, 16, 'A+B', 'GCU_PRI_NODE');

INSERT OR IGNORE INTO ttp_test_cases (id, category_code, category_name, title, target_device, standard_ref, pass_criteria) VALUES
('TC-01', 'APP_COMM', '应用层通信', 'GCU模式控制与指令收发周期符合性验证', 'GCU', 'AS6802 / ICD-Rev4', '指令周期间隔<=10ms，零丢包'),
('TC-02', 'SCHED_CFG', '调度表配置', 'MEDL调度表与ICD多节点时序解析测试', 'GCU+BPCU', 'DO-254 / ICD-Rev4', '16个Slot完全对齐无冲突'),
('TC-03', 'TIME_SYNC', '时间同步', 'TTP双网冷启动及纳秒级时钟同步收敛测试', 'GCU+BPCU', 'SAE AS6802 Sec 5.2', '同步建立时间<120ms，抖动<200ns'),
('TC-04', 'COLD_START', '节点启动', '主控总线冷启动与仲裁服务恢复测试', 'GCU', 'SAE AS6802 Sec 6.1', '总线冷启动时间<=50ms'),
('TC-05', 'REDUNDANCY', '数据通信', '双余度通道A/B无缝热切换与端到端时延测试', 'GCU+BPCU', 'TTP-Spec-C2', '端到端时延<1.2ms，切换丢失帧=0'),
('TC-06', 'PHY_SIGNAL', '物理层传输', 'TDMA调度机制与差分电平信号完整性测试', 'GCU+BPCU', 'EIA-485 / AS6802', '差分电平2.0V~3.3V，眼图无遮挡'),
('TC-07', 'FAULT_INJ', '稳定性注入', '指定Slot CRC校验错误与短路故障注入容错测试', 'BPCU', 'DO-160G / AS6802', 'BPCU在1个TDMA周期内完成隔离并报警'),
('TC-08', 'DATA_SNIFF', '数据监控', '多速率数据帧捕获及全量历史存储解析测试', 'GCU+BPCU', 'TTP-Analyzer-V2', '100%帧存储与无损解析'),
('TC-09', 'INTR_TIMING', '中断时序', 'TTP Driver/TD-COM驱动层中断潜伏与CPU开销实测', 'GCU', 'DO-178C DAL-A', '中断服务例程(ISR)耗时<45us');
