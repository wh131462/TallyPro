<template>
  <view class="fill-page">
    <scroll-view scroll-y class="fill-scroll">
      <!-- Product Header -->
      <view class="fill-header">
        <view class="fh-left">
          <image :src="skuIcon" class="fh-icon" />
          <view class="fh-info">
            <text class="fh-name">{{ skuName }}</text>
            <text class="fh-date">{{ displayDate }}</text>
          </view>
        </view>
      </view>

      <!-- Step List -->
      <view
        v-for="(step, index) in steps"
        :key="step.id"
        class="step-item"
      >
        <view class="sfi-info">
          <text class="sfi-name">{{ step.name }}</text>
          <text class="sfi-price">¥{{ step.price.toFixed(2) }} / 件</text>
        </view>
        <view class="number-input">
          <view class="ni-btn" @tap="decrement(index)">
            <text class="ni-btn-text">−</text>
          </view>
          <input
            class="ni-value"
            type="number"
            v-model="step.quantity"
            @blur="onQuantityBlur(index)"
          />
          <view class="ni-btn" @tap="increment(index)">
            <text class="ni-btn-text">+</text>
          </view>
        </view>
      </view>

      <!-- Amount Highlight -->
      <view class="amount-highlight" v-if="steps.length > 0">
        <view class="amount-row">
          <text class="amount-label">预计金额</text>
          <text class="amount-value">¥{{ totalAmount }}</text>
        </view>
        <text class="amount-detail">{{ amountBreakdown }}</text>
      </view>

      <!-- Submit Button -->
      <view class="submit-wrap">
        <button class="btn-primary" @tap="handleSubmit" :disabled="!hasAnyQuantity">提交记录</button>
      </view>

      <view style="height: 40rpx;"></view>
    </scroll-view>
  </view>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { onLoad } from '@dcloudio/uni-app';
import { api } from '../../../utils/request';
import { getCurrentWorkshop } from '../../../utils/storage';
import { getToday, isToday } from '../../../utils/date';

interface StepItem {
  id: number;
  name: string;
  price: number;
  quantity: string;
}

const skuId = ref(0);
const skuName = ref('---');
const skuIcon = ref('/static/icons/trousers.svg');
const currentDate = ref(getToday());
const steps = ref<StepItem[]>([]);

const displayDate = computed(() => {
  const suffix = isToday(currentDate.value) ? ' (今天)' : '';
  return `${currentDate.value}${suffix}`;
});

const totalAmount = computed(() => {
  let total = 0;
  steps.value.forEach((s) => {
    const qty = parseInt(s.quantity) || 0;
    total += qty * s.price;
  });
  return total.toFixed(2);
});

const amountBreakdown = computed(() => {
  const parts = steps.value
    .filter((s) => parseInt(s.quantity) > 0)
    .map((s) => `${s.name} ${s.quantity}×${s.price.toFixed(2)}`);
  return parts.join(' + ');
});

const hasAnyQuantity = computed(() => {
  return steps.value.some((s) => parseInt(s.quantity) > 0);
});

function increment(index: number) {
  const step = steps.value[index];
  step.quantity = String((parseInt(step.quantity) || 0) + 1);
}

function decrement(index: number) {
  const step = steps.value[index];
  const val = parseInt(step.quantity) || 0;
  if (val > 0) {
    step.quantity = String(val - 1);
  }
}

function onQuantityBlur(index: number) {
  const step = steps.value[index];
  const val = parseInt(step.quantity) || 0;
  step.quantity = String(Math.max(0, val));
}

async function handleSubmit() {
  if (!hasAnyQuantity.value) {
    uni.showToast({ title: '请填写数量', icon: 'none' });
    return;
  }

  const workshop = getCurrentWorkshop();
  if (!workshop) {
    uni.showToast({ title: '请先选择企业', icon: 'none' });
    return;
  }

  const recordList = steps.value
    .filter((s) => parseInt(s.quantity) > 0)
    .map((s) => ({
      step_id: s.id,
      quantity: parseInt(s.quantity),
    }));

  try {
    await api.post('/records/batch', {
      workshop_id: workshop.id,
      work_date: currentDate.value,
      records: recordList,
    } as any);
    uni.showToast({ title: '提交成功', icon: 'success' });
    setTimeout(() => {
      uni.navigateBack();
    }, 1500);
  } catch {
    // Error handled in request interceptor
  }
}

onLoad(async (query: Record<string, string> | undefined) => {
  if (query?.skuId) {
    skuId.value = parseInt(query.skuId);
  }
  if (query?.skuName) {
    skuName.value = decodeURIComponent(query.skuName);
  }
  if (query?.date) {
    currentDate.value = query.date;
  }

  if (skuId.value) {
    try {
      const res = await api.get<any>(`/skus/${skuId.value}/steps`);
      const data = res.data || {};
      const list = data.steps || data || [];
      // Use SKU name from API response if not passed via query
      if (data.sku_name && skuName.value === '---') {
        skuName.value = data.sku_name;
      }
      steps.value = (Array.isArray(list) ? list : []).map((s: any) => ({
        id: s.id,
        name: s.name,
        price: Number(s.unit_price || s.price) || 0,
        quantity: '0',
      }));
    } catch (e) {
      console.error('加载工序失败', e);
    }
  }
});
</script>

<style lang="scss" scoped>
@use '../../../static/styles/theme.scss' as *;

.fill-page {
  min-height: 100vh;
  background: $cream;
}

.fill-scroll {
  height: 100vh;
}

// Product Header
.fill-header {
  background: $surface;
  padding: 32rpx 36rpx;
  border-bottom: 1rpx solid $cream;
}

.fh-left {
  display: flex;
  align-items: center;
  gap: 24rpx;
}

.fh-icon {
  width: 64rpx;
  height: 64rpx;
}

.fh-info {
  flex: 1;
}

.fh-name {
  display: block;
  font-size: 32rpx;
  font-weight: 700;
  color: $ink;
}

.fh-date {
  display: block;
  font-size: 24rpx;
  color: $ink-faint;
  margin-top: 6rpx;
}

// Step Items
.step-item {
  background: $surface;
  margin: 16rpx 28rpx;
  border-radius: $radius-md;
  padding: 32rpx;
  display: flex;
  justify-content: space-between;
  align-items: center;
  box-shadow: $shadow-sm;
  border: 1rpx solid rgba(30, 30, 42, 0.03);
}

.sfi-info {
  flex: 1;
}

.sfi-name {
  display: block;
  font-size: 30rpx;
  font-weight: 600;
  color: $ink;
}

.sfi-price {
  display: block;
  font-size: 24rpx;
  color: $amber;
  margin-top: 6rpx;
  font-weight: 500;
}

// Number Input
.number-input {
  display: flex;
  align-items: center;
  border: 3rpx solid $cream-deep;
  border-radius: $radius-sm;
  overflow: hidden;
  background: $cream;
}

.ni-btn {
  width: 76rpx;
  height: 76rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  background: transparent;
  transition: background 0.15s;

  &:active {
    background: $amber-glow;
  }
}

.ni-btn-text {
  font-size: 36rpx;
  color: $amber;
  font-weight: 600;
}

.ni-value {
  width: 112rpx;
  height: 76rpx;
  text-align: center;
  border: none;
  border-left: 3rpx solid $cream-deep;
  border-right: 3rpx solid $cream-deep;
  font-size: 32rpx;
  font-weight: 700;
  color: $ink;
  background: $surface;
}

// Amount Highlight
.amount-highlight {
  background: $amber-surface;
  border: 1rpx solid rgba(200, 149, 108, 0.15);
  border-radius: $radius-md;
  padding: 32rpx;
  margin: 20rpx 28rpx;
}

.amount-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.amount-label {
  font-size: 28rpx;
  color: $ink-muted;
}

.amount-value {
  font-size: 48rpx;
  font-weight: 900;
  color: $amber-deep;
}

.amount-detail {
  display: block;
  font-size: 22rpx;
  color: $ink-faint;
  margin-top: 8rpx;
}

// Submit
.submit-wrap {
  padding: 0 28rpx 32rpx;
}

.btn-primary {
  width: 100%;
  height: 88rpx;
  line-height: 88rpx;
  background: linear-gradient(135deg, $amber 0%, $amber-deep 100%);
  color: #fff;
  font-size: 28rpx;
  font-weight: 600;
  border-radius: $radius-sm;
  border: none;
  letter-spacing: 1rpx;
  box-shadow: 0 4rpx 24rpx rgba(200, 149, 108, 0.3);

  &[disabled] {
    opacity: 0.5;
  }

  &::after {
    border: none;
  }
}
</style>
