<template>
  <view class="notifications-page">
    <scroll-view
      scroll-y
      class="notifications-scroll safe-bottom"
      @scrolltolower="loadMore"
      refresher-enabled
      :refresher-triggered="refreshing"
      @refresherrefresh="onRefresh"
    >
      <!-- Mark all read -->
      <view v-if="hasUnread" class="read-all-bar">
        <text class="read-all-btn" @tap="markAllRead">全部已读</text>
      </view>

      <!-- Notification Groups -->
      <view v-for="(group, gIdx) in groupedNotifications" :key="gIdx">
        <text class="section-title">{{ group.date }}</text>
        <view class="notification-group">
          <view
            v-for="item in group.items"
            :key="item.id"
            class="notification-item"
            :class="{ unread: !item.is_read }"
            @tap="markRead(item)"
          >
            <view class="ni-icon-wrap" :style="{ background: getIconStyle(item.type).bg }">
              <text class="ni-icon">{{ getIconStyle(item.type).icon }}</text>
            </view>
            <view class="ni-content">
              <view class="ni-header">
                <text class="ni-title">{{ item.title }}</text>
                <view v-if="!item.is_read" class="ni-dot"></view>
              </view>
              <text class="ni-desc">{{ item.content }}</text>
              <text class="ni-time">{{ formatTime(item.created_at) }}</text>
            </view>
            <text
              v-if="typeRouteMap[item.type]"
              class="ni-arrow"
              @tap.stop="navigateTo(item)"
            >&#x203A;</text>
          </view>
        </view>
      </view>

      <!-- Loading more -->
      <view v-if="loading && notifications.length > 0" class="loading-more">
        <text class="loading-text">加载中...</text>
      </view>

      <!-- No more -->
      <view v-if="noMore && notifications.length > 0" class="loading-more">
        <text class="loading-text">没有更多了</text>
      </view>

      <!-- Empty State -->
      <view v-if="!loading && notifications.length === 0" class="empty-state">
        <image src="/static/icons/bell.svg" class="empty-icon" />
        <text class="empty-text">暂无通知</text>
        <text class="empty-hint">有新的消息时会在这里通知你</text>
      </view>

      <view style="height: 40rpx;"></view>
    </scroll-view>
  </view>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { onShow } from '@dcloudio/uni-app';
import { api } from '../../utils/request';
import { formatDate, getToday } from '../../utils/date';

interface NotificationItem {
  id: number;
  user_id: number;
  workshop_id: number;
  type: string;
  title: string;
  content: string;
  is_read: boolean;
  created_at: string;
}

const notifications = ref<NotificationItem[]>([]);
const loading = ref(false);
const refreshing = ref(false);
const page = ref(1);
const pageSize = 20;
const total = ref(0);

const hasUnread = computed(() => notifications.value.some((n) => !n.is_read));
const noMore = computed(() => notifications.value.length >= total.value && total.value > 0);

const iconStyleMap: Record<string, { icon: string; bg: string }> = {
  member_apply: { icon: '\uD83D\uDC64', bg: 'rgba(139,107,150,0.12)' },
  member_approved: { icon: '\u2713', bg: 'rgba(107,155,123,0.12)' },
  member_rejected: { icon: '\u2717', bg: 'rgba(200,100,100,0.12)' },
  member_removed: { icon: '\uD83D\uDEAB', bg: 'rgba(200,100,100,0.12)' },
  record_submitted: { icon: '\uD83D\uDCCB', bg: 'rgba(212,132,90,0.12)' },
  record_confirmed: { icon: '\u2713', bg: 'rgba(107,155,123,0.12)' },
  record_modified: { icon: '\u270E', bg: 'rgba(91,141,184,0.12)' },
  settlement_created: { icon: '\uD83D\uDCB0', bg: 'rgba(200,149,108,0.12)' },
  settlement_confirmed: { icon: '\u2713', bg: 'rgba(107,155,123,0.12)' },
};

function getIconStyle(type: string) {
  return iconStyleMap[type] || { icon: '\uD83D\uDD14', bg: 'rgba(150,150,150,0.12)' };
}

function formatTime(dateStr: string) {
  const d = new Date(dateStr);
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
}

function getDateLabel(dateStr: string): string {
  const date = formatDate(dateStr);
  const today = getToday();
  if (date === today) return '今天';
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  if (date === formatDate(yesterday)) return '昨天';
  return date;
}

const groupedNotifications = computed(() => {
  const groups: { date: string; items: NotificationItem[] }[] = [];
  const dateMap = new Map<string, NotificationItem[]>();

  for (const item of notifications.value) {
    const dateKey = formatDate(item.created_at);
    const existing = dateMap.get(dateKey);
    if (existing) {
      existing.push(item);
    } else {
      const items = [item];
      dateMap.set(dateKey, items);
      groups.push({ date: getDateLabel(item.created_at), items });
    }
  }

  return groups;
});

async function fetchNotifications(pageNum: number, append = false) {
  if (loading.value) return;
  loading.value = true;
  try {
    const res = await api.get<{ total: number; list: NotificationItem[] }>('/notifications', {
      page: pageNum,
      page_size: pageSize,
    } as Record<string, unknown>);
    total.value = res.data.total;
    if (append) {
      notifications.value = [...notifications.value, ...res.data.list];
    } else {
      notifications.value = res.data.list;
    }
    page.value = pageNum;
  } catch {
    // error handled by request util
  } finally {
    loading.value = false;
  }
}

function loadMore() {
  if (noMore.value || loading.value) return;
  fetchNotifications(page.value + 1, true);
}

async function onRefresh() {
  refreshing.value = true;
  await fetchNotifications(1, false);
  refreshing.value = false;
}

async function markRead(item: NotificationItem) {
  if (item.is_read) return;
  try {
    await api.put(`/notifications/${item.id}/read`);
    item.is_read = true;
  } catch {
    // silent
  }
}

/** 通知类型 → 跳转页面 */
const typeRouteMap: Record<string, string> = {
  settlement_created: '/pages/admin/settlement/index',
  settlement_confirmed: '/pages/admin/settlement/index',
  record_submitted: '/pages/admin/records/index',
  record_confirmed: '/pages/worker/history/index',
  record_modified: '/pages/worker/history/index',
  member_apply: '/pages/admin/workers/index',
  member_approved: '/pages/role-select/index',
  member_rejected: '/pages/role-select/index',
  member_removed: '/pages/role-select/index',
};

async function onTapNotification(item: NotificationItem) {
  if (!item.is_read) {
    markRead(item);
  }
}

function navigateTo(item: NotificationItem) {
  if (!item.is_read) {
    markRead(item);
  }
  const route = typeRouteMap[item.type];
  if (route) {
    uni.navigateTo({
      url: route,
      fail: () => uni.redirectTo({ url: route }),
    });
  }
}

async function markAllRead() {
  try {
    await api.put('/notifications/read-all');
    notifications.value.forEach((n) => (n.is_read = true));
  } catch {
    // silent
  }
}

onShow(() => {
  fetchNotifications(1, false);
});
</script>

<style lang="scss" scoped>
@use '../../static/styles/theme.scss' as *;

.notifications-page {
  min-height: 100vh;
  background: $cream;
}

.notifications-scroll {
  height: 100vh;
}

// Read All Bar
.read-all-bar {
  display: flex;
  justify-content: flex-end;
  padding: 16rpx 32rpx 0;
}

.read-all-btn {
  font-size: 24rpx;
  color: $amber-deep;
  padding: 8rpx 24rpx;
  background: $amber-surface;
  border-radius: 20rpx;
}

// Notification Group
.notification-group {
  margin: 0 28rpx 8rpx;
  background: $surface;
  border-radius: $radius-md;
  overflow: hidden;
  box-shadow: $shadow-sm;
}

.notification-item {
  display: flex;
  gap: 20rpx;
  padding: 28rpx 32rpx;
  border-bottom: 1rpx solid $cream;
  position: relative;
}

.notification-item:last-child {
  border-bottom: none;
}

.notification-item.unread {
  background: $amber-surface;
}

.ni-icon-wrap {
  width: 72rpx;
  height: 72rpx;
  border-radius: 20rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.ni-icon {
  font-size: 32rpx;
}

.ni-content {
  flex: 1;
  min-width: 0;
}

.ni-header {
  display: flex;
  align-items: center;
  gap: 12rpx;
  margin-bottom: 8rpx;
}

.ni-title {
  font-size: 28rpx;
  font-weight: 600;
  color: $ink;
}

.ni-dot {
  width: 14rpx;
  height: 14rpx;
  border-radius: 50%;
  background: $amber;
  flex-shrink: 0;
}

.ni-desc {
  display: block;
  font-size: 24rpx;
  color: $ink-muted;
  line-height: 1.6;
  margin-bottom: 8rpx;
}

.ni-time {
  display: block;
  font-size: 22rpx;
  color: $ink-faint;
}

.ni-arrow {
  font-size: 36rpx;
  color: $ink-faint;
  flex-shrink: 0;
  align-self: stretch;
  display: flex;
  align-items: center;
  padding: 0 8rpx 0 16rpx;
}

// Loading
.loading-more {
  text-align: center;
  padding: 24rpx 0;
}

.loading-text {
  font-size: 24rpx;
  color: $ink-faint;
}

// Empty State
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 160rpx 0;
}

.empty-icon {
  width: 140rpx;
  height: 140rpx;
  opacity: 0.15;
  margin-bottom: 32rpx;
}

.empty-text {
  font-size: 34rpx;
  color: $ink-muted;
  font-weight: 700;
}

.empty-hint {
  font-size: 26rpx;
  color: $ink-faint;
  margin-top: 12rpx;
}
</style>
