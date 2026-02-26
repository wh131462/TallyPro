<template>
  <view class="bind-page">
    <scroll-view scroll-y class="bind-scroll">
      <!-- QR Code Scan -->
      <view class="bind-input-area">
        <text class="bind-title">扫码绑定</text>
        <view class="scan-box" @tap="handleScan">
          <image src="/static/icons/camera.svg" class="scan-icon" />
        </view>
        <text class="scan-hint">点击扫描主家二维码</text>
      </view>

      <!-- Divider -->
      <view class="bind-divider">
        <view class="divider-line"></view>
        <text class="divider-text">或</text>
        <view class="divider-line"></view>
      </view>

      <!-- Invite Code Input -->
      <view class="bind-input-area">
        <text class="bind-title">输入邀请码</text>
        <input
          class="invite-input"
          v-model="inviteCode"
          placeholder="请输入6位邀请码"
          maxlength="6"
        />
        <view class="btn-wrap">
          <button class="btn-primary" :disabled="inviteCode.length < 6" @tap="handleJoin">申请加入</button>
        </view>
      </view>

      <!-- My Workshop -->
      <text class="section-title">我的工坊</text>
      <view class="card" v-if="currentWorkshop">
        <view class="workshop-row">
          <view class="workshop-icon-wrap">
            <image src="/static/icons/factory.svg" class="workshop-icon" />
          </view>
          <view class="workshop-info">
            <text class="workshop-name">{{ currentWorkshop.name }}</text>
            <text class="workshop-owner">主家: {{ currentWorkshop.ownerName || '---' }}</text>
          </view>
          <view class="badge badge-confirmed">已绑定</view>
        </view>
      </view>
      <view class="card empty-card" v-else>
        <text class="empty-text">暂未绑定工坊</text>
      </view>

      <view style="height: 40rpx;"></view>
    </scroll-view>
  </view>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { api } from '../../../utils/request';
import { getCurrentWorkshop } from '../../../utils/storage';

interface WorkshopDetail {
  id: number;
  name: string;
  ownerName?: string;
  status?: string;
}

const inviteCode = ref('');
const currentWorkshop = ref<WorkshopDetail | null>(null);

onMounted(async () => {
  const ws = getCurrentWorkshop();
  if (ws) {
    try {
      const res = await api.get<any>(`/workshops/${ws.id}`);
      currentWorkshop.value = {
        id: res.data.id,
        name: res.data.name,
        ownerName: res.data.owner?.nickname,
        status: res.data.status,
      };
    } catch {
      currentWorkshop.value = {
        id: ws.id,
        name: ws.name,
      };
    }
  }
});

function handleScan() {
  uni.scanCode({
    scanType: ['qrCode'],
    success(res) {
      if (res.result) {
        inviteCode.value = res.result;
        handleJoin();
      }
    },
    fail() {
      uni.showToast({ title: '扫码失败', icon: 'none' });
    },
  });
}

async function handleJoin() {
  if (inviteCode.value.length < 6) {
    uni.showToast({ title: '请输入完整邀请码', icon: 'none' });
    return;
  }
  try {
    await api.post('/workshops/join', { invite_code: inviteCode.value } as any);
    uni.showToast({ title: '申请已提交', icon: 'success' });
    inviteCode.value = '';
  } catch {
    // Error handled in request interceptor
  }
}
</script>

<style lang="scss" scoped>
@use '../../../static/styles/theme.scss' as *;

.bind-page {
  min-height: 100vh;
  background: $cream;
}

.bind-scroll {
  height: 100vh;
}

.bind-input-area {
  background: $surface;
  margin: 28rpx 28rpx;
  border-radius: $radius-lg;
  padding: 48rpx 36rpx;
  text-align: center;
  box-shadow: $shadow-sm;
  border: 1rpx solid rgba(30, 30, 42, 0.03);
}

.bind-title {
  display: block;
  font-size: 32rpx;
  font-weight: 600;
  color: $ink;
  margin-bottom: 36rpx;
  letter-spacing: 1rpx;
}

.scan-box {
  width: 200rpx;
  height: 200rpx;
  margin: 0 auto;
  background: $cream;
  border-radius: $radius-md;
  display: flex;
  align-items: center;
  justify-content: center;
}

.scan-icon {
  width: 80rpx;
  height: 80rpx;
  opacity: 0.4;
}

.scan-hint {
  display: block;
  font-size: 24rpx;
  color: $ink-faint;
  margin-top: 20rpx;
}

.bind-divider {
  display: flex;
  align-items: center;
  gap: 28rpx;
  margin: 12rpx 28rpx;
}

.divider-line {
  flex: 1;
  height: 1rpx;
  background: linear-gradient(90deg, transparent, $cream-deep, transparent);
}

.divider-text {
  font-size: 24rpx;
  color: $ink-faint;
  letter-spacing: 4rpx;
}

.invite-input {
  width: 100%;
  height: 88rpx;
  border: 3rpx solid $cream-deep;
  border-radius: $radius-sm;
  text-align: center;
  letter-spacing: 12rpx;
  font-size: 40rpx;
  font-weight: 700;
  color: $ink;
  background: $cream;
  transition: all 0.2s;

  &:focus {
    border-color: $amber;
    background: $surface;
    box-shadow: 0 0 0 6rpx $amber-glow;
  }
}

.btn-wrap {
  margin-top: 28rpx;
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

.section-title {
  font-size: 26rpx;
  font-weight: 600;
  color: $ink-muted;
  margin: 36rpx 28rpx 16rpx;
  letter-spacing: 2rpx;
  display: block;
}

.card {
  background: $surface;
  margin: 0 28rpx;
  border-radius: $radius-md;
  padding: 32rpx;
  box-shadow: $shadow-sm;
  border: 1rpx solid rgba(30, 30, 42, 0.03);
}

.workshop-row {
  display: flex;
  align-items: center;
  gap: 28rpx;
}

.workshop-icon-wrap {
  width: 84rpx;
  height: 84rpx;
  border-radius: 24rpx;
  background: $amber-glow;
  display: flex;
  align-items: center;
  justify-content: center;
}

.workshop-icon {
  width: 44rpx;
  height: 44rpx;
}

.workshop-info {
  flex: 1;
}

.workshop-name {
  display: block;
  font-size: 30rpx;
  font-weight: 600;
  color: $ink;
}

.workshop-owner {
  display: block;
  font-size: 24rpx;
  color: $ink-faint;
  margin-top: 4rpx;
}

.badge {
  display: inline-flex;
  align-items: center;
  padding: 6rpx 20rpx;
  border-radius: 40rpx;
  font-size: 22rpx;
  font-weight: 600;
  letter-spacing: 1rpx;
}

.badge-confirmed {
  background: $sage-light;
  color: $sage;
}

.empty-card {
  text-align: center;
  padding: 60rpx 32rpx;
}

.empty-text {
  font-size: 26rpx;
  color: $ink-faint;
}
</style>
