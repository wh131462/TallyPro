<template>
  <view class="workers-page">
    <!-- Filter Tabs -->
    <view class="filter-bar">
      <view
        v-for="tab in tabs"
        :key="tab.key"
        class="filter-tab"
        :class="{ active: currentTab === tab.key }"
        @tap="currentTab = tab.key"
      >
        <text class="filter-tab-text">{{ tab.label }}</text>
        <view v-if="tab.badge > 0" class="tab-badge">
          <text class="tab-badge-text">{{ tab.badge }}</text>
        </view>
      </view>
    </view>

    <!-- Worker List -->
    <scroll-view scroll-y class="worker-scroll">
      <view v-if="filteredWorkers.length === 0" class="empty-state">
        <image src="/static/icons/people.svg" class="empty-icon" />
        <text class="empty-text">暂无员工数据</text>
      </view>

      <view
        v-for="worker in filteredWorkers"
        :key="worker.id"
        class="worker-card"
        @tap="onWorkerTap(worker)"
      >
        <view v-if="worker.avatarUrl" class="worker-avatar">
          <image :src="getImageUrl(worker.avatarUrl)" class="worker-avatar-img" mode="aspectFill" />
        </view>
        <view v-else class="worker-avatar" :style="{ background: worker.avatarColor }">
          <text class="avatar-text">{{ worker.name.charAt(0) }}</text>
        </view>
        <view class="worker-info">
          <view class="worker-name-row">
            <text class="worker-name">{{ worker.name }}</text>
            <view class="status-badge" :class="statusClass(worker.status)">
              <text class="status-text">{{ statusLabel(worker.status) }}</text>
            </view>
          </view>
          <view class="worker-meta">
            <text class="meta-item">{{ maskPhone(worker.phone) }}</text>
            <text class="meta-divider">|</text>
            <text class="meta-item">{{ worker.recordCount }} 条记录</text>
          </view>
        </view>
        <image
          v-if="worker.status === 'pending' || worker.status === 'active'"
          src="/static/icons/arrow-right.svg"
          class="arrow-icon"
        />
      </view>

      <view style="height: 160rpx;"></view>
    </scroll-view>

    <!-- Invite Button -->
    <view class="bottom-bar safe-bottom">
      <button class="btn-add" @tap="showInvite = true">
        <image src="/static/icons/plus.svg" class="btn-add-icon" />
        <text class="btn-add-text">邀请员工加入</text>
      </button>
    </view>

    <!-- Invite Modal -->
    <view v-if="showInvite" class="modal-mask">
      <view class="modal-content">
        <text class="modal-title">邀请员工</text>
        <text class="modal-desc">让员工扫描二维码或输入邀请码加入企业</text>

        <view class="qr-area">
          <QRCode v-if="inviteCode" :value="qrValue" :size="360" />
        </view>

        <view class="invite-code-row">
          <text class="invite-code-label">邀请码</text>
          <text class="invite-code-value">{{ inviteCode }}</text>
          <view class="copy-btn" @tap="copyCode">
            <text class="copy-btn-text">复制</text>
          </view>
        </view>

        <view class="modal-actions">
          <button class="btn-refresh" @tap="refreshCode">刷新邀请码</button>
          <button class="btn-close" @tap="showInvite = false">关闭</button>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { api, getImageUrl } from '../../../utils/request';
import { getCurrentWorkshop } from '../../../utils/storage';
import QRCode from '../../../components/QRCode.vue';

interface Worker {
  id: number;
  name: string;
  phone: string;
  status: 'active' | 'pending' | 'removed';
  recordCount: number;
  avatarColor: string;
  avatarUrl: string;
}

const workshop = getCurrentWorkshop();
const currentTab = ref('all');
const workers = ref<Worker[]>([]);
const showInvite = ref(false);
const inviteCode = ref('');

const avatarColors = ['#D4845A', '#5B8DB8', '#6B9B7B', '#8B6B96', '#C8956C', '#C75B5B'];

function getAvatarColor(index: number): string {
  return avatarColors[index % avatarColors.length];
}

const qrValue = computed(() =>
  JSON.stringify({ type: 'tally_invite', code: inviteCode.value })
);

const tabs = computed(() => {
  const pendingCount = workers.value.filter(w => w.status === 'pending').length;
  return [
    { key: 'all', label: '全部', badge: 0 },
    { key: 'pending', label: '待审批', badge: pendingCount },
    { key: 'removed', label: '已移除', badge: 0 },
  ];
});

const filteredWorkers = computed(() => {
  if (currentTab.value === 'all') return workers.value;
  return workers.value.filter(w => w.status === currentTab.value);
});

function statusClass(status: string) {
  if (status === 'active') return 'status-active';
  if (status === 'pending') return 'status-pending';
  return 'status-removed';
}

function statusLabel(status: string) {
  if (status === 'active') return '已加入';
  if (status === 'pending') return '待审批';
  return '已移除';
}

function maskPhone(phone: string): string {
  if (!phone || phone.length < 7) return phone || '--';
  return phone.slice(0, 3) + '****' + phone.slice(-4);
}

function onWorkerTap(worker: Worker) {
  if (worker.status === 'pending') {
    uni.navigateTo({
      url: `/pages/admin/approve/index?memberId=${worker.id}`,
    });
  } else if (worker.status === 'active') {
    uni.showActionSheet({
      itemList: ['移除该员工'],
      itemColor: '#C75B5B',
      success: (res) => {
        if (res.tapIndex === 0) {
          removeWorker(worker);
        }
      },
    });
  }
}

function removeWorker(worker: Worker) {
  uni.showModal({
    title: '确认移除',
    content: `确定要将「${worker.name}」移出企业吗？移除后该员工将无法继续提交记录。`,
    confirmColor: '#C75B5B',
    confirmText: '移除',
    success: async (res) => {
      if (res.confirm && workshop) {
        try {
          await api.put(`/workshops/${workshop.id}/members/${worker.id}/remove`, {} as any);
          uni.showToast({ title: '已移除', icon: 'success' });
          loadWorkers();
        } catch (e) {
          console.error('移除员工失败', e);
        }
      }
    },
  });
}

function copyCode() {
  uni.setClipboardData({
    data: inviteCode.value,
    success: () => uni.showToast({ title: '已复制邀请码', icon: 'success' }),
  });
}

async function refreshCode() {
  if (!workshop || !workshop.id) return;
  try {
    const res = await api.post<any>(`/workshops/${workshop.id}/invite-code`);
    inviteCode.value = res.data?.invite_code || inviteCode.value;
    uni.showToast({ title: '邀请码已刷新', icon: 'success' });
  } catch (e) {
    console.error('刷新邀请码失败', e);
  }
}

async function loadInviteCode() {
  if (!workshop || !workshop.id) return;
  try {
    const res = await api.get<any>(`/workshops/${workshop.id}`);
    inviteCode.value = res.data?.invite_code || '';
  } catch (e) {
    console.error('获取邀请码失败', e);
  }
}

async function loadWorkers() {
  if (!workshop || !workshop.id) return;
  try {
    const res = await api.get<any>(`/workshops/${workshop.id}/members`);
    const list = res.data || [];
    workers.value = (Array.isArray(list) ? list : []).map((m: any, i: number) => ({
      id: m.id,
      name: m.display_name || m.user?.nickname || '未命名',
      phone: m.user?.phone || m.invited_phone || '',
      status: m.status === 'approved' ? 'active' : m.status === 'removed' ? 'removed' : 'pending',
      recordCount: m.record_count || 0,
      avatarColor: getAvatarColor(i),
      avatarUrl: m.user?.avatar_url || '',
    }));
  } catch (e) {
    console.error('加载员工列表失败', e);
  }
}

onMounted(() => {
  loadWorkers();
  loadInviteCode();
});
</script>

<style lang="scss" scoped>
@use '../../../static/styles/theme.scss' as *;

.workers-page {
  min-height: 100vh;
  background: $cream;
  display: flex;
  flex-direction: column;
}

.filter-bar {
  display: flex;
  gap: 8rpx;
  padding: 24rpx 28rpx 16rpx;
  background: $surface;
  border-bottom: 1rpx solid $cream-deep;
}

.filter-tab {
  display: flex;
  align-items: center;
  gap: 8rpx;
  padding: 14rpx 28rpx;
  border-radius: $radius-xl;
  background: $cream;
  transition: all 0.2s;
}

.filter-tab.active {
  background: $ink;
}

.filter-tab.active .filter-tab-text {
  color: #fff;
}

.filter-tab-text {
  font-size: 26rpx;
  font-weight: 500;
  color: $ink-muted;
}

.tab-badge {
  min-width: 36rpx;
  height: 36rpx;
  border-radius: 18rpx;
  background: $coral;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 10rpx;
}

.filter-tab.active .tab-badge {
  background: $coral;
}

.tab-badge-text {
  font-size: 20rpx;
  color: #fff;
  font-weight: 600;
}

.worker-scroll {
  flex: 1;
  padding: 16rpx 28rpx;
}

.worker-card {
  display: flex;
  align-items: center;
  gap: 24rpx;
  padding: 28rpx 24rpx;
  background: $surface;
  border-radius: $radius-md;
  margin-bottom: 16rpx;
  box-shadow: $shadow-sm;
}

.worker-avatar {
  width: 88rpx;
  height: 88rpx;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  overflow: hidden;
}

.worker-avatar-img {
  width: 88rpx;
  height: 88rpx;
}

.avatar-text {
  font-size: 34rpx;
  font-weight: 700;
  color: #fff;
}

.worker-info {
  flex: 1;
  min-width: 0;
}

.worker-name-row {
  display: flex;
  align-items: center;
  gap: 16rpx;
  margin-bottom: 8rpx;
}

.worker-name {
  font-size: 30rpx;
  font-weight: 600;
  color: $ink;
}

.status-badge {
  padding: 4rpx 16rpx;
  border-radius: $radius-sm;
  display: inline-flex;
  align-items: center;
}

.status-active {
  background: $sage-light;
}

.status-active .status-text {
  color: $sage;
}

.status-pending {
  background: $amber-surface;
}

.status-pending .status-text {
  color: $amber-deep;
}

.status-removed {
  background: $cream-deep;
}

.status-removed .status-text {
  color: $ink-faint;
}

.status-text {
  font-size: 22rpx;
  font-weight: 500;
}

.worker-meta {
  display: flex;
  align-items: center;
  gap: 12rpx;
}

.meta-item {
  font-size: 24rpx;
  color: $ink-faint;
}

.meta-divider {
  font-size: 20rpx;
  color: $cream-deep;
}

.arrow-icon {
  width: 32rpx;
  height: 32rpx;
  opacity: 0.3;
  flex-shrink: 0;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 120rpx 0;
}

.empty-icon {
  width: 128rpx;
  height: 128rpx;
  opacity: 0.2;
  margin-bottom: 24rpx;
}

.empty-text {
  font-size: 28rpx;
  color: $ink-faint;
}

.bottom-bar {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 20rpx 28rpx;
  background: $surface;
  box-shadow: 0 -4rpx 16rpx rgba(30, 30, 42, 0.06);
}

.btn-add {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12rpx;
  width: 100%;
  height: 92rpx;
  background: $ink;
  border-radius: $radius-lg;
  border: none;
}

.btn-add::after {
  display: none;
}

.btn-add-icon {
  width: 36rpx;
  height: 36rpx;
  flex-shrink: 0;
}

.btn-add-text {
  font-size: 30rpx;
  font-weight: 600;
  color: #fff;
  letter-spacing: 1rpx;
}

/* Invite Modal */
.modal-mask {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(30, 30, 42, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 999;
}

.modal-content {
  width: 600rpx;
  background: $surface;
  border-radius: $radius-lg;
  padding: 48rpx 40rpx;
  text-align: center;
  box-shadow: 0 16rpx 48rpx rgba(30, 30, 42, 0.15);
}

.modal-title {
  display: block;
  font-size: 34rpx;
  font-weight: 700;
  color: $ink;
  margin-bottom: 12rpx;
}

.modal-desc {
  display: block;
  font-size: 24rpx;
  color: $ink-faint;
  margin-bottom: 40rpx;
}

.qr-area {
  display: flex;
  justify-content: center;
  margin-bottom: 36rpx;
  padding: 24rpx;
  background: #fff;
  border-radius: $radius-md;
}

.invite-code-row {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 16rpx;
  margin-bottom: 36rpx;
  padding: 20rpx 24rpx;
  background: $cream;
  border-radius: $radius-sm;
}

.invite-code-label {
  font-size: 24rpx;
  color: $ink-faint;
}

.invite-code-value {
  font-size: 36rpx;
  font-weight: 700;
  color: $ink;
  letter-spacing: 8rpx;
}

.copy-btn {
  padding: 8rpx 24rpx;
  background: $ink;
  border-radius: $radius-sm;
}

.copy-btn-text {
  font-size: 22rpx;
  color: #fff;
  font-weight: 500;
}

.modal-actions {
  display: flex;
  gap: 16rpx;
}

.btn-refresh {
  flex: 1;
  height: 80rpx;
  line-height: 80rpx;
  font-size: 26rpx;
  font-weight: 600;
  color: $ink;
  background: $cream;
  border-radius: $radius-sm;
  border: none;
  white-space: nowrap;
  padding: 0 16rpx;

  &::after {
    border: none;
  }
}

.btn-close {
  flex: 1;
  height: 80rpx;
  line-height: 80rpx;
  font-size: 26rpx;
  font-weight: 600;
  color: #fff;
  background: $ink;
  border-radius: $radius-sm;
  border: none;
  white-space: nowrap;
  padding: 0 16rpx;

  &::after {
    border: none;
  }
}
</style>
