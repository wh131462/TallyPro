/** 工作记录状态 */
export const RECORD_STATUS = {
  PENDING: 'pending',
  CONFIRMED: 'confirmed',
  MODIFIED: 'modified',
  SETTLED: 'settled',
} as const;

export const RECORD_STATUS_LABEL: Record<string, string> = {
  pending: '待确认',
  confirmed: '已确认',
  modified: '已修改',
  settled: '已结算',
};

/** 成员状态 */
export const MEMBER_STATUS = {
  PENDING: 'pending',
  APPROVED: 'approved',
  REJECTED: 'rejected',
  REMOVED: 'removed',
} as const;

export const MEMBER_STATUS_LABEL: Record<string, string> = {
  pending: '待审批',
  approved: '已通过',
  rejected: '已拒绝',
  removed: '已移除',
};

/** 结算状态 */
export const SETTLEMENT_STATUS = {
  DRAFT: 'draft',
  CONFIRMED: 'confirmed',
} as const;

export const SETTLEMENT_STATUS_LABEL: Record<string, string> = {
  draft: '草稿',
  confirmed: '已确认',
};
