<template>
  <view class="salary-page">
    <NavBar title="" :transparent="true" textColor="#fff" />
    <PreviewBanner />

      <!-- Workshop Name -->
      <view class="workshop-bar-overlay" v-if="workshopName">
        <image src="/static/icons/factory.svg" class="ws-overlay-icon" />
        <text class="ws-overlay-name">{{ workshopName }}</text>
      </view>

      <!-- Gradient Header -->
      <view class="salary-header">
        <view class="salary-month-nav">
          <view class="month-arrow" @tap="prevMonth">
            <text class="month-arrow-text">&#8249;</text>
          </view>
          <text class="salary-month">{{ displayMonth }}</text>
          <view class="month-arrow" @tap="nextMonth">
            <text class="month-arrow-text">&#8250;</text>
          </view>
        </view>
        <text class="salary-total">¥{{ salaryTotal }}</text>
        <text class="salary-unit">本月累计收入</text>
      </view>

      <!-- Stats Row -->
      <view class="stats-row">
        <view class="stat-card">
          <text class="stat-value stat-sage">¥{{ settledAmount }}</text>
          <text class="stat-label">已结算</text>
        </view>
        <view class="stat-card">
          <text class="stat-value stat-coral">¥{{ pendingAmount }}</text>
          <text class="stat-label">待结算</text>
        </view>
      </view>

      <!-- Income Details -->
      <text class="section-title">收入明细</text>
      <view class="card detail-card" v-if="details.length > 0">
        <view
          v-for="(item, index) in details"
          :key="index"
          class="list-item"
          :class="{ 'last-item': index === details.length - 1 }"
        >
          <view class="item-content">
            <text class="item-title">{{ item.skuName }} · {{ item.stepName }}</text>
            <text class="item-desc">¥{{ item.price.toFixed(2) }} × {{ item.quantity }} 件</text>
          </view>
          <text class="item-amount">¥{{ item.amount.toFixed(2) }}</text>
        </view>
      </view>
      <view class="card empty-card" v-else>
        <text class="empty-text">暂无收入记录</text>
      </view>

      <view class="tab-bar-clearance"></view>

    <TabBar role="worker" current="/pages/worker/salary/index" />
  </view>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import NavBar from '../../../components/NavBar.vue';
import TabBar from '../../../components/TabBar.vue';
import PreviewBanner from '../../../components/PreviewBanner.vue';
import { api } from '../../../utils/request';
import { getCurrentWorkshop } from '../../../utils/storage';

interface DetailItem {
  skuName: string;
  stepName: string;
  price: number;
  quantity: number;
  amount: number;
}

const currentYear = ref(new Date().getFullYear());
const currentMonth = ref(new Date().getMonth() + 1);
const salaryTotal = ref('0.00');
const settledAmount = ref('0');
const pendingAmount = ref('0');
const details = ref<DetailItem[]>([]);
const workshopName = ref('');

const displayMonth = computed(() => {
  return `${currentYear.value}年${currentMonth.value}月`;
});

function prevMonth() {
  if (currentMonth.value === 1) {
    currentMonth.value = 12;
    currentYear.value--;
  } else {
    currentMonth.value--;
  }
  fetchSalary();
}

function nextMonth() {
  if (currentMonth.value === 12) {
    currentMonth.value = 1;
    currentYear.value++;
  } else {
    currentMonth.value++;
  }
  fetchSalary();
}

async function fetchSalary() {
  const workshop = getCurrentWorkshop();
  if (!workshop || !workshop.id) return;
  workshopName.value = workshop.name;
  try {
    const res = await api.get<any>(`/records/worker-salary?workshop_id=${workshop.id}&year=${currentYear.value}&month=${currentMonth.value}`);
    if (res.data) {
      salaryTotal.value = String(res.data.total || '0.00');
      settledAmount.value = String(res.data.settled || '0');
      pendingAmount.value = String(res.data.pending || '0');
      details.value = (res.data.details || []).map((d: any) => ({
        skuName: d.sku_name,
        stepName: d.step_name,
        price: d.price || 0,
        quantity: d.quantity || 0,
        amount: d.amount || 0,
      }));
    }
  } catch (e) {
    console.error('加载工资数据失败', e);
  }
}

onMounted(() => {
  fetchSalary();
});
</script>

<style lang="scss" scoped>
@use '../../../static/styles/theme.scss' as *;

.salary-page {
  min-height: 100vh;
  background: $cream;
}

// Workshop overlay on gradient
.workshop-bar-overlay {
  padding: 12rpx 36rpx;
  display: flex;
  align-items: center;
  gap: 12rpx;
  background: rgba(0, 0, 0, 0.08);
}

.ws-overlay-icon {
  width: 32rpx;
  height: 32rpx;
  opacity: 0.7;
}

.ws-overlay-name {
  font-size: 26rpx;
  font-weight: 500;
  color: $ink-muted;
  letter-spacing: 1rpx;
}

// Salary Header
.salary-header {
  padding: 56rpx 36rpx;
  color: #fff;
  text-align: center;
  position: relative;
  overflow: hidden;
  background:
    radial-gradient(ellipse at 50% 0%, rgba(200, 149, 108, 0.5) 0%, transparent 70%),
    linear-gradient(160deg, $amber-deep 0%, #9B6B45 100%);
}

.salary-month-nav {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 24rpx;
  position: relative;
}

.month-arrow {
  width: 56rpx;
  height: 56rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;

  &:active {
    background: rgba(255, 255, 255, 0.15);
  }
}

.month-arrow-text {
  font-size: 40rpx;
  color: rgba(255, 255, 255, 0.7);
}

.salary-month {
  font-size: 28rpx;
  opacity: 0.7;
  letter-spacing: 2rpx;
  position: relative;
}

.salary-total {
  display: block;
  font-size: 76rpx;
  font-weight: 900;
  margin-top: 16rpx;
  position: relative;
  letter-spacing: 2rpx;
}

.salary-unit {
  display: block;
  font-size: 24rpx;
  opacity: 0.6;
  position: relative;
  letter-spacing: 2rpx;
  margin-top: 8rpx;
}

// Stats Row
.stats-row {
  display: flex;
  gap: 20rpx;
  padding: 0 28rpx;
  margin-top: 24rpx;
}

.stat-card {
  flex: 1;
  background: $surface;
  border-radius: $radius-md;
  padding: 32rpx 24rpx;
  text-align: center;
  box-shadow: $shadow-sm;
  border: 1rpx solid rgba(30, 30, 42, 0.03);
}

.stat-value {
  display: block;
  font-size: 36rpx;
  font-weight: 700;
}

.stat-sage {
  color: $sage;
}

.stat-coral {
  color: $coral;
}

.stat-label {
  display: block;
  font-size: 22rpx;
  color: $ink-faint;
  margin-top: 8rpx;
  letter-spacing: 1rpx;
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

// Detail Card
.card {
  background: $surface;
  margin: 0 28rpx;
  border-radius: $radius-md;
  box-shadow: $shadow-sm;
  border: 1rpx solid rgba(30, 30, 42, 0.03);
  overflow: hidden;
}

.detail-card {
  padding: 0;
}

.list-item {
  padding: 28rpx 32rpx;
  display: flex;
  align-items: center;
  border-bottom: 1rpx solid $cream;
  transition: background 0.15s;

  &:active {
    background: $cream;
  }
}

.last-item {
  border-bottom: none;
}

.item-content {
  flex: 1;
  min-width: 0;
}

.item-title {
  display: block;
  font-size: 28rpx;
  color: $ink;
  font-weight: 600;
}

.item-desc {
  display: block;
  font-size: 24rpx;
  color: $ink-faint;
  margin-top: 6rpx;
}

.item-amount {
  font-size: 28rpx;
  font-weight: 700;
  color: $ink;
  flex-shrink: 0;
  margin-left: 16rpx;
}

// Empty
.empty-card {
  text-align: center;
  padding: 60rpx 32rpx;
}

.empty-text {
  font-size: 26rpx;
  color: $ink-faint;
}
</style>
