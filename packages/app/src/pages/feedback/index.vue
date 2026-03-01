<template>
  <view class="feedback-page">
    <NavBar title="意见反馈" :showBack="true" />

    <scroll-view scroll-y class="feedback-scroll">
      <!-- Type Selector -->
      <view class="section">
        <text class="section-label">反馈类型</text>
        <view class="type-tabs">
          <view
            v-for="t in typeOptions"
            :key="t.value"
            class="type-tab"
            :class="{ active: feedbackType === t.value }"
            @tap="feedbackType = t.value"
          >
            <text class="type-emoji">{{ t.emoji }}</text>
            <text class="type-text">{{ t.label }}</text>
          </view>
        </view>
      </view>

      <!-- Content Input -->
      <view class="section">
        <text class="section-label">详细描述</text>
        <view class="textarea-wrap">
          <textarea
            class="feedback-textarea"
            v-model="content"
            placeholder="请描述您遇到的问题或建议..."
            :maxlength="500"
            :auto-height="false"
          />
          <text class="char-count">{{ content.length }}/500</text>
        </view>
      </view>

      <!-- Image Upload -->
      <view class="section">
        <text class="section-label">截图（可选，最多3张）</text>
        <view class="image-list">
          <view
            v-for="(img, i) in images"
            :key="i"
            class="image-item"
          >
            <image :src="getImageUrl(img)" class="preview-img" mode="aspectFill" />
            <view class="image-remove" @tap="removeImage(i)">
              <text class="remove-text">&times;</text>
            </view>
          </view>
          <view v-if="images.length < 3" class="image-add" @tap="addImage">
            <text class="add-icon">+</text>
            <text class="add-text">添加图片</text>
          </view>
        </view>
      </view>

      <!-- Contact -->
      <view class="section">
        <text class="section-label">联系方式（可选）</text>
        <input
          class="contact-input"
          v-model="contact"
          placeholder="手机号或微信号，方便我们回复您"
          :maxlength="50"
        />
      </view>

      <!-- Submit -->
      <view class="submit-section">
        <button class="btn-submit" :disabled="!content.trim()" @tap="handleSubmit">提交反馈</button>
      </view>

      <!-- History -->
      <view v-if="history.length > 0" class="history-section">
        <text class="section-label">历史反馈</text>
        <view class="history-card" v-for="item in history" :key="item.id">
          <view class="history-header">
            <view class="history-type-badge" :class="'type-' + item.type">
              <text class="history-type-text">{{ typeLabel(item.type) }}</text>
            </view>
            <text class="history-time">{{ formatTime(item.created_at) }}</text>
          </view>
          <text class="history-content">{{ item.content }}</text>
          <view v-if="item.reply_content" class="history-reply">
            <text class="history-reply-label">管理员回复</text>
            <text class="history-reply-text">{{ item.reply_content }}</text>
          </view>
          <view class="history-status">
            <view class="status-dot" :class="'dot-' + item.status"></view>
            <text class="status-text">{{ statusLabel(item.status) }}</text>
          </view>
        </view>
      </view>

      <view style="height: 40rpx;"></view>
    </scroll-view>
  </view>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import NavBar from '../../components/NavBar.vue';
import { api, chooseAndUploadImage, getImageUrl } from '../../utils/request';

interface FeedbackItem {
  id: number;
  type: string;
  content: string;
  status: string;
  reply_content: string | null;
  reply_at: string | null;
  created_at: string;
}

const typeOptions = [
  { value: 'bug', label: '问题反馈', emoji: '🐛' },
  { value: 'feature', label: '功能建议', emoji: '💡' },
  { value: 'other', label: '其他', emoji: '💬' },
];

const feedbackType = ref('bug');
const content = ref('');
const contact = ref('');
const images = ref<string[]>([]);
const history = ref<FeedbackItem[]>([]);

function typeLabel(type: string): string {
  const map: Record<string, string> = { bug: '问题', feature: '建议', other: '其他' };
  return map[type] || '其他';
}

function statusLabel(status: string): string {
  const map: Record<string, string> = { pending: '待处理', replied: '已回复', closed: '已关闭' };
  return map[status] || '待处理';
}

function formatTime(dateStr: string): string {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  const m = d.getMonth() + 1;
  const day = d.getDate();
  const h = String(d.getHours()).padStart(2, '0');
  const min = String(d.getMinutes()).padStart(2, '0');
  return `${m}/${day} ${h}:${min}`;
}

async function addImage() {
  try {
    const url = await chooseAndUploadImage();
    images.value.push(url);
  } catch {
    // cancelled
  }
}

function removeImage(index: number) {
  images.value.splice(index, 1);
}

async function handleSubmit() {
  if (!content.value.trim()) {
    uni.showToast({ title: '请填写反馈内容', icon: 'none' });
    return;
  }
  try {
    await api.post('/feedbacks', {
      type: feedbackType.value,
      content: content.value.trim(),
      contact: contact.value.trim(),
      images: images.value.length > 0 ? images.value : null,
    } as any);
    uni.showToast({ title: '反馈已提交', icon: 'success' });
    content.value = '';
    contact.value = '';
    images.value = [];
    loadHistory();
  } catch {
    // Error handled in interceptor
  }
}

async function loadHistory() {
  try {
    const res = await api.get<any>('/feedbacks');
    history.value = res.data || [];
  } catch {
    // ignore
  }
}

onMounted(() => {
  loadHistory();
});
</script>

<style lang="scss" scoped>
@use '../../static/styles/theme.scss' as *;

.feedback-page {
  min-height: 100vh;
  background: $cream;
}

.feedback-scroll {
  height: calc(100vh - 88rpx);
}

.section {
  padding: 28rpx 36rpx 0;
}

.section-label {
  display: block;
  font-size: 26rpx;
  font-weight: 600;
  color: $ink-muted;
  margin-bottom: 16rpx;
  letter-spacing: 1rpx;
}

// Type Tabs
.type-tabs {
  display: flex;
  gap: 16rpx;
}

.type-tab {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8rpx;
  padding: 24rpx 0;
  background: $surface;
  border-radius: $radius-md;
  border: 3rpx solid transparent;
  box-shadow: $shadow-sm;
  transition: all 0.2s;

  &.active {
    border-color: $amber;
    background: $amber-surface;
  }
}

.type-emoji {
  font-size: 40rpx;
}

.type-text {
  font-size: 24rpx;
  font-weight: 500;
  color: $ink-muted;
  letter-spacing: 1rpx;

  .active & {
    color: $amber-deep;
    font-weight: 600;
  }
}

// Textarea
.textarea-wrap {
  background: $surface;
  border-radius: $radius-md;
  padding: 24rpx;
  box-shadow: $shadow-sm;
  position: relative;
}

.feedback-textarea {
  width: 100%;
  min-height: 240rpx;
  font-size: 28rpx;
  color: $ink;
  line-height: 1.7;
  box-sizing: border-box;
}

.char-count {
  display: block;
  text-align: right;
  font-size: 22rpx;
  color: $ink-faint;
  margin-top: 8rpx;
}

// Image Upload
.image-list {
  display: flex;
  gap: 16rpx;
  flex-wrap: wrap;
}

.image-item {
  width: 180rpx;
  height: 180rpx;
  border-radius: $radius-sm;
  overflow: hidden;
  position: relative;
}

.preview-img {
  width: 100%;
  height: 100%;
}

.image-remove {
  position: absolute;
  top: 4rpx;
  right: 4rpx;
  width: 40rpx;
  height: 40rpx;
  border-radius: 50%;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
}

.remove-text {
  color: #fff;
  font-size: 28rpx;
  line-height: 1;
}

.image-add {
  width: 180rpx;
  height: 180rpx;
  border-radius: $radius-sm;
  background: $surface;
  border: 3rpx dashed $cream-deep;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8rpx;
}

.add-icon {
  font-size: 48rpx;
  color: $ink-faint;
  font-weight: 300;
  line-height: 1;
}

.add-text {
  font-size: 22rpx;
  color: $ink-faint;
}

// Contact
.contact-input {
  width: 100%;
  height: 80rpx;
  background: $surface;
  border-radius: $radius-sm;
  padding: 0 24rpx;
  font-size: 28rpx;
  color: $ink;
  box-sizing: border-box;
  box-shadow: $shadow-sm;
}

// Submit
.submit-section {
  padding: 36rpx 36rpx 0;
}

.btn-submit {
  width: 100%;
  height: 88rpx;
  line-height: 88rpx;
  background: linear-gradient(135deg, $amber 0%, $amber-deep 100%);
  color: #fff;
  font-size: 28rpx;
  font-weight: 600;
  border-radius: $radius-sm;
  border: none;
  letter-spacing: 2rpx;
  box-shadow: 0 4rpx 24rpx rgba(200, 149, 108, 0.3);

  &[disabled] {
    opacity: 0.5;
  }

  &::after {
    border: none;
  }
}

// History
.history-section {
  padding: 36rpx 36rpx 0;
}

.history-card {
  background: $surface;
  border-radius: $radius-md;
  padding: 28rpx;
  margin-bottom: 16rpx;
  box-shadow: $shadow-sm;
  border: 1rpx solid rgba(30, 30, 42, 0.03);
}

.history-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16rpx;
}

.history-type-badge {
  padding: 4rpx 16rpx;
  border-radius: 20rpx;
  font-size: 22rpx;
  font-weight: 600;
}

.history-type-text {
  letter-spacing: 1rpx;
}

.type-bug {
  background: $coral-light;

  .history-type-text { color: $coral; }
}

.type-feature {
  background: $sky-light;

  .history-type-text { color: $sky; }
}

.type-other {
  background: $plum-light;

  .history-type-text { color: $plum; }
}

.history-time {
  font-size: 22rpx;
  color: $ink-faint;
}

.history-content {
  display: block;
  font-size: 26rpx;
  color: $ink;
  line-height: 1.7;
  margin-bottom: 16rpx;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}

.history-status {
  display: flex;
  align-items: center;
  gap: 8rpx;
}

.status-dot {
  width: 12rpx;
  height: 12rpx;
  border-radius: 50%;
}

.dot-pending { background: $amber; }
.dot-replied { background: $sage; }
.dot-closed { background: $ink-faint; }

.status-text {
  font-size: 22rpx;
  color: $ink-faint;
}

// Reply display
.history-reply {
  background: $cream;
  border-radius: $radius-sm;
  padding: 16rpx 20rpx;
  margin-bottom: 12rpx;
}

.history-reply-label {
  display: block;
  font-size: 22rpx;
  color: $sage;
  font-weight: 600;
  margin-bottom: 6rpx;
}

.history-reply-text {
  display: block;
  font-size: 26rpx;
  color: $ink;
  line-height: 1.6;
}
</style>
