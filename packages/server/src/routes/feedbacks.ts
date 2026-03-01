/**
 * Feedback Routes
 * POST /api/feedbacks                  - Submit feedback (user)
 * GET  /api/feedbacks                  - List my feedbacks (user)
 * POST /api/feedbacks/admin/verify     - Verify admin password
 * GET  /api/feedbacks/admin            - List all feedbacks (admin)
 * GET  /api/feedbacks/admin/counts     - Feedback counts by status (admin)
 * PUT  /api/feedbacks/admin/:id/reply  - Reply to feedback (admin)
 * PUT  /api/feedbacks/admin/:id/close  - Close feedback (admin)
 */
import { Router, Request, Response, NextFunction } from 'express';
import { Feedback, User } from '../models';
import { authRequired } from '../middlewares/auth';
import { success, fail } from '../utils/response';

const router = Router();

// ===================== Admin Middleware =====================

function adminRequired(req: Request, res: Response, next: NextFunction): void {
  const adminKey = req.headers['x-admin-key'] as string;
  const adminPassword = process.env.ADMIN_PASSWORD;

  if (!adminPassword) {
    res.status(500).json(fail('管理员密码未配置'));
    return;
  }

  if (!adminKey || adminKey !== adminPassword) {
    res.status(403).json(fail('管理员密码错误'));
    return;
  }

  next();
}

// ===================== Admin Routes =====================

/**
 * POST /api/feedbacks/admin/verify
 * Verify admin password
 */
router.post('/admin/verify', (req: Request, res: Response) => {
  const { password } = req.body;
  const adminPassword = process.env.ADMIN_PASSWORD;

  if (!adminPassword) {
    res.status(500).json(fail('管理员密码未配置'));
    return;
  }

  if (!password || password !== adminPassword) {
    res.status(403).json(fail('密码错误'));
    return;
  }

  res.json(success({ message: '验证成功' }));
});

/**
 * GET /api/feedbacks/admin
 * List all feedbacks (admin only)
 */
router.get('/admin', adminRequired, async (req: Request, res: Response) => {
  try {
    const { status } = req.query;
    const where: Record<string, unknown> = {};
    if (status && ['pending', 'replied', 'closed'].includes(status as string)) {
      where.status = status;
    }

    const feedbacks = await Feedback.findAll({
      where,
      include: [
        { model: User, as: 'user', attributes: ['id', 'nickname', 'phone', 'avatar_url'] },
      ],
      order: [['created_at', 'DESC']],
    });

    res.json(success(feedbacks));
  } catch (error) {
    console.error('admin list feedbacks error:', error);
    res.status(500).json(fail('获取反馈列表失败'));
  }
});

/**
 * GET /api/feedbacks/admin/counts
 * Feedback counts by status (admin only)
 */
router.get('/admin/counts', adminRequired, async (_req: Request, res: Response) => {
  try {
    const all = await Feedback.count();
    const pending = await Feedback.count({ where: { status: 'pending' } });
    const replied = await Feedback.count({ where: { status: 'replied' } });
    const closed = await Feedback.count({ where: { status: 'closed' } });

    res.json(success({ all, pending, replied, closed }));
  } catch (error) {
    console.error('admin feedback counts error:', error);
    res.status(500).json(fail('获取反馈统计失败'));
  }
});

/**
 * PUT /api/feedbacks/admin/:id/reply
 * Reply to a feedback (admin only)
 */
router.put('/admin/:id/reply', adminRequired, async (req: Request, res: Response) => {
  try {
    const { reply_content } = req.body;
    if (!reply_content || !reply_content.trim()) {
      res.status(400).json(fail('回复内容不能为空'));
      return;
    }

    const feedback = await Feedback.findByPk(Number(req.params.id));
    if (!feedback) {
      res.status(404).json(fail('反馈不存在'));
      return;
    }

    if (feedback.status === 'closed') {
      res.status(400).json(fail('反馈已关闭，无法回复'));
      return;
    }

    await feedback.update({
      reply_content: reply_content.trim(),
      reply_at: new Date(),
      status: 'replied',
    });

    res.json(success(feedback));
  } catch (error) {
    console.error('reply feedback error:', error);
    res.status(500).json(fail('回复反馈失败'));
  }
});

/**
 * PUT /api/feedbacks/admin/:id/close
 * Close a feedback (admin only)
 */
router.put('/admin/:id/close', adminRequired, async (req: Request, res: Response) => {
  try {
    const feedback = await Feedback.findByPk(Number(req.params.id));
    if (!feedback) {
      res.status(404).json(fail('反馈不存在'));
      return;
    }

    if (feedback.status === 'closed') {
      res.status(400).json(fail('反馈已关闭'));
      return;
    }

    await feedback.update({ status: 'closed' });

    res.json(success(feedback));
  } catch (error) {
    console.error('close feedback error:', error);
    res.status(500).json(fail('关闭反馈失败'));
  }
});

// ===================== User Routes =====================

router.use(authRequired);

/**
 * POST /api/feedbacks
 * Submit new feedback
 */
router.post('/', async (req: Request, res: Response) => {
  try {
    const { type, content, contact, images } = req.body;

    if (!content || !content.trim()) {
      res.status(400).json(fail('反馈内容不能为空'));
      return;
    }

    const feedback = await Feedback.create({
      user_id: req.userId,
      type: type || 'other',
      content: content.trim(),
      contact: contact || '',
      images: images || null,
      status: 'pending',
    });

    res.json(success({
      id: feedback.id,
      message: '反馈已提交，感谢您的意见！',
    }));
  } catch (error) {
    console.error('submit feedback error:', error);
    res.status(500).json(fail('提交反馈失败'));
  }
});

/**
 * GET /api/feedbacks
 * List current user's feedbacks
 */
router.get('/', async (req: Request, res: Response) => {
  try {
    const feedbacks = await Feedback.findAll({
      where: { user_id: req.userId },
      order: [['created_at', 'DESC']],
    });

    res.json(success(feedbacks));
  } catch (error) {
    console.error('list feedbacks error:', error);
    res.status(500).json(fail('获取反馈列表失败'));
  }
});

export default router;
