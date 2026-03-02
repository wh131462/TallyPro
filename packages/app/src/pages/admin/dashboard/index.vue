<template>
  <view class="dashboard">
    <NavBar title="" :transparent="true" textColor="#fff" />

      <!-- Header -->
      <PreviewBanner />
      <view class="dash-header">
        <view class="dash-header-top" @tap="goTo('/pages/admin/workshop/index')">
          <view class="dash-logo" v-if="workshopLogo">
            <image :src="getImageUrl(workshopLogo)" class="dash-logo-img" mode="aspectFill" />
          </view>
          <view class="dash-header-text">
            <text class="greeting">{{ greetingText }}，{{ userName??"用户" }}</text>
            <text class="workshop-name">{{ workshopDisplayName }}</text>
          </view>
          <text class="header-edit-hint">&#x203A;</text>
        </view>
      </view>

      <!-- Stats Cards -->
      <view class="dash-stats">
        <view class="ds-card" @tap="goTo('/pages/admin/records/index?status=pending')">
          <text class="ds-value" style="color: #D4845A;">{{ stats.pendingCount }}</text>
          <text class="ds-label">待审核</text>
        </view>
        <view class="ds-card" @tap="goTo('/pages/admin/workers/index')">
          <text class="ds-value" style="color: #5B8DB8;">{{ stats.workerCount }}</text>
          <text class="ds-label">员工数</text>
        </view>
        <view class="ds-card" @tap="goTo('/pages/admin/settlement/index')">
          <text class="ds-value" style="color: #6B9B7B;">¥{{ stats.monthSalary }}</text>
          <text class="ds-label">本月工资</text>
        </view>
      </view>

      <!-- Quick Actions -->
      <view class="quick-actions">
        <view class="quick-action" @tap="goTo('/pages/admin/records/index')">
          <view class="qa-icon" style="background: #FFF0E8;">
            <image src="/static/icons/clipboard.svg" class="qa-img" />
          </view>
          <text class="qa-label">审核记录</text>
        </view>
        <view class="quick-action" @tap="goTo('/pages/admin/workers/index')">
          <view class="qa-icon" style="background: #EBF2F8;">
            <image src="/static/icons/people.svg" class="qa-img" />
          </view>
          <text class="qa-label">员工管理</text>
        </view>
        <view class="quick-action" @tap="goTo('/pages/admin/skus/index')">
          <view class="qa-icon" style="background: #E8F2EC;">
            <image src="/static/icons/package.svg" class="qa-img" />
          </view>
          <text class="qa-label">产品管理</text>
        </view>
        <view class="quick-action" @tap="goTo('/pages/admin/settlement/index')">
          <view class="qa-icon" style="background: #F4EEF6;">
            <image src="/static/icons/money.svg" class="qa-img" />
          </view>
          <text class="qa-label">结算统计</text>
        </view>
      </view>

      <!-- Activity Feed -->
      <text class="section-title">今日动态</text>
      <view class="card">
        <view class="activity-item" v-for="(item, i) in activities" :key="i">
          <view class="activity-dot" :style="{ background: item.color }"></view>
          <text class="activity-text">{{ item.text }}</text>
        </view>
        <view v-if="activities.length === 0" class="empty-hint">
          <text>暂无今日动态</text>
        </view>
      </view>

      <!-- Monthly Overview -->
      <text class="section-title">本月概览</text>
      <view class="card">
        <view class="overview-row">
          <text class="overview-label">总记工条数</text>
          <text class="overview-value">{{ overview.total }} 条</text>
        </view>
        <view class="overview-row">
          <text class="overview-label">已确认</text>
          <text class="overview-value">{{ overview.confirmed }} 条</text>
        </view>
        <view class="overview-row">
          <text class="overview-label">待确认</text>
          <text class="overview-value">{{ overview.pending }} 条</text>
        </view>
        <view class="overview-row">
          <text class="overview-label">已结算</text>
          <text class="overview-value">{{ overview.settled }} 条</text>
        </view>
      </view>

      <view class="tab-bar-clearance"></view>

    <TabBar role="admin" current="/pages/admin/dashboard/index" />
  </view>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { onShow } from '@dcloudio/uni-app';
import NavBar from '../../../components/NavBar.vue';
import TabBar from '../../../components/TabBar.vue';
import PreviewBanner from '../../../components/PreviewBanner.vue';
import { api, getImageUrl } from '../../../utils/request';
import { getCurrentWorkshop, getUserInfo } from '../../../utils/storage';
import { requireLogin } from '../../../utils/auth';

const workshop = getCurrentWorkshop();
const userName = ref(getUserInfo()?.nickname || '老板');
const workshopDisplayName = ref(workshop?.name || '我的企业');
const workshopLogo = ref(workshop?.logo_url || '');

const stats = ref({ pendingCount: 0, workerCount: 0, monthSalary: '0' });
const activities = ref<{ text: string; color: string }[]>([]);
const overview = ref({ total: 0, confirmed: 0, pending: 0, settled: 0 });

const greetingText = computed(() => {
  const hour = new Date().getHours();
  if (hour < 6) return '凌晨好';
  if (hour < 12) return '上午好';
  if (hour < 14) return '中午好';
  if (hour < 18) return '下午好';
  return '晚上好';
});

const tabPages = [
  '/pages/admin/dashboard/index',
  '/pages/admin/records/index',
  '/pages/admin/skus/index',
  '/pages/profile/index',
];

function goTo(path: string) {
  if (!requireLogin()) return;
  const basePath = path.split('?')[0];
  if (tabPages.includes(basePath)) {
    uni.redirectTo({ url: path });
  } else {
    uni.navigateTo({ url: path });
  }
}

onShow(() => {
  userName.value = getUserInfo()?.nickname || '老板';
});

onMounted(async () => {
  if (!workshop || !workshop.id) return;
  try {
    const res = await api.get<any>(`/records/summary?workshop_id=${workshop.id}`);
    if (res.data) {
      stats.value = {
        pendingCount: res.data.total_pending || 0,
        workerCount: res.data.worker_count || 0,
        monthSalary: String(res.data.total_amount || 0),
      };
      overview.value = {
        total: (res.data.total_pending || 0) + (res.data.total_confirmed || 0) + (res.data.total_modified || 0) + (res.data.total_settled || 0),
        confirmed: (res.data.total_confirmed || 0) + (res.data.total_modified || 0),
        pending: res.data.total_pending || 0,
        settled: res.data.total_settled || 0,
      };
    }
  } catch (e) {
    console.error('加载仪表盘数据失败', e);
  }
  // Load recent activities from logs
  try {
    const logRes = await api.get<any>(`/workshops/${workshop.id}/logs?page_size=5`);
    if (logRes.data?.list) {
      const colorMap: Record<string, string> = {
        confirm_record: '#6B9B7B',
        modify_record: '#C8956C',
        batch_confirm_records: '#6B9B7B',
        approve_member: '#5B8DB8',
        reject_member: '#C75B5B',
        remove_member: '#C75B5B',
        change_price: '#D4845A',
      };
      const actionLabel: Record<string, string> = {
        confirm_record: '确认了一条记工记录',
        modify_record: '修改了一条记工记录',
        batch_confirm_records: '批量确认了记工记录',
        approve_member: '通过了员工申请',
        reject_member: '拒绝了员工申请',
        remove_member: '移除了一名员工',
        change_price: '调整了工序单价',
      };
      activities.value = logRes.data.list.map((log: any) => ({
        text: log.remark || actionLabel[log.action] || log.action,
        color: colorMap[log.action] || '#D4845A',
      }));
    }
  } catch {
    // Silently ignore
  }
});
</script>

<style lang="scss" scoped>
@use '../../../static/styles/theme.scss' as *;

.dashboard {
  min-height: 100vh;
  background: $cream;
}

.dash-header {
  padding: 48rpx 36rpx 80rpx;
  color: #fff;
  position: relative;
  overflow: hidden;
  background:
    radial-gradient(ellipse at 20% 50%, rgba(200,149,108,0.35) 0%, transparent 60%),
    linear-gradient(160deg, #1E1E2A 0%, #2A2A3C 100%);
}

.dash-header-top {
  display: flex;
  align-items: center;
  gap: 28rpx;
}

.dash-logo {
  width: 96rpx;
  height: 96rpx;
  border-radius: 50%;
  overflow: hidden;
  flex-shrink: 0;
  border: 3rpx solid rgba(255,255,255,0.25);
}

.dash-logo-img {
  width: 96rpx;
  height: 96rpx;
}

.dash-header-text {
  flex: 1;
  min-width: 0;
}

.header-edit-hint {
  font-size: 40rpx;
  color: rgba(255,255,255,0.4);
  flex-shrink: 0;
}

.greeting {
  display: block;
  font-size: 28rpx;
  opacity: 0.6;
  letter-spacing: 1rpx;
}

.workshop-name {
  display: block;
  font-size: 44rpx;
  font-weight: 700;
  margin-top: 12rpx;
  letter-spacing: 2rpx;
}

.dash-stats {
  display: flex;
  margin: -48rpx 28rpx 0;
  gap: 16rpx;
  position: relative;
  z-index: 1;
}

.ds-card {
  flex: 1;
  background: $surface;
  border-radius: $radius-md;
  padding: 32rpx 16rpx;
  text-align: center;
  box-shadow: $shadow-md;
}

.ds-value {
  display: block;
  font-size: 40rpx;
  font-weight: 700;
}

.ds-label {
  display: block;
  font-size: 22rpx;
  color: $ink-faint;
  margin-top: 8rpx;
  letter-spacing: 1rpx;
}

.quick-actions {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 8rpx;
  background: $surface;
  margin: 24rpx 28rpx;
  border-radius: $radius-md;
  padding: 36rpx 16rpx;
  box-shadow: $shadow-sm;
}

.quick-action {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16rpx;
}

.qa-icon {
  width: 92rpx;
  height: 92rpx;
  border-radius: 28rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}

.qa-img {
  width: 44rpx;
  height: 44rpx;
}

.qa-label {
  font-size: 22rpx;
  color: $ink-muted;
  font-weight: 500;
}

.activity-item {
  display: flex;
  align-items: flex-start;
  gap: 20rpx;
  padding: 20rpx 0;
  border-bottom: 1rpx solid $cream;
  font-size: 26rpx;
  color: $ink-muted;
  line-height: 1.5;
}

.activity-item:last-child {
  border-bottom: none;
}

.activity-dot {
  width: 16rpx;
  height: 16rpx;
  border-radius: 50%;
  flex-shrink: 0;
  margin-top: 10rpx;
}

.activity-text {
  flex: 1;
}

.overview-row {
  display: flex;
  justify-content: space-between;
  font-size: 26rpx;
  line-height: 2.4;
}

.overview-label {
  color: $ink-muted;
}

.overview-value {
  font-weight: 600;
  color: $ink;
}

.empty-hint {
  text-align: center;
  padding: 40rpx 0;
  font-size: 26rpx;
  color: $ink-faint;
}
</style>
