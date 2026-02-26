// ==================== 用户 ====================

export interface User {
  id: number;
  openid: string;
  phone: string;
  nickname: string;
  avatar_url: string;
  created_at: string;
  updated_at: string;
}

// ==================== 工坊 ====================

export interface Workshop {
  id: number;
  owner_id: number;
  name: string;
  description: string;
  invite_code: string;
  invite_expires_at: string | null;
  status: WorkshopStatus;
  created_at: string;
  updated_at: string;
}

export type WorkshopStatus = 'active' | 'inactive';

// ==================== 工坊成员 ====================

export interface WorkshopMember {
  id: number;
  workshop_id: number;
  user_id: number | null;
  role: MemberRole;
  display_name: string;
  status: MemberStatus;
  invited_phone: string;
  created_at: string;
  updated_at: string;
}

export type MemberRole = 'owner' | 'worker';
export type MemberStatus = 'pending' | 'approved' | 'rejected' | 'removed';

// ==================== SKU ====================

export interface Sku {
  id: number;
  workshop_id: number;
  name: string;
  description: string;
  image_url: string;
  sort_order: number;
  is_active: boolean;
  deleted_at: string | null;
  created_at: string;
  updated_at: string;
}

// ==================== 工序 ====================

export interface Step {
  id: number;
  sku_id: number;
  name: string;
  unit_price: number;
  sort_order: number;
  is_active: boolean;
  deleted_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface PriceHistory {
  id: number;
  step_id: number;
  price: number;
  effective_date: string;
  created_at: string;
}

// ==================== 工作记录 ====================

export interface WorkRecord {
  id: number;
  workshop_id: number;
  worker_id: number;
  step_id: number;
  work_date: string;
  quantity: number;
  unit_price: number;
  status: RecordStatus;
  confirmed_quantity: number | null;
  modifier_id: number | null;
  modify_reason: string;
  settlement_id: number | null;
  version: number;
  created_at: string;
  updated_at: string;
}

export type RecordStatus = 'pending' | 'confirmed' | 'modified' | 'settled';

// ==================== 结算 ====================

export interface Settlement {
  id: number;
  workshop_id: number;
  worker_id: number;
  period_start: string;
  period_end: string;
  total_amount: number;
  status: SettlementStatus;
  created_at: string;
}

export type SettlementStatus = 'draft' | 'confirmed';

export interface SettlementItem {
  id: number;
  settlement_id: number;
  record_id: number;
  step_name: string;
  sku_name: string;
  quantity: number;
  unit_price: number;
  amount: number;
}

// ==================== 操作日志 ====================

export interface OperationLog {
  id: number;
  operator_id: number;
  workshop_id: number;
  action: string;
  target_type: string;
  target_id: number;
  before_data: Record<string, unknown> | null;
  after_data: Record<string, unknown> | null;
  remark: string;
  created_at: string;
}

// ==================== API 通用 ====================

export interface ApiResponse<T = unknown> {
  code: number;
  message: string;
  data: T;
}

export interface PaginatedData<T> {
  list: T[];
  total: number;
  page: number;
  page_size: number;
}
