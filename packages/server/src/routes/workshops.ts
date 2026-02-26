/**
 * Workshop Routes
 * POST /api/workshops                     - Create workshop
 * GET  /api/workshops                     - List my workshops
 * GET  /api/workshops/:id                 - Get workshop detail
 * PUT  /api/workshops/:id                 - Update workshop (owner only)
 * POST /api/workshops/:id/invite-code     - Regenerate invite code (owner only)
 * POST /api/workshops/join                - Join workshop by invite code
 */
import { Router, Request, Response } from 'express';
import { Op } from 'sequelize';
import { Workshop, WorkshopMember, User } from '../models';
import { authRequired } from '../middlewares/auth';
import { workshopOwner } from '../middlewares/workshop';
import { success, fail } from '../utils/response';
import { generateInviteCode } from '../utils/helpers';

const router = Router();

// All workshop routes require auth
router.use(authRequired);

/**
 * POST /api/workshops
 * Create a new workshop
 */
router.post('/', async (req: Request, res: Response) => {
  try {
    const { name, description } = req.body;

    if (!name || !name.trim()) {
      res.status(400).json(fail('工坊名称不能为空'));
      return;
    }

    const inviteCode = generateInviteCode();

    const workshop = await Workshop.create({
      owner_id: req.userId,
      name: name.trim(),
      description: description || '',
      invite_code: inviteCode,
      status: 'active',
    });

    // Add owner as a member with 'owner' role
    await WorkshopMember.create({
      workshop_id: workshop.id,
      user_id: req.userId,
      role: 'owner',
      status: 'approved',
      display_name: '',
    });

    res.json(
      success({
        id: workshop.id,
        name: workshop.name,
        description: workshop.description,
        invite_code: workshop.invite_code,
        status: workshop.status,
        created_at: workshop.created_at,
      })
    );
  } catch (error) {
    console.error('create workshop error:', error);
    res.status(500).json(fail('创建工坊失败'));
  }
});

/**
 * GET /api/workshops
 * List workshops where current user is owner or approved member
 */
router.get('/', async (req: Request, res: Response) => {
  try {
    // Workshops owned by user
    const ownedWorkshops = await Workshop.findAll({
      where: { owner_id: req.userId, status: 'active' },
      include: [
        { model: User, as: 'owner', attributes: ['id', 'nickname', 'phone'] },
      ],
      order: [['created_at', 'DESC']],
    });

    // Workshops where user is an approved member (not owner)
    const memberRecords = await WorkshopMember.findAll({
      where: {
        user_id: req.userId,
        role: 'worker',
        status: 'approved',
      },
      attributes: ['workshop_id'],
    });

    const memberWorkshopIds = memberRecords.map((m) => m.workshop_id);

    const joinedWorkshops = await Workshop.findAll({
      where: {
        id: { [Op.in]: memberWorkshopIds },
        status: 'active',
      },
      include: [
        { model: User, as: 'owner', attributes: ['id', 'nickname', 'phone'] },
      ],
      order: [['created_at', 'DESC']],
    });

    res.json(
      success({
        owned: ownedWorkshops,
        joined: joinedWorkshops,
      })
    );
  } catch (error) {
    console.error('list workshops error:', error);
    res.status(500).json(fail('获取工坊列表失败'));
  }
});

/**
 * GET /api/workshops/:id
 * Get workshop detail
 */
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const workshop = await Workshop.findByPk(Number(req.params.id), {
      include: [
        { model: User, as: 'owner', attributes: ['id', 'nickname', 'phone', 'avatar_url'] },
        {
          model: WorkshopMember,
          as: 'members',
          where: { status: 'approved' },
          required: false,
          include: [
            { model: User, as: 'user', attributes: ['id', 'nickname', 'phone', 'avatar_url'] },
          ],
        },
      ],
    });

    if (!workshop) {
      res.status(404).json(fail('工坊不存在'));
      return;
    }

    // Check if user has access (is owner or approved member)
    const isOwner = workshop.owner_id === req.userId;
    const isMember = await WorkshopMember.findOne({
      where: {
        workshop_id: workshop.id,
        user_id: req.userId,
        status: 'approved',
      },
    });

    if (!isOwner && !isMember) {
      res.status(403).json(fail('无权访问该工坊'));
      return;
    }

    res.json(success(workshop));
  } catch (error) {
    console.error('get workshop error:', error);
    res.status(500).json(fail('获取工坊详情失败'));
  }
});

/**
 * PUT /api/workshops/:id
 * Update workshop (owner only)
 */
router.put('/:id', workshopOwner, async (req: Request, res: Response) => {
  try {
    const { name, description, status } = req.body;

    const workshop = await Workshop.findByPk(Number(req.params.id));
    if (!workshop) {
      res.status(404).json(fail('工坊不存在'));
      return;
    }

    const updates: Record<string, unknown> = {};
    if (name !== undefined) updates.name = name.trim();
    if (description !== undefined) updates.description = description;
    if (status !== undefined && ['active', 'inactive'].includes(status)) {
      updates.status = status;
    }

    await workshop.update(updates);

    res.json(success(workshop));
  } catch (error) {
    console.error('update workshop error:', error);
    res.status(500).json(fail('更新工坊失败'));
  }
});

/**
 * POST /api/workshops/:id/invite-code
 * Regenerate invite code (owner only)
 */
router.post('/:id/invite-code', workshopOwner, async (req: Request, res: Response) => {
  try {
    const workshop = await Workshop.findByPk(Number(req.params.id));
    if (!workshop) {
      res.status(404).json(fail('工坊不存在'));
      return;
    }

    const newCode = generateInviteCode();
    await workshop.update({ invite_code: newCode });

    res.json(
      success({
        invite_code: newCode,
      })
    );
  } catch (error) {
    console.error('regenerate invite code error:', error);
    res.status(500).json(fail('重新生成邀请码失败'));
  }
});

/**
 * POST /api/workshops/join
 * Join a workshop by invite code
 */
router.post('/join', async (req: Request, res: Response) => {
  try {
    const { invite_code } = req.body;

    if (!invite_code) {
      res.status(400).json(fail('缺少邀请码'));
      return;
    }

    const workshop = await Workshop.findOne({
      where: { invite_code, status: 'active' },
    });

    if (!workshop) {
      res.status(404).json(fail('邀请码无效或工坊已停用'));
      return;
    }

    // Check if invite code has expired
    if (workshop.invite_expires_at && new Date(workshop.invite_expires_at) < new Date()) {
      res.status(400).json(fail('邀请码已过期'));
      return;
    }

    // Check if user is already the owner
    if (workshop.owner_id === req.userId) {
      res.status(400).json(fail('您是该工坊的所有者，无需加入'));
      return;
    }

    // Check if already a member
    const existingMember = await WorkshopMember.findOne({
      where: {
        workshop_id: workshop.id,
        user_id: req.userId,
      },
    });

    if (existingMember) {
      if (existingMember.status === 'approved') {
        res.status(400).json(fail('您已是该工坊成员'));
        return;
      }
      if (existingMember.status === 'pending') {
        res.status(400).json(fail('您的加入申请正在审核中'));
        return;
      }
      if (existingMember.status === 'rejected' || existingMember.status === 'removed') {
        // Allow re-join by updating status to pending
        await existingMember.update({ status: 'pending' });
        res.json(success({ message: '已重新提交加入申请，等待审核' }));
        return;
      }
    }

    // Create pending membership
    await WorkshopMember.create({
      workshop_id: workshop.id,
      user_id: req.userId,
      role: 'worker',
      status: 'pending',
      display_name: '',
    });

    res.json(
      success({
        message: '加入申请已提交，等待工坊主审核',
        workshop_id: workshop.id,
        workshop_name: workshop.name,
      })
    );
  } catch (error) {
    console.error('join workshop error:', error);
    res.status(500).json(fail('加入工坊失败'));
  }
});

export default router;
