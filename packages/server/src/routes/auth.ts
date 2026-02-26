/**
 * Auth Routes
 * POST /api/auth/wx-login    - WeChat login
 * POST /api/auth/bind-phone  - Bind phone number (requires auth)
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
        nickname: '',
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
 * POST /api/auth/bind-phone
 * Bind phone number to current user (requires auth)
 */
router.post('/bind-phone', authRequired, async (req: Request, res: Response) => {
  try {
    const { phone } = req.body;

    if (!phone) {
      res.status(400).json(fail('缺少手机号'));
      return;
    }

    // Validate phone format (Chinese mobile)
    if (!/^1[3-9]\d{9}$/.test(phone)) {
      res.status(400).json(fail('手机号格式不正确'));
      return;
    }

    const user = await User.findByPk(req.userId);
    if (!user) {
      res.status(404).json(fail('用户不存在'));
      return;
    }

    // Check if phone is already used by another user
    const existing = await User.findOne({ where: { phone } });
    if (existing && existing.id !== req.userId) {
      res.status(400).json(fail('该手机号已被其他用户绑定'));
      return;
    }

    await user.update({ phone });

    res.json(
      success({
        id: user.id,
        phone: user.phone,
      })
    );
  } catch (error) {
    console.error('bind-phone error:', error);
    res.status(500).json(fail('绑定手机号失败'));
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
