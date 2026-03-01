import { Notification } from '../models';

/**
 * 创建通知
 * 异步执行，不阻塞业务流程
 */
export function createNotification(
  userId: number,
  workshopId: number,
  type: string,
  title: string,
  content: string
) {
  Notification.create({
    user_id: userId,
    workshop_id: workshopId,
    type,
    title,
    content,
  }).catch((err) => {
    console.error('创建通知失败:', err);
  });
}
