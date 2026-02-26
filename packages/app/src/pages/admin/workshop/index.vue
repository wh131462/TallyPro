<template>
  <view class="workshop-page">
    <view class="card">
      <view class="form-group">
        <text class="form-label">工坊名称</text>
        <input class="form-input" v-model="form.name" placeholder="请输入工坊名称" />
      </view>
      <view class="form-group">
        <text class="form-label">工坊简介</text>
        <textarea class="form-input form-textarea" v-model="form.description" placeholder="请输入工坊简介" />
      </view>
      <button class="btn-primary" @tap="saveWorkshop">保存修改</button>
    </view>

    <text class="section-title">邀请工人</text>
    <view class="card invite-card">
      <view class="qr-area">
        <view class="qr-box">
          <image src="/static/icons/qrcode.svg" class="qr-placeholder" />
        </view>
        <text class="qr-text">扫描二维码加入工坊</text>
        <text class="invite-code">{{ inviteCode }}</text>
        <text class="invite-expire">有效期至 {{ inviteExpires }}</text>
      </view>
      <view class="invite-btns">
        <button class="btn-outline" style="flex: 1;" @tap="copyCode">复制邀请码</button>
        <button class="btn-primary" style="flex: 1;" @tap="regenerateCode">重新生成</button>
      </view>
    </view>

    <view style="padding: 32rpx 28rpx;">
      <button class="btn-danger" @tap="disableWorkshop">停用工坊</button>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { api } from '../../../utils/request';
import { getCurrentWorkshop } from '../../../utils/storage';

const workshop = getCurrentWorkshop();
const form = ref({ name: '', description: '' });
const inviteCode = ref('------');
const inviteExpires = ref('--');

onMounted(async () => {
  if (!workshop) return;
  try {
    const res = await api.get<any>(`/workshops/${workshop.id}`);
    form.value.name = res.data.name;
    form.value.description = res.data.description;
    inviteCode.value = res.data.invite_code || '------';
    inviteExpires.value = res.data.invite_expires_at?.split('T')[0] || '--';
  } catch (e) {
    console.error('加载工坊信息失败', e);
    form.value.name = workshop?.name || '';
  }
});

async function saveWorkshop() {
  if (!workshop) return;
  try {
    await api.put(`/workshops/${workshop.id}`, form.value as any);
    uni.showToast({ title: '保存成功', icon: 'success' });
  } catch (e) {
    console.error(e);
  }
}

function copyCode() {
  uni.setClipboardData({
    data: inviteCode.value,
    success: () => uni.showToast({ title: '已复制', icon: 'success' }),
  });
}

async function regenerateCode() {
  if (!workshop) return;
  try {
    const res = await api.post<any>(`/workshops/${workshop.id}/invite-code`);
    inviteCode.value = res.data.invite_code;
    inviteExpires.value = res.data.invite_expires_at?.split('T')[0] || '--';
    uni.showToast({ title: '已更新', icon: 'success' });
  } catch (e) {
    console.error(e);
  }
}

function disableWorkshop() {
  uni.showModal({
    title: '确认停用',
    content: '停用后工人将无法提交记录，确定停用吗？',
    success(res) {
      if (res.confirm) {
        uni.showToast({ title: '已停用', icon: 'success' });
      }
    },
  });
}
</script>

<style lang="scss" scoped>
@use '../../../static/styles/theme.scss' as *;

.workshop-page {
  min-height: 100vh;
  background: $cream;
}

.form-textarea {
  height: 176rpx;
  padding: 24rpx 28rpx;
  line-height: 1.6;
}

.invite-card {
  text-align: center;
}

.qr-area {
  padding: 40rpx 0;
}

.qr-box {
  width: 320rpx;
  height: 320rpx;
  margin: 0 auto;
  border: 4rpx dashed $cream-deep;
  border-radius: $radius-md;
  display: flex;
  align-items: center;
  justify-content: center;
  background: $cream;
}

.qr-placeholder {
  width: 128rpx;
  height: 128rpx;
  opacity: 0.3;
}

.qr-text {
  display: block;
  font-size: 24rpx;
  color: $ink-faint;
  margin-top: 24rpx;
}

.invite-code {
  display: block;
  font-size: 56rpx;
  font-weight: 900;
  letter-spacing: 12rpx;
  color: $amber;
  margin-top: 16rpx;
}

.invite-expire {
  display: block;
  font-size: 22rpx;
  color: $ink-faint;
  margin-top: 12rpx;
}

.invite-btns {
  display: flex;
  gap: 16rpx;
  margin-top: 16rpx;
}
</style>
