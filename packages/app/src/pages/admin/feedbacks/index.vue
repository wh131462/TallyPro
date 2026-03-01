<template>
  <view class="feedbacks-page">
    <NavBar title="反馈管理" :showBack="true" />

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

    <!-- Feedback List -->
    <scroll-view scroll-y class="feedback-scroll">
      <view v-if="filteredList.length === 0" class="empty-state">
        <text class="empty-text">暂无反馈</text>
      </view>

      <view class="feedback-list">
        <view
          v-for="item in filteredList"
          :key="item.id"
          class="feedback-card"
        >
          <!-- Header -->
          <view class="card-header">
            <view class="card-header-left">
              <view class="type-badge" :class="'type-' + item.type">
                <text class="type-badge-text">{{ typeLabel(item.type) }}</text>
              </view>
              <text class="card-time">{{ formatTime(item.created_at) }}</text>
            </view>
            <view class="status-badge" :class="'status-' + item.status">
              <text class="status-badge-text">{{ statusLabel(item.status) }}</text>
            </view>
          </view>

          <!-- Content -->
          <text class="card-content">{{ item.content }}</text>

          <!-- Images -->
          <view v-if="item.images && item.images.length > 0" class="card-images">
            <image
              v-for="(img, i) in item.images"
              :key="i"
              :src="getImageUrl(img)"
              class="card-image"
              mode="aspectFill"
              @tap="previewImage(item.images!, i)"
            />
          </view>

          <!-- User Info -->
          <view class="card-user">
            <text class="user-name">{{ item.user?.nickname || '匿名用户' }}</text>
            <text v-if="item.contact" class="user-contact">{{ item.contact }}</text>
          </view>

          <!-- Reply -->
          <view v-if="item.reply_content" class="reply-section">
            <text class="reply-label">管理员回复</text>
            <text class="reply-content">{{ item.reply_content }}</text>
            <text class="reply-time">{{ formatTime(item.reply_at) }}</text>
          </view>

          <!-- Actions -->
          <view v-if="item.status !== 'closed'" class="card-actions">
            <button class="btn-reply" @tap="openReplyModal(item)">
              <text class="btn-text-light">{{ item.reply_content ? '重新回复' : '回复' }}</text>
            </button>
            <button class="btn-close" @tap="closeFeedback(item)">
              <text class="btn-text-muted">关闭</text>
            </button>
          </view>
        </view>
      </view>

      <view style="height: 40rpx;"></view>
    </scroll-view>

    <!-- Reply Modal -->
    <view v-if="showModal" class="modal-mask" @tap="showModal = false">
      <view class="modal-content" @tap.stop>
        <text class="modal-title">回复反馈</text>
        <view class="modal-info">
          <text class="modal-info-text">{{ replyTarget?.content }}</text>
        </view>
        <textarea
          class="modal-textarea"
          v-model="replyContent"
          placeholder="请输入回复内容..."
          :maxlength="500"
        />
        <view class="modal-actions">
          <button class="btn-modal-cancel" @tap="showModal = false">
            <text class="btn-text-muted">取消</text>
          </button>
          <button class="btn-modal-confirm" @tap="submitReply">
            <text class="btn-text-light">发送回复</text>
          </button>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import NavBar from '../../../components/NavBar.vue';
import { request, getImageUrl } from '../../../utils/request';

interface FeedbackUser {
  id: number;
  nickname: string;
  phone: string;
  avatar_url: string;
}

interface FeedbackItem {
  id: number;
  type: 'bug' | 'feature' | 'other';
  content: string;
  contact: string;
  images: string[] | null;
  status: 'pending' | 'replied' | 'closed';
  reply_content: string | null;
  reply_at: string | null;
  created_at: string;
  user?: FeedbackUser;
}

const adminKey = uni.getStorageSync('adminKey') || '';
const adminHeader = { 'x-admin-key': adminKey };

function adminGet<T>(url: string) {
  return request<T>({ url, method: 'GET', header: adminHeader });
}

function adminPut<T>(url: string, data?: Record<string, unknown>) {
  return request<T>({ url, method: 'PUT', data, header: adminHeader });
}

const currentTab = ref('all');
const feedbacks = ref<FeedbackItem[]>([]);
const counts = ref({ all: 0, pending: 0, replied: 0, closed: 0 });
const showModal = ref(false);
const replyTarget = ref<FeedbackItem | null>(null);
const replyContent = ref('');

const tabs = computed(() => [
  { key: 'all', label: '全部', badge: 0 },
  { key: 'pending', label: '待处理', badge: counts.value.pending },
  { key: 'replied', label: '已回复', badge: 0 },
  { key: 'closed', label: '已关闭', badge: 0 },
]);

const filteredList = computed(() => {
  if (currentTab.value === 'all') return feedbacks.value;
  return feedbacks.value.filter(f => f.status === currentTab.value);
});

function typeLabel(type: string) {
  const map: Record<string, string> = { bug: '问题', feature: '建议', other: '其他' };
  return map[type] || '其他';
}

function statusLabel(status: string) {
  const map: Record<string, string> = { pending: '待处理', replied: '已回复', closed: '已关闭' };
  return map[status] || '待处理';
}

function formatTime(dateStr: string | null) {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  const m = d.getMonth() + 1;
  const day = d.getDate();
  const h = String(d.getHours()).padStart(2, '0');
  const min = String(d.getMinutes()).padStart(2, '0');
  return `${m}/${day} ${h}:${min}`;
}

function previewImage(images: string[], index: number) {
  uni.previewImage({
    urls: images.map(img => getImageUrl(img)),
    current: index,
  });
}

function openReplyModal(item: FeedbackItem) {
  replyTarget.value = item;
  replyContent.value = item.reply_content || '';
  showModal.value = true;
}

async function submitReply() {
  if (!replyTarget.value || !replyContent.value.trim()) {
    uni.showToast({ title: '请输入回复内容', icon: 'none' });
    return;
  }
  try {
    await adminPut(`/feedbacks/admin/${replyTarget.value.id}/reply`, {
      reply_content: replyContent.value.trim(),
    });
    uni.showToast({ title: '回复成功', icon: 'success' });
    showModal.value = false;
    loadData();
  } catch {
    // handled by request interceptor
  }
}

function closeFeedback(item: FeedbackItem) {
  uni.showModal({
    title: '确认关闭',
    content: '关闭后该反馈将标记为已处理，确定关闭？',
    success: async (res) => {
      if (!res.confirm) return;
      try {
        await adminPut(`/feedbacks/admin/${item.id}/close`);
        uni.showToast({ title: '已关闭', icon: 'success' });
        loadData();
      } catch {
        // handled
      }
    },
  });
}

async function loadData() {
  try {
    const [listRes, countRes] = await Promise.all([
      adminGet<FeedbackItem[]>('/feedbacks/admin'),
      adminGet<typeof counts.value>('/feedbacks/admin/counts'),
    ]);
    feedbacks.value = (listRes.data as any) || [];
    if (countRes.data) counts.value = countRes.data;
  } catch {
    // If admin key is invalid, go back
    uni.showToast({ title: '权限验证失败', icon: 'none' });
    setTimeout(() => uni.navigateBack(), 1500);
  }
}

onMounted(() => {
  if (!adminKey) {
    uni.navigateBack();
    return;
  }
  loadData();
});
</script>

<style lang="scss" scoped>
@use '../../../static/styles/theme.scss' as *;

.feedbacks-page {
  min-height: 100vh;
  background: $cream;
}

.feedback-scroll {
  height: calc(100vh - 88rpx - 100rpx);
}

// Filter Bar
.filter-bar {
  display: flex;
  gap: 12rpx;
  padding: 20rpx 28rpx;
  background: $surface;
  border-bottom: 1rpx solid $cream-deep;
}

.filter-tab {
  display: flex;
  align-items: center;
  gap: 8rpx;
  padding: 14rpx 28rpx;
  border-radius: 40rpx;
  background: $cream;
  transition: all 0.2s;

  &.active {
    background: $ink;

    .filter-tab-text {
      color: #fff;
    }
  }
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

.tab-badge-text {
  font-size: 20rpx;
  color: #fff;
  font-weight: 600;
}

// Empty
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 120rpx 0;
}

.empty-text {
  font-size: 28rpx;
  color: $ink-faint;
}

// Feedback List
.feedback-list {
  padding: 16rpx 28rpx;
}

.feedback-card {
  background: $surface;
  border-radius: $radius-md;
  padding: 28rpx;
  margin-bottom: 16rpx;
  box-shadow: $shadow-sm;
  border: 1rpx solid rgba(30, 30, 42, 0.03);
}

.card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16rpx;
}

.card-header-left {
  display: flex;
  align-items: center;
  gap: 12rpx;
}

// Type badges
.type-badge {
  padding: 4rpx 16rpx;
  border-radius: 20rpx;
}

.type-bug {
  background: $coral-light;
  .type-badge-text { color: $coral; }
}

.type-feature {
  background: $sky-light;
  .type-badge-text { color: $sky; }
}

.type-other {
  background: $plum-light;
  .type-badge-text { color: $plum; }
}

.type-badge-text {
  font-size: 22rpx;
  font-weight: 600;
  letter-spacing: 1rpx;
}

.card-time {
  font-size: 22rpx;
  color: $ink-faint;
}

// Status badges
.status-badge {
  padding: 4rpx 14rpx;
  border-radius: $radius-sm;
}

.status-pending {
  background: $amber-surface;
  .status-badge-text { color: $amber-deep; }
}

.status-replied {
  background: $sage-light;
  .status-badge-text { color: $sage; }
}

.status-closed {
  background: $cream-deep;
  .status-badge-text { color: $ink-faint; }
}

.status-badge-text {
  font-size: 22rpx;
  font-weight: 500;
}

.card-content {
  display: block;
  font-size: 28rpx;
  color: $ink;
  line-height: 1.7;
  margin-bottom: 16rpx;
}

// Images
.card-images {
  display: flex;
  gap: 12rpx;
  margin-bottom: 16rpx;
}

.card-image {
  width: 140rpx;
  height: 140rpx;
  border-radius: $radius-sm;
}

// User info
.card-user {
  display: flex;
  align-items: center;
  gap: 16rpx;
  margin-bottom: 12rpx;
}

.user-name {
  font-size: 24rpx;
  color: $ink-muted;
  font-weight: 500;
}

.user-contact {
  font-size: 22rpx;
  color: $ink-faint;
}

// Reply section
.reply-section {
  background: $cream;
  border-radius: $radius-sm;
  padding: 16rpx 20rpx;
  margin-bottom: 12rpx;
}

.reply-label {
  display: block;
  font-size: 22rpx;
  color: $sage;
  font-weight: 600;
  margin-bottom: 8rpx;
}

.reply-content {
  display: block;
  font-size: 26rpx;
  color: $ink;
  line-height: 1.6;
}

.reply-time {
  display: block;
  font-size: 20rpx;
  color: $ink-faint;
  margin-top: 8rpx;
  text-align: right;
}

// Card actions
.card-actions {
  display: flex;
  gap: 16rpx;
  margin-top: 16rpx;
  padding-top: 16rpx;
  border-top: 1rpx solid $cream;
}

.btn-reply,
.btn-close {
  flex: 1;
  height: 72rpx;
  border-radius: $radius-sm;
  display: flex;
  align-items: center;
  justify-content: center;
  border: none;
  margin: 0;
  padding: 0;

  &::after { display: none; }
}

.btn-reply { background: $ink; }
.btn-close { background: $cream; }

.btn-text-light {
  font-size: 26rpx;
  font-weight: 600;
  color: #fff;
}

.btn-text-muted {
  font-size: 26rpx;
  font-weight: 600;
  color: $ink-muted;
}

// Modal
.modal-mask {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(30, 30, 42, 0.5);
  display: flex;
  align-items: flex-end;
  z-index: 1000;
}

.modal-content {
  width: 100%;
  background: $surface;
  border-radius: $radius-lg $radius-lg 0 0;
  padding: 40rpx 32rpx;
  padding-bottom: calc(40rpx + env(safe-area-inset-bottom));
}

.modal-title {
  display: block;
  font-size: 34rpx;
  font-weight: 700;
  color: $ink;
  margin-bottom: 20rpx;
  text-align: center;
}

.modal-info {
  margin-bottom: 24rpx;
  padding: 16rpx 20rpx;
  background: $cream;
  border-radius: $radius-sm;
}

.modal-info-text {
  font-size: 26rpx;
  color: $ink-muted;
  line-height: 1.6;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.modal-textarea {
  width: 100%;
  min-height: 200rpx;
  background: $cream;
  border-radius: $radius-sm;
  padding: 24rpx;
  font-size: 28rpx;
  color: $ink;
  box-sizing: border-box;
  line-height: 1.6;
  margin-bottom: 32rpx;
}

.modal-actions {
  display: flex;
  gap: 20rpx;
}

.btn-modal-cancel,
.btn-modal-confirm {
  flex: 1;
  height: 88rpx;
  border-radius: $radius-md;
  display: flex;
  align-items: center;
  justify-content: center;
  border: none;
  margin: 0;
  padding: 0;

  &::after { display: none; }
}

.btn-modal-cancel { background: $cream; }
.btn-modal-confirm { background: $ink; }
</style>
