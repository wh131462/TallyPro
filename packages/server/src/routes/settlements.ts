/**
 * Settlement Routes
 * POST /api/settlements            - Create settlement (owner only)
 * GET  /api/settlements            - List settlements for a workshop
 * GET  /api/settlements/:id        - Get settlement detail with items
 * PUT  /api/settlements/:id/confirm - Confirm settlement (owner only)
 */
import { Router, Request, Response } from 'express';
import { Op } from 'sequelize';
import {
  sequelize,
  Settlement,
  SettlementItem,
  WorkRecord,
  Workshop,
  User,
  Step,
  Sku,
  OperationLog,
} from '../models';
import { authRequired } from '../middlewares/auth';
import { success, fail } from '../utils/response';
import { createNotification } from '../utils/notify';

const router = Router();

// All settlement routes require auth
router.use(authRequired);

/**
 * POST /api/settlements
 * Create a settlement (owner only)
 * Body: { workshop_id, worker_id, period_start, period_end }
 */
router.post('/', async (req: Request, res: Response) => {
  try {
    const { workshop_id, worker_id, period_start, period_end } = req.body;

    if (!workshop_id || !worker_id || !period_start || !period_end) {
      res.status(400).json(fail('缺少必要参数'));
      return;
    }

    // Check ownership
    const workshop = await Workshop.findByPk(workshop_id);
    if (!workshop || workshop.owner_id !== req.userId) {
      res.status(403).json(fail('仅企业所有者可创建结算单'));
      return;
    }

    // Find all confirmed/modified records for this worker in the period
    const records = await WorkRecord.findAll({
      where: {
        workshop_id,
        worker_id,
        work_date: { [Op.between]: [period_start, period_end] },
        status: { [Op.in]: ['confirmed', 'modified'] },
        settlement_id: null,
      },
      include: [
        {
          model: Step,
          as: 'step',
          attributes: ['id', 'name'],
          paranoid: false,
          include: [
            { model: Sku, as: 'sku', attributes: ['id', 'name'], paranoid: false },
          ],
        },
      ],
    });

    if (records.length === 0) {
      res.status(400).json(fail('该时间段内没有可结算的记录'));
      return;
    }

    // Calculate total amount and create settlement
    const settlement = await sequelize.transaction(async (t) => {
      let totalAmount = 0;

      // Create settlement
      const newSettlement = await Settlement.create(
        {
          workshop_id,
          worker_id,
          period_start,
          period_end,
          total_amount: 0, // Will be updated
          status: 'draft',
        },
        { transaction: t }
      );

      // Create settlement items and calculate total
      for (const record of records) {
        const qty = record.confirmed_quantity ?? record.quantity;
        const amount = qty * Number(record.unit_price);
        totalAmount += amount;

        const step = record.get('step') as Step & { sku?: Sku };

        await SettlementItem.create(
          {
            settlement_id: newSettlement.id,
            record_id: record.id,
            step_name: step?.name || '',
            sku_name: step?.sku?.name || '',
            quantity: qty,
            unit_price: record.unit_price,
            amount,
          },
          { transaction: t }
        );

        // Link record to settlement
        await record.update(
          { settlement_id: newSettlement.id },
          { transaction: t }
        );
      }

      // Update total amount
      totalAmount = Math.round(totalAmount * 100) / 100;
      await newSettlement.update({ total_amount: totalAmount }, { transaction: t });

      // Log the operation
      await OperationLog.create(
        {
          operator_id: req.userId!,
          workshop_id,
          action: 'create_settlement',
          target_type: 'settlement',
          target_id: newSettlement.id,
          after_data: {
            worker_id,
            period_start,
            period_end,
            total_amount: totalAmount,
            record_count: records.length,
          },
          remark: `创建结算单，周期 ${period_start} ~ ${period_end}，金额 ¥${totalAmount}，共 ${records.length} 条记录`,
        },
        { transaction: t }
      );

      return newSettlement;
    });

    // Reload with items
    const result = await Settlement.findByPk(settlement.id, {
      include: [
        { model: SettlementItem, as: 'items' },
        { model: User, as: 'worker', attributes: ['id', 'nickname', 'phone', 'avatar_url'] },
      ],
    });

    // Notify worker about new settlement
    createNotification(
      Number(worker_id),
      Number(workshop_id),
      'settlement_created',
      '结算单已生成',
      `【${workshop.name}】为您生成了 ${period_start} ~ ${period_end} 的结算单，共计 ¥${settlement.total_amount}，请查看确认。`,
    );

    res.json(success(result));
  } catch (error) {
    console.error('create settlement error:', error);
    res.status(500).json(fail('创建结算单失败'));
  }
});

/**
 * GET /api/settlements
 * List settlements for a workshop
 * Query: workshop_id, worker_id, status, page, page_size
 */
router.get('/', async (req: Request, res: Response) => {
  try {
    const { workshop_id, worker_id, status, page = '1', page_size = '20' } = req.query;

    if (!workshop_id) {
      res.status(400).json(fail('缺少企业ID'));
      return;
    }

    // Check access
    const workshop = await Workshop.findByPk(Number(workshop_id));
    if (!workshop) {
      res.status(404).json(fail('企业不存在'));
      return;
    }

    const isOwner = workshop.owner_id === req.userId;

    const where: Record<string, unknown> = { workshop_id: Number(workshop_id) };

    if (worker_id) {
      where.worker_id = Number(worker_id);
    } else if (!isOwner) {
      // Non-owner can only see their own settlements
      where.worker_id = req.userId;
    }

    if (status && typeof status === 'string') {
      where.status = status;
    }

    const limit = Math.min(Number(page_size), 100);
    const offset = (Number(page) - 1) * limit;

    const { count, rows } = await Settlement.findAndCountAll({
      where,
      include: [
        { model: User, as: 'worker', attributes: ['id', 'nickname', 'phone', 'avatar_url'] },
        { model: SettlementItem, as: 'items', attributes: ['id', 'sku_name'] },
      ],
      order: [['created_at', 'DESC']],
      limit,
      offset,
    });

    // Append record_count and product_count
    const list = rows.map((s) => {
      const json = s.toJSON() as Record<string, unknown>;
      const items = (json.items as Array<{ sku_name: string }>) || [];
      json.record_count = items.length;
      json.product_count = new Set(items.map((i) => i.sku_name)).size;
      delete json.items;
      return json;
    });

    res.json(
      success({
        total: count,
        page: Number(page),
        page_size: limit,
        list,
      })
    );
  } catch (error) {
    console.error('list settlements error:', error);
    res.status(500).json(fail('获取结算列表失败'));
  }
});

/**
 * GET /api/settlements/:id
 * Get settlement detail with items
 */
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const settlement = await Settlement.findByPk(Number(req.params.id), {
      include: [
        { model: SettlementItem, as: 'items' },
        { model: User, as: 'worker', attributes: ['id', 'nickname', 'phone', 'avatar_url'] },
        { model: Workshop, as: 'workshop', attributes: ['id', 'name'] },
      ],
    });

    if (!settlement) {
      res.status(404).json(fail('结算单不存在'));
      return;
    }

    // Check access: owner or worker
    const workshop = await Workshop.findByPk(settlement.workshop_id);
    const isOwner = workshop?.owner_id === req.userId;
    const isWorker = settlement.worker_id === req.userId;

    if (!isOwner && !isWorker) {
      res.status(403).json(fail('无权查看该结算单'));
      return;
    }

    res.json(success(settlement));
  } catch (error) {
    console.error('get settlement error:', error);
    res.status(500).json(fail('获取结算详情失败'));
  }
});

/**
 * PUT /api/settlements/:id/confirm
 * Confirm a settlement (owner only)
 */
router.put('/:id/confirm', async (req: Request, res: Response) => {
  try {
    const settlement = await Settlement.findByPk(Number(req.params.id));
    if (!settlement) {
      res.status(404).json(fail('结算单不存在'));
      return;
    }

    // Check ownership
    const workshop = await Workshop.findByPk(settlement.workshop_id);
    if (!workshop || workshop.owner_id !== req.userId) {
      res.status(403).json(fail('仅企业所有者可确认结算'));
      return;
    }

    if (settlement.status === 'confirmed') {
      res.status(400).json(fail('该结算单已确认'));
      return;
    }

    await sequelize.transaction(async (t) => {
      await settlement.update({ status: 'confirmed' }, { transaction: t });

      // Update all associated records to 'settled' status
      await WorkRecord.update(
        { status: 'settled' },
        {
          where: { settlement_id: settlement.id },
          transaction: t,
        }
      );

      // Log the operation
      await OperationLog.create(
        {
          operator_id: req.userId!,
          workshop_id: settlement.workshop_id,
          action: 'confirm_settlement',
          target_type: 'settlement',
          target_id: settlement.id,
          before_data: { status: 'draft' },
          after_data: { status: 'confirmed' },
          remark: `确认结算单，金额 ${settlement.total_amount}`,
        },
        { transaction: t }
      );
    });

    // Notify worker about settlement confirmation
    createNotification(
      settlement.worker_id,
      settlement.workshop_id,
      'settlement_confirmed',
      '结算已确认',
      `【${workshop.name}】已确认您 ${settlement.period_start} ~ ${settlement.period_end} 的结算单，金额 ¥${settlement.total_amount}。`,
    );

    res.json(success({ message: '结算单已确认' }));
  } catch (error) {
    console.error('confirm settlement error:', error);
    res.status(500).json(fail('确认结算失败'));
  }
});

export default router;
