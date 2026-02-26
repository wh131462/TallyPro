<template>
  <view class="role-page">
    <view class="role-hint">
      <text class="role-hint-text">请选择您的身份进入</text>
    </view>
    <view class="role-cards">
      <view class="role-card" @tap="selectRole('admin')">
        <view class="role-icon" style="background: rgba(200,149,108,0.12);">
          <image src="/static/icons/factory.svg" class="role-icon-img" />
        </view>
        <view class="role-text">
          <text class="role-name">我是主家</text>
          <text class="role-desc">管理工坊、设置产品工序、审核记录、结算工资</text>
        </view>
        <text class="role-arrow">›</text>
      </view>
      <view class="role-card" @tap="selectRole('worker')">
        <view class="role-icon" style="background: #E8F2EC;">
          <image src="/static/icons/worker.svg" class="role-icon-img" />
        </view>
        <view class="role-text">
          <text class="role-name">我是工人</text>
          <text class="role-desc">绑定工坊、每日填报工量、查看工资明细</text>
        </view>
        <text class="role-arrow">›</text>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { api } from '../../utils/request';
import { setCurrentWorkshop } from '../../utils/storage';

async function selectRole(role: 'admin' | 'worker') {
  try {
    const res = await api.get<any>('/workshops');
    const owned = res.data?.owned || [];
    const joined = res.data?.joined || [];

    if (role === 'admin') {
      if (owned.length > 0) {
        setCurrentWorkshop({ id: owned[0].id, name: owned[0].name, role: 'owner' });
        uni.redirectTo({ url: '/pages/admin/dashboard/index' });
      } else {
        uni.navigateTo({ url: '/pages/create-workshop/index' });
      }
    } else {
      if (joined.length > 0) {
        setCurrentWorkshop({ id: joined[0].id, name: joined[0].name, role: 'worker' });
        uni.redirectTo({ url: '/pages/worker/worklog/index' });
      } else {
        uni.navigateTo({ url: '/pages/worker/bind/index' });
      }
    }
  } catch {
    if (role === 'admin') {
      uni.navigateTo({ url: '/pages/create-workshop/index' });
    } else {
      uni.navigateTo({ url: '/pages/worker/bind/index' });
    }
  }
}
</script>

<style lang="scss" scoped>
@use '../../static/styles/theme.scss' as *;

.role-page {
  min-height: 100vh;
  background: $cream;
}

.role-hint {
  padding: 32rpx 28rpx 0;
  text-align: center;
}

.role-hint-text {
  font-size: 26rpx;
  color: $ink-faint;
  letter-spacing: 2rpx;
}

.role-cards {
  display: flex;
  flex-direction: column;
  gap: 28rpx;
  padding: 40rpx 28rpx;
}

.role-card {
  background: $surface;
  border-radius: $radius-lg;
  padding: 56rpx 48rpx;
  display: flex;
  align-items: center;
  gap: 40rpx;
  position: relative;
  box-shadow: $shadow-md;
  border: 4rpx solid transparent;
}

.role-card:active {
  border-color: $amber-light;
  box-shadow: $shadow-lg;
}

.role-icon {
  width: 128rpx;
  height: 128rpx;
  border-radius: 36rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.role-icon-img {
  width: 60rpx;
  height: 60rpx;
}

.role-text {
  flex: 1;
}

.role-name {
  display: block;
  font-size: 38rpx;
  font-weight: 700;
  color: $ink;
  margin-bottom: 8rpx;
}

.role-desc {
  display: block;
  font-size: 24rpx;
  color: $ink-faint;
  line-height: 1.6;
}

.role-arrow {
  font-size: 48rpx;
  color: $ink-faint;
  flex-shrink: 0;
}
</style>
