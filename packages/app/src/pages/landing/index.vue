<template>
  <view class="landing-page">
    <!-- Hero -->
    <view class="hero">
      <view class="hero-bg"></view>
      <view class="hero-ornament">
        <view class="ornament-line"></view>
        <view class="ornament-diamond"></view>
        <view class="ornament-line"></view>
      </view>
      <view class="hero-logo">
        <image src="/static/logo.svg" class="logo-img" mode="aspectFit" />
      </view>
      <text class="hero-name">计工宝</text>
      <text class="hero-en">TALLY PRO</text>
      <view class="hero-ornament">
        <view class="ornament-line"></view>
        <view class="ornament-diamond"></view>
        <view class="ornament-line"></view>
      </view>
    </view>

    <!-- Mission -->
    <view class="mission">
      <view class="mission-accent"></view>
      <view class="mission-body">
        <text class="mission-title">让计件管理更简单</text>
        <text class="mission-text">专为小型制造业企业设计的计件工资管理工具</text>
      </view>
    </view>

    <!-- Role Select -->
    <view class="role-section">
      <view class="role-header">
        <view class="role-line"></view>
        <text class="role-label">选择身份体验</text>
        <view class="role-line"></view>
      </view>
      <view class="role-cards">
        <view class="role-card" @tap="enterPreview('owner')">
          <view class="role-icon" style="background: rgba(200,149,108,0.12);">
            <image src="/static/icons/factory.svg" class="role-icon-img" />
          </view>
          <view class="role-text">
            <text class="role-name">我是企业主</text>
            <text class="role-desc">管理企业、审核记录、结算工资</text>
          </view>
          <text class="role-arrow">&#8250;</text>
        </view>
        <view class="role-card" @tap="enterPreview('worker')">
          <view class="role-icon" style="background: #E8F2EC;">
            <image src="/static/icons/worker.svg" class="role-icon-img" />
          </view>
          <view class="role-text">
            <text class="role-name">我是员工</text>
            <text class="role-desc">每日填报工量、查看工资明细</text>
          </view>
          <text class="role-arrow">&#8250;</text>
        </view>
      </view>
    </view>

    <!-- Login Link -->
    <view class="login-link" @tap="goLogin">
      <text class="login-link-text">已有账号？</text>
      <text class="login-link-action">立即登录</text>
    </view>

    <!-- Footer -->
    <view class="footer">
      <text class="footer-copy">&copy; 2025 计工宝 All Rights Reserved</text>
    </view>
  </view>
</template>

<script setup lang="ts">
import { onShow } from '@dcloudio/uni-app';
import { getToken } from '../../utils/request';
import { getCurrentWorkshop, setCurrentWorkshop } from '../../utils/storage';

onShow(() => {
  const token = getToken();
  if (!token) return;
  const ws = getCurrentWorkshop();
  if (ws && ws.id !== 0) {
    const url = ws.role === 'owner'
      ? '/pages/admin/dashboard/index'
      : '/pages/worker/worklog/index';
    uni.reLaunch({ url });
  } else {
    uni.redirectTo({ url: '/pages/role-select/index' });
  }
});

function enterPreview(role: 'owner' | 'worker') {
  setCurrentWorkshop({ id: 0, name: '体验模式', role });
  const url = role === 'owner'
    ? '/pages/admin/dashboard/index'
    : '/pages/worker/worklog/index';
  uni.reLaunch({ url });
}

function goLogin() {
  uni.navigateTo({ url: '/pages/welcome/index' });
}
</script>

<style lang="scss" scoped>
@use '../../static/styles/theme.scss' as *;

.landing-page {
  min-height: 100vh;
  background: $cream;
}

// ── Hero ──
.hero {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 80rpx 48rpx 48rpx;
  overflow: hidden;
}

.hero-bg {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background:
    radial-gradient(ellipse at 50% 20%, rgba(200, 149, 108, 0.15) 0%, transparent 60%),
    radial-gradient(ellipse at 80% 80%, rgba(107, 155, 123, 0.08) 0%, transparent 50%),
    $cream;
}

.hero-ornament {
  display: flex;
  align-items: center;
  gap: 16rpx;
  position: relative;
  z-index: 1;
}

.ornament-line {
  width: 80rpx;
  height: 2rpx;
  background: linear-gradient(90deg, transparent, $amber-light, transparent);
}

.ornament-diamond {
  width: 12rpx;
  height: 12rpx;
  background: $amber;
  transform: rotate(45deg);
  opacity: 0.6;
}

.hero-logo {
  width: 160rpx;
  height: 160rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 32rpx 0 24rpx;
  position: relative;
  z-index: 1;
}

.logo-img {
  width: 160rpx;
  height: 160rpx;
}

.hero-name {
  display: block;
  font-size: 52rpx;
  font-weight: 800;
  color: $ink;
  letter-spacing: 8rpx;
  position: relative;
  z-index: 1;
}

.hero-en {
  display: block;
  font-size: 22rpx;
  font-weight: 500;
  color: $amber;
  letter-spacing: 12rpx;
  margin-top: 8rpx;
  margin-bottom: 32rpx;
  position: relative;
  z-index: 1;
  opacity: 0.7;
}

// ── Mission ──
.mission {
  margin: 0 36rpx;
  display: flex;
  gap: 24rpx;
  background: $surface;
  border-radius: $radius-lg;
  padding: 36rpx 32rpx;
  box-shadow: $shadow-sm;
  border: 1rpx solid rgba(200, 149, 108, 0.08);
}

.mission-accent {
  width: 6rpx;
  border-radius: 6rpx;
  background: linear-gradient(180deg, $amber 0%, $amber-deep 100%);
  flex-shrink: 0;
}

.mission-body {
  flex: 1;
}

.mission-title {
  display: block;
  font-size: 30rpx;
  font-weight: 700;
  color: $ink;
  margin-bottom: 12rpx;
  letter-spacing: 2rpx;
}

.mission-text {
  display: block;
  font-size: 25rpx;
  color: $ink-muted;
  line-height: 1.8;
}

// ── Role Select ──
.role-section {
  padding: 0 36rpx;
  margin-top: 48rpx;
}

.role-header {
  display: flex;
  align-items: center;
  gap: 24rpx;
  justify-content: center;
  margin-bottom: 28rpx;
}

.role-line {
  width: 64rpx;
  height: 2rpx;
  background: linear-gradient(90deg, transparent, $cream-deep, transparent);
}

.role-label {
  font-size: 26rpx;
  font-weight: 600;
  color: $ink-muted;
  letter-spacing: 6rpx;
}

.role-cards {
  display: flex;
  flex-direction: column;
  gap: 24rpx;
}

.role-card {
  background: $surface;
  border-radius: $radius-lg;
  padding: 48rpx 40rpx;
  display: flex;
  align-items: center;
  gap: 36rpx;
  box-shadow: $shadow-md;
  border: 4rpx solid transparent;
  transition: all 0.15s;

  &:active {
    border-color: $amber-light;
    box-shadow: $shadow-lg;
  }
}

.role-icon {
  width: 112rpx;
  height: 112rpx;
  border-radius: 32rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.role-icon-img {
  width: 52rpx;
  height: 52rpx;
}

.role-text {
  flex: 1;
}

.role-name {
  display: block;
  font-size: 36rpx;
  font-weight: 700;
  color: $ink;
  margin-bottom: 8rpx;
}

.role-desc {
  display: block;
  font-size: 24rpx;
  color: $ink-faint;
  line-height: 1.6;
}

.role-arrow {
  font-size: 44rpx;
  color: $ink-faint;
  flex-shrink: 0;
}

// ── Login Link ──
.login-link {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8rpx;
  margin-top: 48rpx;
  padding: 24rpx 0;
}

.login-link-text {
  font-size: 26rpx;
  color: $ink-faint;
}

.login-link-action {
  font-size: 26rpx;
  color: $amber;
  font-weight: 600;
}

// ── Footer ──
.footer {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 36rpx 36rpx 80rpx;
}

.footer-copy {
  font-size: 20rpx;
  color: $ink-faint;
  letter-spacing: 1rpx;
  opacity: 0.5;
}
</style>
