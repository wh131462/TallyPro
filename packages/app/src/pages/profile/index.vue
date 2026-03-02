<template>
  <view class="profile-page">
    <NavBar title="个人中心" />

    <!-- Profile Header -->
    <view v-if="isGuest" class="profile-header guest-header" @tap="goLogin">
      <view class="profile-avatar guest-avatar">
        <image src="/static/icons/profile.svg" class="avatar-icon" />
      </view>
      <view class="profile-info">
        <text class="profile-name">登录 / 注册</text>
        <text class="profile-id">登录后解锁全部功能</text>
      </view>
      <text class="item-arrow">›</text>
    </view>
    <view v-else class="profile-header" @tap="goTo('/pages/login/index')">
      <view class="profile-avatar">
        <image
          v-if="userInfo?.avatar_url"
          :src="getImageUrl(userInfo.avatar_url)"
          class="avatar-img"
          mode="aspectFill"
        />
        <image v-else src="/static/icons/profile.svg" class="avatar-icon" />
      </view>
      <view class="profile-info">
        <text class="profile-name">{{ userInfo?.nickname || '用户' }}</text>
        <text class="profile-id">ID: {{ userInfo?.id || '-' }}</text>
      </view>
      <text class="item-arrow">›</text>
    </view>

    <!-- Workshop Switch -->
    <template v-if="!isGuest">
      <text class="section-title">身份切换</text>
      <view class="card" style="padding: 0; overflow: hidden;">
        <view
          class="list-item"
          v-for="(ws, i) in workshops"
          :key="i"
          @tap="switchWorkshop(ws)"
        >
          <view class="icon-box" :style="{ background: ws.role === 'owner' ? 'rgba(200,149,108,0.12)' : '#E8F2EC' }">
            <image
              v-if="ws.logo_url"
              :src="getImageUrl(ws.logo_url)"
              class="icon-logo"
              mode="aspectFill"
            />
            <image v-else :src="ws.role === 'owner' ? '/static/icons/factory.svg' : '/static/icons/worker.svg'" class="icon-img" />
          </view>
          <view class="item-content">
            <text class="item-title">{{ ws.name }}</text>
            <text class="item-desc">{{ ws.role === 'owner' ? '管理员 (企业主)' : ws.isOwnerWorkerMode ? '员工模式 · 记工填报' : '员工' }}</text>
          </view>
          <view v-if="!ws.isOwnerWorkerMode" class="ws-remove-btn" @tap.stop="onRemoveWs(ws)">
            <text class="ws-remove-icon">&times;</text>
          </view>
        </view>
        <view v-if="workshops.length === 0" class="empty-ws">
          <text class="empty-text">暂未加入任何企业</text>
        </view>
        <!-- 添加身份入口 -->
        <view class="list-item add-identity-item" @tap="goTo('/pages/role-select/index?mode=add')">
          <view class="icon-box" style="background: rgba(200,149,108,0.08);">
            <text class="add-icon">+</text>
          </view>
          <view class="item-content">
            <text class="item-title" style="color: rgba(200,149,108,1);">添加新身份</text>
            <text class="item-desc">创建企业或加入其他企业</text>
          </view>
          <text class="item-arrow">›</text>
        </view>
      </view>
    </template>

    <!-- Settings -->
    <text class="section-title">设置</text>
    <view class="card" style="padding: 0; overflow: hidden;">
      <view class="list-item" @tap="goTo('/pages/notifications/index')">
        <view class="icon-box" style="background: #FFF0E8;">
          <image src="/static/icons/bell.svg" class="icon-img" />
        </view>
        <view class="item-content">
          <text class="item-title">消息通知</text>
        </view>
        <text class="item-arrow">›</text>
      </view>
      <view class="list-item" @tap="goTo('/pages/feedback/index')">
        <view class="icon-box" style="background: #F4EEF6;">
          <image src="/static/icons/chat.svg" class="icon-img" />
        </view>
        <view class="item-content">
          <text class="item-title">意见反馈</text>
        </view>
        <text class="item-arrow">›</text>
      </view>
      <view class="list-item" @tap="goTo('/pages/about/index')">
        <view class="icon-box" style="background: #EDE6DA;">
          <image src="/static/icons/info.svg" class="icon-img" />
        </view>
        <view class="item-content">
          <text class="item-title">关于计工宝</text>
        </view>
        <text class="item-arrow">›</text>
      </view>
    </view>

    <!-- Logout -->
    <view v-if="!isGuest" style="padding: 40rpx 28rpx;">
      <button class="btn-danger" @tap="logout">退出登录</button>
    </view>

    <!-- Bottom spacer for TabBar -->
    <view class="tab-bar-clearance"></view>

    <TabBar :role="currentRole" current="/pages/profile/index" />
  </view>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { onShow, onShareAppMessage, onShareTimeline } from '@dcloudio/uni-app';
import { api, getImageUrl } from '../../utils/request';
import { getUserInfo, setCurrentWorkshop, getCurrentWorkshop, clearAll } from '../../utils/storage';
import { removeToken } from '../../utils/request';
import { isGuestMode } from '../../utils/auth';
import { getShareConfig } from '../../utils/share';
import NavBar from '../../components/NavBar.vue';
import TabBar from '../../components/TabBar.vue';

const share = getShareConfig();
onShareAppMessage(share.appMessage);
onShareTimeline(share.timeline);

const isGuest = computed(() => isGuestMode());

const userInfo = ref(getUserInfo());
const workshop = getCurrentWorkshop();
const currentRole = computed(() => workshop?.role === 'owner' ? 'admin' : 'worker');

interface WorkshopItem {
  id: number;
  name: string;
  role: 'owner' | 'worker';
  isOwnerWorkerMode?: boolean;
  logo_url?: string;
}

const workshops = ref<WorkshopItem[]>([]);

function goTo(path: string) {
  uni.navigateTo({ url: path });
}

function goLogin() {
  uni.navigateTo({ url: '/pages/welcome/index' });
}

function switchWorkshop(ws: WorkshopItem) {
  setCurrentWorkshop({ id: ws.id, name: ws.name, role: ws.role, logo_url: ws.logo_url });
  if (ws.role === 'owner') {
    uni.redirectTo({ url: '/pages/admin/dashboard/index' });
  } else {
    uni.redirectTo({ url: '/pages/worker/worklog/index' });
  }
}

function onRemoveWs(ws: WorkshopItem) {
  if (ws.role === 'owner') {
    uni.showModal({
      title: '解散企业',
      content: `确定要解散「${ws.name}」吗？解散后所有员工将被移除。`,
      confirmColor: '#C75B5B',
      success(res) {
        if (res.confirm) {
          doRemoveOwnerWorkshop(ws);
        }
      },
    });
  } else {
    uni.showModal({
      title: '退出企业',
      content: `确定要退出「${ws.name}」吗？退出后需要重新申请加入。`,
      confirmColor: '#C75B5B',
      success(res) {
        if (res.confirm) {
          doLeaveWorkshop(ws);
        }
      },
    });
  }
}

async function doLeaveWorkshop(ws: WorkshopItem) {
  try {
    await api.post(`/workshops/${ws.id}/leave`, {} as any);
    uni.showToast({ title: '已退出企业', icon: 'success' });
    loadWorkshops();
  } catch (e) {
    console.error(e);
  }
}

async function doRemoveOwnerWorkshop(ws: WorkshopItem) {
  try {
    await api.put(`/workshops/${ws.id}`, { status: 'inactive' } as any);
    uni.showToast({ title: '已解散企业', icon: 'success' });
    loadWorkshops();
  } catch (e) {
    console.error(e);
  }
}

function logout() {
  uni.showModal({
    title: '确认退出',
    content: '确定要退出登录吗？',
    success(res) {
      if (res.confirm) {
        removeToken();
        clearAll();
        uni.reLaunch({ url: '/pages/landing/index' });
      }
    },
  });
}

async function loadWorkshops() {
  try {
    const res = await api.get<any>('/workshops');
    const owned = (res.data?.owned || []).flatMap((w: any) => [
      { id: w.id, name: w.name, role: 'owner' as const, logo_url: w.logo_url || '' },
      { id: w.id, name: w.name, role: 'worker' as const, isOwnerWorkerMode: true, logo_url: w.logo_url || '' },
    ]);
    const joined = (res.data?.joined || [])
      .filter((w: any) => w.member_status !== 'pending')
      .map((w: any) => ({
        id: w.id,
        name: w.name,
        role: 'worker' as const,
        logo_url: w.logo_url || '',
      }));
    workshops.value = [...owned, ...joined];
  } catch {
    // 加载失败时不显示任何企业
  }
}

onShow(() => {
  userInfo.value = getUserInfo();
  loadWorkshops();
});
</script>

<style lang="scss" scoped>
@use '../../static/styles/theme.scss' as *;

.profile-page {
  min-height: 100vh;
  background: $cream;
}

.profile-header {
  background: $surface;
  padding: 56rpx 36rpx;
  display: flex;
  align-items: center;
  gap: 36rpx;
}

.guest-header {
  .profile-name {
    color: $amber;
  }
  .profile-id {
    color: $ink-faint;
  }
}

.guest-avatar {
  background:
    radial-gradient(ellipse at 30% 30%, rgba(255,255,255,0.2), transparent),
    linear-gradient(135deg, $ink-faint 0%, $ink-muted 100%);
  box-shadow: 0 8rpx 32rpx rgba(0,0,0,0.1);
}

.profile-avatar {
  width: 136rpx;
  height: 136rpx;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  background:
    radial-gradient(ellipse at 30% 30%, rgba(255,255,255,0.2), transparent),
    linear-gradient(135deg, $amber 0%, $amber-deep 100%);
  box-shadow: 0 8rpx 32rpx rgba(200,149,108,0.3);
  overflow: hidden;
}

.avatar-img {
  width: 136rpx;
  height: 136rpx;
}

.avatar-icon {
  width: 56rpx;
  height: 56rpx;
}

.profile-info {
  flex: 1;
}

.profile-name {
  display: block;
  font-size: 40rpx;
  font-weight: 700;
  color: $ink;
}

.profile-id {
  display: block;
  font-size: 26rpx;
  color: $ink-faint;
  margin-top: 6rpx;
}

.item-content {
  flex: 1;
  min-width: 0;
}

.item-title {
  display: block;
  font-size: 28rpx;
  color: $ink;
  font-weight: 600;
}

.item-desc {
  display: block;
  font-size: 24rpx;
  color: $ink-faint;
  margin-top: 4rpx;
}

.icon-img {
  width: 40rpx;
  height: 40rpx;
}

.icon-logo {
  width: 100%;
  height: 100%;
  border-radius: 50%;
}

.item-arrow {
  font-size: 36rpx;
  color: $ink-faint;
  flex-shrink: 0;
  margin-left: 16rpx;
}

.empty-ws {
  padding: 40rpx;
  text-align: center;
}

.empty-text {
  font-size: 26rpx;
  color: $ink-faint;
}

.add-identity-item {
  border-top: 1rpx solid $cream-deep;
}

.add-icon {
  font-size: 40rpx;
  font-weight: 300;
  color: $amber;
  line-height: 1;
}

.ws-remove-btn {
  width: 56rpx;
  height: 56rpx;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  margin-left: 8rpx;
}

.ws-remove-icon {
  font-size: 36rpx;
  color: $ink-faint;
  line-height: 1;
}
</style>
