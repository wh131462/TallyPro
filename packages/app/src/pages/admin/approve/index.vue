<template>
  <view class="approve-page">
    <scroll-view scroll-y class="approve-scroll">
      <!-- Worker Profile Card -->
      <view class="profile-card">
        <view class="profile-avatar" :style="{ background: avatarColor }">
          <text class="profile-avatar-text">{{ memberInfo.name.charAt(0) }}</text>
        </view>
        <text class="profile-name">{{ memberInfo.name }}</text>
        <text class="profile-phone">{{ memberInfo.phone }}</text>
      </view>

      <!-- Apply Details -->
      <view class="detail-section">
        <text class="section-title">申请信息</text>
        <view class="detail-card">
          <view class="detail-row">
            <text class="detail-label">申请人</text>
            <text class="detail-value">{{ memberInfo.name }}</text>
          </view>
          <view class="detail-row">
            <text class="detail-label">手机号</text>
            <text class="detail-value">{{ memberInfo.phone }}</text>
          </view>
          <view class="detail-row">
            <text class="detail-label">申请时间</text>
            <text class="detail-value">{{ memberInfo.applyTime }}</text>
          </view>
          <view class="detail-row" v-if="memberInfo.source">
            <text class="detail-label">来源</text>
            <text class="detail-value">{{ memberInfo.source }}</text>
          </view>
        </view>
      </view>

      <!-- Remark Name -->
      <view class="detail-section">
        <text class="section-title">备注设置</text>
        <view class="detail-card">
          <view class="form-group">
            <text class="form-label">备注名</text>
            <input
              class="form-input"
              v-model="remarkName"
              placeholder="为该工人设置备注名（选填）"
              :maxlength="20"
            />
          </view>
          <text class="form-hint">备注名仅管理员可见，方便识别工人</text>
        </view>
      </view>

      <view style="height: 180rpx;"></view>
    </scroll-view>

    <!-- Action Buttons -->
    <view class="action-bar safe-bottom">
      <button class="btn-reject" @tap="handleReject" :disabled="loading">
        <text class="btn-reject-text">拒绝</text>
      </button>
      <button class="btn-approve" @tap="handleApprove" :disabled="loading">
        <text class="btn-approve-text">通过</text>
      </button>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { api } from '../../../utils/request';
import { getCurrentWorkshop } from '../../../utils/storage';

const workshop = getCurrentWorkshop();
const memberId = ref<number>(0);
const remarkName = ref('');
const loading = ref(false);
const avatarColor = ref('#D4845A');

const memberInfo = ref({
  name: '--',
  phone: '--',
  applyTime: '--',
  source: '',
});

onMounted(() => {
  // Get memberId from page params
  const pages = getCurrentPages();
  const currentPage = pages[pages.length - 1] as any;
  const options = currentPage?.$page?.options || currentPage?.options || {};
  memberId.value = Number(options.memberId) || 0;

  if (memberId.value) {
    loadMemberDetail();
  }
});

async function loadMemberDetail() {
  if (!workshop || !memberId.value) return;
  try {
    const res = await api.get<any>(`/workshops/${workshop.id}/members/${memberId.value}`);
    const d = res.data;
    const user = d.user || {};
    memberInfo.value = {
      name: d.display_name || user.nickname || '未命名',
      phone: user.phone || d.invited_phone || '--',
      applyTime: d.created_at?.replace('T', ' ').slice(0, 16) || '--',
      source: d.invited_phone ? '手机号邀请' : '邀请码',
    };
    remarkName.value = d.display_name || '';
  } catch (e) {
    console.error('加载成员详情失败', e);
    uni.showToast({ title: '加载失败', icon: 'none' });
  }
}

async function handleApprove() {
  if (!workshop || !memberId.value || loading.value) return;
  loading.value = true;
  try {
    await api.put(`/workshops/${workshop.id}/members/${memberId.value}/approve`, {
      remark_name: remarkName.value || undefined,
    } as any);
    uni.showToast({ title: '已通过', icon: 'success' });
    setTimeout(() => uni.navigateBack(), 1200);
  } catch (e) {
    console.error(e);
  } finally {
    loading.value = false;
  }
}

async function handleReject() {
  if (!workshop || !memberId.value || loading.value) return;
  uni.showModal({
    title: '确认拒绝',
    content: `确定拒绝 ${memberInfo.value.name} 的加入申请吗？`,
    confirmColor: '#C75B5B',
    success: async (res) => {
      if (res.confirm) {
        loading.value = true;
        try {
          await api.put(`/workshops/${workshop!.id}/members/${memberId.value}/reject`, {} as any);
          uni.showToast({ title: '已拒绝', icon: 'none' });
          setTimeout(() => uni.navigateBack(), 1200);
        } catch (e) {
          console.error(e);
        } finally {
          loading.value = false;
        }
      }
    },
  });
}
</script>

<style lang="scss" scoped>
@use '../../../static/styles/theme.scss' as *;

.approve-page {
  min-height: 100vh;
  background: $cream;
  display: flex;
  flex-direction: column;
}

.approve-scroll {
  flex: 1;
}

.profile-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 56rpx 28rpx 48rpx;
  background: $surface;
  margin-bottom: 16rpx;
}

.profile-avatar {
  width: 128rpx;
  height: 128rpx;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 20rpx;
}

.profile-avatar-text {
  font-size: 52rpx;
  font-weight: 700;
  color: #fff;
}

.profile-name {
  font-size: 36rpx;
  font-weight: 700;
  color: $ink;
  margin-bottom: 8rpx;
}

.profile-phone {
  font-size: 26rpx;
  color: $ink-faint;
}

.detail-section {
  padding: 0 28rpx;
  margin-bottom: 8rpx;
}

.section-title {
  display: block;
  font-size: 26rpx;
  font-weight: 600;
  color: $ink-muted;
  padding: 28rpx 0 16rpx;
  letter-spacing: 1rpx;
}

.detail-card {
  background: $surface;
  border-radius: $radius-md;
  padding: 8rpx 28rpx;
  box-shadow: $shadow-sm;
}

.detail-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 24rpx 0;
  border-bottom: 1rpx solid $cream;
}

.detail-row:last-child {
  border-bottom: none;
}

.detail-label {
  font-size: 28rpx;
  color: $ink-muted;
}

.detail-value {
  font-size: 28rpx;
  color: $ink;
  font-weight: 500;
}

.form-group {
  padding: 20rpx 0;
}

.form-label {
  display: block;
  font-size: 26rpx;
  color: $ink-muted;
  margin-bottom: 16rpx;
}

.form-input {
  width: 100%;
  height: 80rpx;
  background: $cream;
  border-radius: $radius-sm;
  padding: 0 24rpx;
  font-size: 28rpx;
  color: $ink;
  box-sizing: border-box;
}

.form-hint {
  display: block;
  font-size: 22rpx;
  color: $ink-faint;
  padding: 0 0 16rpx;
}

.action-bar {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  display: flex;
  gap: 20rpx;
  padding: 20rpx 28rpx;
  background: $surface;
  box-shadow: 0 -4rpx 16rpx rgba(30, 30, 42, 0.06);
}

.btn-reject,
.btn-approve {
  flex: 1;
  height: 92rpx;
  border-radius: $radius-lg;
  display: flex;
  align-items: center;
  justify-content: center;
  border: none;
}

.btn-reject::after,
.btn-approve::after {
  display: none;
}

.btn-reject {
  background: $danger-light;
}

.btn-reject-text {
  font-size: 30rpx;
  font-weight: 600;
  color: $danger;
}

.btn-approve {
  background: $ink;
}

.btn-approve-text {
  font-size: 30rpx;
  font-weight: 600;
  color: #fff;
}

.btn-reject[disabled],
.btn-approve[disabled] {
  opacity: 0.5;
}
</style>
