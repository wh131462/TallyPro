<template>
  <view class="detail-page">
    <scroll-view scroll-y class="detail-scroll">
      <!-- Amount Highlight Box -->
      <view class="amount-box">
        <view class="ab-header">
          <view class="ab-worker">
            <view class="ab-avatar">
              <image src="/static/icons/profile.svg" class="ab-avatar-icon" />
            </view>
            <view class="ab-info">
              <text class="ab-name">{{ detail.worker_name }}</text>
              <text class="ab-period">{{ detail.start_date }} ~ {{ detail.end_date }}</text>
            </view>
          </view>
          <view
            class="badge"
            :class="detail.status === 'confirmed' ? 'badge-confirmed' : 'badge-pending'"
          >
            {{ detail.status === 'confirmed' ? '已确认' : '草稿' }}
          </view>
        </view>
        <view class="ab-total">
          <text class="ab-total-label">结算总额</text>
          <text class="ab-total-value">¥{{ detail.total_amount }}</text>
        </view>
      </view>

      <!-- Product Sections -->
      <view v-for="(section, idx) in detail.sections" :key="idx" class="product-section">
        <view class="ps-header">
          <view class="ps-icon-wrap">
            <image src="/static/icons/package.svg" class="ps-icon" />
          </view>
          <text class="ps-name">{{ section.product_name }}</text>
          <text class="ps-subtotal">¥{{ section.subtotal }}</text>
        </view>

        <view class="ps-items">
          <view v-for="(item, i) in section.items" :key="i" class="ps-item">
            <text class="psi-step">{{ item.step_name }}</text>
            <text class="psi-calc">¥{{ item.price }} x {{ item.quantity }}</text>
            <text class="psi-amount">¥{{ item.amount }}</text>
          </view>
        </view>
      </view>

      <!-- Empty State -->
      <view v-if="!loading && detail.sections.length === 0" class="empty-state">
        <image src="/static/icons/clipboard.svg" class="empty-icon" />
        <text class="empty-text">暂无结算明细</text>
      </view>

      <view style="height: 160rpx;"></view>
    </scroll-view>

    <!-- Export Button -->
    <view class="bottom-bar">
      <button class="btn-primary export-btn" @tap="exportReport">
        <image src="/static/icons/export.svg" class="export-icon" />
        <text>导出报表</text>
      </button>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { api } from '../../../utils/request';

interface SectionItem {
  step_name: string;
  price: string;
  quantity: number;
  amount: string;
}

interface ProductSection {
  product_name: string;
  subtotal: string;
  items: SectionItem[];
}

interface SettlementDetail {
  id: number;
  worker_name: string;
  start_date: string;
  end_date: string;
  total_amount: string;
  status: 'confirmed' | 'draft';
  sections: ProductSection[];
}

const loading = ref(true);
const settlementId = ref<number>(0);

const detail = ref<SettlementDetail>({
  id: 0,
  worker_name: '',
  start_date: '',
  end_date: '',
  total_amount: '0.00',
  status: 'draft',
  sections: [],
});

function exportReport() {
  uni.showToast({ title: '导出功能开发中', icon: 'none' });
}

onMounted(async () => {
  // Read page params
  const pages = getCurrentPages();
  const currentPage = pages[pages.length - 1] as any;
  const options = currentPage?.$page?.options || currentPage?.options || {};
  settlementId.value = Number(options.id) || 0;

  if (!settlementId.value) {
    loading.value = false;
    return;
  }

  try {
    const res = await api.get<any>(`/settlements/${settlementId.value}`);
    if (res.data) {
      const d = res.data;
      const worker = d.worker || {};
      const items = d.items || [];

      // Group items by SKU
      const sectionMap = new Map<string, ProductSection>();
      for (const item of items) {
        const skuName = item.sku_name || '未知产品';
        let section = sectionMap.get(skuName);
        if (!section) {
          section = { product_name: skuName, subtotal: '0.00', items: [] };
          sectionMap.set(skuName, section);
        }
        const amount = Number(item.amount) || (Number(item.unit_price) * (item.quantity || 0));
        section.items.push({
          step_name: item.step_name || '未知工序',
          price: String(Number(item.unit_price || 0).toFixed(2)),
          quantity: item.quantity || 0,
          amount: String(amount.toFixed(2)),
        });
      }

      // Calculate subtotals
      for (const section of sectionMap.values()) {
        const subtotal = section.items.reduce((sum, i) => sum + parseFloat(i.amount), 0);
        section.subtotal = subtotal.toFixed(2);
      }

      detail.value = {
        id: d.id,
        worker_name: worker.nickname || '未知员工',
        start_date: d.period_start || '',
        end_date: d.period_end || '',
        total_amount: d.total_amount || '0.00',
        status: d.status === 'confirmed' ? 'confirmed' : 'draft',
        sections: Array.from(sectionMap.values()),
      };
    }
  } catch (e) {
    console.error('加载结算详情失败', e);
  } finally {
    loading.value = false;
  }
});
</script>

<style lang="scss" scoped>
@use '../../../static/styles/theme.scss' as *;

.detail-page {
  min-height: 100vh;
  background: $cream;
  position: relative;
}

.detail-scroll {
  height: 100vh;
}

// Amount Highlight Box
.amount-box {
  margin: 20rpx 28rpx;
  background: $surface;
  border-radius: $radius-md;
  padding: 32rpx;
  box-shadow: $shadow-md;
}

.ab-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 28rpx;
}

.ab-worker {
  display: flex;
  align-items: center;
  gap: 20rpx;
}

.ab-avatar {
  width: 80rpx;
  height: 80rpx;
  border-radius: 50%;
  background: $amber-glow;
  display: flex;
  align-items: center;
  justify-content: center;
}

.ab-avatar-icon {
  width: 40rpx;
  height: 40rpx;
}

.ab-name {
  display: block;
  font-size: 32rpx;
  font-weight: 700;
  color: $ink;
}

.ab-period {
  display: block;
  font-size: 22rpx;
  color: $ink-faint;
  margin-top: 6rpx;
  letter-spacing: 1rpx;
}

.ab-total {
  background: $amber-surface;
  border-radius: $radius-sm;
  padding: 28rpx 32rpx;
  text-align: center;
}

.ab-total-label {
  display: block;
  font-size: 24rpx;
  color: $ink-muted;
  letter-spacing: 2rpx;
}

.ab-total-value {
  display: block;
  font-size: 56rpx;
  font-weight: 900;
  color: $amber;
  margin-top: 8rpx;
  letter-spacing: 2rpx;
}

// Product Sections
.product-section {
  margin: 20rpx 28rpx;
  background: $surface;
  border-radius: $radius-md;
  overflow: hidden;
  box-shadow: $shadow-sm;
}

.ps-header {
  display: flex;
  align-items: center;
  gap: 16rpx;
  padding: 28rpx 32rpx;
  border-bottom: 1rpx solid $cream;
}

.ps-icon-wrap {
  width: 56rpx;
  height: 56rpx;
  border-radius: 16rpx;
  background: $amber-glow;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.ps-icon {
  width: 28rpx;
  height: 28rpx;
}

.ps-name {
  flex: 1;
  font-size: 28rpx;
  font-weight: 700;
  color: $ink;
}

.ps-subtotal {
  font-size: 28rpx;
  font-weight: 700;
  color: $amber;
}

.ps-items {
  padding: 8rpx 0;
}

.ps-item {
  display: flex;
  align-items: center;
  padding: 20rpx 32rpx;
}

.psi-step {
  flex: 1;
  font-size: 26rpx;
  color: $ink-soft;
}

.psi-calc {
  font-size: 24rpx;
  color: $ink-faint;
  margin-right: 24rpx;
}

.psi-amount {
  font-size: 28rpx;
  font-weight: 600;
  color: $ink;
  min-width: 120rpx;
  text-align: right;
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

// Bottom Bar
.bottom-bar {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 20rpx 28rpx;
  padding-bottom: calc(20rpx + env(safe-area-inset-bottom));
  background: linear-gradient(to top, $cream 60%, transparent);
}

.export-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12rpx;
}

.export-icon {
  width: 32rpx;
  height: 32rpx;
}
</style>
