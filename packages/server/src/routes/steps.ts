/**
 * Step / Process Routes
 * GET    /api/skus/:skuId/steps    - List steps for a SKU
 * POST   /api/skus/:skuId/steps    - Create step (owner only)
 * PUT    /api/steps/:id            - Update step (owner only)
 * DELETE /api/steps/:id            - Soft delete step (owner only)
 */
import { Router, Request, Response } from 'express';
import { Step, Sku, Workshop, PriceHistory, OperationLog } from '../models';
import { authRequired } from '../middlewares/auth';
import { success, fail } from '../utils/response';
import { getToday } from '../utils/helpers';

const router = Router({ mergeParams: true });

// All step routes require auth
router.use(authRequired);

/**
 * GET /api/skus/:skuId/steps
 * List all active steps for a SKU
 */
router.get('/', async (req: Request, res: Response) => {
  try {
    const { skuId } = req.params;

    const sku = await Sku.findByPk(Number(skuId));
    if (!sku) {
      res.status(404).json(fail('产品不存在'));
      return;
    }

    const steps = await Step.findAll({
      where: { sku_id: Number(skuId), is_active: true },
      include: [
        {
          model: PriceHistory,
          as: 'priceHistories',
          attributes: ['id', 'price', 'effective_date', 'created_at'],
          order: [['effective_date', 'DESC']],
          limit: 10,
          separate: true,
        },
      ],
      order: [['sort_order', 'ASC'], ['created_at', 'ASC']],
    });

    res.json(success(steps));
  } catch (error) {
    console.error('list steps error:', error);
    res.status(500).json(fail('获取工序列表失败'));
  }
});

/**
 * POST /api/skus/:skuId/steps
 * Create a new step (owner only)
 */
router.post('/', async (req: Request, res: Response) => {
  try {
    const { skuId } = req.params;
    const { name, unit_price, sort_order } = req.body;

    if (!name || !name.trim()) {
      res.status(400).json(fail('工序名称不能为空'));
      return;
    }

    if (unit_price === undefined || unit_price === null || Number(unit_price) < 0) {
      res.status(400).json(fail('单价不能为空且不能为负数'));
      return;
    }

    // Check SKU exists and user is owner
    const sku = await Sku.findByPk(Number(skuId));
    if (!sku) {
      res.status(404).json(fail('产品不存在'));
      return;
    }

    const workshop = await Workshop.findByPk(sku.workshop_id);
    if (!workshop || workshop.owner_id !== req.userId) {
      res.status(403).json(fail('仅工坊所有者可添加工序'));
      return;
    }

    const step = await Step.create({
      sku_id: Number(skuId),
      name: name.trim(),
      unit_price: Number(unit_price),
      sort_order: sort_order || 0,
      is_active: true,
    });

    // Create initial price history
    await PriceHistory.create({
      step_id: step.id,
      price: Number(unit_price),
      effective_date: getToday(),
    });

    res.json(success(step));
  } catch (error) {
    console.error('create step error:', error);
    res.status(500).json(fail('创建工序失败'));
  }
});

/**
 * PUT /api/steps/:id
 * Update step, including price change with history (owner only)
 */
router.put('/:id', async (req: Request, res: Response) => {
  try {
    const step = await Step.findByPk(Number(req.params.id));
    if (!step) {
      res.status(404).json(fail('工序不存在'));
      return;
    }

    // Check ownership through SKU -> Workshop
    const sku = await Sku.findByPk(step.sku_id);
    if (!sku) {
      res.status(404).json(fail('关联产品不存在'));
      return;
    }

    const workshop = await Workshop.findByPk(sku.workshop_id);
    if (!workshop || workshop.owner_id !== req.userId) {
      res.status(403).json(fail('仅工坊所有者可修改工序'));
      return;
    }

    const { name, unit_price, sort_order, is_active } = req.body;

    const updates: Record<string, unknown> = {};
    const beforeData: Record<string, unknown> = {};

    if (name !== undefined) {
      beforeData.name = step.name;
      updates.name = name.trim();
    }
    if (sort_order !== undefined) {
      updates.sort_order = sort_order;
    }
    if (is_active !== undefined) {
      updates.is_active = is_active;
    }

    // Handle price change with history
    if (unit_price !== undefined && Number(unit_price) !== Number(step.unit_price)) {
      beforeData.unit_price = step.unit_price;
      updates.unit_price = Number(unit_price);

      // Create price history record
      await PriceHistory.create({
        step_id: step.id,
        price: Number(unit_price),
        effective_date: getToday(),
      });

      // Log price change
      await OperationLog.create({
        operator_id: req.userId!,
        workshop_id: workshop.id,
        action: 'change_price',
        target_type: 'step',
        target_id: step.id,
        before_data: { unit_price: step.unit_price },
        after_data: { unit_price: Number(unit_price) },
        remark: `工序「${step.name}」单价从 ${step.unit_price} 调整为 ${unit_price}`,
      });
    }

    await step.update(updates);

    res.json(success(step));
  } catch (error) {
    console.error('update step error:', error);
    res.status(500).json(fail('更新工序失败'));
  }
});

/**
 * DELETE /api/steps/:id
 * Soft delete step (owner only, uses paranoid mode)
 */
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const step = await Step.findByPk(Number(req.params.id));
    if (!step) {
      res.status(404).json(fail('工序不存在'));
      return;
    }

    // Check ownership
    const sku = await Sku.findByPk(step.sku_id);
    if (!sku) {
      res.status(404).json(fail('关联产品不存在'));
      return;
    }

    const workshop = await Workshop.findByPk(sku.workshop_id);
    if (!workshop || workshop.owner_id !== req.userId) {
      res.status(403).json(fail('仅工坊所有者可删除工序'));
      return;
    }

    // Soft delete (paranoid mode)
    await step.destroy();

    res.json(success({ message: '工序已删除' }));
  } catch (error) {
    console.error('delete step error:', error);
    res.status(500).json(fail('删除工序失败'));
  }
});

export default router;
