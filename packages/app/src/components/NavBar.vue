<template>
  <view>
    <view class="nav-bar" :style="{ background: transparent ? 'transparent' : '#fff', paddingTop: statusBarHeight + 'px' }">
      <view class="nav-content">
        <view v-if="showBack" class="nav-back" @tap="goBack">
          <image src="/static/icons/arrow-left.svg" class="nav-back-icon" />
        </view>
        <text class="nav-title" :style="{ color: textColor }">{{ title }}</text>
        <view class="nav-right">
          <slot name="right"></slot>
        </view>
      </view>
    </view>
    <view class="nav-placeholder" :style="{ paddingTop: statusBarHeight + 'px' }"></view>
  </view>
</template>

<script setup lang="ts">
import { ref } from 'vue';

defineProps<{
  title?: string;
  showBack?: boolean;
  transparent?: boolean;
  textColor?: string;
}>();

const statusBarHeight = ref(0);

// Get status bar height
const sysInfo = uni.getSystemInfoSync();
statusBarHeight.value = sysInfo.statusBarHeight || 44;

function goBack() {
  uni.navigateBack({ fail: () => uni.reLaunch({ url: '/pages/landing/index' }) });
}
</script>

<style lang="scss" scoped>
@use '../static/styles/theme.scss' as *;

.nav-bar {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 100;
}

.nav-placeholder {
  height: 88rpx;
}

.nav-content {
  height: 88rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  padding: 0 16rpx;
}

.nav-back {
  position: absolute;
  left: 16rpx;
  width: 72rpx;
  height: 72rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
}

.nav-back-icon {
  width: 40rpx;
  height: 40rpx;
}

.nav-title {
  font-size: 34rpx;
  font-weight: 600;
  color: $ink;
  letter-spacing: 1rpx;
}

.nav-right {
  position: absolute;
  right: 16rpx;
}
</style>
