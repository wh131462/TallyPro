-- ============================================================
-- TallyPro 数据库初始化脚本
-- 创建所有业务表及索引
-- ============================================================

USE tally_pro;

SET NAMES utf8mb4;
SET CHARACTER_SET_CLIENT = utf8mb4;
SET CHARACTER_SET_CONNECTION = utf8mb4;
SET CHARACTER_SET_RESULTS = utf8mb4;

-- -----------------------------------------------------------
-- 1. users 用户表
-- -----------------------------------------------------------
CREATE TABLE IF NOT EXISTS `users` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `openid` VARCHAR(64) NOT NULL COMMENT '微信 openid',
  `phone` VARCHAR(20) NOT NULL DEFAULT '' COMMENT '手机号',
  `nickname` VARCHAR(64) NOT NULL DEFAULT '' COMMENT '昵称',
  `avatar_url` VARCHAR(512) NOT NULL DEFAULT '' COMMENT '头像地址',
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_openid` (`openid`),
  KEY `idx_phone` (`phone`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='用户表';

-- -----------------------------------------------------------
-- 2. workshops 企业表
-- -----------------------------------------------------------
CREATE TABLE IF NOT EXISTS `workshops` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `owner_id` INT UNSIGNED NOT NULL COMMENT '企业主用户ID',
  `name` VARCHAR(100) NOT NULL COMMENT '企业名称',
  `description` VARCHAR(500) NOT NULL DEFAULT '' COMMENT '企业描述',
  `invite_code` VARCHAR(32) NOT NULL DEFAULT '' COMMENT '邀请码',
  `invite_expires_at` DATETIME DEFAULT NULL COMMENT '邀请码过期时间',
  `logo_url` VARCHAR(500) NOT NULL DEFAULT '' COMMENT '企业Logo',
  `status` ENUM('active','inactive') NOT NULL DEFAULT 'active' COMMENT '企业状态',
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_owner_id` (`owner_id`),
  KEY `idx_invite_code` (`invite_code`),
  KEY `idx_status` (`status`),
  CONSTRAINT `fk_workshops_owner` FOREIGN KEY (`owner_id`) REFERENCES `users` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='企业表';

-- -----------------------------------------------------------
-- 3. workshop_members 企业成员表
-- -----------------------------------------------------------
CREATE TABLE IF NOT EXISTS `workshop_members` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `workshop_id` INT UNSIGNED NOT NULL COMMENT '企业ID',
  `user_id` INT UNSIGNED DEFAULT NULL COMMENT '用户ID（未注册时为空）',
  `role` ENUM('owner','worker') NOT NULL DEFAULT 'worker' COMMENT '角色',
  `display_name` VARCHAR(64) NOT NULL DEFAULT '' COMMENT '显示名称',
  `status` ENUM('pending','approved','rejected','removed') NOT NULL DEFAULT 'pending' COMMENT '成员状态',
  `invited_phone` VARCHAR(20) NOT NULL DEFAULT '' COMMENT '邀请时填写的手机号',
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_workshop_id` (`workshop_id`),
  KEY `idx_user_id` (`user_id`),
  KEY `idx_workshop_user` (`workshop_id`, `user_id`),
  KEY `idx_status` (`status`),
  CONSTRAINT `fk_members_workshop` FOREIGN KEY (`workshop_id`) REFERENCES `workshops` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_members_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='企业成员表';

-- -----------------------------------------------------------
-- 4. skus 产品/SKU 表
-- -----------------------------------------------------------
CREATE TABLE IF NOT EXISTS `skus` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `workshop_id` INT UNSIGNED NOT NULL COMMENT '所属企业ID',
  `name` VARCHAR(100) NOT NULL COMMENT 'SKU名称',
  `description` VARCHAR(500) NOT NULL DEFAULT '' COMMENT 'SKU描述',
  `image_url` VARCHAR(512) NOT NULL DEFAULT '' COMMENT '图片地址',
  `sort_order` INT NOT NULL DEFAULT 0 COMMENT '排序序号',
  `is_active` TINYINT(1) NOT NULL DEFAULT 1 COMMENT '是否启用',
  `deleted_at` DATETIME DEFAULT NULL COMMENT '软删除时间',
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_workshop_id` (`workshop_id`),
  KEY `idx_workshop_active` (`workshop_id`, `is_active`),
  CONSTRAINT `fk_skus_workshop` FOREIGN KEY (`workshop_id`) REFERENCES `workshops` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='产品SKU表';

-- -----------------------------------------------------------
-- 5. steps 工序表
-- -----------------------------------------------------------
CREATE TABLE IF NOT EXISTS `steps` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `sku_id` INT UNSIGNED NOT NULL COMMENT '所属SKU ID',
  `name` VARCHAR(100) NOT NULL COMMENT '工序名称',
  `unit_price` DECIMAL(10,2) NOT NULL DEFAULT 0.00 COMMENT '单价',
  `image_url` VARCHAR(512) NOT NULL DEFAULT '' COMMENT '工序图片地址',
  `sort_order` INT NOT NULL DEFAULT 0 COMMENT '排序序号',
  `is_active` TINYINT(1) NOT NULL DEFAULT 1 COMMENT '是否启用',
  `deleted_at` DATETIME DEFAULT NULL COMMENT '软删除时间',
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_sku_id` (`sku_id`),
  KEY `idx_sku_active` (`sku_id`, `is_active`),
  CONSTRAINT `fk_steps_sku` FOREIGN KEY (`sku_id`) REFERENCES `skus` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='工序表';

-- -----------------------------------------------------------
-- 6. price_histories 价格历史表
-- -----------------------------------------------------------
CREATE TABLE IF NOT EXISTS `price_histories` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `step_id` INT UNSIGNED NOT NULL COMMENT '工序ID',
  `price` DECIMAL(10,2) NOT NULL COMMENT '价格',
  `effective_date` DATE NOT NULL COMMENT '生效日期',
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_step_id` (`step_id`),
  KEY `idx_step_effective` (`step_id`, `effective_date`),
  CONSTRAINT `fk_price_histories_step` FOREIGN KEY (`step_id`) REFERENCES `steps` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='价格历史表';

-- -----------------------------------------------------------
-- 7. settlements 结算表（提前创建，work_records 引用）
-- -----------------------------------------------------------
CREATE TABLE IF NOT EXISTS `settlements` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `workshop_id` INT UNSIGNED NOT NULL COMMENT '企业ID',
  `worker_id` INT UNSIGNED NOT NULL COMMENT '员工用户ID',
  `period_start` DATE NOT NULL COMMENT '结算周期开始',
  `period_end` DATE NOT NULL COMMENT '结算周期结束',
  `total_amount` DECIMAL(12,2) NOT NULL DEFAULT 0.00 COMMENT '结算总金额',
  `status` ENUM('draft','confirmed') NOT NULL DEFAULT 'draft' COMMENT '结算状态',
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_workshop_id` (`workshop_id`),
  KEY `idx_worker_id` (`worker_id`),
  KEY `idx_workshop_worker` (`workshop_id`, `worker_id`),
  KEY `idx_status` (`status`),
  KEY `idx_period` (`period_start`, `period_end`),
  CONSTRAINT `fk_settlements_workshop` FOREIGN KEY (`workshop_id`) REFERENCES `workshops` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `fk_settlements_worker` FOREIGN KEY (`worker_id`) REFERENCES `users` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='结算表';

-- -----------------------------------------------------------
-- 8. work_records 工作记录表
-- -----------------------------------------------------------
CREATE TABLE IF NOT EXISTS `work_records` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `workshop_id` INT UNSIGNED NOT NULL COMMENT '企业ID',
  `worker_id` INT UNSIGNED NOT NULL COMMENT '员工用户ID',
  `step_id` INT UNSIGNED NOT NULL COMMENT '工序ID',
  `work_date` DATE NOT NULL COMMENT '工作日期',
  `quantity` INT NOT NULL DEFAULT 0 COMMENT '数量',
  `unit_price` DECIMAL(10,2) NOT NULL DEFAULT 0.00 COMMENT '记录时单价',
  `status` ENUM('pending','confirmed','modified','settled') NOT NULL DEFAULT 'pending' COMMENT '记录状态',
  `confirmed_quantity` INT DEFAULT NULL COMMENT '确认数量',
  `modifier_id` INT UNSIGNED DEFAULT NULL COMMENT '修改人用户ID',
  `modify_reason` TEXT COMMENT '修改原因',
  `settlement_id` INT UNSIGNED DEFAULT NULL COMMENT '结算单ID',
  `version` INT NOT NULL DEFAULT 1 COMMENT '乐观锁版本号',
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_workshop_id` (`workshop_id`),
  KEY `idx_worker_id` (`worker_id`),
  KEY `idx_step_id` (`step_id`),
  KEY `idx_work_date` (`work_date`),
  KEY `idx_status` (`status`),
  KEY `idx_settlement_id` (`settlement_id`),
  KEY `idx_workshop_worker_date` (`workshop_id`, `worker_id`, `work_date`),
  KEY `idx_workshop_date_status` (`workshop_id`, `work_date`, `status`),
  CONSTRAINT `fk_records_workshop` FOREIGN KEY (`workshop_id`) REFERENCES `workshops` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `fk_records_worker` FOREIGN KEY (`worker_id`) REFERENCES `users` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `fk_records_step` FOREIGN KEY (`step_id`) REFERENCES `steps` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `fk_records_modifier` FOREIGN KEY (`modifier_id`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `fk_records_settlement` FOREIGN KEY (`settlement_id`) REFERENCES `settlements` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='工作记录表';

-- -----------------------------------------------------------
-- 9. settlement_items 结算明细表
-- -----------------------------------------------------------
CREATE TABLE IF NOT EXISTS `settlement_items` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `settlement_id` INT UNSIGNED NOT NULL COMMENT '结算单ID',
  `record_id` INT UNSIGNED NOT NULL COMMENT '工作记录ID',
  `step_name` VARCHAR(100) NOT NULL DEFAULT '' COMMENT '工序名称（快照）',
  `sku_name` VARCHAR(100) NOT NULL DEFAULT '' COMMENT 'SKU名称（快照）',
  `quantity` INT NOT NULL DEFAULT 0 COMMENT '数量',
  `unit_price` DECIMAL(10,2) NOT NULL DEFAULT 0.00 COMMENT '单价',
  `amount` DECIMAL(10,2) NOT NULL DEFAULT 0.00 COMMENT '小计金额',
  PRIMARY KEY (`id`),
  KEY `idx_settlement_id` (`settlement_id`),
  KEY `idx_record_id` (`record_id`),
  CONSTRAINT `fk_settlement_items_settlement` FOREIGN KEY (`settlement_id`) REFERENCES `settlements` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_settlement_items_record` FOREIGN KEY (`record_id`) REFERENCES `work_records` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='结算明细表';

-- -----------------------------------------------------------
-- 10. operation_logs 操作日志表
-- -----------------------------------------------------------
CREATE TABLE IF NOT EXISTS `operation_logs` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `operator_id` INT UNSIGNED NOT NULL COMMENT '操作人用户ID',
  `workshop_id` INT UNSIGNED NOT NULL COMMENT '企业ID',
  `action` VARCHAR(50) NOT NULL COMMENT '操作动作',
  `target_type` VARCHAR(50) NOT NULL DEFAULT '' COMMENT '操作目标类型',
  `target_id` INT UNSIGNED NOT NULL DEFAULT 0 COMMENT '操作目标ID',
  `before_data` JSON DEFAULT NULL COMMENT '变更前数据',
  `after_data` JSON DEFAULT NULL COMMENT '变更后数据',
  `remark` TEXT COMMENT '备注',
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_operator_id` (`operator_id`),
  KEY `idx_workshop_id` (`workshop_id`),
  KEY `idx_action` (`action`),
  KEY `idx_target` (`target_type`, `target_id`),
  KEY `idx_created_at` (`created_at`),
  KEY `idx_workshop_created` (`workshop_id`, `created_at`),
  CONSTRAINT `fk_logs_operator` FOREIGN KEY (`operator_id`) REFERENCES `users` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `fk_logs_workshop` FOREIGN KEY (`workshop_id`) REFERENCES `workshops` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='操作日志表';

-- -----------------------------------------------------------
-- 11. notifications 通知表
-- -----------------------------------------------------------
CREATE TABLE IF NOT EXISTS `notifications` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `user_id` INT UNSIGNED NOT NULL COMMENT '接收通知的用户ID',
  `workshop_id` INT UNSIGNED NOT NULL COMMENT '关联企业ID',
  `type` VARCHAR(50) NOT NULL COMMENT '通知类型',
  `title` VARCHAR(200) NOT NULL COMMENT '通知标题',
  `content` VARCHAR(500) NOT NULL DEFAULT '' COMMENT '通知内容',
  `is_read` TINYINT(1) NOT NULL DEFAULT 0 COMMENT '是否已读',
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_user_id` (`user_id`),
  KEY `idx_workshop_id` (`workshop_id`),
  KEY `idx_user_read` (`user_id`, `is_read`),
  KEY `idx_user_created` (`user_id`, `created_at`),
  KEY `idx_type` (`type`),
  CONSTRAINT `fk_notifications_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_notifications_workshop` FOREIGN KEY (`workshop_id`) REFERENCES `workshops` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='通知表';

-- -----------------------------------------------------------
-- 12. feedbacks 意见反馈表
-- -----------------------------------------------------------
CREATE TABLE IF NOT EXISTS `feedbacks` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `user_id` INT UNSIGNED NOT NULL COMMENT '提交用户ID',
  `type` ENUM('bug','feature','other') NOT NULL DEFAULT 'other' COMMENT '反馈类型',
  `content` TEXT NOT NULL COMMENT '反馈内容',
  `contact` VARCHAR(100) NOT NULL DEFAULT '' COMMENT '联系方式',
  `images` JSON DEFAULT NULL COMMENT '图片URL列表',
  `status` ENUM('pending','replied','closed') NOT NULL DEFAULT 'pending' COMMENT '处理状态',
  `reply_content` TEXT DEFAULT NULL COMMENT '管理员回复内容',
  `reply_at` DATETIME DEFAULT NULL COMMENT '回复时间',
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_user_id` (`user_id`),
  KEY `idx_status` (`status`),
  KEY `idx_created_at` (`created_at`),
  CONSTRAINT `fk_feedbacks_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='意见反馈表';
