/**
 * Layout utilities for TabBar pages
 */

/**
 * 获取 TabBar 总高度（px），包含安全区域
 * TabBar 可见高度 = 88rpx，加上底部安全区域
 */
export function getTabBarHeightPx(): number {
  try {
    const sys = uni.getSystemInfoSync();
    const safeBottom = sys.safeAreaInsets?.bottom || 0;
    const rpxToPx = sys.screenWidth / 750;
    return Math.ceil(88 * rpxToPx) + safeBottom;
  } catch {
    return 80;
  }
}
