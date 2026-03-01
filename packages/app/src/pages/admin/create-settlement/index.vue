<template>
  <view class="create-settlement-page">
    <!-- Worker Selection -->
    <text class="section-title">选择员工</text>
    <view class="card worker-list">
      <view v-if="workers.length === 0 && !loading" class="empty-hint">
        <text>暂无可选员工</text>
      </view>
      <view
        v-for="w in workers"
        :key="w.userId"
        class="worker-item"
        :class="{ selected: selectedWorkerId === w.userId }"
        @tap="selectedWorkerId = w.userId"
      >
        <view class="worker-avatar" :style="{ background: w.color }">
          <text class="avatar-text">{{ w.name.charAt(0) }}</text>
        </view>
        <view class="worker-info">
          <text class="worker-name">{{ w.name }}</text>
          <text class="worker-phone">{{ maskPhone(w.phone) }}</text>
        </view>
        <view class="radio-dot" :class="{ checked: selectedWorkerId === w.userId }"></view>
      </view>
    </view>

    <!-- Date Range -->
    <text class="section-title">结算周期</text>
    <view class="card">
      <view class="date-row">
        <text class="date-label">开始日期</text>
        <picker mode="date" :value="periodStart" @change="onStartChange">
          <view class="date-value">
            <text>{{ periodStart }}</text>
            <text class="date-arrow">&#x203A;</text>
          </view>
        </picker>
      </view>
      <view class="date-divider"></view>
      <view class="date-row">
        <text class="date-label">结束日期</text>
        <picker mode="date" :value="periodEnd" @change="onEndChange">
          <view class="date-value">
            <text>{{ periodEnd }}</text>
            <text class="date-arrow">&#x203A;</text>
          </view>
        </picker>
      </view>
    </view>

    <!-- Submit -->
    <view class="bottom-bar">
      <button class="btn-primary create-btn" :disabled="!canSubmit || submitting" @tap="submit">
        {{ submitting ? '创建中...' : '创建结算单' }}
      </button>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { api } from '../../../utils/request';
import { getCurrentWorkshop } from '../../../utils/storage';

interface WorkerOption {
  userId: number;
  name: string;
  phone: string;
  color: string;
}

const workshop = getCurrentWorkshop();
const workers = ref<WorkerOption[]>([]);
const selectedWorkerId = ref<number | null>(null);
const loading = ref(true);
const submitting = ref(false);

const avatarColors = ['#D4845A', '#5B8DB8', '#6B9B7B', '#8B6B96', '#C8956C', '#C75B5B'];

// Default date range: 1st of current month to today
const now = new Date();
const y = now.getFullYear();
const m = String(now.getMonth() + 1).padStart(2, '0');
const d = String(now.getDate()).padStart(2, '0');
const periodStart = ref(`${y}-${m}-01`);
const periodEnd = ref(`${y}-${m}-${d}`);

const canSubmit = computed(() => selectedWorkerId.value !== null && periodStart.value && periodEnd.value);

function maskPhone(phone: string): string {
  if (!phone || phone.length < 7) return phone || '--';
  return phone.slice(0, 3) + '****' + phone.slice(-4);
}

function onStartChange(e: any) {
  periodStart.value = e.detail.value;
}

function onEndChange(e: any) {
  periodEnd.value = e.detail.value;
}

async function loadWorkers() {
  if (!workshop) return;
  try {
    const res = await api.get<any>(`/workshops/${workshop.id}/members`);
    const list = res.data || [];
    workers.value = (Array.isArray(list) ? list : [])
      .filter((m: any) => m.status === 'approved' && m.user)
      .map((m: any, i: number) => ({
        userId: m.user.id,
        name: m.display_name || m.user.nickname || '未命名',
        phone: m.user.phone || '',
        color: avatarColors[i % avatarColors.length],
      }));
  } catch (e) {
    console.error('加载员工列表失败', e);
  } finally {
    loading.value = false;
  }
}

async function submit() {
  if (!workshop || !selectedWorkerId.value || submitting.value) return;

  if (periodStart.value > periodEnd.value) {
    uni.showToast({ title: '开始日期不能晚于结束日期', icon: 'none' });
    return;
  }

  submitting.value = true;
  try {
    const res = await api.post<any>('/settlements', {
      workshop_id: workshop.id,
      worker_id: selectedWorkerId.value,
      period_start: periodStart.value,
      period_end: periodEnd.value,
    });
    uni.showToast({ title: '创建成功', icon: 'success' });
    const settlementId = res.data?.id;
    setTimeout(() => {
      if (settlementId) {
        uni.redirectTo({ url: `/pages/admin/settlement-detail/index?id=${settlementId}` });
      } else {
        uni.navigateBack();
      }
    }, 800);
  } catch (e) {
    console.error('创建结算单失败', e);
  } finally {
    submitting.value = false;
  }
}

onMounted(loadWorkers);
</script>

<style lang="scss" scoped>
@use '../../../static/styles/theme.scss' as *;

.create-settlement-page {
  min-height: 100vh;
  background: $cream;
  padding-bottom: 160rpx;
}

.worker-list {
  padding: 0 !important;
  overflow: hidden;
}

.worker-item {
  display: flex;
  align-items: center;
  gap: 24rpx;
  padding: 28rpx 32rpx;
  border-bottom: 1rpx solid $cream;
  transition: background 0.15s;

  &:last-child {
    border-bottom: none;
  }

  &.selected {
    background: $amber-surface;
  }
}

.worker-avatar {
  width: 80rpx;
  height: 80rpx;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.avatar-text {
  font-size: 32rpx;
  font-weight: 700;
  color: #fff;
}

.worker-info {
  flex: 1;
  min-width: 0;
}

.worker-name {
  display: block;
  font-size: 30rpx;
  font-weight: 600;
  color: $ink;
}

.worker-phone {
  display: block;
  font-size: 24rpx;
  color: $ink-faint;
  margin-top: 4rpx;
}

.radio-dot {
  width: 40rpx;
  height: 40rpx;
  border-radius: 50%;
  border: 3rpx solid $cream-deep;
  flex-shrink: 0;
  position: relative;
  transition: border-color 0.15s;

  &.checked {
    border-color: $amber;

    &::after {
      content: '';
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      width: 22rpx;
      height: 22rpx;
      border-radius: 50%;
      background: $amber;
    }
  }
}

.date-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 28rpx 0;
}

.date-label {
  font-size: 28rpx;
  color: $ink;
  font-weight: 500;
}

.date-value {
  display: flex;
  align-items: center;
  gap: 8rpx;
  font-size: 28rpx;
  color: $ink-muted;
}

.date-arrow {
  font-size: 32rpx;
  color: $ink-faint;
}

.date-divider {
  height: 1rpx;
  background: $cream;
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

.empty-hint {
  padding: 60rpx 0;
  text-align: center;
  font-size: 26rpx;
  color: $ink-faint;
}
</style>
