/**
 * Work Record Routes
 * POST /api/records/batch          - Worker batch submit records
 * GET  /api/records                - List records with filters
 * PUT  /api/records/:id/confirm    - Owner confirms a record
 * PUT  /api/records/:id/modify     - Owner modifies a record
 * POST /api/records/batch-confirm  - Owner batch confirms records
 * GET  /api/records/summary        - Get summary stats for a workshop
 */
import { Router, Request, Response } from 'express';
import { Op } from 'sequelize';
import { sequelize, WorkRecord, Step, Sku, Workshop, User, WorkshopMember, OperationLog } from '../models';
import { authRequired } from '../middlewares/auth';
import { success, fail } from '../utils/response';

const router = Router();

// All record routes require auth
router.use(authRequired);

/**
 * POST /api/records/batch
 * Worker submits records in batch (for a date + SKU)
 * Body: { workshop_id, work_date, records: [{ step_id, quantity }] }
 */
router.post('/batch', async (req: Request, res: Response) => {
  try {
    const { workshop_id, work_date, records } = req.body;

    if (!workshop_id || !work_date || !records || !Array.isArray(records) || records.length === 0) {
      res.status(400).json(fail('缺少必要参数'));
      return;
    }

    // Check user is a member of the workshop
    const workshop = await Workshop.findByPk(workshop_id);
    if (!workshop) {
      res.status(404).json(fail('工坊不存在'));
      return;
    }

    const isOwner = workshop.owner_id === req.userId;
    if (!isOwner) {
      const member = await WorkshopMember.findOne({
        where: {
          workshop_id,
          user_id: req.userId,
          status: 'approved',
        },
      });
      if (!member) {
        res.status(403).json(fail('您不是该工坊的成员'));
        return;
      }
    }

    // Validate all step_ids and get their prices
    const stepIds = records.map((r: { step_id: number }) => r.step_id);
    const steps = await Step.findAll({
      where: { id: { [Op.in]: stepIds }, is_active: true },
    });

    const stepMap = new Map(steps.map((s) => [s.id, s]));

    // Validate all steps exist and belong to same workshop
    for (const record of records) {
      const step = stepMap.get(record.step_id);
      if (!step) {
        res.status(400).json(fail(`工序ID ${record.step_id} 不存在或已停用`));
        return;
      }
    }

    // Create records in a transaction
    const createdRecords = await sequelize.transaction(async (t) => {
      const result = [];
      for (const record of records) {
        const step = stepMap.get(record.step_id)!;

        // Check if record already exists for this worker+step+date
        const existing = await WorkRecord.findOne({
          where: {
            worker_id: req.userId,
            step_id: record.step_id,
            work_date,
            workshop_id,
          },
          transaction: t,
        });

        if (existing) {
          // Update existing record
          await existing.update(
            {
              quantity: record.quantity,
              unit_price: step.unit_price,
              status: 'pending',
              version: existing.version + 1,
            },
            { transaction: t }
          );
          result.push(existing);
        } else {
          // Create new record
          const newRecord = await WorkRecord.create(
            {
              workshop_id: Number(workshop_id),
              worker_id: req.userId,
              step_id: record.step_id,
              work_date,
              quantity: record.quantity,
              unit_price: step.unit_price,
              status: 'pending',
              version: 1,
            },
            { transaction: t }
          );
          result.push(newRecord);
        }
      }
      return result;
    });

    res.json(success(createdRecords));
  } catch (error) {
    console.error('batch create records error:', error);
    res.status(500).json(fail('提交记录失败'));
  }
});

/**
 * GET /api/records
 * List records with filters
 * Query: workshop_id, worker_id, work_date, status, page, page_size
 */
router.get('/', async (req: Request, res: Response) => {
  try {
    const {
      workshop_id,
      worker_id,
      work_date,
      work_date_start,
      work_date_end,
      status,
      page = '1',
      page_size = '20',
    } = req.query;

    if (!workshop_id) {
      res.status(400).json(fail('缺少工坊ID'));
      return;
    }

    // Check user has access to workshop
    const workshop = await Workshop.findByPk(Number(workshop_id));
    if (!workshop) {
      res.status(404).json(fail('工坊不存在'));
      return;
    }

    const isOwner = workshop.owner_id === req.userId;
    if (!isOwner) {
      const member = await WorkshopMember.findOne({
        where: {
          workshop_id: Number(workshop_id),
          user_id: req.userId,
          status: 'approved',
        },
      });
      if (!member) {
        res.status(403).json(fail('您不是该工坊的成员'));
        return;
      }
    }

    // Build where clause
    const where: Record<string, unknown> = { workshop_id: Number(workshop_id) };

    if (worker_id) {
      where.worker_id = Number(worker_id);
    } else if (!isOwner) {
      // Non-owner can only see their own records
      where.worker_id = req.userId;
    }

    if (work_date) {
      where.work_date = work_date;
    } else if (work_date_start && work_date_end) {
      where.work_date = {
        [Op.between]: [work_date_start, work_date_end],
      };
    }

    if (status && typeof status === 'string') {
      where.status = status;
    }

    const limit = Math.min(Number(page_size), 100);
    const offset = (Number(page) - 1) * limit;

    const { count, rows } = await WorkRecord.findAndCountAll({
      where,
      include: [
        { model: User, as: 'worker', attributes: ['id', 'nickname', 'phone'] },
        {
          model: Step,
          as: 'step',
          attributes: ['id', 'name', 'unit_price'],
          paranoid: false,
          include: [
            { model: Sku, as: 'sku', attributes: ['id', 'name'], paranoid: false },
          ],
        },
      ],
      order: [['work_date', 'DESC'], ['created_at', 'DESC']],
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
    console.error('list records error:', error);
    res.status(500).json(fail('获取记录列表失败'));
  }
});

/**
 * PUT /api/records/:id/confirm
 * Owner confirms a record
 */
router.put('/:id/confirm', async (req: Request, res: Response) => {
  try {
    const record = await WorkRecord.findByPk(Number(req.params.id));
    if (!record) {
      res.status(404).json(fail('记录不存在'));
      return;
    }

    // Check ownership
    const workshop = await Workshop.findByPk(record.workshop_id);
    if (!workshop || workshop.owner_id !== req.userId) {
      res.status(403).json(fail('仅工坊所有者可确认记录'));
      return;
    }

    if (record.status === 'settled') {
      res.status(400).json(fail('已结算的记录不能修改'));
      return;
    }

    const beforeStatus = record.status;
    await record.update({
      status: 'confirmed',
      confirmed_quantity: record.quantity,
    });

    // Log the operation
    await OperationLog.create({
      operator_id: req.userId,
      workshop_id: record.workshop_id,
      action: 'confirm_record',
      target_type: 'work_record',
      target_id: record.id,
      before_data: { status: beforeStatus },
      after_data: { status: 'confirmed', confirmed_quantity: record.quantity },
    });

    res.json(success(record));
  } catch (error) {
    console.error('confirm record error:', error);
    res.status(500).json(fail('确认记录失败'));
  }
});

/**
 * PUT /api/records/:id/modify
 * Owner modifies a record (with reason)
 */
router.put('/:id/modify', async (req: Request, res: Response) => {
  try {
    const { confirmed_quantity, modify_reason } = req.body;

    if (confirmed_quantity === undefined || confirmed_quantity === null) {
      res.status(400).json(fail('缺少确认数量'));
      return;
    }

    if (!modify_reason) {
      res.status(400).json(fail('修改记录需要提供原因'));
      return;
    }

    const record = await WorkRecord.findByPk(Number(req.params.id));
    if (!record) {
      res.status(404).json(fail('记录不存在'));
      return;
    }

    // Check ownership
    const workshop = await Workshop.findByPk(record.workshop_id);
    if (!workshop || workshop.owner_id !== req.userId) {
      res.status(403).json(fail('仅工坊所有者可修改记录'));
      return;
    }

    if (record.status === 'settled') {
      res.status(400).json(fail('已结算的记录不能修改'));
      return;
    }

    const beforeData = {
      status: record.status,
      confirmed_quantity: record.confirmed_quantity,
      quantity: record.quantity,
    };

    await record.update({
      status: 'modified',
      confirmed_quantity: Number(confirmed_quantity),
      modifier_id: req.userId,
      modify_reason,
      version: record.version + 1,
    });

    // Log the operation
    await OperationLog.create({
      operator_id: req.userId!,
      workshop_id: record.workshop_id,
      action: 'modify_record',
      target_type: 'work_record',
      target_id: record.id,
      before_data: beforeData,
      after_data: {
        status: 'modified',
        confirmed_quantity: Number(confirmed_quantity),
      },
      remark: modify_reason,
    });

    res.json(success(record));
  } catch (error) {
    console.error('modify record error:', error);
    res.status(500).json(fail('修改记录失败'));
  }
});

/**
 * POST /api/records/batch-confirm
 * Owner batch confirms records
 * Body: { record_ids: number[] }
 */
router.post('/batch-confirm', async (req: Request, res: Response) => {
  try {
    const { record_ids } = req.body;

    if (!record_ids || !Array.isArray(record_ids) || record_ids.length === 0) {
      res.status(400).json(fail('缺少记录ID列表'));
      return;
    }

    const records = await WorkRecord.findAll({
      where: { id: { [Op.in]: record_ids } },
    });

    if (records.length === 0) {
      res.status(404).json(fail('未找到指定记录'));
      return;
    }

    // Check all records belong to same workshop and user is owner
    const workshopIds = [...new Set(records.map((r) => r.workshop_id))];
    if (workshopIds.length > 1) {
      res.status(400).json(fail('批量确认的记录必须属于同一个工坊'));
      return;
    }

    const workshop = await Workshop.findByPk(workshopIds[0]);
    if (!workshop || workshop.owner_id !== req.userId) {
      res.status(403).json(fail('仅工坊所有者可确认记录'));
      return;
    }

    // Filter out settled records
    const confirmableRecords = records.filter((r) => r.status !== 'settled');

    await sequelize.transaction(async (t) => {
      for (const record of confirmableRecords) {
        await record.update(
          {
            status: 'confirmed',
            confirmed_quantity: record.quantity,
          },
          { transaction: t }
        );
      }

      // Log batch confirmation
      await OperationLog.create(
        {
          operator_id: req.userId!,
          workshop_id: workshop.id,
          action: 'batch_confirm_records',
          target_type: 'work_record',
          target_id: 0,
          after_data: { record_ids: confirmableRecords.map((r) => r.id) },
          remark: `批量确认 ${confirmableRecords.length} 条记录`,
        },
        { transaction: t }
      );
    });

    res.json(
      success({
        confirmed_count: confirmableRecords.length,
        skipped_count: records.length - confirmableRecords.length,
      })
    );
  } catch (error) {
    console.error('batch confirm error:', error);
    res.status(500).json(fail('批量确认失败'));
  }
});

/**
 * GET /api/records/worker-salary
 * Get worker salary breakdown for a given month
 * Query: workshop_id, year, month
 */
router.get('/worker-salary', async (req: Request, res: Response) => {
  try {
    const { workshop_id, year, month } = req.query;
    if (!workshop_id || !year || !month) {
      res.status(400).json(fail('缺少必要参数'));
      return;
    }

    const y = Number(year);
    const m = Number(month);
    const startDate = `${y}-${String(m).padStart(2, '0')}-01`;
    const lastDay = new Date(y, m, 0).getDate();
    const endDate = `${y}-${String(m).padStart(2, '0')}-${lastDay}`;

    const where: Record<string, unknown> = {
      workshop_id: Number(workshop_id),
      worker_id: req.userId,
      work_date: { [Op.between]: [startDate, endDate] },
    };

    const records = await WorkRecord.findAll({
      where,
      include: [
        {
          model: Step,
          as: 'step',
          attributes: ['id', 'name', 'unit_price'],
          paranoid: false,
          include: [
            { model: Sku, as: 'sku', attributes: ['id', 'name'], paranoid: false },
          ],
        },
      ],
    });

    let totalAmount = 0;
    let settledAmount = 0;
    let pendingAmount = 0;
    const detailMap = new Map<string, { sku_name: string; step_name: string; price: number; quantity: number; amount: number }>();

    for (const r of records) {
      const qty = r.confirmed_quantity ?? r.quantity;
      const price = Number(r.unit_price);
      const amount = qty * price;
      totalAmount += amount;

      if (r.status === 'settled') {
        settledAmount += amount;
      } else {
        pendingAmount += amount;
      }

      const step = r.get('step') as any;
      const skuName = step?.sku?.name || '未知产品';
      const stepName = step?.name || '未知工序';
      const key = `${skuName}|${stepName}`;

      const existing = detailMap.get(key);
      if (existing) {
        existing.quantity += qty;
        existing.amount += amount;
      } else {
        detailMap.set(key, { sku_name: skuName, step_name: stepName, price, quantity: qty, amount });
      }
    }

    const details = Array.from(detailMap.values()).sort((a, b) => b.amount - a.amount);

    res.json(success({
      total: Math.round(totalAmount * 100) / 100,
      settled: Math.round(settledAmount * 100) / 100,
      pending: Math.round(pendingAmount * 100) / 100,
      details,
    }));
  } catch (error) {
    console.error('worker salary error:', error);
    res.status(500).json(fail('获取工资数据失败'));
  }
});

/**
 * GET /api/records/summary
 * Get summary stats for a workshop
 * Query: workshop_id, worker_id, work_date_start, work_date_end
 */
router.get('/summary', async (req: Request, res: Response) => {
  try {
    const { workshop_id, worker_id, work_date_start, work_date_end } = req.query;

    if (!workshop_id) {
      res.status(400).json(fail('缺少工坊ID'));
      return;
    }

    // Check access
    const workshop = await Workshop.findByPk(Number(workshop_id));
    if (!workshop) {
      res.status(404).json(fail('工坊不存在'));
      return;
    }

    const isOwner = workshop.owner_id === req.userId;
    if (!isOwner) {
      const member = await WorkshopMember.findOne({
        where: {
          workshop_id: Number(workshop_id),
          user_id: req.userId,
          status: 'approved',
        },
      });
      if (!member) {
        res.status(403).json(fail('您不是该工坊的成员'));
        return;
      }
    }

    // Build where clause
    const where: Record<string, unknown> = { workshop_id: Number(workshop_id) };

    if (worker_id) {
      where.worker_id = Number(worker_id);
    } else if (!isOwner) {
      where.worker_id = req.userId;
    }

    if (work_date_start && work_date_end) {
      where.work_date = {
        [Op.between]: [work_date_start, work_date_end],
      };
    }

    // Total records count by status
    const totalPending = await WorkRecord.count({ where: { ...where, status: 'pending' } });
    const totalConfirmed = await WorkRecord.count({ where: { ...where, status: 'confirmed' } });
    const totalModified = await WorkRecord.count({ where: { ...where, status: 'modified' } });
    const totalSettled = await WorkRecord.count({ where: { ...where, status: 'settled' } });

    // Calculate total amount for confirmed + modified + settled records
    const confirmedRecords = await WorkRecord.findAll({
      where: {
        ...where,
        status: { [Op.in]: ['confirmed', 'modified', 'settled'] },
      },
      attributes: ['confirmed_quantity', 'unit_price', 'quantity'],
    });

    let totalAmount = 0;
    for (const record of confirmedRecords) {
      const qty = record.confirmed_quantity ?? record.quantity;
      totalAmount += qty * Number(record.unit_price);
    }

    res.json(
      success({
        total_pending: totalPending,
        total_confirmed: totalConfirmed,
        total_modified: totalModified,
        total_settled: totalSettled,
        total_records: totalPending + totalConfirmed + totalModified + totalSettled,
        total_amount: Math.round(totalAmount * 100) / 100,
      })
    );
  } catch (error) {
    console.error('records summary error:', error);
    res.status(500).json(fail('获取汇总数据失败'));
  }
});

export default router;
