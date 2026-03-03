<template>
  <view class="workshop-page">
    <view class="card">
      <view class="logo-section" @tap="changeLogo">
        <view class="logo-wrap">
          <image
            v-if="form.logo_url"
            :src="getImageUrl(form.logo_url)"
            class="logo-img"
            mode="aspectFill"
          />
          <image v-else src="/static/icons/factory.svg" class="logo-placeholder" />
        </view>
        <text class="logo-hint">点击更换企业 Logo</text>
      </view>
      <view class="form-group">
        <text class="form-label">企业名称</text>
        <input class="form-input" v-model="form.name" placeholder="请输入企业名称" />
      </view>
      <view class="form-group">
        <text class="form-label">企业简介</text>
        <textarea class="form-input form-textarea" v-model="form.description" placeholder="请输入企业简介" />
      </view>
      <button class="btn-primary" @tap="saveWorkshop">保存修改</button>
    </view>

    <text class="section-title">邀请员工</text>
    <view class="card invite-card">
      <view class="qr-area">
        <view class="qr-box" v-if="qrValue">
          <QRCode ref="qrRef" :value="qrValue" :size="280" @ready="qrReady = true" />
        </view>
        <view class="qr-box qr-box--empty" v-else>
          <image src="/static/icons/qrcode.svg" class="qr-placeholder" />
        </view>
        <text class="qr-text">扫描二维码加入企业</text>
        <text class="invite-code">{{ inviteCode }}</text>
        <text class="invite-expire">有效期至 {{ inviteExpires }}</text>
      </view>
      <view class="invite-btns">
        <button class="btn-outline" style="flex: 1;" @tap="copyCode">复制邀请码</button>
        <button class="btn-outline" style="flex: 1;" @tap="saveQrImage">保存二维码</button>
        <button class="btn-primary" style="flex: 1;" @tap="regenerateCode">重新生成</button>
      </view>
    </view>

    <view style="padding: 32rpx 28rpx;">
      <button class="btn-danger" @tap="disableWorkshop">停用企业</button>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { api } from '../../../utils/request';
import { getCurrentWorkshop, setCurrentWorkshop } from '../../../utils/storage';
import { chooseAndUploadImage, getImageUrl } from '../../../utils/request';
import QRCode from '../../../components/QRCode.vue';

const workshop = getCurrentWorkshop();
const form = ref({ name: '', description: '', logo_url: '' });
const inviteCode = ref('------');
const inviteExpires = ref('--');
const qrRef = ref<InstanceType<typeof QRCode> | null>(null);
const qrReady = ref(false);

// 二维码内容：使用 JSON 格式，包含邀请码和企业信息，方便扫码端解析
const qrValue = computed(() => {
  if (!inviteCode.value || inviteCode.value === '------') return '';
  return JSON.stringify({
    type: 'tally_invite',
    code: inviteCode.value,
    workshop: workshop?.name || '',
  });
});

onMounted(async () => {
  if (!workshop || !workshop.id) return;
  try {
    const res = await api.get<any>(`/workshops/${workshop.id}`);
    form.value.name = res.data.name;
    form.value.description = res.data.description;
    form.value.logo_url = res.data.logo_url || '';
    inviteCode.value = res.data.invite_code || '------';
    inviteExpires.value = res.data.invite_expires_at?.split('T')[0] || '--';
  } catch (e) {
    console.error('加载企业信息失败', e);
    form.value.name = workshop?.name || '';
  }
});

async function changeLogo() {
  try {
    const url = await chooseAndUploadImage();
    form.value.logo_url = url;
  } catch {
    // 用户取消选择，忽略
  }
}

async function saveWorkshop() {
  if (!workshop || !workshop.id) return;
  try {
    await api.put(`/workshops/${workshop.id}`, form.value as any);
    // 同步更新本地缓存，确保其他页面能读到最新数据
    setCurrentWorkshop({
      id: workshop.id,
      name: form.value.name,
      role: workshop.role,
      logo_url: form.value.logo_url,
    });
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
  if (!workshop || !workshop.id) return;
  try {
    const res = await api.post<any>(`/workshops/${workshop.id}/invite-code`);
    inviteCode.value = res.data.invite_code;
    inviteExpires.value = res.data.invite_expires_at?.split('T')[0] || '--';
    uni.showToast({ title: '已更新', icon: 'success' });
  } catch (e) {
    console.error(e);
  }
}

async function saveQrImage() {
  if (!qrRef.value || !qrReady.value) {
    uni.showToast({ title: '二维码未就绪', icon: 'none' });
    return;
  }
  try {
    const tempPath = await qrRef.value.toTempFilePath();
    uni.saveImageToPhotosAlbum({
      filePath: tempPath,
      success: () => uni.showToast({ title: '已保存到相册', icon: 'success' }),
      fail: (err) => {
        if (err.errMsg?.includes('auth deny') || err.errMsg?.includes('authorize')) {
          uni.showModal({
            title: '提示',
            content: '需要授权访问相册才能保存图片',
            confirmText: '去设置',
            success(res) {
              if (res.confirm) uni.openSetting({});
            },
          });
        } else {
          uni.showToast({ title: '保存失败', icon: 'none' });
        }
      },
    });
  } catch {
    uni.showToast({ title: '生成图片失败', icon: 'none' });
  }
}

function disableWorkshop() {
  uni.showModal({
    title: '确认停用',
    content: '停用后员工将无法提交记录，确定停用吗？',
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

.logo-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 40rpx 0 32rpx;
}

.logo-wrap {
  width: 160rpx;
  height: 160rpx;
  border-radius: 50%;
  background: $cream;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  border: 4rpx dashed $cream-deep;
}

.logo-img {
  width: 160rpx;
  height: 160rpx;
}

.logo-placeholder {
  width: 64rpx;
  height: 64rpx;
  opacity: 0.4;
}

.logo-hint {
  font-size: 22rpx;
  color: $ink-faint;
  margin-top: 16rpx;
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
  border-radius: $radius-md;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #fff;
  overflow: hidden;
}

.qr-box--empty {
  border: 4rpx dashed $cream-deep;
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

  .btn-outline,
  .btn-primary {
    font-size: 24rpx;
    height: 72rpx;
    padding: 0 12rpx;
  }
}
</style>
