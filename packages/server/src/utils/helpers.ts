/**
 * Utility functions
 */

/**
 * Generate a 6-character alphanumeric invite code (raw, no uniqueness check)
 */
export function generateInviteCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789';
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

/**
 * Generate a unique invite code that doesn't conflict with existing workshops
 */
export async function generateUniqueInviteCode(
  existsCheck: (code: string) => Promise<boolean>
): Promise<string> {
  for (let i = 0; i < 10; i++) {
    const code = generateInviteCode();
    if (!(await existsCheck(code))) return code;
  }
  throw new Error('无法生成唯一邀请码，请重试');
}

/**
 * Format a Date to YYYY-MM-DD string
 */
export function formatDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Get today's date as YYYY-MM-DD string
 */
export function getToday(): string {
  return formatDate(new Date());
}
