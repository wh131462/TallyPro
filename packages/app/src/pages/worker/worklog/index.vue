<template>
  <view class="worklog-page">
    <NavBar title="每日记工" />
    <PreviewBanner />

      <!-- Workshop Selector -->
      <view class="workshop-bar" @tap="switchWorkshop">
        <image
          v-if="workshopLogo"
          :src="getImageUrl(workshopLogo)"
          class="ws-bar-logo"
          mode="aspectFill"
        />
        <image v-else src="/static/icons/factory.svg" class="ws-bar-icon" />
        <text class="ws-bar-name">{{ workshopName }}</text>
        <text class="ws-bar-arrow">&#9662;</text>
      </view>

      <!-- Date Navigation Bar -->
      <view class="date-bar">
        <view class="date-nav">
          <view class="date-arrow" @tap="prevDay">
            <image src="/static/icons/arrow-left.svg" class="arrow-icon" />
          </view>
          <text class="date-text">{{ displayDate }}</text>
          <view class="date-arrow" @tap="nextDay">
            <image src="/static/icons/arrow-right.svg" class="arrow-icon" />
          </view>
        </view>
      </view>

      <!-- Frequent Steps -->
      <text class="section-title" v-if="frequentSteps.length > 0">&#11088; 常用工序</text>
      <view
        v-for="item in frequentSteps"
        :key="'freq-' + item.id"
        class="sku-card sku-card-sm"
        @tap="goFill(item.skuId, item.skuName)"
      >
        <view class="sku-img sku-img-sm">
          <image :src="getSkuIcon(item.icon)" class="sku-icon" />
        </view>
        <view class="sku-info">
          <text class="sku-name-sm">{{ item.skuName }} · {{ item.stepName }}</text>
          <text class="sku-price">¥{{ item.price.toFixed(2) }}/件</text>
        </view>
        <view class="sku-add">
          <text class="add-text">+</text>
        </view>
      </view>

      <!-- All Products -->
      <text class="section-title">全部产品</text>
      <view
        v-for="sku in skuList"
        :key="'sku-' + sku.id"
        class="sku-card"
        @tap="goFill(sku.id, sku.name)"
      >
        <view class="sku-img">
          <image :src="getSkuIcon(sku.icon)" class="sku-icon" />
        </view>
        <view class="sku-info">
          <text class="sku-name">{{ sku.name }}</text>
          <text class="sku-step-count">{{ sku.stepCount }} 道工序</text>
        </view>
        <view class="sku-arrow">
          <text class="arrow-text">&#8250;</text>
        </view>
      </view>

      <view v-if="skuList.length === 0 && frequentSteps.length === 0" class="empty-hint">
        <text class="empty-text">暂无产品数据</text>
      </view>

      <view class="tab-bar-clearance"></view>

    <TabBar role="worker" current="/pages/worker/worklog/index" />
  </view>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { onShow } from '@dcloudio/uni-app';
import NavBar from '../../../components/NavBar.vue';
import TabBar from '../../../components/TabBar.vue';
import PreviewBanner from '../../../components/PreviewBanner.vue';
import { api, getImageUrl } from '../../../utils/request';
import { getCurrentWorkshop, setCurrentWorkshop } from '../../../utils/storage';
import { formatDate, getToday, addDays, isToday } from '../../../utils/date';
import { requireLogin } from '../../../utils/auth';

interface FrequentStep {
  id: number;
  skuId: number;
  skuName: string;
  stepName: string;
  price: number;
  icon?: string;
}

interface SkuItem {
  id: number;
  name: string;
  stepCount: number;
  icon?: string;
}

const currentDate = ref(getToday());
const frequentSteps = ref<FrequentStep[]>([]);
const skuList = ref<SkuItem[]>([]);
const workshopName = ref('');
const workshopLogo = ref('');

interface JoinedWorkshop {
  id: number;
  name: string;
  logo_url?: string;
}
const joinedWorkshops = ref<JoinedWorkshop[]>([]);

const displayDate = computed(() => {
  const suffix = isToday(currentDate.value) ? ' (今天)' : '';
  return `${currentDate.value}${suffix}`;
});

function prevDay() {
  currentDate.value = addDays(currentDate.value, -1);
}

function nextDay() {
  currentDate.value = addDays(currentDate.value, 1);
}

function getSkuIcon(icon?: string): string {
  if (!icon) return '/static/icons/trousers.svg';
  if (icon.startsWith('/uploads/') || icon.startsWith('http')) return getImageUrl(icon);
  return `/static/icons/${icon}.svg`;
}

function goFill(skuId: number, name?: string) {
  if (!requireLogin()) return;
  const skuName = encodeURIComponent(name || '');
  uni.navigateTo({
    url: `/pages/worker/fill/index?skuId=${skuId}&skuName=${skuName}&date=${currentDate.value}`,
  });
}

async function loadWorkshops() {
  try {
    const res = await api.get<any>('/workshops');
    const owned = res.data?.owned || [];
    const joined = (res.data?.joined || []).filter((w: any) => w.member_status === 'approved');
    joinedWorkshops.value = [...owned, ...joined].map((w: any) => ({ id: w.id, name: w.name, logo_url: w.logo_url || '' }));
  } catch {
    // ignore
  }
}

function switchWorkshop() {
  if (joinedWorkshops.value.length <= 1) return;
  const workshop = getCurrentWorkshop();
  const names = joinedWorkshops.value.map((w) => w.name);
  uni.showActionSheet({
    itemList: names,
    success(res) {
      const selected = joinedWorkshops.value[res.tapIndex];
      if (selected && selected.id !== workshop?.id) {
        setCurrentWorkshop({ id: selected.id, name: selected.name, role: 'worker', logo_url: selected.logo_url });
        workshopName.value = selected.name;
        workshopLogo.value = selected.logo_url || '';
        loadSkus();
      }
    },
  });
}

async function loadSkus() {
  const workshop = getCurrentWorkshop();
  if (!workshop || !workshop.id) return;
  workshopName.value = workshop.name;
  try {
    const res = await api.get<any>(`/workshops/${workshop.id}/skus`);
    const list = res.data || [];
    skuList.value = (Array.isArray(list) ? list : [])
      .filter((s: any) => s.is_active !== false)
      .map((s: any) => ({
        id: s.id,
        name: s.name,
        stepCount: s.steps?.length || 0,
        icon: s.image_url || undefined,
      }));
  } catch (e) {
    console.error('加载产品列表失败', e);
  }
}

onShow(() => {
  const workshop = getCurrentWorkshop();
  if (workshop) {
    workshopName.value = workshop.name;
    workshopLogo.value = workshop.logo_url || '';
  }
  loadSkus();
  loadWorkshops();
});
</script>

<style lang="scss" scoped>
@use '../../../static/styles/theme.scss' as *;

.worklog-page {
  min-height: 100vh;
  background: $cream;
}

// Workshop Selector
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
  width: 48rpx;
  height: 48rpx;
  border-radius: 50%;
  flex-shrink: 0;
}

.ws-bar-name {
  flex: 1;
  font-size: 28rpx;
  font-weight: 600;
  color: $ink;
  letter-spacing: 1rpx;
}

.ws-bar-arrow {
  font-size: 22rpx;
  color: $ink-faint;
}

// Date Bar
.date-bar {
  background: $surface;
  padding: 24rpx 36rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}

.date-nav {
  display: flex;
  align-items: center;
  gap: 32rpx;
}

.date-arrow {
  width: 56rpx;
  height: 56rpx;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: $cream;
  transition: all 0.15s;

  &:active {
    background: $amber-glow;
  }
}

.arrow-icon {
  width: 28rpx;
  height: 28rpx;
  opacity: 0.5;
}

.date-text {
  font-size: 30rpx;
  font-weight: 600;
  color: $ink;
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

// SKU Card
.sku-card {
  background: $surface;
  margin: 16rpx 28rpx;
  border-radius: $radius-md;
  padding: 32rpx;
  display: flex;
  align-items: center;
  gap: 28rpx;
  box-shadow: $shadow-sm;
  border: 1rpx solid rgba(30, 30, 42, 0.03);
  transition: all 0.2s;

  &:active {
    box-shadow: $shadow-md;
  }
}

.sku-card-sm {
  padding: 24rpx 32rpx;
}

.sku-img {
  width: 104rpx;
  height: 104rpx;
  border-radius: 28rpx;
  background: $cream;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.sku-img-sm {
  width: 84rpx;
  height: 84rpx;
  border-radius: 24rpx;
}

.sku-icon {
  width: 52rpx;
  height: 52rpx;
}

.sku-info {
  flex: 1;
}

.sku-name {
  display: block;
  font-size: 30rpx;
  font-weight: 600;
  color: $ink;
}

.sku-name-sm {
  display: block;
  font-size: 28rpx;
  font-weight: 600;
  color: $ink;
}

.sku-step-count {
  display: block;
  font-size: 24rpx;
  color: $ink-faint;
  margin-top: 6rpx;
}

.sku-price {
  display: block;
  font-size: 24rpx;
  color: $ink-faint;
  margin-top: 6rpx;
}

.sku-arrow {
  flex-shrink: 0;
}

.arrow-text {
  font-size: 36rpx;
  color: $ink-faint;
}

.sku-add {
  flex-shrink: 0;
}

.add-text {
  font-size: 44rpx;
  font-weight: 300;
  color: $amber;
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
