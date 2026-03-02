<template>
  <view class="logs-page">
    <!-- Filter Tabs -->
    <view class="filter-tabs">
      <view
        v-for="tab in tabs"
        :key="tab.value"
        class="filter-tab"
        :class="{ active: activeTab === tab.value }"
        @tap="activeTab = tab.value"
      >
        <text>{{ tab.label }}</text>
      </view>
    </view>

    <scroll-view scroll-y class="logs-scroll safe-bottom">
      <!-- Log Items -->
      <view class="log-list">
        <view
          v-for="(log, idx) in filteredLogs"
          :key="idx"
          class="log-item"
        >
          <view class="li-icon-wrap" :style="{ background: log.iconBg }">
            <text class="li-icon">{{ log.icon }}</text>
          </view>
          <view class="li-content">
            <view class="li-header">
              <text class="li-action">{{ log.action }}</text>
              <text class="li-time">{{ log.time }}</text>
            </view>
            <text class="li-detail">{{ log.description }}</text>
          </view>
        </view>
      </view>

      <!-- Empty State -->
      <view v-if="!loading && filteredLogs.length === 0" class="empty-state">
        <image src="/static/icons/log.svg" class="empty-icon" />
        <text class="empty-text">暂无操作日志</text>
      </view>

      <view style="height: 40rpx;"></view>
    </scroll-view>
  </view>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { api } from '../../../utils/request';
import { getCurrentWorkshop } from '../../../utils/storage';

interface LogItem {
  icon: string;
  iconBg: string;
  action: string;
  time: string;
  description: string;
  type: 'audit' | 'settlement' | 'member';
}

const tabs = [
  { label: '全部', value: 'all' },
  { label: '审核', value: 'audit' },
  { label: '结算', value: 'settlement' },
  { label: '成员', value: 'member' },
];

const workshop = getCurrentWorkshop();
const activeTab = ref('all');
const logs = ref<LogItem[]>([]);
const loading = ref(true);

const filteredLogs = computed(() => {
  if (activeTab.value === 'all') return logs.value;
  return logs.value.filter((log) => log.type === activeTab.value);
});

function formatLogTime(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const isToday =
    date.getFullYear() === now.getFullYear() &&
    date.getMonth() === now.getMonth() &&
    date.getDate() === now.getDate();
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  if (isToday) return `今天 ${hours}:${minutes}`;
  const yesterday = new Date(now);
  yesterday.setDate(yesterday.getDate() - 1);
  const isYesterday =
    date.getFullYear() === yesterday.getFullYear() &&
    date.getMonth() === yesterday.getMonth() &&
    date.getDate() === yesterday.getDate();
  if (isYesterday) return `昨天 ${hours}:${minutes}`;
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${m}-${d} ${hours}:${minutes}`;
}

function mapLogType(type: string): LogItem['type'] {
  if (['confirm', 'modify', 'reject', 'review'].includes(type)) return 'audit';
  if (['create_settlement', 'export'].includes(type)) return 'settlement';
  if (['approve', 'invite', 'remove'].includes(type)) return 'member';
  return 'audit';
}

function mapLogIcon(type: string): { icon: string; iconBg: string; action: string } {
  const map: Record<string, { icon: string; iconBg: string; action: string }> = {
    confirm: { icon: '\u2713', iconBg: 'rgba(107,155,123,0.12)', action: '确认记录' },
    modify: { icon: '\u270E', iconBg: 'rgba(91,141,184,0.12)', action: '修改数量' },
    reject: { icon: '\u2717', iconBg: 'rgba(199,91,91,0.12)', action: '驳回记录' },
    create_settlement: { icon: '\uD83D\uDCB0', iconBg: 'rgba(200,149,108,0.12)', action: '创建结算单' },
    approve: { icon: '\uD83D\uDC64', iconBg: 'rgba(139,107,150,0.12)', action: '审批通过' },
    invite: { icon: '\uD83D\uDC65', iconBg: 'rgba(91,141,184,0.12)', action: '邀请成员' },
    remove: { icon: '\uD83D\uDEAB', iconBg: 'rgba(199,91,91,0.12)', action: '移除成员' },
    export: { icon: '\uD83D\uDCE4', iconBg: 'rgba(200,149,108,0.12)', action: '导出报表' },
    review: { icon: '\uD83D\uDCCB', iconBg: 'rgba(212,132,90,0.12)', action: '审核记录' },
  };
  return map[type] || { icon: '\u25CF', iconBg: 'rgba(160,160,176,0.12)', action: '操作' };
}

onMounted(async () => {
  if (!workshop || !workshop.id) {
    loading.value = false;
    return;
  }
  try {
    const res = await api.get<any>(`/workshops/${workshop.id}/logs`);
    const list = res.data?.list || res.data || [];
    if (Array.isArray(list)) {
      logs.value = list.map((item: any) => {
        const mapped = mapLogIcon(item.action);
        return {
          ...mapped,
          time: formatLogTime(item.created_at),
          description: item.remark || item.action,
          type: mapLogType(item.action),
        };
      });
    }
  } catch (e) {
    console.error('加载操作日志失败', e);
  } finally {
    loading.value = false;
  }
});
</script>

<style lang="scss" scoped>
@use '../../../static/styles/theme.scss' as *;

.logs-page {
  min-height: 100vh;
  background: $cream;
}

.logs-scroll {
  height: calc(100vh - 96rpx);
}

// Filter Tabs
.filter-tabs {
  display: flex;
  gap: 0;
  background: $surface;
  padding: 0 28rpx;
  border-bottom: 1rpx solid $cream-deep;
}

.filter-tab {
  flex: 1;
  text-align: center;
  padding: 24rpx 0;
  font-size: 26rpx;
  color: $ink-faint;
  font-weight: 500;
  position: relative;
  letter-spacing: 1rpx;
  transition: color 0.2s;
}

.filter-tab.active {
  color: $amber;
  font-weight: 700;

  &::after {
    content: '';
    position: absolute;
    bottom: 0;
    left: 50%;
    transform: translateX(-50%);
    width: 48rpx;
    height: 4rpx;
    border-radius: 2rpx;
    background: $amber;
  }
}

// Log List
.log-list {
  padding: 16rpx 0;
}

.log-item {
  display: flex;
  gap: 20rpx;
  padding: 24rpx 28rpx;
  background: $surface;
  margin: 0 28rpx 12rpx;
  border-radius: $radius-sm;
  box-shadow: $shadow-sm;
}

.li-icon-wrap {
  width: 72rpx;
  height: 72rpx;
  border-radius: 20rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.li-icon {
  font-size: 32rpx;
}

.li-content {
  flex: 1;
  min-width: 0;
}

.li-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8rpx;
}

.li-action {
  font-size: 28rpx;
  font-weight: 600;
  color: $ink;
}

.li-time {
  font-size: 22rpx;
  color: $ink-faint;
  flex-shrink: 0;
}

.li-detail {
  font-size: 24rpx;
  color: $ink-muted;
  line-height: 1.6;
}

// Empty State
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 120rpx 0;
}

.empty-icon {
  width: 120rpx;
  height: 120rpx;
  opacity: 0.2;
  margin-bottom: 28rpx;
}

.empty-text {
  font-size: 30rpx;
  color: $ink-muted;
  font-weight: 600;
}
</style>
