/**
 * Workshop Permission Middleware
 * These middlewares require authRequired to run first.
 */
import { Request, Response, NextFunction } from 'express';
import { Workshop, WorkshopMember } from '../models';
import { fail } from '../utils/response';

/**
 * Check that the current user is an approved member of the workshop.
 * Workshop ID is read from req.params.workshopId or req.params.id or req.body.workshop_id.
 */
export function workshopMember(req: Request, res: Response, next: NextFunction): void {
  (async () => {
    try {
      const workshopId = Number(
        req.params.workshopId || req.params.id || req.body.workshop_id
      );

      if (!workshopId) {
        res.status(400).json(fail('缺少工坊ID'));
        return;
      }

      const workshop = await Workshop.findByPk(workshopId);
      if (!workshop) {
        res.status(404).json(fail('工坊不存在'));
        return;
      }

      // Owner is always a member
      if (workshop.owner_id === req.userId) {
        next();
        return;
      }

      // Check membership
      const member = await WorkshopMember.findOne({
        where: {
          workshop_id: workshopId,
          user_id: req.userId,
          status: 'approved',
        },
      });

      if (!member) {
        res.status(403).json(fail('您不是该工坊的成员'));
        return;
      }

      next();
    } catch (error) {
      res.status(500).json(fail('权限检查失败'));
    }
  })();
}

/**
 * Check that the current user is the owner of the workshop.
 * Workshop ID is read from req.params.workshopId or req.params.id or req.body.workshop_id.
 */
export function workshopOwner(req: Request, res: Response, next: NextFunction): void {
  (async () => {
    try {
      const workshopId = Number(
        req.params.workshopId || req.params.id || req.body.workshop_id
      );

      if (!workshopId) {
        res.status(400).json(fail('缺少工坊ID'));
        return;
      }

      const workshop = await Workshop.findByPk(workshopId);
      if (!workshop) {
        res.status(404).json(fail('工坊不存在'));
        return;
      }

      if (workshop.owner_id !== req.userId) {
        res.status(403).json(fail('仅工坊所有者可执行此操作'));
        return;
      }

      next();
    } catch (error) {
      res.status(500).json(fail('权限检查失败'));
    }
  })();
}
