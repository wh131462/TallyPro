<template>
  <view class="welcome">
    <view class="welcome-bg">
      <view class="logo-mark">
        <image src="/static/icons/logo.svg" class="logo-icon" />
      </view>
      <text class="app-name">计工宝</text>
      <text class="app-name-en">TALLYPRO</text>
      <text class="app-slogan">计件记工 · 轻松管理</text>
      <button class="wx-btn" @tap="handleLogin">
        <image src="/static/icons/wechat.svg" class="wx-icon" />
        <text>微信一键登录</text>
      </button>
      <text class="welcome-terms">登录即表示同意《用户协议》和《隐私政策》</text>
    </view>
  </view>
</template>

<script setup lang="ts">
import { api } from '../../utils/request';
import { setToken } from '../../utils/request';
import { setUserInfo } from '../../utils/storage';

function handleLogin() {
  // #ifdef MP-WEIXIN
  uni.login({
    provider: 'weixin',
    success(loginRes) {
      if (loginRes.code) {
        wxLogin(loginRes.code);
      }
    },
    fail() {
      uni.showToast({ title: '微信登录失败', icon: 'none' });
    },
  });
  // #endif

  // #ifdef H5
  mockLogin();
  // #endif
}

async function wxLogin(code: string) {
  try {
    const res = await api.post<{ token: string; user: any; isNew: boolean }>('/auth/wx-login', { code });
    setToken(res.data.token);
    setUserInfo(res.data.user);
    if (res.data.isNew || !res.data.user.phone) {
      uni.redirectTo({ url: '/pages/login/index' });
    } else {
      uni.redirectTo({ url: '/pages/role-select/index' });
    }
  } catch (e) {
    console.error(e);
  }
}

async function mockLogin() {
  try {
    const res = await api.post<{ token: string; user: any; isNew: boolean }>('/auth/wx-login', { code: 'mock_code' });
    setToken(res.data.token);
    setUserInfo(res.data.user);
    uni.redirectTo({ url: '/pages/role-select/index' });
  } catch {
    uni.redirectTo({ url: '/pages/role-select/index' });
  }
}
</script>

<style lang="scss" scoped>
@use '../../static/styles/theme.scss' as *;

.welcome {
  height: 100vh;
  overflow: hidden;
}

.welcome-bg {
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 80rpx 64rpx;
  position: relative;
  overflow: hidden;
  background:
    radial-gradient(ellipse at 30% 20%, rgba(200,149,108,0.4) 0%, transparent 50%),
    radial-gradient(ellipse at 70% 80%, rgba(91,141,184,0.3) 0%, transparent 50%),
    linear-gradient(160deg, #1E1E2A 0%, #2A2A3C 40%, #1E1E2A 100%);
}

.logo-mark {
  width: 160rpx;
  height: 160rpx;
  border: 5rpx solid rgba(255,255,255,0.25);
  border-radius: 48rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 48rpx;
  background: rgba(255,255,255,0.06);
}

.logo-icon {
  width: 76rpx;
  height: 76rpx;
}

.app-name {
  font-size: 64rpx;
  font-weight: 900;
  color: #fff;
  letter-spacing: 6rpx;
}

.app-name-en {
  font-size: 26rpx;
  font-weight: 500;
  color: rgba(255,255,255,0.5);
  letter-spacing: 12rpx;
  text-transform: uppercase;
  margin-top: 8rpx;
}

.app-slogan {
  font-size: 28rpx;
  color: rgba(255,255,255,0.6);
  margin-top: 8rpx;
  margin-bottom: 112rpx;
  letter-spacing: 4rpx;
}

.wx-btn {
  width: 100%;
  padding: 30rpx;
  background: #07C160;
  color: #fff;
  border: none;
  border-radius: $radius-sm;
  font-size: 30rpx;
  font-weight: 600;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 16rpx;
  box-shadow: 0 8rpx 40rpx rgba(7,193,96,0.3);
}

.wx-btn::after {
  border: none;
}

.wx-icon {
  width: 40rpx;
  height: 40rpx;
}

.welcome-terms {
  font-size: 22rpx;
  color: rgba(255,255,255,0.4);
  margin-top: 36rpx;
  letter-spacing: 1rpx;
}
</style>
