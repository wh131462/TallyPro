/**
 * 分享图片缓存 & Canvas 绘制
 */

/** 缓存生成的分享图片路径 */
let _cachedShareImage = '';

export function getShareImagePath(): string {
  return _cachedShareImage || '/static/logo.png';
}

/** 分享配置 */
export function getShareConfig(options?: { title?: string; path?: string }) {
  const title = options?.title || '计工宝 - 计件记工，轻松管理';
  const path = options?.path || '/pages/landing/index';
  return {
    appMessage: () => ({
      title,
      path,
      imageUrl: getShareImagePath(),
    }),
    timeline: () => ({
      title,
      imageUrl: getShareImagePath(),
    }),
  };
}

/** 绘制半透明圆形光晕 */
function drawGlow(ctx: UniApp.CanvasContext, cx: number, cy: number, r: number, color: string, layers: number) {
  for (let i = layers; i > 0; i--) {
    const ratio = i / layers;
    const alpha = ratio * 0.15;
    ctx.setFillStyle(color.replace(/[\d.]+\)$/, `${alpha})`));
    ctx.beginPath();
    ctx.arc(cx, cy, r * ratio, 0, Math.PI * 2);
    ctx.fill();
  }
}

/**
 * 使用 Canvas 绘制精美分享卡片
 * Canvas 尺寸 500x400 (5:4 微信分享比例)
 */
export function generateShareCard(instance: any): Promise<string> {
  if (_cachedShareImage) return Promise.resolve(_cachedShareImage);

  return new Promise((resolve) => {
    const ctx = uni.createCanvasContext('shareCanvas', instance);
    const W = 500;
    const H = 400;

    // ── 背景渐变 ──
    const bgGrad = ctx.createLinearGradient(0, 0, W, H);
    bgGrad.addColorStop(0, '#1E1E2A');
    bgGrad.addColorStop(0.5, '#2A2A3C');
    bgGrad.addColorStop(1, '#1A1A28');
    ctx.setFillStyle(bgGrad as any);
    ctx.fillRect(0, 0, W, H);

    // ── 装饰光晕 ──
    drawGlow(ctx, 150, 120, 180, 'rgba(200, 149, 108, 0)', 8);
    drawGlow(ctx, 380, 300, 150, 'rgba(91, 141, 184, 0)', 6);

    // ── 顶部装饰线 ──
    ctx.setStrokeStyle('rgba(200, 149, 108, 0.15)');
    ctx.setLineWidth(1);
    ctx.beginPath();
    ctx.moveTo(160, 60);
    ctx.lineTo(340, 60);
    ctx.stroke();

    // ── 装饰菱形 ──
    ctx.setFillStyle('rgba(200, 149, 108, 0.5)');
    ctx.save();
    ctx.translate(250, 60);
    ctx.rotate(Math.PI / 4);
    ctx.fillRect(-4, -4, 8, 8);
    ctx.restore();

    // ── Logo ──
    ctx.drawImage('/static/logo.png', 190, 80, 120, 120);

    // ── 应用名称 ──
    ctx.setFillStyle('#FFFFFF');
    ctx.setFontSize(36);
    ctx.setTextAlign('center');
    ctx.fillText('计工宝', 250, 240);

    // ── 英文名 ──
    ctx.setFillStyle('rgba(200, 149, 108, 0.7)');
    ctx.setFontSize(14);
    ctx.fillText('T A L L Y   P R O', 250, 262);

    // ── 中间装饰线 ──
    ctx.setStrokeStyle('rgba(200, 149, 108, 0.3)');
    ctx.setLineWidth(1.5);
    ctx.beginPath();
    ctx.moveTo(190, 280);
    ctx.lineTo(310, 280);
    ctx.stroke();

    // ── 中间菱形 ──
    ctx.setFillStyle('rgba(200, 149, 108, 0.6)');
    ctx.save();
    ctx.translate(250, 280);
    ctx.rotate(Math.PI / 4);
    ctx.fillRect(-3, -3, 6, 6);
    ctx.restore();

    // ── 标语 ──
    ctx.setFillStyle('rgba(255, 255, 255, 0.45)');
    ctx.setFontSize(16);
    ctx.setTextAlign('center');
    ctx.fillText('计件记工 · 轻松管理', 250, 310);

    // ── 底部装饰线 ──
    ctx.setStrokeStyle('rgba(200, 149, 108, 0.1)');
    ctx.setLineWidth(1);
    ctx.beginPath();
    ctx.moveTo(180, 350);
    ctx.lineTo(320, 350);
    ctx.stroke();

    // ── 底部装饰文字 ──
    ctx.setFillStyle('rgba(255, 255, 255, 0.12)');
    ctx.setFontSize(11);
    ctx.fillText('专为小型制造业企业设计', 250, 370);

    // ── 绘制并导出 ──
    ctx.draw(false, () => {
      setTimeout(() => {
        uni.canvasToTempFilePath({
          canvasId: 'shareCanvas',
          width: W,
          height: H,
          destWidth: W * 2,
          destHeight: H * 2,
          quality: 1,
          success(res) {
            _cachedShareImage = res.tempFilePath;
            resolve(res.tempFilePath);
          },
          fail() {
            resolve('/static/logo.png');
          },
        }, instance);
      }, 300);
    });
  });
}
