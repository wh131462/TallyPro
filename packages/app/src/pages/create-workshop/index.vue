<template>
  <view class="create-page">
    <scroll-view scroll-y class="create-scroll">
      <!-- Header Illustration -->
      <view class="create-header">
        <view class="header-icon-wrap">
          <image src="/static/icons/factory.svg" class="header-icon" />
        </view>
        <text class="header-title">创建你的企业</text>
        <text class="header-desc">创建企业后，可以邀请员工加入并开始记工</text>
      </view>

      <!-- Form Card -->
      <view class="card">
        <view class="form-group">
          <text class="form-label">企业名称</text>
          <input
            class="form-input"
            v-model="form.name"
            placeholder="例如：锦绣服装加企业"
            maxlength="20"
          />
          <text class="form-hint">{{ form.name.length }}/20</text>
        </view>

        <view class="form-group">
          <text class="form-label">企业简介（选填）</text>
          <textarea
            class="form-input form-textarea"
            v-model="form.description"
            placeholder="简要描述企业的主营业务"
            maxlength="100"
          />
          <text class="form-hint">{{ form.description.length }}/100</text>
        </view>
      </view>

      <!-- Tips -->
      <view class="tips-card">
        <view class="tip-item">
          <image src="/static/icons/check.svg" class="tip-icon" />
          <text class="tip-text">创建后可随时修改企业信息</text>
        </view>
        <view class="tip-item">
          <image src="/static/icons/check.svg" class="tip-icon" />
          <text class="tip-text">生成邀请码让员工快速加入</text>
        </view>
        <view class="tip-item">
          <image src="/static/icons/check.svg" class="tip-icon" />
          <text class="tip-text">一键管理产品、工序和结算</text>
        </view>
      </view>

      <view style="height: 160rpx;"></view>
    </scroll-view>

    <!-- Create Button -->
    <view class="bottom-bar">
      <button
        class="btn-primary"
        :class="{ disabled: !canSubmit }"
        :disabled="!canSubmit || submitting"
        @tap="handleCreate"
      >
        {{ submitting ? '创建中...' : '创建企业' }}
      </button>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { api } from '../../utils/request';
import { setCurrentWorkshop } from '../../utils/storage';

const form = ref({
  name: '',
  description: '',
});

const submitting = ref(false);

const canSubmit = computed(() => form.value.name.trim().length >= 2);

async function handleCreate() {
  if (!canSubmit.value || submitting.value) return;

  submitting.value = true;
  try {
    const res = await api.post<any>('/workshops', {
      name: form.value.name.trim(),
      description: form.value.description.trim(),
    });

    if (res.data) {
      // Save workshop info
      setCurrentWorkshop({
        id: res.data.id,
        name: res.data.name,
        role: 'owner',
      });

      uni.showToast({ title: '创建成功', icon: 'success' });

      setTimeout(() => {
        uni.reLaunch({ url: '/pages/admin/dashboard/index' });
      }, 1500);
    }
  } catch {
    uni.showToast({ title: '创建失败，请重试', icon: 'none' });
  } finally {
    submitting.value = false;
  }
}
</script>

<style lang="scss" scoped>
@use '../../static/styles/theme.scss' as *;

.create-page {
  min-height: 100vh;
  background: $cream;
  position: relative;
}

.create-scroll {
  height: 100vh;
}

// Header
.create-header {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 64rpx 28rpx 40rpx;
}

.header-icon-wrap {
  width: 140rpx;
  height: 140rpx;
  border-radius: 40rpx;
  background: $amber-glow;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 32rpx;
}

.header-icon {
  width: 72rpx;
  height: 72rpx;
}

.header-title {
  font-size: 38rpx;
  font-weight: 800;
  color: $ink;
  letter-spacing: 2rpx;
}

.header-desc {
  font-size: 26rpx;
  color: $ink-muted;
  margin-top: 12rpx;
  letter-spacing: 1rpx;
}

// Form
.form-textarea {
  height: 176rpx;
  padding: 24rpx 28rpx;
  line-height: 1.6;
}

.form-hint {
  display: block;
  text-align: right;
  font-size: 22rpx;
  color: $ink-faint;
  margin-top: 8rpx;
}

// Tips
.tips-card {
  margin: 8rpx 28rpx;
  padding: 28rpx 32rpx;
}

.tip-item {
  display: flex;
  align-items: center;
  gap: 16rpx;
  padding: 14rpx 0;
}

.tip-icon {
  width: 28rpx;
  height: 28rpx;
  opacity: 0.5;
}

.tip-text {
  font-size: 26rpx;
  color: $ink-muted;
}

// Bottom Bar
.bottom-bar {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 20rpx 28rpx;
  padding-bottom: calc(20rpx + env(safe-area-inset-bottom));
  background: linear-gradient(to top, $cream 60%, transparent);
}

.btn-primary.disabled {
  opacity: 0.5;
}
</style>
