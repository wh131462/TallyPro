<template>
  <view class="welcome">
    <!-- 背景装饰层 -->
    <view class="welcome-bg">
      <view class="deco-ring deco-ring--1" />
      <view class="deco-ring deco-ring--2" />
      <view class="deco-ring deco-ring--3" />
      <view class="deco-line deco-line--l" />
      <view class="deco-line deco-line--r" />
    </view>

    <!-- 品牌标识区（垂直居中） -->
    <view class="brand-area">
      <view class="logo-glow" />
      <image src="/static/logo.svg" class="logo-img" mode="aspectFit" />
      <text class="app-name">计工宝</text>
      <text class="app-name-en">T A L L Y P R O</text>
      <view class="divider" />
      <text class="app-slogan">计件记工 · 轻松管理</text>
    </view>

    <!-- 底部固定操作区 -->
    <view class="action-area">
      <button class="wx-btn" @tap="handleLogin">
        <image src="/static/icons/wechat.svg" class="wx-icon" />
        <text class="wx-btn-text">微信一键登录</text>
      </button>
      <text class="welcome-terms">
        登录即表示同意
        <text class="terms-link" @tap="goTo('/pages/agreement/index')">《用户协议》</text>
        和
        <text class="terms-link" @tap="goTo('/pages/privacy/index')">《隐私政策》</text>
      </text>
      <text class="version-tag">v1.0.0</text>
    </view>
  </view>
</template>

<script setup lang="ts">
import { api } from '../../utils/request';
import { setToken } from '../../utils/request';
import { setUserInfo } from '../../utils/storage';

function goTo(path: string) {
  uni.navigateTo({ url: path });
}

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
    uni.redirectTo({ url: '/pages/role-select/index' });
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

/* ── 入场动画 ── */
@keyframes fadeUp {
  from { opacity: 0; transform: translateY(40rpx); }
  to   { opacity: 1; transform: translateY(0); }
}
@keyframes fadeIn {
  from { opacity: 0; }
  to   { opacity: 1; }
}
@keyframes pulseGlow {
  0%, 100% { opacity: 0.45; transform: translate(-50%, -50%) scale(1); }
  50%      { opacity: 0.65; transform: translate(-50%, -50%) scale(1.08); }
}
@keyframes ringExpand {
  from { opacity: 0.15; transform: translate(-50%, -50%) scale(0.6); }
  to   { opacity: 0; transform: translate(-50%, -50%) scale(1.3); }
}
@keyframes float {
  0%, 100% { transform: translateY(0); }
  50%      { transform: translateY(-12rpx); }
}

/* ── 基础布局 ── */
.welcome {
  height: 100vh;
  overflow: hidden;
  position: relative;
  background: linear-gradient(168deg, #12121E 0%, #1A1A2E 35%, #16162A 65%, #0E0E1A 100%);
}

/* ── 背景装饰 ── */
.welcome-bg {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    top: -10%;
    left: -20%;
    width: 80%;
    height: 60%;
    border-radius: 50%;
    background: radial-gradient(ellipse, rgba(200, 149, 108, 0.18) 0%, transparent 70%);
    filter: blur(20rpx);
    animation: fadeIn 2s ease-out;
  }

  &::after {
    content: '';
    position: absolute;
    bottom: -15%;
    right: -25%;
    width: 90%;
    height: 65%;
    border-radius: 50%;
    background: radial-gradient(ellipse, rgba(91, 141, 184, 0.14) 0%, transparent 70%);
    filter: blur(20rpx);
    animation: fadeIn 2.5s ease-out;
  }
}

.deco-ring {
  position: absolute;
  border-radius: 50%;
  border: 1rpx solid rgba(200, 149, 108, 0.08);

  &--1 {
    width: 600rpx;
    height: 600rpx;
    top: 15%;
    left: 50%;
    transform: translate(-50%, -50%);
    animation: ringExpand 6s ease-out infinite;
  }
  &--2 {
    width: 480rpx;
    height: 480rpx;
    top: 15%;
    left: 50%;
    transform: translate(-50%, -50%);
    animation: ringExpand 6s ease-out 2s infinite;
  }
  &--3 {
    width: 360rpx;
    height: 360rpx;
    top: 15%;
    left: 50%;
    transform: translate(-50%, -50%);
    animation: ringExpand 6s ease-out 4s infinite;
  }
}

.deco-line {
  position: absolute;
  width: 1rpx;
  height: 200rpx;
  background: linear-gradient(to bottom, transparent, rgba(200, 149, 108, 0.12), transparent);

  &--l {
    top: 50%;
    left: 15%;
    transform: rotate(-20deg);
  }
  &--r {
    top: 45%;
    right: 15%;
    transform: rotate(20deg);
  }
}

/* ── 主内容 ── */

/* ── 品牌区域（视觉居中，略偏上） ── */
.brand-area {
  position: absolute;
  top: 38%;
  left: 50%;
  transform: translate(-50%, -50%);
  z-index: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
  padding: 0 80rpx;
}

.logo-glow {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -65%);
  width: 360rpx;
  height: 360rpx;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(74, 222, 128, 0.2) 0%, rgba(22, 163, 74, 0.08) 40%, transparent 70%);
  filter: blur(10rpx);
  animation: pulseGlow 4s ease-in-out infinite;
  pointer-events: none;
}

.logo-img {
  width: 220rpx;
  height: 220rpx;
  animation: fadeUp 0.8s ease-out both, float 5s ease-in-out 1.5s infinite;
}

.app-name {
  font-size: 72rpx;
  font-weight: 800;
  color: #FFFFFF;
  letter-spacing: 10rpx;
  margin-top: 48rpx;
  animation: fadeUp 0.8s ease-out 0.15s both;
}

.app-name-en {
  font-size: 22rpx;
  font-weight: 400;
  color: rgba(200, 149, 108, 0.7);
  letter-spacing: 8rpx;
  margin-top: 16rpx;
  animation: fadeUp 0.8s ease-out 0.3s both;
}

.divider {
  width: 64rpx;
  height: 3rpx;
  border-radius: 2rpx;
  background: linear-gradient(90deg, transparent, rgba(200, 149, 108, 0.6), transparent);
  margin: 36rpx 0;
  animation: fadeIn 1s ease-out 0.5s both;
}

.app-slogan {
  font-size: 26rpx;
  color: rgba(255, 255, 255, 0.45);
  letter-spacing: 6rpx;
  animation: fadeUp 0.8s ease-out 0.45s both;
}

/* ── 底部固定操作区 ── */
.action-area {
  position: fixed;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 2;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 0 80rpx;
  /* iOS safe-area 兼容：constant() 兼容旧版，env() 兼容新版 */
  padding-bottom: 60rpx;
  padding-bottom: calc(constant(safe-area-inset-bottom) + 60rpx);
  padding-bottom: calc(env(safe-area-inset-bottom) + 60rpx);
  animation: fadeUp 0.8s ease-out 0.6s both;
}

.wx-btn {
  width: 100% !important;
  padding: 0 !important;
  height: 100rpx;
  margin: 0;
  background: linear-gradient(135deg, #07C160 0%, #06AD56 100%);
  color: #FFFFFF;
  border: none;
  border-radius: 50rpx;
  font-size: 32rpx;
  font-weight: 600;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 16rpx;
  box-shadow:
    0 8rpx 32rpx rgba(7, 193, 96, 0.3),
    0 2rpx 8rpx rgba(7, 193, 96, 0.2),
    inset 0 1rpx 0 rgba(255, 255, 255, 0.15);
  position: relative;
  overflow: hidden;
  letter-spacing: 2rpx;

  &::after {
    border: none !important;
  }
}

.wx-icon {
  width: 44rpx;
  height: 44rpx;
  flex-shrink: 0;
}

.wx-btn-text {
  font-size: 32rpx;
  font-weight: 600;
  color: #FFFFFF;
}

.welcome-terms {
  font-size: 22rpx;
  color: rgba(255, 255, 255, 0.3);
  margin-top: 32rpx;
  letter-spacing: 1rpx;
  line-height: 1.8;
  text-align: center;
}

.terms-link {
  color: rgba(200, 149, 108, 0.6);
}

.version-tag {
  font-size: 20rpx;
  color: rgba(255, 255, 255, 0.15);
  margin-top: 24rpx;
  letter-spacing: 4rpx;
}
</style>
