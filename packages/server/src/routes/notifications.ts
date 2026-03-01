/**
 * Notification Routes
 * GET  /api/notifications              - List notifications (paginated)
 * GET  /api/notifications/unread-count  - Get unread count
 * PUT  /api/notifications/:id/read      - Mark single notification as read
 * PUT  /api/notifications/read-all      - Mark all as read
 */
import { Router, Request, Response } from 'express';
import { Notification, Workshop } from '../models';
import { authRequired } from '../middlewares/auth';
import { success, fail } from '../utils/response';

const router = Router();

router.use(authRequired);

/**
 * GET /api/notifications
 * List notifications for current user
 * Query: page, page_size
 */
router.get('/', async (req: Request, res: Response) => {
  try {
    const { page = '1', page_size = '20' } = req.query;

    const limit = Math.min(Number(page_size), 100);
    const offset = (Number(page) - 1) * limit;

    const { count, rows } = await Notification.findAndCountAll({
      where: { user_id: req.userId },
      include: [
        { model: Workshop, as: 'workshop', attributes: ['id', 'name'] },
      ],
      order: [['created_at', 'DESC']],
      limit,
      offset,
    });

    res.json(
      success({
        total: count,
        page: Number(page),
        page_size: limit,
        list: rows,
      })
    );
  } catch (error) {
    console.error('list notifications error:', error);
    res.status(500).json(fail('获取通知列表失败'));
  }
});

/**
 * GET /api/notifications/unread-count
 * Get unread notification count
 */
router.get('/unread-count', async (req: Request, res: Response) => {
  try {
    const count = await Notification.count({
      where: { user_id: req.userId, is_read: false },
    });

    res.json(success({ count }));
  } catch (error) {
    console.error('unread count error:', error);
    res.status(500).json(fail('获取未读数失败'));
  }
});

/**
 * PUT /api/notifications/:id/read
 * Mark a notification as read
 */
router.put('/:id/read', async (req: Request, res: Response) => {
  try {
    const notification = await Notification.findOne({
      where: { id: Number(req.params.id), user_id: req.userId },
    });

    if (!notification) {
      res.status(404).json(fail('通知不存在'));
      return;
    }

    await notification.update({ is_read: true });
    res.json(success({ message: '已标记已读' }));
  } catch (error) {
    console.error('mark read error:', error);
    res.status(500).json(fail('标记已读失败'));
  }
});

/**
 * PUT /api/notifications/read-all
 * Mark all notifications as read
 */
router.put('/read-all', async (req: Request, res: Response) => {
  try {
    await Notification.update(
      { is_read: true },
      { where: { user_id: req.userId, is_read: false } }
    );

    res.json(success({ message: '已全部标记已读' }));
  } catch (error) {
    console.error('mark all read error:', error);
    res.status(500).json(fail('标记全部已读失败'));
  }
});

export default router;
