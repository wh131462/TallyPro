const BASE_URL = 'http://localhost:3000/api';

interface RequestOptions {
  url: string;
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
  data?: Record<string, unknown>;
  header?: Record<string, string>;
}

interface ApiResponse<T = unknown> {
  code: number;
  message: string;
  data: T;
}

export function getToken(): string {
  return uni.getStorageSync('token') || '';
}

export function setToken(token: string) {
  uni.setStorageSync('token', token);
}

export function removeToken() {
  uni.removeStorageSync('token');
}

export function request<T = unknown>(options: RequestOptions): Promise<ApiResponse<T>> {
  return new Promise((resolve, reject) => {
    const token = getToken();
    uni.request({
      url: `${BASE_URL}${options.url}`,
      method: options.method || 'GET',
      data: options.data,
      header: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...options.header,
      },
      success(res) {
        const data = res.data as ApiResponse<T>;
        if (data.code === 0) {
          resolve(data);
        } else if (data.code === 401) {
          removeToken();
          uni.reLaunch({ url: '/pages/welcome/index' });
          reject(new Error(data.message));
        } else {
          uni.showToast({ title: data.message || '请求失败', icon: 'none' });
          reject(new Error(data.message));
        }
      },
      fail(err) {
        uni.showToast({ title: '网络错误', icon: 'none' });
        reject(err);
      },
    });
  });
}

export const api = {
  get: <T>(url: string, data?: Record<string, unknown>) => request<T>({ url, method: 'GET', data }),
  post: <T>(url: string, data?: Record<string, unknown>) => request<T>({ url, method: 'POST', data }),
  put: <T>(url: string, data?: Record<string, unknown>) => request<T>({ url, method: 'PUT', data }),
  del: <T>(url: string, data?: Record<string, unknown>) => request<T>({ url, method: 'DELETE', data }),
};
