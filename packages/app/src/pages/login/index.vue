<template>
  <view class="profile-edit-page">
    <view class="edit-header">
      <view class="avatar-picker" @tap="pickAvatar">
        <image
          v-if="avatarUrl"
          :src="getImageUrl(avatarUrl)"
          class="avatar-image"
          mode="aspectFill"
        />
        <view v-else class="avatar-placeholder">
          <image src="/static/icons/profile.svg" class="edit-icon" />
        </view>
        <view class="avatar-badge">
          <image src="/static/icons/camera.svg" class="avatar-badge-icon" />
        </view>
      </view>
      <text class="edit-title">个人信息</text>
      <text class="edit-desc">设置您的头像和昵称</text>
    </view>

    <view class="edit-form">
      <view class="form-group">
        <text class="form-label">昵称</text>
        <input class="form-input" v-model="nickname" placeholder="请输入昵称" :maxlength="20" />
      </view>
      <button class="btn-primary" @tap="saveProfile">保存</button>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { api, chooseAndUploadImage, getImageUrl } from '../../utils/request';
import { getUserInfo, setUserInfo } from '../../utils/storage';

const nickname = ref('');
const avatarUrl = ref('');

onMounted(() => {
  const user = getUserInfo();
  if (user?.nickname) {
    nickname.value = user.nickname;
  }
  if (user?.avatar_url) {
    avatarUrl.value = user.avatar_url;
  }
});

async function pickAvatar() {
  try {
    const url = await chooseAndUploadImage();
    avatarUrl.value = url;
  } catch {
    // cancelled or failed
  }
}

async function saveProfile() {
  const name = nickname.value.trim();
  if (!name) {
    uni.showToast({ title: '请输入昵称', icon: 'none' });
    return;
  }
  try {
    await api.put<any>('/auth/profile', {
      nickname: name,
      avatar_url: avatarUrl.value,
    });
    // 更新本地缓存
    const user = getUserInfo();
    if (user) {
      user.nickname = name;
      user.avatar_url = avatarUrl.value;
      setUserInfo(user);
    }
    uni.showToast({ title: '保存成功', icon: 'success' });
    setTimeout(() => {
      uni.navigateBack();
    }, 1000);
  } catch (e) {
    console.error(e);
  }
}
</script>

<style lang="scss" scoped>
@use '../../static/styles/theme.scss' as *;

.profile-edit-page {
  min-height: 100vh;
  background: $surface;
}

.edit-header {
  padding: 80rpx 48rpx 60rpx;
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.avatar-picker {
  position: relative;
  width: 168rpx;
  height: 168rpx;
  margin-bottom: 28rpx;
}

.avatar-image {
  width: 168rpx;
  height: 168rpx;
  border-radius: 50%;
}

.avatar-placeholder {
  width: 168rpx;
  height: 168rpx;
  border-radius: 50%;
  background: $amber-glow;
  display: flex;
  align-items: center;
  justify-content: center;
}

.edit-icon {
  width: 64rpx;
  height: 64rpx;
}

.avatar-badge {
  position: absolute;
  right: 0;
  bottom: 0;
  width: 52rpx;
  height: 52rpx;
  border-radius: 50%;
  background: $ink;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 4rpx solid $surface;
}

.avatar-badge-icon {
  width: 28rpx;
  height: 28rpx;
}

.edit-title {
  display: block;
  font-size: 36rpx;
  font-weight: 700;
  color: $ink;
}

.edit-desc {
  display: block;
  font-size: 26rpx;
  color: $ink-faint;
  margin-top: 12rpx;
}

.edit-form {
  padding: 0 48rpx;
}

.form-group {
  margin-bottom: 32rpx;
}

.form-label {
  display: block;
  font-size: 26rpx;
  color: $ink-muted;
  margin-bottom: 12rpx;
  font-weight: 500;
}

.form-input {
  width: 100%;
  height: 88rpx;
  background: $cream;
  border-radius: $radius-sm;
  padding: 0 24rpx;
  font-size: 28rpx;
  color: $ink;
  box-sizing: border-box;
}
</style>
