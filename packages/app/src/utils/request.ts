const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8866/api';

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

/**
 * 选择并上传图片（支持拍照和相册）
 * 返回服务器上的图片 URL
 */
export function chooseAndUploadImage(): Promise<string> {
  return new Promise((resolve, reject) => {
    uni.chooseImage({
      count: 1,
      sizeType: ['compressed'],
      sourceType: ['album', 'camera'],
      success(chooseRes) {
        const tempFilePath = chooseRes.tempFilePaths[0];
        const token = getToken();
        uni.uploadFile({
          url: `${BASE_URL}/upload`,
          filePath: tempFilePath,
          name: 'file',
          header: token ? { Authorization: `Bearer ${token}` } : {},
          success(uploadRes) {
            try {
              const data = JSON.parse(uploadRes.data) as ApiResponse<{ url: string }>;
              if (data.code === 0) {
                resolve(data.data.url);
              } else {
                uni.showToast({ title: data.message || '上传失败', icon: 'none' });
                reject(new Error(data.message));
              }
            } catch {
              uni.showToast({ title: '上传结果解析失败', icon: 'none' });
              reject(new Error('parse error'));
            }
          },
          fail() {
            uni.showToast({ title: '上传失败', icon: 'none' });
            reject(new Error('upload failed'));
          },
        });
      },
      fail() {
        // User cancelled, do not show error
        reject(new Error('cancelled'));
      },
    });
  });
}

/**
 * 将相对路径的图片 URL 转为完整 URL
 */
export function getImageUrl(path: string): string {
  if (!path) return '';
  if (path.startsWith('http')) return path;
  // BASE_URL 末尾是 /api，需要去掉 /api
  const origin = BASE_URL.replace(/\/api$/, '');
  return `${origin}${path}`;
}
