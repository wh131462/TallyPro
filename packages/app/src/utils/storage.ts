export interface UserInfo {
  id: number;
  openid: string;
  phone: string;
  nickname: string;
  avatar_url: string;
}

export interface WorkshopInfo {
  id: number;
  name: string;
  role: 'owner' | 'worker';
  logo_url?: string;
}

export function getUserInfo(): UserInfo | null {
  const data = uni.getStorageSync('userInfo');
  return data ? JSON.parse(data) : null;
}

export function setUserInfo(info: UserInfo) {
  uni.setStorageSync('userInfo', JSON.stringify(info));
}

export function getCurrentWorkshop(): WorkshopInfo | null {
  const data = uni.getStorageSync('currentWorkshop');
  return data ? JSON.parse(data) : null;
}

export function setCurrentWorkshop(info: WorkshopInfo) {
  uni.setStorageSync('currentWorkshop', JSON.stringify(info));
}

export function clearAll() {
  uni.clearStorageSync();
}
