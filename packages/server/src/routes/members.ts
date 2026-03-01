/**
 * Member Management Routes
 * GET  /api/workshops/:workshopId/members                         - List members
 * PUT  /api/workshops/:workshopId/members/:memberId/approve       - Approve member
 * PUT  /api/workshops/:workshopId/members/:memberId/reject        - Reject member
 * PUT  /api/workshops/:workshopId/members/:memberId/remove        - Remove member
 */
import { Router, Request, Response } from 'express';
import { WorkshopMember, User, OperationLog, Workshop } from '../models';
import { authRequired } from '../middlewares/auth';
import { workshopOwner } from '../middlewares/workshop';
import { success, fail } from '../utils/response';
import { createNotification } from '../utils/notify';

const router = Router({ mergeParams: true });

// All member routes require auth
router.use(authRequired);

/**
 * GET /api/workshops/:workshopId/members
 * List all members of a workshop (owner only)
 */
router.get('/', workshopOwner, async (req: Request, res: Response) => {
  try {
    const { workshopId } = req.params;
    const { status } = req.query;

    const where: Record<string, unknown> = { workshop_id: Number(workshopId) };
    if (status && typeof status === 'string') {
      where.status = status;
    }

    const members = await WorkshopMember.findAll({
      where,
      include: [
        { model: User, as: 'user', attributes: ['id', 'nickname', 'phone', 'avatar_url'] },
      ],
      order: [['created_at', 'ASC']],
    });

    res.json(success(members));
  } catch (error) {
    console.error('list members error:', error);
    res.status(500).json(fail('获取成员列表失败'));
  }
});

/**
 * GET /api/workshops/:workshopId/members/:memberId
 * Get a specific member detail (owner only)
 */
router.get('/:memberId', workshopOwner, async (req: Request, res: Response) => {
  try {
    const { workshopId, memberId } = req.params;
    const member = await WorkshopMember.findOne({
      where: { id: Number(memberId), workshop_id: Number(workshopId) },
      include: [
        { model: User, as: 'user', attributes: ['id', 'nickname', 'phone', 'avatar_url'] },
      ],
    });
    if (!member) {
      res.status(404).json(fail('成员不存在'));
      return;
    }
    res.json(success(member));
  } catch (error) {
    console.error('get member detail error:', error);
    res.status(500).json(fail('获取成员详情失败'));
  }
});

/**
 * PUT /api/workshops/:workshopId/members/:memberId/approve
 * Approve a pending member (owner only)
 */
router.put('/:memberId/approve', workshopOwner, async (req: Request, res: Response) => {
  try {
    const { workshopId, memberId } = req.params;

    const member = await WorkshopMember.findOne({
      where: {
        id: Number(memberId),
        workshop_id: Number(workshopId),
      },
    });

    if (!member) {
      res.status(404).json(fail('成员记录不存在'));
      return;
    }

    if (member.status !== 'pending') {
      res.status(400).json(fail('该成员不在待审核状态'));
      return;
    }

    await member.update({ status: 'approved' });

    // Log the operation
    await OperationLog.create({
      operator_id: req.userId,
      workshop_id: Number(workshopId),
      action: 'approve_member',
      target_type: 'workshop_member',
      target_id: member.id,
      before_data: { status: 'pending' },
      after_data: { status: 'approved' },
    });

    // Notify the member
    if (member.user_id) {
      const workshop = await Workshop.findByPk(Number(workshopId), { attributes: ['name'] });
      createNotification(member.user_id, Number(workshopId), 'member_approved', '申请已通过', `您加入「${workshop?.name || '企业'}」的申请已通过`);
    }

    res.json(success({ message: '已审核通过' }));
  } catch (error) {
    console.error('approve member error:', error);
    res.status(500).json(fail('审核成员失败'));
  }
});

/**
 * PUT /api/workshops/:workshopId/members/:memberId/reject
 * Reject a pending member (owner only)
 */
router.put('/:memberId/reject', workshopOwner, async (req: Request, res: Response) => {
  try {
    const { workshopId, memberId } = req.params;

    const member = await WorkshopMember.findOne({
      where: {
        id: Number(memberId),
        workshop_id: Number(workshopId),
      },
    });

    if (!member) {
      res.status(404).json(fail('成员记录不存在'));
      return;
    }

    if (member.status !== 'pending') {
      res.status(400).json(fail('该成员不在待审核状态'));
      return;
    }

    await member.update({ status: 'rejected' });

    // Log the operation
    await OperationLog.create({
      operator_id: req.userId,
      workshop_id: Number(workshopId),
      action: 'reject_member',
      target_type: 'workshop_member',
      target_id: member.id,
      before_data: { status: 'pending' },
      after_data: { status: 'rejected' },
    });

    // Notify the member
    if (member.user_id) {
      const workshop = await Workshop.findByPk(Number(workshopId), { attributes: ['name'] });
      createNotification(member.user_id, Number(workshopId), 'member_rejected', '申请被拒绝', `您加入「${workshop?.name || '企业'}」的申请被拒绝`);
    }

    res.json(success({ message: '已拒绝' }));
  } catch (error) {
    console.error('reject member error:', error);
    res.status(500).json(fail('拒绝成员失败'));
  }
});

/**
 * PUT /api/workshops/:workshopId/members/:memberId/remove
 * Remove an approved member (owner only)
 */
router.put('/:memberId/remove', workshopOwner, async (req: Request, res: Response) => {
  try {
    const { workshopId, memberId } = req.params;

    const member = await WorkshopMember.findOne({
      where: {
        id: Number(memberId),
        workshop_id: Number(workshopId),
      },
    });

    if (!member) {
      res.status(404).json(fail('成员记录不存在'));
      return;
    }

    if (member.role === 'owner') {
      res.status(400).json(fail('不能移除企业所有者'));
      return;
    }

    const beforeStatus = member.status;
    await member.update({ status: 'removed' });

    // Log the operation
    await OperationLog.create({
      operator_id: req.userId,
      workshop_id: Number(workshopId),
      action: 'remove_member',
      target_type: 'workshop_member',
      target_id: member.id,
      before_data: { status: beforeStatus },
      after_data: { status: 'removed' },
    });

    // Notify the member
    if (member.user_id) {
      const workshop = await Workshop.findByPk(Number(workshopId), { attributes: ['name'] });
      createNotification(member.user_id, Number(workshopId), 'member_removed', '已被移出企业', `您已被移出「${workshop?.name || '企业'}」`);
    }

    res.json(success({ message: '已移除成员' }));
  } catch (error) {
    console.error('remove member error:', error);
    res.status(500).json(fail('移除成员失败'));
  }
});

export default router;
