<template>
  <view class="about-page">
    <NavBar title="关于" :showBack="true" />

    <!-- Hero Header -->
    <view class="hero">
      <view class="hero-bg"></view>
      <view class="hero-ornament-top">
        <view class="ornament-line"></view>
        <view class="ornament-diamond"></view>
        <view class="ornament-line"></view>
      </view>
      <view class="hero-logo" @longpress="onLogoLongPress">
        <image src="/static/logo.svg" class="logo-img" />
      </view>
      <text class="hero-name">计工宝</text>
      <text class="hero-en">TALLY PRO</text>
      <view class="hero-version-badge">
        <text class="version-text">v1.0.0</text>
      </view>
      <view class="hero-ornament-bottom">
        <view class="ornament-line"></view>
        <view class="ornament-diamond"></view>
        <view class="ornament-line"></view>
      </view>
    </view>

    <!-- Mission Statement -->
    <view class="mission-section">
      <view class="mission-accent"></view>
      <view class="mission-body">
        <text class="mission-title">让计件管理更简单</text>
        <text class="mission-text">专为小型制造业企业设计的计件工资管理工具。帮助企业主轻松管理产品工序、审核员工记工、自动计算工资；帮助员工快速填报每日工量、实时查看工资明细。</text>
      </view>
    </view>

    <!-- Features Grid -->
    <view class="features-header">
      <view class="features-line"></view>
      <text class="features-label">核心功能</text>
      <view class="features-line"></view>
    </view>
    <view class="features-grid">
      <view class="feature-tile" v-for="(feat, i) in features" :key="i">
        <view class="tile-icon" :style="{ background: feat.bg }">
          <image :src="feat.icon" class="tile-icon-img" />
        </view>
        <text class="tile-name">{{ feat.name }}</text>
        <text class="tile-desc">{{ feat.desc }}</text>
      </view>
    </view>

    <!-- Divider -->
    <view class="section-divider">
      <view class="divider-dot"></view>
      <view class="divider-dot"></view>
      <view class="divider-dot"></view>
    </view>

    <!-- Legal -->
    <view class="legal-card">
      <view class="legal-item" @tap="goTo('/pages/agreement/index')">
        <view class="legal-icon-wrap">
          <image src="/static/icons/clipboard.svg" class="legal-icon" />
        </view>
        <text class="legal-title">用户协议</text>
        <text class="legal-arrow">&#8250;</text>
      </view>
      <view class="legal-sep"></view>
      <view class="legal-item" @tap="goTo('/pages/privacy/index')">
        <view class="legal-icon-wrap">
          <image src="/static/icons/info.svg" class="legal-icon" />
        </view>
        <text class="legal-title">隐私政策</text>
        <text class="legal-arrow">&#8250;</text>
      </view>
    </view>

    <!-- Footer -->
    <view class="footer">
      <view class="footer-ornament">
        <view class="footer-wing"></view>
        <view class="footer-diamond"></view>
        <view class="footer-wing"></view>
      </view>
      <text class="footer-brand">Crafted with care by</text>
      <text class="footer-author">EternalHeart</text>
      <text class="footer-copy">&copy; 2025 计工宝 All Rights Reserved</text>
    </view>
  </view>
</template>

<script setup lang="ts">
import NavBar from '../../components/NavBar.vue';
import { api } from '../../utils/request';

const features = [
  {
    name: '产品工序',
    desc: '灵活配置产品和工序\n设定计件单价',
    icon: '/static/icons/package.svg',
    bg: 'linear-gradient(135deg, #FFF0E8 0%, #FDEEE4 100%)',
  },
  {
    name: '每日记工',
    desc: '员工一键填报工量\n多工序同时记录',
    icon: '/static/icons/edit.svg',
    bg: 'linear-gradient(135deg, #E8F2EC 0%, #DFF0E5 100%)',
  },
  {
    name: '记录审核',
    desc: '实时审核确认\n支持批量操作',
    icon: '/static/icons/clipboard.svg',
    bg: 'linear-gradient(135deg, #EBF2F8 0%, #E4EEF6 100%)',
  },
  {
    name: '工资结算',
    desc: '自动汇总计算\n透明工资明细',
    icon: '/static/icons/money.svg',
    bg: 'linear-gradient(135deg, #F4EEF6 0%, #EFE7F2 100%)',
  },
];

function goTo(path: string) {
  uni.navigateTo({ url: path });
}

function onLogoLongPress() {
  uni.showModal({
    title: '管理员验证',
    placeholderText: '请输入管理员密码',
    editable: true,
    success: async (res) => {
      if (!res.confirm || !res.content?.trim()) return;
      try {
        await api.post('/feedbacks/admin/verify', { password: res.content.trim() });
        uni.setStorageSync('adminKey', res.content.trim());
        uni.navigateTo({ url: '/pages/admin/feedbacks/index' });
      } catch {
        uni.showToast({ title: '密码错误', icon: 'none' });
      }
    },
  });
}
</script>

<style lang="scss" scoped>
@use '../../static/styles/theme.scss' as *;

.about-page {
  min-height: 100vh;
  background: $cream;
}

// ── Hero ──────────────────────────
.hero {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 40rpx 48rpx 56rpx;
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

.hero-ornament-top,
.hero-ornament-bottom {
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
  width: 180rpx;
  height: 180rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 36rpx 0 28rpx;
  position: relative;
  z-index: 1;
}

.logo-img {
  width: 180rpx;
  height: 180rpx;
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
  position: relative;
  z-index: 1;
  opacity: 0.7;
}

.hero-version-badge {
  margin-top: 24rpx;
  margin-bottom: 28rpx;
  padding: 6rpx 28rpx;
  border-radius: 40rpx;
  border: 2rpx solid rgba(200, 149, 108, 0.3);
  background: rgba(200, 149, 108, 0.06);
  position: relative;
  z-index: 1;
}

.version-text {
  font-size: 22rpx;
  color: $amber-deep;
  font-weight: 500;
  letter-spacing: 2rpx;
}

// ── Mission ──────────────────────────
.mission-section {
  margin: 8rpx 36rpx 0;
  display: flex;
  gap: 24rpx;
  background: $surface;
  border-radius: $radius-lg;
  padding: 40rpx 36rpx;
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
  margin-bottom: 16rpx;
  letter-spacing: 2rpx;
}

.mission-text {
  display: block;
  font-size: 25rpx;
  color: $ink-muted;
  line-height: 1.9;
  letter-spacing: 0.5rpx;
}

// ── Features ──────────────────────────
.features-header {
  display: flex;
  align-items: center;
  gap: 24rpx;
  padding: 48rpx 36rpx 28rpx;
  justify-content: center;
}

.features-line {
  width: 64rpx;
  height: 2rpx;
  background: linear-gradient(90deg, transparent, $cream-deep, transparent);
}

.features-label {
  font-size: 26rpx;
  font-weight: 600;
  color: $ink-muted;
  letter-spacing: 6rpx;
}

.features-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20rpx;
  padding: 0 36rpx;
}

.feature-tile {
  background: $surface;
  border-radius: $radius-md;
  padding: 36rpx 28rpx 32rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  box-shadow: $shadow-sm;
  border: 1rpx solid rgba(30, 30, 42, 0.03);
  transition: all 0.2s;

  &:active {
    transform: scale(0.97);
    box-shadow: $shadow-md;
  }
}

.tile-icon {
  width: 96rpx;
  height: 96rpx;
  border-radius: 28rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 20rpx;
}

.tile-icon-img {
  width: 44rpx;
  height: 44rpx;
}

.tile-name {
  display: block;
  font-size: 28rpx;
  font-weight: 700;
  color: $ink;
  letter-spacing: 2rpx;
  margin-bottom: 10rpx;
}

.tile-desc {
  display: block;
  font-size: 22rpx;
  color: $ink-faint;
  line-height: 1.7;
}

// ── Divider ──────────────────────────
.section-divider {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 16rpx;
  padding: 48rpx 0 12rpx;
}

.divider-dot {
  width: 8rpx;
  height: 8rpx;
  border-radius: 50%;
  background: $cream-deep;

  &:nth-child(2) {
    width: 10rpx;
    height: 10rpx;
    background: $amber-light;
    opacity: 0.5;
  }
}

// ── Legal ──────────────────────────
.legal-card {
  margin: 28rpx 36rpx 0;
  background: $surface;
  border-radius: $radius-md;
  box-shadow: $shadow-sm;
  border: 1rpx solid rgba(30, 30, 42, 0.03);
  overflow: hidden;
}

.legal-item {
  display: flex;
  align-items: center;
  gap: 20rpx;
  padding: 28rpx 32rpx;
  transition: background 0.15s;

  &:active {
    background: $cream;
  }
}

.legal-sep {
  height: 1rpx;
  background: $cream;
  margin: 0 32rpx;
}

.legal-icon-wrap {
  width: 56rpx;
  height: 56rpx;
  border-radius: 16rpx;
  background: $cream;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.legal-icon {
  width: 28rpx;
  height: 28rpx;
  opacity: 0.5;
}

.legal-title {
  flex: 1;
  font-size: 27rpx;
  color: $ink;
  font-weight: 500;
  letter-spacing: 1rpx;
}

.legal-arrow {
  font-size: 32rpx;
  color: $ink-faint;
  flex-shrink: 0;
}

// ── Footer ──────────────────────────
.footer {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 48rpx 36rpx 80rpx;
}

.footer-ornament {
  display: flex;
  align-items: center;
  gap: 12rpx;
  margin-bottom: 32rpx;
}

.footer-wing {
  width: 48rpx;
  height: 1rpx;
  background: linear-gradient(90deg, transparent, $cream-deep);

  &:last-child {
    background: linear-gradient(90deg, $cream-deep, transparent);
  }
}

.footer-diamond {
  width: 8rpx;
  height: 8rpx;
  background: $cream-deep;
  transform: rotate(45deg);
}

.footer-brand {
  display: block;
  font-size: 21rpx;
  color: $ink-faint;
  letter-spacing: 1rpx;
  opacity: 0.7;
}

.footer-author {
  display: block;
  font-size: 26rpx;
  font-weight: 600;
  color: $amber;
  letter-spacing: 4rpx;
  margin-top: 8rpx;
  opacity: 0.8;
}

.footer-copy {
  display: block;
  font-size: 20rpx;
  color: $ink-faint;
  margin-top: 20rpx;
  letter-spacing: 1rpx;
  opacity: 0.5;
}
</style>
