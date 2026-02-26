<template>
  <view class="notifications-page">
    <scroll-view scroll-y class="notifications-scroll safe-bottom">
      <!-- Notification Groups -->
      <view v-for="(group, gIdx) in groupedNotifications" :key="gIdx">
        <text class="section-title">{{ group.date }}</text>
        <view class="notification-group">
          <view
            v-for="(item, idx) in group.items"
            :key="idx"
            class="notification-item"
            :class="{ unread: !item.read }"
          >
            <view class="ni-icon-wrap" :style="{ background: item.iconBg }">
              <text class="ni-icon">{{ item.icon }}</text>
            </view>
            <view class="ni-content">
              <view class="ni-header">
                <text class="ni-title">{{ item.title }}</text>
                <view v-if="!item.read" class="ni-dot"></view>
              </view>
              <text class="ni-desc">{{ item.description }}</text>
              <text class="ni-time">{{ item.time }}</text>
            </view>
          </view>
        </view>
      </view>

      <!-- Empty State -->
      <view v-if="groupedNotifications.length === 0" class="empty-state">
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
import { formatDate, getToday } from '../../utils/date';

interface NotificationItem {
  icon: string;
  iconBg: string;
  title: string;
  description: string;
  time: string;
  date: string;
  read: boolean;
}

const notifications = ref<NotificationItem[]>([
  {
    icon: '\uD83D\uDCCB',
    iconBg: 'rgba(212,132,90,0.12)',
    title: '新记录待审核',
    description: '张三提交了 3 条新的记工记录，请及时审核',
    time: '15:30',
    date: getToday(),
    read: false,
  },
  {
    icon: '\uD83D\uDC64',
    iconBg: 'rgba(139,107,150,0.12)',
    title: '新成员申请',
    description: '赵六申请加入工坊，请审批',
    time: '14:20',
    date: getToday(),
    read: false,
  },
  {
    icon: '\u2713',
    iconBg: 'rgba(107,155,123,0.12)',
    title: '结算单已确认',
    description: '张三已确认 2 月上半月结算单，金额 ¥1,280',
    time: '11:00',
    date: getToday(),
    read: true,
  },
  {
    icon: '\u270E',
    iconBg: 'rgba(91,141,184,0.12)',
    title: '记录被修改',
    description: '管理员将你的衬衫缝合数量从 15 修改为 12',
    time: '16:45',
    date: formatDate(new Date(Date.now() - 86400000)),
    read: true,
  },
  {
    icon: '\uD83D\uDCB0',
    iconBg: 'rgba(200,149,108,0.12)',
    title: '结算单已生成',
    description: '1 月下半月结算单已生成，总额 ¥1,440，请查看确认',
    time: '09:30',
    date: formatDate(new Date(Date.now() - 86400000)),
    read: true,
  },
  {
    icon: '\uD83C\uDF89',
    iconBg: 'rgba(200,149,108,0.12)',
    title: '欢迎使用计工宝',
    description: '你已成功创建工坊，快去邀请工人加入吧',
    time: '10:00',
    date: formatDate(new Date(Date.now() - 172800000)),
    read: true,
  },
]);

function getDateLabel(dateStr: string): string {
  const today = getToday();
  if (dateStr === today) return '今天';
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  if (dateStr === formatDate(yesterday)) return '昨天';
  return dateStr;
}

const groupedNotifications = computed(() => {
  const groups: { date: string; items: NotificationItem[] }[] = [];
  const dateMap = new Map<string, NotificationItem[]>();

  for (const item of notifications.value) {
    const existing = dateMap.get(item.date);
    if (existing) {
      existing.push(item);
    } else {
      const items = [item];
      dateMap.set(item.date, items);
      groups.push({ date: getDateLabel(item.date), items });
    }
  }

  return groups;
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
