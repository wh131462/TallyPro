/**
 * Operation Log Routes
 * GET /api/workshops/:workshopId/logs - List logs with pagination and filters
 */
import { Router, Request, Response } from 'express';
import { OperationLog, User } from '../models';
import { authRequired } from '../middlewares/auth';
import { workshopOwner } from '../middlewares/workshop';
import { success, fail } from '../utils/response';

const router = Router({ mergeParams: true });

// All log routes require auth
router.use(authRequired);

/**
 * GET /api/workshops/:workshopId/logs
 * List operation logs with pagination and filters
 * Query: action, page, page_size
 */
router.get('/', workshopOwner, async (req: Request, res: Response) => {
  try {
    const { workshopId } = req.params;
    const { action, page = '1', page_size = '20' } = req.query;

    const where: Record<string, unknown> = { workshop_id: Number(workshopId) };

    if (action && typeof action === 'string') {
      where.action = action;
    }

    const limit = Math.min(Number(page_size), 100);
    const offset = (Number(page) - 1) * limit;

    const { count, rows } = await OperationLog.findAndCountAll({
      where,
      include: [
        { model: User, as: 'operator', attributes: ['id', 'nickname', 'phone'] },
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
    console.error('list logs error:', error);
    res.status(500).json(fail('获取操作日志失败'));
  }
});

export default router;
