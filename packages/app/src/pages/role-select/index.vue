<template>
  <view class="role-page">
    <view class="role-hint">
      <text class="role-hint-text">{{ isAddMode ? '选择要添加的身份' : '请选择您的身份进入' }}</text>
    </view>
    <view class="role-cards">
      <view class="role-card" @tap="selectRole('admin')">
        <view class="role-icon" style="background: rgba(200,149,108,0.12);">
          <image src="/static/icons/factory.svg" class="role-icon-img" />
        </view>
        <view class="role-text">
          <text class="role-name">我是企业主</text>
          <text class="role-desc">管理企业、设置产品工序、审核记录、结算工资</text>
        </view>
        <text class="role-arrow">›</text>
      </view>
      <view class="role-card" @tap="selectRole('worker')">
        <view class="role-icon" style="background: #E8F2EC;">
          <image src="/static/icons/worker.svg" class="role-icon-img" />
        </view>
        <view class="role-text">
          <text class="role-name">我是员工</text>
          <text class="role-desc">绑定企业、每日填报工量、查看工资明细</text>
        </view>
        <text class="role-arrow">›</text>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { api } from '../../utils/request';
import { setCurrentWorkshop } from '../../utils/storage';

const isAddMode = ref(false);

onMounted(() => {
  const pages = getCurrentPages();
  const currentPage = pages[pages.length - 1] as any;
  const options = currentPage?.$page?.options || currentPage?.options || {};
  isAddMode.value = options.mode === 'add';
});

function enterWorkshop(ws: { id: number; name: string; logo_url?: string }, role: 'owner' | 'worker') {
  setCurrentWorkshop({ id: ws.id, name: ws.name, role, logo_url: ws.logo_url });
  if (role === 'owner') {
    uni.redirectTo({ url: '/pages/admin/dashboard/index' });
  } else {
    uni.redirectTo({ url: '/pages/worker/worklog/index' });
  }
}

function pickAndEnter(list: { id: number; name: string; logo_url?: string }[], role: 'owner' | 'worker') {
  if (list.length === 1) {
    enterWorkshop(list[0], role);
    return;
  }
  uni.showActionSheet({
    itemList: list.map((w) => w.name),
    success(res) {
      enterWorkshop(list[res.tapIndex], role);
    },
  });
}

async function selectRole(role: 'admin' | 'worker') {
  // 添加新身份模式：始终走创建/加入流程
  if (isAddMode.value) {
    if (role === 'admin') {
      uni.navigateTo({ url: '/pages/create-workshop/index' });
    } else {
      uni.navigateTo({ url: '/pages/worker/bind/index' });
    }
    return;
  }

  try {
    const res = await api.get<any>('/workshops');
    const owned = res.data?.owned || [];
    const joined = (res.data?.joined || []).filter((w: any) => w.member_status === 'approved');

    if (role === 'admin') {
      if (owned.length > 0) {
        pickAndEnter(owned, 'owner');
      } else {
        uni.navigateTo({ url: '/pages/create-workshop/index' });
      }
    } else {
      const workerList = [...joined, ...owned];
      if (workerList.length > 0) {
        pickAndEnter(workerList, 'worker');
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
