<template>
  <view class="tab-bar">
    <view
      v-for="(item, index) in tabs"
      :key="index"
      class="tab-item"
      :class="{ active: currentIndex === index }"
      @tap="switchTab(index)"
    >
      <view class="tab-indicator" v-if="currentIndex === index"></view>
      <image class="tab-icon" :src="currentIndex === index ? item.activeIcon : item.icon" mode="aspectFit" />
      <text class="tab-label">{{ item.label }}</text>
    </view>
  </view>
</template>

<script setup lang="ts">
import { computed } from 'vue';

interface TabItem {
  label: string;
  icon: string;
  activeIcon: string;
  path: string;
}

const props = defineProps<{
  role: 'admin' | 'worker';
  current: string;
}>();

const adminTabs: TabItem[] = [
  { label: '首页', icon: '/static/icons/home.svg', activeIcon: '/static/icons/home.svg', path: '/pages/admin/dashboard/index' },
  { label: '审核', icon: '/static/icons/clipboard.svg', activeIcon: '/static/icons/clipboard.svg', path: '/pages/admin/records/index' },
  { label: '产品', icon: '/static/icons/package.svg', activeIcon: '/static/icons/package.svg', path: '/pages/admin/skus/index' },
  { label: '我的', icon: '/static/icons/profile.svg', activeIcon: '/static/icons/profile.svg', path: '/pages/profile/index' },
];

const workerTabs: TabItem[] = [
  { label: '记工', icon: '/static/icons/edit.svg', activeIcon: '/static/icons/edit.svg', path: '/pages/worker/worklog/index' },
  { label: '记录', icon: '/static/icons/clipboard.svg', activeIcon: '/static/icons/clipboard.svg', path: '/pages/worker/history/index' },
  { label: '工资', icon: '/static/icons/money.svg', activeIcon: '/static/icons/money.svg', path: '/pages/worker/salary/index' },
  { label: '我的', icon: '/static/icons/profile.svg', activeIcon: '/static/icons/profile.svg', path: '/pages/profile/index' },
];

const tabs = computed(() => props.role === 'admin' ? adminTabs : workerTabs);

const currentIndex = computed(() => {
  return tabs.value.findIndex(t => t.path === props.current);
});

function switchTab(index: number) {
  const tab = tabs.value[index];
  if (tab.path === props.current) return;
  uni.redirectTo({ url: tab.path });
}
</script>

<style lang="scss" scoped>
@use '../static/styles/theme.scss' as *;

.tab-bar {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  height: calc(88rpx + env(safe-area-inset-bottom));
  padding-bottom: env(safe-area-inset-bottom);
  background: $surface;
  display: flex;
  border-top: 1rpx solid $cream-deep;
  z-index: 999;
}

.tab-item {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  position: relative;
  transition: color 0.25s;
}

.tab-label {
  font-size: 20rpx;
  font-weight: 500;
  color: $ink-faint;
  margin-top: 4rpx;
  letter-spacing: 1rpx;
}

.tab-icon {
  width: 48rpx;
  height: 48rpx;
  opacity: 0.5;
}

.tab-item.active .tab-icon {
  opacity: 1;
}

.tab-item.active .tab-label {
  color: $amber;
}

.tab-indicator {
  position: absolute;
  top: -1rpx;
  left: 50%;
  transform: translateX(-50%);
  width: 48rpx;
  height: 4rpx;
  background: $amber;
  border-radius: 0 0 4rpx 4rpx;
}
</style>
