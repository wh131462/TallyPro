/**
 * Auth Routes
 * POST /api/auth/wx-login    - WeChat login
 * PUT  /api/auth/profile     - Update user profile (requires auth)
 * GET  /api/auth/profile     - Get current user profile (requires auth)
 */
import { Router, Request, Response } from 'express';
import { User } from '../models';
import { authRequired, signToken } from '../middlewares/auth';
import { success, fail } from '../utils/response';

const router = Router();

/**
 * POST /api/auth/wx-login
 * Receive WeChat code, exchange for openid, create/find user, return JWT
 */
router.post('/wx-login', async (req: Request, res: Response) => {
  try {
    const { code } = req.body;

    if (!code) {
      res.status(400).json(fail('缺少微信登录code'));
      return;
    }

    // Exchange code for openid via WeChat API
    const appId = process.env.WX_APP_ID;
    const appSecret = process.env.WX_APP_SECRET;

    let openid: string;

    if (appId && appSecret) {
      // Production: call WeChat API
      const wxUrl = `https://api.weixin.qq.com/sns/jscode2session?appid=${appId}&secret=${appSecret}&js_code=${code}&grant_type=authorization_code`;

      const response = await fetch(wxUrl);
      const wxData = await response.json() as { openid?: string; errcode?: number; errmsg?: string };

      if (wxData.errcode || !wxData.openid) {
        res.status(400).json(fail(wxData.errmsg || '微信登录失败'));
        return;
      }

      openid = wxData.openid;
    } else {
      // Development: use code as mock openid
      openid = `dev_${code}`;
    }

    // Find or create user
    const [user, created] = await User.findOrCreate({
      where: { openid },
      defaults: {
        openid,
        nickname: `用户${Date.now().toString().slice(-6)}`,
        phone: '',
        avatar_url: '',
      },
    });

    // Sign JWT
    const token = signToken({ id: user.id, openid: user.openid });

    res.json(
      success({
        token,
        isNew: created,
        user: {
          id: user.id,
          openid: user.openid,
          nickname: user.nickname,
          phone: user.phone,
          avatar_url: user.avatar_url,
        },
      })
    );
  } catch (error) {
    console.error('wx-login error:', error);
    res.status(500).json(fail('登录失败'));
  }
});

/**
 * PUT /api/auth/profile
 * Update current user profile (nickname, avatar_url) (requires auth)
 */
router.put('/profile', authRequired, async (req: Request, res: Response) => {
  try {
    const { nickname, avatar_url } = req.body;

    const user = await User.findByPk(req.userId);
    if (!user) {
      res.status(404).json(fail('用户不存在'));
      return;
    }

    const updates: Record<string, unknown> = {};
    if (nickname !== undefined) {
      if (!nickname.trim()) {
        res.status(400).json(fail('昵称不能为空'));
        return;
      }
      updates.nickname = nickname.trim();
    }
    if (avatar_url !== undefined) {
      updates.avatar_url = avatar_url;
    }

    if (Object.keys(updates).length === 0) {
      res.status(400).json(fail('没有需要更新的字段'));
      return;
    }

    await user.update(updates);

    res.json(
      success({
        id: user.id,
        nickname: user.nickname,
        avatar_url: user.avatar_url,
      })
    );
  } catch (error) {
    console.error('update profile error:', error);
    res.status(500).json(fail('更新个人信息失败'));
  }
});

/**
 * GET /api/auth/profile
 * Get current user profile (requires auth)
 */
router.get('/profile', authRequired, async (req: Request, res: Response) => {
  try {
    const user = await User.findByPk(req.userId);
    if (!user) {
      res.status(404).json(fail('用户不存在'));
      return;
    }

    res.json(
      success({
        id: user.id,
        openid: user.openid,
        nickname: user.nickname,
        phone: user.phone,
        avatar_url: user.avatar_url,
        created_at: user.created_at,
      })
    );
  } catch (error) {
    console.error('profile error:', error);
    res.status(500).json(fail('获取用户信息失败'));
  }
});

export default router;
