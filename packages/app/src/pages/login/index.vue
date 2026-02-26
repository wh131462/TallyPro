<template>
  <view class="login-page">
    <view class="login-header">
      <view class="login-icon-wrap">
        <image src="/static/icons/phone.svg" class="login-icon" />
      </view>
      <text class="login-title">绑定手机号</text>
      <text class="login-desc">绑定后可被主家通过手机号添加</text>
    </view>

    <view class="login-form">
      <view class="form-group">
        <view class="phone-row">
          <input class="form-input phone-input" type="number" v-model="phone" placeholder="请输入手机号" maxlength="11" />
          <button class="code-btn" :disabled="codeCd > 0" @tap="sendCode">
            {{ codeCd > 0 ? `${codeCd}s` : '获取验证码' }}
          </button>
        </view>
      </view>
      <view class="form-group">
        <input class="form-input" type="number" v-model="code" placeholder="请输入验证码" maxlength="6" />
      </view>
      <button class="btn-primary" @tap="bindPhone">确认绑定</button>

      <!-- #ifdef MP-WEIXIN -->
      <view class="wx-phone-link">
        <button class="wx-phone-btn" open-type="getPhoneNumber" @getphonenumber="onGetPhoneNumber">
          使用微信手机号快速验证 ›
        </button>
      </view>
      <!-- #endif -->
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { api } from '../../utils/request';

const phone = ref('');
const code = ref('');
const codeCd = ref(0);

let timer: ReturnType<typeof setInterval> | null = null;

function sendCode() {
  if (!phone.value || phone.value.length !== 11) {
    uni.showToast({ title: '请输入正确的手机号', icon: 'none' });
    return;
  }
  codeCd.value = 60;
  timer = setInterval(() => {
    codeCd.value--;
    if (codeCd.value <= 0 && timer) {
      clearInterval(timer);
      timer = null;
    }
  }, 1000);
  uni.showToast({ title: '验证码已发送', icon: 'success' });
}

async function bindPhone() {
  if (!phone.value || !code.value) {
    uni.showToast({ title: '请填写完整信息', icon: 'none' });
    return;
  }
  try {
    await api.post('/auth/bind-phone', { phone: phone.value, code: code.value });
    uni.showToast({ title: '绑定成功', icon: 'success' });
    setTimeout(() => {
      uni.redirectTo({ url: '/pages/role-select/index' });
    }, 1000);
  } catch (e) {
    console.error(e);
  }
}

function onGetPhoneNumber(e: any) {
  if (e.detail.errMsg === 'getPhoneNumber:ok') {
    console.log('WeChat phone number:', e.detail);
    uni.redirectTo({ url: '/pages/role-select/index' });
  }
}
</script>

<style lang="scss" scoped>
@use '../../static/styles/theme.scss' as *;

.login-page {
  min-height: 100vh;
  background: $surface;
}

.login-header {
  padding: 80rpx 48rpx 60rpx;
  text-align: center;
}

.login-icon-wrap {
  width: 144rpx;
  height: 144rpx;
  margin: 0 auto 28rpx;
  border-radius: 50%;
  background: $amber-glow;
  display: flex;
  align-items: center;
  justify-content: center;
}

.login-icon {
  width: 64rpx;
  height: 64rpx;
}

.login-title {
  display: block;
  font-size: 36rpx;
  font-weight: 700;
  color: $ink;
}

.login-desc {
  display: block;
  font-size: 26rpx;
  color: $ink-faint;
  margin-top: 12rpx;
}

.login-form {
  padding: 0 48rpx;
}

.phone-row {
  display: flex;
  gap: 16rpx;
}

.phone-input {
  flex: 1;
}

.code-btn {
  padding: 0 32rpx;
  background: $amber;
  color: #fff;
  border: none;
  border-radius: $radius-sm;
  font-size: 26rpx;
  font-weight: 600;
  white-space: nowrap;
  line-height: 88rpx;
  height: 88rpx;
}

.code-btn::after {
  border: none;
}

.code-btn[disabled] {
  background: $ink-faint;
  color: #fff;
}

.wx-phone-link {
  text-align: center;
  margin-top: 40rpx;
}

.wx-phone-btn {
  background: transparent;
  color: $amber;
  font-size: 26rpx;
  font-weight: 500;
  border: none;
  padding: 0;
  line-height: 2;
}

.wx-phone-btn::after {
  border: none;
}
</style>
