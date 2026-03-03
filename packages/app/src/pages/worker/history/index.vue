<template>
  <view class="history-page">
    <NavBar title="历史记录" />
    <PreviewBanner />

      <!-- Workshop Name -->
      <view class="workshop-bar" v-if="workshopName">
        <image v-if="workshopLogo" :src="getImageUrl(workshopLogo)" class="ws-bar-logo" mode="aspectFill" />
        <image v-else src="/static/icons/factory.svg" class="ws-bar-icon" />
        <text class="ws-bar-name">{{ workshopName }}</text>
      </view>

      <!-- Filter Tabs -->
      <view class="filter-tabs">
        <view
          v-for="tab in filterTabs"
          :key="tab.value"
          class="filter-tab"
          :class="{ active: activeFilter === tab.value }"
          @tap="activeFilter = tab.value"
        >
          <text class="filter-tab-text">{{ tab.label }}</text>
        </view>
      </view>

      <!-- Records grouped by date -->
      <view v-for="group in groupedRecords" :key="group.date">
        <text class="section-title">{{ group.date }}</text>

        <view
          v-for="record in group.records"
          :key="record.id"
          class="record-item"
        >
          <view class="ri-header">
            <view class="ri-sku-row">
              <image :src="getSkuIcon(record.icon)" class="ri-sku-icon" />
              <text class="ri-sku">{{ record.skuName }}</text>
            </view>
            <view class="badge" :class="getBadgeClass(record.status)">
              <text class="badge-text">{{ getStatusLabel(record.status) }}</text>
            </view>
          </view>
          <view class="ri-body">
            <view class="ri-info">
              <text class="ri-info-line">
                工序: <text class="ri-step">{{ record.stepName }}</text>
              </text>
              <text class="ri-info-line">
                ¥{{ record.price.toFixed(2) }} ×
                <text v-if="record.oldQuantity && record.oldQuantity !== record.quantity" class="ri-old-qty">{{ record.oldQuantity }}</text>
                {{ record.quantity }} 件
              </text>
            </view>
            <view class="ri-amount-col">
              <text class="ri-amount">¥{{ (record.price * record.quantity).toFixed(2) }}</text>
            </view>
          </view>
        </view>
      </view>

      <view v-if="groupedRecords.length === 0" class="empty-hint">
        <text class="empty-text">暂无记录</text>
      </view>

      <view class="tab-bar-clearance"></view>

    <TabBar role="worker" current="/pages/worker/history/index" />
  </view>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { onShow, onShareAppMessage, onShareTimeline } from '@dcloudio/uni-app';
import NavBar from '../../../components/NavBar.vue';
import PreviewBanner from '../../../components/PreviewBanner.vue';
import TabBar from '../../../components/TabBar.vue';
import { getShareConfig } from '../../../utils/share';
import { api, getImageUrl } from '../../../utils/request';
import { getCurrentWorkshop } from '../../../utils/storage';

const share = getShareConfig();
onShareAppMessage(share.appMessage);
onShareTimeline(share.timeline);

interface RecordItem {
  id: number;
  skuName: string;
  stepName: string;
  price: number;
  quantity: number;
  oldQuantity?: number;
  status: 'pending' | 'confirmed' | 'modified' | 'settled';
  date: string;
  icon?: string;
}

interface DateGroup {
  date: string;
  records: RecordItem[];
}

const filterTabs = [
  { label: '全部', value: 'all' },
  { label: '待确认', value: 'pending' },
  { label: '已确认', value: 'confirmed' },
  { label: '已结算', value: 'settled' },
];

const activeFilter = ref('all');
const records = ref<RecordItem[]>([]);
const workshopName = ref('');
const workshopLogo = ref('');

const filteredRecords = computed(() => {
  if (activeFilter.value === 'all') return records.value;
  return records.value.filter((r) => r.status === activeFilter.value);
});

const groupedRecords = computed<DateGroup[]>(() => {
  const map: Record<string, RecordItem[]> = {};
  filteredRecords.value.forEach((r) => {
    if (!map[r.date]) map[r.date] = [];
    map[r.date].push(r);
  });
  return Object.keys(map)
    .sort((a, b) => b.localeCompare(a))
    .map((date) => ({ date, records: map[date] }));
});

function getSkuIcon(icon?: string): string {
  if (!icon) return '/static/icons/trousers.svg';
  if (icon.startsWith('/uploads/') || icon.startsWith('http')) return getImageUrl(icon);
  return `/static/icons/${icon}.svg`;
}

function getBadgeClass(status: string): string {
  const map: Record<string, string> = {
    pending: 'badge-pending',
    confirmed: 'badge-confirmed',
    modified: 'badge-modified',
    settled: 'badge-settled',
  };
  return map[status] || 'badge-pending';
}

function getStatusLabel(status: string): string {
  const map: Record<string, string> = {
    pending: '待确认',
    confirmed: '已确认',
    modified: '已修改',
    settled: '已结算',
  };
  return map[status] || '待确认';
}

onShow(async () => {
  const workshop = getCurrentWorkshop();
  if (!workshop || !workshop.id) return;
  workshopName.value = workshop.name;
  workshopLogo.value = workshop.logo_url || '';
  try {
    const res = await api.get<any>(`/records?workshop_id=${workshop.id}&page_size=100`);
    const list = res.data?.list || res.data || [];
    records.value = (Array.isArray(list) ? list : []).map((r: any) => {
      const step = r.step || {};
      const sku = step.sku || {};
      return {
        id: r.id,
        skuName: sku.name || '未知产品',
        stepName: step.name || '未知工序',
        price: Number(r.unit_price || step.unit_price) || 0,
        quantity: r.confirmed_quantity ?? r.quantity ?? 0,
        oldQuantity: r.status === 'modified' ? r.quantity : undefined,
        status: r.status || 'pending',
        date: r.work_date || '',
        icon: sku.image_url || undefined,
      };
    });
  } catch (e) {
    console.error('加载历史记录失败', e);
  }
});
</script>

<style lang="scss" scoped>
@use '../../../static/styles/theme.scss' as *;

.history-page {
  min-height: 100vh;
  background: $cream;
}

// Workshop Bar
.workshop-bar {
  background: $surface;
  padding: 20rpx 36rpx;
  display: flex;
  align-items: center;
  gap: 16rpx;
  border-bottom: 1rpx solid $cream;
}

.ws-bar-icon {
  width: 36rpx;
  height: 36rpx;
}

.ws-bar-logo {
  width: 36rpx;
  height: 36rpx;
  border-radius: 50%;
}

.ws-bar-name {
  flex: 1;
  font-size: 28rpx;
  font-weight: 600;
  color: $ink;
  letter-spacing: 1rpx;
}

// Filter Tabs
.filter-tabs {
  display: flex;
  background: $surface;
  padding: 0 28rpx;
  gap: 8rpx;
}

.filter-tab {
  padding: 20rpx 28rpx;
  border-bottom: 4rpx solid transparent;
  transition: all 0.2s;
}

.filter-tab-text {
  font-size: 24rpx;
  font-weight: 500;
  color: $ink-faint;
  letter-spacing: 1rpx;
}

.filter-tab.active {
  border-bottom-color: $amber;

  .filter-tab-text {
    color: $amber;
    font-weight: 600;
  }
}

// Section Title
.section-title {
  font-size: 26rpx;
  font-weight: 600;
  color: $ink-muted;
  margin: 36rpx 28rpx 16rpx;
  letter-spacing: 2rpx;
  display: block;
}

// Record Item
.record-item {
  background: $surface;
  margin: 16rpx 28rpx;
  border-radius: $radius-md;
  padding: 32rpx;
  box-shadow: $shadow-sm;
  border: 1rpx solid rgba(30, 30, 42, 0.03);
}

.ri-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20rpx;
}

.ri-sku-row {
  display: flex;
  align-items: center;
  gap: 12rpx;
}

.ri-sku-icon {
  width: 36rpx;
  height: 36rpx;
}

.ri-sku {
  font-size: 28rpx;
  font-weight: 600;
  color: $ink;
}

.badge {
  display: inline-flex;
  align-items: center;
  padding: 6rpx 20rpx;
  border-radius: 40rpx;
}

.badge-text {
  font-size: 22rpx;
  font-weight: 600;
  letter-spacing: 1rpx;
}

.badge-pending {
  background: $coral-light;

  .badge-text {
    color: $coral;
  }
}

.badge-confirmed {
  background: $sage-light;

  .badge-text {
    color: $sage;
  }
}

.badge-modified {
  background: $sky-light;

  .badge-text {
    color: $sky;
  }
}

.badge-settled {
  background: $plum-light;

  .badge-text {
    color: $plum;
  }
}

.ri-body {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
}

.ri-info {
  flex: 1;
}

.ri-info-line {
  display: block;
  font-size: 26rpx;
  color: $ink-muted;
  line-height: 1.7;
}

.ri-step {
  color: $amber;
  font-weight: 600;
}

.ri-old-qty {
  text-decoration: line-through;
  color: $ink-faint;
  margin-right: 4rpx;
}

.ri-amount-col {
  flex-shrink: 0;
  margin-left: 16rpx;
}

.ri-amount {
  font-size: 40rpx;
  font-weight: 700;
  color: $ink;
}

// Empty
.empty-hint {
  text-align: center;
  padding: 80rpx 0;
}

.empty-text {
  font-size: 26rpx;
  color: $ink-faint;
}
</style>
