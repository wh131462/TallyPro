<template>
  <view class="skus-page">
    <NavBar title="产品管理" />

    <view class="sku-content">
      <view v-if="skus.length === 0" class="empty-state">
        <image src="/static/icons/package.svg" class="empty-icon" />
        <text class="empty-text">暂无产品，点击下方按钮添加</text>
      </view>

      <view
        v-for="sku in skus"
        :key="sku.id"
        class="sku-card"
        :class="{ 'sku-disabled': !sku.enabled }"
        @tap="onSkuTap(sku)"
      >
        <view v-if="sku.image_url" class="sku-img-wrap">
          <image :src="getImageUrl(sku.image_url)" class="sku-img" mode="aspectFill" />
        </view>
        <view v-else class="sku-icon-wrap" :style="{ background: sku.iconBg }">
          <image :src="sku.icon" class="sku-icon" />
        </view>
        <view class="sku-info">
          <view class="sku-header">
            <text class="sku-name">{{ sku.name }}</text>
            <view class="sku-badge" :class="sku.enabled ? 'badge-active' : 'badge-disabled'">
              <text class="sku-badge-text">{{ sku.enabled ? '启用中' : '已停用' }}</text>
            </view>
          </view>
          <view class="sku-stats">
            <view class="sku-stat">
              <text class="stat-label">工序</text>
              <text class="stat-value">{{ sku.stepCount }}</text>
            </view>
            <view class="stat-divider"></view>
            <view class="sku-stat">
              <text class="stat-label">本月产量</text>
              <text class="stat-value">{{ sku.monthVolume }}</text>
            </view>
          </view>
        </view>
        <image src="/static/icons/arrow-right.svg" class="arrow-icon" />
      </view>
    </view>

    <!-- Bottom spacer: TabBar + bottom-bar -->
    <view class="tab-bar-clearance-with-bar"></view>

    <!-- Add SKU Button — 固定在 TabBar 上方 -->
    <view class="bottom-fixed">
      <view class="bottom-bar">
        <button class="btn-add" @tap="addSku">
          <image src="/static/icons/plus.svg" class="btn-add-icon" />
          <text class="btn-add-text">添加产品</text>
        </button>
      </view>
      <view class="tab-bar-placeholder"></view>
    </view>

    <TabBar role="admin" current="/pages/admin/skus/index" />
  </view>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { onShow } from '@dcloudio/uni-app';
import { api, getImageUrl } from '../../../utils/request';
import { getCurrentWorkshop } from '../../../utils/storage';
import NavBar from '../../../components/NavBar.vue';
import TabBar from '../../../components/TabBar.vue';

interface Sku {
  id: number;
  name: string;
  image_url: string;
  icon: string;
  iconBg: string;
  stepCount: number;
  monthVolume: number;
  enabled: boolean;
}

const workshop = getCurrentWorkshop();
const skus = ref<Sku[]>([]);

const skuIcons: { icon: string; bg: string }[] = [
  { icon: '/static/icons/shirt.svg', bg: '#EBF2F8' },
  { icon: '/static/icons/trousers.svg', bg: '#E8F2EC' },
  { icon: '/static/icons/dress.svg', bg: '#F4EEF6' },
  { icon: '/static/icons/package.svg', bg: '#FFF0E8' },
];

function getSkuIcon(index: number) {
  return skuIcons[index % skuIcons.length];
}

function onSkuTap(sku: Sku) {
  const toggleLabel = sku.enabled ? '停用产品' : '启用产品';
  uni.showActionSheet({
    itemList: ['管理工序', toggleLabel],
    success: (res) => {
      if (res.tapIndex === 0) {
        uni.navigateTo({
          url: `/pages/admin/sku-edit/index?skuId=${sku.id}&skuName=${encodeURIComponent(sku.name)}`,
        });
      } else if (res.tapIndex === 1) {
        toggleSku(sku);
      }
    },
  });
}

async function toggleSku(sku: Sku) {
  const newActive = !sku.enabled;
  try {
    await api.put(`/skus/${sku.id}`, { is_active: newActive } as any);
    uni.showToast({ title: newActive ? '已启用' : '已停用', icon: 'success' });
    loadSkus();
  } catch (e) {
    console.error(e);
  }
}

function addSku() {
  uni.showModal({
    title: '添加产品',
    placeholderText: '请输入产品名称',
    editable: true,
    success: async (res) => {
      if (res.confirm && res.content) {
        const name = res.content.trim();
        if (!name) {
          uni.showToast({ title: '请输入产品名称', icon: 'none' });
          return;
        }
        try {
          const result = await api.post<any>(`/workshops/${workshop!.id}/skus`, { name } as any);
          uni.showToast({ title: '添加成功', icon: 'success' });
          if (result.data?.id) {
            uni.navigateTo({
              url: `/pages/admin/sku-edit/index?skuId=${result.data.id}&skuName=${encodeURIComponent(name)}`,
            });
          } else {
            loadSkus();
          }
        } catch (e) {
          console.error(e);
        }
      }
    },
  });
}

async function loadSkus() {
  if (!workshop || !workshop.id) return;
  try {
    const res = await api.get<any>(`/workshops/${workshop.id}/skus`);
    const list = res.data || [];
    skus.value = (Array.isArray(list) ? list : []).map((s: any, i: number) => {
      const iconInfo = getSkuIcon(i);
      return {
        id: s.id,
        name: s.name || '未命名产品',
        image_url: s.image_url || '',
        icon: iconInfo.icon,
        iconBg: iconInfo.bg,
        stepCount: s.steps?.length || s.step_count || 0,
        monthVolume: s.month_volume || 0,
        enabled: s.is_active !== false,
      };
    });
  } catch (e) {
    console.error('加载产品列表失败', e);
  }
}

onShow(() => {
  loadSkus();
});
</script>

<style lang="scss" scoped>
@use '../../../static/styles/theme.scss' as *;

.skus-page {
  min-height: 100vh;
  background: $cream;
}

.sku-content {
  padding: 24rpx 28rpx;
}

.sku-card {
  display: flex;
  align-items: center;
  gap: 24rpx;
  padding: 28rpx 24rpx;
  background: $surface;
  border-radius: $radius-md;
  margin-bottom: 16rpx;
  box-shadow: $shadow-sm;
  transition: opacity 0.2s;
}

.sku-disabled {
  opacity: 0.6;
}

.sku-img-wrap {
  width: 96rpx;
  height: 96rpx;
  border-radius: $radius-md;
  overflow: hidden;
  flex-shrink: 0;
}

.sku-img-wrap image {
  width: 100%;
  height: 100%;
}

.sku-icon-wrap {
  width: 96rpx;
  height: 96rpx;
  border-radius: $radius-md;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.sku-icon {
  width: 48rpx;
  height: 48rpx;
}

.sku-info {
  flex: 1;
  min-width: 0;
}

.sku-header {
  display: flex;
  align-items: center;
  gap: 12rpx;
  margin-bottom: 12rpx;
}

.sku-name {
  font-size: 30rpx;
  font-weight: 600;
  color: $ink;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.sku-badge {
  padding: 4rpx 14rpx;
  border-radius: $radius-sm;
  flex-shrink: 0;
}

.badge-active {
  background: $sage-light;
}

.badge-active .sku-badge-text {
  color: $sage;
}

.badge-disabled {
  background: $cream-deep;
}

.badge-disabled .sku-badge-text {
  color: $ink-faint;
}

.sku-badge-text {
  font-size: 22rpx;
  font-weight: 500;
}

.sku-stats {
  display: flex;
  align-items: center;
  gap: 20rpx;
}

.sku-stat {
  display: flex;
  align-items: center;
  gap: 8rpx;
}

.stat-label {
  font-size: 24rpx;
  color: $ink-faint;
}

.stat-value {
  font-size: 24rpx;
  color: $ink-muted;
  font-weight: 600;
}

.stat-divider {
  width: 2rpx;
  height: 24rpx;
  background: $cream-deep;
}

.arrow-icon {
  width: 32rpx;
  height: 32rpx;
  opacity: 0.3;
  flex-shrink: 0;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 160rpx 0;
}

.empty-icon {
  width: 128rpx;
  height: 128rpx;
  opacity: 0.2;
  margin-bottom: 24rpx;
}

.empty-text {
  font-size: 28rpx;
  color: $ink-faint;
}

.bottom-bar {
  padding: 20rpx 28rpx;
  background: $surface;
  box-shadow: 0 -4rpx 16rpx rgba(30, 30, 42, 0.06);
}

.btn-add {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12rpx;
  width: 100%;
  height: 92rpx;
  background: $ink;
  border-radius: $radius-lg;
  border: none;
}

.btn-add::after {
  display: none;
}

.btn-add-icon {
  width: 36rpx;
  height: 36rpx;
  flex-shrink: 0;
  filter: brightness(0) invert(1);
}

.btn-add-text {
  font-size: 30rpx;
  font-weight: 600;
  color: #fff;
  letter-spacing: 1rpx;
}
</style>
