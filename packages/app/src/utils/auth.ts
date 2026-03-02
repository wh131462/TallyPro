import { getToken } from './request';

/** 是否为游客模式 */
export function isGuestMode(): boolean {
  return !getToken();
}

/** 需要登录时调用，未登录则跳转登录页并返回 false */
export function requireLogin(): boolean {
  if (getToken()) return true;
  uni.navigateTo({ url: '/pages/welcome/index' });
  return false;
}
