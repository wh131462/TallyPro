<template>
  <view v-if="isPreview" class="preview-banner">
    <view class="preview-left">
      <text class="preview-dot">&#x25CF;</text>
      <text class="preview-text">体验模式 · 数据仅供预览</text>
    </view>
    <view class="preview-btn" @tap="goLogin">
      <text class="preview-btn-text">去登录</text>
      <text class="preview-arrow">&#x203A;</text>
    </view>
  </view>
</template>

<script setup lang="ts">
import { getCurrentWorkshop } from '../utils/storage';

const workshop = getCurrentWorkshop();
const isPreview = workshop && workshop.id === 0;

function goLogin() {
  uni.navigateTo({
    url: '/pages/welcome/index',
    fail: () => uni.reLaunch({ url: '/pages/welcome/index' }),
  });
}
</script>

<style lang="scss" scoped>
.preview-banner {
  background: linear-gradient(135deg, #FFF8E1 0%, #FFF3E0 100%);
  padding: 16rpx 28rpx;
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-bottom: 1rpx solid rgba(230, 81, 0, 0.08);
}

.preview-left {
  display: flex;
  align-items: center;
  gap: 10rpx;
}

.preview-dot {
  font-size: 16rpx;
  color: #F57C00;
}

.preview-text {
  font-size: 24rpx;
  color: #E65100;
  letter-spacing: 1rpx;
}

.preview-btn {
  display: flex;
  align-items: center;
  gap: 4rpx;
  background: rgba(230, 81, 0, 0.1);
  padding: 8rpx 20rpx;
  border-radius: 24rpx;
}

.preview-btn-text {
  font-size: 22rpx;
  color: #E65100;
  font-weight: 600;
}

.preview-arrow {
  font-size: 26rpx;
  color: #E65100;
  font-weight: 600;
}
</style>
