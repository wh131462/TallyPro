<template>
  <view class="bind-page">
    <scroll-view scroll-y class="bind-scroll">
      <!-- QR Code Scan -->
      <view class="bind-input-area">
        <text class="bind-title">扫码绑定</text>
        <view class="scan-box" @tap="handleScan">
          <image src="/static/icons/camera.svg" class="scan-icon" />
        </view>
        <text class="scan-hint">点击扫描企业主二维码</text>
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

      <!-- My Workshops -->
      <view v-if="joinedWorkshops.length > 0">
        <text class="section-title">已加入的企业</text>
        <view class="card" v-for="ws in joinedWorkshops" :key="ws.id" style="margin-bottom: 16rpx;">
          <view class="workshop-row">
            <view class="workshop-icon-wrap">
              <image src="/static/icons/factory.svg" class="workshop-icon" />
            </view>
            <view class="workshop-info">
              <text class="workshop-name">{{ ws.name }}</text>
              <text class="workshop-owner">{{ ws.statusText }}</text>
            </view>
            <view class="badge" :class="ws.badgeClass">{{ ws.badgeLabel }}</view>
          </view>
        </view>
      </view>

      <view style="height: 40rpx;"></view>
    </scroll-view>
  </view>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { api } from '../../../utils/request';

interface JoinedWorkshop {
  id: number;
  name: string;
  statusText: string;
  badgeLabel: string;
  badgeClass: string;
}

const inviteCode = ref('');
const joinedWorkshops = ref<JoinedWorkshop[]>([]);

onMounted(() => {
  loadJoinedWorkshops();
  checkClipboard();
});

async function loadJoinedWorkshops() {
  try {
    const res = await api.get<any>('/workshops');
    const joined = res.data?.joined || [];
    joinedWorkshops.value = joined.map((w: any) => ({
      id: w.id,
      name: w.name,
      statusText: w.member_status === 'pending' ? '等待审批中' : '员工',
      badgeLabel: w.member_status === 'pending' ? '待审批' : '已加入',
      badgeClass: w.member_status === 'pending' ? 'badge-pending' : 'badge-confirmed',
    }));
  } catch {
    // ignore
  }
}

function parseQrResult(raw: string): string {
  // 尝试解析 JSON 格式的二维码内容
  try {
    const data = JSON.parse(raw);
    if (data.type === 'tally_invite' && data.code) {
      return data.code;
    }
  } catch {
    // 非 JSON，当作纯邀请码处理
  }
  return raw.trim();
}

function handleScan() {
  uni.scanCode({
    scanType: ['qrCode'],
    success(res) {
      if (res.result) {
        const code = parseQrResult(res.result);
        if (code.length !== 6) {
          uni.showToast({ title: '无效的邀请码', icon: 'none' });
          return;
        }
        inviteCode.value = code;
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
    loadJoinedWorkshops();
  } catch {
    // Error handled in request interceptor
  }
}

function checkClipboard() {
  uni.getClipboardData({
    success(res) {
      if (!res.data) return;
      const text = res.data.trim();
      // 尝试解析 JSON 格式（从二维码复制的内容）
      let code = '';
      try {
        const parsed = JSON.parse(text);
        if (parsed.type === 'tally_invite' && parsed.code) {
          code = parsed.code;
        }
      } catch {
        // 纯文本，检查是否为6位邀请码
        if (/^[A-Za-z0-9]{6}$/.test(text)) {
          code = text;
        }
      }
      if (!code) return;

      uni.showModal({
        title: '检测到邀请码',
        content: `剪切板中包含邀请码「${code}」，是否自动填入？`,
        confirmText: '填入',
        success(modalRes) {
          if (modalRes.confirm) {
            inviteCode.value = code;
          }
        },
      });
    },
  });
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

.badge-pending {
  background: $amber-surface;
  color: $amber-deep;
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
