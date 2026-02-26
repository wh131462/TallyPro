<template>
  <view class="settlement-page">
    <scroll-view scroll-y class="settlement-scroll safe-bottom">
      <!-- Stats Row -->
      <view class="stats-row">
        <view class="stat-card">
          <text class="stat-label">本月总工资</text>
          <text class="stat-value">¥{{ totalSalary }}</text>
        </view>
        <view class="stat-card">
          <text class="stat-label">已结算</text>
          <text class="stat-value settled">¥{{ settledAmount }}</text>
        </view>
      </view>

      <!-- Settlement List -->
      <view class="settlement-list">
        <view
          v-for="item in settlements"
          :key="item.id"
          class="settlement-card"
          @tap="goDetail(item.id)"
        >
          <view class="sc-header">
            <view class="sc-period">
              <image src="/static/icons/calendar.svg" class="sc-period-icon" />
              <text class="sc-period-text">{{ item.start_date }} ~ {{ item.end_date }}</text>
            </view>
            <view
              class="badge"
              :class="item.status === 'confirmed' ? 'badge-confirmed' : 'badge-pending'"
            >
              {{ item.status === 'confirmed' ? '已确认' : '草稿' }}
            </view>
          </view>

          <view class="sc-body">
            <view class="sc-worker">
              <view class="sc-avatar">
                <image src="/static/icons/profile.svg" class="sc-avatar-icon" />
              </view>
              <text class="sc-worker-name">{{ item.worker_name }}</text>
            </view>
            <text class="sc-amount">¥{{ item.total_amount }}</text>
          </view>

          <view class="sc-footer">
            <text class="sc-meta">{{ item.record_count }} 条记录</text>
            <text class="sc-meta-dot">·</text>
            <text class="sc-meta">{{ item.product_count }} 个产品</text>
          </view>
        </view>

        <!-- Empty State -->
        <view v-if="!loading && settlements.length === 0" class="empty-state">
          <image src="/static/icons/money.svg" class="empty-icon" />
          <text class="empty-text">暂无结算记录</text>
          <text class="empty-hint">点击下方按钮创建第一份结算单</text>
        </view>
      </view>

      <view style="height: 40rpx;"></view>
    </scroll-view>

    <!-- Create Button -->
    <view class="bottom-bar">
      <button class="btn-primary create-btn" @tap="createSettlement">
        <image src="/static/icons/plus.svg" class="create-icon" />
        <text>创建结算单</text>
      </button>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { api } from '../../../utils/request';
import { getCurrentWorkshop } from '../../../utils/storage';

interface Settlement {
  id: number;
  worker_name: string;
  start_date: string;
  end_date: string;
  total_amount: string;
  status: 'confirmed' | 'draft';
  record_count: number;
  product_count: number;
}

const workshop = getCurrentWorkshop();
const settlements = ref<Settlement[]>([]);
const totalSalary = ref('0.00');
const settledAmount = ref('0.00');
const loading = ref(true);

function goDetail(id: number) {
  uni.navigateTo({ url: `/pages/admin/settlement-detail/index?id=${id}` });
}

function createSettlement() {
  uni.showToast({ title: '功能开发中', icon: 'none' });
}

onMounted(async () => {
  if (!workshop) {
    loading.value = false;
    return;
  }
  try {
    const res = await api.get<any>(`/settlements?workshop_id=${workshop.id}`);
    if (res.data) {
      const list = res.data.list || res.data || [];
      settlements.value = (Array.isArray(list) ? list : []).map((s: any) => ({
        id: s.id,
        worker_name: s.worker?.nickname || '未知工人',
        start_date: s.period_start || '',
        end_date: s.period_end || '',
        total_amount: s.total_amount || '0.00',
        status: s.status === 'confirmed' ? 'confirmed' : 'draft',
        record_count: s.record_count || 0,
        product_count: s.product_count || 0,
      }));
      // Calculate totals from the list
      let total = 0;
      let settled = 0;
      for (const s of settlements.value) {
        const amt = parseFloat(String(s.total_amount).replace(/,/g, '')) || 0;
        total += amt;
        if (s.status === 'confirmed') settled += amt;
      }
      totalSalary.value = total.toFixed(2);
      settledAmount.value = settled.toFixed(2);
    }
  } catch (e) {
    console.error('加载结算列表失败', e);
  } finally {
    loading.value = false;
  }
});
</script>

<style lang="scss" scoped>
@use '../../../static/styles/theme.scss' as *;

.settlement-page {
  min-height: 100vh;
  background: $cream;
  position: relative;
}

.settlement-scroll {
  height: 100vh;
}

.stats-row {
  display: flex;
  gap: 16rpx;
  padding: 24rpx 28rpx 0;
}

.stat-card {
  flex: 1;
  background: $surface;
  border-radius: $radius-md;
  padding: 32rpx 28rpx;
  box-shadow: $shadow-sm;
}

.stat-label {
  display: block;
  font-size: 24rpx;
  color: $ink-faint;
  letter-spacing: 1rpx;
}

.stat-value {
  display: block;
  font-size: 44rpx;
  font-weight: 800;
  color: $amber;
  margin-top: 12rpx;
  letter-spacing: 1rpx;
}

.stat-value.settled {
  color: $sage;
}

.settlement-list {
  padding: 16rpx 0;
}

.settlement-card {
  background: $surface;
  margin: 16rpx 28rpx;
  border-radius: $radius-md;
  padding: 28rpx 32rpx;
  box-shadow: $shadow-sm;
}

.sc-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24rpx;
}

.sc-period {
  display: flex;
  align-items: center;
  gap: 10rpx;
}

.sc-period-icon {
  width: 28rpx;
  height: 28rpx;
  opacity: 0.4;
}

.sc-period-text {
  font-size: 24rpx;
  color: $ink-muted;
  letter-spacing: 1rpx;
}

.sc-body {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20rpx;
}

.sc-worker {
  display: flex;
  align-items: center;
  gap: 16rpx;
}

.sc-avatar {
  width: 72rpx;
  height: 72rpx;
  border-radius: 50%;
  background: $amber-glow;
  display: flex;
  align-items: center;
  justify-content: center;
}

.sc-avatar-icon {
  width: 36rpx;
  height: 36rpx;
}

.sc-worker-name {
  font-size: 30rpx;
  font-weight: 600;
  color: $ink;
}

.sc-amount {
  font-size: 40rpx;
  font-weight: 800;
  color: $amber;
  letter-spacing: 1rpx;
}

.sc-footer {
  display: flex;
  align-items: center;
  gap: 12rpx;
  padding-top: 20rpx;
  border-top: 1rpx solid $cream;
}

.sc-meta {
  font-size: 22rpx;
  color: $ink-faint;
}

.sc-meta-dot {
  font-size: 22rpx;
  color: $ink-faint;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 100rpx 0;
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

.empty-hint {
  font-size: 24rpx;
  color: $ink-faint;
  margin-top: 12rpx;
}

.bottom-bar {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 20rpx 28rpx;
  padding-bottom: calc(20rpx + env(safe-area-inset-bottom));
  background: linear-gradient(to top, $cream 60%, transparent);
}

.create-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12rpx;
}

.create-icon {
  width: 32rpx;
  height: 32rpx;
}
</style>
