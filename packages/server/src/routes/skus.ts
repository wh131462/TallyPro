/**
 * SKU / Product Routes
 * GET    /api/workshops/:workshopId/skus     - List SKUs
 * POST   /api/workshops/:workshopId/skus     - Create SKU (owner only)
 * PUT    /api/skus/:id                       - Update SKU (owner only)
 * DELETE /api/skus/:id                       - Soft delete SKU (owner only)
 */
import { Router, Request, Response } from 'express';
import { Sku, Step, Workshop } from '../models';
import { authRequired } from '../middlewares/auth';
import { workshopMember, workshopOwner } from '../middlewares/workshop';
import { success, fail } from '../utils/response';

const router = Router({ mergeParams: true });

// All SKU routes require auth
router.use(authRequired);

/**
 * GET /api/workshops/:workshopId/skus
 * List all active SKUs for a workshop
 */
router.get('/', workshopMember, async (req: Request, res: Response) => {
  try {
    const { workshopId } = req.params;

    const skus = await Sku.findAll({
      where: { workshop_id: Number(workshopId), is_active: true },
      include: [
        {
          model: Step,
          as: 'steps',
          where: { is_active: true },
          required: false,
          attributes: ['id', 'name', 'unit_price', 'sort_order'],
        },
      ],
      order: [
        ['sort_order', 'ASC'],
        ['created_at', 'ASC'],
        [{ model: Step, as: 'steps' }, 'sort_order', 'ASC'],
      ],
    });

    res.json(success(skus));
  } catch (error) {
    console.error('list skus error:', error);
    res.status(500).json(fail('获取产品列表失败'));
  }
});

/**
 * POST /api/workshops/:workshopId/skus
 * Create a new SKU (owner only)
 */
router.post('/', workshopOwner, async (req: Request, res: Response) => {
  try {
    const { workshopId } = req.params;
    const { name, description, image_url, sort_order } = req.body;

    if (!name || !name.trim()) {
      res.status(400).json(fail('产品名称不能为空'));
      return;
    }

    const sku = await Sku.create({
      workshop_id: Number(workshopId),
      name: name.trim(),
      description: description || '',
      image_url: image_url || '',
      sort_order: sort_order || 0,
      is_active: true,
    });

    res.json(success(sku));
  } catch (error) {
    console.error('create sku error:', error);
    res.status(500).json(fail('创建产品失败'));
  }
});

/**
 * GET /api/skus/:id
 * Get SKU detail by ID
 */
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const sku = await Sku.findByPk(Number(req.params.id), {
      include: [
        {
          model: Step,
          as: 'steps',
          where: { is_active: true },
          required: false,
          attributes: ['id', 'name', 'unit_price', 'sort_order'],
        },
      ],
    });
    if (!sku) {
      res.status(404).json(fail('产品不存在'));
      return;
    }
    res.json(success(sku));
  } catch (error) {
    console.error('get sku detail error:', error);
    res.status(500).json(fail('获取产品详情失败'));
  }
});

/**
 * PUT /api/skus/:id
 * Update SKU (owner only)
 */
router.put('/:id', async (req: Request, res: Response) => {
  try {
    const sku = await Sku.findByPk(Number(req.params.id));
    if (!sku) {
      res.status(404).json(fail('产品不存在'));
      return;
    }

    // Check ownership
    const workshop = await Workshop.findByPk(sku.workshop_id);
    if (!workshop || workshop.owner_id !== req.userId) {
      res.status(403).json(fail('仅企业所有者可修改产品'));
      return;
    }

    const { name, description, image_url, sort_order, is_active } = req.body;

    const updates: Record<string, unknown> = {};
    if (name !== undefined) updates.name = name.trim();
    if (description !== undefined) updates.description = description;
    if (image_url !== undefined) updates.image_url = image_url;
    if (sort_order !== undefined) updates.sort_order = sort_order;
    if (is_active !== undefined) updates.is_active = is_active;

    await sku.update(updates);

    res.json(success(sku));
  } catch (error) {
    console.error('update sku error:', error);
    res.status(500).json(fail('更新产品失败'));
  }
});

/**
 * DELETE /api/skus/:id
 * Soft delete SKU (owner only, uses paranoid mode)
 */
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const sku = await Sku.findByPk(Number(req.params.id));
    if (!sku) {
      res.status(404).json(fail('产品不存在'));
      return;
    }

    // Check ownership
    const workshop = await Workshop.findByPk(sku.workshop_id);
    if (!workshop || workshop.owner_id !== req.userId) {
      res.status(403).json(fail('仅企业所有者可删除产品'));
      return;
    }

    // Soft delete (paranoid mode)
    await sku.destroy();

    res.json(success({ message: '产品已删除' }));
  } catch (error) {
    console.error('delete sku error:', error);
    res.status(500).json(fail('删除产品失败'));
  }
});

export default router;
