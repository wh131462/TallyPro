# TallyPro 计工宝 —— 计件记工小程序产品设计

## Context

主家（雇主/工厂主）需要管理旗下工人的计件工作记录。目前可能依赖纸质记录或 Excel，容易出错且不便统计。本小程序旨在将计件记工数字化：主家设置产品（SKU）和工序，工人每天填报工作量，主家审核确认，最终按单价自动结算工资。

**技术选型**：微信小程序 + Node.js + MySQL，同一小程序内通过角色切换区分管理端/用户端。

---

## 一、产品名称

| 中文名 | 英文名 | 含义 |
|--------|--------|------|
| **计工宝** | **TallyPro** | "计工"直击核心功能，"宝"体现实用工具感；Tally(计数) + Pro(专业) |

---

## 二、角色定义

| 角色 | 说明 |
|------|------|
| 主家（管理员） | 注册后创建"工坊"，管理 SKU/工序/工人，审核记录，结算工资 |
| 工人（用户） | 绑定主家，按天填报工作量 |

> 一个微信号可以同时是主家和工人（在不同工坊下）

---

## 三、核心功能模块

### 3.1 用户系统
- 微信授权登录（获取 openid）
- 绑定手机号（微信快速验证）
- 角色切换：同一账号可在"我的工坊（管理）"和"我的工作（工人）"间切换
- 个人信息管理

### 3.2 主家管理端

#### 3.2.1 工坊管理
- 创建工坊（名称、简介）
- 支持创建多个工坊（如不同车间/产品线）
- 生成邀请码/二维码供工人扫码绑定（邀请码支持设置有效期，过期自动失效）

#### 3.2.2 工人管理
- 查看绑定申请，审批通过/拒绝
- 主动添加工人（通过手机号，工人登录后自动绑定）
- 编辑工人信息（姓名、备注）
- 移除工人

#### 3.2.3 SKU（产品）管理
- 增删改 SKU（名称、描述、图片可选）
- 启用/停用 SKU

#### 3.2.4 工序（步骤）管理
- 每个 SKU 下设置多个工序
- 每个工序：名称、单价（元/件）、排序
- 单价支持历史版本（调价不影响已结算记录）

#### 3.2.5 工作记录审核
- 按日期查看所有工人的填报记录
- 逐条确认 / 批量确认
- 可手动修改数量（记录修改原因，所有修改留痕可追溯）
- 状态流转：待确认 → 已确认 / 已修改 → 已结算

#### 3.2.6 结算管理
- 主家主动发起结算：选择日期范围 → 生成结算单（草稿）→ 确认结算
- 按月汇总 / 自定义日期范围
- 按工人维度：每个工人的总工量、总金额明细
- 按 SKU 维度：每个产品各工序的完成量
- 结算单包含逐条明细，支持对账审计
- 导出报表（生成图片或 Excel）

#### 3.2.7 操作日志
- 关键操作留痕：记录审核、数量修改、结算确认、成员管理等
- 支持按时间/操作类型/操作人筛选查看

#### 3.2.8 消息通知（微信订阅消息）
- 新工人申请绑定 → 通知主家审核
- 工人提交/修改记录 → 通知主家待审核
- 结算单生成 → 通知相关工人查看

### 3.3 工人用户端

#### 3.3.1 绑定主家
- 扫码绑定 / 输入邀请码
- 等待主家审批（主家也可预先添加手机号，则自动绑定）

#### 3.3.2 每日记工
- 选择日期（默认今天，可选历史日期）
- 查看所有 SKU 列表 → 点击对应工序 → 填写数量
- 支持批量填报：一次性填写多个工序的数量，提高效率
- 常用工序置顶：根据工人历史填报频率，自动将常用工序排在前面
- 已填写的记录可修改（在主家确认前）
- 查看历史记录及确认状态

#### 3.3.3 工资查看
- 按月查看自己的工资明细
- 各工序数量 × 单价 = 小计，汇总为总计

#### 3.3.4 消息通知（微信订阅消息）
- 主家审批绑定申请 → 通知工人结果
- 主家确认/修改记录 → 通知工人
- 结算单生成 → 通知工人查看工资

---

## 四、数据库设计

### 4.1 users（用户表）
| 字段 | 类型 | 说明 |
|------|------|------|
| id | INT, PK, AUTO_INCREMENT | 主键 |
| openid | VARCHAR(64), UNIQUE | 微信 openid |
| phone | VARCHAR(20) | 手机号 |
| nickname | VARCHAR(50) | 昵称 |
| avatar_url | VARCHAR(255) | 头像 |
| created_at | DATETIME | 创建时间 |
| updated_at | DATETIME | 更新时间 |

### 4.2 workshops（工坊表）
| 字段 | 类型 | 说明 |
|------|------|------|
| id | INT, PK, AUTO_INCREMENT | 主键 |
| owner_id | INT, FK→users | 主家用户ID |
| name | VARCHAR(100) | 工坊名称 |
| description | TEXT | 简介 |
| invite_code | VARCHAR(20), UNIQUE | 邀请码 |
| invite_expires_at | DATETIME, NULLABLE | 邀请码过期时间（NULL 表示永不过期） |
| status | ENUM('active','inactive') | 状态 |
| created_at | DATETIME | 创建时间 |
| updated_at | DATETIME | 更新时间 |

### 4.3 workshop_members（工坊成员表）
| 字段 | 类型 | 说明 |
|------|------|------|
| id | INT, PK, AUTO_INCREMENT | 主键 |
| workshop_id | INT, FK→workshops | 工坊ID |
| user_id | INT, FK→users, NULLABLE | 用户ID（预添加时为空） |
| role | ENUM('owner','worker') | 角色 |
| display_name | VARCHAR(50) | 显示名称 |
| status | ENUM('pending','approved','rejected','removed') | 状态 |
| invited_phone | VARCHAR(20) | 预添加手机号 |
| created_at | DATETIME | 创建时间 |
| updated_at | DATETIME | 更新时间 |

### 4.4 skus（产品表）
| 字段 | 类型 | 说明 |
|------|------|------|
| id | INT, PK, AUTO_INCREMENT | 主键 |
| workshop_id | INT, FK→workshops | 工坊ID |
| name | VARCHAR(100) | 产品名称 |
| description | TEXT | 描述 |
| image_url | VARCHAR(255) | 图片 |
| sort_order | INT | 排序 |
| is_active | BOOLEAN | 是否启用 |
| deleted_at | DATETIME, NULLABLE | 软删除时间（NULL 表示未删除） |
| created_at | DATETIME | 创建时间 |
| updated_at | DATETIME | 更新时间 |

### 4.5 steps（工序表）
| 字段 | 类型 | 说明 |
|------|------|------|
| id | INT, PK, AUTO_INCREMENT | 主键 |
| sku_id | INT, FK→skus | 产品ID |
| name | VARCHAR(100) | 工序名称 |
| unit_price | DECIMAL(10,2) | 当前单价（元/件） |
| sort_order | INT | 排序 |
| is_active | BOOLEAN | 是否启用 |
| deleted_at | DATETIME, NULLABLE | 软删除时间（NULL 表示未删除） |
| created_at | DATETIME | 创建时间 |
| updated_at | DATETIME | 更新时间 |

### 4.6 price_history（单价历史表）
| 字段 | 类型 | 说明 |
|------|------|------|
| id | INT, PK, AUTO_INCREMENT | 主键 |
| step_id | INT, FK→steps | 工序ID |
| price | DECIMAL(10,2) | 单价 |
| effective_date | DATE | 生效日期 |
| created_at | DATETIME | 创建时间 |

### 4.7 work_records（工作记录表）
| 字段 | 类型 | 说明 |
|------|------|------|
| id | INT, PK, AUTO_INCREMENT | 主键 |
| workshop_id | INT, FK→workshops | 工坊ID |
| worker_id | INT, FK→users | 工人ID |
| step_id | INT, FK→steps | 工序ID |
| work_date | DATE | 工作日期 |
| quantity | INT | 工人填报数量 |
| unit_price | DECIMAL(10,2) | 单价快照（提交时写入当时生效单价） |
| status | ENUM('pending','confirmed','modified','settled') | 状态 |
| confirmed_quantity | INT | 确认后的数量 |
| modifier_id | INT, FK→users, NULLABLE | 修改人ID |
| modify_reason | VARCHAR(255) | 修改原因 |
| settlement_id | INT, FK→settlements, NULLABLE | 关联结算单ID |
| version | INT, DEFAULT 1 | 乐观锁版本号（并发控制） |
| created_at | DATETIME | 创建时间 |
| updated_at | DATETIME | 更新时间 |

> **唯一约束**：`UNIQUE(worker_id, step_id, work_date)` — 防止同一工人同一天同一工序重复提交

### 4.8 settlements（结算表）
| 字段 | 类型 | 说明 |
|------|------|------|
| id | INT, PK, AUTO_INCREMENT | 主键 |
| workshop_id | INT, FK→workshops | 工坊ID |
| worker_id | INT, FK→users | 工人ID |
| period_start | DATE | 结算开始日期 |
| period_end | DATE | 结算结束日期 |
| total_amount | DECIMAL(12,2) | 总金额 |
| status | ENUM('draft','confirmed') | 状态 |
| created_at | DATETIME | 创建时间 |

### 4.9 settlement_items（结算明细表）
| 字段 | 类型 | 说明 |
|------|------|------|
| id | INT, PK, AUTO_INCREMENT | 主键 |
| settlement_id | INT, FK→settlements | 结算单ID |
| record_id | INT, FK→work_records | 工作记录ID |
| step_name | VARCHAR(100) | 工序名称（快照） |
| sku_name | VARCHAR(100) | 产品名称（快照） |
| quantity | INT | 确认数量 |
| unit_price | DECIMAL(10,2) | 结算单价 |
| amount | DECIMAL(10,2) | 小计金额（quantity × unit_price） |

> 结算明细表保存名称快照，确保即使后续 SKU/工序被修改或删除，历史结算单仍可完整展示

### 4.10 operation_logs（操作日志表）
| 字段 | 类型 | 说明 |
|------|------|------|
| id | INT, PK, AUTO_INCREMENT | 主键 |
| operator_id | INT, FK→users | 操作人ID |
| workshop_id | INT, FK→workshops | 所属工坊ID |
| action | VARCHAR(50) | 操作类型（如 record_confirm, record_modify, settlement_create 等） |
| target_type | VARCHAR(50) | 操作对象类型（如 work_record, settlement, member 等） |
| target_id | INT | 操作对象ID |
| before_data | JSON, NULLABLE | 变更前数据 |
| after_data | JSON, NULLABLE | 变更后数据 |
| remark | VARCHAR(255) | 备注 |
| created_at | DATETIME | 操作时间 |

---

## 五、页面结构

```
pages/
├── index/                    # 首页（角色选择/入口）
├── login/                    # 登录/手机号绑定
│
├── admin/                    # === 管理端 ===
│   ├── dashboard/            # 管理首页（概览数据）
│   ├── workshop/             # 工坊设置
│   ├── workers/              # 工人管理
│   │   ├── list/             # 工人列表
│   │   ├── detail/           # 工人详情/编辑
│   │   └── approve/          # 审批申请
│   ├── skus/                 # SKU 管理
│   │   ├── list/             # SKU 列表
│   │   ├── edit/             # SKU 编辑（含工序管理）
│   │   └── steps/            # 工序单价设置
│   ├── records/              # 工作记录审核
│   │   ├── daily/            # 按日查看
│   │   └── review/           # 逐条审核
│   ├── settlement/           # 结算管理
│   │   ├── create/           # 创建结算单
│   │   ├── list/             # 结算单列表
│   │   ├── detail/           # 结算单详情（含逐条明细）
│   │   ├── summary/          # 汇总报表
│   │   └── export/           # 报表导出
│   └── logs/                 # 操作日志查看
│
├── worker/                   # === 工人端 ===
│   ├── bind/                 # 绑定主家
│   ├── worklog/              # 每日记工
│   │   ├── index/            # SKU/工序列表（含常用工序置顶）
│   │   ├── fill/             # 填写数量
│   │   └── batch/            # 批量填报
│   ├── history/              # 历史记录
│   └── salary/               # 工资查看（含结算单明细）
│
└── profile/                  # 个人中心
```

---

## 六、API 接口设计

### 6.1 认证模块
| 方法 | 路径 | 说明 |
|------|------|------|
| POST | `/api/auth/login` | 微信登录 |
| POST | `/api/auth/bind-phone` | 绑定手机号 |
| GET | `/api/auth/profile` | 获取个人信息 |
| PUT | `/api/auth/profile` | 更新个人信息 |

### 6.2 工坊模块
| 方法 | 路径 | 说明 |
|------|------|------|
| POST | `/api/workshops` | 创建工坊 |
| GET | `/api/workshops` | 我的工坊列表 |
| GET | `/api/workshops/:id` | 工坊详情 |
| PUT | `/api/workshops/:id` | 更新工坊 |

### 6.3 成员模块
| 方法 | 路径 | 说明 |
|------|------|------|
| POST | `/api/workshops/:id/apply` | 工人申请绑定 |
| POST | `/api/workshops/:id/invite` | 主家邀请（手机号） |
| GET | `/api/workshops/:id/members` | 成员列表 |
| PUT | `/api/members/:id/approve` | 审批通过/拒绝 |
| PUT | `/api/members/:id` | 修改成员信息 |
| DELETE | `/api/members/:id` | 移除成员 |

### 6.4 SKU & 工序模块
| 方法 | 路径 | 说明 |
|------|------|------|
| POST | `/api/workshops/:id/skus` | 创建 SKU |
| GET | `/api/workshops/:id/skus` | SKU 列表 |
| PUT | `/api/skus/:id` | 更新 SKU |
| DELETE | `/api/skus/:id` | 删除 SKU |
| POST | `/api/skus/:id/steps` | 创建工序 |
| GET | `/api/skus/:id/steps` | 工序列表 |
| PUT | `/api/steps/:id` | 更新工序 |
| PUT | `/api/steps/:id/price` | 修改单价（记录历史） |
| DELETE | `/api/steps/:id` | 删除工序 |

### 6.5 工作记录模块
| 方法 | 路径 | 说明 |
|------|------|------|
| POST | `/api/records` | 工人提交记录（写入当时生效单价快照） |
| POST | `/api/records/batch` | 工人批量提交记录（多个工序一次提交） |
| PUT | `/api/records/:id` | 工人修改记录（需校验 version 乐观锁） |
| GET | `/api/records` | 查询记录（支持按日期/工人/SKU 筛选） |
| PUT | `/api/records/:id/confirm` | 主家确认（需校验 version 乐观锁） |
| PUT | `/api/records/:id/modify` | 主家修改数量（记录操作日志） |
| POST | `/api/records/batch-confirm` | 批量确认 |

### 6.6 结算模块
| 方法 | 路径 | 说明 |
|------|------|------|
| POST | `/api/settlements` | 创建结算单（选择日期范围和工人，生成草稿） |
| GET | `/api/settlements` | 结算单列表 |
| GET | `/api/settlements/:id` | 结算单详情（含逐条明细） |
| PUT | `/api/settlements/:id/confirm` | 确认结算（标记相关记录为已结算） |
| DELETE | `/api/settlements/:id` | 删除草稿结算单 |
| GET | `/api/settlements/summary` | 汇总统计（按月/自定义日期） |
| GET | `/api/settlements/detail` | 明细查询（按工人/SKU） |
| POST | `/api/settlements/export` | 导出报表 |

### 6.7 操作日志模块
| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/api/workshops/:id/logs` | 查询操作日志（支持按时间/类型/操作人筛选） |

---

## 七、项目结构（技术架构）

### 7.1 前端（微信小程序）
```
miniprogram/
├── app.js / app.json / app.wxss
├── pages/                    # 页面文件
├── components/               # 公共组件
│   ├── number-input/         # 数量输入组件
│   ├── date-picker/          # 日期选择
│   ├── status-tag/           # 状态标签
│   └── empty-state/          # 空状态
├── utils/
│   ├── request.js            # 网络请求封装
│   ├── auth.js               # 登录态管理
│   └── util.js               # 工具函数
├── stores/                   # 全局状态管理
└── assets/                   # 静态资源
```

### 7.2 后端（Node.js + MySQL）
```
server/
├── app.js                    # 入口
├── config/                   # 配置（数据库、微信等）
├── routes/                   # 路由定义
├── controllers/              # 控制器（请求处理）
├── models/                   # 数据模型（Sequelize ORM）
├── middlewares/
│   ├── auth.js               # 登录验证中间件
│   └── permission.js         # 权限校验中间件
├── services/                 # 业务逻辑层
└── utils/                    # 工具函数
```

---

## 八、关键业务规则

1. **绑定流程**：工人扫码申请 → 主家审批 → 绑定成功；或主家预添加手机号 → 该手机号用户登录后自动绑定
2. **记录修改**：工人可在"待确认"状态下修改；主家确认后工人不可改，仅主家可改；已结算记录不可修改
3. **工序可见性**：工人可看到主家工坊的所有 SKU 和所有工序，自行选择填报
4. **单价快照**：工人提交记录时，系统自动写入当时生效的单价到记录中，后续调价不影响已提交的记录
5. **单价变更**：调价后新记录用新价，已提交的记录保持原价（通过 unit_price 快照 + price_history 双重保障）
6. **结算计算**：总金额 = Σ(各记录的确认数量 × 该记录的单价快照)
7. **结算流程**：主家选择日期范围 → 系统生成结算单草稿 → 主家确认 → 相关记录标记为已结算 → 工人收到通知
8. **数据安全**：工人只能看到自己的数据，主家只能看到自己工坊的数据
9. **多工坊支持**：一个主家可创建多个工坊（如不同车间/产品线），工人可绑定同一主家的不同工坊
10. **并发控制**：通过 version 乐观锁防止主家和工人同时操作同一条记录导致数据冲突
11. **防重复提交**：同一工人同一天同一工序只能有一条记录（数据库唯一约束）
12. **软删除**：SKU 和工序采用软删除（deleted_at），删除后历史记录仍可正常展示和结算
13. **操作留痕**：关键操作（审核、修改数量、结算、成员管理）均写入操作日志，记录变更前后数据
14. **邀请码安全**：邀请码支持设置有效期，过期后需重新生成，防止长期暴露被滥用

---

## 九、开发计划（分阶段）

### Phase 1：基础框架 + 用户系统
- 搭建小程序项目 + Node.js 后端 + MySQL 数据库
- 微信登录 + 手机号绑定
- 创建工坊 + 角色切换

### Phase 2：SKU & 工序管理
- SKU 增删改查页面与接口（含软删除）
- 工序管理 + 单价设置
- 单价历史记录

### Phase 3：工人绑定
- 邀请码/二维码生成与扫码（含有效期机制）
- 申请 + 审批流程
- 手机号预添加自动绑定

### Phase 4：每日记工
- 工人填报数量页面（含批量填报）
- 单价快照写入
- 按天记录 + 修改（含乐观锁并发控制）
- 记录列表 + 状态展示
- 唯一约束防重复提交

### Phase 5：审核 & 结算
- 主家审核（确认/修改/批量操作）+ 操作日志
- 结算单创建 → 确认完整流程
- 结算明细对账
- 按月/日期范围统计
- 工资明细 + 报表导出

### Phase 6：优化完善
- UI/UX 打磨（常用工序置顶等体验优化）
- 微信订阅消息通知（全场景覆盖）
- 异常处理与边界情况
- 性能优化

---

## 十、验证方案

1. 注册两个测试账号，分别扮演主家和工人
2. 主家创建工坊 → 设置 SKU → 添加工序和单价
3. 工人扫码申请绑定 → 主家审批通过 → 双方收到通知
4. 工人连续多天填报记录（含批量填报）→ 主家逐条确认/修改
5. 验证单价快照：提交记录后调价，确认旧记录仍使用旧单价
6. 验证乐观锁：模拟主家和工人同时操作同一记录，确认冲突被正确拦截
7. 验证防重复提交：同一工人同一天同一工序重复提交应被拒绝
8. 主家创建结算单 → 确认结算 → 验证记录状态变为已结算 → 工人收到通知查看工资
9. 验证结算明细：核对结算单中每条明细的数量、单价、小计是否正确
10. 验证按月结算金额计算正确性
11. 测试软删除：删除 SKU/工序后，历史记录和结算单仍正常展示
12. 测试邀请码过期：过期邀请码应无法绑定
13. 查看操作日志：确认关键操作（审核、修改、结算）均有完整记录
14. 测试边界情况：跨月记录、同一天多次修改、主家修改后工人查看、已结算记录不可修改
